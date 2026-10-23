// BoatClosers Express: shared content and types (client-safe).
// Everything a buyer reads in the toolkit lives here, so wording can be
// reviewed and updated in one place.

export type ItemKey = 'boat' | 'trailer' | 'motor'

export type CheckItem = { id: string; label: string; detail?: string; only?: ItemKey }

export type TitledHow = 'florida' | 'documented' | 'other-title' | 'other-no-title'
export type LienStatus = 'none' | 'released' | 'open'

export type Handoff = {
  saleDate?: string
  county?: string
  buyerAddress?: string
  sellerAddress?: string
  sellerEmail?: string
  sellerPhone?: string
  paymentMethod?: string
  inventory?: string
  titledHow?: TitledHow
  titleNumber?: string
  registrationNumber?: string
  officialNumber?: string
  twoSellers?: boolean
  secondSeller?: string
  lien?: LienStatus
  lengthFt?: string
  hull?: string
  propulsion?: string
  fuel?: string
}

export const PAYMENT_METHODS = ["Cashier's check", 'Bank transfer', 'Cash', 'Escrow service', 'Personal check', 'Other']
export const HULLS = ['Fiberglass', 'Aluminum', 'Wood', 'Steel', 'Inflatable', 'Other']
export const PROPULSION = ['Outboard', 'Inboard', 'Inboard/outboard (sterndrive)', 'Jet', 'Sail', 'Electric', 'None (manual)']
export const FUELS = ['Gas', 'Diesel', 'Electric', 'None', 'Other']

export const TITLED_OPTIONS: { key: TitledHow; label: string; hint: string }[] = [
  { key: 'florida', label: 'Florida title', hint: 'Seller has a Florida certificate of title' },
  { key: 'documented', label: 'Coast Guard documented', hint: 'Federal Certificate of Documentation' },
  { key: 'other-title', label: 'Another state’s title', hint: 'Titled in a different state' },
  { key: 'other-no-title', label: 'Registration only', hint: 'From a state that doesn’t title boats' },
]

// ---------- Step 1: before you pay ----------

// The walk-around inspection list itself is server-only (lib/express/inspection.ts)
// and sent only to paid deals. These types are shared with the page.
export type InspectStatus = 'ok' | 'issue' | 'skip'
export type InspectItem = { id: string; section: string; label: string; detail?: string; only?: ItemKey; redFlag?: boolean }
export type InspectionProgress = {
  items: Record<string, { s?: InspectStatus; note?: string }>
  hours?: string
  notes?: string
}
// Handoff photos: suggested shots, filtered by what's being bought.
export type Photo = { id: string; label: string; at: number }
export const PHOTO_SHOTS: { label: string; only?: ItemKey }[] = [
  { label: 'HIN plate on the transom', only: 'boat' },
  { label: 'Hull and bottom', only: 'boat' },
  { label: 'Transom and motor mount', only: 'boat' },
  { label: 'Engine hours gauge', only: 'boat' },
  { label: 'Motor serial plate', only: 'motor' },
  { label: 'Trailer VIN', only: 'trailer' },
  { label: 'Trailer tires', only: 'trailer' },
  { label: 'Signed title (front and back)' },
  { label: 'Any problem you found' },
]
export const MAX_PHOTOS = 15

export type InspectionPreview = { count: number; redFlags: number; sections: string[]; sample: string[] }

export const SELLER_QUESTIONS: CheckItem[] = [
  { id: 'q-title', label: 'Is the title in your name, and do you have it in hand?', detail: 'If the name on the title isn’t the person selling, stop until that’s explained.' },
  { id: 'q-owners', label: 'Is anyone else on the title?', detail: 'Two owners joined by “and” must both sign.' },
  { id: 'q-loan', label: 'Do you owe anything on it: a loan, a marina, a storage yard, or a repair shop?', detail: 'Unpaid bills can become liens that follow the boat to you.' },
  { id: 'q-why', label: 'Why are you selling?' },
  { id: 'q-history', label: 'Has it ever sunk, been in an accident, or had an insurance claim?' },
  { id: 'q-hours', label: 'How many engine hours, and do you have service records?', only: 'motor' },
  { id: 'q-kept', label: 'Where has it been kept and serviced?', detail: 'Ask for the marina or shop name. Useful for checking unpaid bills.' },
  { id: 'q-included', label: 'Exactly what’s included in the price?', detail: 'Electronics, covers, safety gear, spare prop, anchor, keys. You’ll list it on the bill of sale.' },
  { id: 'q-inspect', label: 'Can I run it on the water and have a mechanic or surveyor look at it?', detail: 'A seller who refuses an inspection is telling you something.' },
]

