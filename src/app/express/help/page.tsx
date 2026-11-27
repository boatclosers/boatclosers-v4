import type { Metadata } from 'next'
import WatchVideo from '@/components/WatchVideo'

// How-to-use guide for My Boat Closing (served at myboatclosing.com/help and /express/help).
// Facts must match the My Boat Closing landing page (price, what's included, limits).

const URL = 'https://myboatclosing.com/help'
const TITLE = 'How My Boat Closing Works: A Step-by-Step Help Guide'
const DESC =
  'How to close a simple private boat purchase with My Boat Closing: the free HIN check and walk-around, your state’s bill of sale, title signing, safe payment, the handoff record and titling afterward.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'article', url: URL, title: TITLE, description: DESC },
}

type Sec = { h: string; paras?: string[]; list?: string[] }

const SECTIONS: Sec[] = [
  {
    h: 'Who it’s for',
    paras: [
      'Buyers in an everyday private sale: a skiff, bay boat, pontoon or center console, usually under $50,000, where you’ve agreed on a price (or are close) and want the sale organized and done right. No escrow, no survey period, no broker.',
      'Over $50,000, with a deposit over $1,000, a survey period or financing, use full BoatClosers so a neutral party holds the money. Everything you entered moves over, and your $29.99 comes off the $249.',
    ],
  },
  {
    h: '1. Check the boat (free)',
    list: [
      'HIN check, no signup: the builder, the real model year, any recalls and Coast Guard records. Compare it to the listing and the title.',
      'A quick walk-around: a dozen things to look at before you make an offer, saved with your notes.',
      'Questions for the seller that bring out what the listing left out. We can email them for you.',
      'How to check for a loan on the boat, and how to hand over money without getting burned.',
      'Want to go deeper on condition? My Boat Inspector (myboatinspector.com) gives you a guided walkthrough, sea trial and written report.',
    ],
  },
  {
    h: '2. Close it right ($29.99)',
    list: [
      'Your state’s own bill of sale where it publishes one, with every value filled in or printed for you to copy. Every Florida form is filled in for you.',
      'How to sign the title, step by step for how the boat is titled: who signs, where, and what gets a title rejected.',
      'Title photo check: snap the seller’s title before you pay and we read it for problems.',
      'Payment receipt and handoff record: the seller signs that they’re paid, with keys, manuals and what’s included, dated, with photos.',
      'Gave a deposit already? You get a free deposit receipt you both sign.',
      'A boat, trailer and motor in the same sale is still one price.',
    ],
  },
  {
    h: '3. Sign at the handoff',
    list: [
      'Papers are printed and signed in ink. Print from your phone at home, on the seller’s Wi-Fi printer, or at a UPS Store, FedEx Office or Staples. The app shows every option and finds the nearest print shop.',
      'The seller doesn’t sign up. You run it from your phone, and we can email the seller their copy.',
      'Pay at the moment the signed title and bill of sale change hands.',
    ],
  },
  {
    h: '4. After it’s yours',
    list: [
      'Titling in your state: which office, what to bring, and in Florida, your title application pre-filled.',
      'Email and calendar reminders before your title is due.',
      'Your Boat File: every paper and a starter boat log in one download, ready for the day you sell.',
      'Keep the boat’s history going in My Boat Logs (myboatlogs.com).',
    ],
  },
  {
    h: 'Where it works',
    paras: [
      'All 50 states. Florida forms are filled in for you. Elsewhere you get your state’s own bill of sale where it publishes one, and a guide to titling there.',
    ],
  },
  {
    h: 'What it isn’t',
    paras: [
      'My Boat Closing is part of BoatClosers. We’re not a party to your sale and don’t give legal advice. The walk-around and title check help you spot problems; they’re not a marine survey or a title search.',
    ],
  },
]

const navy = '#13233a'
const gold = '#b8863a'

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to close a private boat purchase with My Boat Closing',
    description: DESC,
    url: URL,
    step: SECTIONS.filter((s) => /^\d\./.test(s.h)).map((s) => ({ '@type': 'HowToStep', name: s.h.replace(/^\d\.\s*/, '') })),
  }
  return (
    <div style={{ background: '#f7f8fb', minHeight: '100vh', color: navy }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ borderBottom: '1px solid #e2e6ee', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/express" style={{ color: navy, fontWeight: 800, fontSize: 18, textDecoration: 'none' }}>My Boat Closing</a>
          <a href="/express/start" style={{ background: gold, color: '#fff', fontWeight: 700, padding: '10px 18px', borderRadius: 10, textDecoration: 'none' }}>Check a HIN free</a>
        </div>
      </header>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 60px' }}>
        <p style={{ color: gold, fontWeight: 700, letterSpacing: 1, fontSize: 13, textTransform: 'uppercase', margin: 0 }}>Help guide</p>
        <h1 style={{ fontSize: 38, lineHeight: 1.1, margin: '10px 0 0' }}>How My Boat Closing works</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: '#3b4a5e', marginTop: 16 }}>
          Check the boat for free, then close the purchase with the right papers, signed the right way, and finish the titling without a second trip.
        </p>
        <div style={{ marginTop: 18 }}>
          <WatchVideo video="myBoatClosing" label="Watch the walkthrough video (5 min)" />
        </div>
        {SECTIONS.map((s) => (
          <section key={s.h} style={{ marginTop: 34 }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>{s.h}</h2>
            {s.paras?.map((p) => (
              <p key={p} style={{ fontSize: 17, lineHeight: 1.65, color: '#3b4a5e', marginTop: 12 }}>{p}</p>
            ))}
            {s.list && (
              <ul style={{ fontSize: 17, lineHeight: 1.6, color: '#3b4a5e', marginTop: 12, paddingLeft: 22 }}>
                {s.list.map((t) => <li key={t} style={{ marginBottom: 8 }}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}
        <div style={{ marginTop: 44, background: navy, color: '#fff', borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Start with the free HIN check</div>
          <p style={{ color: '#cdd6e3', lineHeight: 1.6 }}>No signup. See if the boat matches its paperwork before you go further.</p>
          <a href="/express/start" style={{ display: 'inline-block', marginTop: 8, background: gold, color: '#fff', fontWeight: 700, padding: '12px 22px', borderRadius: 10, textDecoration: 'none' }}>Check a HIN free</a>
        </div>
        <p style={{ marginTop: 24, fontSize: 15, color: '#3b4a5e' }}>
          More help: <a href="/guides" style={{ color: navy }}>guides</a> · <a href="/faq" style={{ color: navy }}>questions answered</a>
        </p>
      </main>
    </div>
  )
}
