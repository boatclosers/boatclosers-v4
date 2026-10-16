// Server-only: BC Express PDF documents, built from the buyer's deal.
// Wording here is legal paperwork. Keep it reviewed by a licensed Florida
// broker before changing it.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { type Handoff, whatToBring, salesTaxEstimate, addDays, type ItemKey } from '@/lib/express/content'
import { buildHsmv82050 } from '@/lib/express/hsmv82050'
import { buildHsmv82040vs } from '@/lib/express/hsmv82040vs'
import { inspectionFor, INSPECTION_SECTIONS } from '@/lib/express/inspection'
import type { InspectionProgress } from '@/lib/express/content'

export type DocKey =
  | 'vessel-bill-of-sale'
  | 'motor-bill-of-sale'
  | 'trailer-bill-of-sale'
  | 'hsmv-82050-boat'
  | 'hsmv-82050-trailer'
  | 'payment-receipt'
  | 'closing-summary'
  | 'title-worksheet'
  | 'hsmv-82040-vs'
  | 'condition-report'

export const DOC_TITLES: Record<DocKey, string> = {
  'vessel-bill-of-sale': 'Vessel Bill of Sale',
  'motor-bill-of-sale': 'Outboard Motor Bill of Sale',
  'trailer-bill-of-sale': 'Trailer Bill of Sale',
  'hsmv-82050-boat': 'Florida form HSMV 82050 (boat)',
  'hsmv-82050-trailer': 'Florida form HSMV 82050 (trailer)',
  'payment-receipt': 'Payment Receipt',
  'closing-summary': 'Closing Summary',
  'title-worksheet': 'Title & Registration Worksheet',
  'hsmv-82040-vs': 'Florida title application, HSMV 82040 VS (pre-filled)',
  'condition-report': 'Condition Report (your inspection)',
}

// Papers the seller can open from their own link.
export const SELLER_DOCS: DocKey[] = ['vessel-bill-of-sale', 'motor-bill-of-sale', 'trailer-bill-of-sale', 'hsmv-82050-boat', 'hsmv-82050-trailer', 'payment-receipt']

export function docsFor(items: Record<string, any>, h: Handoff = {}): DocKey[] {
  const out: DocKey[] = ['condition-report']
  if (items.boat) out.push('vessel-bill-of-sale')
  if (items.motor && !items.boat) out.push('motor-bill-of-sale')
  if (items.trailer) out.push('trailer-bill-of-sale')
  if (items.boat) out.push('hsmv-82050-boat')
  if (items.trailer) out.push('hsmv-82050-trailer')
  out.push('payment-receipt', 'closing-summary', 'title-worksheet')
  if (items.boat && h.titledHow !== 'documented') out.push('hsmv-82040-vs')
  return out
}

