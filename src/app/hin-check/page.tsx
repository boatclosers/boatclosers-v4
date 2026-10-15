import type { Metadata } from 'next'
import Link from 'next/link'
import HinChecker from './HinChecker'

export const metadata: Metadata = {
  title: 'Free Boat HIN Check: Decode a Hull Identification Number',
  description:
    'Free HIN decoder for boat buyers. Check that a Hull Identification Number is valid, see the builder code, build date, and model year, and learn what to verify before you pay.',
  alternates: {
    canonical: 'https://www.boatclosers.com/hin-check',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com/hin-check',
    title: 'Free Boat HIN Check | BoatClosers',
    description:
      'Decode any boat HIN in seconds: builder code, build date, and model year. Free, no signup.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

const h2Style = {
  fontFamily: 'Georgia, serif',
  fontSize: 28,
  lineHeight: 1.25,
  margin: '64px 0 16px',
}
const pStyle = { fontSize: 17, lineHeight: 1.75, opacity: 0.9, margin: '0 0 16px' }
const linkStyle = { color: gold }

const steps = [
  {
    title: 'Match the HIN in three places',
    body: 'The HIN on the transom, the title, and the registration should match exactly. A mismatch, a sanded or riveted-over HIN, or a sticker instead of a molded number is a reason to stop.',
  },
  {
    title: 'Check the title and liens with the state',
    body: 'For a state-titled boat, the titling agency in that state can confirm who owns it and whether a lien is recorded. Ask the seller to show you a title in their own name.',
  },
  {
    title: 'If the boat is Coast Guard documented',
    body: (
      <>
        Search the vessel in the Coast Guard&apos;s{' '}
        <a
          href="https://cgmix.uscg.mil/PSIX/PSIXSearch.aspx"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          PSIX vessel search
        </a>
        , and order an abstract of title from the National Vessel Documentation Center to see
        recorded mortgages and ownership history.
      </>
    ),
  },
  {
    title: 'Get a marine survey on anything you are unsure of',
    body: (
      <>
        A HIN tells you what the boat is, not what shape it is in. Read{' '}
        <Link href="/guides/marine-survey-what-it-covers" style={linkStyle}>
          what a marine survey covers
        </Link>{' '}
        before you decide.
      </>
    ),
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
        <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
          Free tool · No signup
        </div>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(32px, 6vw, 44px)',
            lineHeight: 1.15,
            margin: '0 0 16px',
          }}
        >
          Free Boat HIN Check
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 36 }}>
          Enter the 12-character Hull Identification Number to check that it is valid and see the
          builder code, build date, and model year. Do this before you hand over any money.
        </p>

        <HinChecker />

        <h2 style={h2Style}>Where to find the HIN</h2>
        <p style={pStyle}>
          On most boats the HIN is molded or engraved on the upper starboard corner of the transom.
          It also appears on the title and registration. Federal rules require a second, hidden
          copy somewhere on the hull, and a surveyor can help find it if the visible one looks
          tampered with.
        </p>

        <h2 style={h2Style}>What the 12 characters mean</h2>
        <p style={pStyle}>
          The first three characters are the builder&apos;s Manufacturer Identification Code,
          assigned by the U.S. Coast Guard. The next five are the builder&apos;s serial number for
          that hull. On boats built after August 1984, the 9th character is the month the boat was
          built (A for January through L for December), the 10th is the last digit of the year it
          was built, and the last two are the model year.
        </p>

        <h2 style={h2Style}>What a HIN check cannot tell you</h2>
        <p style={pStyle}>
          A valid HIN confirms the number is formatted correctly. It does not show who owns the
          boat, whether money is still owed on it, or whether it has been stolen or damaged. Before
          you pay:
        </p>

        {steps.map((step, i) => (
          <div
            key={step.title}
            style={{
              border: '1px solid rgba(201,150,46,0.35)',
              borderRadius: 6,
              padding: '24px 28px',
              marginBottom: 16,
              background: 'rgba(201,150,46,0.05)',
            }}
          >
            <h3
              style={{
                fontFamily: 'Georgia, serif',
                color: gold,
                fontSize: 21,
                lineHeight: 1.3,
                margin: '0 0 10px',
              }}
            >
              {i + 1}. {step.title}
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0, opacity: 0.9 }}>{step.body}</p>
          </div>
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
            Ready to close the deal?
          </h3>
          <p style={{ marginBottom: 26, fontSize: 17, lineHeight: 1.7 }}>
            BoatClosers walks buyer and seller through offers, deposits, paperwork, and title
            transfer for one flat fee, without a broker.
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
            See How BoatClosers Works
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
