// Server-only: public U.S. Coast Guard data for the HIN check.
//  - Recalls: the USCG boating recall database, searched by builder code (MIC).
//  - Vessel records: the USCG PSIX vessel service, searched by HIN. Covers
//    mainly federally documented boats; returns documentation number, status,
//    and Coast Guard cases (boardings, inspections, incident investigations).
// Results are cached in public.uscg_cache.

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Recall, VesselRecord } from '@/lib/hin'

const UA = 'Mozilla/5.0 (BoatClosers HIN check)'

async function cached<T>(key: string, ttlDays: number, load: () => Promise<T>): Promise<T> {
  const { data: row } = await supabaseAdmin.from('uscg_cache').select('data,fetched_at').eq('key', key).maybeSingle()
  if (row && (Date.now() - new Date(row.fetched_at).getTime()) / 86400000 < ttlDays) return row.data as T
  try {
    const fresh = await load()
    await supabaseAdmin.from('uscg_cache').upsert({ key, data: fresh, fetched_at: new Date().toISOString() })
    return fresh
  } catch (e) {
    console.error('USCG lookup failed:', key, e)
    if (row) return row.data as T // stale beats nothing
    throw e
  }
}

function text(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------- Recalls ----------

export function parseRecalls(html: string, mic: string): Recall[] {
  const out: Recall[] = []
  const rowRe = /<tr class="defaultFont">([\s\S]*?)<\/tr>/g
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(html))) {
    const cells = Array.from(m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g), (c) => c[1])
    const idm = /recalls-details\.php\?id=([A-Za-z0-9]+)/.exec(cells[0] || '')
    if (!idm || text(cells[1] || '').toUpperCase() !== mic) continue
    out.push({
      id: idm[1],
      model: text(cells[3] || ''),
      year: text(cells[4] || ''),
      date: text(cells[5] || ''),
    })
  }
  return out
}

export async function lookupRecalls(micInput: string): Promise<Recall[]> {
  const mic = micInput.toUpperCase()
  if (!/^[A-Z0-9]{3}$/.test(mic)) return []
  return cached(`recalls:${mic}`, 7, async () => {
    const url = `https://uscgboating.org/content/recalls.php?company=${mic}&model=&year=&button=Submit`
    const res = await fetch(url, { headers: { 'User-Agent': UA }, cache: 'no-store', signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`recalls ${res.status}`)
    return parseRecalls(await res.text(), mic)
  })
}

// ---------- PSIX vessel records ----------

const PSIX = 'https://cgmix.uscg.mil/xml/PSIXData.asmx'

// The PSIX service often answers 503 on the first tries, so retry briefly.
async function psix(op: string, body: string): Promise<string> {
  const envelope =
    `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
    `<soap:Body><${op} xmlns="https://cgmix.uscg.mil">${body}</${op}></soap:Body></soap:Envelope>`
  let last = ''
  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch(PSIX, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"https://cgmix.uscg.mil/${op}"` },
        body: envelope,
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) {
        const raw = await res.text()
        const inner = /<\w+Result>([\s\S]*?)<\/\w+Result>/.exec(raw)
        return (inner ? inner[1] : '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      }
      last = `status ${res.status}`
    } catch (e: any) {
      last = e?.message || 'fetch failed'
    }
    await new Promise((r) => setTimeout(r, 900 + i * 400))
  }
  throw new Error(`PSIX ${op}: ${last}`)
}

function records(xml: string, tag: string): Record<string, string>[] {
  return Array.from(xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g')), (m) => {
    const o: Record<string, string> = {}
    for (const f of Array.from(m[1].matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g))) o[f[1]] = f[2].trim()
    return o
  })
}

export async function lookupVessel(hinInput: string): Promise<VesselRecord[]> {
  const hin = hinInput.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (hin.length < 10 || hin.length > 14) return []
  return cached(`psix:${hin}`, 7, async () => {
    const summaryXml = await psix(
      'getVesselSummaryXMLString',
      `<VesselID></VesselID><VesselName></VesselName><CallSign></CallSign><VIN></VIN><HIN>${hin}</HIN><Flag></Flag><Service></Service><BuildYear></BuildYear>`
    )
    const summaries = records(summaryXml, 'VesselSummary')
      .filter((s) => (s.ManufacturerHullNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '') === hin)
      .slice(0, 4)

    const out: VesselRecord[] = []
    for (const s of summaries) {
      let cases: VesselRecord['cases'] = []
      try {
        const casesXml = await psix(
          'getVesselCasesXMLString',
          `<VesselID>${s.VesselId}</VesselID><MaxSearchDate></MaxSearchDate><MinSearchDate></MinSearchDate>`
        )
        cases = records(casesXml, 'VesselCases')
          .map((c) => ({
            date: (c.StartDtTm || '').slice(0, 10),
            type: c.TypeLookupName || 'Case',
            result: c.ProcessStatusSubTypeLookupName || c.ProcessStatusTypeLookupName || '',
            port: c.USCGZonePort || '',
          }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 25)
      } catch (e) {
        console.error('PSIX cases failed', s.VesselId, e)
      }
      const id = s.Identification || ''
      out.push({
        name: s.VesselName || '',
        number: id,
        numberType: /^\d+$/.test(id) ? 'Coast Guard official number' : 'Registration number',
        service: s.ServiceType || '',
        status: s.StatusLookupName || '',
        built: s.ConstructionCompletedYear && s.ConstructionCompletedYear !== '0' ? s.ConstructionCompletedYear : '',
        country: s.CountryLookupName || '',
        cases,
      })
    }
    return out
  })
}
