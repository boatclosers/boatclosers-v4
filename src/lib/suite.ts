// The BoatClosers family of apps, as shown on boatclosers.com/hub (and in llms.txt).
//
// PRICES: each app is its own codebase, so BoatClosers can't read their settings.
// When a price changes in one of the apps, update it here too:
//   My Boat Inspector  PRICE_CENTS in its Vercel settings; pass = lib/pricing.ts (PASS_BOATS, PASS_DAYS)
//   My Boat Logs       src/lib/stripe.ts (PRICE_CENTS), trial in src/app/api/billing/checkout/route.ts
//   My Boat Listing    lib/paywall.ts (PLAN_CENTS)
//   My Boat Closing    src/lib/express (this repo)
//   BoatClosers        $249 (this repo)
// Only list features that are built and live.

export type SuiteApp = {
  name: string
  url: string
  price: string
  priceNote?: string
  /** One-line promise, taken from the app's own home page. */
  hook?: string
  pitch: string
  /** A short fact that shows why it pays for itself. */
  proof?: string
  points: string[]
  cta: string
}

export const INSPECTOR: SuiteApp = {
  name: 'My Boat Inspector',
  url: 'https://myboatinspector.com',
  price: '$59.99',
  priceNote: 'covers up to 3 boats for 90 days',
  hook: 'Inspect any boat like a pro, from your phone.',
  pitch: 'A live voice inspector walks the boat with you, hands-free: what to photograph, what to press and tap, and what it all means, one step at a time, in the order a pro walks a boat.',
  points: [
    'Every finding sorted into looks normal, closer look or ask your surveyor, with plain reasons',
    'Guided sea trial: snap the gauges and it reads RPM, speed, fuel burn and temps, and checks wide open throttle against the maker’s range',
    'Survey Day checklist, plus upload the survey or an oil analysis report and get it in plain words',
    'A report with offer points and a survey call (buyers) or a prep list (sellers), repair ranges and comparable boats with links',
    'Boat far away? The seller can walk it and send you the report before you travel',
  ],
  proof: 'A failed survey on a 30-foot boat can cost $1,500 or more in survey, haul-out and travel.',
  cta: 'Inspect a boat',
}

export const CHECKS: SuiteApp = {
  name: 'Free HIN and lien checks',
  url: '/hin-check',
  price: 'Free',
  hook: 'Does the boat match its paperwork?',
  pitch: 'Check the hull number before you drive out, and find out whether anyone else has a claim on the boat before you hand over money.',
  points: [
    'HIN check: builder, real model year and Coast Guard recalls',
    'Lien check: title liens, documented-vessel mortgages, UCC filings, and the marina and repair liens no database shows',
  ],
  cta: 'Check a HIN',
}

export const BOATCLOSERS: SuiteApp = {
  name: 'BoatClosers',
  url: '/',
  price: '$249',
  priceNote: 'flat, per deal',
  hook: 'Close your boat sale like a broker would.',
  pitch: 'Offers, the deposit and escrow, due diligence, every state’s paperwork and online signing, in one deal room you share with the other party.',
  points: [
    'Offers and counters with price, deposit, contingencies and a deadline, in one thread both sides see',
    'The deposit goes to the escrow holder you choose, and the boat comes off the market',
    'Survey, sea trial, title and Coast Guard lien checks, with a window to renegotiate or walk away',
    'Every document filled in from your deal, including loans, lost titles, estates and documented boats',
    'The other party joins free. We never hold your money',
  ],
  proof: 'On an $85,000 boat, a 10% commission is $8,500. BoatClosers is $249.',
  cta: 'Open a deal room',
}

export const CLOSING: SuiteApp = {
  name: 'My Boat Closing',
  url: 'https://myboatclosing.com',
  price: '$29.99',
  priceNote: 'for the paperwork, all 50 states',
  hook: 'Shook hands on a boat? Close it right.',
  pitch: 'Skip the generic form from a web search. Check the HIN free, then get your state’s bill of sale and step-by-step help signing the title.',
  points: [
    'Your state’s own form where it has one, filled in for you',
    'Title signing step by step for how the boat is titled: who signs, where, and what gets a title rejected',
    'How to see if a loan is still on the boat, and hand over money without getting burned',
    'The seller gets their papers by email and never needs an account',
  ],
  cta: 'Do the paperwork',
}

export const LOGS: SuiteApp = {
  name: 'My Boat Logs',
  url: 'https://myboatlogs.com',
  price: '$39.99',
  priceNote: 'a year per boat, 14-day free trial',
  hook: 'Every service, record and receipt, in one log for the boat.',
  pitch: 'Every oil change, impeller, zinc and bottom job, with the date, engine hours, who did it and what it cost, plus the documents you need at the ramp or the marina office.',
  points: [
    'Reminders by date or engine hours: service intervals, registration, insurance, haul-outs',
    'Slip, storage, fuel, parts and labor in one running total: what the boat really costs per year and per hour',
    'Spare parts on board and trips, with engine hours kept current',
    'One link that shows a buyer the boat’s documented history',
    'When it sells, the log goes with the boat, with your personal details removed',
  ],
  proof: 'A boat a buyer can verify is the easy one to buy.',
  cta: 'Start a log',
}

export const LISTING: SuiteApp = {
  name: 'My Boat Listing',
  url: 'https://www.myboatlisting.com',
  price: '$19.99',
  priceNote: 'per listing, the same for every boat; build and preview free',
  hook: 'A listing that sounds like an owner wrote it, because you did.',
  pitch: 'Start with the HIN and the year and builder fill in. Then pick the headline, opening, condition and close that sound like you. About ten minutes, start to finish.',
  points: [
    'Questions that fit the boat: a pontoon takes minutes, a sportfish gets the detail it deserves',
    'The ad, ready for Facebook Marketplace, Craigslist and Boat Trader',
    'A full buyer page with specs, records, what’s included and disclosures, linked from the ad, so you stop answering the same questions',
    'Built only from your answers, so it never says anything untrue about your boat',
  ],
  cta: 'Build a listing',
}
