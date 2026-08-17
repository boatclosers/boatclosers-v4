import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Boat Bill of Sale: What It Must Include to Hold Up',
  description:
    'What a boat bill of sale must contain to be legally valid: hull identification number, purchase price, as-is language, signatures, and when notarization is required.',
  alternates: {
    canonical: 'https://boatclosers.com/guides/boat-bill-of-sale',
  },
  openGraph: {
    type: 'article',
    url: 'https://boatclosers.com/guides/boat-bill-of-sale',
    title: 'Boat Bill of Sale: What It Must Include to Hold Up',
    description:
      'The required elements of a legally valid boat bill of sale.',
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
          Boat Bill of Sale:{' '}
          <span style={{ color: gold }}>What It Must Include to Hold Up</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          The bill of sale is the document that actually transfers ownership. A
          purchase agreement says a sale will happen. The bill of sale says it did.
          Get it wrong and the title office will reject it, or worse, it holds up at
          the counter but not in a dispute.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          The identifying information
        </h2>
        <p>
          Full legal names and addresses for both buyer and seller, not nicknames or
          business shorthand. If a trust, estate, or LLC owns the vessel, the entity
          is the seller and the signer must have authority to sign on its behalf.
          This is where inherited-boat sales most often fail.
        </p>
        <p>
          The vessel itself must be identified by hull identification number, the
          twelve-character HIN on the transom. Year, make, model, and length belong on
          the document too, but the HIN is what makes the boat legally unambiguous.
          Include engine make, model, and serial numbers if they are being sold with
          the vessel, and identify the trailer separately by VIN if one is included.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The price and the date
        </h2>
        <p>
          State the actual purchase price in both numerals and written words. The date
          of sale matters more than people expect, because it establishes when
          liability, insurance responsibility, and the tax obligation transferred.
        </p>
        <p>
          Do not understate the price to reduce sales tax. State agencies compare
          declared values against market data, the buyer inherits the exposure, and it
          undermines the credibility of the document if the sale is ever disputed.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The as-is clause
        </h2>
        <p>
          Most private vessel sales are as-is, where-is, with no warranty express or
          implied. That language protects the seller from claims about problems
          discovered after closing, which, on a used boat, there will be.
        </p>
        <p>
          It protects the buyer too, in a sense: it is the reason the survey happens
          before closing rather than after. An as-is clause is not a license to
          conceal known defects, and a seller who actively hides a material problem
          can still face a fraud claim regardless of what the document says.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Free-and-clear title language
        </h2>
        <p>
          The seller should affirm in writing that the vessel is free of liens and
          encumbrances, and that the seller has the legal right to sell it. If a lien
          exists and is being paid off at closing, say so explicitly and attach the
          release from the lienholder.
        </p>
        <p>
          A buyer who takes delivery on a verbal assurance that the loan is handled
          can end up owning a boat a bank still has a claim against.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Signatures and notarization
        </h2>
        <p>
          Both parties sign and date. Print names beneath the signatures so the
          document is readable years later when it matters.
        </p>
        <p>
          Notarization requirements vary by state, and some states require it only for
          the signature of the seller rather than both. Coast Guard documented vessels
          follow federal requirements instead of the state process entirely. Confirm
          which applies to your vessel before closing day, because discovering you
          need a notary while sitting at a marina on a Saturday is a preventable
          problem.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Copies for both sides
        </h2>
        <p>
          Each party keeps a fully signed original. The buyer needs it to register or
          document the vessel. The seller needs it to prove the boat left their
          ownership on a specific date, which is the document that ends their
          liability for anything that happens on the water afterward.
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
            Generated correctly, every time
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers generates the bill of sale and 55 other professional documents
            from your deal details, with the right variant for your vessel type and
            state. Deposit-backed offers and secure escrow included. Flat $249, paid
            only when you are ready to sign.
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
