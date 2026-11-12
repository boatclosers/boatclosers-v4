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

// The same choices, worded for the state where the sale happens. The key
// 'florida' means "titled in the state of sale" for every state.
export function titledOptions(stateName: string, stateTitles = true): { key: TitledHow; label: string; hint: string }[] {
  if (stateName === 'Florida') return TITLED_OPTIONS
  return [
    ...(stateTitles ? [{ key: 'florida' as const, label: `${stateName} title`, hint: `Seller has a ${stateName} certificate of title` }] : []),
    { key: 'documented', label: 'Coast Guard documented', hint: 'Federal Certificate of Documentation' },
    { key: 'other-title', label: stateTitles ? 'Another state’s title' : 'A state title', hint: stateTitles ? 'Titled in a different state' : 'Seller has a certificate of title from a state that titles boats' },
    { key: 'other-no-title', label: 'Registration only', hint: stateTitles ? 'From a state that doesn’t title boats' : `Registered in ${stateName} or another state that doesn’t title boats` },
  ]
}

// ---------- Quick walk-around (free) ----------
// Deal-breakers a buyer can check in a few minutes at the boat. A record of what
// they saw, not an inspection: the full walkthrough is My Boat Inspector's job.
export type WalkItem = { id: string; label: string; detail?: string; for: 'boat' | 'engine' | 'trailer' | 'any' }
export type WalkProgress = { items: Record<string, { s?: 'ok' | 'flag'; note?: string }>; hours?: string }
export const WALK_ITEMS: WalkItem[] = [
  { id: 'w-hin', for: 'boat', label: 'The HIN on the hull matches the title and your paperwork', detail: 'Back right corner of the transom. Any sign it was ground off or altered is a hard stop.' },
  { id: 'w-owner', for: 'any', label: 'The seller’s ID matches the name on the title or registration' },
  { id: 'w-deck', for: 'boat', label: 'Deck and floor feel solid, with no soft spots', detail: 'Walk it and press with your heel, especially around seats, hatches and the helm.' },
  { id: 'w-transom', for: 'boat', label: 'Transom is solid around the motor', detail: 'Push and pull the lower unit. The transom shouldn’t flex, and there should be no cracks around the bolts.' },
  { id: 'w-hull', for: 'boat', label: 'No cracks, deep gouges or fresh patches on the hull', detail: 'Look along the keel and chines. Fresh paint in one spot can hide a repair.' },
  { id: 'w-sunk', for: 'boat', label: 'No signs it has sunk or flooded', detail: 'Water lines inside lockers, silt, green corroded wiring, or a strong musty smell.' },
  { id: 'w-bilge', for: 'boat', label: 'Bilge has no fuel smell and the bilge pump runs' },
  { id: 'w-start', for: 'engine', label: 'Engine starts cold and idles smoothly', detail: 'Ask that it not be run before you arrive. A warm engine hides starting problems.' },
  { id: 'w-telltale', for: 'engine', label: 'A steady stream of cooling water comes out while it runs', detail: 'On an outboard it’s the small “tell-tale” stream. Weak or none means the water pump needs work.' },
  { id: 'w-hours', for: 'engine', label: 'Engine hours match what the seller told you', detail: 'Take a photo of the hour meter.' },
  { id: 'w-power', for: 'boat', label: 'Lights, horn and electronics power on' },
  { id: 'w-trailer', for: 'trailer', label: 'Trailer tires, lights, winch and frame are roadworthy', detail: 'Check for dry-rotted tires, rusted-through frame members and rotten bunks.' },
]
export function walkItems(has: Record<ItemKey, boolean>): WalkItem[] {
  return WALK_ITEMS.filter((w) => w.for === 'any' || (w.for === 'boat' && has.boat) || (w.for === 'engine' && (has.boat || has.motor)) || (w.for === 'trailer' && has.trailer))
}

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

export function titleSigningGuide(h: Handoff, state = 'FL'): CheckItem[] {
  const fl = state === 'FL'
  const out: CheckItem[] = []
  if (h.titledHow === 'florida' || h.titledHow === 'other-title') {
    out.push(
      { id: 't-seller', label: 'Seller signs the transfer section of the title, as seller', detail: fl ? 'On a Florida title it’s the “Transfer of Title by Seller” section on the back. The name must match the front exactly.' : 'Usually on the back of the title. The name must match the front exactly.' },
      { id: 't-price', label: 'Selling price, date of sale, and your name are filled in on the title', detail: fl ? 'Florida requires the price on the title for a private sale. Use your full name exactly as on your ID.' : 'Fill in every buyer line the title has. Use your full name exactly as on your ID.' },
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
      { id: 't-notary', label: 'The seller signs the bill of sale in front of a notary', detail: fl ? 'Florida tax collectors require a notarized bill of sale with an out-of-state registration. Your bill of sale includes the notary section.' : 'Without a title, a notarized bill of sale is the strongest proof of ownership. Your bill of sale includes the notary section.' },
    )
  }
  if (h.lien === 'released') {
    out.push({ id: 't-release', label: 'You get the original signed lien release', detail: 'Bring it with you to the tax collector with the title.' })
  }
  out.push(
    { id: 't-bos', label: 'Both of you sign the bill of sale, and you each keep a copy' },
    { id: 't-82050', label: 'Both of you sign Florida form HSMV 82050', detail: 'Page 1 is your copy of the state’s bill of sale. The seller keeps page 2, the notice of sale, and files it within 30 days.' },
    { id: 't-receipt', label: 'Seller signs the payment receipt when you pay' },
  )
  if (!fl) {
    const i = out.findIndex((x) => x.id === 't-82050')
    if (i >= 0) out.splice(i, 1)
  }
  out.push(
    { id: 't-keys', label: 'You get all keys, manuals, and service records' },
  )
  return out
}