export const PAYMENT_TIPS: string[] = [
  'Never pay before you have seen the boat and the original title in person.',
  'Never send a wire, gift card, crypto, or payment-app transfer to a seller you haven’t met. A request to pay a “shipping agent” or an escrow company you didn’t choose is a common scam.',
  'Make a cashier’s check out to the person named on the title, or meet at your bank. For larger purchases, use a real escrow service.',
  'Hand over payment only when you receive the signed title, the signed bill of sale, and the keys in return.',
  'If there’s a loan on the boat, pay the lender directly with a written payoff letter. Don’t trust the seller to pay it off later.',
]

// ---------- Step 2: at the handoff ----------

export function titleSigningGuide(h: Handoff): CheckItem[] {
  const out: CheckItem[] = []
  if (h.titledHow === 'florida' || h.titledHow === 'other-title') {
    out.push(
      { id: 't-seller', label: 'Seller signs the transfer section of the title, as seller', detail: 'On a Florida title it’s the “Transfer of Title by Seller” section on the back. The name must match the front exactly.' },
      { id: 't-price', label: 'Selling price, date of sale, and your name are filled in on the title', detail: 'Florida requires the price on the title for a private sale. Use your full name exactly as on your ID.' },
      { id: 't-clean', label: 'No white-out, cross-outs, or erasures anywhere on the title', detail: 'A corrected title can be rejected. If a mistake happens, stop and ask the tax collector’s office before going further.' },
      { id: 't-original', label: 'You get the original title, not a copy' },
    )
  }
  if (h.twoSellers) {
    out.push({ id: 't-both', label: 'Both owners sign', detail: 'Owners joined by “and” must both sign. If joined by “or”, either one can.' })
  }
  if (h.titledHow === 'documented') {
    out.push(
      { id: 't-cg1340', label: 'Seller signs a Coast Guard bill of sale (form CG-1340)', detail: 'Documented boats transfer through the Coast Guard’s Vessel Documentation Center. Sign it in addition to your BoatClosers Express bill of sale.' },
      { id: 't-cod', label: 'You get the original Certificate of Documentation' },
      { id: 't-satisfaction', label: 'Any recorded mortgage has a filed satisfaction', detail: 'Check the abstract of title. An open mortgage stays with the boat.' },
    )
  }
  if (h.titledHow === 'other-no-title') {
    out.push(
      { id: 't-reg', label: 'You get the seller’s current registration', detail: 'From a state that doesn’t title boats, the registration is the proof of ownership.' },
      { id: 't-notary', label: 'The seller signs the bill of sale in front of a notary', detail: 'Florida tax collectors require a notarized bill of sale with an out-of-state registration. Your bill of sale includes the notary section.' },
    )
  }
  if (h.lien === 'released') {
    out.push({ id: 't-release', label: 'You get the original signed lien release', detail: 'Bring it with you to the tax collector with the title.' })
  }
  out.push(
    { id: 't-bos', label: 'Both of you sign the bill of sale, and you each keep a copy' },
    { id: 't-82050', label: 'Both of you sign Florida form HSMV 82050', detail: 'Page 1 is your copy of the state’s bill of sale. The seller keeps page 2, the notice of sale, and files it within 30 days.' },
    { id: 't-receipt', label: 'Seller signs the payment receipt when you pay' },
    { id: 't-keys', label: 'You get all keys, manuals, and service records' },
  )
  return out
}

// ---------- Step 3: after it's yours ----------

