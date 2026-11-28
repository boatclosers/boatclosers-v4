'use client'

import { useState, type ReactNode } from 'react'
import WatchVideo from '@/components/WatchVideo'

// BoatClosers home page. The hero's deal room is the signature moment: visitors
// step a sample private sale from first offer to closed, the way buyer and
// seller do in the real app. Everything else stays quiet and editorial.

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
  kelp: '#2f6b57',
}
const F = {
  display: "'Fraunces', Georgia, serif",
  serif: "'Newsreader', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
}

type Stage = { label: string; who: 'Buyer' | 'Seller' | 'Both' | 'BoatClosers'; title: string; text: string }

const STAGES: Stage[] = [
  { label: 'Offer', who: 'Buyer', title: 'Offer sent', text: '$78,000 with a $7,800 deposit, subject to survey and sea trial. Expires Friday at 5 PM.' },
  { label: 'Counter', who: 'Seller', title: 'Countered', text: '$81,500. Trailer and electronics included, survey within 10 days.' },
  { label: 'Agreed', who: 'Both', title: 'Agreed at $80,000', text: 'Both signed the purchase agreement. The deposit goes to Escrow.com and the boat comes off the market.' },
  { label: 'Inspect', who: 'Buyer', title: 'Due diligence', text: 'Survey Tuesday, sea trial Wednesday. Coast Guard abstract and lien check came back clear.' },
  { label: 'Sign', who: 'BoatClosers', title: 'Documents ready', text: 'Bill of sale, title transfer and acceptance filled in from the deal. Both sides sign online.' },
  { label: 'Closed', who: 'Both', title: 'Closed', text: 'Escrow released the funds, the title is signed over, and both sides keep the full deal file.' },
]

