// Server-only: look up a boat builder by its USCG Manufacturer Identification
// Code (the first 3 characters of a HIN), using the Coast Guard's public MIC
// database at uscgboating.org. Results are cached in public.hin_builders so each
// builder is fetched at most once a month.

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Builder } from '@/lib/hin'


const BASE = 'https://uscgboating.org/content/'
const FOUND_TTL_DAYS = 30
const MISSING_TTL_DAYS = 7

function clean(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .trim()
}

// Exact-MIC rows from the search results page. The search also matches company
// names, so only rows whose code equals the MIC count.
export function parseSearch(html: string, mic: string): { id: string; city: string; state: string }[] {
  const rows: { id: string; city: string; state: string }[] = []
  const rowRe = /<tr class="defaultFont">([\s\S]*?)<\/tr>/g
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(html))) {
    const cells = Array.from(m[1].matchAll(/<td>([\s\S]*?)<\/td>/g), (c) => c[1])
    const link = /detail\.php\?id=(\d+)[^>]*>\s*([^<]+?)\s*<\/a>/.exec(cells[0] || '')
    if (link && link[2].toUpperCase() === mic) {
      rows.push({ id: link[1], city: clean(cells[3] || ''), state: clean(cells[4] || '') })
    }
  }
  return rows
}

// "Label:" -> value pairs from a builder's detail page.
export function parseDetail(html: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /<strong>\s*([^<:]+?):?\s*<\/strong>\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) out[m[1].trim()] = clean(m[2])
  return out
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\b(Llc|Inc|Usa)\b/g, (w) => w.toUpperCase())
}

function toBuilder(mic: string, d: Record<string, string>, row: { city: string; state: string }): Builder {
  const past = ['Past Company 1', 'Past Company 2', 'Past Company 3'].map((k) => d[k]).filter(Boolean)
  return {
    mic,
    company: d['Company'] || '',
    dba: d['DBA'] || null,
    pastNames: past,
    city: d['City'] ? titleCase(d['City']) : row.city ? titleCase(row.city) : null,
    state: d['State'] || row.state || null,
    inBusiness: d['In Business'] || null,
    outOfBusiness: d['Out of Business'] || null,
    types: (d['Type'] || '')
      .split(/\n|,/)
      .map((t) => t.trim())
      .filter((t) => t && t.toLowerCase() !== 'miscellaneous'),
  }
}

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: { 'User-Agent': 'Mozilla/5.0 (BoatClosers HIN check)', ...(init?.headers || {}) },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`USCG ${res.status}`)
  return res.text()
}

export async function lookupBuilder(micInput: string): Promise<Builder | null> {
  const mic = micInput.toUpperCase()
  if (!/^[A-Z0-9]{3}$/.test(mic)) return null

  const { data: cached } = await supabaseAdmin.from('hin_builders').select('found,data,fetched_at').eq('mic', mic).maybeSingle()
  if (cached) {
    const ageDays = (Date.now() - new Date(cached.fetched_at).getTime()) / 86400000
    if (ageDays < (cached.found ? FOUND_TTL_DAYS : MISSING_TTL_DAYS)) {
      return cached.found ? (cached.data as Builder) : null
    }
  }

  try {
    const search = await fetchText(BASE + 'manufacturers-identification-result.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ company: mic, state: '', button: 'Submit' }).toString(),
    })
    const rows = parseSearch(search, mic)
    let builder: Builder | null = null
    if (rows.length) {
      const detail = await fetchText(BASE + `manufacturers-identification-detail.php?id=${rows[0].id}`)
      builder = toBuilder(mic, parseDetail(detail), rows[0])
      if (!builder.company) builder = null
    }
    await supabaseAdmin
      .from('hin_builders')
      .upsert({ mic, found: !!builder, data: builder, fetched_at: new Date().toISOString() })
    return builder
  } catch (e) {
    console.error('MIC lookup failed:', mic, e)
    // Fall back to a stale cached answer rather than nothing.
    return cached?.found ? (cached.data as Builder) : null
  }
}