export const NEW_OWNER: CheckItem[] = [
  { id: 'n-insure', label: 'Insure it before the first trip', detail: 'Many marinas and lenders require proof of insurance before you can even dock or launch.' },
  { id: 'n-title', label: 'Title and register it within 30 days of the sale', detail: 'Florida charges a late penalty after 30 days, and your bill of sale only works as temporary registration for those 30 days.' },
  { id: 'n-trailer', only: 'trailer', label: 'Title or register the trailer', detail: 'Trailers of 2,000 lbs or more need a Florida title; lighter trailers need registration and a plate.' },
  { id: 'n-numbers', only: 'boat', label: 'Put the registration numbers and decal on the bow', detail: 'Required once registered. Until then, keep the bill of sale on board.' },
  { id: 'n-bos', only: 'boat', label: 'Keep the bill of sale on board until you’re registered', detail: 'It’s your temporary certificate of number for the first 30 days.' },
  { id: 'n-safety', only: 'boat', label: 'Check safety gear before your first launch' },
  { id: 'n-service', only: 'motor', label: 'Schedule a service: impeller, fuel filters, lower unit oil', detail: 'Unless the seller had it done recently and has the receipt.' },
  { id: 'n-notice', label: 'Make sure the seller files a notice of sale', detail: 'Florida sellers complete the notice of sale on the title or form HSMV 82050 within 30 days, so the boat is out of their name.' },
]

export type BringItem = { label: string; detail?: string; href?: string }

export function whatToBring(h: Handoff, has: Record<ItemKey, boolean>): BringItem[] {
  const out: BringItem[] = []
  if (has.boat && h.titledHow !== 'documented') {
    out.push({
      label: 'Completed form HSMV 82040 VS, Application for Certificate of Vessel Title',
      detail: 'Use the current version; older 82040 forms are no longer accepted. Your title worksheet has every value to copy onto it.',
      href: 'https://www.flhsmv.gov/pdf/forms/82040-vs.pdf',
    })
  }
  if (h.titledHow === 'florida') out.push({ label: 'The original Florida title, signed over to you by the seller' })
  if (h.titledHow === 'other-title') out.push({ label: 'The original out-of-state title, signed over to you' })
  if (h.titledHow === 'other-no-title')
    out.push({ label: 'The seller’s current out-of-state registration and the notarized bill of sale' })
  if (h.titledHow === 'documented')
    out.push({
      label: 'Your Certificate of Documentation (or proof the transfer was filed with the Coast Guard)',
      detail: 'Documented boats aren’t titled by Florida, but they still must be registered here.',
    })
  if (has.boat || has.motor) out.push({ label: 'Your signed BoatClosers Express bill of sale' })
  if (h.lien === 'released') out.push({ label: 'The original signed lien release' })
  out.push({ label: 'A photo ID for every buyer: driver’s license, state ID, or passport' })
  out.push({
    label: 'Power of attorney (form HSMV 82053) for any co-buyer who can’t come',
    href: 'https://www.flhsmv.gov/pdf/forms/82053.pdf',
  })
  if (has.trailer)
    out.push({
      label: 'For the trailer: its title or registration, plus your signed trailer bill of sale',
      detail: 'Trailers are titled separately, on form HSMV 82040 MV.',
      href: 'https://www.flhsmv.gov/pdf/forms/82040-mv.pdf',
    })
  out.push({ label: 'Payment for title and registration fees and sales tax' })
  return out
}

// Rough Florida sales tax: 6% state (capped at $18,000 on a boat) plus a county
// surtax that applies only to the first $5,000 of the price.
export function salesTaxEstimate(priceCents: number) {
  const price = priceCents / 100
  const state = Math.min(price * 0.06, 18000)
  const surtaxMax = Math.min(price, 5000) * 0.015
  return { state, surtaxMax }
}

export function addDays(isoDate: string, days: number): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '')
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  d.setDate(d.getDate() + days)
  return d
}

export function handoffProblems(h: Handoff, has: Record<ItemKey, boolean>): string[] {
  const p: string[] = []
  if (!h.saleDate) p.push('Add the date of sale.')
  if (!h.county) p.push('Add the Florida county where you’re buying.')
  if (!h.buyerAddress) p.push('Add your address, including ZIP code.')
  if (!h.sellerAddress) p.push('Add the seller’s address.')
  if (!h.paymentMethod) p.push('Pick how you’re paying.')
  if (!h.titledHow) p.push('Pick how the boat is titled.')
  if (!h.lien) p.push('Answer the lienholder question.')
  if (has.boat && !h.lengthFt) p.push('Add the boat’s length. Florida requires it on the bill of sale.')
  if (has.boat && !h.propulsion) p.push('Pick the boat’s propulsion. Florida requires it on the bill of sale.')
  if (h.twoSellers && !h.secondSeller) p.push('Add the second owner’s name.')
  return p
}
