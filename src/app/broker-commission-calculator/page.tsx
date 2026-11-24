import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingShell, { buttonStyle, ctaBoxStyle, gold, h2Style, linkStyle, pStyle } from '@/components/marketing/MarketingShell'
import CommissionCalculator from '@/components/marketing/CommissionCalculator'

const URL = 'https://www.boatclosers.com/broker-commission-calculator'
const TITLE = 'Boat Broker Commission Calculator'
const DESC =
  'Enter your boat’s sale price to see what a typical yacht broker commission would cost compared with closing the sale yourself on BoatClosers for a flat $249.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'website', url: URL, title: `${TITLE} | BoatClosers`, description: DESC },
}

const FAQ = [
  {
    q: 'How much does a boat broker charge?',
    a: 'Yacht broker commissions are commonly around 10% of the sale price, usually paid by the seller out of the proceeds and often split between the listing broker and the broker who brings the buyer.',
  },
  {
    q: 'Is the difference what I save?',
    a: 'Not until the boat sells. It is the potential difference between a commission and a flat closing fee. Costs like the survey, haul-out, registration and sales tax are the same either way.',
  },
  {
    q: 'When is a broker worth it?',
    a: 'When you need the boat marketed to buyers you can’t reach yourself, for larger or more complicated yachts, or when you don’t have time to run the sale. If that’s you, hire a reputable, licensed broker.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: TITLE,
      url: URL,
      description: DESC,
      applicationCategory: 'FinanceApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'BoatClosers', url: 'https://www.boatclosers.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

export default function Page() {
  return (
    <MarketingShell ctaHref="/have-a-buyer" ctaLabel="Have a Buyer?">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Free tool · No signup</div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 44px)', lineHeight: 1.15, margin: '0 0 16px' }}>
        Boat Broker Commission Calculator
      </h1>
      <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 36 }}>
        See what a typical commission would cost on your boat, next to closing the sale yourself on BoatClosers for a
        flat $249.
      </p>

      <CommissionCalculator />

      <h2 style={h2Style}>What the commission pays for</h2>
      <p style={pStyle}>
        Most of a broker&apos;s fee pays for finding the buyer: listings, showings, calls and qualifying people. The rest is
        running the deal: the offer, the deposit, the survey period and the paperwork. If the boat practically sells
        itself, or you already have a buyer, you may only need the second part.
      </p>
      <p style={pStyle}>
        That second part is what BoatClosers does: a shared deal room with every offer and counter recorded, the deposit
        held by a neutral escrow company, guided survey steps, and the closing documents filled in and signed.
      </p>

      <h2 style={h2Style}>Common questions</h2>
      {FAQ.map((f) => (
        <div key={f.q} style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 21, margin: '0 0 6px' }}>{f.q}</h3>
          <p style={pStyle}>{f.a}</p>
        </div>
      ))}
      <p style={pStyle}>
        For a full side-by-side, read{' '}
        <Link href="/guides/broker-vs-boatclosers-vs-diy" style={linkStyle}>
          broker vs. BoatClosers vs. doing it yourself
        </Link>
        .
      </p>

      <div style={ctaBoxStyle}>
        <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>Already have a buyer?</h3>
        <p style={{ ...pStyle, marginBottom: 26 }}>
          Open a deal room and send your buyer the link. Flat $249, paid only when you&apos;re ready to sign.
        </p>
        <Link href="/?start=seller" style={buttonStyle}>
          Start Your Private Sale
        </Link>
      </div>
    </MarketingShell>
  )
}
