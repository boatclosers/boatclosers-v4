import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'BoatClosers Express: Buy a Boat From a Private Seller the Right Way',
  description:
    'Buying a boat, trailer, or motor from a private seller in Florida? Free HIN check, lien check, and seller questions. Then a guided inspection with a condition report, a Florida bill of sale and state forms filled in for your deal, and a pre-filled title application, all for $29.99.',
  alternates: {
    canonical: 'https://www.boatclosers.com/express',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com/express',
    title: 'BoatClosers Express',
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
      'Lien check: how to find out if a lender still has a claim',
      'Questions to ask the seller before you go look',
      'How to pay safely, and the scams to watch for',
    ],
  },
  {
    title: 'Inspect it',
    price: '$29.99 unlock',
    items: [
      'Guided inspection of the hull, engine, systems, sea trial, motor, and trailer',
      'Mark each item Looks good or Problem, with notes, right from your phone',
      'Red-flag items that mean walk away, called out',
      'Dated photos of the boat and the signed title, saved with your purchase',
      'A condition report PDF to renegotiate the price or ask for repairs',
    ],
  },
  {
    title: 'At the handoff',
    price: 'Included',
    items: [
      'Bill of sale filled in for your deal, with proper as-is wording',
      'Trailer bill of sale when a trailer is included',
      'Florida’s official form HSMV 82050, filled in, plus the seller’s notice of sale',
      'Title signing guide, so nothing gets rejected',
      'Red-flag checks: two sellers on the title, a lien, an out-of-state boat',
    ],
  },
  {
    title: "After it's yours",
    price: 'Included',
    items: [
      'Florida title application (HSMV 82040 VS), pre-filled for you',
      'What to bring to the tax collector, for your exact deal',
      'Email reminders before your 30-day title deadline',
      'Every paper saved in one place, plus one closing packet to print',
    ],
  },
]

const audiences = [
  {
    title: 'First-time buyers',
    text: 'Never bought a boat from a private seller? Every step comes in the order you need it, so you don’t miss a signature on the title, a lien, or the 30-day title deadline.',
  },
  {
    title: 'Cautious buyers',
    text: 'Before you drive out, the free HIN check shows the builder, Coast Guard records, and recalls, and the lien check shows whether a lender still has a claim. All free.',
  },
  {
    title: 'Sellers who want it done right',
    text: 'A wary seller sees a proper Florida bill of sale, a signed payment receipt, and their notice of sale already filled in, so the boat comes out of their name. They never sign up.',
  },
  {
    title: 'Deals with people you know',
    text: 'Buying from a neighbor or a friend? Do the paperwork properly anyway. A clean title transfer protects both of you if something comes up later.',
  },
  {
    title: 'Trailers and motors too',
    text: 'Buying just a trailer or an outboard, or all three together? One price covers it, with the right bill of sale for each.',
  },
]

