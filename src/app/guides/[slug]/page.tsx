import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { STATE_GUIDES, getStateGuide } from '@/lib/state-guides'

// Shared layout for the state-by-state boat bill of sale guides.
// The facts for each state live in src/lib/state-guides.ts. Hand-built guide
// pages (each in its own folder under /guides) take priority over this route.

export const dynamicParams = false

export function generateStaticParams() {
  return STATE_GUIDES.map((g) => ({ slug: g.slug }))
}

const BASE = 'https://www.boatclosers.com/guides'

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getStateGuide(params.slug)
  if (!g) return {}
  const url = `${BASE}/${g.slug}`
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: g.title, description: g.description },
  }
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'
const h2 = { fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 } as const
const link = { color: gold } as const

export default function Page({ params }: { params: { slug: string } }) {
  const g = getStateGuide(params.slug)
  if (!g) notFound()
  const url = `${BASE}/${g.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: g.title,
        description: g.description,
        url,
        dateModified: g.dateModified,
        about: [`${g.state} boat bill of sale`, `${g.state} boat title transfer`],
        publisher: { '@type': 'Organization', name: 'BoatClosers', url: 'https://www.boatclosers.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: g.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }

  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '24px 20px',
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

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 80px', fontSize: 18, lineHeight: 1.75 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, lineHeight: 1.15, marginBottom: 20 }}>
          {g.state} Boat Bill of Sale <span style={{ color: gold }}>and Title Transfer</span>
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 12 }}>{g.intro}</p>
        <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 44 }}>
          Checked against official {g.state} sources on {g.checked}. Sources are listed at the bottom.
        </p>

        <h2 style={{ ...h2, marginTop: 44 }}>The short answer</h2>
        <p>{g.shortAnswer}</p>

        <h2 style={h2}>{g.state} by the numbers</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <tbody>
              {g.numbers.map((n) => (
                <tr key={n.label} style={{ borderBottom: '1px solid rgba(201,150,46,0.3)' }}>
                  <td style={{ padding: '12px 12px 12px 0', opacity: 0.85 }}>{n.label}</td>
                  <td style={{ padding: '12px 0 12px 12px', fontWeight: 600 }}>{n.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={h2}>The seller’s steps</h2>
        <ol>
          {g.sellerSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        <h2 style={h2}>The buyer’s steps</h2>
        <ol>
          {g.buyerSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        <h2 style={h2}>Special cases</h2>
        {g.notes.map((n) => (
          <p key={n.title}>
            <strong>{n.title}.</strong> {n.text}
          </p>
        ))}
        <p>
          Every bill of sale should also identify the boat by its HIN, state the price and date, and include as-is
          and free-and-clear wording. See{' '}
          <Link href="/guides/boat-bill-of-sale" style={link}>
            what any boat bill of sale should include
          </Link>
          .
        </p>

        <h2 style={h2}>Don’t write a lower price to save tax</h2>
        <p>
          Tax is based on the real sales price. Understating it shifts the risk to the buyer and weakens the paperwork
          if the sale is ever disputed. Write the real number.
        </p>

        <h2 style={h2}>Common questions</h2>
        {g.faq.map((f) => (
          <div key={f.q} style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 21, marginBottom: 6 }}>{f.q}</h3>
            <p style={{ marginTop: 0 }}>{f.a}</p>
          </div>
        ))}

        <div
          style={{
            marginTop: 60,
            padding: 36,
            border: `1px solid ${gold}`,
            borderRadius: 6,
            background: 'rgba(201,150,46,0.07)',
          }}
        >
          <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>
            Close your {g.state} boat sale the right way
          </h3>
          <p>
            <strong>Simple deal, price already agreed?</strong> My Boat Closing checks the HIN free, then walks you
            through the {g.state} paperwork step by step. $29.99.
          </p>
          <p style={{ marginBottom: 26 }}>
            <strong>Bigger deal, a deposit, a survey or a loan to pay off?</strong> BoatClosers runs the whole sale in
            one deal room: offers, escrow, due diligence and closing documents. Flat $249.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a
              href="https://myboatclosing.com"
              style={{
                display: 'inline-block',
                background: gold,
                color: navy,
                padding: '14px 28px',
                borderRadius: 4,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Check the HIN free
            </a>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                border: `1px solid ${gold}`,
                color: gold,
                padding: '14px 28px',
                borderRadius: 4,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Start a full deal
            </Link>
          </div>
        </div>

        <h2 style={{ ...h2, fontSize: 22 }}>Official sources</h2>
        <ul style={{ fontSize: 16 }}>
          {g.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} style={link}>
                {s.name}
              </a>
            </li>
          ))}
        </ul>

        <p style={{ fontSize: 13, opacity: 0.55, marginTop: 40 }}>
          This guide is general information, not legal or tax advice. Rules and fees change; confirm with{' '}
          {g.agencyName} before closing.
        </p>
      </article>

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
