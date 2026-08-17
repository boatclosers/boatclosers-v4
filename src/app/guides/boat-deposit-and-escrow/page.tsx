import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Why Every Private Boat Deal Needs a Deposit and Escrow',
  description:
    'How deposits and escrow protect both the buyer and the seller in a private boat sale — what a deposit actually commits, when it is refundable, and why holding funds yourself is a mistake.',
  alternates: {
    canonical: 'https://boatclosers.com/guides/boat-deposit-and-escrow',
  },
  openGraph: {
    type: 'article',
    url: 'https://boatclosers.com/guides/boat-deposit-and-escrow',
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
          Why Every Private Boat Deal Needs a{' '}
          <span style={{ color: gold }}>Deposit and Escrow</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          A private boat sale without a deposit is not a deal. It is two people
          agreeing to keep talking. The deposit is what turns a conversation into a
          transaction — and escrow is what keeps that deposit from becoming the thing
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
          quiet after you have turned away two other people. The deposit prices that
          behavior.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          How much, and who decides
        </h2>
        <p>
          Ten percent is the common figure in private vessel transactions, though the
          number matters less than whether it is meaningful to the buyer. A deposit
          too small to hurt does not commit anyone. On a boat in the mid six figures,
          a token deposit is not a deposit — it is a placeholder.
        </p>
        <p>
          What matters far more than the amount is that the terms are written down
          before the money moves: how much, where it is held, what events make it
          refundable, and how long the seller has to return it.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          When the deposit is refundable
        </h2>
        <p>
          This is where most private deals go wrong. The deposit should be refundable
          when a written contingency fails — most often the survey. If the survey
          turns up material problems the buyer did not know about, and the purchase
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
          A seller holding the buyer's deposit in a personal account creates a
          conflict on both sides. The buyer has handed real money to a stranger with
          nothing but a promise to return it. The seller, if the deal collapses, is
          now personally responsible for producing funds that may already be spent.
        </p>
        <p>
          Escrow removes the conflict entirely. A neutral third party holds the funds
          and releases them only when the written conditions are met. Neither side can
          touch the money unilaterally, which means neither side has to trust the
          other's character — only the terms.
        </p>
        <p>
          Wiring a deposit directly to a seller's personal account is also the single
          most common vector for fraud in private vessel sales. Once those funds
          leave, recovery is difficult and often impossible.
