import type { Metadata } from 'next'

// My Boat Closing landing page (myboatclosing.com, also /express).
// The hook is the free HIN check: does the boat match its paperwork? The story
// is the real one: you walked the boat, shook on a price, maybe handed over a
// deposit, and now neither of you knows how to close it. We walk you through it.

export const metadata: Metadata = {
  title: 'My Boat Closing: Check the HIN Free, Then Close the Boat Sale Right',
  description:
    'Shook hands on a boat? Check the HIN free to see the boat matches its paperwork, then get your state’s bill of sale and step-by-step help signing the title. $29.99 for the paperwork, all 50 states.',
  alternates: { canonical: 'https://myboatclosing.com' },
  openGraph: {
    type: 'website',
    url: 'https://myboatclosing.com',
    title: 'My Boat Closing: close a private boat sale the right way',
    description: 'Free HIN check, your state’s bill of sale, and step-by-step help signing the title. All 50 states.',
    images: [{ url: '/og-express.png', width: 1200, height: 630, alt: 'My Boat Closing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Boat Closing: close a private boat sale the right way',
    description: 'Free HIN check, your state’s bill of sale, and step-by-step help signing the title. All 50 states.',
    images: ['/og-express.png'],
  },
}

const START = '/express/start'

// How a private boat sale really goes, up to the moment people get stuck.
const STORY = [
  { step: 'You go look at the boat', note: 'Walk it, start it, ask your questions.' },
  { step: 'You make an offer', note: 'Right there at the trailer, or a number by text.' },
  { step: 'You shake on it', note: 'Maybe a deposit by Zelle, or a couple hundred in cash.' },
  { step: 'You go get the money', note: 'The bank for a cashier’s check, or home for cash.' },
  { step: 'Now what?', note: 'You search “boat bill of sale” and get a generic form. Neither of you is sure where to sign the title.', stuck: true },
]

const GROUPS = [
  {
    title: 'Check the boat',
    price: 'Free',
    tools: [
      { name: 'HIN check', note: 'Does the boat match its paperwork? Builder, real model year, recalls and Coast Guard records.', icon: 'hin' },
      { name: 'Quick walk-around', note: 'A dozen things to look at before you make an offer, saved with your notes.', icon: 'walk' },
      { name: 'Questions for the seller', note: 'The ones that bring out what the listing left out. We can email them for you.', icon: 'ask' },
      { name: 'Lien check and paying safely', note: 'How to see if a loan is still on the boat, and how to hand over money without getting burned.', icon: 'lien' },
    ],
  },
  {
    title: 'Close it right',
    price: '$29.99',
    tools: [
      { name: 'Your state’s bill of sale', note: 'The state’s own form where it has one, with everything filled in or printed for you to copy. Every Florida form, done.', icon: 'bos' },
      { name: 'How to sign the title', note: 'Step by step for how the boat is titled: who signs, where, and what gets a title rejected.', icon: 'stamp' },
      { name: 'Title photo check', note: 'Snap the seller’s title before you pay and we read it for problems.', icon: 'title' },
      { name: 'Payment receipt and handoff record', note: 'The seller signs that they’re paid. Keys, manuals and what’s included, dated with photos.', icon: 'receipt' },
    ],
  },
  {
    title: 'After it’s yours',
    price: 'Included',
    tools: [
      { name: 'Titling in your state', note: 'Which office, what to bring, and in Florida, your title application pre-filled.', icon: 'pay' },
      { name: 'Deadline reminders', note: 'Email and calendar reminders before your title is due.', icon: 'bell' },
      { name: 'The seller’s copy', note: 'We email the seller their papers. They never need an account.', icon: 'camera' },
      { name: 'Your Boat File', note: 'Every paper and a starter boat log in one download, ready for the day you sell.', icon: 'file' },
    ],
  },
]

const FAQ = [
  {
    q: 'Who is My Boat Closing for?',
    a: 'Buyers in an everyday private sale: a skiff, bay boat, pontoon or center console, usually under $50,000, where you’ve agreed on a price and just want the sale organized and done right. No escrow, no survey period, no broker.',
  },
  {
    q: 'Is the HIN check really free?',
    a: 'Yes, with no signup. Type the HIN from the back corner of the hull and see the builder, the model year it was built for, any recalls, and Coast Guard records. Compare it to the listing and the title before you go further.',
  },
  {
    q: 'What does the $29.99 cover?',
    a: 'Everything to close one purchase: your state’s bill of sale, step-by-step title signing, the title photo check, the payment receipt and handoff record, titling help and reminders, and your Boat File. A boat, trailer and motor in the same sale is still one price.',
  },
  {
    q: 'We already agreed on a price and I gave a deposit. Is it too late?',
    a: 'No, that’s exactly when most people find us. Start your purchase with the price you agreed, and you’ll have the papers ready before you go back with the money.',
  },
  {
    q: 'Does the seller have to sign up?',
    a: 'No. You run it from your phone, and the seller signs the papers with you at the handoff. We can email them their copy.',
  },
  {
    q: 'Does it work in my state?',
    a: 'Yes, all 50 states. Florida forms are filled in for you. Elsewhere you get your state’s own bill of sale where it publishes one, with every value printed to copy onto it, and a guide to titling there.',
  },
  {
    q: 'What if my deal needs more than this?',
    a: 'If you want a neutral party to hold the deposit, a signed purchase agreement, a survey period, or financing, move to full BoatClosers. Everything you entered comes with you, and your $29.99 comes off the $249.',
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


const css = `
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

/* hero: the HIN plate */
.mbc .hero{grid-template-areas:'intro plate' 'cta plate'; grid-template-rows:auto 1fr; row-gap:0}
.mbc .hero-intro{grid-area:intro; align-self:end}
.mbc .hero-cta{grid-area:cta; align-self:start}
.mbc .plate-wrap{grid-area:plate; position:relative}
.mbc .transom{position:relative; height:190px; border-radius:22px 22px 6px 6px; background:linear-gradient(180deg,#ffffff 0%,#f1f4f2 55%,#dfe6e2 100%); border:1px solid var(--line); overflow:hidden}
.mbc .transom::before{content:""; position:absolute; left:0; right:0; top:44px; height:9px; background:var(--ink); opacity:.92}
.mbc .transom::after{content:""; position:absolute; left:0; right:0; top:57px; height:3px; background:var(--brass)}
.mbc .plate{position:absolute; right:34px; top:92px; width:300px; padding:12px 18px 13px; border-radius:6px; background:linear-gradient(160deg,#eef1f3,#c9d0d6 55%,#e7eaed); box-shadow:inset 0 1px 0 #fff, inset 0 -1px 0 #9aa4ad, 0 3px 8px -3px rgba(19,35,58,.45)}
.mbc .rivet{position:absolute; top:50%; width:7px; height:7px; margin-top:-3.5px; border-radius:50%; background:radial-gradient(circle at 35% 35%,#fff,#8f99a2)}
.mbc .r1{left:7px} .mbc .r2{right:7px}
.mbc .plate-label{display:block; font-size:9.5px; letter-spacing:.06em; color:#4e5a64; text-align:center}
.mbc .plate-hin{display:block; font:700 23px ui-monospace,Menlo,monospace; letter-spacing:.14em; color:#2b3540; text-align:center; text-shadow:0 1px 0 rgba(255,255,255,.8), 0 -1px 0 rgba(0,0,0,.25)}
.mbc .hin-card{position:relative; margin:-34px 18px 0; background:var(--deck); border:1px solid var(--line); border-radius:16px; padding:22px 22px 18px; box-shadow:0 22px 40px -28px rgba(19,35,58,.55)}
.mbc .hin-card label{display:block; font-weight:700; font-size:16.5px; margin-bottom:10px}
.mbc .hin-card .row{display:flex; gap:8px}
.mbc .hin-card input{flex:1; min-width:0; height:52px; border-radius:10px; border:1.5px solid var(--line); background:#fbfcfb; padding:0 14px; font:600 17px ui-monospace,Menlo,monospace; letter-spacing:.08em; text-transform:uppercase; color:var(--ink)}
.mbc .hin-card input::placeholder{color:#a5b2ad; letter-spacing:.06em}
.mbc .hin-card button{height:52px; padding:0 18px; border-radius:10px; border:0; background:var(--brass); color:#1b1206; font-weight:700; font-size:15.5px; cursor:pointer; box-shadow:0 2px 0 #8d6526; white-space:nowrap}
.mbc .hin-card button:hover{background:#c8963f}
.mbc .hin-gets{list-style:none; padding:0; margin:16px 0 0; display:grid; gap:7px; font-size:15px}
.mbc .hin-gets li{display:grid; grid-template-columns:20px 1fr; gap:8px}
.mbc .hin-gets li::before{content:""; width:12px; height:7px; border-left:2.5px solid var(--green); border-bottom:2.5px solid var(--green); transform:rotate(-45deg); margin-top:7px}
.mbc .hin-card .hint{font-size:13.5px; color:var(--ink-2); margin-top:12px}

/* story */
.mbc .story{list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(5,1fr); gap:0; counter-reset:st}
.mbc .story li{position:relative; padding:20px 18px 0 0; border-top:3px solid var(--line)}
.mbc .story li::before{counter-increment:st; content:counter(st); position:absolute; top:-15px; left:0; width:27px; height:27px; border-radius:50%; background:var(--deck); border:2px solid var(--ink-2); color:var(--ink-2); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center}
.mbc .story b{display:block; font-size:17px; margin-top:8px}
.mbc .story p{color:var(--ink-2); font-size:14.5px; margin-top:4px; line-height:1.5}
.mbc .story li.stuck{border-top-color:var(--brass)}
.mbc .story li.stuck::before{content:"?"; background:var(--brass); border-color:var(--brass); color:#1b1206}
.mbc .answer{margin-top:44px; background:var(--chart); border-radius:16px; padding:28px 30px; display:grid; grid-template-columns:1fr auto; gap:10px 32px; align-items:center}
.mbc .answer h3{font-size:26px; grid-column:1}
.mbc .answer p{grid-column:1; color:var(--ink-2); max-width:44em}
.mbc .answer .btn{grid-column:2; grid-row:1/3}

/* groups */
.mbc .groups{display:grid; grid-template-columns:repeat(3,1fr); gap:20px}
.mbc .group{background:var(--deck); border:1px solid var(--line); border-radius:14px; padding:20px 20px 8px}
.mbc .g-head{display:flex; justify-content:space-between; align-items:baseline; gap:10px; padding-bottom:12px; border-bottom:2px solid var(--ink)}
.mbc .g-head h3{font-size:22px}
.mbc .g-price{font-weight:700; font-size:15px; color:var(--brass-ink)}
.mbc .g-price.free{color:var(--green)}
.mbc .tool{display:grid; grid-template-columns:24px 1fr; gap:12px; padding:14px 0; border-bottom:1px solid #e6ece9}
.mbc .tool:last-child{border-bottom:0}
.mbc .tool svg{color:var(--ink); margin-top:2px}
.mbc .tool b{font-size:15.5px}
.mbc .tool p{font-size:14px; color:var(--ink-2); margin-top:3px; line-height:1.5}

/* journey */
.mbc .journey{list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(4,1fr); gap:20px}
.mbc .journey li{border-top:3px solid var(--line); padding-top:14px}
.mbc .journey li.here{border-top-color:var(--brass)}
.mbc .j-when{display:block; font-size:13.5px; font-weight:600; color:var(--ink-2)}
.mbc .journey h3{font-size:20px; margin-top:4px}
.mbc .journey .p{font-weight:700; color:var(--brass-ink); font-size:14.5px; margin-top:2px}
.mbc .journey p.d{color:var(--ink-2); margin-top:8px; font-size:14.5px; line-height:1.55}
.mbc .journey a{display:inline-block; margin-top:10px; font-weight:600; font-size:15px}
.mbc .leave{list-style:none; padding:0; margin:18px 0 0; border-top:1px solid var(--line)}
.mbc .leave li{display:grid; grid-template-columns:22px 1fr; gap:10px; padding:12px 0; border-bottom:1px solid var(--line); font-size:15.5px}
.mbc .leave li::before{content:""; width:12px; height:7px; border-left:2.5px solid var(--green); border-bottom:2.5px solid var(--green); transform:rotate(-45deg); margin-top:7px}

/* problems */
.mbc .band{background:var(--deck); border-top:1px solid var(--line); border-bottom:1px solid var(--line)}
.mbc .sec{padding-top:76px; padding-bottom:76px}
.mbc .sec-head{max-width:40em; margin-bottom:36px}
.mbc .sec-head h2{font-size:clamp(28px,3.6vw,40px); line-height:1.1}
.mbc .sec-head p{font-size:17.5px; color:var(--ink-2); margin-top:12px}

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
  .mbc .groups{grid-template-columns:1fr}
  .mbc .story{grid-template-columns:1fr 1fr 1fr}
  .mbc .journey{grid-template-columns:1fr 1fr}
  .mbc .plate-wrap{max-width:520px}
  .mbc .hero{grid-template-areas:'intro' 'plate' 'cta'; grid-template-rows:auto}
  .mbc .hero-cta{margin-top:8px}
  .mbc .price{grid-template-columns:1fr}
}
@media (max-width:680px){
  .mbc .nav-links .hide-sm{display:none}
  .mbc .hero h1{font-size:38px}
  .mbc .hero .sub{font-size:17.5px}
  .mbc .cta-row .btn{flex:1 1 100%}
  .mbc .sec{padding-top:56px; padding-bottom:56px}
  .mbc .story{grid-template-columns:1fr; gap:22px}
  .mbc .story li{border-top:0; border-left:3px solid var(--line); padding:0 0 0 22px}
  .mbc .story li.stuck{border-left-color:var(--brass)}
  .mbc .story li::before{top:0; left:-15px}
  .mbc .story b{margin-top:2px}
  .mbc .answer{grid-template-columns:1fr; padding:22px}
  .mbc .answer .btn{grid-column:1; grid-row:auto; margin-top:8px}
  .mbc .journey{grid-template-columns:1fr}
  .mbc .transom{height:132px}
  .mbc .transom::before{top:22px} .mbc .transom::after{top:35px}
  .mbc .plate{right:50%; transform:translateX(50%); width:270px; top:48px}
  .mbc .plate-hin{font-size:20px}
  .mbc .hin-card{margin:-14px 6px 0; padding:18px 16px 16px}
  .mbc .hin-card .row{flex-direction:column}
  .mbc .hin-card input{flex:none; width:100%}
  .mbc .sticky{display:flex; transform:translateY(110%); transition:transform .25s ease; position:fixed; left:0; right:0; bottom:0; z-index:50; gap:12px; align-items:center; padding:12px 16px calc(12px + env(safe-area-inset-bottom)); background:rgba(233,239,236,0.96); border-top:1px solid var(--line); backdrop-filter:blur(6px)}
  .mbc .sticky .btn{flex:0 0 auto; min-height:46px; white-space:nowrap; padding:0 20px}
  .mbc .sticky.on{transform:none}
  .mbc .sticky span{font-size:13px; color:var(--ink-2); line-height:1.3}
}
`


// The hero: the HIN plate on a transom, and the check itself.
function HinPlate() {
  return (
    <div className="plate-wrap">
      <div className="transom" aria-hidden="true">
        <div className="plate">
          <span className="rivet r1" /><span className="rivet r2" />
          <span className="plate-label">Hull identification number</span>
          <span className="plate-hin">CKS 48213 E5 15</span>
        </div>
      </div>
      <form className="hin-card" action="/hin-check" method="get">
        <label htmlFor="hero-hin">Type the HIN from the boat you’re looking at</label>
        <div className="row">
          <input id="hero-hin" name="hin" placeholder="CKS48213E515" maxLength={16} autoComplete="off" spellCheck={false} />
          <button type="submit">Check it free</button>
        </div>
        <ul className="hin-gets">
          <li>Who built it, and when</li>
          <li>The model year, to compare with the listing</li>
          <li>Coast Guard safety recalls and vessel records</li>
        </ul>
        <p className="hint">No signup. 12 characters, on the back right corner of the hull.</p>
      </form>
    </div>
  )
}

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
            <a href="#how" className="hide-sm">How it works</a>
            <a href="#price" className="hide-sm">Price</a>
            <a href={START} className="btn small">Start free</a>
          </div>
        </nav>

        <header className="hero">
          <div className="hero-intro">
            <h1>Found a boat? Make sure it matches its paperwork.</h1>
            <p className="sub">
              Check the HIN free. When you shake on a price, My Boat Closing gets you both ready: your state’s bill of sale, how to sign the title, and a receipt, so the sale is documented the right way and not on a napkin.
            </p>
          </div>
          <div className="hero-cta">
            <div className="cta-row">
              <a href={START} className="btn">Start your purchase free</a>
              <a href="#how" className="btn ghost">See how it works</a>
            </div>
            <p className="reassure">Made for everyday private sales: skiffs, bay boats, pontoons and center consoles. Free to check, $29.99 for the paperwork, all 50 states.</p>
          </div>
          <HinPlate />
        </header>
      </div>

      <section className="band">
        <div className="wrap sec">
          <div className="sec-head">
            <h2>Sound familiar?</h2>
            <p>This is how most private boat sales go. The deal is the easy part. The paperwork is where everyone gets stuck.</p>
          </div>
          <ol className="story">
            {STORY.map((s) => (
              <li key={s.step} className={s.stuck ? 'stuck' : ''}>
                <b>{s.step}</b>
                <p>{s.note}</p>
              </li>
            ))}
          </ol>
          <div className="answer">
            <h3>That’s where My Boat Closing comes in.</h3>
            <p>
              Enter the boat and the price you agreed. We check the boat matches its paperwork, give you the right bill of sale for your state, and show you both exactly where to sign. You leave with a signed, dated record of the sale and every paper in one file. Built for the everyday deal, where the price is agreed and the money changes hands at the trailer.
            </p>
            <a href={START} className="btn">Start your purchase free</a>
          </div>
        </div>
      </section>

      <section id="how" className="wrap sec">
        <div className="sec-head">
          <h2>Everything you need, from the first look to the title.</h2>
          <p>Start with the free checks the day you see the boat. Unlock the paperwork when the deal is ready.</p>
        </div>
        <div className="groups">
          {GROUPS.map((g) => (
            <div key={g.title} className="group">
              <div className="g-head">
                <h3>{g.title}</h3>
                <span className={g.price === 'Free' ? 'g-price free' : 'g-price'}>{g.price}</span>
              </div>
              {g.tools.map((t) => (
                <div key={t.name} className="tool">
                  <Icon name={t.icon} />
                  <div>
                    <b>{t.name}</b>
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
            <p className="per">For the paperwork on one purchase. Boat, trailer and motor together count as one. The checks are free.</p>
            <ul>
              <li>Your state’s bill of sale, and in Florida every form filled in</li>
              <li>Step-by-step title signing for how the boat is titled</li>
              <li>Title photo check before you pay</li>
              <li>Payment receipt and a dated handoff record</li>
              <li>Titling help, reminders and your Boat File</li>
            </ul>
            <a href={START} className="btn">Start your purchase free</a>
            <p className="after">You only pay when you unlock the papers.</p>
          </div>
          <div className="vs">
            <h3>What you walk away with</h3>
            <p>Instead of a handshake and a form you found online, both of you leave with:</p>
            <ul className="leave">
              <li>A bill of sale that fits your state, signed by both of you</li>
              <li>A title signed in the right places, ready for the tag office</li>
              <li>A receipt showing the seller was paid in full</li>
              <li>A dated record of what was handed over, with photos</li>
              <li>Every paper in one file you can find in five years</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-head">
          <h2>Fits wherever you are in the deal</h2>
          <p>My Boat Closing handles a simple sale with an agreed price. These pick up where it leaves off.</p>
        </div>
        <ol className="journey">
          <li>
            <span className="j-when">Before you make an offer</span>
            <h3>My Boat Inspector</h3>
            <div className="p">$59.99, or $79.99 with My Boat Closing</div>
            <p className="d">A guided walkthrough of the whole boat and a sea trial, with a written report you can negotiate with.</p>
            <a href="https://myboatinspector.com">Look at My Boat Inspector</a>
          </li>
          <li className="here">
            <span className="j-when">You’ve shaken on a price</span>
            <h3>My Boat Closing</h3>
            <div className="p">Free to check, $29.99 for the paperwork</div>
            <p className="d">Check the boat, sign the right papers, and keep the file.</p>
            <a href={START}>Start your purchase free</a>
          </li>
          <li>
            <span className="j-when">A deposit to hold or a loan to close</span>
            <h3>BoatClosers</h3>
            <div className="p">$249, with your $29.99 credited</div>
            <p className="d">A signed purchase agreement, a neutral party to hold the money, survey conditions and financing, with the seller in the deal.</p>
            <a href="/">Look at BoatClosers</a>
          </li>
          <li>
            <span className="j-when">After it’s yours</span>
            <h3>My Boat Logs</h3>
            <div className="p">$39.99 a year, 14 days free</div>
            <p className="d">Maintenance, receipts and reminders, and a full history to hand the next buyer.</p>
            <a href="https://myboatlogs.com">Look at My Boat Logs</a>
          </li>
        </ol>
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
          <h2>Looking at a boat this week? Check the HIN before you go.</h2>
          <p>It’s free and takes ten seconds. When you shake on a price, start your purchase and have the papers ready.</p>
          <div className="cta-row">
            <a href="/hin-check" className="btn">Check a HIN free</a>
            <a href={START} className="btn ghost">Start your purchase</a>
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
        <span>Check the HIN free. $29.99 for the paperwork.</span>
        <a href={START} className="btn">Start free</a>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var b=document.querySelector('.mbc .sticky'),h=document.querySelector('.mbc .hero');if(!b||!h)return;function f(){b.classList.toggle('on',h.getBoundingClientRect().bottom<0)}addEventListener('scroll',f,{passive:true});f()})()",
        }}
      />
    </div>
  )
}
