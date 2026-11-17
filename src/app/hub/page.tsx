import type { Metadata } from 'next'
import { INSPECTOR, CHECKS, BOATCLOSERS, CLOSING, LOGS, LISTING, type SuiteApp } from '@/lib/suite'

// boatclosers.com/hub — every BoatClosers app on one page, laid out along a
// boat's life: check it, close it, keep it, sell it. Prices and features come
// from src/lib/suite.ts (only things that are built and live).

const URL = 'https://www.boatclosers.com/hub'
const TITLE = 'Buy, Own and Sell a Boat Without a Broker | The BoatClosers Apps'
const DESC =
  'Check a used boat before the survey, close the deal for a flat fee, keep the boat’s records, and sell it with a listing that works. The BoatClosers apps, built by a licensed yacht broker.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'website', url: URL, title: TITLE, description: DESC },
}

const N = {
  abyss: '#061328',
  navy: '#08152e',
  navy2: '#0d2145',
  brass: '#b8863a',
  brassLt: '#e0c074',
  sand: '#f5f0e8',
  paper: '#fffdf9',
  rule: '#ddd5c6',
  ink: '#08152e',
  slate: '#44586d',
  sounding: '#93a9c2',
}
const F = {
  display: "'Fraunces', Georgia, serif",
  serif: "'Newsreader', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
}

const STOPS: { id: string; step: string; title: string; text: string; apps: SuiteApp[]; after?: 'close' }[] = [
  {
    id: 'buying',
    step: 'Before you buy',
    title: 'Know what you’re looking at.',
    text: 'Most bad boat purchases start with a buyer who fell for the boat before checking it. Check the paperwork first, then walk the boat before you pay for a survey.',
    apps: [INSPECTOR, CHECKS],
  },
  {
    id: 'deal',
    step: 'Making the deal',
    title: 'Close it like a broker would.',
    text: 'Offers, the deposit, the survey window and the paperwork are where private deals go sideways. Pick the tool that fits the deal.',
    apps: [BOATCLOSERS, CLOSING],
  },
  {
    id: 'owning',
    step: 'Owning it',
    title: 'Keep the records that keep the value.',
    text: 'A boat with a clean service history sells faster and for more. Log it as you go, not the week you decide to sell.',
    apps: [LOGS],
  },
  {
    id: 'selling',
    step: 'Selling it',
    title: 'List it right, then close it right.',
    text: 'A weak ad brings lowball offers and the same ten questions. Write one that answers them, then close with the tool that fits.',
    apps: [LISTING],
    after: 'close',
  },
]

const PITFALLS: [string, string, string][] = [
  ['A failed survey', 'Survey, haul-out and travel can run $1,500 or more, gone on a boat you could have ruled out yourself.', 'My Boat Inspector'],
  ['A hidden loan or a bad title', 'Liens and title problems follow the boat, not the seller.', 'Free HIN and lien checks'],
  ['A deposit that disappears', 'Cash to a stranger with nothing signed is how scams work.', 'Escrow in BoatClosers'],
  ['No service records', 'Buyers pay less for a boat they can’t verify.', 'My Boat Logs'],
  ['An ad that draws lowballs', 'Thin listings get thin offers and endless questions.', 'My Boat Listing'],
]

