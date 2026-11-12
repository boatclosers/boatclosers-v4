import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Boat Closing: Private Boat Sale Paperwork and Title, Done Right — $29.99, All 50 States',
  description:
    'You agreed on a price with a private seller. My Boat Closing does the rest: free HIN and lien checks, a walk-around, a title photo check, your state’s bill of sale, and a Boat File with every paper, for a flat $29.99. All 50 states.',
  alternates: {
    canonical: 'https://www.boatclosers.com/express',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com/express',
    title: 'My Boat Closing — $29.99',
    description:
      'Check the boat and the title, get your state’s bill of sale, and keep every paper in one Boat File. $29.99, all 50 states.',
    images: [{ url: '/og-express.png', width: 1200, height: 630, alt: 'My Boat Closing — $29.99' }],
  },
  // Its own X/Twitter card, so shares don't inherit the homepage's $249 text.
  twitter: {
    card: 'summary_large_image',
    title: 'My Boat Closing — $29.99',
    description:
      'Private boat sale paperwork and title, done right. $29.99, all 50 states.',
    images: ['/og-express.png'],
  },
}

const steps = [
  { title: 'Vessel', price: 'Free', text: 'Tell us what you’re buying: boat, trailer, motor, or all three. We check the HIN against the Coast Guard for free.' },
  { title: 'Parties', price: 'Free', text: 'You and the seller, exactly as you’ll appear on the title. The seller never signs up.' },
  { title: 'Price', price: 'Free', text: 'The price you agreed, the sale date, how you’re paying, and what comes with it.' },
  { title: 'Check', price: 'Free', text: 'A quick walk-around for deal-breakers, a lien check, the questions to ask the seller, and how to pay safely.' },
  { title: 'Documents', price: '$29.99', text: 'Your state’s bill of sale (Florida forms filled in), a title photo check, a payment receipt and a title signing guide.' },
  { title: 'Closing', price: 'Included', text: 'Handoff checklist and photos, the seller’s copy, how to title it in your state, and your Boat File with every paper.' },
]

const tips = [
  'Run the free HIN check before you drive out. Two minutes now can save you a wasted trip if the paperwork doesn’t match the boat.',
  'Sign the title and the bill of sale at the same moment you hand over payment. Doing it all at once is what keeps a simple sale clean.',
  'Don’t wire a deposit to hold a boat on a cash deal. Pay in full, in person, at the handoff — once the papers are signed.',
  'In Florida the clock starts at the sale: you have 30 days to title it. We remind you before it runs out.',
  'Bring a blue or black pen. A title signed in any other color can be rejected at the counter.',
]

const faqs = [
  { q: 'What do I get for $29.99?', a: 'A title photo pre-check before you pay, your state’s bill of sale (in Florida every form is filled in, including your title application), a payment receipt, a title signing guide, the walk-around and handoff records, the vessel history from the HIN, the seller’s copy emailed to them, and your Boat File with every paper and a starter boat log. One price for a boat, a trailer, a motor, or all three.' },
  { q: 'What’s free?', a: 'Everything before the papers: entering your deal, the HIN check, the quick walk-around, the lien check, the questions to ask the seller, and safe-payment tips. You pay only when you’re ready for the documents.' },
  { q: 'Does My Boat Closing include an inspection?', a: 'No. Looking the boat over is My Boat Inspector’s job: a guided walkthrough and sea trial with a written report ($59.99, or $79.99 together with Express). Neither one replaces a professional marine survey.' },
  { q: 'Does the seller have to sign up?', a: 'No account needed. The seller signs the bill of sale and title in person at the handoff, and we can email them their copy.' },
  { q: 'What if my deal needs more?', a: 'My Boat Closing is for a simple sale: price agreed, nothing held in escrow, clear title. If you need to negotiate, hold a deposit, make the sale depend on a survey, or finance it, move to full BoatClosers. Everything you entered moves with you, and your $29.99 comes off the $249.' },
  { q: 'Does it work in my state?', a: 'Yes, all 50 states and DC. In Florida every state form is filled in for you. In other states you get that state’s own official bill of sale where it has one, with every value printed for you to copy, our bill of sale where it doesn’t, and a guide to titling there with links to the official agency.' },
]

