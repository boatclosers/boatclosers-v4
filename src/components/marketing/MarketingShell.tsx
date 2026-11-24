import Link from 'next/link'
import type { ReactNode } from 'react'

// Shared header and footer for the "deal moment" pages
// (/found-the-boat, /have-a-buyer, /broker-commission-calculator).
// Same look as the guide and HIN check pages.

export const navy = '#0f1b2d'
export const gold = '#c9962e'
export const cream = '#f5f1e8'

export const h2Style = {
  fontFamily: 'Georgia, serif',
  fontSize: 28,
  lineHeight: 1.25,
  margin: '64px 0 16px',
} as const
export const pStyle = { fontSize: 17, lineHeight: 1.75, opacity: 0.9, margin: '0 0 16px' } as const
export const linkStyle = { color: gold } as const
export const buttonStyle = {
  display: 'inline-block',
  background: gold,
  color: navy,
  padding: '14px 32px',
  borderRadius: 4,
  fontWeight: 700,
  textDecoration: 'none',
  fontSize: 16,
} as const
export const ghostButtonStyle = {
  display: 'inline-block',
  border: `1px solid ${gold}`,
  color: cream,
  padding: '13px 28px',
  borderRadius: 4,
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: 16,
} as const
export const cardStyle = {
  border: '1px solid rgba(201,150,46,0.35)',
  borderRadius: 6,
  padding: '24px 28px',
  marginBottom: 16,
  background: 'rgba(201,150,46,0.05)',
} as const
export const ctaBoxStyle = {
  marginTop: 56,
  padding: 36,
  border: `1px solid ${gold}`,
  borderRadius: 6,
  background: 'rgba(201,150,46,0.07)',
} as const

export default function MarketingShell({
  children,
  ctaHref = '/',
  ctaLabel = 'Get Started',
}: {
  children: ReactNode
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <div
      style={{
        background: navy,
        minHeight: '100vh',
        color: cream,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
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
          <div style={{ color: gold, fontFamily: 'Georgia, serif', fontSize: 26, letterSpacing: 2, fontWeight: 700 }}>
            BOATCLOSERS
          </div>
          <div style={{ color: cream, fontSize: 10, letterSpacing: 3, opacity: 0.75 }}>PRIVATE VESSEL TRANSACTIONS</div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/guides" style={{ color: cream, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}>
            Guides
          </Link>
          <Link
            href={ctaHref}
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
            {ctaLabel}
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 80px' }}>{children}</main>

      <footer
        style={{
          borderTop: `2px dashed ${gold}`,
          padding: '28px 32px',
          textAlign: 'center',
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        © {new Date().getFullYear()} BoatClosers · Private Vessel Transactions · Not a brokerage
      </footer>
    </div>
  )
}
