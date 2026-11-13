import type { Metadata } from 'next'

// My Boat Closing landing page (myboatclosing.com, also /express).
// The idea: a private boat sale goes wrong at the title, so the hero is a
// seller's title marked up with the problems the kit catches. Everything else
// stays quiet: chart-paper background, harbor-navy ink, brass for actions.

export const metadata: Metadata = {
  title: 'My Boat Closing: The Kit for Buying a Boat From a Private Seller — $29.99',
  description:
    'Check the HIN, the boat and the seller’s title before you pay, sign your state’s bill of sale, and keep every paper in one Boat File. Free to start, $29.99 for the kit. All 50 states.',
  alternates: { canonical: 'https://myboatclosing.com' },
  openGraph: {
    type: 'website',
    url: 'https://myboatclosing.com',
    title: 'My Boat Closing — the closing kit for private boat sales',
    description: 'Check the title before you pay, sign the right papers, keep the file. $29.99, all 50 states.',
    images: [{ url: '/og-express.png', width: 1200, height: 630, alt: 'My Boat Closing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Boat Closing — the closing kit for private boat sales',
    description: 'Check the title before you pay, sign the right papers, keep the file. $29.99, all 50 states.',
    images: ['/og-express.png'],
  },
}

const START = '/express/start'

// The four ways a private sale goes wrong, and the tool that catches each.
const PROBLEMS = [
  {
    bad: 'The name on the title isn’t the person selling it.',
    why: 'Only the owner on the title can sell. A brother-in-law with the keys can’t.',
    tool: 'Title photo check',
  },
  {
    bad: 'There’s a lender on the title that was never paid off.',
    why: 'An unreleased lien stays with the boat, not the seller. You’d be buying their loan.',
    tool: 'Title photo check and lien check',
  },
  {
    bad: 'The HIN on the hull doesn’t match the paperwork.',
    why: 'A mismatch can mean a swapped title or a boat you’ll never get registered.',
    tool: 'Free HIN check',
  },
  {
    bad: 'The title gets rejected at the counter.',
    why: 'White-out, a missing co-owner’s signature, the wrong form. You find out after the seller is gone.',
    tool: 'Title signing guide and your state’s bill of sale',
  },
]

// The kit, in the order you use it.
const KIT = [
  {
    when: 'At the boat',
    tools: [
      { name: 'HIN check', note: 'Builder, real model year, recalls and Coast Guard records.', free: true, icon: 'hin' },
      { name: 'Quick walk-around', note: 'A dozen deal-breaker checks: soft deck, transom, signs it sank, cold start.', free: true, icon: 'walk' },
      { name: 'Questions for the seller', note: 'The ones that bring out what the listing left out.', free: true, icon: 'ask' },
    ],
  },
  {
    when: 'Before you pay',
    tools: [
      { name: 'Title photo check', note: 'Snap the front and back. We flag the wrong name, an open lien or a mismatched HIN.', icon: 'title' },
      { name: 'Lien check', note: 'What to look for on the title and how to confirm it’s released.', free: true, icon: 'lien' },
      { name: 'Paying safely', note: 'How to hand over money without getting scammed.', free: true, icon: 'pay' },
    ],
  },
  {
    when: 'At the handoff',
    tools: [
      { name: 'Your state’s bill of sale', note: 'The official form where your state has one. In Florida, every form is filled in for you.', icon: 'bos' },
      { name: 'Payment receipt', note: 'The seller signs that they were paid in full.', icon: 'receipt' },
      { name: 'Handoff checklist and photos', note: 'Keys, manuals, what’s included, all dated and recorded.', icon: 'camera' },
    ],
  },
  {
    when: 'After it’s yours',
    tools: [
      { name: 'Titling in your state', note: 'Which office, what to bring, and in Florida, your application pre-filled.', icon: 'stamp' },
      { name: 'Deadline reminders', note: 'Email and calendar reminders before your title is due.', icon: 'bell' },
      { name: 'Your Boat File', note: 'Every paper, your checks and a starter boat log in one download.', icon: 'file' },
    ],
  },
]

const FAQ = [
  {
    q: 'What does the $29.99 cover?',
    a: 'The whole kit for one purchase: the title photo check, your state’s bill of sale (filled in for you in Florida), the payment receipt, the handoff record, titling help and reminders, and your Boat File. A boat, a trailer and a motor in the same sale is still one price.',
  },
  {
    q: 'What can I do for free?',
    a: 'Start your purchase, run the HIN check, do the walk-around, the lien check and the seller questions, and read how to pay safely. You only pay when you want the papers.',
  },
  {
    q: 'Does the seller have to sign up?',
    a: 'No. The seller signs the papers with you at the handoff. If you want, we email them their copy.',
  },
  {
    q: 'Does it work in my state?',
    a: 'Yes, all 50 states. Florida forms are filled in for you. Elsewhere you get your state’s own bill of sale where it publishes one, with every value printed to copy onto it, and a guide to titling there.',
  },
  {
    q: 'Is the walk-around an inspection?',
    a: 'No. It’s a quick look for deal-breakers. For a full guided walkthrough, sea trial and written report, use My Boat Inspector. Neither replaces a professional marine survey.',
  },
  {
    q: 'What if my deal needs more than this?',
    a: 'If you need to negotiate, hold a deposit, make the sale depend on a survey, or finance the boat, move to full BoatClosers. Everything you entered comes with you, and your $29.99 comes off the $249.',
  },
]

function Icon({ name }: { name: string }) {
  const p: Record<string, JSX.Element> = {
    hin: <><rect x="3" y="7" width="18" height="10" rx="1.5" /><path d="M6.5 12h2M10.5 12h2M14.5 12h3" /></>,
    walk: <><path d="M3 15c3 2 6 3 9 3s6-1 9-3" /><path d="M5 15V9h11l3 6" /><path d="M9 9V6h4v3" /></>,
    ask: <><path d="M5 5h14v10H9l-4 4z" /><path d="M10 9.5a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9V13" /></>,
    title: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 8h8M8 12h5" /><circle cx="15.5" cy="16" r="2.5" /></>,
    lien: <><path d="M10 14a4 4 0 0 1 0-5.6l2-2a4 4 0 0 1 5.6 5.6l-1 1" /><path d="M14 10a4 4 0 0 1 0 5.6l-2 2a4 4 0 0 1-5.6-5.6l1-1" /></>,
    pay: <><rect x="3" y="6" width="18" height="12" rx="1.5" /><path d="M3 10h18" /><path d="M7 15h3" /></>,
    bos: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 17c1.5-1.5 2.5-1.5 3 0s1.5 1.5 3 0" /></>,
    receipt: <><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" /><path d="M9 8h6M9 12h6" /></>,
    camera: <><path d="M4 8h3l2-2h6l2 2h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
    stamp: <><path d="M9 4h6l-1 7h-4z" /><path d="M5 14h14v3H5z" /><path d="M5 20h14" /></>,
    bell: <><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z" /><path d="M10 21h4" /></>,
    file: <><path d="M3 7h6l2 2h10v11H3z" /><path d="M3 7V5h6l2 2" /></>,
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name]}
    </svg>
  )
}

