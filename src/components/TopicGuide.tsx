import type { Metadata } from 'next'
import Link from 'next/link'
import type { TopicGuide } from '@/lib/topic-guides'
import HistoryReportCard from '@/components/HistoryReportCard'

const BASE = 'https://www.boatclosers.com/guides'
const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'
const h2 = { fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 } as const
const link = { color: gold } as const
const btn = {
  display: 'inline-block',
  background: gold,
  color: navy,
  padding: '14px 28px',
  borderRadius: 4,
  fontWeight: 700,
  textDecoration: 'none',
} as const
const btnOutline = { ...btn, background: 'transparent', border: `1px solid ${gold}`, color: gold } as const

export function topicGuideMetadata(g: TopicGuide): Metadata {
  const url = `${BASE}/${g.slug}`
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: g.title, description: g.description },
  }
}

export default function TopicGuidePage({ g }: { g: TopicGuide }) {
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
          <Link href="/" style={{ ...btn, padding: '12px 26px', fontSize: 15 }}>
            Get Started
          </Link>
        </div>
      </header>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 80px', fontSize: 18, lineHeight: 1.75 }}>
        <p style={{ fontSize: 13, letterSpacing: 2, opacity: 0.6, marginBottom: 12 }}>
          GUIDE · UPDATED NOVEMBER 14, 2026
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, lineHeight: 1.15, marginBottom: 20 }}>
          {g.h1} <span style={{ color: gold }}>{g.h1Accent}</span>
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 20 }}>{g.intro}</p>

        {g.sections.map((s, i) => {
          const ListTag = s.ordered ? 'ol' : 'ul'
          return (
            <section key={s.h}>
              <h2 style={i === 0 ? { ...h2, marginTop: 36 } : h2}>{s.h}</h2>
              {s.list && (
                <ListTag>
                  {s.list.map((item) => (
                    <li key={item} style={{ marginBottom: 8 }}>
                      {item}
                    </li>
                  ))}
                </ListTag>
              )}
              {s.paras?.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          )
        })}

        {g.historyReport && (
          <div style={{ marginTop: 28 }}>
            <HistoryReportCard audience={g.historyReport} />
          </div>
        )}

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
          {g.cta === 'mbc' ? (
            <>
              <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>
                Let My Boat Closing walk you through it
              </h3>
              <p style={{ marginBottom: 26 }}>
                Price already agreed? My Boat Closing checks the HIN free, then gives both of you your state’s
                paperwork, step by step, on your phone. $29.99, no printer needed.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="https://myboatclosing.com" style={btn}>
                  Check the HIN free
                </a>
                <Link href="/" style={btnOutline}>
                  Need a full deal room?
                </Link>
              </div>
            </>
          ) : g.cta === 'bc' ? (
            <>
              <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>
                Run the whole deal in one place
              </h3>
              <p style={{ marginBottom: 26 }}>
                BoatClosers handles offers, escrow, payoffs, due diligence and closing documents in one deal room. No
                broker, no commission. Flat $249.
              </p>
              <Link href="/" style={btn}>
                Start Your Deal
              </Link>
            </>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>
                Close it the right way
              </h3>
              <p>
                <strong>Simple deal, price already agreed?</strong> My Boat Closing checks the HIN free, then walks you
                through your state’s paperwork step by step. $29.99.
              </p>
              <p style={{ marginBottom: 26 }}>
                <strong>Bigger deal, a deposit, a survey or a loan to pay off?</strong> BoatClosers runs the whole sale
                in one deal room. Flat $249.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="https://myboatclosing.com" style={btn}>
                  Check the HIN free
                </a>
                <Link href="/" style={btnOutline}>
                  Start a full deal
                </Link>
              </div>
            </>
          )}
        </div>

        <h2 style={{ ...h2, fontSize: 22 }}>Related guides</h2>
        <ul style={{ fontSize: 16 }}>
          {g.related.map((r) => (
            <li key={r.slug}>
              <Link href={`/guides/${r.slug}`} style={link}>
                {r.title}
              </Link>
            </li>
          ))}
        </ul>

        {g.sources && (
          <>
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
          </>
        )}

        {g.links && (
          <>
            <h2 style={{ ...h2, fontSize: 22 }}>Helpful links</h2>
            <ul style={{ fontSize: 16 }}>
              {g.links.map((l) => (
                <li key={l.url} style={{ marginBottom: 8 }}>
                  <a href={l.url} target="_blank" rel="noopener" style={link}>
                    {l.name}
                  </a>
                  {l.note && <span style={{ opacity: 0.7 }}> — {l.note}</span>}
                </li>
              ))}
            </ul>
          </>
        )}

        <p style={{ fontSize: 13, opacity: 0.55, marginTop: 40 }}>
          This guide is general information, not legal or tax advice. Rules and fees change; confirm with the agency
          that titles boats in your state before closing.
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
