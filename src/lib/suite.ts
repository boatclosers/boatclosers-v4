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
  pitch: string
  points: string[]
  cta: string
}

export const INSPECTOR: SuiteApp = {
  name: 'My Boat Inspector',
  url: 'https://myboatinspector.com',
  price: '$59.99',
  priceNote: 'covers up to 3 boats for 90 days',
  pitch: 'Walk the boat yourself before you pay for a survey, with a live voice inspector talking you through it, hands-free.',
  points: [
    'Every area of the boat, step by step, from your photos and answers',
    'Guided sea trial, Survey Day checklist and a survey reader',
    'A report with offer points (buyers) or a prep list (sellers)',
  ],
  cta: 'Inspect a boat',
}

export const CHECKS: SuiteApp = {
  name: 'Free HIN and lien checks',
  url: '/hin-check',
  price: 'Free',
  pitch: 'Check the boat’s paperwork before you get attached.',
  points: ['HIN check: builder, model year and Coast Guard recalls', 'Lien check: every place a loan on a boat can hide'],
  cta: 'Check a HIN',
}

export const BOATCLOSERS: SuiteApp = {
  name: 'BoatClosers',
  url: '/',
  price: '$249',
  priceNote: 'flat, per deal',
  pitch: 'Offers, the deposit and escrow, due diligence, every state’s paperwork and online signing, in one deal room you share with the other party.',
  points: [
    'The same $249 for a $5,000 skiff or a $500,000 yacht',
    'The deposit goes to the escrow holder you choose. We never hold your money',
    'The other party joins free',
  ],
  cta: 'Open a deal room',
}

export const CLOSING: SuiteApp = {
  name: 'My Boat Closing',
  url: 'https://myboatclosing.com',
  price: '$29.99',
  pitch: 'Price already agreed on a smaller boat? Your state’s bill of sale and step-by-step help signing the title.',
  points: ['Free HIN check to start', 'Made for everyday boats, usually under $50,000'],
  cta: 'Do the paperwork',
}

export const LOGS: SuiteApp = {
  name: 'My Boat Logs',
  url: 'https://myboatlogs.com',
  price: '$39.99',
  priceNote: 'a year per boat, 14-day free trial',
  pitch: 'One log for the boat: maintenance, documents, costs, spare parts, trips and reminders by date or engine hours.',
  points: [
    'A vessel history report you can share with a buyer',
    'Hand the log to the next owner, with your personal info removed',
  ],
  cta: 'Start a log',
}

export const LISTING: SuiteApp = {
  name: 'My Boat Listing',
  url: 'https://www.myboatlisting.com',
  price: 'From $19.99',
  priceNote: 'Quick $19.99, Standard $39.99, Premium $79.99, by boat',
  pitch: 'Start with the HIN and pick between options line by line. You get an ad that sounds like an owner wrote it.',
  points: [
    'Ready for Facebook Marketplace, Craigslist and Boat Trader',
    'Plus a full buyer page with records, what’s included and disclosures',
  ],
  cta: 'Build a listing',
}
