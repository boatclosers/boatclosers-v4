import Link from 'next/link'

// Shared layout for the Buyer's Guide and Seller's Guide pages.
// Light, easy-to-read page with a sticky bar that always offers a way back
// into BoatClosers to start a deal.

export type GuideStep = {
  id: string
  title: string
  body: string[]
  inApp: string
  links?: { href: string; label: string }[]
}

const navy = '#08152e'
const brass = '#b8863a'
const sand = '#f5f0e8'
const paper = '#fffdf9'
const mist = '#ddd5c6'
const slate = '#44586d'
const serif = "Georgia, 'Times New Roman', serif"
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif"

export default function RoleGuide({
  role,
  title,
  intro,
  steps,
}: {
  role: 'buyer' | 'seller'
  title: string
  intro: string
  steps: GuideStep[]
}) {
  const startHref = `/?start=${role}`
  const startLabel = role === 'buyer' ? 'Start as Buyer' : 'Start as Seller'
  const other =
    role === 'buyer'
      ? { href: '/sellers-guide', label: "Selling instead? Read the Seller's Guide" }
      : { href: '/buyers-guide', label: "Buying instead? Read the Buyer's Guide" }

  const cta = (big?: boolean) => (
    <Link
      href={startHref}
      style={{
        display: 'inline-block',
        background: brass,
        color: navy,
        padding: big ? '14px 30px' : '9px 16px',
        borderRadius: 4,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: big ? 16 : 13.5,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {startLabel} — free
    </Link>
  )

  return (
    <div style={{ background: sand, minHeight: '100vh', color: navy }}>
      {/* Sticky bar: always a way back to BoatClosers */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: navy,
          borderBottom: `1px solid rgba(184,134,58,0.3)`,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', minWidth: 0 }}>
            <div style={{ color: '#e0c074', fontFamily: serif, fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
              ← BoatClosers
            </div>
          </Link>
          {cta()}
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 72px' }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 12,
            letterSpacing: 3,
            color: brass,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {role === 'buyer' ? "Buyer's Guide" : "Seller's Guide"}
        </div>
        <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 38, lineHeight: 1.18, margin: '12px 0 16px' }}>
          {title}
        </h1>
        <p style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.75, color: slate, margin: '0 0 28px' }}>{intro}</p>

        {/* Table of contents */}
        <nav
          aria-label="Steps"
          style={{
            background: paper,
            border: `1px solid ${mist}`,
            borderLeft: `3px solid ${brass}`,
            borderRadius: 8,
            padding: '18px 22px',
            marginBottom: 44,
          }}
        >
          <div style={{ fontFamily: sans, fontSize: 12, letterSpacing: 2, color: brass, fontWeight: 700, marginBottom: 10 }}>
            THE {steps.length} STEPS
          </div>
          <ol style={{ margin: 0, paddingLeft: 22, fontFamily: sans, fontSize: 15.5, lineHeight: 1.9 }}>
            {steps.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} style={{ color: navy }}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {steps.map((s, i) => (
          <section key={s.id} id={s.id} style={{ marginBottom: 40, scrollMarginTop: 72 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: navy,
                  color: '#e0c074',
                  fontFamily: serif,
                  fontSize: 17,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateY(4px)',
                }}
              >
                {i + 1}
              </span>
              <h2 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, lineHeight: 1.25, margin: 0 }}>{s.title}</h2>
            </div>
            <div style={{ paddingLeft: 48 }}>
              {s.body.map((p, j) => (
                <p key={j} style={{ fontFamily: sans, fontSize: 16.5, lineHeight: 1.75, color: '#24364a', margin: '14px 0 0' }}>
                  {p}
                </p>
              ))}
              <div
                style={{
                  marginTop: 16,
                  background: paper,
                  border: `1px solid ${mist}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: sans,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: navy,
                }}
              >
                <span style={{ fontWeight: 700, color: brass }}>In BoatClosers: </span>
                {s.inApp}
              </div>
              {s.links && s.links.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
                  {s.links.map((l) => (
                    <Link key={l.href} href={l.href} style={{ fontFamily: sans, fontSize: 14.5, color: brass, fontWeight: 600 }}>
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* A soft nudge halfway through */}
            {i === Math.floor(steps.length / 2) - 1 && (
              <div
                style={{
                  margin: '36px 0 0',
                  background: navy,
                  color: '#fff',
                  borderRadius: 10,
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.6, maxWidth: 420 }}>
                  BoatClosers walks you through every one of these steps in a shared deal room — for a flat $249.
                </div>
                {cta()}
              </div>
            )}
          </section>
        ))}

        {/* Finish */}
        <div
          style={{
            marginTop: 52,
            background: navy,
            color: '#fff',
            borderRadius: 12,
            padding: '32px 28px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontFamily: serif, fontWeight: 500, fontSize: 27, margin: '0 0 10px' }}>
            Ready to run your deal this way?
          </h2>
          <p style={{ fontFamily: sans, fontSize: 15.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', margin: '0 auto 22px', maxWidth: 480 }}>
            Open a free deal room, invite the other side, and follow these steps in order. Pay $249 only when you are ready to sign.
          </p>
          {cta(true)}
          <div style={{ marginTop: 16 }}>
            <Link href="/#preview" style={{ fontFamily: sans, fontSize: 14, color: '#e0c074' }}>
              See a sample deal first
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: '8px 22px', fontFamily: sans, fontSize: 15 }}>
          <Link href={other.href} style={{ color: navy, fontWeight: 600 }}>
            {other.label} →
          </Link>
          <Link href="/faq" style={{ color: navy }}>
            Common questions
          </Link>
          <Link href="/guides" style={{ color: navy }}>
            All guides
          </Link>
          <Link href="/" style={{ color: navy }}>
            BoatClosers home
          </Link>
        </div>

        <p style={{ fontFamily: sans, fontSize: 12.5, color: slate, lineHeight: 1.6, marginTop: 32 }}>
          This guide is general information, not legal advice. Requirements vary by state; details here reflect Florida practice where noted.
          BoatClosers is an online closing platform, not a brokerage, and never holds your money.
        </p>
      </main>
    </div>
  )
}
