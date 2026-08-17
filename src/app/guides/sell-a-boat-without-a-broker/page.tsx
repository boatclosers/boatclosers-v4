import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Sell a Boat Privately Without a Broker',
  description:
    'A step-by-step guide to selling your boat privately: pricing, listing, vetting buyers, handling the survey, and closing the transaction legally without paying a broker commission.',
  alternates: {
    canonical: 'https://boatclosers.com/guides/sell-a-boat-without-a-broker',
  },
  openGraph: {
    type: 'article',
    url: 'https://boatclosers.com/guides/sell-a-boat-without-a-broker',
    title: 'How to Sell a Boat Privately Without a Broker',
    description:
      'A step-by-step guide to selling your boat privately without paying a broker commission.',
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
          How to Sell a Boat Privately{' '}
          <span style={{ color: gold }}>Without a Broker</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          Selling your own boat is legal in every state, and on a vessel worth a few
          hundred thousand dollars it keeps a great deal of money in your pocket. What
          a broker actually provides is structure, and structure is something you can
          put in place yourself.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          What you are really replacing
        </h2>
        <p>
          A broker does four things worth paying for: they price the boat against real
          comparable sales, they filter serious buyers from tire-kickers, they keep
          the negotiation orderly, and they make sure the paperwork closes correctly.
          The marketing is the smallest part of the job, though it is the part most
          people assume they are buying.
        </p>
        <p>
          A ten percent commission on a three hundred thousand dollar boat is thirty
          thousand dollars. Handled deliberately, each of those four functions can be
          covered for a fraction of that.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Step one: price it against actual sales
        </h2>
        <p>
          Asking prices are not data. Sold prices are. Look at what comparable hulls
          in comparable condition actually closed for, not what similar boats are
          currently listed at, because listings that have sat for eight months are
          priced wrong by definition.
        </p>
        <p>
          Account honestly for engine hours, survey history, and whether major systems
          are original. A boat priced ten percent over the market will sit, and a boat
          that sits gets stale. Buyers notice listing age and read it as a problem.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Step two: document the vessel before you list it
        </h2>
        <p>
          Gather the title or Coast Guard documentation, maintenance records, prior
          surveys, engine service history, and any outstanding lien information before
          the first showing. Sellers who scramble for paperwork after accepting an
          offer are the ones whose deals stall for weeks.
        </p>
        <p>
          If there is a lien on the boat, contact the lender now and find out exactly
          what their payoff and release process requires. That single phone call
          prevents the most common closing delay in private vessel sales.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Step three: separate real buyers from browsers
        </h2>
        <p>
          A serious buyer asks about survey scheduling, engine hours, and whether the
          boat has been in salt or fresh water. A browser asks whether you would take
          half. The fastest filter is a written offer with a deposit attached, because
          people who are not serious will not put money behind a number.
        </p>
        <p>
          Be equally cautious in the other direction. Buyers who want to close
          immediately without a survey, who propose overpayment schemes, or who push
          hard to wire funds outside a neutral holding account are the two most common
          fraud patterns in this market.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Step four: put the offer in writing
        </h2>
        <p>
          Verbal agreements on a dock feel efficient and are worth nothing. A written
          purchase agreement fixes the price, the deposit, the contingency period, who
          pays for haul-out and survey, and what happens if the survey comes back
          poorly. Every one of those becomes a dispute later if it is not settled
          first.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Step five: expect a survey, and expect a renegotiation
        </h2>
        <p>
          Any buyer financing or insuring the vessel will require a survey, and most
          serious cash buyers will order one anyway. Surveys almost always find
          something. That is normal, and it is not the deal collapsing.
        </p>
        <p>
          What matters is that the purchase agreement already defines what happens
          next: whether the buyer may withdraw, request a price adjustment, or ask for
          repairs before closing. When that path is written down in advance, the
          post-survey conversation is a negotiation. When it is not, it is an
          argument.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Step six: close in the right order
        </h2>
        <p>
          At closing, the balance of funds, the signed bill of sale, the lien release,
          and the title transfer all move together. Never sign over a title before
          funds have cleared, and never accept a personal check as final payment on a
          vessel of any real value.
        </p>
        <p>
          After closing, file the transfer with your state agency or the Coast Guard,
          cancel your insurance and registration, and keep a signed copy of every
          document. The paperwork is what proves the boat is no longer your liability.
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
            The structure of a broker-assisted deal, without the commission
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers guides a private buyer and seller through every step above:
            deposit-backed offers, organized negotiation, secure escrow, and 56
            professional documents generated and ready to sign. Flat $249, paid only
            when you are ready to sign.
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
