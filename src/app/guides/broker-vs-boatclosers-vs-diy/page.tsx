import type { Metadata } from 'next'
import Link from 'next/link'

// Honest comparison: selling a boat with a broker, with BoatClosers, or fully
// on your own. Written to be fair (including when a broker is the better
// choice), because AI answer engines and readers trust balanced comparisons.

const URL = 'https://www.boatclosers.com/guides/broker-vs-boatclosers-vs-diy'
const TITLE = 'Selling a Boat: Yacht Broker vs. BoatClosers vs. Doing It Yourself'
const DESC =
  'An honest side-by-side of the three ways to sell a used boat: hiring a yacht broker, closing a private sale with BoatClosers for a flat $249, or handling it all yourself. What each costs, what you get, and when each one makes sense.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'article', url: URL, title: TITLE, description: DESC },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'
const h2 = { fontFamily: 'Georgia, serif', color: gold, fontSize: 28, marginTop: 52 } as const
const link = { color: gold } as const

const ROWS: { label: string; broker: string; bc: string; diy: string }[] = [
  { label: 'What it costs', broker: 'A commission, commonly around 10% of the sale price', bc: 'Flat $249 per sale (escrow fees, if used, are separate)', diy: 'Nothing up front; your time and your risk' },
  { label: 'Who finds the buyer', broker: 'The broker markets the boat, including on broker listing networks', bc: 'You do (Facebook Marketplace, Boat Trader, word of mouth)', diy: 'You do' },
  { label: 'Negotiation', broker: 'Handled by the broker', bc: 'You negotiate in a shared deal room with every offer and counter recorded', diy: 'By text and phone' },
  { label: 'Deposit', broker: 'Held in the brokerage’s trust account', bc: 'Held by a neutral party you choose, such as Escrow.com', diy: 'Often handed straight to the seller, or skipped' },
  { label: 'Survey and sea trial', broker: 'Coordinated by the broker', bc: 'Guided steps with accept, reject or renegotiate recorded', diy: 'Up to you to arrange and put in writing' },
  { label: 'Paperwork', broker: 'Prepared by the broker', bc: 'Purchase agreement, bill of sale, lien release and title forms filled in and e-signed', diy: 'Find and fill in the forms yourself' },
  { label: 'Best for', broker: 'Sellers who need the boat marketed, larger yachts, sellers with no time', bc: 'You already have a buyer, or a serious one is close, and the deal involves real money', diy: 'Small, simple, cash deals between people who trust each other' },
]