function DealRoom() {
  const [at, setAt] = useState(1)
  const shown = STAGES.slice(0, at + 1)
  const done = at === STAGES.length - 1
  return (
    <div
      className="bc-deal"
      style={{
        background: N.paper,
        color: N.ink,
        borderRadius: 14,
        boxShadow: '0 40px 90px -30px rgba(0,0,0,0.65)',
        overflow: 'hidden',
        fontFamily: F.sans,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${N.rule}`, fontSize: 13, color: N.slate }}>
        <span>Deal room: 2019 Grady-White 251</span>
        <span style={{ display: 'flex', gap: 6 }} aria-hidden="true">
          <span style={{ width: 26, height: 26, borderRadius: 13, background: N.navy, color: N.brassLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>B</span>
          <span style={{ width: 26, height: 26, borderRadius: 13, background: N.brass, color: N.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>S</span>
        </span>
      </div>

      <ol aria-label="Deal progress" style={{ listStyle: 'none', margin: 0, padding: '14px 20px 6px', display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, minmax(0,1fr))`, gap: 4 }}>
        {STAGES.map((s, i) => (
          <li key={s.label}>
            <button
              onClick={() => setAt(i)}
              aria-current={i === at ? 'step' : undefined}
              style={{ width: '100%', background: 'none', border: 0, padding: '4px 0', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ display: 'block', height: 4, borderRadius: 2, background: i <= at ? N.brass : N.rule, transition: 'background .3s' }} />
              <span style={{ display: 'block', marginTop: 6, fontSize: 11.5, fontWeight: 600, color: i <= at ? N.ink : '#7b8796' }}>{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div aria-live="polite" style={{ padding: '10px 20px 4px', minHeight: 300 }}>
        {shown.slice(-3).map((s, i, arr) => {
          const latest = i === arr.length - 1
          return (
            <div
              key={s.label}
              style={{
                display: 'flex',
                gap: 12,
                padding: '12px 0',
                borderTop: i ? `1px solid ${N.rule}` : 'none',
                opacity: latest ? 1 : 0.55,
              }}
            >
              <span style={{ flex: 'none', width: 8, height: 8, borderRadius: 4, marginTop: 8, background: latest ? N.brass : N.rule }} aria-hidden="true" />
              <div>
                <div style={{ fontSize: 12, color: N.slate }}>{s.who === 'BoatClosers' ? 'BoatClosers' : s.who === 'Both' ? 'Buyer and seller' : s.who}</div>
                <div style={{ fontFamily: F.serif, fontSize: latest ? 24 : 18, fontWeight: 500, lineHeight: 1.2, marginTop: 2 }}>{s.title}</div>
                <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.55, color: N.slate }}>{s.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 20px 18px', background: N.sand, borderTop: `1px solid ${N.rule}` }}>
        <span style={{ fontSize: 13, color: N.slate }}>{done ? 'That’s a whole closing, start to finish.' : 'Step through a sample deal.'}</span>
        <button
          onClick={() => setAt(done ? 0 : at + 1)}
          style={{ background: N.navy, color: '#fff', border: 0, borderRadius: 8, padding: '11px 18px', fontFamily: F.sans, fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}
        >
          {done ? 'Start over' : `Next: ${STAGES[at + 1].label}`}
        </button>
      </div>
    </div>
  )
}

type Props = {
  onStart: (role?: 'buyer' | 'seller') => void
  onDocFinder: () => void
  docCount: number
  faqs: [string, string][]
  statesBand: ReactNode
}

export default function HomeLanding({ onStart, onDocFinder, docCount, faqs, statesBand }: Props) {
  const [price, setPrice] = useState('85000')
  const n = Number(price.replace(/[^0-9]/g, '')) || 0
  const commission = Math.round(n * 0.1)
  const keep = Math.max(0, commission - 249)
  const usd = (v: number) => '$' + Math.round(v).toLocaleString('en-US')

  const h2: React.CSSProperties = { fontFamily: F.serif, fontWeight: 400, lineHeight: 1.06, letterSpacing: '-0.015em', margin: 0 }
  const brassBtn: React.CSSProperties = { background: N.brass, color: N.navy, border: 0, borderRadius: 8, padding: '15px 28px', fontFamily: F.sans, fontSize: 16, fontWeight: 600, cursor: 'pointer', minHeight: 52 }
  const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 8, padding: '15px 26px', fontFamily: F.sans, fontSize: 16, fontWeight: 600, cursor: 'pointer', minHeight: 52 }

  const steps = [
    ['Make or take an offer', 'Price, deposit, contingencies and a deadline, sent and countered in one thread both sides can see.'],
    ['Lock it with a deposit', 'Once you both sign, the deposit goes to the escrow holder you choose and the boat comes off the market.'],
    ['Do the due diligence', 'Survey, sea trial, title and Coast Guard lien checks, with a window to renegotiate or walk away.'],
    ['Sign everything online', `${docCount} documents fill in from your deal, including estates, loans, lost titles and documented boats.`],
    ['Close', 'Escrow releases the money, the title is signed over, and both sides keep the complete file.'],
  ]
  const compare = [
    ['What it costs', 'Typically 10% of the sale price', '$249 flat, whatever the boat costs'],
    ['Who runs the deal', 'The broker, on their schedule', 'You and the other party, together'],
    ['Where you see progress', 'Phone calls and updates', 'One deal room, live for both sides'],
    ['The paperwork', 'Prepared by the broker', `${docCount} documents filled in from your deal`],
    ['The money', 'The broker’s trust account', 'Escrow.com, an attorney, a broker or another holder you choose'],
  ]
  const family = [
    ['My Boat Closing', 'Price already agreed on a smaller boat? Check the title and sign your state’s paperwork for $29.99.', 'https://myboatclosing.com'],
    ['My Boat Inspector', 'Inspect a used boat yourself before you pay for a survey, with a written report. $59.99.', 'https://myboatinspector.com'],
    ['My Boat Listing', 'Selling? Build a listing that sounds like you, with a buyer page that answers the questions.', 'https://www.myboatlisting.com'],
    ['My Boat Logs', 'Keep every service and record in one place, and hand the history to your buyer.', 'https://myboatlogs.com'],
    ['Hurricane Plan', 'Free. A hurricane plan for your boat, a report for your insurer or lender, and a storm damage record.', 'https://hurricane-plan.vercel.app'],
  ]

  return (
    <div style={{ background: N.paper, color: N.ink, fontFamily: F.sans }}>
      <style>{`
        body{margin:0}
        .bc-wrap{max-width:1200px;margin:0 auto;padding-left:20px;padding-right:20px}
        .bc-hero{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:64px;align-items:center}
        .bc-two{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:64px}
        .bc-four{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:36px}
        .bc-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:36px}
        .bc-cmp{display:grid;grid-template-columns:0.9fr 1fr 1fr}
        .bc-navlinks a{color:rgba(255,255,255,0.82);text-decoration:none;font-size:15px}
        .bc-navlinks a:hover{color:#fff}
        .bc-link{color:${N.ink};text-decoration:underline;text-decoration-color:${N.brass};text-underline-offset:4px}
        .bc-hide-sm{display:inline}
        button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid ${N.brassLt};outline-offset:2px}
        @media (max-width: 900px){
          .bc-hero,.bc-two{grid-template-columns:1fr;gap:44px}
          .bc-four{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
          .bc-three{grid-template-columns:1fr;gap:20px}
        }
        @media (max-width: 640px){
          .bc-four{grid-template-columns:1fr}
          .bc-cmp{grid-template-columns:1fr 1fr}
          .bc-cmp .bc-rowhead{grid-column:1 / -1;padding-bottom:0 !important;color:${N.brass} !important;font-size:13px !important}
          .bc-cmp .bc-corner{display:none}
          .bc-hide-sm{display:none}
          .bc-h1{font-size:46px !important}
          .bc-deal ol span{font-size:10.5px !important}
        }
        @media (prefers-reduced-motion: reduce){*{transition:none !important}}
      `}</style>

      {/* ---------- hero ---------- */}
      <section style={{ background: `radial-gradient(1200px 600px at 85% -10%, ${N.navy2} 0%, ${N.abyss} 60%)`, color: '#fff' }}>
        <nav className="bc-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, gap: 16 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: F.display, color: N.brassLt, fontSize: 26, fontWeight: 600, letterSpacing: 0.5, textDecoration: 'none' }}><img src="/icons/bc-mark.svg" alt="" width={30} height={30} style={{ display: 'block' }} />BoatClosers</a>
          <div className="bc-navlinks" style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <a href="/buyers-guide" className="bc-hide-sm">Buyer’s guide</a>
            <a href="/sellers-guide" className="bc-hide-sm">Seller’s guide</a>
            <a href="/guides">Guides</a>
            <button onClick={() => onStart()} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, padding: '10px 16px', fontFamily: F.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Sign in
            </button>
          </div>
        </nav>

        <div className="bc-wrap bc-hero" style={{ paddingTop: 48, paddingBottom: 96 }}>
          <div>
            <h1 className="bc-h1" style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 70, lineHeight: 1.0, letterSpacing: '-0.025em', margin: 0, maxWidth: '13ch' }}>
              Close your boat sale like a broker would.
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: '#c9d4e2', margin: '26px 0 0', maxWidth: '34rem' }}>
              Offers, the deposit and escrow, inspections, every state’s paperwork and signing, in one deal room you share with the other party. One flat $249 instead of a 10% commission.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34 }}>
              <button style={brassBtn} onClick={() => onStart('buyer')}>Start as buyer</button>
              <button style={ghostBtn} onClick={() => onStart('seller')}>Start as seller</button>
            </div>
            <div style={{ marginTop: 14 }}>
              <WatchVideo video="boatclosers" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }} />
            </div>
            <p style={{ fontSize: 14, color: N.sounding, marginTop: 22 }}>Free to start. Pay only when you’re ready to sign. The other party joins free.</p>
          </div>
          <DealRoom />
        </div>
      </section>

      {/* ---------- what you keep ---------- */}
      <section style={{ background: N.navy, color: '#fff', borderTop: '1px solid rgba(184,134,58,0.25)' }}>
        <div className="bc-wrap bc-two" style={{ paddingTop: 56, paddingBottom: 56, alignItems: 'center' }}>
          <div>
            <h2 style={{ ...h2, fontSize: 40 }}>See what you keep.</h2>
            <label htmlFor="bc-price" style={{ display: 'block', fontSize: 15, color: '#c9d4e2', margin: '18px 0 10px' }}>What’s the boat selling for?</label>
            <div style={{ position: 'relative', maxWidth: 320 }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 22, fontWeight: 600, color: N.navy }}>$</span>
              <input
                id="bc-price"
                inputMode="numeric"
                autoComplete="off"
                value={n ? n.toLocaleString('en-US') : ''}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px 14px 34px', fontSize: 22, fontWeight: 600, fontFamily: F.sans, color: N.navy, background: '#fff', border: 0, borderRadius: 8 }}
              />
            </div>
          </div>
          <div aria-live="polite" style={{ fontSize: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.14)', color: '#c9d4e2' }}>
              <span>Typical 10% broker commission</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{usd(commission)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.14)', color: '#c9d4e2' }}>
              <span>BoatClosers</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>$249</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14 }}>
              <span style={{ color: N.brassLt, fontWeight: 600 }}>You keep</span>
              <span style={{ fontFamily: F.serif, fontSize: 52, color: N.brassLt, lineHeight: 1 }}>{usd(keep)}</span>
            </div>
            <p style={{ fontSize: 13, color: N.sounding, margin: '14px 0 0', lineHeight: 1.5 }}>
              Commissions vary; 10% is a common listing rate for boats. Escrow fees, if you use escrow, are separate.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- how a deal runs (a real sequence) ---------- */}
      <section className="bc-wrap" style={{ paddingTop: 104, paddingBottom: 104 }}>
        <div className="bc-two">
          <div>
            <h2 style={{ ...h2, fontSize: 50, maxWidth: '14ch' }}>One deal room, start to finish.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: N.slate, marginTop: 22, maxWidth: '30rem' }}>
              Buyer and seller work in the same deal. Enter the boat once, and the offers, escrow, inspections and paperwork all run from it.
            </p>
            <p style={{ fontSize: 16, marginTop: 22 }}>
              Loan on the boat, a lost title or an estate sale?{' '}
              <button onClick={onDocFinder} className="bc-link" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                See what your deal needs
              </button>
            </p>
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: `1px solid ${N.rule}` }}>
            {steps.map(([t, d], i) => (
              <li key={t} style={{ display: 'grid', gridTemplateColumns: '56px minmax(0,1fr)', gap: 8, padding: '24px 0', borderBottom: `1px solid ${N.rule}` }}>
                <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 34, color: N.brass, lineHeight: 1 }}>{i + 1}</span>
                <div>
                  <h3 style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 25, margin: 0, lineHeight: 1.2 }}>{t}</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: N.slate, margin: '6px 0 0' }}>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- broker vs boatclosers ---------- */}
      <section style={{ background: N.sand }}>
        <div className="bc-wrap" style={{ paddingTop: 100, paddingBottom: 100 }}>
          <h2 style={{ ...h2, fontSize: 50, maxWidth: '18ch' }}>The same closing a broker runs. You keep the commission.</h2>
          <div role="table" aria-label="With a broker compared with BoatClosers" style={{ marginTop: 44, borderTop: `1px solid ${N.ink}` }}>
            <div role="row" className="bc-cmp" style={{ fontSize: 14, fontWeight: 600, color: N.slate }}>
              <div role="columnheader" className="bc-corner" style={{ padding: '14px 0' }} />
              <div role="columnheader" style={{ padding: '14px 16px 14px 0' }}>With a broker</div>
              <div role="columnheader" style={{ padding: '14px 0', color: N.ink }}>With BoatClosers</div>
            </div>
            {compare.map(([k, a, b]) => (
              <div role="row" key={k} className="bc-cmp" style={{ borderTop: `1px solid ${N.rule}`, fontSize: 16, lineHeight: 1.5 }}>
                <div role="rowheader" className="bc-rowhead" style={{ padding: '18px 16px 18px 0', fontWeight: 600 }}>{k}</div>
                <div role="cell" style={{ padding: '18px 16px 18px 0', color: N.slate }}>{a}</div>
                <div role="cell" style={{ padding: '18px 0', fontWeight: 500 }}>{b}</div>
              </div>
            ))}
          </div>
          <div className="bc-three" style={{ marginTop: 56 }}>
            {[
              ['Not a broker', 'We don’t represent either side or take a commission. You run the deal; we keep it organized and get the paperwork right.'],
              ['Not a listing site', 'We don’t list, show or sell boats. Found your buyer or your boat anywhere? Close it here.'],
              ['Never holds your money', 'Funds go through the escrow holder you both choose and release only when the deal is done.'],
            ].map(([t, d]) => (
              <div key={t} style={{ borderTop: `2px solid ${N.brass}`, paddingTop: 16 }}>
                <h3 style={{ fontFamily: F.serif, fontWeight: 500, fontSize: 24, margin: 0 }}>{t}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: N.slate, margin: '8px 0 0' }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- who built it ---------- */}
      <section className="bc-wrap bc-two" style={{ paddingTop: 100, paddingBottom: 100, alignItems: 'center' }}>
        <h2 style={{ ...h2, fontSize: 46, maxWidth: '15ch' }}>A working broker’s process, in your hands.</h2>
        <div>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: N.slate, margin: 0 }}>
            BoatClosers was built by a licensed Florida yacht broker and captain, from how real vessel transactions close, including the complicated ones. The documents follow maritime and state transfer standards, and the app flags anything that needs a notary or an attorney.
          </p>
          <p style={{ fontSize: 15, color: N.ink, marginTop: 20, fontWeight: 500 }}>Licensed Florida yacht broker and captain. Maritime and state transfer standards. We never hold your money.</p>
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section style={{ background: N.abyss, color: '#fff' }}>
        <div className="bc-wrap bc-two" style={{ paddingTop: 100, paddingBottom: 100, alignItems: 'center' }}>
          <div>
            <h2 style={{ ...h2, fontSize: 50 }}>One price. Any boat.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: '#c9d4e2', marginTop: 20, maxWidth: '30rem' }}>
              The whole transaction, from the first offer to the signed closing. The same $249 for a $5,000 skiff or a $500,000 yacht. No percentage, no subscription.
            </p>
          </div>
          <div style={{ borderTop: `1px solid rgba(224,192,116,0.5)`, paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontFamily: F.serif, fontSize: 96, lineHeight: 0.9, color: N.brassLt }}>$249</span>
              <span style={{ color: N.sounding, fontSize: 15 }}>per deal, paid when you’re ready to sign</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '26px 0 0', fontSize: 16, lineHeight: 1.9, color: '#dbe3ec' }}>
              {[`All ${docCount} documents, filled in from your deal`, 'Offers, counters and contingencies', 'Five ways to hold the deposit', 'Due diligence and closing checklists', 'Electronic signatures for both sides'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: 12 }}>
                  <span aria-hidden="true" style={{ color: N.brass }}>—</span>
                  {f}
                </li>
              ))}
            </ul>
            <button style={{ ...brassBtn, marginTop: 30 }} onClick={() => onStart()}>Start free</button>
            <p style={{ fontSize: 13, color: N.sounding, marginTop: 14 }}>If you use Escrow.com, its fee is separate and paid to Escrow.com.</p>
          </div>
        </div>
      </section>

      {/* ---------- states ---------- */}
      {statesBand}

      {/* ---------- the right tool ---------- */}
      <section className="bc-wrap" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <h2 style={{ ...h2, fontSize: 46, maxWidth: '20ch' }}>Not a full deal? There’s a tool for that.</h2>
        <p style={{ fontSize: 16, marginTop: 14 }}>
          <a href="/hub" className="bc-link" style={{ fontWeight: 600 }}>See how they all work together →</a>
        </p>
        <div className="bc-four" style={{ marginTop: 44 }}>
          {family.map(([t, d, u]) => (
            <a key={t} href={u} style={{ display: 'block', textDecoration: 'none', color: N.ink, borderTop: `1px solid ${N.ink}`, paddingTop: 18 }}>
              <span style={{ display: 'block', fontFamily: F.serif, fontSize: 24, fontWeight: 500 }}>{t}</span>
              <span style={{ display: 'block', fontSize: 15.5, lineHeight: 1.6, color: N.slate, marginTop: 8 }}>{d}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- questions ---------- */}
      <section style={{ background: N.sand }}>
        <div className="bc-wrap" style={{ paddingTop: 100, paddingBottom: 100, maxWidth: 900 }}>
          <h2 style={{ ...h2, fontSize: 46 }}>Common questions.</h2>
          <div style={{ marginTop: 32, borderTop: `1px solid ${N.ink}` }}>
            {faqs.map(([q, a]) => (
              <details key={q} style={{ borderBottom: `1px solid ${N.rule}` }}>
                <summary style={{ fontFamily: F.serif, fontSize: 22, padding: '20px 0', cursor: 'pointer' }}>{q}</summary>
                <p style={{ fontSize: 16.5, lineHeight: 1.7, color: N.slate, margin: '0 0 22px', maxWidth: '44rem' }}>{a}</p>
              </details>
            ))}
          </div>
          <p style={{ marginTop: 26, fontSize: 16 }}>
            <a href="/faq" className="bc-link" style={{ fontWeight: 600 }}>See every question, by topic</a>
          </p>
        </div>
      </section>

      {/* ---------- closing ---------- */}
      <section style={{ background: N.abyss, color: '#fff' }}>
        <div className="bc-wrap" style={{ paddingTop: 88, paddingBottom: 88, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 28 }}>
          <h2 style={{ ...h2, fontSize: 52, maxWidth: '15ch' }}>Open a deal room in two minutes.</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button style={brassBtn} onClick={() => onStart('buyer')}>Start as buyer</button>
            <button style={ghostBtn} onClick={() => onStart('seller')}>Start as seller</button>
          </div>
        </div>
      </section>
    </div>
  )
}