const faqs = [
  {
    q: 'Does the seller have to sign up?',
    a: 'No. You handle everything. The seller just signs the papers at the handoff.',
  },
  {
    q: 'What does it cost?',
    a: 'Starting is free, including the HIN check, lien check, and seller questions. The guided inspection, condition report, and all the paperwork are $29.99, one price whether you are buying a boat, a trailer, a motor, or all three.',
  },
  {
    q: 'Is this only for Florida?',
    a: 'For now, yes. Florida titling rules are built in, so your paperwork matches what the tax collector expects.',
  },
  {
    q: 'What if my deal needs more?',
    a: 'Express is built for a simple sale: the price is agreed, nothing is held in escrow, and the title is clear. If you need to negotiate, put down a deposit, make the sale depend on a survey or sea trial, finance through a lender, or have both of you sign a purchase agreement, full BoatClosers ($249) handles all of that. If you already paid for Express, start it with the same email and your $29.99 comes off the $249.',
  },
]

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
          BoatClosers Express · Private boat, trailer &amp; motor purchases in Florida
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
          href="/express/start"
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
          Start free
        </a>
        <div style={{ fontSize: 14, color: muted, marginTop: 12 }}>No account needed. Pay $29.99 only when you&apos;re ready to inspect and buy.</div>

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
          <h2 style={h2}>Who it&apos;s for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {audiences.map((a) => (
              <div key={a.title} style={{ border: `1px solid ${line}`, borderRadius: 6, padding: '22px 24px' }}>
                <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 20, lineHeight: 1.3, margin: '0 0 10px' }}>{a.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.65, opacity: 0.9, margin: 0 }}>{a.text}</p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              border: `1px solid ${gold}`,
              borderRadius: 6,
              padding: '20px 24px',
              background: 'rgba(201,150,46,0.07)',
              fontSize: 16,
              lineHeight: 1.65,
            }}
          >
            <b style={{ color: gold }}>Need escrow or a due diligence period?</b> If you want a deposit held by a neutral party, time
            for a survey or sea trial before you&apos;re committed, or financing, use{' '}
            <Link href="/" style={{ color: gold, fontWeight: 700 }}>
              full BoatClosers for $249
            </Link>
            . It brings the seller in, puts your terms in a signed purchase agreement, and runs the deal through closing.
          </div>
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
                <span style={{ fontSize: 13, letterSpacing: 1, fontWeight: 700, color: i < 2 ? gold : muted }}>
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
                HIN check, lien check, seller questions, safe payment tips.
              </div>
            </div>
            <div style={{ border: `1px solid ${gold}`, borderRadius: 6, padding: 26, background: 'rgba(201,150,46,0.08)' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>Close it</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: gold, fontWeight: 700, margin: '8px 0' }}>
                $29.99
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: muted }}>
                Guided inspection and condition report, then all the paperwork for your boat, trailer, motor, or
                all three, plus everything you need to title it.
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 72 }}>
          <h2 style={h2}>Is Express right for your deal?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ border: `1px solid ${line}`, borderRadius: 6, padding: 26 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: gold, marginBottom: 10 }}>Express fits when</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.75, opacity: 0.9 }}>
                <li>You and the seller already agree on the price</li>
                <li>You pay in full at the handoff, with no deposit to hold</li>
                <li>The title is clear, or the lien release is in hand</li>
                <li>You&apos;re buying in Florida</li>
              </ul>
            </div>
            <div style={{ border: `1px solid ${line}`, borderRadius: 6, padding: 26 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: gold, marginBottom: 10 }}>Use full BoatClosers when</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.75, opacity: 0.9 }}>
                <li>You still need to negotiate offers and counteroffers</li>
                <li>You want a deposit held in escrow by a neutral party</li>
                <li>You need a due diligence period: survey, sea trial, or financing before you&apos;re committed</li>
                <li>There&apos;s an unpaid loan the sale has to clear</li>
                <li>You both want a signed purchase agreement</li>
              </ul>
              <Link href="/" style={{ display: 'inline-block', marginTop: 14, color: gold, fontWeight: 700 }}>
                See full BoatClosers, $249
              </Link>
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
          style={{
            marginTop: 72,
            padding: 36,
            border: `1px solid ${gold}`,
            borderRadius: 6,
            background: 'rgba(201,150,46,0.07)',
          }}
        >
          <h2 style={{ ...h2, color: gold, fontSize: 26 }}>Buying in Florida? Start now.</h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, margin: '0 0 24px' }}>
            Check the boat for free today. Unlock the inspection and paperwork when you&apos;re serious about buying.
          </p>
          <a
            href="/express/start"
            style={{ display: 'inline-block', background: gold, color: navy, padding: '14px 32px', borderRadius: 4, fontWeight: 700, textDecoration: 'none' }}
          >
            Start free
          </a>
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
        <div style={{ marginTop: 8 }}>
          <Link href="/privacy" style={{ color: cream }}>Privacy</Link> · <Link href="/sms-terms" style={{ color: cream }}>Text message terms</Link>
        </div>
      </footer>
    </div>
  )
}
