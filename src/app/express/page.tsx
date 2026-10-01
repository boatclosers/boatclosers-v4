import type { Metadata } from 'next'
import Link from 'next/link'
import ExpressSignup from './ExpressSignup'

export const metadata: Metadata = {
  title: 'BC Express: Buy a Boat From a Private Seller for $29.99',
  description:
    'BC Express is a $29.99 buyer toolkit for small private boat purchases: walk-around checklist, HIN check, title signing guide, bill of sale, and safe payment tips. Coming soon.',
  alternates: {
    canonical: 'https://www.boatclosers.com/express',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com/express',
    title: 'BC Express by BoatClosers: coming soon',
    description:
      'Everything a buyer needs to close a small private boat purchase safely, for $29.99. The seller never has to sign up.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

const stages = [
  {
    title: 'Before you pay',
    items: [
      'What to look for when buying a used boat',
      'Walk-around checklist for hull, engine, and trailer',
      'HIN check to match the boat to its paperwork',
      'Safe payment tips and common scams to avoid',
    ],
  },
  {
    title: 'At the handoff',
    items: [
      'Bill of sale with proper as-is wording',
      'Trailer bill of sale',
      'Title signing guide so nothing gets rejected',
      'Notice of sale reminder for the seller',
    ],
  },
  {
    title: 'After it is yours',
    items: [
      'Pre-filled title application',
      'Document vault for every paper from the deal',
      'New Owner Checklist for registration and first trips',
    ],
  },
]

export default function Page() {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '24px 32px',
          borderBottom: `2px dashed ${gold}`,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div
            style={{
              color: gold,
              fontFamily: 'Georgia, serif',
              fontSize: 26,
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            BOATCLOSERS
          </div>
          <div style={{ color: cream, fontSize: 10, letterSpacing: 3, opacity: 0.75 }}>
            PRIVATE VESSEL TRANSACTIONS
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            href="/guides"
            style={{ color: cream, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}
          >
            Guides
          </Link>
          <Link
            href="/"
            style={{
              background: gold,
              color: navy,
              padding: '12px 26px',
              borderRadius: 4,
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
          BC Express, coming soon
        </div>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(32px, 6vw, 44px)',
            lineHeight: 1.15,
            margin: '0 0 16px',
          }}
        >
          Buying a boat from a private seller? Close it right for $29.99.
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 36 }}>
          A step-by-step buyer toolkit for smaller private sales. Check the boat, sign the
          right papers, pay safely, and walk away with a clean title. The seller never has
          to create an account.
        </p>

        <ExpressSignup />

        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 30,
            lineHeight: 1.25,
            margin: '72px 0 28px',
          }}
        >
          What you get, in the order you need it
        </h2>

        {stages.map((stage, i) => (
          <div
            key={stage.title}
            style={{
              border: '1px solid rgba(201,150,46,0.35)',
              borderRadius: 6,
              padding: '28px 30px',
              marginBottom: 20,
              background: 'rgba(201,150,46,0.05)',
            }}
          >
            <h3
              style={{
                fontFamily: 'Georgia, serif',
                color: gold,
                fontSize: 25,
                lineHeight: 1.25,
                margin: '0 0 14px',
              }}
            >
              {i + 1}. {stage.title}
            </h3>
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              {stage.items.map((item) => (
                <li key={item} style={{ fontSize: 17, lineHeight: 1.8, opacity: 0.9 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div
          style={{
            marginTop: 48,
            padding: 36,
            border: `1px solid ${gold}`,
            borderRadius: 6,
            background: 'rgba(201,150,46,0.07)',
          }}
        >
          <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>
            Express or full BoatClosers?
          </h3>
          <p style={{ marginBottom: 26, fontSize: 17, lineHeight: 1.7 }}>
            Express is for simpler private purchases where you and the seller have already
            agreed on a price. If you need negotiation, offers and counteroffers, escrow, or
            both parties working in one deal room, full BoatClosers is the better fit. You
            will be able to upgrade from Express to the full platform without paying twice.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: gold,
              color: navy,
              padding: '14px 32px',
              borderRadius: 4,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            See Full BoatClosers
          </Link>
        </div>
      </main>

      <footer
        style={{
          borderTop: `2px dashed ${gold}`,
          padding: '28px 32px',
          textAlign: 'center',
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        © {new Date().getFullYear()} BoatClosers · Private Vessel Transactions
      </footer>
    </div>
  )
}
