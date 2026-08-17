import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What a Marine Survey Covers and What It Costs',
  description:
    'What a marine surveyor actually inspects, what a survey costs, how long it takes, the difference between a pre-purchase and insurance survey, and how to read the report.',
  alternates: {
    canonical: 'https://www.boatclosers.com/guides/marine-survey-what-it-covers',
  },
  openGraph: {
    type: 'article',
    url: 'https://www.boatclosers.com/guides/marine-survey-what-it-covers',
    title: 'What a Marine Survey Covers and What It Costs',
    description:
      'What a marine surveyor inspects, what it costs, and how to read the report.',
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
          What a Marine Survey{' '}
          <span style={{ color: gold }}>Covers and What It Costs</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          The survey is the single most important piece of due diligence in a boat
          purchase, and the one most buyers understand least. It is not a formality,
          it is not the seller's job to arrange, and it is not something to skip
          because the boat looks clean at the dock.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          Who orders it and who pays
        </h2>
        <p>
          The buyer orders the survey and the buyer pays for it. That is not a
          courtesy, it is the point. A surveyor works for whoever hires them, and a
          report commissioned by the seller is a report written for the seller. If a
          seller offers you a recent survey they paid for, read it, but order your
          own anyway.
        </p>
        <p>
          Choose the surveyor yourself. If the seller recommends someone, that is a
          reason to look elsewhere, not a shortcut. Look for accreditation through
          SAMS or NAMS, ask how many vessels of your type they survey a year, and ask
          for a sample report before you book.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          What it costs
        </h2>
        <p>
          Pricing is usually by length. Expect roughly 20 to 30 dollars per foot for a
          pre-purchase survey, so a 35-foot vessel typically runs 700 to 1,000 dollars,
          and larger yachts scale from there. Rates vary by region and by how
          specialized the vessel is.
        </p>
        <p>
          The haul-out is separate and is usually the buyer's cost as well, commonly a
          few hundred dollars depending on the yard and the size of the boat. Engine
          surveys, oil analysis, and sea trial time may be billed separately or by a
          different specialist. Budget for the total, not just the survey line item.
        </p>
        <p>
          On a boat in the six figures, this is a rounding error against the purchase
          price and the cheapest insurance you will ever buy. Buyers who skip it to
          save a thousand dollars are the ones who discover a soft transom or a
          blistered hull after the money is gone.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          What the surveyor actually inspects
        </h2>
        <p>
          A proper pre-purchase survey is a systematic condition assessment, not a
          walkthrough. The hull is examined out of the water, sounded for
          delamination and moisture, and checked for blistering, prior repairs, and
          keel or strut issues. Through-hulls, seacocks, shafts, rudders, and running
          gear all get inspected.
        </p>
        <p>
          Structural elements come next: stringers, bulkheads, the transom, and the
          deck, with moisture readings taken where core saturation is likely.
          Electrical systems are checked for corrosion, improper wiring, and
          overloaded circuits. Plumbing, fuel systems, steering, and safety equipment
          are all covered.
        </p>
        <p>
          Engines are a separate discipline. Many general surveyors will note obvious
          problems but recommend a dedicated engine survey with compression testing
          and oil analysis, particularly on diesels. On a boat where the engines
          represent a large share of the value, order both.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Sea trial and haul-out
        </h2>
        <p>
          A survey without a haul-out is not a pre-purchase survey. Everything below
          the waterline is invisible in the slip, and that is where the expensive
          problems live. A survey without a sea trial misses how the vessel actually
          performs under load, whether it tracks, and how the engines behave at
          temperature.
        </p>
        <p>
          Schedule both. Expect the whole process to take most of a day for a mid-size
          vessel, and expect the written report a few days after.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Pre-purchase versus insurance survey
        </h2>
        <p>
          They are not the same document. A pre-purchase survey is a full condition
          and valuation assessment written for a buyer deciding whether to proceed. An
          insurance survey is narrower, focused on whether the vessel is an acceptable
          risk and whether required safety equipment is present.
        </p>
        <p>
          A pre-purchase survey will usually satisfy an insurer. An insurance survey
          will not tell you what you need to know before buying. If your lender or
          insurer asks for a survey, order the pre-purchase version and it covers both
          needs.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          How to read the report
        </h2>
        <p>
          Findings are typically sorted by urgency. Items flagged as safety-related or
          required for compliance need addressing before the vessel is used.
          Recommendations are things that should be corrected in the near term.
          Observations are noted conditions that are not currently problems.
        </p>
        <p>
          Almost every used boat produces a list. A long list is not automatically a
          bad boat, and a short list on an old vessel is a reason to wonder how
          thorough the surveyor was. What matters is the severity and the cost of the
          items flagged, not the count.
        </p>
        <p>
          The report will also state a fair market value and often a replacement
          value. Lenders and insurers care about these numbers. So should you, because
          a survey that values the boat well below your agreed price is leverage in a
          renegotiation.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The survey has to be written into the deal first
        </h2>
        <p>
          None of this protects you unless the purchase agreement says what happens
          when the survey finds something. Before your deposit moves, the agreement
          should state the contingency window, who pays for haul-out and sea trial,
          and whether you may withdraw, request a price adjustment, or require repairs
          based on the findings.
        </p>
        <p>
          Written in advance, a bad survey is a negotiation. Not written in advance, it
          is a fight over a deposit. See{' '}
          <Link href="/guides/boat-deposit-and-escrow" style={{ color: gold }}>
            how deposits and escrow protect both sides
          </Link>{' '}
          and the{' '}
          <Link href="/guides/documents-needed-private-boat-sale" style={{ color: gold }}>
            documents a private sale requires
          </Link>
          . If you are selling rather than buying, the{' '}
          <Link href="/guides/sell-a-boat-without-a-broker" style={{ color: gold }}>
            full private sale process
          </Link>{' '}
          covers what to expect when the buyer's surveyor arrives.
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
            Verify, do not trust
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers does not survey boats. It makes sure the survey happens at the
            right point in the deal, with the contingency in writing and the deposit
            held in escrow until the findings are in. Deposit-backed offers, organized
            negotiation, and 56 professional documents. Flat $249, paid only when you
            are ready to sign.
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
