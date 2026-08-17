import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Seller Due Diligence: What You Owe the Buyer and What Protects You',
  description:
    'Due diligence is not only the buyer\'s job. What a boat seller must disclose, how to verify your own title and payoff, how to vet a buyer, and what protects you after closing.',
  alternates: {
    canonical: 'https://www.boatclosers.com/guides/seller-due-diligence-boat-sale',
  },
  openGraph: {
    type: 'article',
    url: 'https://www.boatclosers.com/guides/seller-due-diligence-boat-sale',
    title: 'Seller Due Diligence: What You Owe the Buyer and What Protects You',
    description:
      'What a boat seller must disclose, verify, and document before and during a private sale.',
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
          Seller Due Diligence:{' '}
          <span style={{ color: gold }}>What You Owe the Buyer and What Protects You</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          Almost everything written about boat buying assumes the buyer is the only
          one who needs to investigate. That is backwards. A seller who has not done
          their own homework is the one who loses a deal three weeks in, or worse,
          hears from a lawyer six months after closing.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 44 }}>
          Verify your own title before you list
        </h2>
        <p>
          You would be surprised how many sellers discover a problem with their own
          paperwork only after a buyer is standing on the dock with a deposit ready.
          Pull out the title now. Confirm the name on it matches the name you will
          sign with, exactly.
        </p>
        <p>
          If the boat is held by a trust, an estate, or an LLC, confirm who has legal
          authority to sign. Inherited vessels are the single most common source of
          stalled closings, because probate paperwork takes weeks and nobody starts it
          until a buyer is waiting.
        </p>
        <p>
          If your name changed through marriage or divorce, or the title is still in a
          deceased spouse's name, resolve it before you list. These are solvable
          problems with lead time and deal-killers without it.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Know your payoff to the dollar
        </h2>
        <p>
          If there is a loan on the vessel, call the lender and get the exact payoff
          amount, the process for obtaining a lien release, and how long it takes.
          Some lenders release in days. Some take weeks and require the funds to clear
          first.
        </p>
        <p>
          Find this out before you agree to a closing date. A buyer who has arranged
          financing, insurance, and a haul-out around a date you cannot meet is a
          buyer who may walk.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          What you are obligated to disclose
        </h2>
        <p>
          Most private vessel sales are as-is, and that language does real work. But
          as-is does not protect a seller who actively conceals a known material
          defect. Hiding a cracked stringer, a history of sinking, or a known engine
          problem can support a fraud claim regardless of what the bill of sale says.
        </p>
        <p>
          The practical standard is simple: if you know something that would change a
          reasonable buyer's decision, disclose it in writing. Prior damage, major
          repairs, saltwater versus freshwater use, insurance claims, groundings, and
          engine rebuilds all belong on that list.
        </p>
        <p>
          Disclosure requirements vary by state, and some states have specific
          obligations for vessels. Check what applies where you are. But the safest
          posture is not the legal minimum, it is a written record that you told the
          buyer what you knew.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Why disclosure protects the seller
        </h2>
        <p>
          Sellers resist disclosure because it feels like handing the buyer
          ammunition. It is the opposite. A defect you disclose in writing, that the
          buyer acknowledges in writing, is a defect the buyer accepted at the agreed
          price. A defect you stayed quiet about is a lawsuit waiting for the day it
          surfaces.
        </p>
        <p>
          The same logic applies to the survey. When the buyer's surveyor finds
          something you already disclosed, it is a non-event. When they find something
          you hid, the deal usually dies and your credibility with it.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Gather the record before the first showing
        </h2>
        <p>
          Maintenance logs, engine service history, prior surveys, receipts for major
          work, registration, and insurance history. A seller who produces a
          documented history commands a better price and a faster close than one who
          says the boat was always well maintained.
        </p>
        <p>
          This is also a filter. Serious buyers ask for records. The ones who do not
          are usually not serious.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Due diligence on the buyer
        </h2>
        <p>
          You are handing over a vessel worth six figures. Verify who you are handing
          it to. Confirm the buyer's legal name matches the name that will be on the
          bill of sale and the funds. Confirm the funds are real before the boat
          moves.
        </p>
        <p>
          Be alert to the standard fraud patterns. A buyer who offers to overpay and
          asks you to refund the difference is running a scam. A buyer who pressures
          you to skip escrow, or wants to wire directly to your personal account, or
          insists on closing without a survey, deserves a hard look. So does a buyer
          who will not meet in person or view the boat before committing.
        </p>
        <p>
          Never release the vessel or sign over the title before funds have cleared.
          Not a cashier's check, not a wire confirmation screenshot, not a promise.
          Cleared.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          After closing, protect yourself
        </h2>
        <p>
          File the transfer with your state agency or the Coast Guard promptly. Notify
          your insurer and cancel coverage effective the closing date, not before.
          Cancel the registration. Keep signed copies of every document indefinitely.
        </p>
        <p>
          Until the transfer is filed, your name may still be attached to that hull.
          If the new owner has an incident, an environmental discharge, or abandons
          the vessel, the paper trail is what proves it was no longer yours.
        </p>

        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          Verify, do not trust, cuts both ways
        </h2>
        <p>
          The buyer verifies the boat. The seller verifies the buyer and their own
          paperwork. Both sides put what they find in writing before money moves. See{' '}
          <Link href="/guides/documents-needed-private-boat-sale" style={{ color: gold }}>
            the documents a private sale requires
          </Link>
          , what to expect when{' '}
          <Link href="/guides/marine-survey-what-it-covers" style={{ color: gold }}>
            the buyer's surveyor arrives
          </Link>
          , and{' '}
          <Link href="/guides/boat-deposit-and-escrow" style={{ color: gold }}>
            why escrow protects the seller as much as the buyer
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
            A written record, automatically
          </h3>
          <p style={{ marginBottom: 26 }}>
            BoatClosers structures the transaction so disclosures, offers, and
            signatures are documented as they happen. Deposit-backed offers, secure
            escrow, and 56 professional documents generated and ready to sign. No
            broker, no commission. Flat $249, paid only when you are ready to sign.
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
