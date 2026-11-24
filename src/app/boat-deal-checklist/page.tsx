import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingShell, { buttonStyle, cream, ctaBoxStyle, gold, h2Style, linkStyle, navy, pStyle } from '@/components/marketing/MarketingShell'
import { StickyCta, startHref } from '@/components/marketing/DealPitch'
import PrintButton from '@/components/marketing/PrintButton'

// Free printable checklists for a private boat deal, buyer side and seller side.
// No signup. "Print or save as PDF" uses the browser's own print dialog.

const URL = 'https://www.boatclosers.com/boat-deal-checklist'
const TITLE = 'Private Boat Sale Checklist for Buyers and Sellers (Free, Printable)'
const DESC =
  'A free, printable checklist for buying or selling a used boat privately: HIN, title, liens, survey, written offer, deposit, paperwork and closing.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'article', url: URL, title: `${TITLE} | BoatClosers`, description: DESC },
}

const BUYER = [
  'Run the HIN and match it to the transom and the title',
  'See the title (or Coast Guard documentation) in the seller’s name',
  'Check for liens and loans on the boat',
  'See the boat where it’s kept and meet the seller in person',
  'Agree on a survey and sea trial window, in writing',
  'Make a written offer: price, deposit, contingencies, closing date',
  'Put the deposit with a neutral escrow company, not the seller',
  'Financing? Give your lender the agreement, HIN and title details',
  'Survey done: accept, renegotiate or walk away, in writing',
  'Pay the balance only against a signed bill of sale and title',
  'Title, register and insure the boat in your name',
]

const SELLER = [
  'Find your title or documentation and confirm your name is on it',
  'Get a loan payoff letter if money is still owed',
  'Gather maintenance records and list what goes with the boat',
  'Price it against comparable boats for sale',
  'Ask serious buyers for a written offer, not “Is this still available?”',
  'Agree on deposit, survey window and closing date in writing',
  'Confirm the deposit is held by a neutral escrow company',
  'Be ready for the survey and sea trial on the agreed dates',
  'Sign the bill of sale and title only when the funds are confirmed',
  'File your state’s notice of sale and cancel your insurance',
]

const box = { width: 18, height: 18, border: `2px solid ${gold}`, borderRadius: 3, flex: '0 0 auto', marginTop: 3 } as const

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((t) => (
        <li key={t} style={{ display: 'flex', gap: 14, fontSize: 17, lineHeight: 1.6, padding: '10px 0', borderBottom: '1px solid rgba(201,150,46,0.25)' }}>
          <span style={box} aria-hidden="true" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <MarketingShell>
      <style>{'@media print{body,div{background:#fff !important;color:#000 !important}header,footer,.no-print{display:none !important}a{color:#000 !important}}'}</style>
      <div className="no-print" style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
        Free · Printable · No signup
      </div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 44px)', lineHeight: 1.15, margin: '0 0 16px' }}>
        Private Boat Sale Checklist
      </h1>
      <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 28 }}>
        The steps that protect your money on a private boat deal, in order. Print it, or save it as a PDF and keep it on
        your phone.
      </p>
      <PrintButton />

      <div
        className="no-print"
        style={{ marginTop: 32, padding: '22px 24px', borderRadius: 8, background: cream, color: navy }}
      >
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Rather not run all 21 steps yourself?
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>
          A BoatClosers deal room walks buyer and seller through every one: written offers, the deposit in escrow, the
          survey window, and every document filled in and signed. Flat $249, paid only when you&apos;re ready to sign. The
          other party joins free.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={startHref('buyer')} style={{ ...buttonStyle, background: navy, color: cream }}>
            I&apos;m buying
          </Link>
          <Link href={startHref('seller')} style={{ ...buttonStyle, background: navy, color: cream }}>
            I&apos;m selling
          </Link>
        </div>
      </div>

      <h2 style={h2Style}>Buying a boat</h2>
      <List items={BUYER} />

      <h2 style={h2Style}>Selling a boat</h2>
      <List items={SELLER} />

      <p style={{ ...pStyle, marginTop: 32, fontSize: 14, opacity: 0.7 }}>
        General guidance, not legal advice. Rules for titles and notices of sale vary by state. From boatclosers.com
      </p>

      <div className="no-print" style={ctaBoxStyle}>
        <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 24, marginTop: 0 }}>Want this done for you, step by step?</h3>
        <p style={{ ...pStyle, marginBottom: 26 }}>
          A BoatClosers deal room walks both sides through every item on this list, with the documents filled in and
          signed. Buyers start at{' '}
          <Link href="/found-the-boat" style={linkStyle}>
            Found the boat?
          </Link>
          , sellers at{' '}
          <Link href="/have-a-buyer" style={linkStyle}>
            Have a buyer?
          </Link>
          .
        </p>
        <Link href="/" style={buttonStyle}>
          See How BoatClosers Works
        </Link>
      </div>
      <StickyCta role="both" />
    </MarketingShell>
  )
}