// The hero: a seller's title, marked up in red the way a careful buyer would.
// Each mark is anchored to its own field, so it stays on target at any width.
function MarkedTitle() {
  return (
    <figure className="title-fig" aria-label="A boat title marked up with the four problems My Boat Closing checks for">
      <div className="title-doc">
        <div className="td-top">
          <div>
            <div className="td-state">State of Florida</div>
            <div className="td-name">Certificate of Title, Vessel</div>
          </div>
          <div className="td-no">No. 1197 4402</div>
        </div>
        <div className="td-row">
          <span className="lbl">Hull ID</span>
          <b className="mono flag" style={{ ['--d' as any]: '.3s' }}>CKS48213E515</b>
          <em className="note n-right" style={{ ['--d' as any]: '.45s' }}>not what’s on the hull!</em>
        </div>
        <div className="td-pair">
          <div><span className="lbl">Year and make</span><b>2015 Carolina Skiff</b></div>
          <div><span className="lbl">Length / hull</span><b>17 ft, fiberglass</b></div>
        </div>
        <div className="td-row">
          <span className="lbl">Owners</span>
          <b className="flag" style={{ ['--d' as any]: '.75s' }}>ROBERT T. HALE AND DIANE M. HALE</b>
          <em className="note n-below" style={{ ['--d' as any]: '.9s' }}>both must sign. where’s Diane?</em>
        </div>
        <div className="td-row">
          <span className="lbl">First lienholder</span>
          <b className="flag" style={{ ['--d' as any]: '1.2s' }}>SUNCOAST MARINE CREDIT UNION</b>
          <em className="note n-below" style={{ ['--d' as any]: '1.35s' }}>paid off? no release stamp</em>
        </div>
        <div className="td-transfer">
          <span className="lbl">Transfer of title by seller</span>
          <div className="td-lines">
            <i />
            <i />
            <span className="flag wo" style={{ ['--d' as any]: '1.65s' }}><i className="whiteout" /></span>
          </div>
          <em className="note n-wo" style={{ ['--d' as any]: '1.8s' }}>white-out = rejected</em>
        </div>
      </div>
      <figcaption>Each mark is a reason to stop and fix it before you pay. The kit walks you through every one.</figcaption>
    </figure>
  )
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap');
.mbc{
  --ink:#13233a; --ink-2:#3c4f66; --chart:#e9efec; --deck:#ffffff; --line:#cdd8d3;
  --paper:#fbf8ef; --guilloche:#d3e3d8; --brass:#b8863a; --brass-ink:#7c5719;
  --marker:#c2362b; --green:#2e7a55;
  --display:'Fraunces',Georgia,serif; --sans:'Inter',-apple-system,'Segoe UI',sans-serif; --hand:'Caveat','Comic Sans MS',cursive;
  background:var(--chart); color:var(--ink); font-family:var(--sans); font-size:16px; line-height:1.6;
  -webkit-font-smoothing:antialiased;
}
.mbc *{box-sizing:border-box}
.mbc a{color:inherit}
.mbc :focus-visible{outline:3px solid var(--brass); outline-offset:2px; border-radius:4px}
.mbc .wrap{max-width:1120px; margin:0 auto; padding:0 20px}
.mbc h1,.mbc h2,.mbc h3{font-family:var(--display); font-weight:600; margin:0; letter-spacing:-0.01em}
.mbc p{margin:0}

/* nav */
.mbc .nav{display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 0}
.mbc .brand{font-family:var(--display); font-weight:700; font-size:21px; text-decoration:none; letter-spacing:-0.01em}
.mbc .brand small{display:block; font-family:var(--sans); font-weight:500; font-size:12px; color:var(--ink-2); letter-spacing:0}
.mbc .nav-links{display:flex; align-items:center; gap:20px; font-size:15px}
.mbc .nav-links a{text-decoration:none; color:var(--ink-2)}
.mbc .nav-links a:hover{color:var(--ink)}

/* buttons */
.mbc .btn{display:inline-flex; align-items:center; justify-content:center; min-height:52px; padding:0 26px; border-radius:10px; background:var(--brass); color:#1b1206; font-weight:700; font-size:16.5px; text-decoration:none; border:0; cursor:pointer; box-shadow:0 2px 0 #8d6526}
.mbc .btn:hover{background:#c8963f}
.mbc .btn:active{transform:translateY(1px); box-shadow:0 1px 0 #8d6526}
.mbc .btn.small{min-height:42px; padding:0 18px; font-size:15px}
.mbc .btn.ghost{background:transparent; color:var(--ink); box-shadow:inset 0 0 0 1.5px var(--ink)}
.mbc .btn.ghost:hover{background:rgba(19,35,58,0.06)}

/* hero */
.mbc .hero{display:grid; grid-template-columns:1.02fr 1fr; gap:56px; align-items:center; padding:40px 0 72px}
.mbc .hero h1{font-size:clamp(38px,5.4vw,62px); line-height:1.02; letter-spacing:-0.025em; max-width:13ch}
.mbc .hero .sub{font-size:19px; line-height:1.55; color:var(--ink-2); margin-top:20px; max-width:34em}
.mbc .cta-row{display:flex; flex-wrap:wrap; align-items:center; gap:14px; margin-top:28px}
.mbc .reassure{font-size:14.5px; color:var(--ink-2); margin-top:14px}
.mbc .hinbox{margin-top:30px; padding-top:22px; border-top:1px solid var(--line); max-width:470px}
.mbc .hinbox label{display:block; font-weight:600; font-size:15px; margin-bottom:8px}
.mbc .hinbox .row{display:flex; gap:8px}
.mbc .hinbox input{flex:1; min-width:0; height:48px; border-radius:9px; border:1.5px solid var(--line); background:var(--deck); padding:0 14px; font:600 16px ui-monospace,Menlo,monospace; letter-spacing:0.08em; text-transform:uppercase; color:var(--ink)}
.mbc .hinbox input::placeholder{color:#97a6a0; letter-spacing:0.04em}
.mbc .hinbox button{height:48px; padding:0 18px; border-radius:9px; border:0; background:var(--ink); color:#fff; font-weight:600; font-size:15px; cursor:pointer}
.mbc .hinbox .hint{font-size:13.5px; color:var(--ink-2); margin-top:8px}

/* the marked-up title */
.mbc .title-fig{position:relative; margin:0; padding:10px 6px 0}
.mbc .title-doc{position:relative; background:var(--paper); border:1px solid #d9d2bd; border-radius:6px; padding:22px 26px 50px; transform:rotate(-1.6deg); box-shadow:0 1px 0 #e6dfca, 0 28px 44px -26px rgba(19,35,58,0.5);
  background-image:repeating-radial-gradient(circle at 115% -25%, transparent 0 11px, var(--guilloche) 11px 12px)}
.mbc .td-top{display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding-bottom:12px; border-bottom:1.5px solid #1f3a2c; margin-bottom:6px}
.mbc .td-state{font-family:var(--display); font-size:13px; color:#1f3a2c; font-weight:600}
.mbc .td-name{font-family:var(--display); font-size:19px; font-weight:700; color:#1f3a2c}
.mbc .td-no{font:600 12px ui-monospace,Menlo,monospace; color:#7a3b2e; white-space:nowrap}
.mbc .lbl{display:block; font-size:10.5px; color:#5d6f63; letter-spacing:0.02em}
.mbc .td-row{position:relative; padding:11px 0}
.mbc .td-row b,.mbc .td-pair b{font-size:14px; font-weight:600; color:#1b2a21}
.mbc .td-pair{display:grid; grid-template-columns:1fr 1fr; gap:18px; padding:8px 0}
.mbc .mono{font-family:ui-monospace,Menlo,monospace; letter-spacing:0.07em}
.mbc .flag{position:relative; display:inline-block}
.mbc .flag::after{content:""; position:absolute; inset:-7px -12px -6px -10px; border:2.5px solid var(--marker); border-radius:48% 52% 46% 54% / 60% 50% 55% 45%; transform:rotate(-1.5deg)}
.mbc .note{position:absolute; font-family:var(--hand); font-style:normal; font-weight:700; color:var(--marker); font-size:23px; line-height:1; white-space:nowrap}
.mbc .n-right{left:175px; top:22px; transform:rotate(-5deg)}
.mbc .n-below{right:-4px; bottom:-14px; transform:rotate(-3deg)}
.mbc .td-transfer{position:relative; border-top:1px dashed #9fb3a5; padding-top:10px; margin-top:8px}
.mbc .td-lines{display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-top:18px; align-items:center}
.mbc .td-lines i{display:block; height:1px; background:#7f8f84}
.mbc .td-lines .wo{display:block}
.mbc .td-lines i.whiteout{height:13px; background:#fffefa; border-radius:3px; box-shadow:0 0 0 1px #e5e0d1}
.mbc .n-wo{right:4px; bottom:-34px; transform:rotate(-3deg)}
.mbc .title-fig figcaption{font-size:14.5px; color:var(--ink-2); margin-top:26px; max-width:32em}
@media (prefers-reduced-motion:no-preference){
  .mbc .flag::after{animation:mbc-draw .5s ease-out both; animation-delay:var(--d,0s)}
  .mbc .note{animation:mbc-ink .4s ease-out both; animation-delay:var(--d,0s)}
}
@keyframes mbc-draw{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes mbc-ink{from{opacity:0}to{opacity:1}}

/* problems */
.mbc .band{background:var(--deck); border-top:1px solid var(--line); border-bottom:1px solid var(--line)}
.mbc .sec{padding-top:76px; padding-bottom:76px}
.mbc .sec-head{max-width:40em; margin-bottom:36px}
.mbc .sec-head h2{font-size:clamp(28px,3.6vw,40px); line-height:1.1}
.mbc .sec-head p{font-size:17.5px; color:var(--ink-2); margin-top:12px}
.mbc .probs{display:grid; grid-template-columns:1fr 1fr; gap:0; border-top:1px solid var(--line)}
.mbc .prob{display:grid; grid-template-columns:28px 1fr; gap:14px; padding:24px 22px 24px 0; border-bottom:1px solid var(--line)}
.mbc .prob:nth-child(odd){padding-right:36px; border-right:1px solid var(--line)}
.mbc .prob:nth-child(even){padding-left:28px}
.mbc .x{width:28px; height:28px; border-radius:50%; border:2px solid var(--marker); color:var(--marker); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; margin-top:2px}
.mbc .prob h3{font-family:var(--sans); font-size:18px; font-weight:700; line-height:1.35}
.mbc .prob .why{color:var(--ink-2); margin-top:6px}
.mbc .caught{display:inline-flex; align-items:center; gap:8px; margin-top:12px; font-weight:600; font-size:14.5px; color:var(--green)}
.mbc .caught::before{content:""; width:16px; height:9px; border-left:2.5px solid var(--green); border-bottom:2.5px solid var(--green); transform:rotate(-45deg) translateY(-2px)}

/* kit */
.mbc .kit{display:grid; grid-template-columns:repeat(4,1fr); gap:18px; counter-reset:moment}
.mbc .moment{background:var(--deck); border:1px solid var(--line); border-radius:14px; padding:20px 18px 8px; position:relative}
.mbc .moment h3{font-size:20px; display:flex; align-items:baseline; gap:10px; padding-bottom:12px; border-bottom:2px solid var(--ink)}
.mbc .moment h3::before{counter-increment:moment; content:counter(moment); font-family:var(--sans); font-size:13px; font-weight:700; color:var(--brass-ink); background:#f3ead8; border-radius:6px; padding:1px 7px}
.mbc .tool{display:grid; grid-template-columns:24px 1fr; gap:12px; padding:14px 0; border-bottom:1px solid #e6ece9}
.mbc .tool:last-child{border-bottom:0}
.mbc .tool svg{color:var(--ink); margin-top:2px}
.mbc .tool b{display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:15.5px}
.mbc .tool .free{font-size:12px; font-weight:700; color:var(--green); background:#e3f0e8; border-radius:5px; padding:0 6px}
.mbc .tool p{font-size:14px; color:var(--ink-2); margin-top:3px; line-height:1.5}

/* price */
.mbc .price{display:grid; grid-template-columns:1.1fr 1fr; gap:48px; align-items:start}
.mbc .tag{position:relative; background:var(--ink); color:#fff; border-radius:16px; padding:30px 30px 26px}
.mbc .tag .amt{font-family:var(--display); font-size:72px; font-weight:700; line-height:1; letter-spacing:-0.03em}
.mbc .tag .amt sup{font-size:28px; vertical-align:top; position:relative; top:10px; margin-right:2px}
.mbc .tag .per{color:#c9d3dd; margin-top:8px; font-size:16px}
.mbc .tag ul{list-style:none; padding:0; margin:22px 0 24px; display:grid; gap:9px; font-size:15.5px}
.mbc .tag li{display:grid; grid-template-columns:20px 1fr; gap:10px}
.mbc .tag li::before{content:""; width:12px; height:7px; border-left:2.5px solid #e2b867; border-bottom:2.5px solid #e2b867; transform:rotate(-45deg); margin-top:7px}
.mbc .tag .btn{width:100%}
.mbc .tag .after{font-size:13.5px; color:#c9d3dd; text-align:center; margin-top:12px}
.mbc .vs h3{font-size:24px; line-height:1.2}
.mbc .vs p{color:var(--ink-2); margin-top:10px}
.mbc .costs{list-style:none; padding:0; margin:20px 0 0; border-top:1px solid var(--line)}
.mbc .costs li{display:flex; justify-content:space-between; gap:16px; padding:13px 0; border-bottom:1px solid var(--line); font-size:15.5px}
.mbc .costs li span:last-child{color:var(--marker); font-weight:700; text-align:right}

/* other tools */
.mbc .others{display:grid; grid-template-columns:repeat(3,1fr); gap:28px}
.mbc .other{border-top:3px solid var(--ink); padding-top:16px}
.mbc .other h3{font-size:20px}
.mbc .other .p{font-weight:700; color:var(--brass-ink); font-size:15px; margin-top:2px}
.mbc .other p.d{color:var(--ink-2); margin-top:8px; font-size:15px}
.mbc .other a{display:inline-block; margin-top:10px; font-weight:600; font-size:15px}

/* faq */
.mbc .faq{max-width:760px}
.mbc details{border-bottom:1px solid var(--line); padding:4px 0}
.mbc summary{cursor:pointer; list-style:none; display:flex; justify-content:space-between; gap:16px; padding:16px 0; font-weight:600; font-size:17px}
.mbc summary::-webkit-details-marker{display:none}
.mbc summary::after{content:"+"; font-size:22px; line-height:1; color:var(--brass-ink)}
.mbc details[open] summary::after{content:"–"}
.mbc details p{color:var(--ink-2); padding:0 0 18px; max-width:44em}

/* closing band */
.mbc .final{background:var(--ink); color:#fff; padding:70px 0}
.mbc .final h2{font-size:clamp(30px,4vw,46px); line-height:1.08; max-width:18ch}
.mbc .final p{color:#c9d3dd; margin-top:14px; font-size:18px; max-width:34em}
.mbc .final .cta-row{margin-top:26px}
.mbc .final .btn.ghost{color:#fff; box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.7)}
.mbc .final .btn.ghost:hover{background:rgba(255,255,255,0.08)}
.mbc .foot{padding:26px 0 96px; font-size:13.5px; color:var(--ink-2)}
.mbc .foot a{margin-right:16px}

/* sticky phone CTA */
.mbc .sticky{display:none}

@media (max-width:980px){
  .mbc .hero{grid-template-columns:1fr; gap:24px; padding-top:20px}
  .mbc .title-fig{max-width:520px}
  .mbc .kit{grid-template-columns:1fr 1fr}
  .mbc .price{grid-template-columns:1fr}
}
@media (max-width:680px){
  .mbc .nav-links .hide-sm{display:none}
  .mbc .hero h1{font-size:40px}
  .mbc .hero .sub{font-size:17.5px}
  .mbc .cta-row .btn{flex:1 1 100%}
  .mbc .probs{grid-template-columns:1fr}
  .mbc .prob,.mbc .prob:nth-child(odd),.mbc .prob:nth-child(even){padding:20px 0; border-right:0}
  .mbc .kit{grid-template-columns:1fr}
  .mbc .others{grid-template-columns:1fr; gap:22px}
  .mbc .sec{padding-top:56px; padding-bottom:56px}
  .mbc .td-row{padding:13px 0 16px}
  .mbc .title-doc{padding:18px 16px 26px}
  .mbc .td-name{font-size:16px}
  .mbc .td-row b{font-size:12.5px}
  .mbc .note{font-size:20px}
  .mbc .n-right{left:150px; top:24px}
  .mbc .title-doc{padding-bottom:46px}
  .mbc .sticky{display:flex; position:fixed; left:0; right:0; bottom:0; z-index:50; gap:12px; align-items:center; padding:12px 16px calc(12px + env(safe-area-inset-bottom)); background:rgba(233,239,236,0.96); border-top:1px solid var(--line); backdrop-filter:blur(6px)}
  .mbc .sticky .btn{flex:0 0 auto; min-height:46px; white-space:nowrap; padding:0 20px}
  .mbc .sticky span{font-size:13px; color:var(--ink-2); line-height:1.3}
}
`

export default function Page() {
  return (
    <div className="mbc">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="wrap">
        <nav className="nav" aria-label="Main">
          <a href="/express" className="brand">
            My Boat Closing
            <small>from BoatClosers</small>
          </a>
          <div className="nav-links">
            <a href="#kit" className="hide-sm">What’s in the kit</a>
            <a href="#price" className="hide-sm">Price</a>
            <a href={START} className="btn small">Start free</a>
          </div>
        </nav>

        <header className="hero">
          <div>
            <h1>Don’t hand over the money until you’ve checked the title.</h1>
            <p className="sub">
              My Boat Closing is the kit for buying a boat from a private seller. Check the boat and the title with us, sign your state’s bill of sale, and drive home with every paper in one file.
            </p>
            <div className="cta-row">
              <a href={START} className="btn">Start your purchase free</a>
              <a href="#kit" className="btn ghost">See what’s in the kit</a>
            </div>
            <p className="reassure">Free until you need the papers, then $29.99 for everything. The seller never signs up. Works in all 50 states.</p>

            <form className="hinbox" action="/hin-check" method="get">
              <label htmlFor="hero-hin">Looking at a boat right now? Check its HIN free.</label>
              <div className="row">
                <input id="hero-hin" name="hin" placeholder="CKS48213E515" maxLength={16} autoComplete="off" spellCheck={false} />
                <button type="submit">Check it</button>
              </div>
              <p className="hint">The 12 characters on the back right corner of the hull. No signup.</p>
            </form>
          </div>
          <MarkedTitle />
        </header>
      </div>

      <section className="band">
        <div className="wrap sec">
          <div className="sec-head">
            <h2>Most private boat sales that go wrong, go wrong at the title.</h2>
            <p>And you usually find out after the seller has your money. Here are four of the most common problems, and what in the kit catches each one.</p>
          </div>
          <div className="probs">
            {PROBLEMS.map((p) => (
              <div key={p.bad} className="prob">
                <span className="x" aria-hidden="true">✕</span>
                <div>
                  <h3>{p.bad}</h3>
                  <p className="why">{p.why}</p>
                  <span className="caught">Caught by: {p.tool}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kit" className="wrap sec">
        <div className="sec-head">
          <h2>Twelve tools, in the order you’ll use them.</h2>
          <p>Everything you’d want checked and handed to you, in one place. Start with the free ones the day you go look at the boat.</p>
        </div>
        <div className="kit">
          {KIT.map((m) => (
            <div key={m.when} className="moment">
              <h3>{m.when}</h3>
              {m.tools.map((t) => (
                <div key={t.name} className="tool">
                  <Icon name={t.icon} />
                  <div>
                    <b>
                      {t.name}
                      {t.free && <span className="free">Free</span>}
                    </b>
                    <p>{t.note}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="price" className="band">
        <div className="wrap sec price">
          <div className="tag">
            <div className="amt">
              <sup>$</sup>29.99
            </div>
            <p className="per">One price for the whole kit, for one purchase. Boat, trailer and motor together count as one.</p>
            <ul>
              <li>Title photo check, up to 3 times</li>
              <li>Your state’s bill of sale, and in Florida every form filled in</li>
              <li>Payment receipt, handoff checklist and dated photos</li>
              <li>Titling help for your state and deadline reminders</li>
              <li>Your Boat File: every paper and a starter boat log</li>
            </ul>
            <a href={START} className="btn">Start your purchase free</a>
            <p className="after">You pay when you unlock the papers. Add My Boat Inspector then and the pair is $79.99.</p>
          </div>
          <div className="vs">
            <h3>Small next to what one mistake costs.</h3>
            <p>The kit pays for itself the first time it stops you from signing something you shouldn’t.</p>
            <ul className="costs">
              <li><span>Someone else’s loan, if a lien wasn’t released</span><span>The loan balance</span></li>
              <li><span>A title rejected at the counter</span><span>Another trip, maybe a lost sale</span></li>
              <li><span>A boat whose HIN doesn’t match its papers</span><span>A boat you can’t register</span></li>
              <li><span>Missing your state’s title deadline</span><span>Late penalties</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-head">
          <h2>Need something else?</h2>
          <p>My Boat Closing does one job: closing a simple sale where the price is already agreed. Each of these does a different one.</p>
        </div>
        <div className="others">
          <div className="other">
            <h3>My Boat Inspector</h3>
            <div className="p">$59.99</div>
            <p className="d">Before you buy: a guided walkthrough of the whole boat and a sea trial, with a written report to negotiate with.</p>
            <a href="https://myboatinspector.com">Look at My Boat Inspector</a>
          </div>
          <div className="other">
            <h3>BoatClosers</h3>
            <div className="p">$249, with your $29.99 credited</div>
            <p className="d">When you need offers, a deposit held by a neutral party, survey conditions or financing, with the seller in the deal.</p>
            <a href="/">Look at BoatClosers</a>
          </div>
          <div className="other">
            <h3>My Boat Logs</h3>
            <div className="p">$39.99 a year, 14 days free</div>
            <p className="d">After it’s yours: maintenance, receipts and reminders, and a full history to hand the next buyer.</p>
            <a href="https://myboatlogs.com">Look at My Boat Logs</a>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap sec">
          <div className="sec-head">
            <h2>Questions people ask first</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2>Found the boat? Start the kit before you go see it.</h2>
          <p>Enter what you’re buying and run the free checks today. Unlock the papers when the deal is ready.</p>
          <div className="cta-row">
            <a href={START} className="btn">Start your purchase free</a>
            <a href="/hin-check" className="btn ghost">Check a HIN first</a>
          </div>
        </div>
      </section>

      <footer className="wrap foot">
        <a href="/guides">Guides</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <p style={{ marginTop: 10 }}>
          My Boat Closing is part of BoatClosers. We’re not a party to your sale and don’t give legal advice. The walk-around and title check help you spot problems; they’re not a marine survey or a title search.
        </p>
      </footer>

      <div className="sticky">
        <span>Free to start. $29.99 when you need the papers.</span>
        <a href={START} className="btn">Start free</a>
      </div>
    </div>
  )
}
