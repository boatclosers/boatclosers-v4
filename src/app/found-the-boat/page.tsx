import type { Metadata } from 'next'
import Link from 'next/link'
import HinChecker from '@/app/hin-check/HinChecker'
import MarketingShell, {
  buttonStyle,
  cardStyle,
  ctaBoxStyle,
  ghostButtonStyle,
  gold,
  h2Style,
  linkStyle,
  pStyle,
} from '@/components/marketing/MarketingShell'
import { CLOSING, INSPECTOR } from '@/lib/suite'

// Landing page for the buyer's moment: "I found the boat. Now what?"
// Ads can test two headlines: /found-the-boat (helpful) and /found-the-boat?v=b (urgent).
// Both versions keep the same canonical URL, so Google sees one page.

const URL = 'https://www.boatclosers.com/found-the-boat'
const TITLE = 'Found the Boat? 7 Things to Check Before You Send a Deposit'
const DESC =
  'Found a used boat you want to buy from a private seller? Run a free HIN check, then work through the 7 checks that protect your deposit before you make an offer.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'website', url: URL, title: `${TITLE} | BoatClosers`, description: DESC },
}

const HEADLINES = {
  a: {
    kicker: 'Found the boat?',
    title: 'Check these 7 things before you send a deposit.',
    sub: 'Start with a free HIN check. Then make a real, written offer, with the deposit held by a neutral party instead of handed to a stranger.',
  },
  b: {
    kicker: 'Found the boat?',
    title: 'Don’t wire $50,000 to a stranger yet.',
    sub: 'Run the HIN, check the paperwork, know who you’re dealing with, and put the offer in writing. Here’s how, starting free.',
  },
}

const CHECKS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Run the HIN',
    body: 'Who built the boat and when, recalls on file, and Coast Guard records. Free, right above. Make sure the HIN on the transom matches the title.',
  },
  {
    title: 'Confirm the seller owns it',
    body: 'The name on the title (or Coast Guard documentation) should match the person selling. Two owners on the title usually means both sign.',
  },
  {
    title: 'Check for liens',
    body: (
      <>
        Money owed on the boat has to be paid off at closing. See{' '}
        <Link href="/lien-check" style={linkStyle}>
          how to check for liens
        </Link>{' '}
        and{' '}
        <Link href="/guides/buy-a-boat-with-a-loan-on-it" style={linkStyle}>
          buying a boat with a loan on it
        </Link>
        .
      </>
    ),
  },
  {
    title: 'Know who you’re dealing with',
    body: (
      <>
        Meet in person, see the boat where it’s kept, and be wary of rushed deals and odd payment requests. Read{' '}
        <Link href="/guides/avoid-boat-buying-scams-facebook-marketplace-craigslist" style={linkStyle}>
          avoiding Marketplace and Craigslist scams
        </Link>
        .
      </>
    ),
  },
  {
    title: 'Plan the survey and sea trial',
    body: (
      <>
        Agree in writing how many days you have and what happens if problems turn up. See{' '}
        <Link href="/guides/marine-survey-what-it-covers" style={linkStyle}>
          what a marine survey covers
        </Link>
        .
      </>
    ),
  },
  {
    title: 'Make a written offer',
    body: (
      <>
        Price, deposit, survey period, what’s included and the closing date, in writing, not by text. See{' '}
        <Link href="/guides/how-to-negotiate-boat-purchase" style={linkStyle}>
          how to negotiate a boat purchase
        </Link>
        .
      </>
    ),
  },
  {
    title: 'Protect the deposit and line up the paperwork',
    body: (
      <>
        Use a neutral escrow company for the deposit, and know which documents you need. See{' '}
        <Link href="/guides/boat-deposit-and-escrow" style={linkStyle}>
          deposits and escrow
        </Link>{' '}
        and{' '}
        <Link href="/guides/documents-needed-private-boat-sale" style={linkStyle}>
          documents for a private sale
        </Link>
        . Financing? Your lender will want the purchase agreement, HIN and title details, so keep them together.
      </>
    ),
  },
]

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const h = sp.v === 'b' ? HEADLINES.b : HEADLINES.a

  return (
    <MarketingShell ctaHref="/?start=buyer" ctaLabel="Make an Offer">
      <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{h.kicker}</div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 46px)', lineHeight: 1.15, margin: '0 0 16px' }}>
        {h.title}
      </h1>
      <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 36 }}>{h.sub}</p>

      <HinChecker />

      <h2 style={h2Style}>The 7 checks</h2>
      {CHECKS.map((c, i) => (
        <div key={c.title} style={cardStyle}>
          <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 21, lineHeight: 1.3, margin: '0 0 10px' }}>
            {i + 1}. {c.title}
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0, opacity: 0.9 }}>{c.body}</p>
        </div>
      ))}

      <p style={pStyle}>
        Want it on paper?{' '}
        <Link href="/boat-deal-checklist" style={linkStyle}>
          Print the free buyer and seller checklist
        </Link>
        .
      </p>

      <h2 style={h2Style}>Want a closer look at the boat first?</h2>
      <p style={pStyle}>
        <a href={INSPECTOR.url} style={linkStyle}>
          {INSPECTOR.name}
        </a>{' '}
        walks the boat with you from your phone and gives you a report with offer points, before you pay for a survey (
        {INSPECTOR.price}, {INSPECTOR.priceNote}).
      </p>

      <div style={ctaBoxStyle}>
        <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 26, marginTop: 0 }}>Ready to make an offer?</h3>
        <p style={{ ...pStyle, marginBottom: 26 }}>
          Don&apos;t do the most important part of the deal over text. Open a BoatClosers deal room: a written offer the
          seller can accept or counter, the deposit held by a neutral escrow company, guided survey steps, and every
          document filled in and signed. Flat $249, paid only when you&apos;re ready to sign.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/?start=buyer" style={buttonStyle}>
            Start a BoatClosers Deal
          </Link>
          <a href={CLOSING.url} style={ghostButtonStyle}>
            Small, simple deal? {CLOSING.name}, {CLOSING.price}
          </a>
        </div>
      </div>
    </MarketingShell>
  )
}
