// Server-only: fill Florida form HSMV 82050 (Notice of Sale and/or Bill of Sale
// for a Motor Vehicle, Mobile Home, Off-Highway Vehicle or Vessel).
// The official fillable PDF comes from FLHSMV and is cached in public.uscg_cache.
// Each output is two flattened pages: the buyer's Bill of Sale copy and the
// seller's Notice of Sale copy (to sign and file within 30 days).

import { PDFDocument, StandardFonts, rgb, type PDFForm } from 'pdf-lib'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Handoff } from '@/lib/express/content'

const FORM_URL = 'https://www.flhsmv.gov/pdf/forms/82050.pdf'
const CACHE_KEY = 'form:hsmv-82050'
let memo: Uint8Array | null = null

async function formBytes(): Promise<Uint8Array> {
  if (memo) return memo
  const { data: row } = await supabaseAdmin.from('uscg_cache').select('data,fetched_at').eq('key', CACHE_KEY).maybeSingle()
  const fresh = row && (Date.now() - new Date(row.fetched_at).getTime()) / 86400000 < 30
  if (row && fresh && (row.data as any)?.b64) {
    memo = Uint8Array.from(Buffer.from((row.data as any).b64, 'base64'))
    return memo
  }
  try {
    const res = await fetch(FORM_URL, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`FLHSMV ${res.status}`)
    const bytes = new Uint8Array(await res.arrayBuffer())
    await PDFDocument.load(bytes) // make sure it's a real PDF before caching it
    await supabaseAdmin
      .from('uscg_cache')
      .upsert({ key: CACHE_KEY, data: { b64: Buffer.from(bytes).toString('base64') }, fetched_at: new Date().toISOString() })
    memo = bytes
    return bytes
  } catch (e) {
    if ((row?.data as any)?.b64) return Uint8Array.from(Buffer.from((row!.data as any).b64, 'base64'))
    throw e
  }
}

function safe(s: unknown): string {
  return String(s ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
}

// Field names in the FLHSMV PDF are long and oddly punctuated, so match by prefix.
function setText(form: PDFForm, prefix: string, value: string | undefined) {
  if (!value) return
  const f = form.getFields().find((x) => x.getName() === prefix) || form.getFields().find((x) => x.getName().startsWith(prefix))
  if (!f) return
  try {
    form.getTextField(f.getName()).setText(safe(value))
  } catch {}
}

function check(form: PDFForm, prefix: string) {
  const f = form.getFields().find((x) => x.getName().startsWith(prefix))
  if (f) {
    try {
      form.getCheckBox(f.getName()).check()
    } catch {}
  }
}

function mdy(iso?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  return m ? `${m[2]}/${m[3]}/${m[1]}` : ''
}

export type FormItem = 'boat' | 'trailer'

type Deal = {
  buyer_name: string
  seller_name: string
  items: Record<string, any>
  price_cents: number
  progress?: { handoff?: Handoff }
}

async function fillCopy(deal: Deal, item: FormItem, copy: 'bill' | 'notice') {
  const h: Handoff = deal.progress?.handoff || {}
  const it = deal.items[item] || {}
  const desc: string = it.description || ''
  const year = (/\b(19|20)\d{2}\b/.exec(desc) || [''])[0]
  const rest = desc.replace(/\b(19|20)\d{2}\b/, '').replace(/\s+/g, ' ').trim()

  const pdf = await PDFDocument.load(await formBytes())
  const form = pdf.getForm()
  check(form, copy === 'bill' ? 'Bill of Sale' : 'Notice of Sale')
  setText(form, 'Year', year)
  setText(form, 'MakeManufacturer', rest)
  if (item === 'boat') setText(form, 'Body Type', 'VESSEL')
  if (item === 'trailer') setText(form, 'Body Type', 'TRAILER')
  if (item === 'boat' && h.titledHow === 'florida') setText(form, 'Iwe do hereby sell', h.titleNumber)
  setText(form, 'VehicleVessel Identification Number', item === 'boat' ? it.hin : it.vin)
  setText(form, 'Print Names of Purchasers', deal.buyer_name)
  setText(form, 'Address City State Zip Code', h.buyerAddress)
  setText(form, '2', mdy(h.saleDate))
  const price =
    item === 'trailer' && deal.items.boat
      ? 'Included with vessel sale'
      : (deal.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })
  setText(form, 'Odometer Disclosure Statement', price)
  setText(form, 'Sellers Printed Name', deal.seller_name)
  setText(form, 'Sellers Address City State Zip Code', h.sellerAddress)
  if (h.twoSellers && h.secondSeller) {
    setText(form, 'CoSellers Printed Name', h.secondSeller)
    setText(form, 'CoSellers Address', h.sellerAddress)
  }
  setText(form, 'Purchasers Printed Name', deal.buyer_name)

  const helv = await pdf.embedFont(StandardFonts.Helvetica)
  form.updateFieldAppearances(helv)
  form.flatten()

  // Label which copy this is, in the top margin, so the two pages aren't mixed up.
  const page = pdf.getPage(0)
  const label = copy === 'bill' ? "BUYER'S COPY - BILL OF SALE" : "SELLER'S COPY - NOTICE OF SALE: sign and file with any FL tax collector within 30 days"
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  page.drawText(label, { x: 46, y: 776, size: 8, font: bold, color: rgb(0.62, 0.42, 0.05) })
  return pdf
}

export async function buildHsmv82050(deal: Deal, item: FormItem, copies: ('bill' | 'notice')[] = ['bill', 'notice']) {
  const out = await PDFDocument.create()
  out.setTitle(`HSMV 82050 - ${item}`)
  for (const c of copies) {
    const filled = await fillCopy(deal, item, c)
    const [p] = await out.copyPages(filled, [0])
    out.addPage(p)
  }
  return out.save()
}
