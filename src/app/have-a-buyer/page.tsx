import type { Metadata } from 'next'
import Link from 'next/link'
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
import CommissionCalculator from '@/components/marketing/CommissionCalculator'
import { LISTING } from '@/lib/suite'
import { DealPitch, InlineCta, StickyCta, TrustStrip, startHref } from '@/components/marketing/DealPitch'

// Landing page for the seller's moment: "I have a buyer. How do I close this safely?"
// Ads can test two headlines: /have-a-buyer (choice) and /have-a-buyer?v=b (head-on).
// Both versions keep the same canonical URL, so Google sees one page.

const URL = 'https://www.boatclosers.com/have-a-buyer'
const TITLE = 'Have a Buyer for Your Boat? Close the Sale Yourself'
const DESC =
  'Already found a buyer for your boat? Send them a BoatClosers deal link: written offers, a deposit held in escrow, guided survey steps and every document signed, for a flat $249.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'website', url: URL, title: `${TITLE} | BoatClosers`, description: DESC },
}

const HEADLINES = {
  a: {
    kicker: 'Have a buyer?',
    title: 'Close the sale yourself, the way a broker would.',
    sub: 'You found the buyer. BoatClosers gives you the structure for the rest: a written offer, a deposit held in escrow, the survey period and the paperwork. Flat $249.',
  },
  b: {
    kicker: 'Have a buyer?',
    title: 'You don’t need to pay $50,000 to sell a $500,000 boat.',
    sub: 'If the boat practically sells itself and the buyer is already here, keep control of the sale. BoatClosers runs the deal for a flat $249.',
  },
}

const STEPS = [
  {
    title: 'Open a deal and send your buyer the link',
    body: 'Your buyer joins free. No more “Is this still available?” back-and-forth: serious buyers make their offer in the deal room.',
  },
  {
    title: 'Get a written offer',
    body: 'Price, deposit, contingencies and a deadline, with every offer and counter in one thread you both see.',
  },
  {
    title: 'The deposit goes to escrow',
    body: 'Held by the neutral escrow holder you choose, such as Escrow.com. We never hold your money.',
  },
  {
    title: 'Survey and sea trial, on a clock',
    body: 'Guided steps with a set window, and the buyer’s accept, reject or renegotiate decision recorded.',
  },
  {
    title: 'Paperwork and signing',
    body: 'Purchase agreement, bill of sale, lien payoff and title forms filled in from your deal and signed online.',
  },
]

const FITS = [
  'The boat is newer or a popular model',
  'You already have an interested buyer, or several',
  'You know the boat well and can answer questions',
  'You’re comfortable talking to buyers directly',
  'The boat doesn’t need a big marketing campaign',
]

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const h = sp.v === 'b' ? HEADLINES.b : HEADLINES.a

  return (
    <MarketingShell ctaHref="/?start=seller" ctaLabel="Start Your Sale">
      <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{h.kicker}</div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 46px)', lineHeight: 1.15, margin: '0 0 16px' }}>
        {h.title}
      </h1>
      <p style={{ fontSize: 20, opacity: 0.85, lineHeight: 1.7, marginBottom: 28 }}>{h.sub}</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href={startHref('seller')} style={{ ...buttonStyle, fontSize: 17, padding: '16px 34px' }}>
          Start Your Private Sale
        </Link>
        <a href="#calculator" style={ghostButtonStyle}>
          See what you could keep
        </a>
      </div>
      <TrustStrip />

      <DealPitch role="seller" title="Everything it takes to close the deal, for one flat fee." />

      <h2 id="calculator" style={h2Style}>See what your sale could cost each way</h2>
      <CommissionCalculator />

      <InlineCta role="seller" text="Like that number? Send your buyer a deal link today." />

      <h2 style={h2Style}>How it works</h2>
      {STEPS.map((s, i) => (
        <div key={s.title} style={cardStyle}>
          <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 21, lineHeight: 1.3, margin: '0 0 10px' }}>
            {i + 1}. {s.title}
          </h3>
          <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0, opacity: 0.9 }}>{s.body}</p>
        </div>
      ))}

      <InlineCta role="seller" text="Five steps, one deal room, flat $249." />

      <p style={{ ...pStyle, marginTop: 24 }}>
        Want it on paper?{' '}
        <Link href="/boat-deal-checklist" style={linkStyle}>
          Print the free seller and buyer checklist
        </Link>
        .
      </p>

      <h2 style={h2Style}>A private sale fits when…</h2>
      <ul style={{ ...pStyle, paddingLeft: 22 }}>
        {FITS.map((f) => (
          <li key={f} style={{ marginBottom: 6 }}>
            {f}
          </li>
        ))}
      </ul>
      <p style={pStyle}>
        A good broker earns the fee when you need the boat marketed to buyers you can&apos;t reach, for larger or more
        complicated yachts, or when you don&apos;t have time to run the sale. It&apos;s your choice. See{' '}
        <Link href="/guides/broker-vs-boatclosers-vs-diy" style={linkStyle}>
          broker vs. BoatClosers vs. doing it yourself
        </Link>
        .
      </p>

      <h2 style={h2Style}>No buyer yet?</h2>
      <p style={pStyle}>
        <a href={LISTING.url} style={linkStyle}>
          {LISTING.name}
        </a>{' '}
        helps you write a listing that sounds like a real owner, ready for Facebook Marketplace, Craigslist and Boat
        Trader ({LISTING.price.toLowerCase()}). Then send
        interested buyers your BoatClosers deal link. Also see{' '}
        <Link href="/guides/sell-a-boat-without-a-broker" style={linkStyle}>
          how to sell a boat without a broker
        </Link>
        .
      </p>

      <div style={ctaBoxStyle}>
        <h3 style={{ fontFamily: 'Georgia, serif', color: gold, fontSize: 26, marginTop: 0 }}>Keep control. Keep the difference.</h3>
        <p style={{ ...pStyle, marginBottom: 26 }}>
          Open your deal room in a few minutes and send the link to your buyer. Flat $249, paid only when you&apos;re ready
          to sign.
        </p>
        <Link href={startHref('seller')} style={buttonStyle}>
          Start Your Private Sale
        </Link>
      </div>
      <StickyCta role="seller" />
    </MarketingShell>
  )
}
