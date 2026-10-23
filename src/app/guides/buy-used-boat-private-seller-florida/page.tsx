import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Buy a Used Boat From a Private Seller in Florida',
  description:
    'A step-by-step guide to buying a used boat, trailer, or motor from a private seller in Florida: HIN and lien checks, the inspection, paying safely, the bill of sale, and titling within 30 days.',
  alternates: {
    canonical: 'https://www.boatclosers.com/guides/buy-used-boat-private-seller-florida',
  },
  openGraph: {
    type: 'article',
    url: 'https://www.boatclosers.com/guides/buy-used-boat-private-seller-florida',
    title: 'How to Buy a Used Boat From a Private Seller in Florida',
    description: 'Check it, inspect it, pay safely, and title it right. The private-sale checklist for Florida buyers.',
  },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

export default function Page() {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#0f1b2d}'}</style>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '24px 20px',
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
            fontSize: 'clamp(32px, 6vw, 44px)',
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          How to Buy a Used Boat From a Private Seller{' '}
          <span style={{ color: gold }}>in Florida</span>
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44 }}>
          Most used boats in Florida change hands in a driveway, not at a dealer. That
          can save you thousands, but there is no finance office checking the title, no
          dealer standing behind the paperwork, and nobody to call if the seller turns
          out not to own the boat. Here is the order to do things in, so the problems
          show up before you pay instead of at the tax collector&apos;s counter.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          1. Check the boat before you drive out
        </h2>
        <p>
          Ask the seller for the hull identification number (HIN) before you go look. It is the 12-character number on the starboard side of the transom, and it tells you more than the listing does: who built the boat, the model year, and whether the format is real. A HIN that doesn&apos;t decode, or a model year that doesn&apos;t match the ad, is worth a question before you spend a Saturday driving to see it.
        </p>
        <p>
          Search the builder&apos;s Coast Guard safety recalls too. Open recalls are free to fix but the seller rarely mentions them. Our{' '}
          <Link href="/hin-check" style={{ color: gold }}>
            free HIN check
          </Link>{' '}
          decodes the number, names the builder from Coast Guard records, and lists open recalls and any Coast Guard vessel records in one step.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          2. Make sure the seller can actually sell it
        </h2>
        <p>
          Ask to see the title, and check that the name on it matches the seller&apos;s photo ID. If someone is selling for a friend, a relative, or an estate, stop until the owner is there or has signed a power of attorney. If two owners are listed with &quot;and&quot; between their names, both have to sign.
        </p>
        <p>
          Then look for a lienholder. A Florida title shows any lender on its face, and a loan stays attached to the boat after you pay the seller. If a lender is listed, you need the signed lien release in hand, or you pay the lender directly from a written payoff letter. Our{' '}
          <Link href="/lien-check" style={{ color: gold }}>
            lien check walkthrough
          </Link>{' '}
          covers where to look, including unpaid marina and repair-shop bills.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          3. Ask your questions in writing
        </h2>
        <p>
          Has it ever sunk or had an insurance claim? Do you owe anything on it? Where has it been kept and serviced? Exactly what&apos;s included in the price? Ask by text or email rather than on the phone. A written answer is a record if something turns out not to be true, and sellers tend to be more careful with a buyer who asks this way.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          4. Inspect it in person, and run it
        </h2>
        <p>
          Walk the hull and deck pressing for soft spots, look along the bottom for blisters and patches, and push hard on the lower unit to check the transom doesn&apos;t flex. Start the engine cold, check the water stream from the telltale, and look at the lower unit oil. If it&apos;s milky, water got into the gearcase. On a trailer, check the VIN against its paperwork, the tire date codes, and the wheel bearings.
        </p>
        <p>
          Run it on the water if there is any way to do it. A seller who won&apos;t allow a sea trial, or an inspection by a mechanic, is telling you something. For a larger purchase, hire an accredited marine surveyor. A few hundred dollars is small next to a wet transom or a tired engine.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          5. Pay safely
        </h2>
        <p>
          Never pay before you&apos;ve seen the boat and the original title. Never wire money, send gift cards, or pay a &quot;shipping agent&quot; or an escrow company you didn&apos;t choose yourself. Those are the most common boat-sale scams. A cashier&apos;s check made out to the person named on the title, handed over when you receive the signed title and keys, is the simplest safe way. If the deal needs a deposit held while a survey happens, use a real escrow arrangement.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          6. Sign the right papers
        </h2>
        <p>
          Florida&apos;s rules make the bill of sale do double duty. When it includes the boat&apos;s make, length, propulsion, HIN, Florida as the state of principal use, both parties&apos; names, the buyer&apos;s address and signature, and the date of sale, it works as your temporary registration for 30 days (Florida Statutes s. 328.46). Keep it aboard until you register.
        </p>
        <p>
          The seller signs the transfer section on the back of the title with the price and date, with no cross-outs or white-out. They should also file a notice of sale on the title or on form HSMV 82050 within 30 days, which takes the boat out of their name. A separate bill of sale for the trailer is wise, since Florida titles trailers separately.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          7. Title and register within 30 days
        </h2>
        <p>
          Take the signed title, your bill of sale, your ID, and a completed Application for Certificate of Vessel Title (form HSMV 82040 VS) to any county tax collector&apos;s office. Florida charges a late penalty after 30 days. Trailers weighing 2,000 pounds or more need their own title. Coast Guard documented boats follow a federal transfer through the National Vessel Documentation Center instead, but still register with the county.
        </p>
        <p>
          You pay sales tax when you title: 6% of the price, capped at $18,000 of tax on a boat, plus your county&apos;s surtax on the first $5,000. The tax collector calculates the exact amount, and a price that looks too low for the boat will get questions, so put the real number on the paperwork.
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 }}>
          The short version
        </h2>
        <p>
          Check the HIN and the title before you go. Inspect and run it before you pay. Pay the owner, in a traceable way, only when you get the signed title. Then title and register within 30 days. Almost every bad private boat sale skips one of those four.
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
            Do all of this with BoatClosers Express
          </h3>
          <p style={{ marginBottom: 26 }}>
            Start free with the HIN check, lien check, and seller questions. For $29.99 you
            get a guided inspection with photos and a condition report, a Florida bill of
            sale and state forms filled in for your deal, a pre-filled title application,
            and deadline reminders. Boat, trailer, motor, or all three. The seller never
            has to sign up.
          </p>
          <Link
            href="/express"
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
            Start free
          </Link>
          <p style={{ fontSize: 15, opacity: 0.75, marginTop: 20, marginBottom: 0 }}>
            Negotiating, putting down a deposit, or making the sale depend on a survey?{' '}
            <Link href="/" style={{ color: gold }}>
              Full BoatClosers
            </Link>{' '}
            handles offers, escrow, and closing for $249.
          </p>
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
