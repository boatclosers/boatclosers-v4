import Link from 'next/link'
import { BOATCLOSERS } from '@/lib/suite'
import { buttonStyle, cream, gold, navy } from './MarketingShell'

// The BoatClosers sales pieces used high up on the deal-moment pages, so the
// reader sees the offer first instead of in a box at the very bottom.
// Every claim comes from src/lib/suite.ts (the BOATCLOSERS entry).

export type Role = 'buyer' | 'seller'

export const startHref = (role: Role) => `/?start=${role}`

const TRUST = ['Flat $249 per deal', 'Pay only when you’re ready to sign', 'The other party joins free', 'We never hold your money']

/** A row of short facts that answer "what's the catch?" at a glance. */
export function TrustStrip() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 22px', marginTop: 20, fontSize: 14, opacity: 0.9 }}>
      {TRUST.map((t) => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: gold, fontWeight: 700 }} aria-hidden="true">
            ✓
          </span>
          {t}
        </span>
      ))}
    </div>
  )
}

/** "What $249 gets you": the full offer, with a button, near the top of the page. */
export function DealPitch({ role, title }: { role: Role; title?: string }) {
  return (
    <section
      style={{
        margin: '48px 0 0',
        padding: '32px 28px',
        borderRadius: 8,
        background: cream,
        color: navy,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: '#8a6516', marginBottom: 8 }}>
        BOATCLOSERS · {BOATCLOSERS.price.toUpperCase()} {BOATCLOSERS.priceNote?.toUpperCase()}
      </div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 30, lineHeight: 1.2, margin: '0 0 8px' }}>
        {title || BOATCLOSERS.hook}
      </h2>
      <p style={{ fontSize: 17, lineHeight: 1.6, margin: '0 0 20px', opacity: 0.85 }}>{BOATCLOSERS.pitch}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'grid', gap: 12 }}>
        {BOATCLOSERS.points.map((p) => (
          <li key={p} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5 }}>
            <span
              aria-hidden="true"
              style={{
                flex: '0 0 auto',
                width: 22,
                height: 22,
                borderRadius: 11,
                background: gold,
                color: navy,
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              ✓
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {BOATCLOSERS.proof && (
        <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 22px' }}>{BOATCLOSERS.proof}</p>
      )}
      <Link href={startHref(role)} style={{ ...buttonStyle, background: navy, color: cream }}>
        {role === 'buyer' ? 'Start a BoatClosers Deal' : 'Start Your Private Sale'}
      </Link>
    </section>
  )
}

/** A short line with a button, dropped between sections so the next step is never far away. */
export function InlineCta({ role, text }: { role: Role; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        margin: '32px 0 0',
        padding: '18px 22px',
        border: `1px solid ${gold}`,
        borderRadius: 6,
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 600 }}>{text}</span>
      <Link href={startHref(role)} style={{ ...buttonStyle, padding: '12px 24px', fontSize: 15 }}>
        {role === 'buyer' ? 'Start a Deal' : 'Start Your Sale'}
      </Link>
    </div>
  )
}

/** A bar that stays at the bottom of the screen while the reader scrolls.
 *  role "both" shows a Buying and a Selling button (for pages meant for either side). */
export function StickyCta({ role, text }: { role: Role | 'both'; text?: string }) {
  const small = { ...buttonStyle, padding: '12px 20px', fontSize: 15, whiteSpace: 'nowrap' as const, flex: '0 0 auto' }
  const line =
    text ||
    (role === 'buyer'
      ? 'Make a real offer, deposit in escrow.'
      : role === 'seller'
        ? 'Close the sale yourself.'
        : 'Let BoatClosers run every step.')
  return (
    <>
      <style>{'@media print{.bc-sticky{display:none !important}}'}</style>
      {/* Spacer so the bar never covers the footer. */}
      <div style={{ height: 76 }} aria-hidden="true" />
      <div
        className="bc-sticky no-print"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          background: navy,
          borderTop: `2px solid ${gold}`,
          boxShadow: '0 -6px 18px rgba(0,0,0,0.35)',
          padding: '12px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <span style={{ color: cream, fontSize: 15, lineHeight: 1.35 }}>
            {line} <strong style={{ color: gold, whiteSpace: 'nowrap' }}>Flat $249</strong>
          </span>
          {role === 'both' ? (
            <span style={{ display: 'flex', gap: 8, flex: '0 0 auto' }}>
              <Link href={startHref('buyer')} style={small}>
                Buying
              </Link>
              <Link href={startHref('seller')} style={small}>
                Selling
              </Link>
            </span>
          ) : (
            <Link href={startHref(role)} style={small}>
              {role === 'buyer' ? 'Start a Deal' : 'Start Your Sale'}
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