const FAQ: [string, string][] = [
  ['Do I need all of them?', 'No. Each app stands on its own and is paid for separately. Use the one that fits where you are with the boat: checking one out, closing a deal, owning it or selling it.'],
  ['Do they work together?', 'Yes, where it helps. Finish an inspection in My Boat Inspector and you can open a BoatClosers deal or a My Boat Closing with the boat’s details already filled in. A listing from My Boat Listing can do the same when you find your buyer.'],
  ['Is any of this a marine survey?', 'No. My Boat Inspector helps you look at a boat yourself and decide whether it deserves a survey. It doesn’t grade or certify a boat, and a professional survey is still suggested before you buy.'],
  ['Who is behind it?', 'BoatClosers was built by a licensed Florida yacht broker and captain, from how real boat sales close. None of the apps act as your broker or take a commission.'],
  ['What does it cost?', `${BOATCLOSERS.name} is ${BOATCLOSERS.price} per deal. ${CLOSING.name} is ${CLOSING.price}. ${INSPECTOR.name} is ${INSPECTOR.price} and ${INSPECTOR.priceNote}. ${LOGS.name} is ${LOGS.price} ${LOGS.priceNote}. ${LISTING.name}: ${LISTING.priceNote}. The HIN and lien checks are free.`],
]

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      name: 'The BoatClosers apps',
      itemListElement: [INSPECTOR, BOATCLOSERS, CLOSING, LOGS, LISTING].map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'SoftwareApplication', name: a.name, url: a.url.startsWith('/') ? `https://www.boatclosers.com${a.url}` : a.url, applicationCategory: 'BusinessApplication', description: a.pitch },
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
}

