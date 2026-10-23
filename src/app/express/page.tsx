import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'BoatClosers Express: Buy a Boat From a Private Seller the Right Way — $29.99 (Florida)',
  description:
    'Everything you need to buy a boat, trailer, or motor from a private seller in Florida — a free HIN and lien check, a guided inspection, every state form filled in, and your title application pre-filled, for a flat $29.99. The seller never signs up.',
  alternates: {
    canonical: 'https://www.boatclosers.com/express',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com/express',
    title: 'BoatClosers Express',
    description:
      'Everything you need to buy a boat from a private seller in Florida — inspection, paperwork, and title, for $29.99. The seller never has to sign up.',
  },
}

const steps = [
  { title: 'Before you pay', price: 'Free', text: 'Free HIN check, a lien check, the right questions to ask, and how to pay safely — so you don’t waste a trip or get surprised.' },
  { title: 'Inspect it', price: '$29.99', text: 'A guided phone walkthrough of the hull, engine, systems, trailer, and sea trial — with a condition report you can use to renegotiate.' },
  { title: 'At the handoff', price: 'Included', text: 'Your Florida bill of sale and form HSMV 82050 filled in, plus a title-signing guide so nothing gets rejected at the counter.' },
  { title: "After it's yours", price: 'Included', text: 'A pre-filled Florida title application, exactly what to bring to the tax collector, and a reminder before your 30-day deadline.' },
]

const tips = [
  'Run the free HIN check before you drive out. Two minutes now can save you a wasted trip if the paperwork doesn’t match the boat.',
  'Sign the title and the bill of sale at the same moment you hand over payment. Doing it all at once is what keeps a simple sale clean.',
  'Don’t wire a deposit to hold a boat on a cash deal. Pay in full, in person, at the handoff — once the papers are signed.',
  'In Florida the clock starts at the sale: you have 30 days to title it. Express reminds you before it runs out.',
]