// pdf-lib's standard fonts only encode WinAnsi; map or drop anything else.
function safe(s: unknown): string {
  return String(s ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
}

function money(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function longDate(iso: string | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return ''
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const NAVY = rgb(0.06, 0.106, 0.176)
const GOLD = rgb(0.79, 0.59, 0.18)
const GREY = rgb(0.38, 0.38, 0.42)

class Writer {
  pdf!: PDFDocument
  page!: PDFPage
  font!: PDFFont
  bold!: PDFFont
  y = 0
  readonly W = 612
  readonly H = 792
  readonly M = 48

  static async create(title: string, subtitle?: string) {
    const w = new Writer()
    w.pdf = await PDFDocument.create()
    w.pdf.setTitle(title)
    w.pdf.setProducer('BC Express by BoatClosers')
    w.font = await w.pdf.embedFont(StandardFonts.Helvetica)
    w.bold = await w.pdf.embedFont(StandardFonts.HelveticaBold)
    w.newPage()
    w.page.drawText('BOATCLOSERS', { x: w.M, y: w.y, size: 10, font: w.bold, color: GOLD })
    w.page.drawText('BC EXPRESS', { x: w.W - w.M - w.bold.widthOfTextAtSize('BC EXPRESS', 10), y: w.y, size: 10, font: w.bold, color: GOLD })
    w.y -= 26
    w.page.drawText(safe(title), { x: w.M, y: w.y, size: 19, font: w.bold, color: NAVY })
    w.y -= 16
    if (subtitle) {
      w.text(subtitle, { size: 10, color: GREY })
    }
    w.rule()
    return w
  }

  newPage() {
    this.page = this.pdf.addPage([this.W, this.H])
    this.y = this.H - this.M
  }

  need(h: number) {
    if (this.y - h < 46) this.newPage()
  }

  rule() {
    this.y -= 3
    this.page.drawLine({ start: { x: this.M, y: this.y }, end: { x: this.W - this.M, y: this.y }, thickness: 0.75, color: GOLD })
    this.y -= 10
  }

  wrap(t: string, font: PDFFont, size: number, width: number): string[] {
    const lines: string[] = []
    for (const para of safe(t).split('\n')) {
      let cur = ''
      for (const word of para.split(/\s+/)) {
        const test = cur ? `${cur} ${word}` : word
        if (font.widthOfTextAtSize(test, size) > width && cur) {
          lines.push(cur)
          cur = word
        } else cur = test
      }
      lines.push(cur)
    }
    return lines
  }

  text(t: string, o: { size?: number; bold?: boolean; color?: any; indent?: number; gap?: number } = {}) {
    const size = o.size ?? 9.5
    const font = o.bold ? this.bold : this.font
    const x = this.M + (o.indent ?? 0)
    const lines = this.wrap(t, font, size, this.W - this.M - x)
    for (const ln of lines) {
      this.need(size + 4)
      this.page.drawText(ln, { x, y: this.y, size, font, color: o.color ?? NAVY })
      this.y -= size + 3
    }
    this.y -= o.gap ?? 3
  }

  heading(t: string) {
    this.need(30)
    this.y -= 4
    this.page.drawText(safe(t).toUpperCase(), { x: this.M, y: this.y, size: 9, font: this.bold, color: GOLD })
    this.y -= 13
  }

  field(label: string, value: string) {
    const size = 9.5
    const lw = 150
    const lines = this.wrap(value || '________________________', this.font, size, this.W - this.M * 2 - lw)
    this.need(lines.length * (size + 3) + 2)
    this.page.drawText(safe(label), { x: this.M, y: this.y, size: 8.5, font: this.bold, color: GREY })
    for (const ln of lines) {
      this.page.drawText(ln, { x: this.M + lw, y: this.y, size, font: this.font, color: NAVY })
      this.y -= size + 3
    }
    this.y -= 1.5
  }

  bullet(t: string, mark = '-') {
    const size = 10.5
    const lines = this.wrap(t, this.font, size, this.W - this.M * 2 - 16)
    lines.forEach((ln, i) => {
      this.need(size + 4)
      if (i === 0) this.page.drawText(mark, { x: this.M + 2, y: this.y, size, font: this.bold, color: GOLD })
      this.page.drawText(ln, { x: this.M + 16, y: this.y, size, font: this.font, color: NAVY })
      this.y -= size + 4
    })
    this.y -= 2
  }

  signature(role: string, printed: string) {
    this.need(56)
    this.y -= 22
    const half = (this.W - this.M * 2 - 30) / 2
    this.page.drawLine({ start: { x: this.M, y: this.y }, end: { x: this.M + half, y: this.y }, thickness: 0.6, color: NAVY })
    this.page.drawLine({ start: { x: this.M + half + 30, y: this.y }, end: { x: this.W - this.M, y: this.y }, thickness: 0.6, color: NAVY })
    this.y -= 12
    this.page.drawText(`${safe(role)} signature`, { x: this.M, y: this.y, size: 8.5, font: this.font, color: GREY })
    this.page.drawText('Date', { x: this.M + half + 30, y: this.y, size: 8.5, font: this.font, color: GREY })
    this.y -= 12
    this.page.drawText(`Printed name: ${safe(printed)}`, { x: this.M, y: this.y, size: 9.5, font: this.font, color: NAVY })
    this.y -= 8
  }

  // Two side-by-side blocks, each a heading and a few lines.
  twoColumns(left: [string, string[]], right: [string, string[]]) {
    const colW = (this.W - this.M * 2 - 24) / 2
    const size = 9.5
    const wrapCol = (lines: string[]) => lines.flatMap((l) => this.wrap(l, this.font, size, colW))
    const L = wrapCol(left[1])
    const R = wrapCol(right[1])
    const rows = Math.max(L.length, R.length)
    this.need(rows * (size + 3) + 20)
    this.y -= 4
    const top = this.y
    ;[
      [this.M, left[0], L],
      [this.M + colW + 24, right[0], R],
    ].forEach(([x, title, lines]: any) => {
      let y = top
      this.page.drawText(safe(title).toUpperCase(), { x, y, size: 9, font: this.bold, color: GOLD })
      y -= 13
      for (const ln of lines) {
        this.page.drawText(ln, { x, y, size, font: this.font, color: NAVY })
        y -= size + 3
      }
    })
    this.y = top - 13 - rows * (size + 3) - 2
  }

  // Signatures in two columns (sellers left, buyer right) so the block stays
  // on the same page as the terms.
  signatures(sellers: string[], buyer: string) {
    const rows = Math.max(sellers.length, 1)
    this.need(rows * 42 + 26)
    this.heading('Signatures')
    const colW = (this.W - this.M * 2 - 24) / 2
    for (let r = 0; r < rows; r++) {
      this.y -= 20
      const cols: [number, string, string][] = []
      if (sellers[r]) cols.push([this.M, r ? 'Second seller' : 'Seller', sellers[r]])
      if (r === 0) cols.push([this.M + colW + 24, 'Buyer', buyer])
      for (const [x, role, name] of cols) {
        this.page.drawLine({ start: { x, y: this.y }, end: { x: x + colW * 0.68, y: this.y }, thickness: 0.6, color: NAVY })
        this.page.drawLine({ start: { x: x + colW * 0.72, y: this.y }, end: { x: x + colW, y: this.y }, thickness: 0.6, color: NAVY })
        this.page.drawText(`${role} signature`, { x, y: this.y - 10, size: 7.5, font: this.font, color: GREY })
        this.page.drawText('Date', { x: x + colW * 0.72, y: this.y - 10, size: 7.5, font: this.font, color: GREY })
        this.page.drawText(safe(name), { x, y: this.y - 21, size: 9, font: this.font, color: NAVY })
      }
      this.y -= 22
    }
    this.y -= 4
  }

  async finish(footer: string) {
    const pages = this.pdf.getPages()
    pages.forEach((p, i) => {
      const t = safe(`${footer}   Page ${i + 1} of ${pages.length}`)
      p.drawText(t, { x: this.M, y: 26, size: 7, font: this.font, color: GREY })
    })
    return this.pdf.save()
  }
}

type Deal = {
  buyer_name: string
  buyer_email: string
  seller_name: string
  items: Record<string, any>
  price_cents: number
  paid_at?: string
  progress?: { handoff?: Handoff; inspection?: InspectionProgress }
}

const FOOTER = 'Prepared with BC Express by BoatClosers (boatclosers.com). BoatClosers is not a party to this sale and does not give legal advice.'

function sellerList(d: Deal, h: Handoff): string[] {
  return h.twoSellers && h.secondSeller ? [d.seller_name, h.secondSeller] : [d.seller_name]
}

function sellers(d: Deal, h: Handoff): string {
  return h.twoSellers && h.secondSeller ? `${d.seller_name} and ${h.secondSeller}` : d.seller_name
}

function parties(w: Writer, d: Deal, h: Handoff) {
  w.twoColumns(
    ['Seller', [sellers(d, h), h.sellerAddress || '________________________']],
    ['Buyer', [d.buyer_name, h.buyerAddress || '________________________']]
  )
}

function saleTerms(w: Writer, d: Deal, h: Handoff) {
  w.heading('Sale')
  w.field('Date of sale', longDate(h.saleDate))
  w.field('Place of sale', h.county ? `${h.county} County, Florida` : 'Florida')
  w.field('Purchase price', `${money(d.price_cents)} (U.S. dollars)`)
  w.field('Paid by', h.paymentMethod || '')
}

function standardTerms(w: Writer, what: string) {
  w.heading('Terms')
  w.text(
    `1. Transfer. For the purchase price above, the receipt of which Seller acknowledges, Seller sells and transfers to Buyer all of Seller's right, title, and interest in the ${what} described above.`
  )
  w.text(
    `2. Ownership and liens. Seller states that Seller is the lawful owner of the ${what}, has the full right to sell it, and that it is free of all liens, mortgages, security interests, and claims of any kind, including any marina, storage, or repair charges. Seller will defend Buyer's title against any such claim arising from before the date of sale, and will deliver to Buyer at the time of sale the properly signed certificate of title or other proof of ownership, and any lien release.`
  )
  w.text(
    `3. AS IS. THE ${what.toUpperCase()} IS SOLD "AS IS, WHERE IS," WITH ALL FAULTS. SELLER MAKES NO WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, AS TO ITS CONDITION, INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Buyer has had the opportunity to inspect the ${what} and is relying only on that inspection, not on any statement by Seller.`,
    { bold: false }
  )
}

async function vesselBillOfSale(d: Deal, h: Handoff) {
  const boat = d.items.boat || {}
  const motor = d.items.motor
  const w = await Writer.create('Vessel Bill of Sale', 'State of Florida. Temporary certificate of number under section 328.46, Florida Statutes.')
  parties(w, d, h)
  w.heading('Vessel')
  w.field('Year, make, and model', boat.description || '')
  w.field('Hull ID number (HIN)', boat.hin || '')
  w.field('Length', h.lengthFt ? `${h.lengthFt} feet` : '')
  w.field('Propulsion', h.propulsion || '')
  if (h.hull || h.fuel) w.field('Hull / fuel', [h.hull, h.fuel].filter(Boolean).join(' / '))
  const nums = [h.titledHow === 'florida' && h.titleNumber ? `Title ${h.titleNumber}` : '', h.registrationNumber ? `Registration ${h.registrationNumber}` : '']
    .filter(Boolean)
    .join('  /  ')
  if (nums) w.field('Florida numbers', nums)
  if (h.titledHow === 'documented') w.field('USCG official number', h.officialNumber || '')
  if (motor) w.field('Motor included', `${motor.description || ''}${motor.serial ? `, serial ${motor.serial}` : ''}`)
  w.field('Also included', h.inventory || 'Nothing else listed')
  w.field('State of principal use', 'Florida')
  saleTerms(w, d, h)
  standardTerms(w, 'vessel')
  w.heading('Temporary certificate of number')
  w.text(
    'This bill of sale serves as the temporary certificate of number for the vessel and must be kept aboard and available for inspection. THIS TEMPORARY AUTHORITY IS INVALID AFTER 30 DAYS FOLLOWING THE DATE OF SALE OF THE VESSEL.',
    { bold: true }
  )
  w.signatures(sellerList(d, h), d.buyer_name)
  if (h.titledHow === 'other-no-title') notary(w, d, h)
  return w.finish(FOOTER)
}

async function motorBillOfSale(d: Deal, h: Handoff) {
  const motor = d.items.motor || {}
  const w = await Writer.create('Outboard Motor Bill of Sale', 'State of Florida')
  parties(w, d, h)
  w.heading('Motor')
  w.field('Make, horsepower, and year', motor.description || '')
  w.field('Serial number', motor.serial || '')
  w.field('Also included', h.inventory || 'Nothing else listed')
  saleTerms(w, d, h)
  standardTerms(w, 'motor')
  w.signatures(sellerList(d, h), d.buyer_name)
  return w.finish(FOOTER)
}

async function trailerBillOfSale(d: Deal, h: Handoff) {
  const t = d.items.trailer || {}
  const w = await Writer.create('Trailer Bill of Sale', 'State of Florida')
  parties(w, d, h)
  w.heading('Trailer')
  w.field('Year and make', t.description || '')
  w.field('VIN', t.vin || '')
  w.heading('Sale')
  w.field('Date of sale', longDate(h.saleDate))
  w.field('Place of sale', h.county ? `${h.county} County, Florida` : 'Florida')
  w.text(
    d.items.boat
      ? `Sold together with the vessel described in the accompanying Vessel Bill of Sale, for the total purchase price of ${money(d.price_cents)} shown there.`
      : `Purchase price: ${money(d.price_cents)} (U.S. dollars), paid by ${h.paymentMethod || '________'}.`
  )
  standardTerms(w, 'trailer')
  w.signatures(sellerList(d, h), d.buyer_name)
  return w.finish(FOOTER)
}

function notary(w: Writer, d: Deal, h: Handoff) {
  w.need(190)
  w.heading('Notary acknowledgment')
  w.text(
    `For the Vessel Bill of Sale dated ${longDate(h.saleDate) || '______________'} between ${sellers(d, h)} (Seller) and ${d.buyer_name} (Buyer), HIN ${d.items.boat?.hin || '______________'}.`,
    { color: GREY }
  )
  w.text('State of Florida, County of ______________________')
  w.text(
    'Sworn to (or affirmed) and subscribed before me by means of [ ] physical presence or [ ] online notarization, this ____ day of ______________, 20____, by ______________________________, who is [ ] personally known to me or [ ] produced ______________________ as identification.'
  )
  w.signature('Notary public', '______________________  (seal)')
}

function itemLines(d: Deal): string[] {
  const out: string[] = []
  if (d.items.boat) out.push(`Boat: ${d.items.boat.description}${d.items.boat.hin ? `, HIN ${d.items.boat.hin}` : ''}`)
  if (d.items.motor) out.push(`Motor: ${d.items.motor.description}${d.items.motor.serial ? `, serial ${d.items.motor.serial}` : ''}`)
  if (d.items.trailer) out.push(`Trailer: ${d.items.trailer.description}${d.items.trailer.vin ? `, VIN ${d.items.trailer.vin}` : ''}`)
  return out
}

async function paymentReceipt(d: Deal, h: Handoff) {
  const w = await Writer.create('Payment Receipt')
  w.text(
    `${sellers(d, h)} ("Seller") acknowledges receiving ${money(d.price_cents)} from ${d.buyer_name} ("Buyer") on ${longDate(h.saleDate) || '______________'}, paid by ${h.paymentMethod || '______________'}, as payment in full for:`,
    { gap: 8 }
  )
  for (const l of itemLines(d)) w.bullet(l)
  if (h.inventory) w.bullet(`Also included: ${h.inventory}`)
  w.text('Seller confirms that nothing further is owed by Buyer for this sale.', { gap: 8 })
  w.signatures(sellerList(d, h), d.buyer_name)
  return w.finish(FOOTER)
}

function has(d: Deal): Record<ItemKey, boolean> {
  return { boat: !!d.items.boat, trailer: !!d.items.trailer, motor: !!d.items.motor }
}

async function closingSummary(d: Deal, h: Handoff) {
  const w = await Writer.create('Closing Summary', `Private sale, ${longDate(h.saleDate)}${h.county ? `, ${h.county} County, Florida` : ''}`)
  w.heading('Parties')
  w.field('Seller', sellers(d, h))
  w.field('Buyer', d.buyer_name)
  w.heading('Purchased')
  for (const l of itemLines(d)) w.bullet(l)
  if (h.inventory) w.bullet(`Also included: ${h.inventory}`)
  w.heading('Money')
  w.field('Purchase price', money(d.price_cents))
  w.field('Paid by', h.paymentMethod || '')
  const tax = salesTaxEstimate(d.price_cents)
  w.field('Estimated FL sales tax', `about ${money(Math.round(tax.state * 100))} (6%), plus county surtax of up to ${money(Math.round(tax.surtaxMax * 100))}`)
  w.heading('Papers from this sale')
  for (const k of docsFor(d.items, h).filter((k) => k !== 'closing-summary')) w.bullet(DOC_TITLES[k])
  if (h.titledHow === 'florida') w.bullet('Original Florida certificate of title, signed by Seller')
  if (h.titledHow === 'documented') w.bullet('Coast Guard bill of sale (CG-1340) and Certificate of Documentation')
  if (h.lien === 'released') w.bullet('Original lien release')
  w.heading('Deadlines')
  const due = h.saleDate ? addDays(h.saleDate, 30) : null
  w.field('Title and register by', due ? due.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '30 days after the sale')
  w.text('Seller: complete the notice of sale on the title or form HSMV 82050 within 30 days.', { color: GREY })
  return w.finish(FOOTER)
}

async function titleWorksheet(d: Deal, h: Handoff) {
  const w = await Writer.create(
    'Title & Registration Worksheet',
    'Your title application (HSMV 82040 VS) is pre-filled with these values. Use this sheet to double-check it, and bring it with you.'
  )
  const boat = d.items.boat
  if (boat && h.titledHow !== 'documented') {
    w.heading('For form HSMV 82040 VS')
    w.field('Owner / applicant', d.buyer_name)
    w.field('Owner address', h.buyerAddress || '')
    w.field('Email', d.buyer_email)
    w.field('Make and model', (boat.description || '').replace(/\b(19|20)\d{2}\b/, '').replace(/\s+/g, ' ').trim())
    w.field('Year', (/\b(19|20)\d{2}\b/.exec(boat.description || '') || [''])[0])
    w.field('Hull ID number (HIN)', boat.hin || '')
    w.field('Length', h.lengthFt ? `${h.lengthFt} ft` : '')
    w.field('Hull material', h.hull || '')
    w.field('Propulsion', h.propulsion || '')
    w.field('Fuel', h.fuel || '')
    w.field('Primary use', 'Pleasure')
    if (h.titleNumber) w.field('Previous title number', h.titleNumber)
    if (h.registrationNumber) w.field('Previous registration number', h.registrationNumber)
    w.field('Previous state', h.titledHow === 'florida' ? 'Florida' : h.titledHow ? 'See out-of-state title or registration' : '')
    w.field('Purchased from', sellers(d, h))
    w.field('Date of purchase', longDate(h.saleDate))
    w.field('Purchase price', money(d.price_cents))
    w.field('Lienholder', 'None (no new loan)  -  if you financed, enter your lender here')
    w.text('Sign the application yourself; every buyer must sign or be present.', { color: GREY })
  }
  if (h.titledHow === 'documented') {
    w.heading('Coast Guard documented vessel')
    w.text(
      'Ownership transfers through the U.S. Coast Guard National Vessel Documentation Center (dco.uscg.mil/nvdc), using the signed CG-1340 bill of sale. Florida does not title documented vessels, but you must still register the boat with your county tax collector.'
    )
  }
  w.heading('What to bring to the tax collector')
  for (const b of whatToBring(h, has(d))) w.bullet(b.label, '[ ]')
  const tax = salesTaxEstimate(d.price_cents)
  w.heading('Estimated costs')
  w.field('Florida sales tax', `about ${money(Math.round(tax.state * 100))} (6% of the price)`)
  w.field('County surtax', `up to ${money(Math.round(tax.surtaxMax * 100))} (applies to the first $5,000 only)`)
  w.text('Plus title and registration fees. The tax collector calculates the exact amounts.', { color: GREY })
  const due = h.saleDate ? addDays(h.saleDate, 30) : null
  w.heading('Deadline')
  w.text(
    `Title and register within 30 days of the sale${due ? `, by ${due.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}. Florida charges a late penalty after that.`,
    { bold: true }
  )
  return w.finish(FOOTER)
}

const STATUS_LABEL = { ok: 'Looks good', issue: 'PROBLEM', skip: 'Not checked' } as const

async function conditionReport(d: Deal) {
  const ins: InspectionProgress = d.progress?.inspection || { items: {} }
  const list = inspectionFor(has(d))
  const done = list.filter((i) => ins.items[i.id]?.s)
  const problems = list.filter((i) => ins.items[i.id]?.s === 'issue')
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
  const w = await Writer.create('Condition Report', `Buyer's walk-around inspection, recorded ${today}`)
  w.heading('What was inspected')
  for (const l of itemLines(d)) w.bullet(l)
  w.field('Seller', d.seller_name)
  w.field('Buyer and inspector', d.buyer_name)
  w.field('Asking / agreed price', money(d.price_cents))
  if (ins.hours) w.field('Engine hours seen', ins.hours)
  w.field('Items checked', `${done.length} of ${list.length}`)

  w.heading(problems.length ? `Problems found (${problems.length})` : 'Problems found')
  if (!problems.length) w.text('None recorded.', { color: GREY })
  for (const i of problems) {
    w.bullet(`${i.section}: ${i.label}${i.redFlag ? '  [RED FLAG]' : ''}`, '!')
    if (ins.items[i.id]?.note) w.text(`Note: ${ins.items[i.id].note}`, { indent: 14, color: GREY })
  }
  if (problems.length) {
    w.text(
      'Before you pay: use these findings to ask the seller to fix them, lower the price, or both. Get any agreed repair or price change in writing. Your bill of sale is filled in with the final price you enter.',
      { size: 9, gap: 6 }
    )
  }

  for (const section of INSPECTION_SECTIONS) {
    const rows = list.filter((i) => i.section === section)
    if (!rows.length) continue
    w.heading(section)
    for (const i of rows) {
      const r = ins.items[i.id]
      const tag = r?.s ? STATUS_LABEL[r.s] : 'Not checked'
      w.bullet(`${tag}: ${i.label}`, r?.s === 'ok' ? '+' : r?.s === 'issue' ? '!' : '-')
      if (r?.note && r.s !== 'issue') w.text(`Note: ${r.note}`, { indent: 14, color: GREY })
    }
  }
  if (ins.notes) {
    w.heading('Other notes')
    w.text(ins.notes)
  }
  w.text(
    'This report records what the buyer saw. It is not a marine survey or a mechanical inspection, and it does not change the as-is terms of the sale. For a larger purchase, hire an accredited marine surveyor (SAMS or NAMS) and a marine mechanic.',
    { size: 8, color: GREY, gap: 8 }
  )
  return w.finish(FOOTER)
}

export async function buildDocument(key: DocKey, d: Deal): Promise<Uint8Array> {
  const h = d.progress?.handoff || {}
  switch (key) {
    case 'vessel-bill-of-sale':
      return vesselBillOfSale(d, h)
    case 'motor-bill-of-sale':
      return motorBillOfSale(d, h)
    case 'trailer-bill-of-sale':
      return trailerBillOfSale(d, h)
    case 'hsmv-82050-boat':
      return buildHsmv82050(d, 'boat')
    case 'hsmv-82050-trailer':
      return buildHsmv82050(d, 'trailer')
    case 'payment-receipt':
      return paymentReceipt(d, h)
    case 'closing-summary':
      return closingSummary(d, h)
    case 'title-worksheet':
      return titleWorksheet(d, h)
    case 'hsmv-82040-vs':
      return buildHsmv82040vs(d)
    case 'condition-report':
      return conditionReport(d)
  }
}