const gets = [
  'Title photo pre-check: the wrong name, an unreleased lien or a mismatched HIN, caught before you pay',
  'A quick walk-around for deal-breakers, saved as a dated record',
  'Vessel history from the HIN: builder, recalls and Coast Guard records',
  'Your state’s official bill of sale where it has one, with every value printed to copy',
  'Florida: bill of sale, HSMV 82050 and title application all filled in',
  'A payment receipt for the seller to sign',
  'A title signing guide built for how the boat is titled',
  'How to title it in your state, with links to the official agency',
  'A handoff checklist and dated photo record',
  'The seller’s copy emailed to them, no account needed',
  'Your Boat File: every paper plus a starter boat log, in one download',
  'Answer one question at a time, or fill in the full form',
]

const products = [
  { name: 'My Boat Closing', price: '$29.99', when: 'Price agreed, simple sale', text: 'Check the boat and the title, sign the right papers, keep the file. Buyer only; the seller just signs at the handoff.', href: '/express/start', cta: 'Start free' },
  { name: 'My Boat Inspector', price: '$59.99', when: 'Before you buy', text: 'A guided walkthrough of the boat and a sea trial, with a written report to negotiate with. Doesn’t replace a marine survey.', href: 'https://myboatinspector.com', cta: 'See My Boat Inspector' },
  { name: 'BoatClosers', price: '$249', when: 'Negotiating, deposit, survey, financing', text: 'Offers, a signed purchase agreement, a deposit held by a neutral party, survey and sea trial conditions, and closing, with the seller in the deal.', href: '/', cta: 'See BoatClosers' },
  { name: 'My Boat Logs', price: '$39.99/yr', when: 'After it’s yours', text: 'Maintenance, receipts, documents and reminders for your boat, and a history to hand the next buyer. 14-day free trial.', href: 'https://myboatlogs.com', cta: 'See My Boat Logs' },
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
          <div style={{ color: 'var(--brass-lt)', fontFamily: 'var(--display)', fontSize: 22, letterSpacing: 1, fontWeight: 600 }}>My Boat Closing</div>
          <div className="sans" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginTop: 2 }}>from BoatClosers</div>
        </Link>
        <Link href="/guides" className="sans" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13 }}>Guides</Link>
      </nav>

      {/* Hero */}
      <header style={{ background: 'var(--navy-deep)', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%', background: 'linear-gradient(180deg, var(--navy-sky) 0%, var(--navy-deep) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '58%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(184,134,58,0.5),transparent)' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', padding: '3.25rem 1.25rem 3.5rem' }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>My Boat Closing · All 50 states</div>
          <h1 style={{ fontSize: 'clamp(29px,6vw,40px)', lineHeight: 1.16, color: '#fff' }}>
            You agreed on a price. <span style={{ color: 'var(--brass-lt)' }}>We do the paperwork and title.</span>
          </h1>
          <p className="sans" style={{ fontSize: 16, color: 'rgba(255,255,255,0.76)', lineHeight: 1.75, marginTop: 16, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Buying from a private seller, in any state? Enter the deal once. We check the boat and the title with you, give you the right bill of sale for your state, and hand you a Boat File with every paper. Free to check. $29.99 for the paperwork. The seller never needs an account.
            </p>
          <div className="sans" style={{ display: 'inline-block', marginTop: 20, color: 'var(--brass-lt)', fontSize: 12, border: '0.5px solid rgba(184,134,58,0.45)', borderRadius: 20, padding: '6px 16px', letterSpacing: 0.5 }}>
            Free to check · $29.99 for your paperwork · no seller account
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
          <div style={{ textAlign: 'center' }}><span className="eyebrow">Six steps, the same as BoatClosers</span></div>
          <h2 style={{ textAlign: 'center', fontSize: 26, color: 'var(--navy)', margin: '14px 0 32px' }}>From handshake to clean title — without the hassle</h2>
          <div className="grid g2">
            {steps.map((s, i) => (
              <div key={s.title} className="card" style={{ borderLeft: `2.5px solid ${i === 4 ? 'var(--brass)' : 'var(--navy)'}`, borderRadius: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <h3 className="sans" style={{ color: 'var(--navy)', fontSize: 15.5, fontWeight: 600 }}>
                    <span style={{ color: 'var(--brass)', fontFamily: 'var(--serif)', marginRight: 7 }}>{i + 1}.</span>{s.title}
                  </h3>
                  <span className="sans" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase', color: i === 4 ? 'var(--brass)' : 'var(--slate)', whiteSpace: 'nowrap' }}>{s.price}</span>
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
          <h2 style={{ textAlign: 'center', fontSize: 25, color: 'var(--navy)', margin: '14px 0 10px' }}>We nudge you along the way</h2>
          <p className="lead" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 30px' }}>
            Built by a licensed Florida yacht broker and captain, My Boat Closing drops in the right tip at the right moment — the kind a pro would tell you — so the deal keeps moving and nothing trips you up.
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
          <h2 style={{ fontSize: 26, color: '#fff', margin: '14px 0 32px' }}>Check it free. Paperwork for $29.99.</h2>
          <div className="grid g2">
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(184,134,58,0.3)', borderRadius: 10, padding: 26 }}>
              <div className="sans" style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--brass-lt)', fontWeight: 500 }}>Check it</div>
              <div className="sans" style={{ fontSize: 40, color: '#fff', fontWeight: 600, margin: '8px 0' }}>Free</div>
              <div className="sans" style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)' }}>HIN check, lien check, seller questions, safe-payment tips.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--brass)', borderRadius: 10, padding: 26 }}>
              <div className="sans" style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--brass-lt)', fontWeight: 500 }}>Close it</div>
              <div className="sans" style={{ fontSize: 40, color: '#fff', fontWeight: 600, margin: '8px 0' }}>$29.99</div>
              <div className="sans" style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)' }}>Every paper to buy and title your boat, trailer, or motor, filled in, plus your handoff checklist, the seller’s copy, and deadline reminders.</div>
            </div>
          </div>
          <div style={{ marginTop: 28 }}><a href="/express/start" className="btn">Start free</a></div>
          <p className="sans" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 20, lineHeight: 1.7, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Still negotiating, or need escrow, a survey period, or financing? <Link href="/" style={{ color: 'var(--brass-lt)', fontWeight: 500 }}>Move up to full BoatClosers</Link>. Everything you entered moves with you, and your $29.99 comes off the $249.
          </p>
        </div>
      </section>

      {/* What you get, and the other products */}
      <section className="section" style={{ background: 'var(--paper)' }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center' }}><span className="eyebrow">What you get for $29.99</span></div>
          <h2 style={{ textAlign: 'center', fontSize: 25, color: 'var(--navy)', margin: '14px 0 22px' }}>Every paper, filled in once</h2>
          <div className="grid g2" style={{ marginBottom: 40 }}>
            {gets.map((g) => (
              <div key={g} className="sans" style={{ display: 'flex', gap: 10, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)' }}>
                <span style={{ color: 'var(--brass)', fontWeight: 700 }}>✓</span>
                <span>{g}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}><span className="eyebrow">Pick what your deal needs</span></div>
          <h2 style={{ textAlign: 'center', fontSize: 25, color: 'var(--navy)', margin: '14px 0 22px' }}>Four tools, each with its own job</h2>
          <div className="grid g2">
            {products.map((p) => (
              <div key={p.name} className="card" style={{ borderTop: `2.5px solid ${p.name === 'My Boat Closing' ? 'var(--brass)' : 'var(--mist)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <h3 className="sans" style={{ color: 'var(--navy)', fontSize: 16, fontWeight: 600 }}>{p.name}</h3>
                  <span className="sans" style={{ color: 'var(--brass)', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{p.price}</span>
                </div>
                <div className="sans" style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--slate)', margin: '4px 0 8px' }}>{p.when}</div>
                <p className="sans" style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--slate)', margin: '0 0 10px' }}>{p.text}</p>
                {p.href && <a href={p.href} className="sans" style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>{p.cta}</a>}
              </div>
            ))}
          </div>
          <p className="sans" style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate)', marginTop: 18 }}>Bundle: My Boat Closing + My Boat Inspector for $79.99, at checkout.</p>
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
          Check it free today. Unlock your paperwork when you’re ready to buy.
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