function AppCard({ app, dark }: { app: SuiteApp; dark?: boolean }) {
  const ext = app.url.startsWith('http')
  return (
    <div style={{ borderTop: `2px solid ${N.brass}`, paddingTop: 18, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 28, margin: 0, lineHeight: 1.15 }}>{app.name}</h3>
        <span style={{ fontFamily: F.serif, fontSize: 26, color: dark ? N.brassLt : N.brass }}>{app.price}</span>
      </div>
      {app.priceNote && <div style={{ fontSize: 14, color: dark ? N.sounding : N.slate, marginTop: 4 }}>{app.priceNote}</div>}
      <p style={{ fontSize: 16.5, lineHeight: 1.6, color: dark ? '#c9d4e2' : N.slate, margin: '12px 0 0' }}>{app.pitch}</p>
      {app.points.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', fontSize: 15.5, lineHeight: 1.7 }}>
          {app.points.map((p) => (
            <li key={p} style={{ display: 'flex', gap: 10 }}>
              <span aria-hidden="true" style={{ color: N.brass }}>—</span>
              {p}
            </li>
          ))}
        </ul>
      )}
      <a
        href={app.url}
        {...(ext ? { rel: 'noopener' } : {})}
        style={{ marginTop: 18, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 22px', borderRadius: 8, background: dark ? N.brass : N.navy, color: dark ? N.navy : '#fff', fontWeight: 600, fontSize: 15.5, textDecoration: 'none' }}
      >
        {app.cta} →
      </a>
    </div>
  )
}

export default function HubPage() {
  const h2: React.CSSProperties = { fontFamily: F.serif, fontWeight: 400, lineHeight: 1.06, letterSpacing: '-0.015em', margin: 0 }
  const brassBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', background: N.brass, color: N.navy, borderRadius: 8, padding: '0 26px', minHeight: 52, fontSize: 16, fontWeight: 600, textDecoration: 'none' }
  const ghostBtn: React.CSSProperties = { ...brassBtn, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }
  const choices: [string, string][] = [['#buying', 'I’m buying'], ['#owning', 'I own one'], ['#selling', 'I’m selling']]

  return (
    <div style={{ background: N.paper, color: N.ink, fontFamily: F.sans }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <style>{`
        body{margin:0}
        html{scroll-behavior:smooth}
        .hb-wrap{max-width:1200px;margin:0 auto;padding-left:20px;padding-right:20px}
        .hb-two{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:64px}
        .hb-apps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px}
        .hb-five{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:28px}
        .hb-stop{scroll-margin-top:24px}
        .hb-nav a{color:rgba(255,255,255,0.82);text-decoration:none;font-size:15px}
        .hb-nav a:hover{color:#fff}
        .hb-link{color:${N.ink};text-decoration:underline;text-decoration-color:${N.brass};text-underline-offset:4px}
        a:focus-visible,summary:focus-visible{outline:3px solid ${N.brassLt};outline-offset:2px}
        @media (max-width: 900px){
          .hb-two{grid-template-columns:1fr;gap:36px}
          .hb-apps{grid-template-columns:1fr;gap:36px}
          .hb-five{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media (max-width: 640px){
          .hb-five{grid-template-columns:1fr}
          .hb-h1{font-size:44px !important}
          .hb-hide-sm{display:none}
        }
        @media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}
      `}</style>

      {/* ---------- hero ---------- */}
      <section style={{ background: `radial-gradient(1200px 600px at 85% -10%, ${N.navy2} 0%, ${N.abyss} 60%)`, color: '#fff' }}>
        <nav className="hb-wrap hb-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, gap: 16 }}>
          <a href="/" style={{ fontFamily: F.display, color: N.brassLt, fontSize: 26, fontWeight: 600, letterSpacing: 0.5 }}>BoatClosers</a>
          <div style={{ display: 'flex', gap: 26 }}>
            <a href="/buyers-guide" className="hb-hide-sm">Buyer’s guide</a>
            <a href="/sellers-guide" className="hb-hide-sm">Seller’s guide</a>
            <a href="/guides">Guides</a>
          </div>
        </nav>

        <div className="hb-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 1000 }}>
          <p style={{ fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', color: N.brassLt, margin: 0 }}>The BoatClosers apps</p>
          <h1 className="hb-h1" style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 72, lineHeight: 1.02, maxWidth: '16ch', letterSpacing: '-0.025em', margin: '18px 0 0' }}>
            Every step of a private boat sale, <span style={{ color: N.brassLt }}>covered.</span>
          </h1>
          <p style={{ fontSize: 20, lineHeight: 1.6, color: '#c9d4e2', margin: '28px 0 0', maxWidth: '40rem' }}>
            From the first inspection to the signed title, and every year you own it in between. Built by a licensed yacht broker.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 36 }}>
            {choices.map(([href, label], i) => (
              <a key={href} href={href} style={i === 0 ? brassBtn : ghostBtn}>{label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- the two best days ---------- */}
      <section style={{ background: N.navy, color: '#fff', borderTop: '1px solid rgba(184,134,58,0.25)' }}>
        <div className="hb-wrap" style={{ paddingTop: 52, paddingBottom: 52 }}>
          <p style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 1.35, margin: 0, maxWidth: '50rem' }}>
            They say the two best days of owning a boat are the day you buy it and the day you sell it.{' '}
            <span style={{ color: N.brassLt }}>We make both of them good ones, and everything in between.</span>
          </p>
        </div>
      </section>

      {/* ---------- the boat's life, stop by stop ---------- */}
      {STOPS.map((s, i) => (
        <section key={s.id} id={s.id} className="hb-stop" style={{ background: i % 2 ? N.sand : N.paper }}>
          <div className="hb-wrap hb-two" style={{ paddingTop: 88, paddingBottom: 88 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 40, color: N.brass, lineHeight: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: N.slate, fontWeight: 600 }}>{s.step}</span>
              </div>
              <h2 style={{ ...h2, fontSize: 46, marginTop: 14, maxWidth: '14ch' }}>{s.title}</h2>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: N.slate, marginTop: 18, maxWidth: '30rem' }}>{s.text}</p>
            </div>
            <div>
              <div className="hb-apps">
                {s.apps.map((a) => (
                  <AppCard key={a.name} app={a} />
                ))}
              </div>
              {s.after && (
                <p style={{ fontSize: 16.5, marginTop: 28 }}>
                  Found your buyer? Close it with{' '}
                  <a href={BOATCLOSERS.url} className="hb-link" style={{ fontWeight: 600 }}>BoatClosers</a> or{' '}
                  <a href={CLOSING.url} className="hb-link" style={{ fontWeight: 600 }}>My Boat Closing</a>.
                </p>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* ---------- they pass the boat along ---------- */}
      <section style={{ background: N.abyss, color: '#fff' }}>
        <div className="hb-wrap hb-two" style={{ paddingTop: 88, paddingBottom: 88, alignItems: 'center' }}>
          <h2 style={{ ...h2, fontSize: 46, maxWidth: '14ch' }}>They pass the boat along.</h2>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: '#c9d4e2', margin: 0 }}>
              Enter the boat once. When you move to the next step, the details come with you.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 0', fontSize: 17, lineHeight: 1.6 }}>
              {[
                ['My Boat Inspector', 'BoatClosers or My Boat Closing', 'Finish your inspection and open a deal with the boat already filled in.'],
                ['My Boat Listing', 'BoatClosers', 'Found your buyer? Take the boat straight into a deal room.'],
              ].map(([from, to, d]) => (
                <li key={from} style={{ borderTop: '1px solid rgba(255,255,255,0.14)', padding: '16px 0' }}>
                  <div style={{ fontWeight: 600 }}>
                    {from} <span style={{ color: N.brassLt }}>→</span> {to}
                  </div>
                  <div style={{ color: '#c9d4e2', fontSize: 16, marginTop: 4 }}>{d}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- where private sales go wrong ---------- */}
      <section className="hb-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <h2 style={{ ...h2, fontSize: 46, maxWidth: '20ch' }}>Where private boat sales go wrong.</h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: N.slate, marginTop: 14, maxWidth: '40rem' }}>
          There’s a reason boat people say B.O.A.T. stands for <em>Bust Out Another Thousand</em>. Here’s where those thousands usually go, and how to keep them.
        </p>
        <div className="hb-five" style={{ marginTop: 44 }}>
          {PITFALLS.map(([t, d, fix]) => (
            <div key={t} style={{ borderTop: `1px solid ${N.ink}`, paddingTop: 16 }}>
              <h3 style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 23, margin: 0, lineHeight: 1.2 }}>{t}</h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: N.slate, margin: '8px 0 0' }}>{d}</p>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: N.brass, margin: '10px 0 0' }}>Fix: {fix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- no brokers? ---------- */}
      <section style={{ background: N.sand }}>
        <div className="hb-wrap hb-two" style={{ paddingTop: 96, paddingBottom: 96, alignItems: 'center' }}>
          <h2 style={{ ...h2, fontSize: 52, maxWidth: '12ch' }}>No brokers? No problem.</h2>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.7, color: N.slate, margin: 0 }}>
              Plenty of listings say “no brokers” or “I don’t need help selling.” Fair enough. Here’s a broker’s toolkit instead: the checks, the paperwork and the process, without anyone taking a percentage.
            </p>
            <p style={{ fontSize: 15, color: N.ink, marginTop: 20, fontWeight: 500 }}>
              Built by a licensed Florida yacht broker and captain. None of the apps act as your broker, and BoatClosers never holds your money.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- questions ---------- */}
      <section className="hb-wrap" style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 900 }}>
        <h2 style={{ ...h2, fontSize: 46 }}>Common questions.</h2>
        <div style={{ marginTop: 32, borderTop: `1px solid ${N.ink}` }}>
          {FAQ.map(([q, a]) => (
            <details key={q} style={{ borderBottom: `1px solid ${N.rule}` }}>
              <summary style={{ fontFamily: F.serif, fontSize: 22, padding: '20px 0', cursor: 'pointer' }}>{q}</summary>
              <p style={{ fontSize: 16.5, lineHeight: 1.7, color: N.slate, margin: '0 0 22px', maxWidth: '44rem' }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- closing ---------- */}
      <section style={{ background: N.abyss, color: '#fff' }}>
        <div className="hb-wrap" style={{ paddingTop: 88, paddingBottom: 88, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 28 }}>
          <h2 style={{ ...h2, fontSize: 50, maxWidth: '14ch' }}>Where are you with the boat?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {choices.map(([href, label], i) => (
              <a key={href} href={href} style={i === 0 ? brassBtn : ghostBtn}>{label}</a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