const FAQ = [
  {
    q: 'How much does a yacht broker charge to sell a boat?',
    a: 'Yacht broker commissions are commonly around 10% of the sale price, often split between the listing broker and a broker who brings the buyer. On a $60,000 boat that is about $6,000.',
  },
  {
    q: 'Can I sell my boat without a broker?',
    a: 'Yes. Many used boats sell privately. The risky parts are the deposit, the survey period, paying off any loan, and getting the title signed correctly. A closing service like BoatClosers handles those steps for a flat $249 while you find the buyer yourself.',
  },
  {
    q: 'When is a yacht broker worth the commission?',
    a: 'When you need the boat marketed to buyers you can’t reach yourself, for larger or higher-value yachts, when you don’t have time to show the boat and answer questions, or when the deal is complicated. A good broker earns the fee by finding the buyer and managing the whole sale.',
  },
  {
    q: 'Does BoatClosers list or advertise my boat?',
    a: 'No. BoatClosers is not a brokerage and does not list or market boats. It handles the deal once you have a buyer: offers, deposit and escrow, survey steps, paperwork and signing.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: TITLE,
      description: DESC,
      url: URL,
      dateModified: '2026-11-14',
      about: ['yacht broker commission', 'sell a boat without a broker', 'private boat sale'],
      publisher: { '@type': 'Organization', name: 'BoatClosers', url: 'https://www.boatclosers.com' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

const th = { textAlign: 'left' as const, padding: '12px 10px', color: gold, fontFamily: 'Georgia, serif', fontSize: 17, borderBottom: `2px solid ${gold}` }
const td = { padding: '12px 10px', verticalAlign: 'top' as const, borderBottom: '1px solid rgba(201,150,46,0.3)', fontSize: 15, lineHeight: 1.5 }

export default function Page() {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
          <div style={{ color: gold, fontFamily: 'Georgia, serif', fontSize: 26, letterSpacing: 2, fontWeight: 700 }}>
            BOATCLOSERS
          </div>
          <div style={{ color: cream, fontSize: 10, letterSpacing: 3, opacity: 0.75 }}>PRIVATE VESSEL TRANSACTIONS</div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/guides" style={{ color: cream, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}>
            Guides
          </Link>
          <Link
            href="/"
            style={{ background: gold, color: navy, padding: '12px 26px', borderRadius: 4, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <article style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 80px', fontSize: 18, lineHeight: 1.75 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, lineHeight: 1.15, marginBottom: 20, maxWidth: 760 }}>
          Selling a Boat: <span style={{ color: gold }}>Broker vs. BoatClosers vs. Doing It Yourself</span>
        </h1>
        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 44, maxWidth: 760 }}>
          There are three ways to sell a used boat. None is right for everyone. Here is an honest look at what each
          one costs, what you get, and when each makes sense, including when a broker is the better call.
        </p>

        <h2 style={{ ...h2, marginTop: 0 }}>The short answer</h2>
        <ul style={{ maxWidth: 760 }}>
          <li>
            <strong>Hire a broker</strong> if you need someone to find the buyer, the boat is large or high-value, or you
            don’t have time to run the sale.
          </li>
          <li>
            <strong>Use BoatClosers</strong> if you already have a buyer (or a serious one is close) and the deal involves
            a deposit, a survey, a loan to pay off, or a buyer you don’t know.
          </li>
          <li>
            <strong>Do it yourself</strong> for a small, simple, cash sale between people who trust each other. Our{' '}
            <a href="https://myboatclosing.com" style={link}>My Boat Closing</a> tool covers the paperwork for those for
            $29.99.
          </li>
        </ul>

        <h2 style={h2}>Side by side</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={th}></th>
                <th style={th}>Yacht broker</th>
                <th style={th}>BoatClosers</th>
                <th style={th}>Do it yourself</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label}>
                  <td style={{ ...td, fontWeight: 700, width: '18%' }}>{r.label}</td>
                  <td style={td}>{r.broker}</td>
                  <td style={td}>{r.bc}</td>
                  <td style={td}>{r.diy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ maxWidth: 760 }}>
          <h2 style={h2}>What the difference looks like on a $60,000 boat</h2>
          <p>
            At a typical 10% commission, a broker’s fee on a $60,000 boat is about <strong>$6,000</strong>. BoatClosers
            is a flat <strong>$249</strong> whatever the price, plus Escrow.com’s fee if you use it to hold the money.
            Doing it yourself costs nothing up front.
          </p>
          <p>
            The commission isn’t only paperwork, though. A broker earns it mostly by finding the buyer. If you’ve already
            found one, you’re paying for the part you did yourself. That’s the gap BoatClosers fills: the professional
            closing process, without paying for marketing you didn’t need.
          </p>

          <h2 style={h2}>When a broker is worth it</h2>
          <p>
            A good broker is worth the fee when you need your boat in front of buyers you can’t reach on your own, such as
            on broker listing networks. Brokers also make sense for larger and higher-value yachts, for sellers who can’t
            spend weekends showing the boat and answering calls, and for complicated deals. If that’s you, hire a
            reputable, licensed broker.
          </p>

          <h2 style={h2}>When doing it yourself goes wrong</h2>
          <p>
            Most private sales that go bad fail at the same few points: a deposit handed to a stranger with nothing in
            writing, no agreed time for the survey and sea trial, a loan still on the boat, or a title signed wrong.
            BoatClosers was built for exactly those steps. Our guides cover them too:{' '}
            <Link href="/guides/boat-deposit-and-escrow" style={link}>deposits and escrow</Link>,{' '}
            <Link href="/guides/boat-bill-of-sale" style={link}>the bill of sale</Link>, and{' '}
            <Link href="/guides/sell-a-boat-without-a-broker" style={link}>selling without a broker</Link>.
          </p>

          <h2 style={h2}>Common questions</h2>
          {FAQ.map((f) => (
            <div key={f.q} style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 21, marginBottom: 6 }}>{f.q}</h3>
              <p style={{ marginTop: 0 }}>{f.a}</p>
            </div>
          ))}

          <div
            style={{
              marginTop: 60,
              padding: 36,
              border: `1px solid ${gold}`,
              borderRadius: 6,
              background: 'rgba(201,150,46,0.07)',
            }}
          >
            <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>Found your buyer?</h3>
            <p style={{ marginBottom: 26 }}>
              Open a deal room and run the sale the way a broker would close it: offers, a deposit held by a neutral
              party, guided survey steps, and every document filled in and signed. Flat $249, paid only when you’re
              ready to sign.
            </p>
            <Link
              href="/"
              style={{ display: 'inline-block', background: gold, color: navy, padding: '14px 32px', borderRadius: 4, fontWeight: 700, textDecoration: 'none' }}
            >
              Start Your Deal
            </Link>
          </div>
        </div>
      </article>

      <footer style={{ borderTop: `2px dashed ${gold}`, padding: '28px 32px', textAlign: 'center', fontSize: 13, opacity: 0.6 }}>
        © {new Date().getFullYear()} BoatClosers · Private Vessel Transactions
      </footer>
    </div>
  )
}