const faqs = [
  { q: 'Does the seller have to sign up?', a: 'No. You handle everything. The seller just signs the papers at the handoff.' },
  { q: 'What does it cost?', a: 'Checking is free — the HIN check, lien check, and seller questions. The guided inspection, condition report, and all the paperwork are $29.99, one price for a boat, a trailer, a motor, or all three.' },
  { q: 'Is this only for Florida?', a: 'For now, yes. Florida titling rules are built in, so your paperwork matches what the tax collector expects.' },
  { q: 'What if my deal needs more?', a: 'Express is for a simple sale: price agreed, nothing held in escrow, clear title. If you need to negotiate, hold a deposit, make the sale depend on a survey, finance it, or sign a purchase agreement, full BoatClosers ($249) handles all of it — and your $29.99 comes off the $249.' },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter:wght@400;500;600&display=swap');
  :root{
    --navy:#08152e; --navy-deep:#061020; --navy-sky:#0a1c3a;
    --brass:#b8863a; --brass-lt:#e0c074; --teal:#0e6b7c;
    --sand:#f6f1e9; --sand-cool:#f0ece2; --paper:#fffdf9;
    --mist:#ddd5c6; --slate:#44586d; --text:#1a2840;
    --display:'Fraunces',Georgia,serif; --serif:'Newsreader',Georgia,serif; --sans:'Inter',-apple-system,sans-serif;
  }
  body{margin:0;background:var(--sand);}
  .ex{font-family:var(--serif); color:var(--text); background:var(--sand);}
  .ex h1,.ex h2,.ex h3{font-family:var(--serif); font-weight:500; line-height:1.18; letter-spacing:0.2px; margin:0;}
  .ex .sans{font-family:var(--sans);}
  .ex .wrap{max-width:820px; margin:0 auto; padding:0 1.25rem;}
  .ex .eyebrow{display:inline-flex; align-items:center; gap:10px; font-family:var(--sans); font-size:11px; letter-spacing:3px; color:var(--brass); text-transform:uppercase; font-weight:500;}
  .ex .eyebrow::before,.ex .eyebrow::after{content:""; width:20px; height:1px; background:rgba(184,134,58,0.55);}
  .ex .eyebrow.lt{color:var(--brass-lt);} .ex .eyebrow.lt::before,.ex .eyebrow.lt::after{background:rgba(217,178,94,0.5);}
  .ex .lead{font-family:var(--sans); font-size:15px; color:var(--slate); line-height:1.8;}
  .ex .card{background:var(--paper); border:0.5px solid var(--mist); border-radius:10px; padding:1.4rem 1.5rem;}
  .ex .btn{display:inline-block; background:var(--brass); color:var(--navy); padding:14px 34px; border-radius:3px; font-family:var(--sans); font-weight:600; font-size:15px; letter-spacing:0.3px; text-decoration:none;}
  .ex a.inline{color:var(--brass); font-weight:600; text-decoration:none;}
  .ex .grid{display:grid; gap:14px;}
  .ex .g2{grid-template-columns:1fr 1fr;}
  .ex .section{padding:3.25rem 1.25rem;}
  @media(max-width:760px){ .ex .g2{grid-template-columns:1fr;} }
`

export default function Page() {
  return (
    <div className="ex">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Nav */}
      <nav style={{ background: 'var(--navy-deep)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 1.5rem', borderBottom: '1px solid rgba(184,134,58,0.22)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ color: 'var(--brass-lt)', fontFamily: 'var(--display)', fontSize: 22, letterSpacing: 1, fontWeight: 600 }}>Boatclosers</div>
          <div className="sans" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginTop: 2 }}>Express · Florida</div>
        </Link>
        <Link href="/guides" className="sans" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13 }}>Guides</Link>
      </nav>

      {/* Hero */}
      <header style={{ background: 'var(--navy-deep)', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%', background: 'linear-gradient(180deg, var(--navy-sky) 0%, var(--navy-deep) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '58%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(184,134,58,0.5),transparent)' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', padding: '3.25rem 1.25rem 3.5rem' }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>BoatClosers Express · Florida</div>
          <h1 style={{ fontSize: 'clamp(29px,6vw,40px)', lineHeight: 1.16, color: '#fff' }}>
            Everything you need to buy a boat from a private seller — <span style={{ color: 'var(--brass-lt)' }}>inspection to title.</span>
          </h1>
          <p className="sans" style={{ fontSize: 16, color: 'rgba(255,255,255,0.76)', lineHeight: 1.75, marginTop: 16, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            You and the seller agreed on the price — Express handles the rest. Check the boat free, then get it inspected, signed, and titled right in Florida for a flat $29.99. No broker, no hassle, and the seller never signs up.
          </p>
          <div className="sans" style={{ display: 'inline-block', marginTop: 20, color: 'var(--brass-lt)', fontSize: 12, border: '0.5px solid rgba(184,134,58,0.45)', borderRadius: 20, padding: '6px 16px', letterSpacing: 0.5 }}>
            Free to check · $29.99 to close · no seller sign-up
          </div>
          <div style={{ marginTop: 24 }}>
            <a href="/express/start" className="btn">Start free</a>
          </div>
          <div className="sans" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 14 }}>No account needed. Pay only when you’re ready to buy.</div>
        </div>
      </header>

      {/* How it works — compact */}
      <section className="section" style={{ background: 'var(--sand)' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center' }}><span className="eyebrow">Four quick steps</span></div>
          <h2 style={{ textAlign: 'center', fontSize: 26, color: 'var(--navy)', margin: '14px 0 32px' }}>From handshake to clean title — without the hassle</h2>
          <div className="grid g2">
            {steps.map((s, i) => (
              <div key={s.title} className="card" style={{ borderLeft: `2.5px solid ${i < 2 ? 'var(--brass)' : 'var(--navy)'}`, borderRadius: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <h3 className="sans" style={{ color: 'var(--navy)', fontSize: 15.5, fontWeight: 600 }}>
                    <span style={{ color: 'var(--brass)', fontFamily: 'var(--serif)', marginRight: 7 }}>{i + 1}.</span>{s.title}
                  </h3>
                  <span className="sans" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase', color: i < 2 ? 'var(--brass)' : 'var(--slate)', whiteSpace: 'nowrap' }}>{s.price}</span>
                </div>
                <p className="sans" style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--slate)', margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Captain's tips helper */}
      <section className="section" style={{ background: 'var(--paper)', borderTop: '0.5px solid var(--mist)', borderBottom: '0.5px solid var(--mist)' }}>
        <div className="wrap" style={{ maxWidth: 680 }}>
          <div style={{ textAlign: 'center' }}><span className="eyebrow">A captain in your pocket</span></div>
          <h2 style={{ textAlign: 'center', fontSize: 25, color: 'var(--navy)', margin: '14px 0 10px' }}>Express nudges you along the way</h2>
          <p className="lead" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 30px' }}>
            Built by a licensed Florida yacht broker and captain, Express drops in the right tip at the right moment — the kind a pro would tell you — so the deal keeps moving and nothing trips you up.
          </p>
          {tips.map((t) => (
            <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--sand)', border: '0.5px solid var(--mist)', borderLeft: '2.5px solid var(--brass)', borderRadius: 3, padding: '14px 16px', marginBottom: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1, fill: 'none', stroke: 'var(--brass)', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c.5.5 1 1.2 1 2h6c0-.8.5-1.5 1-2a6 6 0 0 0-4-10z" />
              </svg>
              <div>
                <div className="sans" style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--brass)', fontWeight: 600, marginBottom: 4 }}>Captain’s tip</div>
                <div className="sans" style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text)' }}>{t}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing (dark) */}
      <section className="section" style={{ background: 'var(--navy)' }}>
        <div className="wrap" style={{ maxWidth: 620, textAlign: 'center' }}>
          <div className="eyebrow lt">One flat price</div>
          <h2 style={{ fontSize: 26, color: '#fff', margin: '14px 0 32px' }}>Check it free. Close it for $29.99.</h2>
          <div className="grid g2">
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(184,134,58,0.3)', borderRadius: 10, padding: 26 }}>
              <div className="sans" style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--brass-lt)', fontWeight: 500 }}>Check it</div>
              <div className="sans" style={{ fontSize: 40, color: '#fff', fontWeight: 600, margin: '8px 0' }}>Free</div>
              <div className="sans" style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)' }}>HIN check, lien check, seller questions, safe-payment tips.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--brass)', borderRadius: 10, padding: 26 }}>
              <div className="sans" style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--brass-lt)', fontWeight: 500 }}>Close it</div>
              <div className="sans" style={{ fontSize: 40, color: '#fff', fontWeight: 600, margin: '8px 0' }}>$29.99</div>
              <div className="sans" style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)' }}>Guided inspection, condition report, and every document to buy and title your boat, trailer, or motor.</div>
            </div>
          </div>
          <div style={{ marginTop: 28 }}><a href="/express/start" className="btn">Start free</a></div>
          <p className="sans" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 20, lineHeight: 1.7, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Still negotiating, or need escrow, a survey period, or financing? <Link href="/" style={{ color: 'var(--brass-lt)', fontWeight: 500 }}>Use full BoatClosers for $249</Link> — and your $29.99 comes off it.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: 'var(--sand)' }}>
        <div className="wrap" style={{ maxWidth: 680 }}>
          <h2 style={{ textAlign: 'center', fontSize: 25, color: 'var(--navy)', marginBottom: 26 }}>Quick questions</h2>
          {faqs.map((f) => (
            <div key={f.q} style={{ padding: '16px 0', borderBottom: '0.5px solid var(--mist)' }}>
              <h3 className="sans" style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 7 }}>{f.q}</h3>
              <p className="sans" style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--slate)', margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA (teal) */}
      <section style={{ background: 'var(--teal)', padding: '3.25rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 25, color: '#fff', marginBottom: 10 }}>Got the boat lined up? Start now.</h2>
        <p className="sans" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 22, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
          Check it free today. Unlock the inspection and paperwork when you’re ready to buy.
        </p>
        <a href="/express/start" className="btn" style={{ background: '#fff', color: 'var(--teal)' }}>Start free</a>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--navy-deep)', padding: '2.25rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--display)', color: 'var(--brass-lt)', fontSize: 18, letterSpacing: 1, fontWeight: 600 }}>Boatclosers</div>
        <div className="sans" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
          © {new Date().getFullYear()} BoatClosers · Private Vessel Transactions
        </div>
        <div className="sans" style={{ marginTop: 8, fontSize: 11 }}>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.6)' }}>Privacy</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}> · </span>
          <Link href="/sms-terms" style={{ color: 'rgba(255,255,255,0.6)' }}>Text message terms</Link>
        </div>
      </footer>
    </div>
  )
}
