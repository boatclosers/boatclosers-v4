import type { Metadata } from 'next'
import Link from 'next/link'
import ExpressSignup from './ExpressSignup'

export const metadata: Metadata = {
  title: 'BC Express: Buy a Boat From a Private Seller the Right Way',
  description:
    'Free HIN check, walk-around checklist, and seller questions for private boat, trailer, and motor purchases. Unlock a bill of sale filled in for your deal and a title signing guide for $29.99.',
  alternates: {
    canonical: 'https://www.boatclosers.com/express',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com/express',
    title: 'BC Express by BoatClosers',
    description:
      'Buying a boat from a private seller? Check it free, then close it right for $29.99. The seller never has to sign up.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'
const muted = '#bdb6a8'
const line = 'rgba(201,150,46,0.35)'

const h2 = {
  fontFamily: 'Georgia, serif',
  fontSize: 'clamp(26px, 5vw, 32px)',
  lineHeight: 1.25,
  margin: '0 0 18px',
}

const steps = [
  {
    title: 'Before you pay',
    price: 'Free',
    items: [
      'HIN check to match the boat to its paperwork',
      'Walk-around checklist for hull, engine, trailer, and motor',
      'Questions to ask the seller before you go look',
      'How to pay safely, and the scams to watch for',
    ],
  },
  {
    title: 'At the handoff',
    price: '$29.99 unlock',
    items: [
      'Bill of sale filled in for your deal, with proper as-is wording',
      'Trailer bill of sale when a trailer is included',
      'Title signing guide, so nothing gets rejected',
      'Red-flag checks: two sellers on the title, a lien, an out-of-state boat',
    ],
  },
  {
    title: "After it's yours",
    price: 'Included',
    items: [
      'Pre-filled Florida title application',
      'What to bring to the tax collector, for your exact deal',
      'Title deadline reminders by email',
      'Every paper from the deal saved in one place',
    ],
  },
]

const faqs = [
  {
    q: 'Does the seller have to sign up?',
    a: 'No. You handle everything. The seller just signs the papers at the handoff.',
  },
  {
    q: 'What does it cost?',
    a: 'Starting is free, including the HIN check and walk-around checklist. When you are ready for the paperwork, it is $29.99, one price whether you are buying a boat, a trailer, a motor, or all three.',
  },
  {
    q: 'Is this only for Florida?',
    a: 'For now, yes. Florida titling rules are built in, so your paperwork matches what the tax collector expects.',
  },
  {
    q: 'What if my deal needs more?',
    a: 'If you need offers and counteroffers, escrow, or both parties working together, full BoatClosers handles that, and you can move up to it without paying twice.',
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
          <div style={{ color: gold, fontFamily: 'Georgia, serif', fontSize: 26, letterSpacing: 2, fontWeight: 700 }}>
            BOATCLOSERS
          </div>
          <div style={{ color: cream, fontSize: 10, letterSpacing: 3, opacity: 0.75 }}>EXPRESS · BUYER TOOLKIT</div>
        </Link>
        <Link href="/guides" style={{ color: cream, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}>
          Guides
        </Link>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
          BC Express · For private boat, trailer &amp; motor purchases
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 46px)', lineHeight: 1.15, margin: '0 0 18px' }}>
          Buying a boat from a private seller? Check it free. Close it right for $29.99.
        </h1>
        <p style={{ fontSize: 20, opacity: 0.88, lineHeight: 1.7, margin: '0 0 36px' }}>
          A step-by-step buyer toolkit that walks you from the first look to a clean title. Check the boat,
          sign the right papers, pay safely, and walk into the tax collector&apos;s office with everything they
          need. The seller never has to create an account.
        </p>

        <a
          href="#notify"
          style={{
            display: 'inline-block',
            background: gold,
            color: navy,
            padding: '15px 34px',
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          Get notified when it opens
        </a>

        <section style={{ marginTop: 80 }}>
          <h2 style={h2}>Where private boat sales go wrong</h2>
          <p style={{ fontSize: 17, lineHeight: 1.75, opacity: 0.9, margin: 0 }}>
            Most private sales happen in a driveway with a handshake and a handwritten bill of sale. Then the
            buyer gets to the tax collector and finds out the title was signed in the wrong spot, the HIN
            doesn&apos;t match, or there&apos;s a lien nobody mentioned. By then the seller has the money. BC
            Express catches those problems before you pay, not after.
          </p>
        </section>

        <section style={{ marginTop: 72 }}>
          <h2 style={h2}>What you get, in the order you need it</h2>
          {steps.map((s, i) => (
            <div
              key={s.title}
              style={{
                border: `1px solid ${line}`,
                borderRadius: 6,
                padding: '26px 28px',
                marginBottom: 16,
                background: 'rgba(201,150,46,0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, lineHeight: 1.25, margin: 0 }}>
                  {i + 1}. {s.title}
                </h3>
                <span style={{ fontSize: 13, letterSpacing: 1, fontWeight: 700, color: i === 0 ? gold : muted }}>
                  {s.price.toUpperCase()}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 22 }}>
                {s.items.map((item) => (
                  <li key={item} style={{ fontSize: 17, lineHeight: 1.8, opacity: 0.9 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 72 }}>
          <h2 style={h2}>One price, whatever you&apos;re buying</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ border: `1px solid ${line}`, borderRadius: 6, padding: 26 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>Check it</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: gold, fontWeight: 700, margin: '8px 0' }}>
                Free
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: muted }}>
                HIN check, walk-around checklist, seller questions, safe payment tips.
              </div>
            </div>
            <div style={{ border: `1px solid ${gold}`, borderRadius: 6, padding: 26, background: 'rgba(201,150,46,0.08)' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>Close it</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: gold, fontWeight: 700, margin: '8px 0' }}>
                $29.99
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: muted }}>
                All the paperwork for your boat, trailer, motor, or all three, plus everything you need to title
                it.
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 72 }}>
          <h2 style={h2}>Questions</h2>
          {faqs.map((f) => (
            <div key={f.q} style={{ padding: '18px 0', borderBottom: '1px solid rgba(245,241,232,0.12)' }}>
              <h3 style={{ fontSize: 18, margin: '0 0 8px' }}>{f.q}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: muted, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <section
          id="notify"
          style={{
            marginTop: 72,
            padding: 36,
            border: `1px solid ${gold}`,
            borderRadius: 6,
            background: 'rgba(201,150,46,0.07)',
          }}
        >
          <h2 style={{ ...h2, color: gold, fontSize: 26 }}>Opening soon in Florida</h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, margin: '0 0 24px' }}>
            Leave your email and we&apos;ll send you a link the day BC Express opens.
          </p>
          <ExpressSignup />
        </section>
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
