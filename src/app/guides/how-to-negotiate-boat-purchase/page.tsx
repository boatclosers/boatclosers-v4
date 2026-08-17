import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Negotiate a Private Boat Purchase',
  description:
    'How to negotiate a used boat price in a private sale: why you should see the vessel before offering, how to anchor with real comps, and how to use the survey as leverage.',
  alternates: {
    canonical: 'https://www.boatclosers.com/guides/how-to-negotiate-boat-purchase',
  },
  openGraph: {
    type: 'article',
    url: 'https://www.boatclosers.com/guides/how-to-negotiate-boat-purchase',
    title: 'How to Negotiate a Private Boat Purchase',
    description:
      'How to negotiate a used boat price in a private sale, from first contact to closing.',
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
          How to Negotiate a{' '}
          <span style={{ color: gold }}>Private Boat Purchase</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          In a private sale there is no broker smoothing things over, which cuts both
          ways. You keep the commission, and you also own every mistake. The good news
          is that boat negotiation follows a predictable shape, and most of the
          leverage comes from preparation rather than nerve.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          See the boat before you make a real offer
        </h2>
        <p>
          This is the rule that saves people the most money and the most time. Photos
          lie. Not always deliberately, but a wide-angle lens, good light, and a
          careful angle hide a great deal. Gelcoat crazing, soft decks, corrosion,
          water staining in lockers, the smell of a wet bilge, none of it survives an
          in-person visit and none of it shows in a listing.
        </p>
        <p>
          An offer made sight-unseen also gives away your position. Once you have put
          a number on the table, every problem you find afterward looks like buyer's
          remorse rather than legitimate discovery, and the seller has an anchor to
          hold you to.
        </p>
        <p>
          Go look. Bring a flashlight and a moisture meter if you have one. Open every
          locker, lift every hatch, run your hand along the stringers. You are not
          surveying the boat, you are deciding whether it is worth paying a surveyor
          to look at.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The one exception
        </h2>
        <p>
          There is a reason to put a number out before viewing, and it is not about
          the boat. It is about the seller.
        </p>
        <p>
          If a listing has been up a long time, if the seller is evasive about
          questions, or if something feels staged, a conditional written offer is a
          test. A real seller responds with terms. A fictional boat, or a seller
          without the authority to sell it, tends to respond with pressure, urgency,
          or a request for money before anything is verified.
        </p>
        <p>
          Make that offer explicitly contingent on inspection and survey, and never
          send funds outside escrow on the strength of it. You are probing whether the
          deal is real, not committing to it.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Anchor on sold prices, not asking prices
        </h2>
        <p>
          Asking prices tell you what sellers hope for. Sold prices tell you what the
          market pays. Build a short list of comparable hulls, similar years, similar
          hours, similar condition, and find what they actually closed at.
        </p>
        <p>
          Adjust honestly. Engine hours matter enormously. Freshwater versus saltwater
          matters. Recent repower, new canvas, updated electronics, and a documented
          service history all carry real value. A boat that has sat unused for three
          seasons carries real risk.
        </p>
        <p>
          When you make an offer, say why. A number with reasoning attached invites a
          counter. A number with nothing behind it invites a flat no.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Understand what the seller actually wants
        </h2>
        <p>
          Price is not always the binding constraint. A seller carrying slip fees and
          insurance on a boat they no longer use is paying to wait. A seller who has
          already bought the next boat needs to close. A seller who inherited a vessel
          they never wanted wants it gone cleanly.
        </p>
        <p>
          Ask why they are selling and how long it has been listed. Speed, certainty,
          and a clean close are worth money to the right seller, and offering them can
          buy you a better price than grinding on the number alone.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Make the first offer in writing
        </h2>
        <p>
          Verbal numbers on a dock are not offers, they are conversation. A written
          offer states the price, the deposit, the contingency period, who pays for
          haul-out and survey, and a closing date. It signals that you are serious and
          it fixes the terms so they cannot drift.
        </p>
        <p>
          Attach a deposit to it. Nothing separates you from the tire-kickers faster
          than money behind a number, and a deposit held in escrow costs you nothing
          if a written contingency fails.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The survey is your second negotiation
        </h2>
        <p>
          Most private boat deals are negotiated twice. First on price, then again
          after the survey. Experienced buyers know this and do not spend all their
          leverage in round one.
        </p>
        <p>
          If your purchase agreement includes a properly written survey contingency,
          the findings give you a documented, quantified basis to revisit the price.
          That is not bad faith, it is the process working. What you cannot do is
          reopen the price on findings when the agreement never gave you the right to.
          See{' '}
          <Link href="/guides/boat-survey-came-back-bad" style={{ color: gold }}>
            what to do when the survey comes back bad
          </Link>
          .
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Be willing to walk
        </h2>
        <p>
          The strongest position in any boat negotiation belongs to the person who
          does not need this particular boat. There is always another hull. Buyers who
          fall in love before the survey pay more and forgive more than they should.
        </p>
        <p>
          Set your walk-away number before you start and write it down somewhere. When
          the moment comes and the boat is beautiful and the sun is out, that number
          is the only thing standing between you and a decision you regret.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Verify, do not trust
        </h2>
        <p>
          Every step above assumes you are checking rather than believing. Confirm the
          seller owns the boat and can transfer it. Confirm there is no lien. Order
          your own survey. Keep the deposit in escrow. See{' '}
          <Link href="/guides/documents-needed-private-boat-sale" style={{ color: gold }}>
            the documents that make it real
          </Link>
          ,{' '}
          <Link href="/guides/boat-deposit-and-escrow" style={{ color: gold }}>
            why escrow matters
          </Link>
          , and if you are on the other side of the table,{' '}
          <Link href="/guides/seller-due-diligence-boat-sale" style={{ color: gold }}>
            what sellers should be verifying too
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
            An organized negotiation, not a text thread
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers turns the back and forth into a structured record: written
            offers and counters, deposit-backed and time-stamped, with contingencies
            in the agreement and the deposit in escrow. 56 professional documents,
            flat $249, paid only when you are ready to sign.
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
