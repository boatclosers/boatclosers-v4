import type { Metadata } from 'next'
import ExpressSignup from './ExpressSignup'

export const metadata: Metadata = {
  title: 'BC Express: Buy a Boat From a Private Seller for $29.99 | BoatClosers',
  description:
    'BC Express is a $29.99 buyer toolkit for small private boat purchases: walk-around checklist, HIN check, title signing guide, bill of sale, and safe payment tips. Coming soon.',
  alternates: { canonical: 'https://www.boatclosers.com/express' },
  openGraph: {
    title: 'BC Express by BoatClosers: coming soon',
    description:
      'Everything a buyer needs to close a small private boat purchase safely, for $29.99. The seller never has to sign up.',
    url: 'https://www.boatclosers.com/express',
    siteName: 'BoatClosers',
    type: 'website',
  },
}

const stages = [
  {
    title: 'Before you pay',
    items: [
      'What to look for when buying a used boat',
      'Walk-around checklist for hull, engine, and trailer',
      'HIN check to match the boat to its paperwork',
      'Safe payment tips and common scams to avoid',
    ],
  },
  {
    title: 'At the handoff',
    items: [
      'Bill of sale with proper as-is wording',
      'Trailer bill of sale',
      'Title signing guide so nothing gets rejected',
      'Notice of sale reminder for the seller',
    ],
  },
  {
    title: 'After it is yours',
    items: [
      'Pre-filled title application',
      'Document vault for every paper from the deal',
      'New Owner Checklist for registration and first trips',
    ],
  },
]

export default function ExpressPage() {
  return (
    <main className="bg-[#F7F8FA] text-[#1B2430]">
      <section className="bg-[#0E2A47] text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <p className="text-[#C9A227] font-semibold">BC Express by BoatClosers</p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight">
            Buying a boat from a private seller? Close it right for $29.99.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">
            A step-by-step buyer toolkit for smaller private sales. Check the boat, sign the
            right papers, pay safely, and walk away with a clean title. The seller never has
            to create an account.
          </p>
          <div className="mt-10 max-w-xl">
            <ExpressSignup />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold">What you get, in the order you need it</h2>
        <ol className="mt-10 space-y-12">
          {stages.map((stage, i) => (
            <li key={stage.title} className="grid grid-cols-[3rem_1fr] gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#C9A227] font-bold text-[#0E2A47]">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[#0E2A47]">{stage.title}</h3>
                <ul className="mt-4 space-y-3">
                  {stage.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-3 w-3 shrink-0 rounded-sm border-2 border-[#0E2A47]/40"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-[#0E2A47]/10">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold">Express or full BoatClosers?</h2>
          <p className="mt-4 leading-relaxed text-[#1B2430]/80">
            Express is for simpler private purchases where you and the seller have already
            agreed on a price. If you need negotiation, offers and counteroffers, escrow, or
            both parties working in one deal room, full BoatClosers is the better fit. You will
            be able to upgrade from Express to the full platform without paying twice.
          </p>
          <a
            href="/"
            className="mt-6 inline-block font-semibold text-[#0E2A47] underline underline-offset-4 hover:text-[#C9A227] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
          >
            See full BoatClosers
          </a>
        </div>
      </section>
    </main>
  )
}
