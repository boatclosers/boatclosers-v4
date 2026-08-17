import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Why Every Private Boat Deal Needs a Deposit and Escrow',
  description:
    'How deposits and escrow protect both the buyer and the seller in a private boat sale, when a deposit is refundable, and why holding funds yourself is a mistake.',
  alternates: {
    canonical: 'https://www.boatclosers.com/guides/boat-deposit-and-escrow',
  },
  openGraph: {
    type: 'article',
    url: 'https://www.boatclosers.com/guides/boat-deposit-and-escrow',
    title: 'Why Every Private Boat Deal Needs a Deposit and Escrow',
    description:
      'How deposits and escrow protect both sides in a private boat sale.',
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
          Why Every Private Boat Deal Needs a{' '}
          <span style={{ color: gold }}>Deposit and Escrow</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          A private boat sale without a deposit is not a deal. It is two people
          agreeing to keep talking. The deposit is what turns a conversation into a
          transaction, and escrow is what keeps that deposit from becoming the thing
          you end up fighting over.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          What a deposit actually does
        </h2>
        <p>
          The deposit is not a down payment. It is proof of commitment. When a buyer
          puts money down, three things happen at once: the buyer stops shopping, the
          seller stops showing the boat, and both sides now have something at stake if
          they walk away without cause.
        </p>
        <p>
          That last part is the whole point. Before a deposit, either party can vanish
          at no cost. A seller can take a better offer on Thursday. A buyer can go
          quiet after two other prospects have already been turned away. The deposit
          prices that behavior.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          How much, and who decides
        </h2>
        <p>
          Ten percent is the common figure in private vessel transactions, though the
          number matters less than whether it is meaningful to the buyer. A deposit
          too small to hurt does not commit anyone. On a boat in the mid six figures,
          a token deposit is not a deposit. It is a placeholder.
        </p>
        <p>
          What matters far more than the amount is that the terms are written down
          before the money moves: how much, where it is held, what events make it
          refundable, and how long the seller has to return it. Those terms belong in
          the purchase agreement, which is the first of the{' '}
          <Link href="/guides/documents-needed-private-boat-sale" style={{ color: gold }}>
            documents a private sale requires
          </Link>
          .
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          When the deposit is refundable
        </h2>
        <p>
          This is where most private deals go wrong. The deposit should be refundable
          when a written contingency fails, most often the survey. If the survey turns
          up material problems the buyer did not know about, and the purchase
          agreement says the buyer may withdraw on an unsatisfactory survey, the money
          comes back.
        </p>
        <p>
          It should not be refundable when the buyer simply changes their mind. That
          distinction has to exist on paper before the survey happens. Written after
          the fact, it is just an argument.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Why the seller should never hold the money
        </h2>
        <p>
          A seller who holds the deposit in a personal account creates a conflict on
          both sides. The buyer has handed real money to a stranger with nothing but a
          promise to return it. The seller, if the deal collapses, is now personally
          responsible for producing funds that may already be spent.
        </p>
        <p>
          Escrow removes the conflict entirely. A neutral third party holds the funds
          and releases them only when the written conditions are met. Neither side can
          touch the money unilaterally, which means neither side has to trust the
          character of the other. Only the terms.
        </p>
        <p>
          Wiring a deposit directly into a personal account is also the single most
          common vector for fraud in private vessel sales. Once those funds leave,
          recovery is difficult and often impossible.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The sequence that protects both sides
        </h2>
        <p>
          Purchase agreement signed first, with the deposit amount and contingencies
          stated. Deposit into escrow second. Survey and inspection during the
          contingency window. Then, at closing, the balance funds, the{' '}
          <Link href="/guides/boat-bill-of-sale" style={{ color: gold }}>
            bill of sale
          </Link>
          , and the title transfer all move together, and the escrow releases.
        </p>
        <p>
          Deals that follow that order rarely end badly. Deals that skip a step
          usually end with one person holding money and the other holding nothing. For
          the whole process from listing to closing, see{' '}
          <Link href="/guides/sell-a-boat-without-a-broker" style={{ color: gold }}>
            how to sell a boat privately without a broker
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
            Deposit-backed offers, built in
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers structures the entire private transaction: deposit-backed
            offers, secure escrow, and 56 professional documents generated and ready
            to sign. No broker, no commission. Flat $249, paid only when you are ready
            to sign.
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
