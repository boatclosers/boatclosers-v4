import type { Metadata } from 'next'
import Link from 'next/link'
import LienCheck from '@/components/LienCheck'

export const metadata: Metadata = {
  title: 'Boat Lien Check: How to Find Liens Before You Buy a Used Boat',
  description:
    'Free step-by-step lien check for private boat buyers in Florida: title liens, Coast Guard documented vessel mortgages, UCC filings, and the marina and repair liens no database shows.',
  alternates: {
    canonical: 'https://www.boatclosers.com/lien-check',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com/lien-check',
    title: 'Free Boat Lien Check | BoatClosers',
    description: 'Check every place a lien on a boat can hide, before you hand over any money.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

export default function Page() {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#0f1b2d}'}</style>
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
        <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Free tool · No signup</div>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(32px, 6vw, 44px)',
            lineHeight: 1.15,
            margin: '0 0 16px',
          }}
        >
          Boat Lien Check
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 36 }}>
          If the seller still owes money on the boat, the lender can come after it even after you&apos;ve paid. No single
          database shows every lien, so this walks you through each place one can be recorded, plus the ones that
          aren&apos;t recorded anywhere.
        </p>

        <div
          style={{
            border: '1px solid rgba(201,150,46,0.35)',
            borderRadius: 6,
            padding: '24px 26px',
            background: 'rgba(201,150,46,0.04)',
          }}
        >
          <LienCheck />
        </div>

        <p style={{ fontSize: 17, lineHeight: 1.75, opacity: 0.9, marginTop: 40 }}>
          Checking the boat itself too? Run the{' '}
          <Link href="/hin-check" style={{ color: gold }}>
            free HIN check
          </Link>{' '}
          to see who built it, safety recalls, and any Coast Guard records.
        </p>
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
