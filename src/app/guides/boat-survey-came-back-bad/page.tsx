import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What to Do When a Boat Survey Comes Back Bad',
  description:
    'Your survey found problems. How to read the findings, decide what matters, renegotiate the price, request repairs, or walk away and get your deposit back.',
  alternates: {
    canonical: 'https://www.boatclosers.com/guides/boat-survey-came-back-bad',
  },
  openGraph: {
    type: 'article',
    url: 'https://www.boatclosers.com/guides/boat-survey-came-back-bad',
    title: 'What to Do When a Boat Survey Comes Back Bad',
    description:
      'How to read bad survey findings and decide whether to renegotiate, repair, or walk.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

export default function Page() {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            style={{
              color: cream,
              textDecoration: 'none',
              fontSize: 15,
              opacity: 0.85,
            }}
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

      <article
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '64px 24px 80px',
          fontSize: 18,
          lineHeight: 1.75,
        }}
      >
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 44,
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          What to Do When a{' '}
          <span style={{ color: gold }}>Boat Survey Comes Back Bad</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          First, breathe. Almost every used boat survey comes back with findings, and
          most of them are not deal-enders. The question is not whether the report has
          problems on it. The question is which ones are structural, what they cost,
          and what your purchase agreement lets you do about it.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          Sort the findings before you react
        </h2>
        <p>
          A twenty-page report with sixty items looks catastrophic until you sort it.
          Most surveyors group findings by urgency, but the categories that actually
          matter to your decision are different.
        </p>
        <p>
          Structural and safety items come first: hull integrity, delamination, soft
          stringers or transom, core saturation, through-hull failures, fuel system
          problems, and anything the surveyor flags as unsafe to operate. These are
          expensive, they are often worse than they look once opened up, and they are
          legitimate grounds to renegotiate or walk.
        </p>
        <p>
          Mechanical items are next: engine compression, transmission, steering,
          electrical. Expensive but knowable. A quote from a yard turns these into a
          number you can negotiate against.
        </p>
        <p>
          Then there is the long tail: missing flares, a corroded battery terminal, a
          cracked hatch dog, worn hoses. On a fifteen-year-old boat this list is
          always long and it is not a reason to panic. Budget a few thousand and move
          on.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Get numbers before you make a move
        </h2>
        <p>
          Do not go back to the seller with a survey report and a feeling. Go back
          with quotes. Call a yard, get written estimates on the significant items,
          and total them.
        </p>
        <p>
          This does two things. It tells you whether the boat is still worth buying at
          any price, and it converts an emotional conversation into an arithmetic one.
          A seller who will not respond to a vague complaint will often respond to a
          repair quote.
        </p>
        <p>
          Ask your surveyor which items they would prioritize if the boat were theirs.
          A good surveyor will tell you plainly, and that conversation is worth more
          than the written report.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Your four options
        </h2>
        <p>
          <strong>Proceed as agreed.</strong> The findings are routine, the numbers are
          small, and the price already reflected the age of the vessel. Close and fix
          things over the first season.
        </p>
        <p>
          <strong>Renegotiate the price.</strong> The most common outcome. You present
          the quotes, you propose a reduction, and you meet somewhere. Sellers
          generally know a second buyer will order a second survey and find the same
          things.
        </p>
        <p>
          <strong>Require repairs before closing.</strong> Useful when the work is
          specialized or when you want it done by a yard the seller already has a
          relationship with. The risk is timing and quality. If you go this route,
          specify who does the work, what standard it must meet, and that you get to
          inspect it before funds release.
        </p>
        <p>
          <strong>Withdraw.</strong> Sometimes the right answer. A boat with structural
          problems can consume more than its purchase price. Walking away from a
          deposit-secured deal on a written survey contingency is not a failure, it is
          the contingency working exactly as designed.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Whether you get your deposit back
        </h2>
        <p>
          This comes down entirely to what the purchase agreement says, written before
          the survey happened. If it states that the buyer may withdraw on an
          unsatisfactory survey within a defined contingency window, and you are inside
          that window, the deposit should be returned.
        </p>
        <p>
          If the agreement says nothing about the survey, you are in a negotiation
          without leverage and possibly a dispute. This is precisely why the
          contingency has to be written down before any money moves. See{' '}
          <Link href="/guides/boat-deposit-and-escrow" style={{ color: gold }}>
            how deposits and escrow work
          </Link>
          .
        </p>
        <p>
          Notice matters too. Most contingency clauses require the buyer to give
          written notice within the window. Do not let the window lapse while you are
          gathering quotes. If you need more time, ask for a written extension.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          How to approach the seller
        </h2>
        <p>
          Send the relevant survey excerpts and the repair quotes. Be specific about
          which items you are raising and why. A seller who receives a targeted,
          documented request will usually engage. A seller who receives a demand for a
          large discount with no supporting detail will usually dig in.
        </p>
        <p>
          Keep it in writing. Dock conversations get remembered differently by each
          side a week later, and if this ends in a deposit dispute the written record
          is what matters.
        </p>
        <p>
          Expect the seller to push back on items that are normal for the age of the
          vessel. They are often right. Focus your leverage on the structural and
          mechanical findings, not the flare kit.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          If you are the seller
        </h2>
        <p>
          A survey that surfaces something you already disclosed is a non-event. A
          survey that surfaces something you concealed usually ends the deal. Anything
          found now will be found again by the next buyer's surveyor, so factor that
          into how hard you hold the line. See{' '}
          <Link href="/guides/seller-due-diligence-boat-sale" style={{ color: gold }}>
            what sellers owe buyers and what protects them
          </Link>
          .
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The lesson for next time
        </h2>
        <p>
          Everything above is easier when the contingency was written into the
          agreement before the deposit moved. Written in advance, a bad survey is a
          negotiation with defined options. Not written in advance, it is a fight. See{' '}
          <Link href="/guides/marine-survey-what-it-covers" style={{ color: gold }}>
            what a survey covers
          </Link>{' '}
          and{' '}
          <Link href="/guides/documents-needed-private-boat-sale" style={{ color: gold }}>
            the documents that should be in place first
          </Link>
          .
        </p>

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
            The contingency, in writing, before the money moves
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers puts the survey contingency in the purchase agreement, holds
            the deposit in escrow until the window closes, and keeps the renegotiation
            organized and documented. Deposit-backed offers and 56 professional
            documents. Flat $249, paid only when you are ready to sign.
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
            Start Your Deal
          </Link>
        </div>
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