// ---------- Step 3: after it's yours ----------

export function newOwnerFor(state = 'FL'): CheckItem[] {
  if (state === 'FL') return NEW_OWNER
  return [
    { id: 'n-insure', label: 'Insure it before the first trip', detail: 'Many marinas and lenders require proof of insurance before you can even dock or launch.' },
    { id: 'n-title', label: 'Title or register it with your state as soon as you can', detail: 'Most states set a deadline after a sale. Your state guide links to the right office.' },
    { id: 'n-trailer', only: 'trailer', label: 'Title or register the trailer', detail: 'Trailers usually go through the state motor vehicle office, separately from the boat.' },
    { id: 'n-numbers', only: 'boat', label: 'Put the registration numbers and decal on the bow', detail: 'Required once registered.' },
    { id: 'n-safety', only: 'boat', label: 'Check safety gear before your first launch' },
    { id: 'n-service', only: 'motor', label: 'Schedule a service: impeller, fuel filters, lower unit oil', detail: 'Unless the seller had it done recently and has the receipt.' },
    { id: 'n-notice', label: 'Ask the seller to report the sale to their state', detail: 'Many states have a notice-of-sale or transfer form, so the boat is out of the seller’s name.' },
  ]
}

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

// What the buyer brings to the meeting with the seller.
export const BRING_TO_HANDOFF: CheckItem[] = [
  { id: 'b-id', label: 'Your driver license', detail: 'The seller should see it too, and you should see theirs. The names must match the title.' },
  { id: 'b-pay', label: 'The payment, ready to hand over', detail: 'A cashier’s check made out to the name on the title, or a bank transfer you can confirm on the spot. Call the issuing bank yourself to confirm a check is real.' },
  { id: 'b-papers', label: 'Your papers from Express, printed or on your phone', detail: 'Two copies of the bill of sale so you each keep a signed original.' },
  { id: 'b-pen', label: 'A pen with blue or black ink', detail: 'The tax collector can reject a title signed in any other color.' },
  { id: 'b-tow', only: 'trailer', label: 'Tow gear for the trip home', detail: 'Hitch ball in the right size, safety chains, and working trailer lights. The seller’s trailer plate stays with the seller.' },
  { id: 'b-insure', label: 'Proof of insurance, if you’re taking it on the water or a marina asks', detail: 'Get it bound before you drive away. Most insurers can do it by phone the same day.' },
]

// What should change hands at the meeting. Ticks go on the handoff record.
export const HANDOFF_CHECKS: CheckItem[] = [
  { id: 'h-title', label: 'The original title, signed by every owner listed on it' },
  { id: 'h-release', label: 'The signed lien release, if the title shows a lienholder' },
  { id: 'h-bos', label: 'The bill of sale, signed by both of you, one original each' },
  { id: 'h-hin', only: 'boat', label: 'The HIN on the hull matches the title and the bill of sale' },
  { id: 'h-vin', only: 'trailer', label: 'The trailer VIN matches its title or registration' },
  { id: 'h-keys', label: 'All keys, including spares and the kill-switch lanyard' },
  { id: 'h-manuals', label: 'Manuals, service records, and receipts the seller has' },
  { id: 'h-items', label: 'Everything listed as included in the sale' },
  { id: 'h-reg', only: 'boat', label: 'The current registration card, if the seller has it' },
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

export function handoffProblems(h: Handoff, has: Record<ItemKey, boolean>, state = 'FL'): string[] {
  const fl = state === 'FL'
  const p: string[] = []
  if (!h.saleDate) p.push('Add the date of sale.')
  if (fl && !h.county) p.push('Add the Florida county where you’re buying.')
  if (!h.buyerAddress) p.push('Add your address, including ZIP code.')
  if (!h.sellerAddress) p.push('Add the seller’s address.')
  if (!h.paymentMethod) p.push('Pick how you’re paying.')
  if (!h.titledHow) p.push('Pick how the boat is titled.')
  if (!h.lien) p.push('Answer the lienholder question.')
  if (fl && has.boat && !h.lengthFt) p.push('Add the boat’s length. Florida requires it on the bill of sale.')
  if (fl && has.boat && !h.propulsion) p.push('Pick the boat’s propulsion. Florida requires it on the bill of sale.')
  if (h.twoSellers && !h.secondSeller) p.push('Add the second owner’s name.')
  return p
}
