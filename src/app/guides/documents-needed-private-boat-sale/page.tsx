import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What Documents You Need to Close a Private Boat Sale',
  description:
    'A complete checklist of the documents required to legally close a private boat sale: bill of sale, purchase agreement, title transfer, lien release, and USCG paperwork.',
  alternates: {
    canonical: 'https://www.boatclosers.com/guides/documents-needed-private-boat-sale',
  },
  openGraph: {
    type: 'article',
    url: 'https://www.boatclosers.com/guides/documents-needed-private-boat-sale',
    title: 'What Documents You Need to Close a Private Boat Sale',
    description:
      'A complete checklist of the documents required to legally close a private boat sale.',
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
          What Documents You Need to{' '}
          <span style={{ color: gold }}>Close a Private Boat Sale</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          Selling a boat without a broker is legal in every state. What trips people
          up is the paperwork, and the fact that missing one document can stall a
          closing for weeks or void the transfer entirely.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          The four documents every private boat sale needs
        </h2>

        <h3 style={{ fontSize: 21, marginTop: 32, marginBottom: 8 }}>1. Purchase Agreement</h3>
        <p>
          This is the contract. It states the price, the deposit amount, who pays
          what, and, critically, the contingencies. Without a written purchase
          agreement, a handshake deal gives neither side any recourse when something
          goes wrong. It should be signed before any money changes hands.
        </p>

        <h3 style={{ fontSize: 21, marginTop: 32, marginBottom: 8 }}>2. Bill of Sale</h3>
        <p>
          The bill of sale is the proof of transfer. It names buyer and seller,
          identifies the vessel by hull identification number, states the purchase
          price, and is signed at closing. Many states require it to be notarized
          before the title office will accept it. See{' '}
          <Link href="/guides/boat-bill-of-sale" style={{ color: gold }}>
            what a bill of sale must include to hold up
          </Link>
          .
        </p>

        <h3 style={{ fontSize: 21, marginTop: 32, marginBottom: 8 }}>3. Title or Documentation</h3>
        <p>
          State-titled vessels need the original title, signed over by the seller.
          Vessels registered with the U.S. Coast Guard need a different set of forms
          entirely, and the state title process does not apply. Confirm which category
          your boat falls into before you get to closing, because the paperwork paths
          do not overlap.
        </p>

        <h3 style={{ fontSize: 21, marginTop: 32, marginBottom: 8 }}>4. Lien Release</h3>
        <p>
          If the seller still owes money on the boat, the lender holds a lien. A buyer
          who closes without a written lien release can end up owning a boat the bank
          can still repossess. Get the release in writing from the lienholder, not a
          verbal assurance from the seller.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The documents people forget
        </h2>
        <p>
          Those four are the backbone. But a clean closing usually involves more: a
          survey contingency addendum if the sale depends on inspection results, a
          deposit receipt establishing the funds are held and under what conditions
          they are returned, an as-is acknowledgment, and state-specific tax or
          registration forms.
        </p>
        <p>
          Deals rarely fall apart because someone missed the bill of sale. They fall
          apart because nobody wrote down what happens if the survey turns up a soft
          transom, and then two people who were friendly in June are arguing about a
          deposit in July.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Why the order matters
        </h2>
        <p>
          The sequence protects both sides. Purchase agreement first, so the terms are
          fixed. Deposit into escrow second, so the buyer is committed and the seller
          stops showing the boat. Survey and contingency period third. Then the bill
          of sale, title transfer, and release of funds together at closing. More on{' '}
          <Link href="/guides/boat-deposit-and-escrow" style={{ color: gold }}>
            how deposits and escrow protect both sides
          </Link>
          .
        </p>
        <p>
          Sellers who hand over a signed title before funds clear, and buyers who wire
          money before the lien is released, are the two most common ways a private
          boat deal turns into a lawsuit. If you are handling the whole sale yourself,
          start with our{' '}
          <Link href="/guides/sell-a-boat-without-a-broker" style={{ color: gold }}>
            step-by-step guide to selling without a broker
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
            Every document, already prepared
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers walks a private buyer and seller through the entire
            transaction: deposit-backed offers, secure escrow, and 56 professional
            documents generated and ready to sign. No broker, no commission. Flat
            $249, paid only when you are ready to sign.
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
