import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Private Boat Sale Guides',
  description:
    'Practical guides to buying and selling a boat privately: required documents, deposits and escrow, bill of sale requirements, and how to close without a broker.',
  alternates: {
    canonical: 'https://boatclosers.com/guides',
  },
  openGraph: {
    type: 'website',
    url: 'https://boatclosers.com/guides',
    title: 'Private Boat Sale Guides',
    description:
      'Practical guides to buying and selling a boat privately, without a broker.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

const guides = [
  {
    slug: 'sell-a-boat-without-a-broker',
    title: 'How to Sell a Boat Privately Without a Broker',
    blurb:
      'The full process end to end: pricing against real sold comps, gathering paperwork before you list, filtering serious buyers, and closing in the right order.',
  },
  {
    slug: 'documents-needed-private-boat-sale',
    title: 'What Documents You Need to Close a Private Boat Sale',
    blurb:
      'The four documents every private sale requires, the ones people forget, and why the sequence they are signed in protects both sides.',
  },
  {
    slug: 'boat-deposit-and-escrow',
    title: 'Why Every Private Boat Deal Needs a Deposit and Escrow',
    blurb:
      'What a deposit actually commits, when it should be refundable, and why a seller holding the money is the fastest route to a dispute.',
  },
  {
    slug: 'boat-bill-of-sale',
    title: 'Boat Bill of Sale: What It Must Include to Hold Up',
    blurb:
      'Hull identification number, purchase price, as-is language, lien affirmation, and when your state requires a notary.',
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
      </header>

      <main
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: '64px 24px 80px',
        }}
      >
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 44,
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Private Boat Sale <span style={{ color: gold }}>Guides</span>
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 52 }}>
          Straight answers on how a private boat transaction actually works, written
          for buyers and sellers handling the deal themselves.
        </p>

        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                border: '1px solid rgba(201,150,46,0.35)',
                borderRadius: 6,
                padding: '28px 30px',
                marginBottom: 20,
                background: 'rgba(201,150,46,0.05)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Georgia, serif',
                  color: gold,
                  fontSize: 25,
                  lineHeight: 1.25,
                  margin: '0 0 10px',
                }}
              >
                {g.title}
              </h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, opacity: 0.85 }}>
                {g.blurb}
              </p>
              <div style={{ marginTop: 16, color: gold, fontSize: 15, fontWeight: 700 }}>
                Read the guide
              </div>
            </div>
          </Link>
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
            Ready to run the deal itself
          </h3>
          <p style={{ marginBottom: 26, fontSize: 17, lineHeight: 1.7 }}>
            BoatClosers turns a private conversation into a structured transaction:
            deposit-backed offers, organized negotiation, secure escrow, and 56
            professional documents generated and ready to sign. No broker, no
            commission. Flat $249, paid only when you are ready to sign.
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
            Start Your Deal
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
