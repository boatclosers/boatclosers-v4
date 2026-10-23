// Server-only: pre-fill Florida form HSMV 82040 VS (Application for Certificate
// of Vessel Title) from the buyer's deal. The form stays fillable so the buyer
// can finish it on screen or by hand. We deliberately leave out anything we
// don't collect or shouldn't store: driver license number, date of birth, sex,
// vessel type, county of residence, and every signature and certification box.

import { PDFDocument, StandardFonts, rgb, type PDFForm } from 'pdf-lib'
import type { Handoff } from '@/lib/express/content'
import { officialForm, safe } from '@/lib/express/hsmv82050'

const FORM_URL = 'https://www.flhsmv.gov/pdf/forms/82040-vs.pdf'
const CACHE_KEY = 'form:hsmv-82040-vs'

type Deal = {
  buyer_name: string
  buyer_email: string
  seller_name: string
  items: Record<string, any>
  price_cents: number
  progress?: { handoff?: Handoff }
}

function field(form: PDFForm, name: string) {
  const all = form.getFields()
  return all.find((f) => f.getName() === name) || all.find((f) => f.getName().startsWith(name))
}

function setText(form: PDFForm, name: string, value: string | undefined) {
  if (!value) return
  const f = field(form, name)
  if (!f) return
  try {
    const t = form.getTextField(f.getName())
    const max = t.getMaxLength()
    t.setText(max ? safe(value).slice(0, max) : safe(value))
  } catch {}
}

function check(form: PDFForm, name: string) {
  const f = field(form, name)
  if (!f) return
  try {
    form.getCheckBox(f.getName()).check()
  } catch {}
}

// "123 Main St, Tampa, FL 33602" -> parts. Anything else goes in whole.
export function splitAddress(a: string | undefined) {
  const m = /^(.+?),\s*([^,]+?),?\s+([A-Za-z]{2})\.?\s+(\d{5}(?:-\d{4})?)$/.exec((a || '').trim())
  if (!m) return { street: a || '' }
  return { street: m[1], city: m[2], state: m[3].toUpperCase(), zip: m[4] }
}

// "17", "17.5", "17'6", "17 ft 6 in" -> feet and inches.
export function splitLength(v: string | undefined): { ft: string; inch: string } {
  const s = (v || '').trim()
  const fi = /^(\d+)\s*(?:'|ft|feet)?\s*(\d+)?\s*(?:"|in)?$/i.exec(s)
  if (fi && fi[2]) return { ft: fi[1], inch: String(Math.min(11, Number(fi[2]))) }
  const n = Number(s.replace(/[^0-9.]/g, ''))
  if (!n) return { ft: '', inch: '' }
  const ft = Math.floor(n)
  const inch = Math.round((n - ft) * 12)
  return inch === 12 ? { ft: String(ft + 1), inch: '0' } : { ft: String(ft), inch: inch ? String(inch) : '0' }
}

const HULL_BOX: Record<string, string> = {
  Fiberglass: 'Fiberglass',
  Aluminum: 'Aluminum',
  Wood: 'Wood',
  Steel: 'Steel',
  Inflatable: 'RubberVinylCanvas',
  Other: 'Other_2',
}
const PROPULSION_BOX: Record<string, string[]> = {
  Outboard: ['Propeller', 'Outboard'],
  Inboard: ['Propeller', 'Inboard'],
  'Inboard/outboard (sterndrive)': ['Propeller', 'Sterndrive'],
  Jet: ['Water Jet'],
  Sail: ['Sail'],
  Electric: ['Propeller'],
  'None (manual)': ['Manual'],
}
const FUEL_BOX: Record<string, string> = { Gas: 'Gas', Diesel: 'Diesel', Electric: 'Electric' }

export async function buildHsmv82040vs(deal: Deal, opts: { flatten?: boolean } = {}): Promise<Uint8Array> {
  const h: Handoff = deal.progress?.handoff || {}
  const boat = deal.items.boat || {}
  const desc: string = boat.description || ''
  const year = (/\b(19|20)\d{2}\b/.exec(desc) || [''])[0]
  const make = desc.replace(/\b(19|20)\d{2}\b/, '').replace(/\s+/g, ' ').trim()

  const pdf = await PDFDocument.load(await officialForm(FORM_URL, CACHE_KEY))
  const form = pdf.getForm()

  // Section 1: owner
  setText(form, 'Owners Name as It Appears on Driver License', deal.buyer_name)
  setText(form, 'Owners Email Voluntary', deal.buyer_email)
  const addr = splitAddress(h.buyerAddress)
  setText(form, 'Owner’s Mailing Address', addr.street)
  setText(form, 'Owner’s City', addr.city)
  setText(form, 'Owner’s State', addr.state)
  setText(form, 'Owner’s Zip Code', addr.zip)

  // Section 2: the vessel
  setText(form, 'Hull (Vessel) Identification Number (HIN)', boat.hin)
  if (h.titledHow === 'florida') {
    setText(form, 'Florida Title Number', h.titleNumber)
    setText(form, 'FL/DO Number', h.registrationNumber)
  }
  setText(form, 'State of Principal Use', 'FL')
  setText(form, 'Make/Manufacturer', make)
  setText(form, 'Year', year)
  const len = splitLength(h.lengthFt)
  setText(form, 'Length in Feet', len.ft)
  setText(form, 'Length in Inches', len.inch)
  if (h.hull && HULL_BOX[h.hull]) check(form, HULL_BOX[h.hull])
  for (const b of PROPULSION_BOX[h.propulsion || ''] || []) check(form, b)
  if (h.fuel && FUEL_BOX[h.fuel]) check(form, FUEL_BOX[h.fuel])
  check(form, 'Recreational Pleasure')

  // Section 7: transfer type
  check(form, 'Sale')
  const dollars = Math.floor(deal.price_cents / 100)
  setText(form, 'Sale Price Dollars', dollars.toLocaleString('en-US'))
  setText(form, 'Sale Price Cents', String(deal.price_cents % 100).padStart(2, '0'))
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(h.saleDate || '')
  if (m) {
    setText(form, 'Date Acquired MM', m[2])
    setText(form, 'Date Acquired DD', m[3])
    setText(form, 'Date Acquired YYYY', m[1])
  }

  // Applicant's printed name beside the signature line (the buyer signs it).
  setText(form, 'Full Name of Applicant Owner', deal.buyer_name)

  const helv = await pdf.embedFont(StandardFonts.Helvetica)
  form.updateFieldAppearances(helv)
  // In the merged closing packet the form can't stay fillable, so print it as is.
  if (opts.flatten) form.flatten()

  const page = pdf.getPage(0)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const { height } = page.getSize()
  page.drawText(
    'Pre-filled by BoatClosers Express. Check every entry, then add your driver license number, date of birth, vessel type, and county, and sign.',
    { x: 14, y: height - 10, size: 6.5, font: bold, color: rgb(0.62, 0.42, 0.05) }
  )
  pdf.setTitle('HSMV 82040 VS - Application for Certificate of Vessel Title')
  return pdf.save()
}
