import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQ_GROUPS, FAQS } from '../../lib/faqs'

const URL = 'https://www.boatclosers.com/faq'

export const metadata: Metadata = {
  title: 'Private Boat Sale Questions, Answered',
  description:
    'Answers to common questions about buying and selling a boat privately: offers, deposits and escrow, documents, title transfer, liens, inherited boats and fees.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    title: 'Private Boat Sale Questions, Answered',
    description:
      'Offers, deposits, escrow, documents and title transfer for private boat sales — straight answers.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

// FAQPage structured data so Google can show these as rich results.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function Page() {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <Link href="/guides" style={{ color: cream, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}>
            Guides
          </Link>
          <Link href="/faq" style={{ color: cream, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}>
            FAQ
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
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, lineHeight: 1.15, marginBottom: 16 }}>
          Private Boat Sale <span style={{ color: gold }}>Questions</span>
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 36 }}>
          Straight answers to what buyers and sellers ask most before closing a
          private boat deal.
        </p>

        {/* Topic index */}
        <nav
          aria-label="Topics"
          style={{
            border: '1px solid rgba(201,150,46,0.35)',
            borderRadius: 6,
            padding: '22px 26px',
            marginBottom: 52,
            background: 'rgba(201,150,46,0.05)',
          }}
        >
          <div style={{ color: gold, fontSize: 13, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>
            JUMP TO A QUESTION
          </div>
          {FAQ_GROUPS.map((g) => (
            <div key={g.topic} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{g.topic}</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                {g.items.map((f) => (
                  <li key={f.id}>
                    <a href={`#${f.id}`} style={{ color: cream, opacity: 0.85, fontSize: 15 }}>
                      {f.q}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {FAQ_GROUPS.map((g) => (
          <section key={g.topic} style={{ marginBottom: 44 }}>
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                color: gold,
                fontSize: 28,
                borderBottom: '1px solid rgba(201,150,46,0.35)',
                paddingBottom: 10,
                marginBottom: 8,
              }}
            >
              {g.topic}
            </h2>
            {g.items.map((f) => (
              <div
                key={f.id}
                id={f.id}
                style={{ padding: '22px 0', borderBottom: '1px solid rgba(245,241,232,0.1)', scrollMarginTop: 20 }}
              >
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, lineHeight: 1.3, margin: '0 0 10px' }}>
                  {f.q}
                </h3>
                <p style={{ margin: 0, fontSize: 17, lineHeight: 1.75, opacity: 0.88 }}>{f.a}</p>
                {f.guide && (
                  <Link
                    href={`/guides/${f.guide.slug}`}
                    style={{ display: 'inline-block', marginTop: 12, color: gold, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
                  >
                    Read the guide: {f.guide.title} →
                  </Link>
                )}
              </div>
            ))}
          </section>
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
            See it in a real deal room
          </h3>
          <p style={{ marginBottom: 26, fontSize: 17, lineHeight: 1.7 }}>
            BoatClosers is an online platform for private vessel transactions:
            offers, escrow, inspections and paperwork in one deal room both sides
            share. Look inside a sample deal before you sign up. Flat $249, paid
            only when you are ready to sign.
          </p>
          <Link
            href="/#preview"
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
            See a sample deal
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
