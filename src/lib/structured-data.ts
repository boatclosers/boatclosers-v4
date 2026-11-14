// Structured data (schema.org JSON-LD) for BoatClosers and My Boat Closing.
//
// Why this exists: Google, ChatGPT, Perplexity, Claude and other AI answer
// engines read this invisible block to understand exactly WHAT each product is,
// what it costs and who makes it. Clear, consistent facts here make it easier
// for them to describe and recommend the products correctly.
//
// Keep every fact here in step with the landing pages. If a price or feature
// changes on the page, change it here too: AI tools distrust sites that
// contradict themselves.

const BC_URL = 'https://www.boatclosers.com'
const MBC_URL = 'https://myboatclosing.com'

// The company behind the whole suite. Add social profile URLs to `sameAs`
// (Facebook page, YouTube, LinkedIn) as they go live; they help AI tools
// confirm the brand is real.
export const organization = {
  '@type': 'Organization',
  '@id': `${BC_URL}/#organization`,
  name: 'BoatClosers',
  url: BC_URL,
  logo: `${BC_URL}/og-image.png`,
  description:
    'BoatClosers makes online tools for private boat sales in the United States: a flat-fee closing platform (BoatClosers), a simple paperwork tool for small deals (My Boat Closing), a guided boat inspection app (My Boat Inspector) and a boat maintenance log (My Boat Logs).',
  areaServed: 'US',
  email: 'support@boatclosers.com',
  sameAs: [] as string[],
}

export const boatClosersApp = {
  '@type': 'WebApplication',
  '@id': `${BC_URL}/#app`,
  name: 'BoatClosers',
  url: BC_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  description:
    'Online closing tool for private boat sales. Buyer and seller share one deal room for offers and counteroffers, deposits and escrow, due diligence, the paperwork (bill of sale, purchase agreement, title and Coast Guard documentation forms) and e-signing. A flat $249 per transaction, not a percentage. Not a brokerage: it does not list boats or hold money.',
  offers: {
    '@type': 'Offer',
    price: '249',
    priceCurrency: 'USD',
    description: 'Flat fee per boat sale. Free to start; paid when the deal is ready to sign. Escrow.com fees, if used, are separate.',
  },
  featureList: [
    'Shared deal room for buyer and seller',
    'Offers and counteroffers with a deposit',
    'Escrow options including Escrow.com',
    'Guided due diligence, survey and sea trial steps',
    'Closing documents filled in and e-signed',
    'Coast Guard documented vessel transfers',
    'Free HIN check and boat lien check',
  ],
  publisher: { '@id': `${BC_URL}/#organization` },
}

export const myBoatClosingApp = {
  '@type': 'WebApplication',
  '@id': `${MBC_URL}/#app`,
  name: 'My Boat Closing',
  url: MBC_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  description:
    'Paperwork tool for small, simple private boat purchases (usually under $50,000) where buyer and seller have already agreed on a price. Free HIN check, then your state’s bill of sale, step-by-step title signing, a payment receipt, a handoff record and titling help. Works in all 50 states.',
  offers: [
    { '@type': 'Offer', name: 'HIN check', price: '0', priceCurrency: 'USD' },
    {
      '@type': 'Offer',
      name: 'Closing paperwork',
      price: '29.99',
      priceCurrency: 'USD',
      description: 'One purchase; a boat, trailer and motor in the same sale is one price.',
    },
  ],
  publisher: { '@id': `${BC_URL}/#organization` },
}

// Turns a list of { q, a } into FAQPage structured data.
export function faqPage(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

// Wraps one or more blocks in a single JSON-LD document.
export function jsonLd(...blocks: object[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': blocks })
}
