'use client'
import DocumentsStepV2 from "./DocumentsStepV2";
import ContingencyPicker from "./ContingencyPicker";
import { useState, useRef, useEffect } from "react";
import { DOCUMENTS, fillDocument } from "../data/documents";
import VesselLookup from "./VesselLookup";
// ─────────────────────────────────────────────────────────────────────────────
// BOATCLOSERS v4
// ─────────────────────────────────────────────────────────────────────────────

// ── PALETTE — deep nautical ───────────────────────────────────────────────────
const C = {
  navy:    "#08152e",
  navy2:   "#0d2145",
  teal:    "#0e6b7c",
  tealLight:"#e4f4f7",
  brass:   "#b8863a",
  brass2:  "#d4a84b",
  rope:    "#c8b89a",
  sand:    "#f5f0e8",
  sandDark:"#ede6d8",
  white:   "#ffffff",
  slate:   "#3d5166",
  mist:    "#d9d2c5",
  red:     "#a82828",
  redLight:"#fdecea",
  green:   "#1a5c35",
  greenLight:"#e4f0ea",
  text:    "#1a2840",
};

const fmt = (n) => n ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(n)) : "";
const today = () => new Date().toISOString().split("T")[0];
const addDays = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };
const CONTINGENCY_LABELS = { survey:"Survey", seaTrial:"Sea Trial", financing:"Financing", insurance:"Insurance", title:"Clear Title" };
const contingencyNames = (arr) => (Array.isArray(arr) ? arr : []).map(k => CONTINGENCY_LABELS[k] || k).join(", ");
const capFirst = (s) => (typeof s === "string" && s.length) ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const priceToWords = (n) => {
  n = Math.round(Number(n)||0);
  if (n === 0) return "Zero";
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const u1000=(x)=>{ let s=""; if(x>=100){ s+=ones[Math.floor(x/100)]+" Hundred"; x%=100; if(x) s+=" "; } if(x>=20){ s+=tens[Math.floor(x/10)]; x%=10; if(x) s+="-"+ones[x]; } else if(x>0){ s+=ones[x]; } return s; };
  const units=["","Thousand","Million","Billion"]; const parts=[]; let m=n;
  while(m>0){ parts.push(m%1000); m=Math.floor(m/1000); }
  let out=""; for(let i=parts.length-1;i>=0;i--){ if(parts[i]){ out+=u1000(parts[i])+(units[i]?" "+units[i]:""); if(i>0) out+=" "; } }
  return out.trim();
};
const PA_DOC_CSS = `
.bc-pa{font-family:Georgia,'Times New Roman',serif;color:#1c1c1a;font-size:13px;line-height:1.7}
.bc-pa h3{font-family:Georgia,serif;color:#08152e;font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;margin:18px 0 6px}
.bc-pa p{margin:0 0 10px}
.bc-pa .lead{font-size:13.5px}
.bc-pa .recital{font-style:italic;color:#33352f}
.bc-pa ol{margin:0 0 10px;padding-left:20px}
.bc-pa ol li{margin-bottom:6px}
.bc-pa .sig{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:22px}
.bc-pa .sig .ln{border-bottom:1.5px solid #08152e;height:24px;margin-bottom:5px}
.bc-pa .sig small{font-size:11px;color:#3d5166;display:block;line-height:1.5;font-family:sans-serif}
.bc-pa .clauses{margin:0 0 10px;padding-left:18px}
.bc-pa .clauses li{margin-bottom:6px}
`;

// ── STEP TIPS ─────────────────────────────────────────────────────────────────
const TIPS = {
  vessel: [
    "💡 The HIN (Hull Identification Number) is stamped on the starboard side of the transom — 12 characters.",
    "💡 Engine serial numbers are critical for the Bill of Sale. Check the engine block near the powerhead.",
    "💡 USCG documentation number (if any) is on the Certificate of Documentation — it's separate from state registration.",
    "💡 More detail here = stronger documents. But you can always come back and add it before paying.",
  ],
  parties: [
    "💡 Buyers: your email will be used for all document notifications.",
    "💡 Sellers: make sure the name here exactly matches the title and registration on the vessel.",
    "💡 You can invite the other party by email after completing your side — they fill in their own info.",
  ],
  negotiate: [
    "💡 Earnest money shows the buyer is serious. 1–5% is standard in boat transactions.",
    "💡 Escrow.com is the safest option — funds are held by a licensed neutral third party.",
    "💡 Due diligence period gives the buyer time to get a survey, run the engines, and check the title.",
    "💡 You can make multiple counter-offers. There's no limit until you both agree.",
    "💡 Closing date should allow time after due diligence ends — 7–14 days is typical.",
  ],
  diligence: [
    "💡 A marine survey typically costs $15–25 per foot. It's almost always worth it.",
    "💡 Title search confirms no liens. Always do this — boats can have hidden loans.",
    "💡 If the buyer rejects, they must state the reason. This is recorded in the Rejection Notice document.",
    "💡 Renegotiation is common after survey — price adjustments for found issues are normal.",
  ],
  documents: [
    "💡 All documents auto-populate with the data you entered. Missing fields will show as blanks.",
    "💡 The Purchase Agreement is the most important document — both parties should read it fully.",
    "💡 Required documents must be signed before closing. Optional documents depend on your deal.",
    "💡 You can download all signed documents as a PDF package after closing.",
  ],
};

// ── DOCS LIST ─────────────────────────────────────────────────────────────────
const DOCS = [
  { id:"purchase_agreement",  name:"Purchase & Sale Agreement",         category:"Core",          required:true  },
  { id:"deposit_receipt",     name:"Deposit Receipt",                   category:"Core",          required:false, suggested:true },
  { id:"bill_of_sale",        name:"Bill of Sale",                      category:"Closing",       required:true  },
  { id:"closing_statement",   name:"Closing Statement",                 category:"Closing",       required:true  },
  { id:"title_transfer",      name:"Title Transfer Affidavit",          category:"Title",         required:false, suggested:true },
  { id:"as_is_acknowledgment",name:"As-Is Acknowledgment",              category:"Core",          required:true  },
  { id:"escrow_instructions", name:"Escrow Instructions",               category:"Escrow",        required:false },
  { id:"wire_instructions",   name:"Wire Transfer Instructions",        category:"Escrow",        required:false },
  { id:"lien_release",        name:"Lien Release",                      category:"Title",         required:false },
  { id:"warranty_of_title",   name:"Warranty of Title",                 category:"Title",         required:false, suggested:true },
  { id:"survey_auth",         name:"Survey Authorization",              category:"Due Diligence", required:false },
  { id:"sea_trial",           name:"Sea Trial Agreement",               category:"Due Diligence", required:false },
  { id:"sea_trial_waiver",    name:"Sea Trial Liability Waiver",        category:"Due Diligence", required:false },
  { id:"dd_report",           name:"Due Diligence Report",              category:"Due Diligence", required:false },
  { id:"acceptance",          name:"Vessel Acceptance",                 category:"Due Diligence", required:false },
  { id:"rejection",           name:"Vessel Rejection Notice",           category:"Due Diligence", required:false },
  { id:"counter_offer",       name:"Counter Offer",                     category:"Negotiation",   required:false },
  { id:"conditional_accept",  name:"Conditional Acceptance",            category:"Negotiation",   required:false },
  { id:"delivery_receipt",    name:"Delivery Receipt",                  category:"Closing",       required:false },
  { id:"damage_disclosure",   name:"Damage Disclosure Statement",       category:"Due Diligence", required:false },
  { id:"loan_payoff",         name:"Loan Payoff Letter",                category:"Finance",       required:false },
  { id:"insurance_binder",    name:"Insurance Binder Confirmation",     category:"Insurance",     required:false },
  { id:"uscg_deletion",       name:"USCG Documentation / Deletion",     category:"Title",         required:false },
  { id:"power_of_attorney",   name:"Power of Attorney",                 category:"Closing",       required:false },
  { id:"personal_prop_bos",   name:"Personal Property Bill of Sale",    category:"Closing",       required:false },
  { id:"compliance_stmt",     name:"Safety Equipment Compliance Statement", category:"Closing",   required:false },
  { id:"hour_meter_stmt",     name:"Engine Hour Meter Disclosure",      category:"Closing",       required:false, suggested:true },
  { id:"notarized_bos",       name:"Notarized Bill of Sale",            category:"Closing",       required:false },
  { id:"platform_tos",        name:"Platform Terms of Service",         category:"Platform",      required:true  },
];

const REJECTION_REASONS = [
  { id:"survey_failed",    label:"Survey revealed unacceptable defects",       desc:"Hull damage, osmotic blistering, structural issues, or delamination found during marine survey." },
  { id:"engine_failed",    label:"Engine or mechanical failure",               desc:"Engines failed to start, ran poorly, or mechanical inspection revealed costly issues." },
  { id:"title_issue",      label:"Title or lien issue discovered",             desc:"Outstanding lien, ownership dispute, or title could not be verified clear." },
  { id:"sea_trial_failed", label:"Sea trial failed",                           desc:"Vessel did not perform as represented during underway sea trial." },
  { id:"price_disagreement",label:"Could not agree on price adjustment",       desc:"Survey findings warranted a price reduction that the seller declined to accept." },
  { id:"insurance_denied", label:"Insurance could not be obtained",            desc:"Buyer was unable to obtain adequate marine insurance for this vessel." },
  { id:"other",            label:"Other — see notes",                          desc:"See buyer notes below for full explanation." },
];

// ── SHARED UI ─────────────────────────────────────────────────────────────────
const S = {
  app:      { fontFamily:"'Georgia','Times New Roman',serif", background:C.sand, minHeight:"100vh", color:C.text },
  nav:      { background:C.navy, padding:"0 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, borderBottom:`1px solid rgba(184,134,58,0.35)` },
  logo:     { fontFamily:"'Georgia',serif", fontSize:19, fontWeight:700, color:C.brass, letterSpacing:1.5, cursor:"pointer" },
  logoSub:  { fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:4, marginTop:1, fontFamily:"sans-serif", textTransform:"uppercase" },
  page:     { maxWidth:820, margin:"0 auto", padding:"2rem 1.5rem" },
  card:     { background:C.white, border:`0.5px solid ${C.mist}`, borderRadius:8, padding:"1.5rem" },
  cardGold: { background:C.white, border:`2px solid ${C.brass}`, borderRadius:8, padding:"1.5rem" },
  h1:       { fontSize:24, fontWeight:700, color:C.navy, marginBottom:6 },
  h2:       { fontSize:20, fontWeight:700, color:C.navy, marginBottom:4 },
  h3:       { fontSize:15, fontWeight:600, color:C.navy, marginBottom:10, fontFamily:"sans-serif" },
  label:    { fontSize:12, color:C.slate, fontFamily:"sans-serif", marginBottom:4, display:"block", fontWeight:500 },
  input:    { width:"100%", border:`1px solid ${C.mist}`, borderRadius:5, padding:"9px 11px", fontSize:13, fontFamily:"sans-serif", background:C.white, color:C.text, boxSizing:"border-box" },
  select:   { width:"100%", border:`1px solid ${C.mist}`, borderRadius:5, padding:"9px 11px", fontSize:13, fontFamily:"sans-serif", background:C.white, color:C.text, boxSizing:"border-box" },
  textarea: { width:"100%", border:`1px solid ${C.mist}`, borderRadius:5, padding:"9px 11px", fontSize:13, fontFamily:"sans-serif", background:C.white, color:C.text, resize:"vertical", boxSizing:"border-box" },
  btn:      { background:C.navy, color:"#fff", border:"none", borderRadius:5, padding:"10px 22px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif", fontWeight:600 },
  btnBrass: { background:C.brass, color:C.navy, border:"none", borderRadius:5, padding:"10px 22px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 },
  btnOutline:{ background:"transparent", color:C.navy, border:`1px solid ${C.mist}`, borderRadius:5, padding:"9px 20px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif" },
  btnTeal:  { background:C.teal, color:"#fff", border:"none", borderRadius:5, padding:"10px 22px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif", fontWeight:600 },
  divider:  { border:"none", borderTop:`1px solid ${C.mist}`, margin:"1.25rem 0" },
  pill:     { display:"inline-block", fontSize:10, fontFamily:"sans-serif", fontWeight:700, padding:"3px 9px", borderRadius:20, letterSpacing:0.5, textTransform:"uppercase" },
  tag:      { display:"inline-block", fontSize:10, fontFamily:"sans-serif", background:C.sandDark, color:C.slate, padding:"2px 7px", borderRadius:3, marginRight:4 },
};

function Field({ label, children, span2 }) {
  return (
    <div style={{ gridColumn: span2 ? "span 2" : "span 1", marginBottom:14 }}>
      {label && <label style={S.label}>{label}</label>}
      {children}
    </div>
  );
}
function Grid2({ children, gap }) {
  return <div className="bc-grid2" style={{ gap: gap||14 }}>{children}</div>;
}

// ── OFFER SECTION — expandable, self-explaining opt-in box for the offer builder ──
function escLabel(p){ return p==="escrow_com"?"Escrow.com":p==="attorney"?"Third-Party Attorney":p==="brokerage"?"Licensed Broker":p==="custom"?"Custom / Other":"Direct to Seller"; }

function OfferSection({ icon, title, desc, checked, onToggle, children }) {
  return (
    <div style={{ border:`1px solid ${checked?C.brass:C.mist}`, borderRadius:8, marginBottom:10, overflow:"hidden", background:checked?"#fffdf8":"#fff" }}>
      <label style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer", padding:"13px 14px" }}>
        <input type="checkbox" checked={checked} onChange={onToggle} style={{ width:16, height:16, marginTop:2, accentColor:C.brass, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>{icon} {title} <span style={{ fontSize:11, fontWeight:400, color:checked?C.brass:C.slate }}>{checked?"— included ✓":"— optional, tap to add"}</span></div>
          <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:3, lineHeight:1.55 }}>{desc}</div>
        </div>
      </label>
      {checked && <div style={{ padding:"2px 14px 14px" }}>{children}</div>}
    </div>
  );
}

// ── TIP BOX ───────────────────────────────────────────────────────────────────
function TipBox({ tips }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % tips.length), 6000);
    return () => clearInterval(t);
  }, [tips.length]);
  return (
    <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:6, padding:"10px 14px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:10 }}>
      <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.teal, lineHeight:1.6, flex:1 }}>{tips[idx]}</div>
      <div style={{ display:"flex", gap:4, flexShrink:0, marginTop:2 }}>
        {tips.map((_,i) => (
          <div key={i} onClick={() => setIdx(i)} style={{ width:6, height:6, borderRadius:"50%", background: i===idx ? C.teal : C.mist, cursor:"pointer" }} />
        ))}
      </div>
    </div>
  );
}

// ── DEAL ASSISTANT ────────────────────────────────────────────────────────────
// A guided, role- and step-aware walkthrough. Sits alongside the rotating TipBox
// and explains, in plain language, what this step is, what THIS party should do,
// what happens next, and the common questions. (Free-form AI answers come later.)
const ASSISTANT = {
  vessel: {
    title: "Step 1 \u00b7 The Vessel",
    seller: {
      summary: "This is where your boat gets described \u2014 the details that legally identify it on every document. As the seller, you're the source of truth here, so getting these right saves headaches later.",
      todo: [
        "Enter the year, make, model, and length",
        "Add the HIN \u2014 the 12-character Hull ID stamped on the starboard side of the transom",
        "Add engine, registration, and title details",
        "Set your asking price (your starting number \u2014 the real price is negotiated next)",
      ],
      next: "You'll bring the buyer into the deal, then negotiate price and terms.",
      faqs: [
        { q:"Why does the HIN matter so much?", a:"It's the boat's fingerprint, like a car's VIN. It ties the title, bill of sale, and registration to this exact hull, so it shows up on nearly every document." },
        { q:"What if I don't have every detail handy?", a:"Fill in what you know and keep going. You can complete the rest before the documents are finalized." },
        { q:"Is the asking price the final price?", a:"No \u2014 it's just your starting number. The real price is settled in the Deal Room, where both sides negotiate." },
      ],
    },
    buyer: {
      summary: "Describe the boat you're making an offer on \u2014 the details that identify it on every document. Fill in what you know from the listing; the seller confirms and corrects their details when they join.",
      todo: [
        "Enter the year, make, model, and length from the listing",
        "Add the HIN if you have it \u2014 you can confirm it with the seller later",
        "Add any engine or registration details you know",
        "Set a reference price \u2014 your actual, negotiable offer is built in the Deal Room",
      ],
      next: "You'll set up the parties, then build and send your offer.",
      faqs: [
        { q:"Why am I describing a boat I don't own yet?", a:"Because you're starting the deal. You enter what you know; the seller confirms and fills in the rest when they review it." },
        { q:"What if I don't have the HIN?", a:"Enter what you can. The seller can add the HIN and registration when they join the deal." },
        { q:"Is this price my offer?", a:"No \u2014 this is just a reference. Your real, negotiable offer is built in the Deal Room." },
      ],
    },
  },
  parties: {
    title: "Step 2 · Parties",
    buyer: {
      summary: "Here you set who's who. As the buyer, your details came from your sign-up — now you bring the seller into the deal.",
      todo: ["Confirm your own details are correct", "Invite the seller by email, or copy a private link to send them", "Wait for them to join — their info appears once they do"],
      next: "Once the seller joins, you'll both move into the Deal Room to negotiate price and terms.",
      faqs: [
        { q:"Does the seller need an account?", a:"They'll create a quick login when they open your invite. It's how the app keeps each side's actions separate and secure." },
        { q:"Can I start before they join?", a:"You can fill in the vessel and your own details, but negotiating needs both parties present." },
      ],
    },
    seller: {
      summary: "Here you set who's who. As the seller, your details came from your sign-up. If you started the deal you invite the buyer; if they invited you, you're already attached.",
      todo: ["Confirm your own details are correct", "If you started the deal, invite the buyer by email or private link", "If the buyer invited you, just confirm and continue"],
      next: "Once both sides are in, you'll move to the Deal Room to negotiate.",
      faqs: [
        { q:"The buyer invited me — what do I do?", a:"Confirm your details are right and continue. You're already attached to their deal." },
        { q:"Who pays the $249 fee?", a:"Whoever started the deal pays it, once — and only after a price is agreed and both sign. The other party pays nothing." },
      ],
    },
  },
  negotiate: {
    title: "Step 3 · The Deal Room",
    buyer: {
      summary: "This is the Deal Room. As the buyer you build the offer — price, deposit, and any contingencies or dates — and send it. The seller can accept, counter the price, or flag a conflict. It's all free until a full offer is accepted.",
      todo: ["Build your offer (price and deposit at minimum)", "Send it, then watch for the seller's response", "Accept their number, counter, or adjust terms — as many rounds as you need", "When you both agree, sign the Purchase Agreement on your line"],
      next: "Once both sign, the party who started the deal pays the one-time $249 to lock it, which unlocks Due Diligence.",
      faqs: [
        { q:"What's a contingency?", a:"A condition that must be met or you can walk away — like a satisfactory survey, sea trial, or financing. They protect you during due diligence." },
        { q:"When do I actually pay anything?", a:"Nothing until a full offer is accepted and both parties sign. Then the deal initiator pays $249, once." },
        { q:"Can I change my mind after agreeing on price?", a:"Until both sign the Purchase Agreement, yes. After signing, the price is set — though due diligence can still produce a price addendum." },
      ],
    },
    seller: {
      summary: "This is the Deal Room. The buyer authors the offer; as the seller you set your asking price, then accept, counter the price, or flag a conflict on the terms. It's free until a full offer is accepted.",
      todo: ["Review the buyer's offer when it arrives", "Accept it, counter the price, or flag a conflict on contingencies or dates", "Negotiate back and forth as needed", "When you agree, sign the Purchase Agreement on your line"],
      next: "Once both sign, the deal initiator pays the $249 to lock it and unlock Due Diligence.",
      faqs: [
        { q:"Why does the buyer write the terms?", a:"The buyer authors the contingencies and dates; you control the price (accept or counter) and can flag any term you disagree with. It keeps one clean version of the offer." },
        { q:"Do I pay the $249?", a:"Only if you started the deal. If the buyer started it, they pay — you pay nothing." },
      ],
    },
  },
  diligence: {
    title: "Step 4 · Due Diligence",
    buyer: {
      summary: "Due diligence is your chance to verify the boat before closing. You arrange the survey, sea trial, and title check, then make your decision: accept as-is, propose a new price, or walk away.",
      todo: ["Schedule and complete the marine survey and sea trial", "Verify clear title with no liens", "Submit your earnest-money deposit proof before the timer runs out", "Make your vessel decision: accept, propose a new price, or reject"],
      next: "Accepting (or agreeing a new price) moves you to the closing documents.",
      faqs: [
        { q:"What if the survey finds problems?", a:"You can propose a new price — that creates an addendum to the Purchase Agreement — or reject the vessel and recover your deposit per your terms." },
        { q:"Why is there a deposit timer?", a:"Earnest money shows you're serious and holds the boat. If proof isn't provided in time, the deal can be voided — including the signed Purchase Agreement." },
        { q:"Do I need to haul the boat out?", a:"Not to move forward. A haul-out is only needed if your surveyor wants a bottom inspection." },
        { q:"How do I verify the title is clear?", a:"Confirm the seller's name matches the title and check for liens. In the Documents step there's a ready-to-send 'Title & Lien Search Request Letter' you can fill and mail to the state titling office (or the U.S. Coast Guard for a documented vessel) to get a certified record." },
      ],
    },
    seller: {
      summary: "While the buyer inspects, your job is to have the boat and paperwork ready. Your checklist walks you through it. Each side only sees their own due-diligence list.",
      todo: ["Get title, registration, records, and manuals ready", "Make the vessel accessible for survey and sea trial", "Follow the safety items — especially: do NOT start the engines before the surveyor arrives", "Watch for the buyer's decision (accept, new price, or reject)"],
      next: "Once the buyer accepts (or you agree on a price addendum), you both move to closing documents.",
      faqs: [
        { q:"Why can't I start the engines first?", a:"Surveyors need to inspect a cold start. Warming them up first can mask problems and undermine the survey." },
        { q:"What if the buyer proposes a lower price?", a:"You can accept or decline the addendum. The original signed Purchase Agreement stays intact either way." },
        { q:"Do I have to haul the boat out?", a:"Only if the buyer's surveyor requests a bottom inspection. It's not required to proceed." },
      ],
    },
  },
  documents: {
    title: "Step 5 \u00b7 Documents",
    buyer: {
      summary: "These are the closing documents. Some you fill and sign right in the app; the ones that need a notary (like the Bill of Sale) the seller handles before a notary. Your Purchase Agreement and due-diligence acceptance already show as signed.",
      todo: [
        "Open each required document",
        "Fill in any blanks and check the boxes assigned to you",
        "E-sign the documents that allow it",
        "When everything's handled, proceed to closing",
      ],
      next: "The closing step wraps up the transfer and gives you both a record.",
      faqs: [
        { q:"Why isn't the Bill of Sale e-signable?", a:"It often needs notarization, an in-person act the app can't verify. The seller prints it, signs before a notary, and uploads the copy." },
        { q:"Why is the Purchase Agreement already signed?", a:"You signed it when the price was agreed. It carries over here so you don't sign twice." },
        { q:"Can I proceed if a notarized document isn't done?", a:"Yes \u2014 you'll get a warning and acknowledge it. The app won't trap you, but completing those correctly is the responsibility of whoever signs them." },
      ],
    },
    seller: {
      summary: "These are the closing documents. Some you fill and sign right in the app. The Bill of Sale typically needs your signature before a notary \u2014 print it, get it notarized, and upload the copy. The Purchase Agreement already shows as signed.",
      todo: [
        "Open each required document",
        "Fill in any blanks and check the boxes assigned to you",
        "E-sign what you can; print, notarize, and upload the Bill of Sale and any notary documents",
        "When everything's handled, proceed to closing",
      ],
      next: "The closing step wraps up the transfer and gives you both a record.",
      faqs: [
        { q:"Which documents do I have to notarize?", a:"The Bill of Sale usually needs a notary. Print it, sign in front of a notary, then upload the signed copy \u2014 the app can't verify notarization for you." },
        { q:"Why is the Purchase Agreement already signed?", a:"You signed it when the price was agreed. It carries over here so you don't sign twice." },
        { q:"Can I proceed if a notarized document isn't done?", a:"Yes \u2014 you'll get a warning and acknowledge it. The app won't trap you, but completing notarization correctly is your responsibility." },
      ],
    },
  },
};

function DealAssistant({ step, role, vessel }) {
  // Open by default on the early steps where guidance is most needed; collapsed
  // by default on the later steps (due diligence, documents) where the panel is
  // mostly noise — the user can still expand it anytime.
  const [open, setOpen] = useState(() => !["diligence", "documents"].includes(step));
  const [faqOpen, setFaqOpen] = useState(null);
  const c = ASSISTANT[step];
  if (!c) return null;
  const r = role === "seller" ? "seller" : "buyer";
  const g = c[r] || c;
  const faqs = g.faqs || c.faqs || [];
  const hasVessel = vessel && (vessel.year || vessel.make || vessel.model);
  return (
    <div style={{ border:`1px solid ${C.navy}`, borderRadius:8, marginBottom:20, overflow:"hidden", background:"#fff" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"11px 14px", background:C.navy }}>
        <span style={{ fontSize:18 }}>🧭</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:"sans-serif", color:"#fff" }}>Deal Assistant</div>
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.6)" }}>{c.title} — what to do and why</div>
        </div>
        <span style={{ color:C.brass, fontSize:12, fontFamily:"sans-serif", fontWeight:700 }}>{open ? "▲ Hide" : "▼ Guide me"}</span>
      </div>
      {open && (
        <div style={{ padding:"14px 16px" }}>
          {hasVessel && (
            <div style={{ background:C.sandDark, borderRadius:6, padding:"9px 12px", marginBottom:12, fontSize:11.5, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6 }}>
              <b>This deal:</b> {[vessel.year, vessel.make, vessel.model].filter(Boolean).join(" ")}
              {vessel.length ? ` · ${vessel.length}` : ""}
              {vessel.hin ? ` · HIN ${vessel.hin}` : ""}
              {vessel.askingPrice ? ` · Asking ${fmt(Number(vessel.askingPrice))}` : ""}
            </div>
          )}
          <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.text, lineHeight:1.65, marginBottom:12 }}>{g.summary}</div>
          {g.todo && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:0.4, textTransform:"uppercase", color:C.navy, fontFamily:"sans-serif", marginBottom:6 }}>What to do now</div>
              {g.todo.map((t,i)=>(
                <div key={i} style={{ display:"flex", gap:8, fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.55, marginBottom:5 }}>
                  <span style={{ color:C.brass, fontWeight:700, flexShrink:0 }}>{i+1}.</span><span>{t}</span>
                </div>
              ))}
            </div>
          )}
          {g.next && (
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, background:C.sandDark, borderRadius:6, padding:"9px 12px", marginBottom: faqs.length?12:0 }}>
              <b style={{ color:C.navy }}>What happens next:</b> {g.next}
            </div>
          )}
          {faqs.length>0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:0.4, textTransform:"uppercase", color:C.navy, fontFamily:"sans-serif", marginBottom:4 }}>Common questions</div>
              {faqs.map((f,i)=>(
                <div key={i} style={{ borderBottom:`1px solid ${C.mist}` }}>
                  <div onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ display:"flex", justifyContent:"space-between", gap:10, cursor:"pointer", padding:"9px 0", fontSize:12.5, fontFamily:"sans-serif", fontWeight:600, color:C.navy }}>
                    <span>{f.q}</span><span style={{ color:C.brass, flexShrink:0 }}>{faqOpen===i?"–":"+"}</span>
                  </div>
                  {faqOpen===i && <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, padding:"0 0 10px" }}>{f.a}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MISSING DATA WARNING ──────────────────────────────────────────────────────
function DataWarning({ vessel, parties }) {
  const missing = [];
  if (!vessel.hin) missing.push("HIN (Hull ID Number)");
  if (!vessel.engineSerial) missing.push("Engine serial number");
  if (!vessel.regNumber) missing.push("Registration number");
  if (!parties.buyer.name) missing.push("Buyer full name");
  if (!parties.buyer.email) missing.push("Buyer email");
  if (!parties.seller.name) missing.push("Seller full name");
  if (!parties.seller.email) missing.push("Seller email");
  if (missing.length === 0) return null;
  return (
    <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:6, padding:"12px 14px", marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.brass, marginBottom:6 }}>⚠ Some document fields will be blank without this info:</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {missing.map(m => <span key={m} style={{ ...S.tag, background:"#fdeab0", color:"#7a5500" }}>{m}</span>)}
      </div>
    </div>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────────────────────────────
const STEPS = ["Vessel","Parties","Price & Terms","Due Diligence","Documents","Closing"];
function ProgressBar({ step, setStep, maxStep, dealPaid }) {
  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.mist}`, padding:"0.85rem 2rem" }}>
      <div style={{ maxWidth:820, margin:"0 auto", display:"flex", alignItems:"center" }}>
        {STEPS.map((s,i) => {
          const done    = i < step;
          const current = i === step;
          const locked  = i >= 3 && !dealPaid; // DD / Documents / Closing stay locked until paid
          const preview = i > step && !locked; // ahead — clickable as preview only if unlocked
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", flex: i<STEPS.length-1 ? 1 : 0 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div
                  onClick={() => { if (!locked) setStep(i); }}
                  title={locked ? `${s} unlocks once the deal is paid` : preview ? `Preview ${s}` : done ? `Go back to ${s}` : s}
                  style={{
                    width:28, height:28, borderRadius:"50%",
                    background: done ? C.green : current ? C.brass : "transparent",
                    color: done ? "#fff" : current ? "#fff" : C.slate,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, fontFamily:"sans-serif", flexShrink:0,
                    border: current ? `2px solid ${C.navy}` : preview ? `2px dashed ${C.mist}` : "none",
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.4 : preview ? 0.65 : 1,
                    transition:"all 0.15s",
                  }}
                >
                  {locked ? "🔒" : done ? "✓" : i+1}
                </div>
                <div
                  onClick={() => { if (!locked) setStep(i); }}
                  style={{
                    fontSize:9, fontFamily:"sans-serif",
                    color: current ? C.navy : done ? C.teal : C.slate,
                    marginTop:3, whiteSpace:"nowrap",
                    fontWeight: current ? 700 : 400,
                    cursor: locked ? "not-allowed" : "pointer",
                    textDecoration: done ? "underline" : "none",
                    textDecorationColor: C.teal,
                    opacity: locked ? 0.4 : preview ? 0.6 : 1,
                  }}
                >
                  {s}{locked ? " 🔒" : preview ? " 👁" : ""}
                </div>
              </div>
              {i<STEPS.length-1 && (
                <div style={{ height:2, flex:1, background:done?C.green:C.mist, margin:"0 3px", marginBottom:16, minWidth:8 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PREVIEW BANNER — shown when viewing a step ahead of where you've been ────
function PreviewBanner({ step, maxStep, setStep }) {
  if (step <= maxStep) return null;
  return (
    <div style={{ background:"#fff9ee", borderBottom:`2px solid ${C.brass}`, padding:"10px 2rem" }}>
      <div style={{ maxWidth:820, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>👁</span>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:"#7a5500", lineHeight:1.5 }}>
            <strong>Preview mode</strong> — you're looking ahead at {STEPS[step]}. You can explore what's here, but actions and signatures require completing the earlier steps first.
            {step === 4 && <span> &nbsp;The $249 paywall must be completed before signing any documents.</span>}
          </div>
        </div>
        <button
          onClick={() => setStep(maxStep)}
          style={{ ...S.btnBrass, fontSize:11, padding:"6px 14px", whiteSpace:"nowrap", flexShrink:0 }}
        >
          ← Back to {STEPS[maxStep]}
        </button>
      </div>
    </div>
  );
}


// ── LOCKED STEP — shown for DD / Documents / Closing before the deal is paid ──
function LockedStep({ stepName, onBack }) {
  return (
    <div style={S.page}>
      <div style={{ ...S.card, textAlign:"center", padding:"3rem 2rem", borderTop:`3px solid ${C.brass}`, maxWidth:560, margin:"2rem auto" }}>
        <div style={{ fontSize:42, marginBottom:14 }}>🔒</div>
        <div style={{ fontSize:20, fontWeight:800, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>{stepName} is locked</div>
        <div style={{ fontSize:14, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7, maxWidth:440, margin:"0 auto 22px" }}>
          This opens once the deal is finalized — both parties sign the Purchase Agreement and the one-time $249 fee is paid to make it binding. Until then, due diligence, documents, and closing stay locked for both sides.
        </div>
        <button style={S.btnBrass} onClick={onBack}>← Back to the Deal Room</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function StepVessel({ data, setData, userRole, onNext }) {
  const set = (k,v) => setData(d => ({...d,[k]:v}));
  // Only year, make, model required — rest optional until paywall
  const canContinue = data.year && data.make && data.model && data.askingPrice;
  return (
    <div style={S.page}>
      <TipBox tips={TIPS.vessel} />
      <DealAssistant step="vessel" role={userRole} vessel={data} />
      {userRole==="seller" ? (
        <div style={{ background:"#eef4fb", border:`1px solid ${C.navy}`, borderRadius:8, padding:"13px 16px", marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:"sans-serif", color:C.navy, marginBottom:4 }}>📋 You're the seller — you know this boat best</div>
          <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
            Please review every detail below and complete anything that's missing or that the buyer couldn't fill in — the closing documents depend on this being accurate. You won't build the offer here; that's the buyer's part. Once the details are right, just <b>wait for the buyer's offer</b> — we'll bring it to you and email you the moment it arrives.
          </div>
        </div>
      ) : (
        <div style={{ background:"#eef4fb", border:`1px solid ${C.navy}`, borderRadius:8, padding:"13px 16px", marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:"sans-serif", color:C.navy, marginBottom:4 }}>📋 You're the buyer — enter what you know</div>
          <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
            Fill in the boat's details from the listing as best you can. You may not have everything — HIN, engine hours, title numbers — and that's fine. The <b>seller knows the boat best and will confirm and complete the details</b> when they join. Enter what you have, then move on to set up the parties and build your offer.
          </div>
        </div>
      )}
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={S.h1}>Vessel Information</h1>
        <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>Fill in what you have now. You can complete remaining fields before signing. Asking price, year, make, and model are required to continue.</p>
      </div>
      <div style={{ ...S.card, borderTop:`3px solid ${C.brass}` }}>
        <h3 style={S.h3}>Asking Price</h3>
        <p style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, marginTop:-6, marginBottom:12 }}>The seller's starting number — buyers build their offer against this anchor. Required to continue.</p>
        <Field label="Asking Price ($) *"><input style={S.input} type="number" value={data.askingPrice} onChange={e=>set("askingPrice",e.target.value)} placeholder="85000" /></Field>
      </div>
      <div style={S.card}>
        <h3 style={S.h3}>Identification</h3>
        <Grid2>
          <Field label="Year *"><input style={S.input} type="number" value={data.year} onChange={e=>set("year",e.target.value)} placeholder="2019" /></Field>
          <Field label="Make / Manufacturer *"><input style={S.input} value={data.make} onChange={e=>set("make",capFirst(e.target.value))} placeholder="Boston Whaler" /></Field>
          <Field label="Model *"><input style={S.input} value={data.model} onChange={e=>set("model",capFirst(e.target.value))} placeholder="Outrage 280" /></Field>
          <Field label="Vessel Name (if any)"><input style={S.input} value={data.name} onChange={e=>set("name",capFirst(e.target.value))} placeholder="Sea Dreams" /></Field>
          <Field label="Hull ID Number (HIN) — needed for documents"><input style={S.input} value={data.hin} onChange={e=>set("hin",e.target.value)} placeholder="BWCE1234A919" /></Field>
          <Field label="Hull Type">
            <select style={S.select} value={data.hullType} onChange={e=>set("hullType",e.target.value)}>
              <option value="">Select...</option>
              <option>Fiberglass</option><option>Aluminum</option><option>Steel</option><option>Wood</option><option>Composite</option>
            </select>
          </Field>
          <Field label="Length Overall (ft)"><input style={S.input} type="number" value={data.loa} onChange={e=>set("loa",e.target.value)} placeholder="28" /></Field>
          <Field label="Beam (ft)"><input style={S.input} type="number" value={data.beam} onChange={e=>set("beam",e.target.value)} placeholder="9.5" /></Field>
        </Grid2>
        <hr style={S.divider}/>
        <h3 style={S.h3}>Engine(s)</h3>
        <Grid2>
          <Field label="Number of Engines">
            <select style={S.select} value={data.engineCount} onChange={e=>set("engineCount",e.target.value)}>
              <option>1</option><option>2</option><option>3</option><option>4</option>
            </select>
          </Field>
          <Field label="Engine Make"><input style={S.input} value={data.engineMake} onChange={e=>set("engineMake",e.target.value)} placeholder="Yamaha" /></Field>
          <Field label="Engine Model / HP"><input style={S.input} value={data.engineModel} onChange={e=>set("engineModel",e.target.value)} placeholder="F300 / 300hp" /></Field>
          <Field label="Engine Hours"><input style={S.input} type="number" value={data.engineHours} onChange={e=>set("engineHours",e.target.value)} placeholder="450" /></Field>
          <Field label="Engine Serial # — needed for documents"><input style={S.input} value={data.engineSerial} onChange={e=>set("engineSerial",e.target.value)} placeholder="6D8-L-123456" /></Field>
          <Field label="Fuel Type">
            <select style={S.select} value={data.fuelType} onChange={e=>set("fuelType",e.target.value)}>
              <option>Gasoline</option><option>Diesel</option><option>Electric</option>
            </select>
          </Field>
        </Grid2>
        <hr style={S.divider}/>
        <h3 style={S.h3}>Registration & Documentation</h3>
        <Grid2>
          <Field label="State Registration # — needed for documents"><input style={S.input} value={data.regNumber} onChange={e=>set("regNumber",e.target.value)} placeholder="FL1234AB" /></Field>
          <Field label="Registration State"><input style={S.input} value={data.regState} onChange={e=>set("regState",e.target.value)} placeholder="FL" maxLength={2} /></Field>
          <Field label="USCG Documentation # (if applicable)"><input style={S.input} value={data.uscgNumber} onChange={e=>set("uscgNumber",e.target.value)} placeholder="Leave blank if not documented" /></Field>
          <Field label="Trailer Included?">
            <select style={S.select} value={data.trailerIncluded} onChange={e=>set("trailerIncluded",e.target.value)}>
              <option value="no">No</option><option value="yes">Yes</option>
            </select>
          </Field>
          {data.trailerIncluded==="yes" && <>
            <Field label="Trailer VIN"><input style={S.input} value={data.trailerVin} onChange={e=>set("trailerVin",e.target.value)} /></Field>
            <Field label="Trailer Title State"><input style={S.input} value={data.trailerState} onChange={e=>set("trailerState",e.target.value)} maxLength={2} /></Field>
          </>}
        </Grid2>
        <hr style={S.divider}/>
        <Grid2>
          <Field label="Vessel Location (City, State)"><input style={S.input} value={data.location} onChange={e=>set("location",e.target.value)} placeholder="Palm Beach, FL" /></Field>
        </Grid2>
        <Field label="Description / Notable Features" span2>
          <textarea style={{...S.textarea, minHeight:72}} value={data.description} onChange={e=>set("description",e.target.value)} placeholder="Twin Yamaha F300s, 450 hours, full Garmin electronics, fresh water only..." />
        </Field>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"1.5rem" }}>
        <button style={S.btnBrass} disabled={!canContinue} onClick={onNext}>Continue to Parties →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — PARTIES (role-aware)
// ─────────────────────────────────────────────────────────────────────────────
function StepParties({ data, setData, userRole, partyBJoined, vessel, onNext, onBack, dealId, user, ensureSaved }) {
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  // null = haven't chosen yet; "email" = initiator has the other party's email
  // (system auto-emails the link, no link shown); "link" = no email, show a
  // copyable link the initiator sends themselves.
  const [inviteMode, setInviteMode] = useState(null);

  const otherSide = userRole === "buyer" ? "seller" : "buyer";
  const mySide = userRole === "seller" ? "seller" : "buyer";

  // Carry the signed-in user's name/email onto THEIR own side of the deal if it's
  // not filled yet (e.g. an invited party who just joined). This makes their name
  // transfer through from signup and unblocks the Continue button.
  useEffect(() => {
    if (!user) return;
    const side = data?.[mySide] || {};
    const needsName = !side.name && user.name;
    const needsEmail = !side.email && user.email;
    if (needsName || needsEmail) {
      setData(d => ({
        ...d,
        [mySide]: {
          ...d[mySide],
          name: side.name || user.name || "",
          email: side.email || user.email || "",
        }
      }));
    }
  }, [user, mySide]);

  // Shared call: creates the token + saves it. On the email path the server
  // also emails the join link automatically. On the link path we show the url.
  const runInvite = async (showLinkAfter) => {
    const email = data?.[otherSide]?.email;
    if (showLinkAfter === false && !email) {
      setInviteError("Enter the other party's email above first.");
      return;
    }
    if (!user?.userId) {
      setInviteError("Please sign in again, then try.");
      return;
    }
    setInviteLoading(true);
    setInviteError("");
    // Make sure the deal is saved and has an id — create it now if needed.
    let id = dealId;
    if (!id) id = await (ensureSaved ? ensureSaved() : Promise.resolve(null));
    if (!id) {
      setInviteLoading(false);
      setInviteError("Couldn't save the deal automatically. Add at least one vessel detail, then try again.");
      return;
    }
    try {
      const res = await fetch("/api/deals/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: id,
          inviteEmail: email || `link-share-${otherSide}@boatclosers.com`,
          inviteRole: otherSide,
          userId: user.userId
        })
      });
      const result = await res.json();
      if (!res.ok) {
        setInviteError(result?.error || "Could not create the invite.");
        setInviteLoading(false);
        return;
      }
      if (showLinkAfter) {
        setInviteLink(result.inviteUrl);
      } else {
        setInviteSent(true);
      }
    } catch (e) {
      setInviteError("Network error, please try again.");
    }
    setInviteLoading(false);
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard?.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const set = (side,k,v) => setData(d => ({...d,[side]:{...d[side],[k]:v}}));
  const canContinue = userRole==="seller"
    ? (data.seller.name && data.seller.email)
    : (data.buyer.name && data.buyer.email);

  const sides = userRole==="seller" ? ["seller","buyer"] : ["buyer","seller"];

  return (
    <div style={S.page}>
      <TipBox tips={TIPS.parties} />
      <DealAssistant step="parties" role={userRole} vessel={vessel} />
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={S.h1}>Buyer & Seller Information</h1>
        <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>
          {userRole==="seller" ? "You are the Seller on this deal." : "You are the Buyer on this deal."} Your side is highlighted. The deal initiator controls vessel details and deal terms.
        </p>
      </div>
      {userRole==="seller" && (
        <div style={{ background:"#eef4fb", border:`1px solid ${C.navy}`, borderRadius:8, padding:"12px 16px", marginBottom:18, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:13, fontWeight:800, fontFamily:"sans-serif", color:C.navy, marginBottom:2 }}>📋 You know this boat best</div>
            <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.5 }}>Review the boat details and fix anything that's wrong or missing — the closing documents depend on it being accurate.</div>
          </div>
          <button onClick={onBack} style={{ ...S.btn, fontSize:12.5, padding:"9px 16px", whiteSpace:"nowrap" }}>Review boat details →</button>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {sides.map(side => {
          const isMine = side === userRole;
          // You can edit your own side always. You can edit the OTHER side only
          // to pre-fill it before that party has joined; once they're in, it
          // locks to them.
          const locked = !isMine && partyBJoined;
          return (
          <div key={side} style={{ ...S.card, border: side===userRole ? `2px solid ${C.brass}` : `0.5px solid ${C.mist}`, position:"relative" }}>
            {side===userRole && <span style={{ ...S.pill, position:"absolute", top:12, right:12, background:C.brass, color:C.navy }}>You</span>}
            {locked && <span style={{ ...S.pill, position:"absolute", top:12, right:12, background:C.mist, color:C.slate }}>🔒 Locked</span>}
            <h3 style={S.h3}>{side==="buyer" ? "Buyer" : "Seller"}</h3>
            <Grid2>
              <Field label={`${side==="buyer"?"Buyer":"Seller"} Full Legal Name *`}>
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} value={data[side].name} readOnly={locked} onChange={e=>!locked&&set(side,"name",capFirst(e.target.value))} />
              </Field>
              <Field label="Email *">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} type="email" value={data[side].email} readOnly={locked} onChange={e=>!locked&&set(side,"email",e.target.value)} />
              </Field>
              <Field label="Phone">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} value={data[side].phone} readOnly={locked} onChange={e=>!locked&&set(side,"phone",e.target.value)} />
              </Field>
              <Field label="Address">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} value={data[side].address} readOnly={locked} onChange={e=>!locked&&set(side,"address",e.target.value)} />
              </Field>
              <Field label="City">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} value={data[side].city} readOnly={locked} onChange={e=>!locked&&set(side,"city",e.target.value)} />
              </Field>
              <Field label="State / Zip">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} value={data[side].stateZip} readOnly={locked} onChange={e=>!locked&&set(side,"stateZip",e.target.value)} />
              </Field>
            </Grid2>
            {locked && (
              <div style={{ marginTop:12, padding:"10px 12px", background:C.sandDark, borderRadius:5, fontSize:12, fontFamily:"sans-serif", color:C.slate }}>
                🔒 This is the other party's information. They control their own contact details and you can't edit them.
              </div>
            )}
            {!isMine && !partyBJoined && (
              <div style={{ marginTop:12, padding:"10px 12px", background:C.sandDark, borderRadius:5, fontSize:12, fontFamily:"sans-serif", color:C.slate }}>
                The other party can fill in their own info after you invite them. You can also enter it on their behalf now — it locks to them once they join.
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* ── INVITE OTHER PARTY (only until the other side joins) ── */}
      {!partyBJoined ? (
      <div style={{ background:C.navy, borderRadius:8, padding:"14px 18px", marginTop:16, display:"flex", gap:14, alignItems:"flex-start" }}>
        <div style={{ fontSize:22, flexShrink:0 }}>📧</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.brass, fontFamily:"sans-serif", marginBottom:4 }}>Invite the Other Party</div>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.75)", lineHeight:1.7, marginBottom:12 }}>
            The other party needs a free BoatClosers account to join this deal, respond to offers, and sign documents. When they join, your deal is pre-linked and they fill in their own side.
          </div>

          {/* Step 1: the one question that decides everything */}
          {inviteMode === null && !inviteSent && !inviteLink && (
            <div>
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:"#fff", fontWeight:600, marginBottom:8 }}>
                Do you have the other party's email address?
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{ setInviteMode("email"); setInviteError(""); }} style={{ background:C.brass, color:C.navy, border:"none", borderRadius:5, padding:"7px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                  Yes — email them
                </button>
                <button onClick={()=>{ setInviteMode("link"); setInviteError(""); }} style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:5, padding:"7px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                  No — give me a link to share
                </button>
              </div>
            </div>
          )}

          {/* EMAIL PATH: enter email right here, we auto-send the join link. */}
          {inviteMode === "email" && !inviteSent && (
            <div>
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.8)", marginBottom:8 }}>
                Enter the {otherSide}'s email and we'll send them the join link directly — you don't need to copy anything.
              </div>
              <input
                style={{ ...S.input, marginBottom:10 }}
                type="email"
                value={(data?.[otherSide]?.email) || ""}
                onChange={e=>set(otherSide, "email", e.target.value)}
                placeholder={`${otherSide==="seller"?"Seller":"Buyer"}'s email address`}
              />
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>runInvite(false)} disabled={inviteLoading} style={{ background:C.brass, color:C.navy, border:"none", borderRadius:5, padding:"7px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:inviteLoading?"default":"pointer", opacity:inviteLoading?0.6:1 }}>
                  {inviteLoading ? "Sending..." : `Email the ${otherSide} their invite`}
                </button>
                <button onClick={()=>{ setInviteMode(null); setInviteError(""); }} style={{ background:"transparent", color:"rgba(255,255,255,0.6)", border:"none", fontSize:11, fontFamily:"sans-serif", cursor:"pointer" }}>
                  Back
                </button>
              </div>
            </div>
          )}

          {/* EMAIL PATH success */}
          {inviteSent && (
            <div style={{ background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.4)", borderRadius:6, padding:"10px 12px", fontSize:12, fontFamily:"sans-serif", color:"#bbf7d0" }}>
              ✓ Invite emailed to the {otherSide} at {data?.[otherSide]?.email}. They'll get a link to create their account and join this deal.
            </div>
          )}

          {/* LINK PATH: show a copyable link they send themselves */}
          {inviteMode === "link" && (
            <div>
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.8)", marginBottom:8 }}>
                We'll create a link you can paste anywhere — Facebook Messenger, Craigslist reply, or a text. Anyone who opens it can create their account and join this deal as the {otherSide}.
              </div>
              {!inviteLink ? (
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>runInvite(true)} disabled={inviteLoading} style={{ background:C.brass, color:C.navy, border:"none", borderRadius:5, padding:"7px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:inviteLoading?"default":"pointer", opacity:inviteLoading?0.6:1 }}>
                    {inviteLoading ? "Creating..." : "Create shareable link"}
                  </button>
                  <button onClick={()=>{ setInviteMode(null); setInviteError(""); }} style={{ background:"transparent", color:"rgba(255,255,255,0.6)", border:"none", fontSize:11, fontFamily:"sans-serif", cursor:"pointer" }}>
                    Back
                  </button>
                </div>
              ) : (
                <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:6, padding:"9px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                  <div style={{ fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.7)", wordBreak:"break-all", flex:1 }}>
                    {inviteLink}
                  </div>
                  <button onClick={copyInviteLink} style={{ background:C.brass, color:C.navy, border:"none", borderRadius:5, padding:"5px 12px", fontSize:11, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", flexShrink:0 }}>
                    {inviteCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              )}
            </div>
          )}

          {inviteError && (
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:"#fca5a5", marginTop:8 }}>{inviteError}</div>
          )}
        </div>
      </div>
      ) : (
        <div style={{ background:"#eef7f0", border:"1px solid #22a06b", borderRadius:8, padding:"12px 16px", marginTop:16, fontSize:12.5, fontFamily:"sans-serif", color:"#176844", fontWeight:600 }}>✓ Both parties have joined this deal — you're all set. Confirm your details below are correct, then continue.</div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <div style={{ textAlign:"right" }}>
          {!canContinue && (
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.red, marginBottom:6 }}>
              Add your {mySide==="seller"?"seller":"buyer"} full legal name and email to continue.
            </div>
          )}
          <button style={S.btnBrass} disabled={!canContinue} onClick={onNext}>Continue to Negotiate & Terms →</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — NEGOTIATE + TERMS (combined)
// ─────────────────────────────────────────────────────────────────────────────
function StepNegotiateTerms({ vessel, parties, data, setData, myRole, amInitiator, dealId, onRefresh, refreshing, onNext, onBack }) {
  const [newMsg, setNewMsg] = useState("");
  const [offerAmt, setOfferAmt] = useState(data.currentOffer || "");
  const [askingPrice, setAskingPrice] = useState(vessel.askingPrice || data.askingPrice || "");
  const [escrowPct, setEscrowPct] = useState(data.escrowPct!==undefined ? String(data.escrowPct) : "0");
  const [escrowPath, setEscrowPath] = useState(data.escrowPath || "escrow_com");
  const [ddDays, setDdDays] = useState(data.dueDiligenceDays || "10");
  const [ddStart, setDdStart] = useState(data.ddStartDate || today());
  const [closingDate, setClosingDate] = useState(data.closingDate || "");
  const [offers, setOffers] = useState(data.offers || []);
  const [offerFrom, setOfferFrom] = useState(myRole==="seller" ? "seller" : "buyer"); // who is making the current offer
  // Opt-in sections of the offer — the customer chooses what to include.
  const [inclContingencies, setInclContingencies] = useState(data.inclContingencies ?? true);
  const [inclDates, setInclDates] = useState(data.inclDates ?? true);
  const [inclDepositTerms, setInclDepositTerms] = useState(data.inclDepositTerms ?? true);
  const [showMessages, setShowMessages] = useState(true);
  // In Deal Room mode (offers already exist) the builder starts collapsed so the
  // negotiation conversation is the focus; expand it to make a new offer/counter.
  const [showBuilder, setShowBuilder] = useState(false);
  const [quickAmt, setQuickAmt] = useState("");
  const [localContingencies, setLocalContingencies] = useState(data.selectedContingencies || []);
  const [messages, setMessages] = useState(data.messages || [
    { from:"seller", text:`Asking price is ${fmt(vessel.askingPrice||0)}. Let's talk!`, time: new Date().toLocaleTimeString() }
  ]);
  // Purchase Agreement modal — triggered when offer accepted
  const [paModal, setPaModal] = useState(null); // null or the offer being accepted
  const [paStage, setPaStage] = useState("pay"); // "pay" (pay first) | "review" (then sign)
  const [paPaid, setPaPaid] = useState(false);
  const [paBuyerName, setPaBuyerName] = useState("");
  const [paSellerName, setPaSellerName] = useState("");
  const [paBuyerDisc, setPaBuyerDisc] = useState(false);
  const [paSellerDisc, setPaSellerDisc] = useState(false);
  const paBothSigned = paBuyerName.trim() && paSellerName.trim() && paBuyerDisc && paSellerDisc;
  // Payment window (initiator pays the $249 fee). SIMULATED until Stripe is wired.
  const [payModal, setPayModal] = useState(null); // null or the offer being paid for
  const [payFeeAmt, setPayFeeAmt] = useState(249); // 249 full, 124.5 split-half
  const [payWho, setPayWho] = useState("initiator"); // which side this payment is for
  const [payCard, setPayCard] = useState({ name:"", num:"", exp:"", cvc:"", zip:"" });
  const [payProcessing, setPayProcessing] = useState(false);
  // Signature section ref — when the agreement opens, scroll the user straight to
  // where they sign so they don't bounce off the page looking for it.
  const sigRef = useRef(null);
  useEffect(() => {
    if (paModal) { const t = setTimeout(() => { try { sigRef.current?.scrollIntoView({ behavior:"smooth", block:"center" }); } catch(e){} }, 350); return () => clearTimeout(t); }
  }, [paModal]);

  // Verbal deal
  const [verbalDeal, setVerbalDeal] = useState(data.verbalDeal||false);
  const [verbalNote, setVerbalNote] = useState(data.verbalNote||"");
  const [negMode, setNegMode] = useState("negotiate"); // "negotiate" | "agreed"
  // Seller-only: flag a conflict on dates/deposit terms via email to the buyer.
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictTopic, setConflictTopic] = useState("dates");
  const [conflictMsg, setConflictMsg] = useState("");
  const [conflictSending, setConflictSending] = useState(false);
  const [conflictSent, setConflictSent] = useState(false);
  const [conflictErr, setConflictErr] = useState("");

  const sendConflict = async () => {
    if (!conflictMsg.trim()) { setConflictErr("Write a short note for the buyer."); return; }
    setConflictSending(true); setConflictErr("");
    try {
      const res = await fetch("/api/deals/conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: dealId,
          topic: conflictTopic,
          message: conflictMsg,
          fromName: parties?.seller?.name || ""
        })
      });
      const r = await res.json();
      if (!res.ok) { setConflictErr(r?.error || "Could not send."); setConflictSending(false); return; }
      setConflictSent(true);
    } catch (e) { setConflictErr("Network error, try again."); }
    setConflictSending(false);
  };

  // Outside deal / agreed price
  const [agreedOutside, setAgreedOutside] = useState("");
  const [outsideMethod, setOutsideMethod] = useState("verbal");

  // ── LIVE SYNC FIX ──────────────────────────────────────────────────────────
  // The deal room keeps local copies of offers/messages for snappy editing, but
  // those copies must follow the live server poll — otherwise the other party's
  // new offer or message sits in the deal data and never shows on screen until a
  // full page reload. Re-sync whenever the incoming data actually changes.
  const offersKey = JSON.stringify(data.offers || []);
  const msgsKey = JSON.stringify(data.messages || []);
  useEffect(() => { if (Array.isArray(data.offers)) setOffers(data.offers); }, [offersKey]);
  useEffect(() => { if (Array.isArray(data.messages)) setMessages(data.messages); }, [msgsKey]);

  // DD custom / extension
  const [ddCustom, setDdCustom] = useState(false);
  const [ddExtension, setDdExtension] = useState(data.ddExtension||false);
  const [ddExtDays, setDdExtDays] = useState(data.ddExtDays||"7");
  const [ddExtDepositRule, setDdExtDepositRule] = useState(data.ddExtDepositRule||"returnable");

  // Deposit rule
  const [depositRule, setDepositRule] = useState(data.depositRule||"fully_returnable");
  const [depositRuleCustom, setDepositRuleCustom] = useState(data.depositRuleCustom||"");
  const [depositHours, setDepositHours] = useState(data.depositHours ? String(data.depositHours) : "24");

  // Payment type + financing
  const [paymentType, setPaymentType] = useState(data.paymentType||"cash");
  const [financeContingency, setFinanceContingency] = useState(data.financeContingency||"14");

  const messagesEnd = useRef(null);
  const offerFormRef = useRef(null);
  useEffect(() => { messagesEnd.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    const msg = { from: myRole, text: newMsg, time: new Date().toLocaleTimeString() };
    const updated = [...messages, msg];
    setMessages(updated);
    setNewMsg("");
    // Persist to the deal so the other party receives it (server merges messages).
    setData(d => ({ ...d, messages: updated, offers }));
  };

  const makeOffer = () => {
    const amt = Number(offerAmt);
    if (!amt) return;
    const fromRole = myRole === "seller" ? "seller" : "buyer";
    const deposit = Math.round(amt*Number(escrowPct)/100);
    const offer = {
      id:Date.now(), from:fromRole, amount:amt, askingPrice:Number(askingPrice)||0,
      escrowPct:Number(escrowPct), escrowPath, deposit,
      verbal:verbalDeal, status:"pending", time:new Date().toLocaleTimeString(),
      // opt-in contingencies
      inclContingencies, contingencies: inclContingencies ? localContingencies : [],
      // opt-in dates & payment
      inclDates,
      ddDays: inclDates ? ddDays : "", ddStart: inclDates ? ddStart : "",
      closingDate: inclDates ? closingDate : "", paymentType: inclDates ? paymentType : "",
      financeContingency: inclDates ? financeContingency : "",
      ddExtension: inclDates ? ddExtension : false, ddExtDays, ddExtDepositRule,
      // opt-in deposit terms / notes
      inclDepositTerms, depositRule: inclDepositTerms ? depositRule : "", depositRuleCustom, note: verbalNote,
      depositHours: Number(depositHours) || 24,
    };
    setOffers(o => {
      const updated = [...o.map(of => of.status==="pending" ? {...of, status:"countered"} : of), offer];
      setData(d => ({...d, offers: updated}));
      return updated;
    });
    const escrowLabel = escLabel(escrowPath);
    const parts = [`${fromRole==="buyer"?"Offer":"Counter"}: ${fmt(amt)}`];
    parts.push(deposit>0?`${fmt(deposit)} (${escrowPct}%) earnest via ${escrowLabel}`:"No deposit");
    if (inclContingencies && localContingencies.length) parts.push(`Contingent on ${contingencyNames(localContingencies)}`);
    if (inclDates) parts.push(`Due Diligence ${ddDays} days · Close ${closingDate||"TBD"}`);
    setMessages(m => {
      const updated = [...m, { from:fromRole, text:parts.join(" · "), time:new Date().toLocaleTimeString() }];
      setData(d => ({...d, messages: updated}));
      return updated;
    });
    setShowBuilder(false);
  };

  // Counter an offer: pre-fill the form with its terms, flip to the other party, scroll to the form.
  const counterOffer = (id) => {
    const o = offers.find(x => x.id===id);
    if (!o) return;
    setOfferAmt(String(o.amount));
    if (o.askingPrice) setAskingPrice(String(o.askingPrice));
    setEscrowPct(String(o.escrowPct));
    setEscrowPath(o.escrowPath);
    setInclContingencies(!!o.inclContingencies);
    if (o.contingencies) setLocalContingencies(o.contingencies);
    setInclDates(!!o.inclDates);
    if (o.ddDays) setDdDays(o.ddDays);
    if (o.ddStart) setDdStart(o.ddStart);
    if (o.closingDate) setClosingDate(o.closingDate);
    if (o.paymentType) setPaymentType(o.paymentType);
    setInclDepositTerms(!!o.inclDepositTerms);
    if (o.depositRule) setDepositRule(o.depositRule);
    setOfferFrom(myRole==="seller" ? "seller" : "buyer");
    setNegMode("negotiate");
    setShowBuilder(true);
    setTimeout(() => offerFormRef.current?.scrollIntoView({ behavior:"smooth", block:"center" }), 60);
  };

  // Accepting an offer opens the modal — pay first, then sign the PA.
  const acceptOffer = (id) => {
    const acc = offers.find(o => o.id===id);
    if (!acc) return;
    // Either party accepting the other's number means the PRICE is agreed.
    // Both then sign the Purchase Agreement (free) before the initiator pays.
    const updatedOffers = offers.map(of => of.id===id ? {...of, status:"agreed", agreedBy:myRole} : of);
    const note = { from: myRole, text:`✓ I accept ${fmt(acc.amount)}. Let's both sign the Purchase Agreement.`, time:new Date().toLocaleTimeString() };
    const updatedMsgs = [...messages, note];
    setOffers(updatedOffers);
    setMessages(updatedMsgs);
    setData(d => ({ ...d, offers: updatedOffers, messages: updatedMsgs, priceAgreed: true, agreedOfferId: id }));
  };

  // Each party signs ONLY their own line, from their own login. The signature
  // saves onto the agreed offer so the other party sees it via live sync.
  const signMyLine = (offerId) => {
    const myName = (myRole === "buyer" ? paBuyerName : paSellerName).trim();
    if (!myName) return;
    const patch = myRole === "buyer"
      ? { paBuyerSig: myName, paBuyerDisc: true, paBuyerDate: today() }
      : { paSellerSig: myName, paSellerDisc: true, paSellerDate: today() };
    setOffers(o => {
      const updated = o.map(of => of.id===offerId ? {...of, ...patch} : of);
      setData(d => ({ ...d, offers: updated }));
      return updated;
    });
    setMessages(m => {
      const updated = [...m, { from: myRole, text:`✍️ ${myName} signed the Purchase Agreement as the ${myRole}.`, time:new Date().toLocaleTimeString() }];
      setData(d => ({ ...d, messages: updated }));
      return updated;
    });
  };

  // Final step: payment locks the deal — records the binding PA, marks paid, unlocks documents.
  // NOTE: payment is SIMULATED for now. Wire Stripe Checkout to this handler as the final task.
  const lockDeal = (offerArg) => {
    const target = (offerArg && offerArg.id) ? offerArg : paModal;
    if (!target) return;
    const live = offers.find(o => o.id===target.id) || target;
    const updatedOffers = offers.map(of => of.id===target.id ? {...of, status:"accepted", paBuyerSig:live.paBuyerSig, paSellerSig:live.paSellerSig, paDate:today()} : of);
    const lockMsg = { from:"system", text:`✓ Deal locked — ${fmt(target.amount)}. Purchase Agreement signed by both parties and the fee paid on ${today()}. This deal is now binding.`, time:new Date().toLocaleTimeString() };
    const updatedMsgs = [...messages, lockMsg];
    setOffers(updatedOffers);
    setMessages(updatedMsgs);
    setData(d => ({
      ...d,
      offers: updatedOffers,
      messages: updatedMsgs,
      paid: true,            // unlocks the Documents step (no second paywall)
      dealLocked: true,
      dealStatus: "locked",
      agreedPrice: target.amount,
      escrowPct: target.escrowPct,
      escrowPath: target.escrowPath,
      deposit: target.deposit,
      selectedContingencies: target.contingencies || [],
      dueDiligenceDays: target.ddDays || ddDays,
      ddStartDate: target.ddStart || ddStart,
      closingDate: target.closingDate || closingDate,
      paymentType: target.paymentType || paymentType,
      financeContingency: target.financeContingency || financeContingency,
      depositRule: target.depositRule || depositRule, depositRuleCustom,
      depositHours: target.depositHours || 24,
      depositDeadline: Date.now() + (Number(target.depositHours) || 24) * 3600 * 1000,
      depositProof: null,
      ddExtension: target.ddExtension ?? ddExtension, ddExtDays, ddExtDepositRule,
      verbalDeal, verbalNote: target.note || verbalNote,
    }));
    setPaModal(null); setPaStage("sign"); setPaPaid(false);
    setPaBuyerName(""); setPaSellerName(""); setPaBuyerDisc(false); setPaSellerDisc(false);
  };

  // ── Payment plan: full / split 50-50 / ask the other party ──
  const otherPayRole = myRole === "buyer" ? "seller" : "buyer";
  const otherPayName = parties[otherPayRole]?.name || (otherPayRole === "buyer" ? "the buyer" : "the seller");
  const payPlan = data.payPlan || "full";
  const setPayPlan = (p) => setData(d => ({ ...d, payPlan: p }));
  const openCheckout = (who, fee) => { setPayWho(who); setPayFeeAmt(fee); setPayModal(agreedOffer || acceptedOffer); };
  const recordPayment = (who) => {
    const plan = data.payPlan || "full";
    const paidInit = who === "initiator" ? true : !!data.paidInitiator;
    const paidOth  = who === "other"     ? true : !!data.paidOther;
    const complete = plan === "full" ? paidInit : plan === "other" ? paidOth : (paidInit && paidOth);
    if (complete) { lockDeal(agreedOffer); return; }
    const note = { from:"system", text:`💳 ${who==="initiator"?"The deal initiator":"The other party"} paid their half ($124.50). The deal locks once the other half is paid.`, time:new Date().toLocaleTimeString() };
    const updatedMsgs = [...messages, note];
    setMessages(updatedMsgs);
    setData(d => ({ ...d, payPlan:plan, paidInitiator:paidInit, paidOther:paidOth, messages:updatedMsgs }));
  };
  // Safety net: if a sync catches up and both split-halves are in, lock the deal.
  useEffect(() => {
    if (data.dealLocked || data.paid) return;
    if (data.payPlan === "split" && data.paidInitiator && data.paidOther && agreedOffer) lockDeal(agreedOffer);
  }, [data.paidInitiator, data.paidOther, data.payPlan, data.dealLocked, data.paid]);

  const rejectOffer = (id) => {
    const updatedOffers = offers.map(of => of.id===id ? {...of, status:"rejected"} : of);
    const note = { from: myRole, text:`✗ I've rejected the ${fmt(offers.find(o=>o.id===id)?.amount||0)} offer.`, time:new Date().toLocaleTimeString() };
    const updatedMsgs = [...messages, note];
    setOffers(updatedOffers);
    setMessages(updatedMsgs);
    // Persist so the other party sees the rejection and the email fires.
    setData(d => ({ ...d, offers: updatedOffers, messages: updatedMsgs }));
  };

  // Quick price counter straight from the offer ladder — copies the latest
  // offer's terms and swaps ONLY the price, then sends it back. Keeps the
  // "buyer authors terms / seller counters price" rule intact because nothing
  // but the amount changes.
  const sendQuickCounter = (baseOffer) => {
    const amt = Number(String(quickAmt).replace(/[^0-9.]/g, ""));
    if (!amt || !baseOffer) return;
    const fromRole = myRole === "seller" ? "seller" : "buyer";
    const deposit = Math.round(amt * Number(baseOffer.escrowPct || 0) / 100);
    const offer = { ...baseOffer, id: Date.now(), from: fromRole, amount: amt, deposit, status: "pending", time: new Date().toLocaleTimeString() };
    setOffers(o => {
      const updated = [...o.map(of => of.status === "pending" ? { ...of, status: "countered" } : of), offer];
      setData(d => ({ ...d, offers: updated }));
      return updated;
    });
    setMessages(m => {
      const updated = [...m, { from: fromRole, text: `Counter: ${fmt(amt)}`, time: new Date().toLocaleTimeString() }];
      setData(d => ({ ...d, messages: updated }));
      return updated;
    });
    setQuickAmt("");
  };

  const acceptedOffer = offers.find(o => o.status==="accepted");
  // An offer the OTHER party accepted, now awaiting the initiator's payment to lock.
  const agreedOffer = offers.find(o => o.status==="agreed");
  // Once price is agreed, the offer is accepted, or the deal is locked/paid, the
  // negotiation is closed — no more accept / counter / reject on the ladder.
  const frozen = !!acceptedOffer || !!agreedOffer || !!(data.dealLocked || data.paid);
  // The latest still-pending offer, and whether *I* am the one who made it
  // (if so, I'm waiting on the other party and can't send another).
  const latestPendingTop = [...offers].reverse().find(o => o.status==="pending");
  const myOfferAwaiting = latestPendingTop && latestPendingTop.from === myRole;

  // Pre-fill the quick-counter box with the other party's latest number so the
  // user only has to nudge it, not retype from scratch.
  useEffect(() => {
    if (latestPendingTop && latestPendingTop.from !== myRole) setQuickAmt(String(latestPendingTop.amount));
  }, [latestPendingTop?.id]);

  // ── DEAL ROOM status: gap between sides + whose turn it is ──
  const _lastBuyerOffer = [...offers].reverse().find(o => o.from==="buyer");
  const _lastSellerOffer = [...offers].reverse().find(o => o.from==="seller");
  const dealGap = (_lastBuyerOffer && _lastSellerOffer)
    ? Math.abs(Number(_lastSellerOffer.amount) - Number(_lastBuyerOffer.amount))
    : null;
  // Whose move: if there's a pending offer, it's the OTHER party's turn to respond.
  // If no pending offer at all, it's the buyer's turn to open.
  const whoseTurn = acceptedOffer ? "done"
    : latestPendingTop ? (latestPendingTop.from === "buyer" ? "seller" : "buyer")
    : "buyer";
  const myTurn = whoseTurn === myRole;

  // Price-Agreed / celebration box. Rendered in TWO spots in the Deal Room (top,
  // and again down in the negotiation area) so a user who lands lower on the page
  // after signing in can't miss the sign / pay action.
  const agreedBanner = (!(agreedOffer && !acceptedOffer)) ? null : (() => {
    const buyerSigned = !!(agreedOffer.paBuyerSig && agreedOffer.paBuyerDisc);
    const sellerSigned = !!(agreedOffer.paSellerSig && agreedOffer.paSellerDisc);
    const bothSigned = buyerSigned && sellerSigned;
    const iSigned = myRole==="buyer" ? buyerSigned : sellerSigned;
    return (
        <div style={{ background: bothSigned ? "linear-gradient(135deg,#fff7e6,#f0fdf4)" : "#f0fdf4", border:`2px solid ${bothSigned ? C.brass : C.green}`, borderRadius:10, padding:"18px 20px", marginBottom:16, boxShadow: bothSigned ? "0 6px 22px rgba(184,134,58,0.20)" : "none" }}>
          <div style={{ fontSize:17, fontWeight:800, fontFamily:"sans-serif", color:"#166534", marginBottom:8 }}>
            {bothSigned ? "🎉 Both parties have signed!" : `🤝 Price Agreed — ${fmt(agreedOffer.amount)}`}
          </div>
          <div style={{ display:"flex", gap:16, fontSize:12.5, fontFamily:"sans-serif", color:C.slate, marginBottom:12, flexWrap:"wrap" }}>
            <span>{buyerSigned ? "✅" : "⬜"} Buyer signed</span>
            <span>{sellerSigned ? "✅" : "⬜"} Seller signed</span>
            <span style={{ fontWeight:700, color:C.navy }}>· {fmt(agreedOffer.amount)}</span>
          </div>

          {!bothSigned ? (
            <>
              <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom:12 }}>
                Both parties sign the Purchase Agreement for free — each signs only their own line. {amInitiator ? "Once both have signed, you pay the one-time $249 to make it binding." : "Once both have signed, the party who started the deal pays the $249 — nothing for you to pay."}
              </div>
              <button style={{ ...S.btnBrass, fontSize:14, padding:"11px 22px" }} onClick={()=>{ setPaModal(agreedOffer); setPaStage("sign"); }}>
                {iSigned ? "View Purchase Agreement →" : "Sign the Purchase Agreement →"}
              </button>
            </>
          ) : amInitiator ? (
            <>
              <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6, marginBottom:12, fontWeight:600 }}>
                The Purchase Agreement is fully signed. Choose how the one-time <b>$249</b> fee gets paid, then complete it to make the deal binding and unlock Due Diligence, Documents, and Closing for both parties.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                {[["full","I'll pay","$249"],["split","Split 50/50","$124.50 each"],["other",`Ask ${otherPayName}`,"they pay $249"]].map(([id,label,sub])=>(
                  <button key={id} onClick={()=>setPayPlan(id)} style={{ padding:"10px 8px", borderRadius:6, cursor:"pointer", textAlign:"center", fontFamily:"sans-serif", border:`2px solid ${payPlan===id?C.brass:C.mist}`, background:payPlan===id?"#fff8e6":"transparent" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>{label}</div>
                    <div style={{ fontSize:10, color:C.slate, marginTop:2 }}>{sub}</div>
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                {payPlan==="full" && <button style={{ ...S.btnBrass, fontSize:15, padding:"13px 26px" }} onClick={()=>openCheckout("initiator",249)}>💳 Pay $249 &amp; unlock the deal →</button>}
                {payPlan==="split" && (data.paidInitiator
                  ? <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:"#166534", fontWeight:600 }}>✓ You paid your half. Waiting for {otherPayName} to pay theirs — it unlocks automatically.</div>
                  : <button style={{ ...S.btnBrass, fontSize:15, padding:"13px 26px" }} onClick={()=>openCheckout("initiator",124.5)}>💳 Pay your half $124.50 →</button>)}
                {payPlan==="other" && (data.paidOther
                  ? <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:"#166534", fontWeight:600 }}>✓ {otherPayName} paid — unlocking…</div>
                  : <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, fontWeight:600 }}>Waiting for {otherPayName} to pay the $249. They see the request on their side, and it unlocks the moment they pay.</div>)}
                <button style={{ ...S.btnOutline, fontSize:13, padding:"13px 18px" }} onClick={()=>{ setPaModal(agreedOffer); setPaStage("sign"); }}>View signed agreement</button>
              </div>
            </>
          ) : (
            <>
              {payPlan==="full" && (
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:"#166534", lineHeight:1.6, marginBottom:12, fontWeight:600 }}>
                  ✓ All signed! Waiting for the party who started this deal to pay the one-time $249 and make it binding — <b>nothing for you to pay</b>. You'll be unlocked automatically the moment they do.
                </div>
              )}
              {payPlan==="split" && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6, marginBottom:10, fontWeight:600 }}>The other party chose to <b>split the $249 fee 50/50</b>. Your share is <b>$124.50</b>.</div>
                  {data.paidOther
                    ? <div style={{ fontSize:12.5, color:"#166534", fontFamily:"sans-serif", fontWeight:600 }}>✓ You paid your half. Waiting for their half — it unlocks automatically.</div>
                    : <button style={{ ...S.btnBrass, fontSize:15, padding:"13px 26px" }} onClick={()=>openCheckout("other",124.5)}>💳 Pay your half $124.50 →</button>}
                </div>
              )}
              {payPlan==="other" && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6, marginBottom:10, fontWeight:600 }}>The other party asked <b>you</b> to pay the one-time <b>$249</b> fee to lock the deal and unlock Due Diligence, Documents, and Closing.</div>
                  {data.paidOther
                    ? <div style={{ fontSize:12.5, color:"#166534", fontFamily:"sans-serif", fontWeight:600 }}>✓ Paid — unlocking…</div>
                    : <button style={{ ...S.btnBrass, fontSize:15, padding:"13px 26px" }} onClick={()=>openCheckout("other",249)}>💳 Pay $249 &amp; unlock the deal →</button>}
                </div>
              )}
              <button style={{ ...S.btnOutline, fontSize:13, padding:"11px 18px" }} onClick={()=>{ setPaModal(agreedOffer); setPaStage("sign"); }}>View signed agreement</button>
            </>
          )}
        </div>
    );
  })();

  // Can proceed without accepted offer — just need some data
  const canProceed = !!acceptedOffer || !!(data.dealLocked || data.paid);

  const proceed = () => {
    const agreed = acceptedOffer || { amount:Number(offerAmt), escrowPct:Number(escrowPct), escrowPath, deposit:Math.round(Number(offerAmt)*Number(escrowPct)/100), ddDays, closingDate, status:"working" };
    setData(d => ({
      ...d, offers, messages,
      agreedPrice: agreed.amount,
      escrowPct: agreed.escrowPct,
      escrowPath: agreed.escrowPath,
      deposit: agreed.deposit,
      dueDiligenceDays: agreed.ddDays || ddDays,
      ddStartDate: ddStart,
      closingDate: agreed.closingDate || closingDate,
      verbalDeal, verbalNote,
      ddExtension, ddExtDays, ddExtDepositRule,
      depositRule, depositRuleCustom,
      paymentType, financeContingency,
    }));
    onNext();
  };

  // ── PAYMENT WINDOW (initiator pays the one-time fee) ──────────────────────
  // SIMULATED checkout. To go live, replace doPay() with Stripe Checkout/Elements;
  // the rest of this window (summary, fields, success → lockDeal) stays the same.
  if (payModal) {
    const amt = payModal.amount || 0;
    const fee = payFeeAmt;
    const card = payCard;
    const validCard = card.name.trim() && card.num.replace(/\s/g, "").length >= 12 && card.exp.trim() && card.cvc.trim();
    const doPay = () => {
      if (!validCard || payProcessing) return;
      setPayProcessing(true);
      setTimeout(() => { setPayProcessing(false); setPayModal(null); recordPayment(payWho); }, 1400);
    };
    return (
      <div style={{ minHeight:"100vh", background:"rgba(8,21,46,0.85)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"2rem 1rem" }}>
        <div style={{ background:C.white, borderRadius:10, width:"100%", maxWidth:440, border:`2px solid ${C.brass}`, overflow:"hidden" }}>
          <div style={{ background:C.navy, padding:"1.1rem 1.5rem" }}>
            <div style={{ fontSize:9, letterSpacing:3, color:C.brass, fontFamily:"sans-serif", textTransform:"uppercase" }}>BoatClosers.com · Secure Checkout</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.white }}>Complete your payment</div>
          </div>
          <div style={{ padding:"1.4rem 1.5rem" }}>
            <div style={{ background:C.sandDark, borderRadius:8, padding:"14px 16px", marginBottom:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontFamily:"sans-serif", color:C.text, marginBottom:6 }}><span>{fee < 249 ? "BoatClosers deal fee — your half" : "BoatClosers deal fee (one-time)"}</span><span style={{ fontWeight:700 }}>${fee.toFixed(2)}</span></div>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.5, marginBottom:10 }}>For the {vessel.year} {vessel.make} {vessel.model} — {fmt(amt)}. Unlocks Due Diligence, Documents, and Closing for both parties and makes the signed agreement binding.</div>
              <div style={{ borderTop:`1px solid ${C.mist}`, paddingTop:8, display:"flex", justifyContent:"space-between", fontSize:15, fontFamily:"sans-serif", fontWeight:800, color:C.navy }}><span>Total due today</span><span>${fee.toFixed(2)}</span></div>
            </div>
            <label style={S.label}>Name on card</label>
            <input style={S.input} value={card.name} onChange={e=>setPayCard(c=>({ ...c, name:capFirst(e.target.value) }))} placeholder="Full name" />
            <label style={{ ...S.label, marginTop:10 }}>Card number</label>
            <input style={S.input} value={card.num} onChange={e=>setPayCard(c=>({ ...c, num:e.target.value }))} placeholder="1234 5678 9012 3456" inputMode="numeric" />
            <div style={{ display:"flex", gap:10, marginTop:10 }}>
              <div style={{ flex:1 }}><label style={S.label}>Expiry</label><input style={S.input} value={card.exp} onChange={e=>setPayCard(c=>({ ...c, exp:e.target.value }))} placeholder="MM/YY" /></div>
              <div style={{ flex:1 }}><label style={S.label}>CVC</label><input style={S.input} value={card.cvc} onChange={e=>setPayCard(c=>({ ...c, cvc:e.target.value }))} placeholder="123" inputMode="numeric" /></div>
              <div style={{ flex:1 }}><label style={S.label}>ZIP</label><input style={S.input} value={card.zip} onChange={e=>setPayCard(c=>({ ...c, zip:e.target.value }))} placeholder="33401" inputMode="numeric" /></div>
            </div>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, margin:"12px 0", display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>🔒 Payments are encrypted. <span style={{ color:C.brass, fontWeight:700 }}>Test mode — no real charge yet.</span></div>
            <button onClick={doPay} disabled={!validCard||payProcessing} style={{ ...S.btnBrass, width:"100%", padding:"13px", fontSize:15, fontWeight:700, opacity:(!validCard||payProcessing)?0.5:1 }}>
              {payProcessing ? "Processing…" : `Pay $${fee.toFixed(2)}`}
            </button>
            <button onClick={()=>{ if(!payProcessing) setPayModal(null); }} style={{ ...S.btnOutline, width:"100%", padding:"10px", fontSize:13, marginTop:10 }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PURCHASE AGREEMENT MODAL ─────────────────────────────────────────────
  if (paModal) {
    const esc = escLabel(paModal.escrowPath);
    const live = offers.find(o => o.id===paModal.id) || paModal;
    const buyerSigned = !!(live.paBuyerSig && live.paBuyerDisc);
    const sellerSigned = !!(live.paSellerSig && live.paSellerDisc);
    const bothSigned = buyerSigned && sellerSigned;
    const iAmBuyer = myRole === "buyer";
    const mySigned = iAmBuyer ? buyerSigned : sellerSigned;
    const otherRole = iAmBuyer ? "seller" : "buyer";

    const paAgreed = paModal.amount || 0;
    const paDep = paModal.deposit || 0;
    // All contingency deadlines are the single Due-Diligence end date set in negotiation.
    const _ddS = paModal.ddStart || ddStart || data.ddStartDate;
    const _ddD = paModal.ddDays || ddDays || data.dueDiligenceDays;
    const paDDEnd = (_ddS && _ddD) ? addDays(_ddS, Number(_ddD)) : "";
    const paFill = {
      dealRef: data.dealRef || ("BC-" + String(Date.now()).slice(-5)),
      effectiveDate: today(),
      sellerName: parties.seller.name || paModal.paSellerSig || "[Seller Name]",
      sellerAddress: `${parties.seller.address||""} ${parties.seller.city||""} ${parties.seller.stateZip||""}`.trim() || "[Seller Address]",
      sellerCitizen: "United States",
      buyerName: parties.buyer.name || paModal.paBuyerSig || "[Buyer Name]",
      buyerAddress: `${parties.buyer.address||""} ${parties.buyer.city||""} ${parties.buyer.stateZip||""}`.trim() || "[Buyer Address]",
      buyerCitizen: "United States",
      vesselYear: vessel.year||"[Year]", vesselMake: vessel.make||"[Make]", vesselModel: vessel.model||"[Model]",
      vesselLength: vessel.loa ? vessel.loa+" ft" : "[Length]",
      hullMaterial: vessel.hullType || "[Hull]",
      hin: vessel.hin || "[HIN]",
      uscgOfficialNo: vessel.uscgNumber || "N/A",
      titleNo: vessel.regNumber || "[Title No.]",
      regNo: vessel.regNumber || "[Reg]",
      vesselState: vessel.regState || vessel.location || "[State]",
      engineDesc: `${vessel.engineCount||"1"} × ${vessel.engineMake||""} ${vessel.engineModel||""}`.trim() || "[Engine]",
      salePrice: fmt(paAgreed), salePriceWords: priceToWords(paAgreed),
      depositAmount: fmt(paDep), depositPct: (paModal.escrowPct||0)+"%",
      balanceDue: fmt(Math.max(0, paAgreed - paDep)),
      closingDate: paModal.closingDate || "[Closing Date]",
      closingLocation: vessel.location || "the location where the Vessel is moored",
      surveyDeadline: paDDEnd || "____________", seaTrialDeadline: paDDEnd || "____________", financingDeadline: paDDEnd || "____________",
      brokerFee: "$249.00",
      selectedContingencies: (Array.isArray(paModal.contingencies) && paModal.contingencies.length) ? paModal.contingencies : ["survey","seaTrial","title"],
      paymentType: paModal.paymentType || "",
    };
    const paDoc = DOCUMENTS.find(d => d.id === "psa");
    const paHtml = paDoc ? fillDocument(paDoc, paFill) : "";

    return (
      <div style={{ minHeight:"100vh", background:"rgba(8,21,46,0.85)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"2rem 1rem" }}>
        <div style={{ background:C.white, borderRadius:10, width:"100%", maxWidth:680, border:`2px solid ${C.brass}` }}>
          <div style={{ background:C.navy, padding:"1rem 1.5rem", borderRadius:"8px 8px 0 0" }}>
            <div style={{ fontSize:9, letterSpacing:3, color:C.brass, fontFamily:"sans-serif", textTransform:"uppercase" }}>BoatClosers.com</div>
            <div style={{ fontSize:16, fontWeight:700, color:C.white, letterSpacing:0.5 }}>PURCHASE &amp; SALE AGREEMENT</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif", marginTop:2 }}>Sign your own line free · the initiator pays $249 to make it binding · {today()}</div>
          </div>

          <div style={{ padding:"1.5rem", overflowY:"auto", maxHeight:"65vh" }}>
            <div style={{ background: bothSigned ? C.greenLight : "#fff8e6", border:`1.5px solid ${bothSigned ? C.green : C.brass}`, borderRadius:6, padding:"10px 14px", marginBottom:16, textAlign:"center" }}>
              <div style={{ fontSize:12, fontWeight:800, color: bothSigned ? C.green : "#7a5500", fontFamily:"sans-serif", letterSpacing:1 }}>
                {bothSigned ? "✓ BOTH PARTIES SIGNED" : "SIGN YOUR OWN LINE TO PROCEED"}
              </div>
              <div style={{ fontSize:11, color: bothSigned ? "#0d7a4f" : "#7a5500", fontFamily:"sans-serif", marginTop:2 }}>
                {bothSigned ? "The initiator now pays the one-time $249 fee to make this agreement binding." : "You can only sign your own line. The agreement becomes binding once both sign and the fee is paid."}
              </div>
            </div>

            <div className="bc-grid3" style={{ gap:8, marginBottom:14 }}>
              {[["Purchase Price",fmt(paModal.amount)],["Earnest Money",fmt(paModal.deposit)],["Escrow Method",esc]].map(([l,v])=>(
                <div key={l} style={{ background:C.sandDark, borderRadius:4, padding:"8px 10px" }}>
                  <div style={{ fontSize:9, color:C.slate, textTransform:"uppercase", letterSpacing:0.5 }}>{l}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{v||"—"}</div>
                </div>
              ))}
            </div>

            {!bothSigned && !mySigned && (
              <button onClick={()=>sigRef.current?.scrollIntoView({ behavior:"smooth", block:"center" })} style={{ ...S.btnBrass, width:"100%", padding:"11px", fontSize:14, marginBottom:14 }}>
                ✍️ Read the agreement, then scroll to sign ↓
              </button>
            )}

            {/* The full, binding Purchase & Sale Agreement — identical to the document both parties receive. */}
            <style>{PA_DOC_CSS}</style>
            <div className="bc-pa" style={{ background:"#fffdf8", border:`1px solid ${C.mist}`, borderTop:`4px solid ${C.brass}`, borderRadius:4, padding:"20px 22px", marginBottom:16 }} dangerouslySetInnerHTML={{ __html: paHtml }} />

            <hr style={S.divider}/>

            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:5, padding:"10px 14px", fontSize:11, fontFamily:"sans-serif", color:"#7a5500", marginBottom:16 }}>
              By signing, both parties agree to the terms above and acknowledge that BoatClosers provides document facilitation only — not legal advice, brokerage, or escrow services.
            </div>

            <div ref={sigRef} style={{ scrollMarginTop:20 }}>
              <div style={{ fontSize:13, fontWeight:800, fontFamily:"sans-serif", color:C.navy, margin:"4px 0 10px", textAlign:"center", letterSpacing:0.5 }}>✍️ SIGN HERE — {bothSigned ? "both parties have signed" : "type your full legal name on your line"}</div>
            <div className="bc-grid2" style={{ gap:20 }}>
              <div style={{ background:C.sandDark, borderRadius:6, padding:"14px", border: buyerSigned ? `1.5px solid ${C.green}` : `1px solid ${C.mist}` }}>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>Buyer: {parties.buyer.name||"Buyer"}{iAmBuyer ? " (you)" : ""}</div>
                {buyerSigned ? (
                  <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.green, fontWeight:700 }}>✓ Signed — {live.paBuyerSig}</div>
                ) : iAmBuyer ? (
                  <>
                    <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
                      <input type="checkbox" checked={paBuyerDisc} onChange={e=>setPaBuyerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
                      I have read and agree to all terms above
                    </label>
                    <label style={S.label}>Type your full name to sign</label>
                    <input style={S.input} placeholder="Your full legal name" value={paBuyerName} onChange={e=>setPaBuyerName(e.target.value)} />
                    <button style={{ ...S.btnBrass, width:"100%", marginTop:10, fontSize:13, padding:"9px", opacity:(paBuyerName.trim()&&paBuyerDisc)?1:0.4 }} disabled={!(paBuyerName.trim()&&paBuyerDisc)} onClick={()=>signMyLine(paModal.id)}>Sign as buyer</button>
                  </>
                ) : (
                  <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, fontStyle:"italic" }}>⏳ Awaiting the buyer's signature</div>
                )}
              </div>
              <div style={{ background:C.sandDark, borderRadius:6, padding:"14px", border: sellerSigned ? `1.5px solid ${C.green}` : `1px solid ${C.mist}` }}>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>Seller: {parties.seller.name||"Seller"}{!iAmBuyer ? " (you)" : ""}</div>
                {sellerSigned ? (
                  <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.green, fontWeight:700 }}>✓ Signed — {live.paSellerSig}</div>
                ) : !iAmBuyer ? (
                  <>
                    <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
                      <input type="checkbox" checked={paSellerDisc} onChange={e=>setPaSellerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
                      I have read and agree to all terms above
                    </label>
                    <label style={S.label}>Type your full name to sign</label>
                    <input style={S.input} placeholder="Your full legal name" value={paSellerName} onChange={e=>setPaSellerName(e.target.value)} />
                    <button style={{ ...S.btnBrass, width:"100%", marginTop:10, fontSize:13, padding:"9px", opacity:(paSellerName.trim()&&paSellerDisc)?1:0.4 }} disabled={!(paSellerName.trim()&&paSellerDisc)} onClick={()=>signMyLine(paModal.id)}>Sign as seller</button>
                  </>
                ) : (
                  <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, fontStyle:"italic" }}>⏳ Awaiting the seller's signature</div>
                )}
              </div>
            </div>
            </div>
          </div>

          <div style={{ padding:"1rem 1.5rem", borderTop:`1px solid ${C.mist}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <button style={S.btnOutline} onClick={()=>setPaModal(null)}>← Back to deal</button>
            {!bothSigned ? (
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, textAlign:"right" }}>
                {mySigned ? `✓ You've signed — waiting for the ${otherRole} to sign.` : "Sign your line above to continue."}
              </div>
            ) : amInitiator ? (
              <button style={{ ...S.btnBrass, fontSize:14, padding:"11px 20px" }} onClick={()=>setPayModal(paModal)}>
                Pay $249 &amp; make binding →
              </button>
            ) : (
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:"#166534", textAlign:"right", fontWeight:700 }}>
                ✓ Both signed — waiting for the initiator to pay $249 to finalize.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <TipBox tips={TIPS.negotiate} />
      <DealAssistant step="negotiate" role={myRole} vessel={vessel} />
      <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12, flexWrap:"wrap" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#22a06b", display:"inline-block", flexShrink:0 }} />
          Live — new offers, counters, and messages appear here automatically.
        </span>
        {onRefresh && (
          <button onClick={onRefresh} disabled={refreshing} style={{ fontSize:11, fontFamily:"sans-serif", fontWeight:700, color:C.navy, background:"#eef4fb", border:`1px solid ${C.navy}`, borderRadius:14, padding:"4px 12px", cursor: refreshing ? "default" : "pointer", opacity: refreshing ? 0.6 : 1 }}>
            {refreshing ? "Checking…" : "🔄 Check for new offers"}
          </button>
        )}
      </div>
      <div style={{ marginBottom:"1.5rem" }}>
        {offers.length > 0 ? (
          <>
            <h1 style={S.h1}>Deal Room</h1>
            <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>
              {vessel.year} {vessel.make} {vessel.model} — negotiate here until you both agree, then lock the deal. Offers, counters, and messages all live in this room.
            </p>
          </>
        ) : myRole==="seller" ? (
          <>
            <h1 style={S.h1}>Deal Room</h1>
            <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>You're all set for {vessel.year} {vessel.make} {vessel.model}. The next step is the buyer's offer — sit tight and we'll bring it to you right here.</p>
          </>
        ) : (
          <>
            <h1 style={S.h1}>Build Your Offer</h1>
            <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>Put together your price, deposit, and terms, send it to the other party, and negotiate until you agree. Free until you lock the deal.</p>
          </>
        )}
      </div>

      {/* ── DEAL ROOM STATUS BAR ── live snapshot of where the negotiation stands */}
      {offers.length > 0 && !acceptedOffer && !agreedOffer && (
        <div style={{ background:C.navy, borderRadius:10, padding:"14px 18px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.55)", letterSpacing:0.5 }}>CURRENT GAP</div>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:"sans-serif", color:"#fff" }}>
              {dealGap !== null ? `${fmt(dealGap)} apart` : "Awaiting response"}
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.55)", letterSpacing:0.5 }}>WHOSE TURN</div>
            <div style={{ fontSize:15, fontWeight:700, fontFamily:"sans-serif", color: myTurn ? C.brass : "rgba(255,255,255,0.7)" }}>
              {myTurn ? "Your move" : `Waiting on ${whoseTurn}`}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.55)", letterSpacing:0.5 }}>ROUNDS</div>
            <div style={{ fontSize:15, fontWeight:700, fontFamily:"sans-serif", color:"#fff" }}>{offers.length} offer{offers.length>1?"s":""}</div>
          </div>
        </div>
      )}

      {/* ── ASKING PRICE ANCHOR — the seller's starting number the buyer offers against ── */}
      {vessel.askingPrice && !acceptedOffer && !agreedOffer && (
        <div style={{ background:C.sandDark, border:`1px solid ${C.mist}`, borderRadius:8, padding:"10px 16px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate }}>
            <b style={{ color:C.navy }}>Seller's asking price</b> — the starting anchor{myRole==="buyer" ? "; build your offer against it below" : ""}
          </div>
          <div style={{ fontSize:17, fontWeight:800, fontFamily:"sans-serif", color:C.navy }}>{fmt(Number(vessel.askingPrice))}</div>
        </div>
      )}

      {/* ── PRICE AGREED — awaiting initiator payment to lock ── */}
      {agreedBanner}

      {/* ── DEAL LOCKED BANNER ── */}
      {acceptedOffer && (
        <div style={{ background:`linear-gradient(135deg, ${C.green} 0%, #0d7a4f 100%)`, borderRadius:10, padding:"16px 20px", marginBottom:16, color:"#fff", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:28 }}>🔒</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, fontFamily:"sans-serif" }}>Deal Locked — {fmt(acceptedOffer.amount)}</div>
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.85)", marginTop:2, lineHeight:1.5 }}>
              The Purchase Agreement is signed and binding. Earnest money: {fmt(acceptedOffer.deposit)} · Due Diligence: {acceptedOffer.ddDays||"10"} days · Closing: {acceptedOffer.closingDate||"TBD"}. All documents are unlocked.
            </div>
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS (brief) — only while building the first offer ── */}
      {offers.length === 0 && myRole!=="seller" && (
      <div style={{ background:C.navy, borderRadius:8, padding:"13px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ fontSize:20, flexShrink:0 }}>🤝</div>
        <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.78)", lineHeight:1.65 }}>
          <b style={{ color:C.brass }}>Build your complete offer below</b> — price and deposit, plus contingencies and dates if your deal needs them. Send it to the other party; they can accept, counter, or reject. <b style={{ color:"#fff" }}>It's all free</b> — you only pay $249 once a full offer is accepted and you're ready to sign the Purchase Agreement.
        </div>
      </div>
      )}

      {/* ── YOUR POSITION + WHAT TO DO (Deal Room) ── */}
      {offers.length > 0 && !acceptedOffer && (
        <div style={{ background: myRole==="seller" ? "#fff9ee" : C.navy, border: myRole==="seller" ? `1px solid ${C.brass}` : "none", borderRadius:10, padding:"14px 18px", marginBottom:16, display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ fontSize:24, flexShrink:0 }}>{myRole==="seller" ? "⚓" : "🧑‍💼"}</div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, fontFamily:"sans-serif", color: myRole==="seller" ? "#7a5500" : "#fff" }}>
              You are the {myRole==="seller" ? "seller" : "buyer"}{myTurn && !agreedOffer ? " — it's your move" : ""}
            </div>
            <div style={{ fontSize:13, fontFamily:"sans-serif", color: myRole==="seller" ? C.slate : "rgba(255,255,255,0.85)", lineHeight:1.55, marginTop:2 }}>
              {agreedOffer ? "Price agreed — finish at the lock step below." :
               myTurn && latestPendingTop ? `The ${latestPendingTop.from==="buyer" ? "buyer" : "seller"} offered ${fmt(latestPendingTop.amount)}. Accept it, counter the price, or reject — all below.` :
               myOfferAwaiting ? `Your offer of ${fmt(latestPendingTop.amount)} is on the table — waiting for the ${myRole==="buyer" ? "seller" : "buyer"} to respond.` :
               "Review the latest offer below."}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT FULL TERMS — opens the builder for contingencies, dates, deposit ── */}
      {offers.length > 0 && !frozen && (
        <button onClick={()=>{ if(!showBuilder && latestPendingTop){ counterOffer(latestPendingTop.id); } else { setShowBuilder(v=>!v); } }} style={{ ...S.btnOutline, width:"100%", fontSize:13, padding:"10px 0", fontWeight:700, marginBottom:16 }}>
          {showBuilder ? "✕ Close" : (myRole==="seller" ? "⚙️ View full terms / flag a conflict" : "✏️ Counter with full terms (contingencies, dates, deposit)")}
        </button>
      )}

      {/* ── BUILD YOUR OFFER (frozen once the deal is locked) ── */}
      {acceptedOffer ? (
        <div style={{ ...S.card, marginBottom:16, borderTop:`3px solid ${C.green}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:6, background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🔒</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, fontFamily:"sans-serif", color:C.navy }}>Terms Locked</div>
              <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate }}>The Purchase Agreement is signed and binding.</div>
            </div>
          </div>
          <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, background:C.sandDark, borderRadius:6, padding:"12px 14px" }}>
            The agreed terms are frozen for both parties and can't be edited here. The only change allowed now is the <b>buyer's vessel decision during due diligence</b> — accept as-is, reject, or propose a new price (which is recorded as an <b>addendum</b> to the signed Purchase Agreement, not a change to it).
          </div>
        </div>
      ) : (myRole === "seller" && offers.length === 0 && !showBuilder) ? (
        <div style={{ ...S.card, marginBottom:16, borderTop:`3px solid ${C.navy}`, textAlign:"center" }}>
          <div style={{ fontSize:34, marginBottom:6 }}>📭</div>
          <div style={{ fontSize:17, fontWeight:800, fontFamily:"sans-serif", color:C.navy, marginBottom:6 }}>Waiting for the buyer's offer</div>
          <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7, maxWidth:460, margin:"0 auto 16px" }}>
            You're all set — there's nothing you need to build. The buyer puts together the offer (price, deposit, and terms) and sends it to you. The moment it arrives you'll be able to <b>accept it, counter the price, or flag a conflict</b> right here, and we'll email you so you don't have to keep checking.
          </div>
          <div style={{ background:C.sandDark, borderRadius:8, padding:"14px 16px", textAlign:"left", maxWidth:460, margin:"0 auto" }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:0.4, textTransform:"uppercase", color:C.navy, fontFamily:"sans-serif", marginBottom:10 }}>What happens next</div>
            {[
              ["1","The buyer sends an offer","You'll get an email and see it appear here"],
              ["2","You respond","Accept it, counter the price, or flag a conflict"],
              ["3","You both sign","Once you agree, you each sign the Purchase Agreement"],
              ["4","Due diligence & closing","Survey, documents, and the handover"],
            ].map(([n,t,d])=>(
              <div key={n} style={{ display:"flex", gap:10, marginBottom:9, alignItems:"flex-start" }}>
                <span style={{ width:20, height:20, borderRadius:"50%", background:C.brass, color:C.navy, fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"sans-serif" }}>{n}</span>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>{t}</div>
                  <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.4 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:14, lineHeight:1.55, maxWidth:460, margin:"14px auto 0" }}>
            Your asking price of <b>{fmt(Number(vessel.askingPrice)) || "—"}</b> is set as the buyer's anchor. If you want to review or pre-set the full terms a buyer can offer against, you can open them below.
          </div>
          <button onClick={()=>setShowBuilder(true)} style={{ ...S.btnOutline, fontSize:12.5, padding:"9px 18px", marginTop:12 }}>View / set full terms &amp; conflicts</button>
        </div>
      ) : (!frozen && (offers.length === 0 || showBuilder)) ? (
      <div style={{ ...S.card, marginBottom:16, borderTop:`3px solid ${C.brass}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ width:32, height:32, borderRadius:6, background:C.brass, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📝</div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, fontFamily:"sans-serif", color:C.navy }}>{offers.length>0 ? "Counter-Offer" : "Build Your Offer"}</div>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate }}>{offers.length>0 ? "Adjust the terms and send your counter — it replaces the current offer on the table." : "Assemble the full package, then send it across."}</div>
          </div>
        </div>

        {/* Offering as — fixed to your real role on this deal */}
        <div style={{ marginBottom:14 }}>
          <label style={{ ...S.label, marginBottom:5 }}>You are negotiating as</label>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:6, background: myRole==="seller"?C.brass:C.navy, color: myRole==="seller"?C.navy:"#fff", fontSize:13, fontFamily:"sans-serif", fontWeight:700 }}>
            {myRole==="seller" ? "⚓ Seller" : "🧑‍💼 Buyer"}
            <span style={{ fontWeight:400, fontSize:11, opacity:0.85 }}>
              {myRole==="seller" ? "— you can counter the buyer's offers" : "— you author the offer terms"}
            </span>
          </div>
        </div>

        {myRole==="seller" && (
          <div style={{ marginBottom:14, padding:"11px 14px", background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:6, fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
            <b style={{ color:C.navy }}>The buyer authors the offer terms.</b> You can see everything that's on the table below, and you can <b>counter the price</b> (Offer Amount). To request changes to dates, deposit, or contingencies, use <b>Flag a conflict</b> at the bottom — the buyer makes the actual edits.
          </div>
        )}

        {/* 💵 Price — always shown */}
        <div style={{ border:`1px solid ${C.mist}`, borderRadius:8, padding:"14px", marginBottom:10, background:"#fff" }}>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>💵 Price</div>
          <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, margin:"3px 0 12px", lineHeight:1.55 }}>The seller's asking price is shown for reference. Enter the amount you're actually offering below it.</div>
          <Field label="Asking Price ($) — for reference">
            <input style={S.input} type="number" value={askingPrice} onChange={e=>setAskingPrice(e.target.value)} placeholder={vessel.askingPrice||"85000"} />
          </Field>
          <Field label="Your Offer Price ($) *">
            <input style={S.input} type="number" value={offerAmt} onChange={e=>setOfferAmt(e.target.value)} placeholder="Enter your offer" />
          </Field>
        </div>

        {/* Terms below are authored by the buyer — read-only for the seller. */}
        <div style={ myRole==="seller" ? { pointerEvents:"none", opacity:0.6 } : undefined }>

        {/* 📅 Dates & Timeline — opt-in */}
        <OfferSection icon="📅" title="Dates &amp; Timeline" desc="The due-diligence window to inspect the boat and your target closing date. Leave these out for a simple, as-is cash deal you want to close fast." checked={inclDates} onToggle={()=>setInclDates(v=>!v)}>
          <label style={S.label}>Due Diligence Period</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:8 }}>
            {["7","10","14","Custom"].map(d => (
              <button key={d} onClick={()=>{ if(d==="Custom") setDdCustom(true); else { setDdDays(d); setDdCustom(false); } }} style={{ ...S.btnOutline, background:(ddDays===d&&!ddCustom)||(d==="Custom"&&ddCustom)?C.navy:"transparent", color:(ddDays===d&&!ddCustom)||(d==="Custom"&&ddCustom)?"#fff":C.navy, padding:"8px 0", textAlign:"center", fontSize:12, fontWeight:700 }}>{d==="Custom"?"Custom":`${d}d`}</button>
            ))}
          </div>
          {ddCustom && (<div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><input style={{...S.input, maxWidth:90}} type="number" min="1" max="90" value={ddDays} onChange={e=>setDdDays(e.target.value)} placeholder="21" /><span style={{ fontSize:12, color:C.slate, fontFamily:"sans-serif" }}>days</span></div>)}
          <Grid2>
            <Field label="DD Start"><input style={S.input} type="date" value={ddStart} onChange={e=>setDdStart(e.target.value)} /></Field>
            <Field label="DD End (auto)"><input style={{...S.input, background:C.sandDark, color:C.teal, fontWeight:600}} readOnly value={ddStart && ddDays ? addDays(ddStart,Number(ddDays)) : "—"} /></Field>
          </Grid2>
          <label style={{ display:"flex", gap:8, alignItems:"flex-start", cursor:"pointer", margin:"4px 0 10px" }}>
            <input type="checkbox" checked={ddExtension} onChange={e=>setDdExtension(e.target.checked)} style={{ width:14, height:14, marginTop:2, accentColor:C.teal }} />
            <span style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate }}>Allow a due-diligence extension if both parties agree</span>
          </label>
          {ddExtension && (<Grid2><Field label="Max extension days"><input style={S.input} type="number" value={ddExtDays} onChange={e=>setDdExtDays(e.target.value)} placeholder="7" /></Field><Field label="If extended, deposit:"><select style={S.select} value={ddExtDepositRule} onChange={e=>setDdExtDepositRule(e.target.value)}><option value="returnable">Stays returnable</option><option value="nonrefundable">Becomes non-refundable</option><option value="partial">50% non-refundable</option></select></Field></Grid2>)}
          <Grid2>
            <Field label="Target Closing Date"><input style={S.input} type="date" value={closingDate} min={ddStart && ddDays ? addDays(ddStart,Number(ddDays)) : today()} onChange={e=>setClosingDate(e.target.value)} /></Field>
            <Field label="Final Payment"><select style={S.select} value={paymentType} onChange={e=>setPaymentType(e.target.value)}><option value="cash">All Cash</option><option value="finance">Financed</option><option value="other">Other / TBD</option></select></Field>
          </Grid2>
          {paymentType==="finance" && (<Field label="Financing contingency (days)"><input style={{...S.input, maxWidth:140}} type="number" value={financeContingency} onChange={e=>setFinanceContingency(e.target.value)} placeholder="14" /></Field>)}
        </OfferSection>

        {/* 🛡️ Contingencies — opt-in (placed after timeline so the escrow choice sits last) */}
        <OfferSection icon="🛡️" title="Contingencies" desc="Conditions that must be met or you can walk away with your deposit back — like a passing survey or sea trial. Most serious offers include at least a survey contingency." checked={inclContingencies} onToggle={()=>setInclContingencies(v=>!v)}>
          <ContingencyPicker value={localContingencies} onChange={setLocalContingencies} paymentType={paymentType} ddEnd={ddStart && ddDays ? addDays(ddStart, Number(ddDays)) : ""} />
        </OfferSection>

        {/* 🔒 Escrow Terms — opt-in (deposit amount, terms, and where it's held all together) */}
        <OfferSection icon="🔒" title="Escrow Terms" desc="The good-faith deposit that secures the boat — how much, what happens to it if the deal falls through, and where it's held. BoatClosers never holds funds." checked={inclDepositTerms} onToggle={()=>setInclDepositTerms(v=>!v)}>
          <label style={S.label}>Deposit Amount</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:5 }}>
            {["0","5","7.5","10"].map(p => (
              <button key={p} onClick={()=>setEscrowPct(p)} style={{ ...S.btnOutline, background:escrowPct===p?C.navy:"transparent", color:escrowPct===p?"#fff":C.navy, fontSize:11, padding:"7px 0", textAlign:"center" }}>
                {p==="0"?"None":`${p}%`}
              </button>
            ))}
          </div>
          {escrowPct!=="0" && offerAmt && <div style={{ fontSize:11, color:C.teal, fontFamily:"sans-serif", marginTop:5 }}>Deposit: {fmt(Math.round(Number(offerAmt)*Number(escrowPct)/100))}</div>}
          <div style={{ height:14 }}/>
          <label style={S.label}>If the deal falls through, the earnest money is…</label>
          <select style={S.select} value={depositRule} onChange={e=>setDepositRule(e.target.value)}>
            <option value="fully_returnable">Fully returnable if buyer rejects during due diligence</option>
            <option value="returnable_cause">Returnable only for cause (survey / title / financing)</option>
            <option value="nonrefundable_after_dd">Non-refundable after Due Diligence if buyer backs out without cause</option>
            <option value="split">Split 50/50 if buyer backs out</option>
            <option value="seller_default">If seller defaults, returned plus equal penalty to buyer</option>
            <option value="custom">Custom — describe below</option>
          </select>
          {depositRule==="custom" && (<textarea style={{...S.textarea, minHeight:54, marginTop:8}} value={depositRuleCustom} onChange={e=>setDepositRuleCustom(e.target.value)} placeholder="Describe your agreed deposit terms…" />)}
          <div style={{ height:14 }}/>
          <label style={S.label}>Earnest money must be deposited within…</label>
          <select style={S.select} value={depositHours} onChange={e=>setDepositHours(e.target.value)}>
            <option value="12">12 hours of the deal locking</option>
            <option value="24">24 hours of the deal locking</option>
            <option value="36">36 hours of the deal locking</option>
          </select>
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:6, lineHeight:1.5 }}>
            After the deal locks, the buyer uploads proof of the earnest-money deposit within this window. If proof isn't provided in time the deal can expire — the seller may grant an extension or end it.
          </div>
          <div style={{ height:10 }}/>
          <Field label="Additional Contingencies (appears on the Purchase Agreement)"><textarea style={{...S.textarea, minHeight:48}} value={verbalNote} onChange={e=>setVerbalNote(e.target.value)} placeholder="e.g. Sale contingent on slip/dock transfer. Includes trailer and electronics. Closing at seller's marina." /></Field>
          <div style={{ height:16 }}/>
          <label style={S.label}>Escrow Method — where the deposit is held</label>
          <EscrowSelector value={escrowPath} onChange={setEscrowPath} depositAmt={Math.round(Number(offerAmt||0)*Number(escrowPct)/100)} />
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:6, lineHeight:1.5 }}>Choose this last — selecting Escrow.com may open their site in a new tab. Everything above is already saved, so you can set it up there and come back, then send your offer.</div>
        </OfferSection>
        </div>

        {/* Submit */}
        <button style={{...S.btnBrass, width:"100%", marginTop:6, fontSize:15, padding:"12px", opacity:(!offerAmt||myOfferAwaiting)?0.5:1}} onClick={makeOffer} disabled={!offerAmt||myOfferAwaiting}>
          {(offers.length===0 && myRole!=="seller") ? "Send Offer to Seller" : (myRole==="seller" ? "Send Counter-Offer to Buyer" : "Send Counter-Offer to Seller")} →
        </button>
        {myOfferAwaiting ? (
          <div style={{ textAlign:"center", fontSize:11, color:C.slate, fontFamily:"sans-serif", marginTop:8, lineHeight:1.5 }}>
            ⏳ Your offer is on the table — waiting for the {myRole==="buyer" ? "seller" : "buyer"} to respond. You'll be able to send a new offer if they counter or reject.
          </div>
        ) : (
          <div style={{ textAlign:"center", fontSize:10.5, color:C.slate, fontFamily:"sans-serif", marginTop:8, lineHeight:1.5 }}>
            Free to send and negotiate. You only pay $249 when a full offer is accepted and you're ready to sign.
          </div>
        )}

        {/* SELLER-ONLY: flag a conflict on dates/deposit terms (emails the buyer) */}
        {myRole==="seller" && (
          <div style={{ marginTop:14, border:`1px solid ${C.mist}`, borderRadius:8, padding:"12px 14px" }}>
            {!conflictOpen && !conflictSent && (
              <button onClick={()=>setConflictOpen(true)} style={{ ...S.btnOutline, width:"100%", fontSize:13, padding:"9px 0", fontWeight:700 }}>
                ⚠️ Flag a conflict with the buyer's terms
              </button>
            )}
            {conflictOpen && !conflictSent && (
              <div>
                <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:4 }}>Ask the buyer to adjust their terms</div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginBottom:10, lineHeight:1.5 }}>
                  You can't edit the buyer's offer, but you can email them to flag a conflict on the schedule or deposit terms and ask them to adjust so the deal can move forward.
                </div>
                <label style={{ ...S.label, marginBottom:5 }}>What's the conflict about?</label>
                <select style={{ ...S.input, marginBottom:10 }} value={conflictTopic} onChange={e=>setConflictTopic(e.target.value)}>
                  <option value="dates">Schedule / Dates</option>
                  <option value="deposit">Deposit Terms</option>
                  <option value="contingencies">Contingencies</option>
                </select>
                <textarea style={{ ...S.textarea, minHeight:70 }} value={conflictMsg} onChange={e=>setConflictMsg(e.target.value)} placeholder="e.g. The 10-day closing won't work on my end — I'd need at least 21 days. Can you adjust?" />
                {conflictErr && <div style={{ fontSize:11, color:"#dc2626", fontFamily:"sans-serif", marginTop:6 }}>{conflictErr}</div>}
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <button onClick={sendConflict} disabled={conflictSending} style={{ ...S.btnBrass, flex:1, fontSize:13, padding:"9px 0", opacity:conflictSending?0.6:1 }}>
                    {conflictSending ? "Sending…" : "Email the buyer"}
                  </button>
                  <button onClick={()=>{ setConflictOpen(false); setConflictErr(""); }} style={{ ...S.btnOutline, fontSize:13, padding:"9px 16px" }}>Cancel</button>
                </div>
              </div>
            )}
            {conflictSent && (
              <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:"#166534", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:6, padding:"10px 12px" }}>
                ✓ Your conflict note was emailed to the buyer. They can adjust their terms and re-send the offer.
              </div>
            )}
          </div>
        )}
      </div>
      ) : null}

      {/* ── NEGOTIATION LADDER ── */}
      {offers.length > 0 && (() => {
        const latestPending = [...offers].reverse().find(o => o.status==="pending");
        const lastBuyer = [...offers].reverse().find(o => o.from==="buyer");
        const lastSeller = [...offers].reverse().find(o => o.from==="seller");
        const gap = (lastBuyer && lastSeller) ? Math.abs(lastSeller.amount - lastBuyer.amount) : null;
        return (
          <div style={{...S.card, marginBottom:16}}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <h3 style={{...S.h3, margin:0}}>Negotiation</h3>
              {gap !== null && gap > 0 && (
                <span style={{ fontSize:12, fontFamily:"sans-serif", fontWeight:700, color:C.brass, background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:20, padding:"3px 12px" }}>
                  {fmt(gap)} apart
                </span>
              )}
              {gap === 0 && (
                <span style={{ fontSize:12, fontFamily:"sans-serif", fontWeight:700, color:C.green, background:C.greenLight, borderRadius:20, padding:"3px 12px" }}>
                  Both sides aligned ✓
                </span>
              )}
            </div>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:14 }}>Read top to bottom — buyer on the left, seller on the right.</div>

            {offers.map((o,i) => {
              const isBuyer = o.from==="buyer";
              const prev = i>0 ? offers[i-1] : null;
              const delta = prev ? o.amount - prev.amount : 0;
              const isLatestPending = latestPending && o.id===latestPending.id;
              const partyName = isBuyer ? (parties.buyer?.name||"Buyer") : (parties.seller?.name||"Seller");
              const accent = isBuyer ? C.navy : C.brass;
              return (
                <div key={o.id} style={{ display:"flex", justifyContent:isBuyer?"flex-start":"flex-end", marginBottom:10 }}>
                  <div style={{
                    width:"82%",
                    background: isLatestPending ? (isBuyer?"#f4f7fc":"#fff9ee") : (o.status==="accepted"?C.greenLight:o.status==="rejected"?C.redLight:C.white),
                    border:`1px solid ${isLatestPending?accent:C.mist}`,
                    borderLeft:`4px solid ${accent}`,
                    borderRadius:8, padding:"12px 14px",
                    opacity: o.status==="countered" ? 0.62 : 1,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10 }}>
                      <div style={{ fontSize:11, fontFamily:"sans-serif", fontWeight:700, color:accent, textTransform:"uppercase", letterSpacing:0.5 }}>
                        {isBuyer?"🧑‍💼":"⚓"} {partyName}
                      </div>
                      <div style={{ fontSize:10, fontFamily:"sans-serif", color:C.slate }}>{o.time}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:9, marginTop:3 }}>
                      <span style={{ fontSize:20, fontWeight:800, color:C.navy, fontFamily:"sans-serif" }}>{fmt(o.amount)}</span>
                      {delta !== 0 && (
                        <span style={{ fontSize:11, fontFamily:"sans-serif", fontWeight:700, color: delta>0?C.green:C.red }}>
                          {delta>0?"▲":"▼"} {fmt(Math.abs(delta))}
                        </span>
                      )}
                      {o.verbal && <span style={{...S.pill, background:C.tealLight, color:C.teal}}>Verbal</span>}
                    </div>
                    <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:4, lineHeight:1.5 }}>
                      Deposit: {o.escrowPct}% ({fmt(o.deposit)}) · {escLabel(o.escrowPath)}
                      {o.inclContingencies && o.contingencies?.length ? ` · Contingent on ${contingencyNames(o.contingencies)}` : " · no contingencies"}
                      {o.inclDates ? ` · Due Diligence ${o.ddDays} days · Close ${o.closingDate||"TBD"}` : " · dates open"}
                    </div>

                    {/* status / actions */}
                    <div style={{ marginTop:9 }}>
                      {o.status==="accepted" && <span style={{...S.pill, background:C.green, color:"#fff"}}>Accepted ✓ — Purchase Agreement signed</span>}
                      {o.status==="agreed" && <span style={{...S.pill, background:"#166534", color:"#fff"}}>Price agreed ✓ — awaiting lock</span>}
                      {o.status==="rejected" && <span style={{...S.pill, background:C.red, color:"#fff"}}>Rejected</span>}
                      {o.status==="countered" && <span style={{...S.pill, background:C.mist, color:C.slate}}>Countered — see newer offer below</span>}
                      {isLatestPending && !frozen && (
                        o.from === myRole ? (
                          <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, fontStyle:"italic", background:C.sandDark, borderRadius:6, padding:"8px 12px" }}>
                            ⏳ Sent — waiting for the {myRole==="buyer" ? "seller" : "buyer"} to accept, counter, or reject. You can't respond to your own offer.
                          </div>
                        ) : (
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                            <button style={{...S.btn, background:C.green, fontSize:12, padding:"8px 16px"}} onClick={()=>acceptOffer(o.id)}>Accept {fmt(o.amount)} &amp; Sign</button>
                            <div style={{ display:"flex", alignItems:"center", gap:6, background:C.sandDark, borderRadius:6, padding:"5px 8px" }}>
                              <span style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, whiteSpace:"nowrap" }}>Counter&nbsp;$</span>
                              <input style={{...S.input, width:104, padding:"6px 8px", fontSize:13}} type="number" value={quickAmt} onChange={e=>setQuickAmt(e.target.value)} placeholder={String(o.amount)} />
                              <button style={{...S.btn, background:C.navy, fontSize:12, padding:"8px 12px"}} onClick={()=>sendQuickCounter(o)}>Send →</button>
                            </div>
                            <button style={{...S.btnOutline, fontSize:12, padding:"8px 14px", color:C.red, borderColor:C.red}} onClick={()=>rejectOffer(o.id)}>Reject</button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ââ MESSAGES (collapsible) ââ */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <button onClick={()=>setShowMessages(true)} style={{ display:"flex", width:"100%", justifyContent:"space-between", alignItems:"center", background:"transparent", border:"none", cursor:"pointer", padding:0 }}>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>💬 Messages {messages.length>0 && <span style={{ fontSize:11, fontWeight:400, color:C.slate }}>({messages.length})</span>}</div>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:2 }}>Your private thread with the other party — ask questions, clarify terms, and keep everything about this deal in one place. Every offer, counter, and note lands here too, and both sides see it in real time.</div>
          </div>
          <span style={{ fontSize:13, color:C.slate }}>{showMessages?"▲":"▼"}</span>
        </button>
        {showMessages && (
          <div style={{ marginTop:12 }}>
            <div style={{ height:200, overflowY:"auto", display:"flex", flexDirection:"column", border:`1px solid ${C.mist}`, borderRadius:5, padding:"8px", marginBottom:8 }}>
              {messages.length===0 && <div style={{ fontSize:12, color:C.slate, fontFamily:"sans-serif", textAlign:"center", margin:"auto" }}>No messages yet. Say hello or ask a question to get started — your offers and counters will show up here too, so the whole conversation stays in one place.</div>}
              {messages.map((m,i) => {
                const mine = m.from === myRole;
                return (
                <div key={i} style={{ alignSelf:mine?"flex-end":"flex-start", maxWidth:"88%", background:mine?C.navy:C.sandDark, color:mine?"#fff":C.text, borderRadius:mine?"12px 12px 2px 12px":"12px 12px 12px 2px", padding:"8px 12px", fontSize:12, fontFamily:"sans-serif", lineHeight:1.5, marginBottom:5 }}>
                  <div style={{ fontSize:10, color:mine?"rgba(255,255,255,0.5)":C.slate, marginBottom:2 }}>{m.from==="buyer"?(parties.buyer?.name||"Buyer"):(parties.seller?.name||"Seller")} · {m.time}</div>
                  {m.text}
                </div>
                );
              })}
              <div ref={messagesEnd}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input style={{...S.input, flex:1, fontSize:12}} value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type a message…" onKeyDown={e=>e.key==="Enter"&&sendMsg()} />
              <button style={S.btn} onClick={sendMsg}>Send</button>
            </div>
          </div>
        )}
      </div>

      {/* ── AGREED PRICE SUMMARY if offer accepted ── */}
      {acceptedOffer && (
        <div style={{...S.cardGold, marginBottom:16}}>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>✓ Agreed Price Summary</div>
          <div className="bc-grid3" style={{ gap:10 }}>
            {[["Purchase Price",fmt(acceptedOffer.amount)],["Earnest Money",fmt(acceptedOffer.deposit)],["Escrow",escLabel(acceptedOffer.escrowPath)]].map(([l,v])=>(
              <div key={l} style={{ background:C.sandDark, borderRadius:5, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:C.slate, fontFamily:"sans-serif" }}>{l}</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mirrored Price-Agreed box at the BOTTOM, so a user who reads down the
          page lands on the sign / pay action without scrolling back up. */}
      {agreedBanner}

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={{...S.btnBrass, opacity:canProceed?1:0.5}} disabled={!canProceed} onClick={proceed}>
          {canProceed ? "Continue to Due Diligence →" : "🔒 Finalize the deal to continue"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — DUE DILIGENCE
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ESCROW SELECTOR — reusable expanded card picker
// ─────────────────────────────────────────────────────────────────────────────
function EscrowSelector({ value, onChange, depositAmt }) {
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);
  const options = [
    {
      id:"escrow_com",
      icon:"🏦",
      label:"Escrow.com",
      badge:"Recommended",
      badgeColor:C.green,
      desc:"Licensed third-party escrow. Funds held securely until both parties confirm the deal is complete.",
      detail:"Escrow.com is a licensed, regulated escrow service. Neither buyer nor seller can access funds until conditions are met. BoatClosers has no affiliation with Escrow.com and earns nothing from their fees.",
    },
    {
      id:"direct",
      icon:"💵",
      label:"Direct to Seller",
      badge:"Simple",
      badgeColor:C.slate,
      desc:"Buyer sends deposit directly to seller by wire or check. Faster but no neutral third-party protection.",
      detail:"Deposit return in the event of deal failure is entirely between buyer and seller. BoatClosers documents (Deposit Receipt, Rejection Notice) support your claim but we do not hold or release funds.",
    },
    {
      id:"attorney",
      icon:"⚖️",
      label:"Third Party Attorney",
      badge:"Professional",
      badgeColor:C.teal,
      desc:"A licensed attorney or title company holds the deposit. Common for larger or complex transactions.",
      detail:"Both parties agree on an attorney or title company to act as escrow agent. Their fees and terms are outside BoatClosers. Our documents support the transaction but we are not involved in fund handling.",
    },
    {
      id:"brokerage",
      icon:"🛥️",
      label:"Licensed Broker",
      badge:"Brokerage",
      badgeColor:C.navy,
      desc:"A state-licensed yacht/boat brokerage holds the deposit in their trust/escrow account.",
      detail:"If the boat is listed with a broker — or you're using a buyer's broker — a state-licensed brokerage can hold the deposit in their trust/escrow account per state law. Confirm the broker's license and get the escrow terms in writing. Any commission and terms are between you and the broker; BoatClosers is not involved in fund handling.",
    },
    {
      id:"custom",
      icon:"✍️",
      label:"Custom / Other",
      badge:"Your Terms",
      badgeColor:C.slate,
      desc:"You've agreed on another holder or method — describe it in your terms.",
      detail:"Use this if you've agreed on a holder or method not listed (a bank, a mutual escrow agent, or another arrangement). Describe the specifics in Additional Contingencies above so both parties and the Purchase Agreement reflect it. BoatClosers does not hold or release funds.",
    },
  ];
  const selected = options.find(o=>o.id===value)||options[0];

  return (
    <div>
      <div className="bc-grid3" style={{ gap:8, marginBottom:8 }}>
        {options.map(opt=>(
          <button key={opt.id} onClick={()=>onChange(opt.id)} style={{ padding:"10px 8px", borderRadius:6, cursor:"pointer", border:`2px solid ${value===opt.id?opt.badgeColor:C.mist}`, background:value===opt.id?opt.badgeColor==="rgb(26,92,53)"||opt.id==="escrow_com"?"rgba(26,92,53,0.08)":opt.id==="attorney"?"rgba(14,107,124,0.08)":"rgba(61,81,102,0.06)":"transparent", textAlign:"center", fontFamily:"sans-serif", transition:"all 0.15s" }}>
            <div style={{ fontSize:18, marginBottom:4 }}>{opt.icon}</div>
            <div style={{ fontSize:12, fontWeight:700, color:value===opt.id?opt.badgeColor:C.navy }}>{opt.label}</div>
            <div style={{ fontSize:9, color:value===opt.id?opt.badgeColor:C.slate, marginTop:2, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{opt.badge}</div>
          </button>
        ))}
      </div>

      {/* Selected option detail card */}
      <div style={{ background: value==="escrow_com"?C.greenLight:value==="attorney"?C.tealLight:C.sandDark, border:`1px solid ${value==="escrow_com"?"#a8d8b8":value==="attorney"?C.teal:C.mist}`, borderRadius:6, padding:"12px 14px" }}>
        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.text, lineHeight:1.7, marginBottom:8 }}>{selected.detail}</div>

        {value==="escrow_com" && (
          <div style={{ marginTop:8 }}>
            <div style={{ background:"rgba(26,92,53,0.1)", border:`1px solid #a8d8b8`, borderRadius:5, padding:"8px 12px", fontSize:11, fontFamily:"sans-serif", color:C.green, marginBottom:10, lineHeight:1.6 }}>
              <strong>BoatClosers Disclaimer:</strong> BoatClosers.com has no affiliation with Escrow.com, earns no referral fee, and is not responsible for Escrow.com's services, fees, or outcomes. Deposit return is solely between buyer, seller, and Escrow.com per their agreement.
            </div>
            <a href="https://www.escrow.com" target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.green, color:"#fff", borderRadius:5, padding:"8px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, textDecoration:"none" }}>
              🏦 Open Escrow.com →
            </a>
            <div style={{ fontSize:10, fontFamily:"sans-serif", color:C.slate, marginTop:6 }}>Opens in a new tab. Set up your escrow transaction directly with Escrow.com.</div>
          </div>
        )}

        {value==="direct" && (
          <div style={{ background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:5, padding:"8px 12px", fontSize:11, fontFamily:"sans-serif", color:"#7a5500", lineHeight:1.6 }}>
            <strong>Note:</strong> BoatClosers provides the Deposit Receipt and Rejection Notice documents to support direct deposit agreements, but we do not hold, verify, or release any funds. Deposit return in the event of deal failure is entirely at the discretion of the parties.
          </div>
        )}

        {value==="attorney" && (
          <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:5, padding:"8px 12px", fontSize:11, fontFamily:"sans-serif", color:C.teal, lineHeight:1.6 }}>
            Both parties should agree on the attorney or title company in writing before transferring any funds. BoatClosers documents (Escrow Instructions, Closing Statement) can be shared with the attorney to support their work.
          </div>
        )}

        {value==="brokerage" && (
          <div style={{ background:"#eef2f7", border:`1px solid ${C.navy}`, borderRadius:5, padding:"8px 12px", fontSize:11, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6 }}>
            Confirm the brokerage is licensed in the boat's state and get the escrow terms in writing before sending funds. The broker holds the deposit in their trust account; BoatClosers does not hold, verify, or release funds.
          </div>
        )}

        {value==="custom" && (
          <div style={{ background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:5, padding:"8px 12px", fontSize:11, fontFamily:"sans-serif", color:"#7a5500", lineHeight:1.6 }}>
            Spell out who holds the deposit and the exact terms in <strong>Additional Contingencies</strong> above so it appears on the Purchase Agreement. BoatClosers does not hold, verify, or release funds.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EARNEST MONEY RECEIPT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function EarnestReceiptModal({ open, onClose, vessel, parties, negotiate }) {
  const [sentTo, setSentTo] = useState("");
  const [sent, setSent] = useState(false);
  if (!open) return null;
  const amt = fmt(negotiate.deposit||0);
  const price = fmt(negotiate.agreedPrice||0);
  const escrowLabel = escLabel(negotiate.escrowPath);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:10, width:"100%", maxWidth:560, border:`2px solid ${C.brass}`, overflow:"hidden" }}>
        <div style={{ background:C.navy, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:C.brass, fontFamily:"sans-serif", textTransform:"uppercase" }}>BoatClosers.com</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>Earnest Money Deposit Receipt</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", borderRadius:5, width:28, height:28, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"1.5rem" }}>
          {/* Receipt document */}
          <div style={{ background:C.sandDark, borderRadius:6, padding:"16px 18px", fontSize:12, fontFamily:"sans-serif", lineHeight:2, color:C.text, marginBottom:16 }}>
            <div style={{ textAlign:"center", borderBottom:`1px solid ${C.mist}`, paddingBottom:10, marginBottom:12 }}>
              <div style={{ fontSize:14, fontWeight:800, letterSpacing:1 }}>DEPOSIT RECEIPT</div>
              <div style={{ fontSize:10, color:C.slate }}>Date: {today()}</div>
            </div>
            <div><strong>Received from (Buyer):</strong> {parties.buyer.name||"[Buyer]"}</div>
            <div><strong>Received by (Seller):</strong> {parties.seller.name||"[Seller]"}</div>
            <div><strong>Vessel:</strong> {vessel.year||""} {vessel.make||""} {vessel.model||""} · HIN: {vessel.hin||"[HIN]"}</div>
            <div><strong>Purchase Price:</strong> {price}</div>
            <div style={{ background:"#fff", border:`1px solid ${C.brass}`, borderRadius:4, padding:"8px 12px", margin:"8px 0" }}>
              <strong style={{ fontSize:14 }}>Earnest Money Amount: {amt}</strong>
            </div>
            <div><strong>Escrow Method:</strong> {escrowLabel}</div>
            <div style={{ fontSize:10, color:C.slate, marginTop:8, lineHeight:1.6 }}>
              This receipt confirms that earnest money in the amount stated above has been tendered by the Buyer as a deposit toward the purchase of the vessel described. Deposit return or forfeiture is governed by the terms of the Purchase and Sale Agreement executed between the parties. BoatClosers.com is not a party to this transaction, does not hold these funds, and is not responsible for deposit return or disbursement.
            </div>
          </div>

          {/* Send section */}
          {!sent ? (
            <div>
              <label style={S.label}>Send receipt to (email)</label>
              <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                {[parties.buyer.email, parties.seller.email].filter(Boolean).map(e=>(
                  <button key={e} onClick={()=>setSentTo(e)} style={{ fontSize:11, fontFamily:"sans-serif", padding:"4px 10px", borderRadius:16, border:`1px solid ${C.brass}`, background:sentTo===e?C.brass:"transparent", color:sentTo===e?C.navy:C.brass, cursor:"pointer" }}>{e}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{...S.input, flex:1}} type="email" placeholder="Or type any email…" value={sentTo} onChange={e=>setSentTo(e.target.value)} />
                <button style={S.btnBrass} disabled={!sentTo.trim()} onClick={()=>setSent(true)}>Send Receipt →</button>
              </div>
            </div>
          ) : (
            <div style={{ background:C.greenLight, border:`1px solid #a8d8b8`, borderRadius:5, padding:"10px 14px", fontSize:12, fontFamily:"sans-serif", color:C.green }}>
              ✓ Receipt sent to {sentTo} · {today()}
              <button onClick={()=>setSent(false)} style={{ marginLeft:12, fontSize:11, background:"none", border:`1px solid #a8d8b8`, borderRadius:4, padding:"2px 8px", cursor:"pointer", color:C.green }}>Send to another</button>
            </div>
          )}
          <div style={{ textAlign:"right", marginTop:14 }}>
            <button style={S.btnOutline} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Seller's side of due diligence — preparing the vessel and paperwork for the
// buyer's survey and sea trial. Items flagged `warn` are safety-critical.
const SELLER_PREP = [
  { section: "Paperwork to have ready", items: [
    { key:"docs_title",     label:"Title, state registration, and USCG documentation (if applicable)" },
    { key:"docs_ownership", label:"Proof of ownership / prior bill of sale" },
    { key:"docs_records",   label:"Maintenance & service records and engine-hour log" },
    { key:"docs_manuals",   label:"Owner's manuals for engines, electronics, and onboard systems" },
    { key:"docs_lien",      label:"Lien payoff or loan details, if there's a lien on the vessel" },
  ]},
  { section: "Make the vessel available", items: [
    { key:"avail_schedule", label:"Confirm a date, time, and location for the survey and sea trial" },
    { key:"avail_access",   label:"Clear access to the engine room, bilges, lockers, and all compartments" },
    { key:"avail_power",    label:"Shore power connected / batteries charged so every system can be tested" },
    { key:"avail_fuel",     label:"Enough fuel aboard for the sea trial" },
  ]},
  { section: "Safety & readiness — please read", warn:true, items: [
    { key:"safe_coldstart",  label:"Do NOT start the engines before the surveyor arrives — they need to inspect a cold start", warn:true },
    { key:"safe_engineroom", label:"Engine room accessible and ready to run up to operating temperature during the trial" },
    { key:"safe_gear",       label:"Required safety gear aboard for the sea trial — PFDs, fire extinguishers, flares, horn (a captain or surveyor may refuse to run without it)", warn:true },
    { key:"safe_seaworthy",  label:"Vessel is in safe operating condition — through-hulls/seacocks work, steering and nav are functional" },
    { key:"safe_haulout",    label:"A haul-out (hull-out) is NOT required to move forward — but be ready to arrange one if the buyer's surveyor requests a bottom inspection" },
  ]},
];

// Shared rejection notice + deposit-refund walkthrough. Shown to the seller in
// due diligence, and to both parties at closing, from the synced negotiate data.
function RejectionNotice({ rejection, escrowPath, viewerRole, vessel }) {
  if (!rejection) return null;
  const reasons = (rejection.reasons||[]).map(id => REJECTION_REASONS.find(r=>r.id===id)).filter(Boolean);
  const pathLabel = escrowPath==="escrow_com" ? "Escrow.com" : escrowPath==="attorney" ? "a closing attorney's trust account" : "a direct party-to-party deposit";
  const refundSteps = escrowPath==="escrow_com"
    ? ["Open your Escrow.com transaction for this deal.", "Either party requests cancellation; Escrow.com returns the buyer's deposit through their standard cancellation process.", "Make sure both parties receive Escrow.com's written cancellation confirmation."]
    : escrowPath==="attorney"
    ? ["Contact the closing attorney holding the deposit in trust.", "Both parties instruct the attorney in writing to return the deposit to the buyer.", "Keep the attorney's written confirmation of the return for your records."]
    : ["Whoever is holding the deposit returns it directly to the buyer, by the same method it was paid.", "Both parties confirm the return in writing (a simple email is fine).", "Keep that written confirmation for your records."];
  return (
    <div style={{ border:`1px solid ${C.red}`, borderRadius:8, overflow:"hidden", marginTop:4 }}>
      <div style={{ background:C.red, color:"#fff", padding:"10px 14px", fontSize:12, fontWeight:700, fontFamily:"sans-serif", letterSpacing:0.5 }}>VESSEL REJECTION NOTICE — DEAL ENDED</div>
      <div style={{ background:"#fff", padding:"14px 16px", fontFamily:"sans-serif" }}>
        <div style={{ fontSize:12, color:C.text, lineHeight:1.7 }}>The buyer has formally rejected <b>{vessel?.year} {vessel?.make} {vessel?.model}</b> after due diligence. This ends the deal.</div>
        <div style={{ marginTop:10, fontSize:11, fontWeight:700, color:C.navy, textTransform:"uppercase", letterSpacing:0.4 }}>Reasons</div>
        <ul style={{ margin:"4px 0 0", paddingLeft:18, fontSize:12, color:C.text, lineHeight:1.6 }}>
          {reasons.map(r => <li key={r.id}>{r.label}</li>)}
        </ul>
        {rejection.notes && <div style={{ marginTop:8, fontSize:12, color:C.slate }}><b>Notes:</b> {rejection.notes}</div>}
        {rejection.solution && (
          <div style={{ marginTop:10, background:"#eef4fb", border:`1px solid ${C.navy}`, borderRadius:6, padding:"9px 12px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.navy }}>Buyer's proposed path forward</div>
            <div style={{ fontSize:12, color:C.text, marginTop:3, lineHeight:1.6 }}>{rejection.solution}</div>
            {viewerRole==="seller" && <div style={{ fontSize:10.5, color:C.slate, marginTop:5 }}>If you want to pursue this, contact the buyer directly — this deal is closed, so you'd start a new one.</div>}
          </div>
        )}
        <div style={{ fontSize:11, color:C.slate, marginTop:10 }}>Signed: <b>{rejection.sig}</b> · {rejection.date}</div>
        <div style={{ marginTop:14, background:C.sandDark, borderRadius:6, padding:"12px 14px" }}>
          <div style={{ fontSize:11, fontWeight:800, color:C.navy, textTransform:"uppercase", letterSpacing:0.4, marginBottom:6 }}>Returning the earnest-money deposit</div>
          <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, marginBottom:8 }}>This deal used <b>{pathLabel}</b>. BoatClosers never holds or moves money — the deposit is returned outside the app. Steps:</div>
          <ol style={{ margin:0, paddingLeft:18, fontSize:11.5, color:C.text, lineHeight:1.7 }}>
            {refundSteps.map((s,i)=><li key={i}>{s}</li>)}
          </ol>
          <div style={{ fontSize:10.5, color:C.slate, marginTop:8, fontStyle:"italic" }}>Trouble getting a deposit returned? Reply to your BoatClosers notification email and we'll help you work it out.</div>
        </div>
      </div>
    </div>
  );
}

function StepDueDiligence({ data, setData, setNegotiate, vessel, parties, terms, negotiate, myRole, onNext, onBack }) {
  const set = (k,v) => setData(d => ({...d,[k]:v}));
  const isBuyer = myRole !== "seller";
  // ── Earnest-money deposit timeline: set at lock, buyer proves, seller may extend ──
  const [proofRef, setProofRef] = useState("");
  const [proofNote, setProofNote] = useState("");
  const dep = negotiate || {};
  const depHasProof = !!(dep.depositProof && dep.depositProof.ref);
  const depDeadline = Number(dep.depositDeadline) || 0;
  const depEnded = !!dep.depositEnded;
  const submitProof = () => { if (proofRef.trim() && setNegotiate) setNegotiate(n => ({ ...n, depositProof: { ref: proofRef.trim(), note: proofNote.trim(), at: Date.now(), by: "buyer" } })); };
  const extendDeposit = (h) => { if (setNegotiate) setNegotiate(n => ({ ...n, depositDeadline: Date.now() + h*3600*1000, depositEnded: false })); };
  const endDealForDeposit = () => { if (setNegotiate) setNegotiate(n => ({ ...n, depositEnded: true })); };
  // Seller readiness checklist (each party only sees/edits their own DD).
  const sellerPrep = data.sellerPrep || {};
  const toggleSellerPrep = (key) => setData(d => ({ ...d, sellerPrep: { ...(d.sellerPrep||{}), [key]: !(d.sellerPrep||{})[key] } }));
  // Buyer-only DD price-reopen: propose a new final price after inspection.
  const [newPrice, setNewPrice] = useState(data.proposedNewPrice || "");
  const [newPriceReason, setNewPriceReason] = useState(data.proposedNewPriceReason || "");
  const [outcome, setOutcome] = useState(data.outcome||null);
  const [rejectionReasons, setRejectionReasons] = useState(data.rejectionReasons || (data.rejectionReason ? [data.rejectionReason] : []));
  const [rejectionNotes, setRejectionNotes] = useState(data.rejectionNotes||"");
  const [rejSolution, setRejSolution] = useState(data.rejSolution||"");
  const [rejSigName, setRejSigName] = useState(data.rejSigName||"");
  const toggleRejReason = (id) => setRejectionReasons(rs => rs.includes(id) ? rs.filter(x=>x!==id) : [...rs, id]);
  const [buyerDisc, setBuyerDisc] = useState(false);
  const [buyerSigned, setBuyerSigned] = useState(false);
  const [vaSigName, setVaSigName] = useState(negotiate?.vesselAcceptance?.sig || "");
  const [vaSigned, setVaSigned] = useState(!!negotiate?.vesselAcceptance);
  const [showReceipt, setShowReceipt] = useState(false);

  // Survey upload state
  const [surveyFile, setSurveyFile] = useState(null);
  const [surveyCompany, setSurveyCompany] = useState("");
  const [surveyorName, setSurveyorName] = useState("");
  const [surveyDate, setSurveyDate] = useState("");
  const [surveyNotes, setSurveyNotes] = useState("");
  const [surveySendEmail, setSurveySendEmail] = useState("");
  const [surveySentLog, setSurveySentLog] = useState([]);
  const [surveyOpen, setSurveyOpen] = useState(false);

  // Title search state
  const [titleFile, setTitleFile] = useState(null);
  const [titleSearchCo, setTitleSearchCo] = useState("");
  const [titleClear, setTitleClear] = useState(null);
  const [titleNotes, setTitleNotes] = useState("");
  const [titleOpen, setTitleOpen] = useState(false);

  // Sea trial state
  const [seaTrialOpen, setSeaTrialOpen] = useState(false);
  const [seaTrialDate, setSeaTrialDate] = useState("");
  const [seaTrialNotes, setSeaTrialNotes] = useState("");
  const [seaTrialPass, setSeaTrialPass] = useState(null);

  // Engine tests (buyer): oil analysis + compression test
  const [engineTestsOpen, setEngineTestsOpen] = useState(false);
  const [oilLab, setOilLab] = useState(data.oilLab||"");
  const [oilDate, setOilDate] = useState(data.oilDate||"");
  const [oilResult, setOilResult] = useState(data.oilResult||"");
  const [oilNotes, setOilNotes] = useState(data.oilNotes||"");
  const [oilFile, setOilFile] = useState(null);
  const [compDate, setCompDate] = useState(data.compDate||"");
  const [compResult, setCompResult] = useState(data.compResult||"");
  const [compNotes, setCompNotes] = useState(data.compNotes||"");
  const [compFile, setCompFile] = useState(null);

  // Sea trial performance numbers
  const [stWotSpeed, setStWotSpeed] = useState(data.stWotSpeed||"");
  const [stWotRpm, setStWotRpm] = useState(data.stWotRpm||"");
  const [stCruiseSpeed, setStCruiseSpeed] = useState(data.stCruiseSpeed||"");
  const [stCruiseRpm, setStCruiseRpm] = useState(data.stCruiseRpm||"");
  const [stFuel, setStFuel] = useState(data.stFuel||"");
  const [stTemp, setStTemp] = useState(data.stTemp||"");
  const [stSeaState, setStSeaState] = useState(data.stSeaState||"");

  // Insurance state
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insurancePolicyNum, setInsurancePolicyNum] = useState("");
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [insuranceSendEmail, setInsuranceSendEmail] = useState("");
  const [insuranceSentLog, setInsuranceSentLog] = useState([]);

  const canProceed = !isBuyer
    ? true
    : outcome==="accept"
    ? (buyerDisc && buyerSigned && vaSigned)
    : outcome==="reject"
      ? (buyerDisc && buyerSigned && rejectionReasons.length>0 && rejSigName.trim())
    : outcome==="propose_price"
      ? !!newPrice
    : false;

  const ddEnd = terms.ddStartDate && terms.dueDiligenceDays ? addDays(terms.ddStartDate, Number(terms.dueDiligenceDays)) : null;
  const daysLeft = ddEnd ? Math.max(0, Math.ceil((new Date(ddEnd) - new Date()) / 86400000)) : null;

  const SectionHeader = ({icon, title, subtitle, open, onToggle, done}) => (
    <div onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"12px 0", borderBottom:`1px solid ${C.mist}`, userSelect:"none" }}>
      <div style={{ width:32, height:32, borderRadius:6, background:done?C.greenLight:C.sandDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
        {done ? "✓" : icon}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:done?C.green:C.navy }}>{title}</div>
        {subtitle && <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate }}>{subtitle}</div>}
      </div>
      <div style={{ fontSize:12, color:C.slate }}>{open ? "▲" : "▼"}</div>
    </div>
  );

  return (
    <div style={S.page}>
      <EarnestReceiptModal open={showReceipt} onClose={()=>setShowReceipt(false)} vessel={vessel} parties={parties} negotiate={negotiate} />
      <TipBox tips={TIPS.diligence}/>
      <DealAssistant step="diligence" role={myRole} vessel={vessel} />
      {negotiate.vesselRejection && (
        <div style={{ background:C.redLight, border:`1px solid ${C.red}`, borderRadius:8, padding:"13px 16px", marginBottom:16 }}>
          <div style={{ fontSize:13.5, fontWeight:800, fontFamily:"sans-serif", color:C.red, marginBottom:3 }}>🚫 This deal has ended</div>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>The buyer rejected the vessel after due diligence. The full notice and the deposit-return steps are below{myRole==="seller" ? "" : " and on the closing page"}. No further action moves this deal forward.</div>
        </div>
      )}
<VesselLookup />
      {depDeadline > 0 && (() => {
        const msLeft = depDeadline - Date.now();
        const expired = !depHasProof && msLeft <= 0;
        const hoursLeft = Math.max(0, Math.floor(msLeft/3600000));
        const minsLeft = Math.max(0, Math.floor((msLeft%3600000)/60000));
        return (
          <div style={{ ...S.card, borderTop:`3px solid ${(depEnded || expired) ? C.red : depHasProof ? C.green : C.brass}`, marginBottom:16 }}>
            <h3 style={S.h3}>Earnest Money Deposit</h3>
            {depEnded ? (
              <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.red, fontWeight:700, lineHeight:1.5 }}>✗ Deal void — the deposit window passed without proof. The agreement, including the signed Purchase Agreement, is no longer binding.</div>
            ) : depHasProof ? (
              <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.green, fontWeight:700 }}>✓ Deposit proof submitted — ref {dep.depositProof.ref}{dep.depositProof.note ? ` · ${dep.depositProof.note}` : ""}</div>
            ) : expired ? (
              <>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.red, fontWeight:700, marginBottom:8, lineHeight:1.5 }}>⏰ Deposit window expired — no proof submitted. Without earnest money this deal can be declared <b>null and void, including the signed Purchase Agreement</b>, leaving the seller free to accept other offers.</div>
                {isBuyer ? (
                  <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate }}>The seller can grant an extension or declare the deal void. If they extend, submit your proof below.</div>
                ) : (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:4 }}>
                    {[12,24,36].map(h => (<button key={h} style={{...S.btnOutline, fontSize:12, padding:"8px 12px"}} onClick={()=>extendDeposit(h)}>Extend {h}h</button>))}
                    <button style={{...S.btn, background:C.red, fontSize:12, padding:"8px 14px"}} onClick={endDealForDeposit}>Void the deal (no deposit)</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.navy, fontWeight:700 }}>⏳ Proof of deposit due in {hoursLeft}h {minsLeft}m</div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:5, lineHeight:1.5 }}>Earnest money keeps this deal alive. If proof isn't provided before the timer runs out, the deal can be declared <b>null and void — including the signed Purchase Agreement</b>, and the <b>seller is then free to accept other offers</b>.</div>
              </>
            )}
            {isBuyer && !depHasProof && !depEnded && (
              <div style={{ marginTop:12 }}>
                <label style={S.label}>Deposit confirmation / reference #</label>
                <input style={S.input} value={proofRef} onChange={e=>setProofRef(e.target.value)} placeholder="Escrow.com or wire confirmation #" />
                <div style={{ height:8 }}/>
                <Field label="Note (optional)"><input style={S.input} value={proofNote} onChange={e=>setProofNote(e.target.value)} placeholder="e.g. Wired $7,500 to Escrow.com" /></Field>
                <button style={{...S.btnBrass, width:"100%", marginTop:10, fontSize:13, padding:"10px", opacity:proofRef.trim()?1:0.5}} disabled={!proofRef.trim()} onClick={submitProof}>Submit deposit proof</button>
              </div>
            )}
          </div>
        );
      })()}
      {/* Header bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={S.h1}>Due Diligence</h1>
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>
            Period: <strong>{terms.dueDiligenceDays||"—"} days</strong> &nbsp;·&nbsp;
            Ends: <strong>{ddEnd||"TBD"}</strong> &nbsp;·&nbsp;
            Closing: <strong>{terms.closingDate||"TBD"}</strong>
            {daysLeft!==null && <span style={{ marginLeft:10, color:daysLeft<=3?C.red:daysLeft<=7?C.brass:C.green, fontWeight:700 }}>({daysLeft} days remaining)</span>}
          </p>
        </div>
        {negotiate.deposit > 0 && (
          <button onClick={()=>setShowReceipt(true)} style={{ ...S.btnBrass, fontSize:11, padding:"7px 14px", whiteSpace:"nowrap" }}>
            📄 Earnest Receipt
          </button>
        )}
      </div>

      {/* Role note — explains the lock-out to both parties */}
      <div style={{ background:C.sandDark, borderRadius:6, padding:"9px 13px", marginBottom:16, fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.5 }}>
        {isBuyer ? "You handle the inspections below. The seller has their own checklist to prepare the vessel and paperwork — you won't see theirs, and they won't see yours." : "You prepare the vessel and paperwork below. The buyer runs the survey, sea trial, and title checks on their side — each of you only sees your own due-diligence list."}
      </div>

      {/* Buyer's hands-on due diligence — hidden from the seller */}
      {isBuyer && (<>
      {/* ── MARINE SURVEY ── */}
      <div style={S.card}>
        <SectionHeader icon="🔍" title="Marine Survey" subtitle={surveyFile ? `Uploaded: ${surveyFile.name}` : "Upload survey, record findings, send to lender/insurer"} open={surveyOpen} onToggle={()=>setSurveyOpen(v=>!v)} done={!!data.survey} />
        {surveyOpen && (
          <div style={{ paddingTop:14 }}>
            <Grid2>
              <Field label="Surveyor / Survey Company">
                <input style={S.input} value={surveyCompany} onChange={e=>setSurveyCompany(e.target.value)} placeholder="ABC Marine Surveys" />
              </Field>
              <Field label="Surveyor Name">
                <input style={S.input} value={surveyorName} onChange={e=>setSurveyorName(e.target.value)} placeholder="John Smith, SAMS AMS" />
              </Field>
              <Field label="Survey Date">
                <input style={S.input} type="date" value={surveyDate} onChange={e=>setSurveyDate(e.target.value)} />
              </Field>
              <Field label="Overall Result">
                <select style={S.select} value={data.surveyResult||""} onChange={e=>set("surveyResult",e.target.value)}>
                  <option value="">Select…</option>
                  <option value="pass">Pass — Acceptable condition</option>
                  <option value="pass_conditions">Pass with conditions</option>
                  <option value="fail">Fail — Significant defects found</option>
                </select>
              </Field>
            </Grid2>
            <Field label="Survey Findings / Notes">
              <textarea style={{...S.textarea, minHeight:72}} value={surveyNotes} onChange={e=>setSurveyNotes(e.target.value)} placeholder="Hull in good condition, minor osmotic blistering on port bow. Engines started and ran well. Recommend blister repair before next haul-out…" />
            </Field>

            {/* Upload survey */}
            <div style={{ background:C.sandDark, borderRadius:5, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>Upload Survey Report</div>
              {!surveyFile ? (
                <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:5, padding:"8px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:600 }}>
                  📎 Choose Survey PDF
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setSurveyFile(e.target.files[0]); }}/>
                </label>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, fontFamily:"sans-serif", color:C.green }}>✓ {surveyFile.name}</span>
                  <button onClick={()=>setSurveyFile(null)} style={{ fontSize:11, background:"none", border:`1px solid ${C.mist}`, borderRadius:4, padding:"2px 8px", cursor:"pointer", color:C.slate }}>Remove</button>
                </div>
              )}
            </div>

            {/* Send survey to lender / insurer */}
            <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:5, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.teal, marginBottom:6 }}>📤 Send Survey to Lender / Insurance Company</div>
              <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10 }}>Most marine lenders and insurers require a copy of the survey. Send it directly from here.</div>
              <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                {[parties.buyer.email, parties.seller.email].filter(Boolean).map(e=>(
                  <button key={e} onClick={()=>setSurveySendEmail(e)} style={{ fontSize:10, fontFamily:"sans-serif", padding:"3px 9px", borderRadius:12, border:`1px solid ${C.teal}`, background:"transparent", color:C.teal, cursor:"pointer" }}>{e}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{...S.input, flex:1, fontSize:12}} type="email" placeholder="lender@bank.com or agent@insurance.com" value={surveySendEmail} onChange={e=>setSurveySendEmail(e.target.value)} />
                <button style={S.btnTeal} disabled={!surveySendEmail.trim()} onClick={()=>{ setSurveySentLog(l=>[...l,{to:surveySendEmail, time:new Date().toLocaleTimeString()}]); setSurveySendEmail(""); }}>Send</button>
              </div>
              {surveySentLog.length>0 && (
                <div style={{ marginTop:8, fontSize:10, fontFamily:"sans-serif", color:C.slate }}>
                  {surveySentLog.map((s,i)=><div key={i}>→ {s.to} · {s.time}</div>)}
                </div>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <label style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, fontFamily:"sans-serif", color:C.slate, cursor:"pointer" }}>
                <input type="checkbox" checked={!!data.survey} onChange={e=>set("survey",e.target.checked)} style={{ accentColor:C.navy }} />
                Mark survey complete
              </label>
            </div>
          </div>
        )}

        {/* ── ENGINE TESTS: OIL ANALYSIS + COMPRESSION ── */}
        <SectionHeader icon="🛢️" title="Engine Oil Analysis &amp; Compression Test" subtitle={(oilResult||compResult)?`${oilResult?"Oil: "+oilResult:""}${oilResult&&compResult?" · ":""}${compResult?"Compression: "+compResult:""}`:"Optional lab oil analysis and cylinder compression readings"} open={engineTestsOpen} onToggle={()=>setEngineTestsOpen(v=>!v)} done={!!data.engineTests} />
        {engineTestsOpen && (
          <div style={{ paddingTop:14 }}>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>🛢️ Oil Analysis</div>
            <Grid2>
              <Field label="Lab / Provider"><input style={S.input} value={oilLab} onChange={e=>{setOilLab(e.target.value); set("oilLab",e.target.value);}} placeholder="Blackstone Labs, Polaris…" /></Field>
              <Field label="Sample Date"><input style={S.input} type="date" value={oilDate} onChange={e=>{setOilDate(e.target.value); set("oilDate",e.target.value);}} /></Field>
            </Grid2>
            <Field label="Result">
              <select style={S.select} value={oilResult} onChange={e=>{setOilResult(e.target.value); set("oilResult",e.target.value);}}>
                <option value="">Select…</option>
                <option value="Normal">Normal — no abnormal wear metals</option>
                <option value="Watch">Watch — minor items flagged</option>
                <option value="Flagged">Flagged — abnormal results, review needed</option>
              </select>
            </Field>
            <Field label="Oil Analysis Notes"><textarea style={{...S.textarea, minHeight:56}} value={oilNotes} onChange={e=>{setOilNotes(e.target.value); set("oilNotes",e.target.value);}} placeholder="Wear metals within normal range. No coolant intrusion. Slight fuel dilution on port engine…" /></Field>
            {!oilFile ? (
              <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:5, padding:"8px 14px", fontSize:12, fontFamily:"sans-serif", fontWeight:600, marginBottom:12 }}>
                📎 Upload Oil Analysis Report
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setOilFile(e.target.files[0]); }}/>
              </label>
            ) : (
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green, marginBottom:12 }}>✓ {oilFile.name} <button onClick={()=>setOilFile(null)} style={{ marginLeft:8, fontSize:10, background:"none", border:`1px solid ${C.mist}`, borderRadius:3, padding:"1px 6px", cursor:"pointer", color:C.slate }}>Remove</button></div>
            )}

            <hr style={S.divider}/>

            <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, margin:"6px 0 8px" }}>🔧 Compression Test</div>
            <Grid2>
              <Field label="Test Date"><input style={S.input} type="date" value={compDate} onChange={e=>{setCompDate(e.target.value); set("compDate",e.target.value);}} /></Field>
              <Field label="Result">
                <select style={S.select} value={compResult} onChange={e=>{setCompResult(e.target.value); set("compResult",e.target.value);}}>
                  <option value="">Select…</option>
                  <option value="Even/Normal">Even across cylinders — normal</option>
                  <option value="Minor Variance">Minor variance between cylinders</option>
                  <option value="Low/Uneven">Low or uneven — review needed</option>
                </select>
              </Field>
            </Grid2>
            <Field label="Cylinder Readings / Notes"><textarea style={{...S.textarea, minHeight:56}} value={compNotes} onChange={e=>{setCompNotes(e.target.value); set("compNotes",e.target.value);}} placeholder="Port: 145/148/146/147 psi. Stbd: 150/149/151/148 psi. All within 10% — healthy." /></Field>
            {!compFile ? (
              <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:5, padding:"8px 14px", fontSize:12, fontFamily:"sans-serif", fontWeight:600, marginBottom:10 }}>
                📎 Upload Compression Report
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setCompFile(e.target.files[0]); }}/>
              </label>
            ) : (
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green, marginBottom:10 }}>✓ {compFile.name} <button onClick={()=>setCompFile(null)} style={{ marginLeft:8, fontSize:10, background:"none", border:`1px solid ${C.mist}`, borderRadius:3, padding:"1px 6px", cursor:"pointer", color:C.slate }}>Remove</button></div>
            )}
            <label style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, fontFamily:"sans-serif", color:C.slate, cursor:"pointer" }}>
              <input type="checkbox" checked={!!data.engineTests} onChange={e=>set("engineTests",e.target.checked)} style={{ accentColor:C.navy }} />
              Mark engine tests complete
            </label>
          </div>
        )}

        {/* ── TITLE SEARCH ── */}
        <SectionHeader icon="📋" title="Title Search" subtitle={titleClear===true?"Clear — no liens found":titleClear===false?"Issues found — see notes":"Verify clear title, no liens or encumbrances"} open={titleOpen} onToggle={()=>setTitleOpen(v=>!v)} done={!!data.title} />
        {titleOpen && (
          <div style={{ paddingTop:14 }}>
            <Grid2>
              <Field label="Title Search Company">
                <input style={S.input} value={titleSearchCo} onChange={e=>setTitleSearchCo(e.target.value)} placeholder="National Marine Title, USCG Abstract…" />
              </Field>
              <Field label="Title Status">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <button onClick={()=>setTitleClear(true)} style={{ ...S.btnOutline, background:titleClear===true?C.green:"transparent", color:titleClear===true?"#fff":C.green, borderColor:C.green, padding:"8px", fontSize:12 }}>✓ Clear</button>
                  <button onClick={()=>setTitleClear(false)} style={{ ...S.btnOutline, background:titleClear===false?C.red:"transparent", color:titleClear===false?"#fff":C.red, borderColor:C.red, padding:"8px", fontSize:12 }}>✗ Issues Found</button>
                </div>
              </Field>
            </Grid2>
            <Field label="Notes / Lien Details">
              <textarea style={{...S.textarea, minHeight:56}} value={titleNotes} onChange={e=>setTitleNotes(e.target.value)} placeholder="USCG abstract shows vessel free of recorded liens. State title clear." />
            </Field>
            {!titleFile ? (
              <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:5, padding:"8px 14px", fontSize:12, fontFamily:"sans-serif", fontWeight:600, marginBottom:10 }}>
                📎 Upload Title Search Report
                <input type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setTitleFile(e.target.files[0]); }}/>
              </label>
            ) : (
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green, marginBottom:10 }}>✓ {titleFile.name} <button onClick={()=>setTitleFile(null)} style={{ marginLeft:8, fontSize:10, background:"none", border:`1px solid ${C.mist}`, borderRadius:3, padding:"1px 6px", cursor:"pointer", color:C.slate }}>Remove</button></div>
            )}
            <label style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, fontFamily:"sans-serif", color:C.slate, cursor:"pointer" }}>
              <input type="checkbox" checked={!!data.title} onChange={e=>set("title",e.target.checked)} style={{ accentColor:C.navy }} />
              Mark title search complete
            </label>
          </div>
        )}

        {/* ── SEA TRIAL ── */}
        <SectionHeader icon="⛵" title="Sea Trial" subtitle={seaTrialPass===true?"Passed":seaTrialPass===false?"Failed / Issues noted":"Underway test of vessel and systems"} open={seaTrialOpen} onToggle={()=>setSeaTrialOpen(v=>!v)} done={!!data.seatrial} />
        {seaTrialOpen && (
          <div style={{ paddingTop:14 }}>
            <Grid2>
              <Field label="Sea Trial Date">
                <input style={S.input} type="date" value={seaTrialDate} onChange={e=>setSeaTrialDate(e.target.value)} />
              </Field>
              <Field label="Result">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <button onClick={()=>setSeaTrialPass(true)} style={{ ...S.btnOutline, background:seaTrialPass===true?C.green:"transparent", color:seaTrialPass===true?"#fff":C.green, borderColor:C.green, padding:"8px", fontSize:12 }}>✓ Passed</button>
                  <button onClick={()=>setSeaTrialPass(false)} style={{ ...S.btnOutline, background:seaTrialPass===false?C.red:"transparent", color:seaTrialPass===false?"#fff":C.red, borderColor:C.red, padding:"8px", fontSize:12 }}>✗ Issues Found</button>
                </div>
              </Field>
            </Grid2>
            <Field label="Sea Trial Notes">
              <textarea style={{...S.textarea, minHeight:72}} value={seaTrialNotes} onChange={e=>setSeaTrialNotes(e.target.value)} placeholder="Both engines started immediately. Cruised at 3,500 RPM for 30 min. All gauges normal. Trim tabs responsive. Minor vibration at WOT — may be prop…" />
            </Field>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, margin:"10px 0 8px" }}>📈 Performance Numbers</div>
            <Grid2>
              <Field label="Wide-Open Throttle (WOT) Speed"><input style={S.input} value={stWotSpeed} onChange={e=>{setStWotSpeed(e.target.value); set("stWotSpeed",e.target.value);}} placeholder="42 kn / 48 mph" /></Field>
              <Field label="WOT RPM"><input style={S.input} value={stWotRpm} onChange={e=>{setStWotRpm(e.target.value); set("stWotRpm",e.target.value);}} placeholder="5800 rpm" /></Field>
            </Grid2>
            <Grid2>
              <Field label="Cruising Speed"><input style={S.input} value={stCruiseSpeed} onChange={e=>{setStCruiseSpeed(e.target.value); set("stCruiseSpeed",e.target.value);}} placeholder="26 kn / 30 mph" /></Field>
              <Field label="Cruising RPM"><input style={S.input} value={stCruiseRpm} onChange={e=>{setStCruiseRpm(e.target.value); set("stCruiseRpm",e.target.value);}} placeholder="3500 rpm" /></Field>
            </Grid2>
            <Grid2>
              <Field label="Fuel Consumption (MPG / GPH)"><input style={S.input} value={stFuel} onChange={e=>{setStFuel(e.target.value); set("stFuel",e.target.value);}} placeholder="1.2 mpg / 22 gph @ cruise" /></Field>
              <Field label="Engine Temp"><input style={S.input} value={stTemp} onChange={e=>{setStTemp(e.target.value); set("stTemp",e.target.value);}} placeholder="180°F both engines" /></Field>
            </Grid2>
            <Field label="Sea Conditions"><input style={S.input} value={stSeaState} onChange={e=>{setStSeaState(e.target.value); set("stSeaState",e.target.value);}} placeholder="1–2 ft chop, light wind, calm harbor exit" /></Field>
            {[
              {key:"engines", label:"Engines started and ran normally"},
              {key:"electronics", label:"Electronics / navigation systems tested"},
              {key:"seaSystems", label:"Bilge, pumps, blowers all functional"},
              {key:"seaHull", label:"No unusual water intrusion observed"},
            ].map(item=>(
              <label key={item.key} style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, fontFamily:"sans-serif", color:C.slate, cursor:"pointer", marginBottom:7 }}>
                <input type="checkbox" checked={!!data[item.key]} onChange={e=>set(item.key,e.target.checked)} style={{ accentColor:C.navy }} />
                {item.label}
              </label>
            ))}
            <label style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, fontFamily:"sans-serif", color:C.slate, cursor:"pointer", marginTop:4 }}>
              <input type="checkbox" checked={!!data.seatrial} onChange={e=>set("seatrial",e.target.checked)} style={{ accentColor:C.navy }} />
              <strong>Mark sea trial complete</strong>
            </label>
          </div>
        )}

        {/* ── INSURANCE ── */}
        <SectionHeader icon="🛡️" title="Insurance" subtitle={insurancePolicyNum?`Policy: ${insurancePolicyNum}`:"Buyer to obtain marine insurance"} open={insuranceOpen} onToggle={()=>setInsuranceOpen(v=>!v)} done={!!data.insurance} />
        {insuranceOpen && (
          <div style={{ paddingTop:14 }}>
            <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:5, padding:"9px 12px", marginBottom:12, fontSize:11, fontFamily:"sans-serif", color:C.teal, lineHeight:1.6 }}>
              💡 Most marine lenders require an insurance binder before funding. Get coverage effective on or before closing date. Send the binder to your lender directly from here.
            </div>
            <Grid2>
              <Field label="Insurance Company">
                <input style={S.input} value={insuranceCompany} onChange={e=>setInsuranceCompany(e.target.value)} placeholder="BoatUS, Progressive Marine, Markel…" />
              </Field>
              <Field label="Policy / Binder Number">
                <input style={S.input} value={insurancePolicyNum} onChange={e=>setInsurancePolicyNum(e.target.value)} placeholder="MB-123456" />
              </Field>
            </Grid2>
            {!insuranceFile ? (
              <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:5, padding:"8px 14px", fontSize:12, fontFamily:"sans-serif", fontWeight:600, marginBottom:12 }}>
                📎 Upload Insurance Binder
                <input type="file" accept=".pdf,.jpg,.png" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setInsuranceFile(e.target.files[0]); }}/>
              </label>
            ) : (
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green, marginBottom:12 }}>✓ {insuranceFile.name} <button onClick={()=>setInsuranceFile(null)} style={{ marginLeft:8, fontSize:10, background:"none", border:`1px solid ${C.mist}`, borderRadius:3, padding:"1px 6px", cursor:"pointer", color:C.slate }}>Remove</button></div>
            )}
            {/* Send binder */}
            <div style={{ background:C.sandDark, borderRadius:5, padding:"10px 12px", marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:6 }}>📤 Send Binder to Lender</div>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{...S.input, flex:1, fontSize:12}} type="email" placeholder="lender@bank.com" value={insuranceSendEmail} onChange={e=>setInsuranceSendEmail(e.target.value)} />
                <button style={S.btn} disabled={!insuranceSendEmail.trim()} onClick={()=>{ setInsuranceSentLog(l=>[...l,{to:insuranceSendEmail, time:new Date().toLocaleTimeString()}]); setInsuranceSendEmail(""); }}>Send</button>
              </div>
              {insuranceSentLog.length>0 && <div style={{ marginTop:6, fontSize:10, fontFamily:"sans-serif", color:C.slate }}>{insuranceSentLog.map((s,i)=><div key={i}>→ {s.to} · {s.time}</div>)}</div>}
            </div>
            <label style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, fontFamily:"sans-serif", color:C.slate, cursor:"pointer" }}>
              <input type="checkbox" checked={!!data.insurance} onChange={e=>set("insurance",e.target.checked)} style={{ accentColor:C.navy }} />
              <strong>Mark insurance complete</strong>
            </label>
          </div>
        )}

        {/* ── OTHER ITEMS ── */}
        <div style={{ paddingTop:12 }}>
          <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>Additional Due Diligence Items</div>
          {[
            {key:"financeApproval", label:"Financing approved / commitment letter received"},
            {key:"lienConfirm",     label:"Lien search completed — no outstanding loans"},
            {key:"safetyGear",     label:"Safety equipment verified (flares, PFDs, fire extinguisher)"},
            {key:"trailerInspect", label:"Trailer inspected (if included)"},
          ].map(item=>(
            <label key={item.key} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:12, fontFamily:"sans-serif", color:C.slate, cursor:"pointer", marginBottom:9 }}>
              <input type="checkbox" checked={!!data[item.key]} onChange={e=>set(item.key,e.target.checked)} style={{ marginTop:2, accentColor:C.navy, flexShrink:0 }} />
              {item.label}
            </label>
          ))}
        </div>

        {/* Renegotiation notes */}
        <div style={{ marginTop:8 }}>
          <label style={S.label}>Renegotiation Notes (appears in Purchase Agreement addendum)</label>
          <textarea style={{...S.textarea, minHeight:64}} value={data.ddNotes} onChange={e=>set("ddNotes",e.target.value)} placeholder="Survey found minor blistering. Both parties agreed to reduce price by $2,000 to $70,000. Seller agrees to repair starboard rub rail before closing…" />
        </div>
      </div>
      </>)}

      {/* Seller's readiness checklist — hidden from the buyer */}
      {!isBuyer && (
        <div style={S.card}>
          <h2 style={{ ...S.h1, fontSize:21, marginBottom:6 }}>Prepare Your Vessel</h2>
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom:18 }}>
            This is your side of due diligence. The buyer arranges the survey, sea trial, and title checks — your job is to have the paperwork ready and the vessel prepared so the inspection goes smoothly. Check items off as you complete them.
          </p>
          {SELLER_PREP.map(sec => (
            <div key={sec.section} style={{ marginBottom:20 }}>
              <div style={{ fontSize:12.5, fontWeight:800, fontFamily:"sans-serif", color: sec.warn ? "#a23a14" : C.navy, textTransform:"uppercase", letterSpacing:0.4, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                {sec.warn && <span>⚠️</span>}{sec.section}
              </div>
              {sec.warn && (
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:"#a23a14", background:"#fdf0e9", border:"1px solid #e8c3b0", borderRadius:6, padding:"8px 11px", marginBottom:10, lineHeight:1.5 }}>
                  These protect the deal and everyone's safety. A botched cold-start or a sea trial without safety gear can sink a survey day — and the deal.
                </div>
              )}
              {sec.items.map(it => {
                const on = !!sellerPrep[it.key];
                return (
                  <div key={it.key} onClick={()=>toggleSellerPrep(it.key)} style={{ display:"flex", gap:11, alignItems:"flex-start", padding:"9px 0", borderBottom:`1px solid ${C.mist}`, cursor:"pointer" }}>
                    <span style={{ width:19, height:19, borderRadius:5, flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", background:on?C.green:"transparent", border:on?"none":`1.5px solid ${it.warn?"#c2611f":C.mist}` }}>{on?"✓":""}</span>
                    <span style={{ flex:1, fontSize:13, fontFamily:"sans-serif", lineHeight:1.5, color: it.warn ? "#8a3a1a" : C.text, fontWeight: it.warn ? 600 : 400 }}>{it.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ background:C.navy, borderRadius:8, padding:"13px 16px", marginTop:4, fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.85)", lineHeight:1.6 }}>
            <b style={{ color:C.brass }}>From the captain's chair:</b> a vessel that starts cold, runs clean, and has its papers in order builds buyer confidence and keeps the deal moving. Surprises during survey are where deals stall.
          </div>
        </div>
      )}

      {/* ── VESSEL DECISION (buyer-only) ── */}
      <div style={{...S.card, marginTop:16}}>
        <h3 style={S.h3}>Buyer's Vessel Decision</h3>
        {!isBuyer ? (
          <div>
            <div style={{ background:C.sandDark, borderRadius:6, padding:"14px 16px", fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom: negotiate.addendum?14:0 }}>
              🔒 Only the buyer makes the vessel decision after due diligence. {negotiate.vesselRejection ? "The buyer has REJECTED the vessel — see the notice below." : negotiate.addendum ? `The buyer has PROPOSED A NEW PRICE: ${fmt(Number(negotiate.addendum.newPrice))}.` : negotiate.vesselAcceptance ? "The buyer has ACCEPTED the vessel." : "Awaiting the buyer's decision (accept as-is, reject, or propose a new final price)."}
            </div>
            {negotiate.addendum && !negotiate.vesselRejection && (
              <div style={{ border:`1px solid ${C.brass}`, borderRadius:8, overflow:"hidden" }}>
                <div style={{ background:C.navy, color:"#fff", padding:"10px 14px", fontSize:12, fontWeight:700, fontFamily:"sans-serif", letterSpacing:0.5 }}>ADDENDUM TO PURCHASE AGREEMENT — Your Response Needed</div>
                <div style={{ background:"#fff", padding:"14px 16px", fontFamily:"sans-serif" }}>
                  <div style={{ fontSize:12, color:C.text, lineHeight:1.7 }}>
                    The buyer proposes amending the agreed price on <b>{vessel.year} {vessel.make} {vessel.model}</b>.
                  </div>
                  <div style={{ fontSize:12, color:C.text, marginTop:6 }}>Original price: <b>{fmt(Number(negotiate.agreedPrice||0))}</b></div>
                  <div style={{ fontSize:12, color:C.text }}>Proposed price: <b>{fmt(Number(negotiate.addendum.newPrice))}</b></div>
                  {negotiate.addendum.reason && <div style={{ fontSize:12, color:C.slate, marginTop:6 }}>Basis: {negotiate.addendum.reason}</div>}
                  {negotiate.addendum.status ? (
                    <div style={{ marginTop:12, fontSize:12.5, fontWeight:700, fontFamily:"sans-serif", color: negotiate.addendum.status==="accepted"?C.green:C.red }}>
                      {negotiate.addendum.status==="accepted" ? "✓ You accepted this addendum — the amended price applies." : "✗ You declined this addendum — the original price stands."}
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:10, marginTop:14 }}>
                      <button onClick={()=>{ if(setNegotiate) setNegotiate(n=>{ const amt=Number(n.addendum?.newPrice); const offers=(n.offers||[]).map(o=> (amt && (o.status==="accepted"||o.status==="agreed")) ? {...o, origAmount: (o.origAmount ?? o.amount), amount: amt} : o); return {...n, offers, addendum:{...n.addendum, status:"accepted"}}; }); }} style={{ ...S.btn, background:C.green, flex:1, fontSize:13, padding:"10px 0" }}>✓ Accept Addendum</button>
                      <button onClick={()=>{ if(setNegotiate) setNegotiate(n=>({...n, addendum:{...n.addendum, status:"declined"}})); }} style={{ ...S.btnOutline, flex:1, fontSize:13, padding:"10px 0", color:C.red, borderColor:C.red }}>✗ Decline</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {negotiate.vesselRejection && (
              <RejectionNotice rejection={negotiate.vesselRejection} escrowPath={(negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.escrowPath} viewerRole="seller" vessel={vessel} />
            )}
          </div>
        ) : (
        <>
        <p style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, marginBottom:14 }}>
          After due diligence you may accept the vessel as-is, reject it (earnest money returned, reason recorded), or propose a new final price — which reopens negotiation. Only you, the buyer, can make this decision.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
          <button onClick={()=>{ setOutcome("accept"); setBuyerSigned(false); setVaSigned(false); set("outcome","accept"); }} style={{ padding:"14px 8px", textAlign:"center", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="accept"?C.green:"transparent", color:outcome==="accept"?"#fff":C.green, border:`2px solid ${C.green}` }}>
            ✓ Accept As-Is
          </button>
          <button onClick={()=>{ setOutcome("propose_price"); set("outcome","propose_price"); }} style={{ padding:"14px 8px", textAlign:"center", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="propose_price"?C.brass:"transparent", color:outcome==="propose_price"?C.navy:C.brass, border:`2px solid ${C.brass}` }}>
            ↺ Propose New Price
          </button>
          <button onClick={()=>{ setOutcome("reject"); setBuyerSigned(false); setVaSigned(false); set("outcome","reject"); }} style={{ padding:"14px 8px", textAlign:"center", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="reject"?C.red:"transparent", color:outcome==="reject"?"#fff":C.red, border:`2px solid ${C.red}` }}>
            ✗ Reject Vessel
          </button>
        </div>

        {outcome==="propose_price" && (
          <div style={{ background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:6, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:6 }}>Propose a New Final Price — Purchase Agreement Addendum</div>
            <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginBottom:12, lineHeight:1.5 }}>
              Due diligence turned up something that changes the value. This does <b>not</b> rewrite the signed Purchase Agreement — instead it creates an <b>addendum</b> proposing a price adjustment. The signed PA stays intact; the seller can accept or decline this addendum.
            </div>
            <label style={S.label}>New proposed final price</label>
            <input style={{...S.input, marginBottom:10}} type="number" value={newPrice} onChange={e=>{ setNewPrice(e.target.value); set("proposedNewPrice", e.target.value); }} placeholder="e.g. 142000" />
            <label style={S.label}>Reason (recorded on the addendum)</label>
            <textarea style={{...S.textarea, minHeight:60}} value={newPriceReason} onChange={e=>{ setNewPriceReason(e.target.value); set("proposedNewPriceReason", e.target.value); }} placeholder="e.g. Survey found soft transom requiring ~$8k repair; adjusting offer accordingly." />
            {newPrice && (
              <div style={{ marginTop:12, border:`1px solid ${C.mist}`, borderRadius:6, overflow:"hidden" }}>
                <div style={{ background:C.navy, color:"#fff", padding:"8px 12px", fontSize:11, fontWeight:700, fontFamily:"sans-serif", letterSpacing:0.5 }}>ADDENDUM TO PURCHASE AGREEMENT</div>
                <div style={{ background:"#fff", padding:"12px 14px", fontSize:11.5, fontFamily:"sans-serif", color:C.text, lineHeight:1.7 }}>
                  <div>This addendum amends the executed Purchase Agreement for <b>{vessel.year} {vessel.make} {vessel.model}</b>.</div>
                  <div style={{ marginTop:6 }}>Original agreed price: <b>{fmt(Number(negotiate.agreedPrice||0))}</b></div>
                  <div>Proposed amended price: <b>{fmt(Number(newPrice))}</b></div>
                  {newPriceReason && <div style={{ marginTop:6 }}>Basis: {newPriceReason}</div>}
                  <div style={{ marginTop:8, fontSize:10.5, color:C.slate }}>Pending seller acceptance. All other terms of the original Purchase Agreement remain in full effect.</div>
                </div>
              </div>
            )}
            {newPrice && (
              (negotiate.addendum && negotiate.addendum.status) ? (
                <div style={{ marginTop:12, padding:"12px 14px", borderRadius:6, background: negotiate.addendum.status==="accepted"?"#eaf6ee":C.redLight, border:`1px solid ${negotiate.addendum.status==="accepted"?"#a8d8b8":"#e8c0c0"}`, fontSize:12.5, fontFamily:"sans-serif", fontWeight:700, color: negotiate.addendum.status==="accepted"?C.green:C.red, lineHeight:1.6 }}>
                  {negotiate.addendum.status==="accepted" ? "✓ The seller ACCEPTED your proposed price. The amended price applies — continue to the documents to finalize." : "✗ The seller DECLINED your proposed price. The original agreed price stands. You can accept the vessel as-is or reject it."}
                </div>
              ) : negotiate.addendum ? (
                <div style={{ marginTop:12, padding:"12px 14px", borderRadius:6, background:"#eef4fb", border:`1px solid ${C.navy}`, fontSize:12.5, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6 }}>
                  <b>✓ Proposed price sent to the seller.</b> They'll accept or decline this addendum, and we'll email you when they respond. You can wait here or move on — your proposal is saved.
                </div>
              ) : (
                <button
                  onClick={()=>{
                    set("outcome","propose_price"); set("proposedNewPrice",newPrice); set("proposedNewPriceReason",newPriceReason||"");
                    if(setNegotiate) setNegotiate(n=>({...n, addendum:{ newPrice:Number(newPrice), reason:newPriceReason||"", buyer:parties.buyer.name||"Buyer", date:(n.addendum&&n.addendum.date)||today(), status:null }, vesselAcceptance: n.vesselAcceptance || { sig:parties.buyer.name||"Buyer", date:today() } }));
                  }}
                  style={{ ...S.btnBrass, width:"100%", marginTop:12, fontSize:13.5, padding:"12px 0" }}
                >
                  Send proposed price to the seller →
                </button>
              )
            )}
          </div>
        )}

        {outcome==="reject" && (
          <div style={{ background:C.redLight, border:`1px solid #e8c0c0`, borderRadius:6, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.red, marginBottom:10 }}>Reasons for Rejection — select all that apply (required for the Rejection Notice)</div>
            {REJECTION_REASONS.map(r => (
              <label key={r.id} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10, cursor:"pointer" }}>
                <input type="checkbox" checked={rejectionReasons.includes(r.id)} onChange={()=>toggleRejReason(r.id)} style={{ marginTop:2, accentColor:C.red, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:12, fontWeight:600, fontFamily:"sans-serif", color:C.text }}>{r.label}</div>
                  <div style={{ fontSize:11, color:C.slate, fontFamily:"sans-serif" }}>{r.desc}</div>
                </div>
              </label>
            ))}
            <div style={{ marginTop:10 }}>
              <label style={S.label}>Additional Notes (appears in Rejection Notice)</label>
              <textarea style={{...S.textarea, minHeight:60}} value={rejectionNotes} onChange={e=>setRejectionNotes(e.target.value)} placeholder="Describe the specific issues that led to rejection..." />
            </div>
            <div style={{ marginTop:10 }}>
              <label style={S.label}>Propose a path forward to the seller (optional)</label>
              <textarea style={{...S.textarea, minHeight:55}} value={rejSolution} onChange={e=>setRejSolution(e.target.value)} placeholder="e.g. I'd still buy at $X given the survey findings, or: if you repair the transom I'll continue. This is sent to the seller with the rejection." />
              <div style={{ fontSize:10.5, color:C.slate, fontFamily:"sans-serif", marginTop:4 }}>If you'd rather keep negotiating on price, use <b>Propose a New Price</b> above instead — that keeps the deal alive as an addendum. A rejection ends the deal.</div>
            </div>
          </div>
        )}

        {outcome==="accept" && (
          <div style={{ border:`1px solid #a8d8b8`, borderRadius:6, overflow:"hidden", marginBottom:14 }}>
            <div style={{ background:C.green, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff", fontFamily:"sans-serif" }}>Vessel Acceptance Document — Required Before Proceeding</div>
              {vaSigned && <span style={{ fontSize:11, background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"2px 10px", fontFamily:"sans-serif" }}>✓ Signed</span>}
            </div>
            <div style={{ background:"#fff", padding:"16px 18px" }}>
              <style>{PA_DOC_CSS}</style>
              <div className="bc-pa" style={{ background:"#fffdf8", border:`1px solid ${C.mist}`, borderTop:`4px solid ${C.brass}`, borderRadius:4, padding:"18px 20px", marginBottom:14 }} dangerouslySetInnerHTML={{ __html: fillDocument(DOCUMENTS.find(d=>d.id==="accept"), {
                effectiveDate: today(),
                sellerName: parties.seller?.name || "Seller",
                buyerName: parties.buyer?.name || vaSigName || "Buyer",
                vesselYear: vessel.year||"", vesselMake: vessel.make||"", vesselModel: vessel.model||"",
                hin: vessel.hin || "____________",
                contList: (negotiate.selectedContingencies || (negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.contingencies || []).map(c=>CONTINGENCY_LABELS[c]||c).join(", ") || "the selected contingencies",
                closingDate: negotiate.closingDate || (negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.closingDate || "____________",
                depositAmount: fmt((negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.deposit || 0),
              }) }} />
              <hr style={S.divider}/>
              <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:4, padding:"9px 12px", fontSize:10, color:"#7a5500", marginBottom:12 }}>
                By signing, Buyer acknowledges BoatClosers provides document facilitation only — not legal advice or brokerage services — and accepts full responsibility for this transaction.
              </div>
              <div style={{ background:C.sandDark, borderRadius:5, padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>Buyer: {parties.buyer.name||"Buyer"}</div>
                <label style={{ display:"flex", gap:8, fontSize:11, color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
                  <input type="checkbox" checked={buyerDisc} onChange={e=>setBuyerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
                  I agree to the liability disclaimer and accept responsibility for this transaction
                </label>
                {!vaSigned ? (
                  <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                    <div style={{ flex:1 }}>
                      <label style={S.label}>Type your full legal name to sign</label>
                      <input style={S.input} placeholder="Buyer full legal name" value={vaSigName} onChange={e=>setVaSigName(e.target.value)} disabled={!buyerDisc} />
                    </div>
                    <button style={{ ...S.btnBrass, whiteSpace:"nowrap", opacity:(!buyerDisc||!vaSigName.trim())?0.4:1 }} disabled={!buyerDisc||!vaSigName.trim()} onClick={()=>{ setVaSigned(true); setBuyerSigned(true); if(setNegotiate) setNegotiate(n=>({...n, vesselAcceptance:{ sig:vaSigName.trim(), date:today() }})); }}>Sign Acceptance</button>
                  </div>
                ) : (
                  <div style={{ fontSize:12, color:C.green, fontFamily:"sans-serif" }}>✓ Signed by {vaSigName} on {today()}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {outcome==="reject" && rejectionReasons.length>0 && (
          <div style={{ background:C.sandDark, borderRadius:5, padding:"12px 14px", marginTop:8 }}>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>Full Rejection Notice — review before signing</div>
            <div style={{ background:"#fff", border:`1px solid ${C.mist}`, borderRadius:5, padding:"4px 10px", marginBottom:12 }}>
              <RejectionNotice rejection={{ reasons: rejectionReasons, notes: rejectionNotes, solution: rejSolution, sig: (rejSigName.trim()||parties.buyer.name||"Buyer"), date: today() }} escrowPath={(negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.escrowPath} viewerRole="buyer" vessel={vessel} />
            </div>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>Buyer: {parties.buyer.name||"Buyer"} — Formal Rejection</div>
            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:4, padding:"9px 12px", fontSize:10, color:"#7a5500", marginBottom:10 }}>
              BoatClosers is not a party to this transaction. By signing, you accept full responsibility for the rejection and for arranging the return of any earnest-money deposit.
            </div>
            <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
              <input type="checkbox" checked={buyerDisc} onChange={e=>setBuyerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
              I agree to the disclaimer above
            </label>
            <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
              <input type="checkbox" checked={buyerSigned} onChange={e=>setBuyerSigned(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
              I formally reject this vessel for the reasons stated above
            </label>
            <label style={S.label}>Type your full legal name to sign the Rejection Notice</label>
            <input style={S.input} placeholder="Buyer full legal name" value={rejSigName} onChange={e=>setRejSigName(e.target.value)} disabled={!buyerDisc||!buyerSigned} />
            {rejSigName.trim() && buyerDisc && buyerSigned && <div style={{ fontSize:11, color:C.green, fontFamily:"sans-serif", marginTop:8 }}>✓ Ready to sign — press "Proceed to Close (Rejected)" below to record the rejection and notify the seller.</div>}
          </div>
        )}
        </>
        )}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={S.btnBrass} disabled={!canProceed} onClick={()=>{ setData(d=>({...d,outcome,rejectionReasons,rejectionNotes,rejSolution,rejSigName,vaSigName,vaSigned,surveyFile:surveyFile?.name,surveyCompany,surveyorName})); if(setNegotiate){ if(outcome==="propose_price" && newPrice){ setNegotiate(n=>({...n, addendum:{ newPrice:Number(newPrice), reason:newPriceReason||"", buyer:parties.buyer.name||"Buyer", date:(n.addendum&&n.addendum.date)||today() }, vesselAcceptance: n.vesselAcceptance || { sig:parties.buyer.name||"Buyer", date:today() } })); } if(outcome==="accept" && vaSigName.trim()){ setNegotiate(n=>({...n, vesselAcceptance: n.vesselAcceptance || { sig:vaSigName.trim(), date:today() }})); } if(outcome==="reject" && rejectionReasons.length>0){ setNegotiate(n=>({...n, vesselRejection:{ reasons:rejectionReasons, notes:rejectionNotes, solution:rejSolution, sig:(rejSigName.trim()||parties.buyer.name||"Buyer"), date:today() }})); } } onNext(); }}>
          {outcome==="reject" ? "Proceed to Close (Rejected)" : "Continue to Documents →"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — PAYWALL + DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
function StepDocuments({ data, setData, vessel, parties, terms, negotiate, myRole, amInitiator, onNext, onBack }) {
  // Payment happens once, at the PA-lock step in Negotiate. By the time the PA
  // is locked (an accepted offer exists), the deal is paid — so Documents must
  // NOT show a second paywall. Treat a locked deal as already paid.
  const paLocked = !!(negotiate?.offers || []).find(o => o.status === "accepted") || !!data.paid;
  const [paid, setPaid] = useState(paLocked || data.paid || false);
  const [payDisc, setPayDisc] = useState(false);
  const [agreedTos, setAgreedTos] = useState(false);
  const [signed, setSigned] = useState(data.signedDocs||{});
  const [sigName, setSigName] = useState({});

  const requiredDocs = DOCS.filter(d => d.required);
  const allRequiredSigned = requiredDocs.every(d => signed[d.id]);
  const signedCount = Object.keys(signed).length;

  const D = {
    buyerName: parties.buyer.name||"[Buyer Name]",
    sellerName: parties.seller.name||"[Seller Name]",
    buyerEmail: parties.buyer.email||"[Email]",
    sellerEmail: parties.seller.email||"[Email]",
    buyerAddress: `${parties.buyer.address||""} ${parties.buyer.city||""} ${parties.buyer.stateZip||""}`.trim()||"[Address]",
    sellerAddress: `${parties.seller.address||""} ${parties.seller.city||""} ${parties.seller.stateZip||""}`.trim()||"[Address]",
    year: vessel.year||"[Year]", make: vessel.make||"[Make]", model: vessel.model||"[Model]",
    hin: vessel.hin||"[HIN — Not Entered]",
    engineDesc: `${vessel.engineCount||"1"} × ${vessel.engineMake||""} ${vessel.engineModel||""}`.trim()||"[Engine]",
    engineHours: vessel.engineHours||"[Hours]",
    engineSerial: vessel.engineSerial||"[Serial — Not Entered]",
    reg: vessel.regNumber||"[Reg — Not Entered]",
    uscg: vessel.uscgNumber||"N/A",
    price: fmt(negotiate.agreedPrice||0),
    deposit: fmt(negotiate.deposit||0),
    escrow: escLabel(negotiate.escrowPath),
    closing: terms.closingDate||"[Closing Date]",
    ddDays: terms.dueDiligenceDays||"[Due Diligence Days]",
    ddEnd: terms.ddStartDate && terms.dueDiligenceDays ? addDays(terms.ddStartDate, Number(terms.dueDiligenceDays)) : "[DD End]",
    date: today(),
  };

  // ── per-doc action panel state (must be before any early return) ───────────
  const [docAction, setDocAction] = useState({});
  const [sendEmail, setSendEmail] = useState({});
  const [sendNote, setSendNote] = useState({});
  const [sentLog, setSentLog] = useState({});
  const [uploadedFile, setUploadedFile] = useState({});
  const [manualSig, setManualSig] = useState({});
  const [manualFields, setManualFields] = useState({});

  if (!paid) {
    return (
      <div style={S.page}>
        <div style={{ marginBottom:"1.5rem" }}>
          <h1 style={S.h1}>Unlock All Documents</h1>
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>Your deal is ready. Pay the flat $249 fee to unlock all documents, e-signatures, and your closing package.</p>
        </div>

        {/* ── E-SIGNATURE BINDING NOTICE ── */}
        <div style={{ background:C.navy, borderRadius:8, padding:"14px 18px", marginBottom:16, display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ fontSize:22, flexShrink:0 }}>⚠️</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.brass, fontFamily:"sans-serif", marginBottom:4 }}>Important — Electronic Signatures Are Not Released Until Payment</div>
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.8)", lineHeight:1.7 }}>
              Any signatures collected before payment are <strong style={{ color:C.brass }}>previews only and are not legally binding</strong>. Once your $249 payment is confirmed, BoatClosers releases the fully executed document package to both parties. <strong style={{ color:"#fff" }}>Documents are only considered complete and delivered upon payment receipt by BoatClosers.</strong>
            </div>
          </div>
        </div>

        <DataWarning vessel={vessel} parties={parties} />

        <div style={S.cardGold}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:36, fontWeight:800, color:C.navy, fontFamily:"sans-serif", lineHeight:1 }}>$249</div>
              <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, marginTop:4 }}>One-time flat fee · One vessel · All documents</div>
            </div>
            <span style={{...S.pill, background:"#fff3cd", color:"#7a5500"}}>Flat Rate</span>
          </div>
          <hr style={S.divider}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {["21 Professional Legal Documents","Electronic Signatures","Closing Checklist","PDF Download Package","No recurring fees","One deal covered","Buyer & seller copies"].map(f=>(
              <div key={f} style={{ fontSize:12, fontFamily:"sans-serif", color:C.navy }}>✓ {f}</div>
            ))}
          </div>
        </div>

        <div style={{...S.card, marginTop:16}}>
          <h3 style={S.h3}>Deal Summary</h3>
          <div style={{ fontSize:12, fontFamily:"sans-serif", lineHeight:2, color:C.slate }}>
            <div><strong>Vessel:</strong> {D.year} {D.make} {D.model} · HIN: {D.hin}</div>
            <div><strong>Agreed Price:</strong> {D.price}</div>
            <div><strong>Buyer:</strong> {D.buyerName} ({D.buyerEmail})</div>
            <div><strong>Seller:</strong> {D.sellerName} ({D.sellerEmail})</div>
            <div><strong>Closing Date:</strong> {D.closing}</div>
          </div>
        </div>

        <div style={{...S.card, marginTop:16}}>
          <div style={{ background:C.sandDark, borderRadius:5, padding:"12px 14px", fontSize:11, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7, marginBottom:14 }}>
            <strong>Disclaimer:</strong> BoatClosers facilitates document generation and e-signature collection only. We are not an escrow agent, broker, attorney, or party to any transaction. Payment of $249 grants access to document templates for this specific transaction only. All legal responsibility for accuracy, enforceability, and the outcome rests solely with the buyer and seller.
          </div>
          <label style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:12, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer" }}>
            <input type="checkbox" checked={payDisc} onChange={e=>setPayDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy }} />
            I understand and agree to the disclaimer
          </label>
          <label style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:12, fontFamily:"sans-serif", color:C.slate, marginBottom:18, cursor:"pointer" }}>
            <input type="checkbox" checked={agreedTos} onChange={e=>setAgreedTos(e.target.checked)} style={{ marginTop:1, accentColor:C.navy }} />
            I agree to the BoatClosers Terms of Service
          </label>
          <button style={{...S.btnBrass, fontSize:15, padding:"13px", width:"100%"}} disabled={!payDisc||!agreedTos} onClick={()=>{setPaid(true);setData(d=>({...d,paid:true}))}}>
            Pay $249 · Unlock All Documents
          </button>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-start", marginTop:"1.5rem" }}>
          <button style={S.btnOutline} onClick={onBack}>← Back</button>
        </div>
      </div>
    );
  }

  const setAction = (id, action) =>
    setDocAction(d => ({ ...d, [id]: d[id] === action ? null : action }));

  const sendDoc = (docId) => {
    const to = sendEmail[docId]?.trim();
    if (!to) return;
    setSentLog(s => ({ ...s, [docId]: [...(s[docId]||[]), { to, time: new Date().toLocaleTimeString(), note: sendNote[docId]||"" }] }));
    setSendEmail(e => ({ ...e, [docId]: "" }));
    setSendNote(n => ({ ...n, [docId]: "" }));
  };

  const confirmManualSig = (docId) => {
    const b = manualFields[docId]?.buyer?.trim();
    const s = manualFields[docId]?.seller?.trim();
    if (!b || !s) return;
    setManualSig(m => ({ ...m, [docId]: { buyer: b, seller: s, date: today() } }));
    setSigned(sg => ({ ...sg, [docId]: { name: `${b} & ${s} (manual)`, date: today(), manual: true } }));
  };

  const handleUpload = (docId, file) => {
    if (!file) return;
    setUploadedFile(u => ({ ...u, [docId]: file.name }));
    setSigned(sg => ({ ...sg, [docId]: { name: `Uploaded: ${file.name}`, date: today(), uploaded: true } }));
  };

  const printDoc = (docId) => window.print();

  // Action button component
  const ActionBtn = ({ docId, action, icon, label, color }) => {
    const active = docAction[docId] === action;
    return (
      <button
        onClick={() => setAction(docId, action)}
        title={label}
        style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"sans-serif", fontWeight:600, padding:"6px 11px", borderRadius:5, cursor:"pointer", border:`1px solid ${active ? (color||C.navy) : C.mist}`, background: active ? (color||C.navy) : C.white, color: active ? "#fff" : (color||C.navy), whiteSpace:"nowrap" }}
      >
        <span style={{ fontSize:13 }}>{icon}</span> {label}
      </button>
    );
  };

  // Documents view
  const categories = [...new Set(DOCS.map(d=>d.category))];
  return (
    <div style={S.page}>
      <TipBox tips={TIPS.documents}/>
      <DealAssistant step="documents" role={myRole} vessel={vessel} />
      <div style={{ marginBottom:"1.25rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={S.h1}>Documents</h1>
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>{signedCount} of {DOCS.length} complete · {requiredDocs.filter(d=>signed[d.id]).length}/{requiredDocs.length} required</p>
        </div>
        <span style={{...S.pill, background:C.greenLight, color:C.green}}>Paid ✓</span>
      </div>

      {/* Legend */}
      <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:6, padding:"10px 14px", marginBottom:16, fontSize:11, fontFamily:"sans-serif", color:C.teal, lineHeight:1.8 }}>
        <strong>Each document has five options:</strong> &nbsp;
        ✏️ <strong>E-Sign</strong> — type your name to sign in-app &nbsp;·&nbsp;
        ✍️ <strong>Manual Sign</strong> — record wet ink signatures &nbsp;·&nbsp;
        📤 <strong>Send</strong> — email the document to any party &nbsp;·&nbsp;
        📎 <strong>Upload</strong> — attach a signed PDF you received &nbsp;·&nbsp;
        🖨️ <strong>Print</strong> — open print dialog
      </div>

      <div style={{ height:5, background:C.mist, borderRadius:3, marginBottom:20, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(signedCount/DOCS.length)*100}%`, background:C.green, borderRadius:3, transition:"width 0.4s" }}/>
      </div>

      {categories.map(cat=>(
        <div key={cat} style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"sans-serif", fontWeight:700, letterSpacing:2, color:C.slate, textTransform:"uppercase", marginBottom:6 }}>{cat}</div>
          <div style={S.card}>
            {DOCS.filter(d=>d.category===cat).map((doc,i,arr)=>(
              <div key={doc.id}>
                {/* ── Row ── */}
                <div style={{ padding:"11px 0" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    {/* Status icon + name */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                      <div style={{ width:30, height:30, borderRadius:5, flexShrink:0, background: signed[doc.id] ? C.greenLight : C.sandDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                        {signed[doc.id] ? (signed[doc.id].uploaded ? "📎" : signed[doc.id].manual ? "✍️" : "✅") : "📄"}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:600, color:C.navy }}>{doc.name}</div>
                        <div style={{ display:"flex", gap:5, marginTop:2, flexWrap:"wrap" }}>
                          {doc.required && <span style={{...S.tag, background:"#fff3cd", color:"#7a5500"}}>Required</span>}
                          {doc.suggested && !doc.required && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>Suggested</span>}
                          {signed[doc.id] && <span style={{...S.tag, background:C.greenLight, color:C.green}}>✓ {signed[doc.id].date} · {signed[doc.id].name}</span>}
                          {sentLog[doc.id]?.length > 0 && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>Sent ×{sentLog[doc.id].length}</span>}
                          {uploadedFile[doc.id] && !signed[doc.id]?.uploaded && <span style={{...S.tag}}>📎 {uploadedFile[doc.id]}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:"flex", gap:5, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
                      <ActionBtn docId={doc.id} action="view"   icon="👁" label="View"   />
                      <ActionBtn docId={doc.id} action="esign"  icon="✏️" label="E-Sign" color={C.green} />
                      <ActionBtn docId={doc.id} action="manual" icon="✍️" label="Manual" color={C.teal} />
                      <ActionBtn docId={doc.id} action="send"   icon="📤" label="Send"   color={C.brass} />
                      <ActionBtn docId={doc.id} action="upload" icon="📎" label="Upload" color={C.slate} />
                      <button onClick={()=>printDoc(doc.id)} title="Print" style={{ fontSize:13, padding:"6px 10px", borderRadius:5, cursor:"pointer", border:`1px solid ${C.mist}`, background:C.white, color:C.slate }}>🖨️</button>
                    </div>
                  </div>

                  {/* ── Expandable panels ── */}

                  {/* VIEW */}
                  {docAction[doc.id]==="view" && (
                    <div style={{ marginTop:12 }}>
                      <DocPreview doc={doc} D={D} negotiate={negotiate}/>
                    </div>
                  )}

                  {/* E-SIGN */}
                  {docAction[doc.id]==="esign" && (
                    <div style={{ marginTop:12, background:C.greenLight, border:`1px solid #a8d8b8`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.green, marginBottom:10 }}>✏️ Electronic Signature — {doc.name}</div>
                      <div style={{ background:C.navy, borderRadius:4, padding:"9px 12px", fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.85)", marginBottom:12, lineHeight:1.6 }}>
                        ⚠️ <strong style={{ color:C.brass }}>Preview only — not legally binding until BoatClosers receives payment.</strong> Upon payment confirmation, the executed document package is released to both parties. BoatClosers is not a party to this agreement and provides document facilitation only — not legal advice or brokerage services.
                      </div>
                      {!signed[doc.id] || signed[doc.id].manual || signed[doc.id].uploaded ? (
                        <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                          <div style={{ flex:1 }}>
                            <label style={S.label}>Type your full legal name to sign electronically</label>
                            <input style={S.input} placeholder="Full legal name" value={sigName[doc.id]||""} onChange={e=>setSigName(s=>({...s,[doc.id]:e.target.value}))}/>
                          </div>
                          <button style={S.btnBrass} disabled={!sigName[doc.id]?.trim()} onClick={()=>{ setSigned(s=>({...s,[doc.id]:{name:sigName[doc.id],date:today()}})); setAction(doc.id,"esign"); }}>
                            Sign Document
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green }}>✓ Already signed by {signed[doc.id].name} on {signed[doc.id].date}</div>
                      )}
                    </div>
                  )}

                  {/* MANUAL SIGN */}
                  {docAction[doc.id]==="manual" && (
                    <div style={{ marginTop:12, background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.teal, marginBottom:8 }}>✍️ Record Manual / Wet Ink Signatures</div>
                      <p style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12, lineHeight:1.6 }}>
                        Print the document, have both parties sign by hand, then record the signed names here to mark it complete. Retain the original signed document for your records.
                      </p>
                      {!manualSig[doc.id] ? (
                        <>
                          <Grid2>
                            <Field label="Buyer signed name">
                              <input style={S.input} placeholder="Buyer's name as signed" value={manualFields[doc.id]?.buyer||""} onChange={e=>setManualFields(f=>({...f,[doc.id]:{...f[doc.id],buyer:e.target.value}}))}/>
                            </Field>
                            <Field label="Seller signed name">
                              <input style={S.input} placeholder="Seller's name as signed" value={manualFields[doc.id]?.seller||""} onChange={e=>setManualFields(f=>({...f,[doc.id]:{...f[doc.id],seller:e.target.value}}))}/>
                            </Field>
                          </Grid2>
                          <button style={S.btnTeal} disabled={!manualFields[doc.id]?.buyer?.trim()||!manualFields[doc.id]?.seller?.trim()} onClick={()=>{ confirmManualSig(doc.id); setAction(doc.id,"manual"); }}>
                            ✓ Confirm Both Parties Signed
                          </button>
                        </>
                      ) : (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.teal }}>
                          ✓ Manual signatures recorded — Buyer: {manualSig[doc.id].buyer} · Seller: {manualSig[doc.id].seller} · {manualSig[doc.id].date}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SEND */}
                  {docAction[doc.id]==="send" && (
                    <div style={{ marginTop:12, background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.brass, marginBottom:8 }}>📤 Send Document by Email</div>
                      <p style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12, lineHeight:1.6 }}>
                        Enter the recipient's email address to send them this document. You can send to the buyer, seller, their attorney, lender, insurance agent, or any other party.
                      </p>
                      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                        {[parties.buyer.email, parties.seller.email].filter(Boolean).map(e=>(
                          <button key={e} onClick={()=>setSendEmail(s=>({...s,[doc.id]:e}))} style={{ fontSize:11, fontFamily:"sans-serif", padding:"4px 10px", borderRadius:16, border:`1px solid ${C.brass}`, background:"transparent", color:C.brass, cursor:"pointer" }}>
                            {e}
                          </button>
                        ))}
                        <span style={{ fontSize:10, fontFamily:"sans-serif", color:C.slate, alignSelf:"center" }}>or type below</span>
                      </div>
                      <Grid2>
                        <Field label="Recipient email">
                          <input style={S.input} type="email" placeholder="recipient@email.com" value={sendEmail[doc.id]||""} onChange={e=>setSendEmail(s=>({...s,[doc.id]:e.target.value}))}/>
                        </Field>
                        <Field label="Optional note">
                          <input style={S.input} placeholder="Please review and sign…" value={sendNote[doc.id]||""} onChange={e=>setSendNote(n=>({...n,[doc.id]:e.target.value}))}/>
                        </Field>
                      </Grid2>
                      <button style={S.btnBrass} disabled={!sendEmail[doc.id]?.trim()} onClick={()=>{ sendDoc(doc.id); setAction(doc.id,"send"); }}>
                        Send Document →
                      </button>
                      {sentLog[doc.id]?.length > 0 && (
                        <div style={{ marginTop:10, fontSize:11, fontFamily:"sans-serif", color:C.slate }}>
                          <strong>Sent log:</strong>
                          {sentLog[doc.id].map((s,i)=>(
                            <div key={i}>→ {s.to} at {s.time}{s.note ? ` — "${s.note}"` : ""}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* UPLOAD */}
                  {docAction[doc.id]==="upload" && (
                    <div style={{ marginTop:12, background:C.sandDark, border:`1px solid ${C.mist}`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.slate, marginBottom:8 }}>📎 Upload Signed Document</div>
                      <p style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12, lineHeight:1.6 }}>
                        If this document was signed outside the platform (wet ink, notary, attorney office, DocuSign, etc.), upload the signed PDF here to attach it to your deal file.
                      </p>
                      {!uploadedFile[doc.id] ? (
                        <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:5, padding:"9px 18px", fontSize:12, fontFamily:"sans-serif", fontWeight:600 }}>
                          <span>📎</span> Choose File to Upload
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) handleUpload(doc.id, e.target.files[0]); setAction(doc.id,"upload"); }}/>
                        </label>
                      ) : (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green }}>
                          ✓ Uploaded: <strong>{uploadedFile[doc.id]}</strong> — attached to deal file on {today()}
                          <button onClick={()=>{ setUploadedFile(u=>({...u,[doc.id]:null})); setSigned(s=>{const n={...s}; delete n[doc.id]; return n;}); }} style={{ marginLeft:12, fontSize:11, fontFamily:"sans-serif", background:"none", border:`1px solid ${C.mist}`, borderRadius:4, padding:"2px 8px", cursor:"pointer", color:C.slate }}>Replace</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {i<arr.length-1 && <hr style={{...S.divider, margin:0}}/>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={S.btnBrass} disabled={!allRequiredSigned} onClick={()=>{setData(d=>({...d,signedDocs:signed}));onNext();}}>
          {allRequiredSigned ? "Proceed to Closing →" : `Sign required docs to continue (${requiredDocs.filter(d=>signed[d.id]).length}/${requiredDocs.length})`}
        </button>
      </div>
    </div>
  );
}

function DocPreview({ doc, D, negotiate }) {
  const hdr = { fontSize:10, color:C.slate, fontFamily:"sans-serif", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 };
  const row = { display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${C.mist}`, fontSize:11, fontFamily:"sans-serif" };
  return (
    <div style={{ background:"#fff", padding:"18px 20px", borderRadius:4, border:`1px solid ${C.mist}`, maxHeight:320, overflowY:"auto" }}>
      <div style={{ textAlign:"center", borderBottom:`2px solid ${C.navy}`, paddingBottom:10, marginBottom:14 }}>
        <div style={{ fontSize:8, letterSpacing:3, color:C.brass, fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>BoatClosers.com</div>
        <div style={{ fontSize:14, fontWeight:700, letterSpacing:0.5 }}>{doc.name.toUpperCase()}</div>
        <div style={{ fontSize:10, color:C.slate, marginTop:3 }}>Date: {D.date}</div>
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={hdr}>Parties</div>
        <div style={row}><span><strong>Buyer:</strong> {D.buyerName}</span><span>{D.buyerEmail}</span></div>
        <div style={row}><span><strong>Seller:</strong> {D.sellerName}</span><span>{D.sellerEmail}</span></div>
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={hdr}>Vessel</div>
        <div style={row}><span>{D.year} {D.make} {D.model}</span><span>HIN: {D.hin}</span></div>
        <div style={row}><span>Engine: {D.engineDesc}</span><span>Hours: {D.engineHours}</span></div>
        <div style={row}><span>Reg: {D.reg}</span><span>Serial: {D.engineSerial}</span></div>
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={hdr}>Transaction</div>
        <div style={row}><span><strong>Purchase Price:</strong></span><span><strong>{D.price}</strong></span></div>
        <div style={row}><span>Earnest Money Deposit:</span><span>{D.deposit}</span></div>
        <div style={row}><span>Escrow Method:</span><span>{D.escrow}</span></div>
        <div style={row}><span>Closing Date:</span><span>{D.closing}</span></div>
      </div>
      {doc.id==="purchase_agreement" && <div style={{ fontSize:10, color:C.slate, fontFamily:"sans-serif", lineHeight:1.7 }}>This Purchase and Sale Agreement is entered into between Buyer and Seller. Seller agrees to sell and Buyer agrees to purchase the vessel described herein at the price stated, subject to the terms and conditions herein. Vessel is sold "as-is, where-is." Buyer was afforded a {D.ddDays}-day due diligence period ending {D.ddEnd}. BoatClosers.com is a document facilitation platform and is not a broker, escrow agent, attorney, or party to this agreement.</div>}
      {doc.id==="bill_of_sale" && <div style={{ fontSize:10, color:C.slate, fontFamily:"sans-serif", lineHeight:1.7 }}>For consideration of {D.price}, Seller hereby grants, bargains, sells, transfers, conveys, and delivers to Buyer all right, title, and interest in the vessel described herein, free and clear of all liens and encumbrances. Seller warrants lawful ownership and full authority to transfer title.</div>}
      {doc.id==="closing_statement" && (
        <div style={{ fontFamily:"sans-serif" }}>
          {[[`Purchase Price`,D.price],[`Earnest Money (credit)`,`(${D.deposit})`],[`Balance Due at Closing`,fmt(Number(negotiate.agreedPrice||0)-Number(negotiate.deposit||0))]].map(([l,v])=>(
            <div key={l} style={row}><span style={{ fontSize:11 }}>{l}</span><span style={{ fontSize:11, fontWeight:700 }}>{v}</span></div>
          ))}
        </div>
      )}
      <div className="bc-grid2" style={{ marginTop:16, gap:20 }}>
        {["Buyer","Seller"].map(p=>(
          <div key={p} style={{ borderTop:`1px solid ${C.navy}`, paddingTop:6 }}>
            <div style={{ fontSize:10, color:C.slate, fontFamily:"sans-serif" }}>{p} Signature</div>
            <div style={{ fontSize:10, color:C.slate, fontFamily:"sans-serif", marginTop:18 }}>Printed Name / Date</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — CLOSING
// ─────────────────────────────────────────────────────────────────────────────
function StepClosing({ vessel, parties, terms, negotiate, ddData, docsData, myRole, onBack }) {
  const isBuyer = myRole !== "seller";
  const [cleared, setCleared] = useState(false);
  const [manualChecks, setManualChecks] = useState({});
  const [payMethod, setPayMethod] = useState(negotiate.paymentType || "wire");
  const [payMethodOpen, setPayMethodOpen] = useState(true);
  const isRejected = ddData.outcome==="reject";
  const toggleManual = (k) => setManualChecks(c => ({...c,[k]:!c[k]}));

  const balanceDue = Math.max(0, Number(negotiate.agreedPrice||0) - Number(negotiate.deposit||0));
  const escrowLabel = escLabel(negotiate.escrowPath);

  const PAYMENT_METHODS = [
    {
      id:"escrow_com",
      icon:"🏦",
      label:"Escrow.com",
      badge:"Safest",
      badgeColor:C.green,
      shortDesc:"Funds held by a licensed neutral third party until both parties confirm.",
      instructions:[
        "Both buyer and seller must have registered accounts at Escrow.com",
        "Buyer initiates the transaction at escrow.com and enters the agreed purchase price",
        "Seller accepts the transaction in their Escrow.com dashboard",
        "Buyer funds the escrow account by bank wire, check, or credit card per Escrow.com's instructions",
        "Escrow.com holds the funds until seller confirms delivery and buyer accepts the vessel",
        "Once both parties confirm, Escrow.com releases payment to the seller",
        "Escrow.com charges a fee (typically 0.89%–3.25% depending on amount and method)",
      ],
      warning:"BoatClosers has no affiliation with Escrow.com and earns no fees from their service. Deposit return and fund release are governed solely by Escrow.com's terms and the parties' agreement.",
      link:"https://www.escrow.com",
      linkLabel:"Open Escrow.com →",
    },
    {
      id:"wire",
      icon:"🏛️",
      label:"Bank Wire Transfer",
      badge:"Most Common",
      badgeColor:C.teal,
      shortDesc:"Direct bank-to-bank transfer. Fastest and most widely accepted for large transactions.",
      instructions:[
        "Seller provides their bank wiring instructions (account name, routing number, account number, bank address)",
        "Use the Wire Transfer Instructions document in BoatClosers to record and share this information",
        "Buyer initiates the wire through their bank's online portal or in person — typically same-day or next-day",
        "Wire typically $15–35 outgoing fee on buyer's end; seller's bank may charge a receiving fee",
        "Seller confirms receipt of funds in writing before releasing keys or signing Bill of Sale",
        `Recommended: send a test wire of $1 first to verify account details, then send the balance of ${fmt(balanceDue)}`,
        "⚠️ CRITICAL: Always verify wire instructions by phone directly with the seller — wire fraud is common. Never wire based on email instructions alone.",
      ],
      warning:"Wire transfers are generally irreversible. Confirm all details by phone before sending. BoatClosers does not hold, verify, or process wire transfers.",
    },
    {
      id:"cashiers_check",
      icon:"📜",
      label:"Cashier's Check",
      badge:"Simple",
      badgeColor:C.slate,
      shortDesc:"Bank-issued guaranteed check. Good for in-person closings.",
      instructions:[
        "Buyer obtains a cashier's check from their bank made payable to the seller's full legal name",
        "Confirm the exact payee name with the seller in writing before going to the bank",
        `Amount: ${fmt(balanceDue)} (purchase price minus any earnest money already paid)`,
        "Bring the check to the closing location along with all signed documents",
        "Seller may want to verify the check with their bank before releasing the vessel",
        "Best used for in-person closings where both parties meet to exchange documents and keys",
        "Some sellers may request a hold period (1–3 business days) before releasing the vessel",
      ],
      warning:"Cashier's checks can be counterfeited. Sellers should verify with their bank before releasing keys. Not recommended for remote closings.",
    },
    {
      id:"cash",
      icon:"💵",
      label:"Cash",
      badge:"In-Person Only",
      badgeColor:C.brass,
      shortDesc:"Physical currency. Only practical for smaller deals or partial payments.",
      instructions:[
        "Count all bills in the presence of both parties and a witness if possible",
        `Bring exactly ${fmt(balanceDue)} in unmarked, non-sequential bills — or confirm exact amount with seller`,
        "Execute a cash receipt acknowledgment signed by both parties at time of payment",
        "The Closing Statement and Deposit Receipt documents in BoatClosers serve as your paper trail",
        "Consider meeting at a bank branch where cash can be verified and counted by a teller",
        "Not recommended for transactions over $10,000 — federal reporting requirements apply",
        "Both parties should retain a signed copy of the Bill of Sale immediately upon payment",
      ],
      warning:"Cash transactions over $10,000 require the recipient to file IRS Form 8300. BoatClosers recommends consulting a tax professional for large cash transactions.",
    },
    {
      id:"crypto",
      icon:"₿",
      label:"Cryptocurrency",
      badge:"Emerging",
      badgeColor:"#f7931a",
      shortDesc:"Bitcoin, Ethereum, USDC, or other digital currency. Increasingly used for private sales.",
      instructions:[
        "Both parties must agree on the specific cryptocurrency (Bitcoin, Ethereum, USDC stablecoin, etc.)",
        "USDC (USD Coin) is recommended — its value is pegged 1:1 to the US dollar, eliminating price volatility",
        "Buyer sends funds to seller's wallet address — triple-check the address before sending",
        `Amount in crypto must equal ${fmt(balanceDue)} at the agreed exchange rate at time of transfer`,
        "Agree on the exchange rate in writing (e.g. CoinGecko price at 12:00 PM EST on closing date)",
        "Crypto transactions are irreversible — verify the wallet address character by character",
        "Consider a small test transaction first, then the full balance",
        "Record the transaction hash (TXID) as proof of payment — include it in your closing documents",
        "Both parties should be aware of capital gains tax implications for crypto-to-asset exchanges",
      ],
      warning:"Cryptocurrency transactions are irreversible and unregulated. BoatClosers does not process or verify crypto transactions. Consult a tax advisor regarding capital gains implications.",
    },
    {
      id:"financing",
      icon:"🏦",
      label:"Marine Financing",
      badge:"Lender Funded",
      badgeColor:C.navy,
      shortDesc:"Buyer's marine lender wires funds directly to seller or escrow at closing.",
      instructions:[
        "Buyer's lender (bank, credit union, or marine finance company) issues a commitment letter",
        "Lender requires: signed purchase agreement, marine survey, insurance binder, and clear title confirmation",
        "Upload and send these documents to your lender from the Due Diligence step",
        "Lender typically wires funds directly to the seller's bank account or to escrow on closing day",
        "Seller should not release the vessel or keys until wire is confirmed received",
        "Buyer signs all loan documents with lender separately — this is in addition to BoatClosers documents",
        "Typical marine loan closing takes 3–10 business days after all documents are submitted to lender",
        "Lender will require a lien on the vessel — seller must provide a clear title with no existing liens",
      ],
      warning:"BoatClosers is not involved in the lending process. Lender funding is subject to final underwriting approval. Seller should confirm funds received before signing title documents.",
    },
  ];

  if (cleared) return (
    <div style={S.page}>
      <div style={{...S.card, textAlign:"center", padding:"3rem"}}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚓</div>
        <h2 style={S.h2}>Deal Cleared</h2>
        <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, marginBottom:24 }}>This deal has been closed and cleared. You can start a new deal at any time.</p>
        <button style={S.btnBrass} onClick={()=>window.location.reload()}>Start a New Deal</button>
      </div>
    </div>
  );

  const closingDocSections = isRejected ? [
    {
      heading:"Rejection Documents",
      docs:[
        { id:"rejection", label:"Vessel Rejection Notice", desc:"Formally records buyer's rejection and reason. Required to release earnest money.", signed:!!docsData.signedDocs?.rejection },
        { id:"deposit_receipt", label:"Deposit Receipt / Return Confirmation", desc:"Confirms the earnest money deposit amount to be returned to buyer.", signed:!!docsData.signedDocs?.deposit_receipt },
      ]
    }
  ] : [
    {
      heading:"Core Closing Documents",
      desc:"The required documents — signed in the Documents step.",
      docs:[
        { id:"purchase_agreement",  label:"Purchase & Sale Agreement",   desc:"The main binding contract between buyer and seller.", signed:!!docsData.signedDocs?.purchase_agreement },
        { id:"bill_of_sale",        label:"Bill of Sale",                desc:"Transfers legal ownership from seller to buyer.", signed:!!docsData.signedDocs?.bill_of_sale },
        { id:"deposit_receipt",     label:"Earnest Money Deposit Receipt",desc:"Confirms earnest money received and how it applies to the price.", signed:!!docsData.signedDocs?.deposit_receipt },
        { id:"as_is_acknowledgment",label:"As-Is Acknowledgment",        desc:"Buyer accepts the vessel in its present condition per the agreement.", signed:!!docsData.signedDocs?.as_is_acknowledgment },
        { id:"closing_statement",   label:"Closing Statement",           desc:"Final figures: price, deposit credit, and balance due at closing.", signed:!!docsData.signedDocs?.closing_statement },
      ]
    },
    {
      heading:"Due-Diligence Outcome",
      desc:"The result of the survey and inspection period.",
      docs:[
        { id:"acceptance", label:"Vessel Acceptance", desc:"Buyer's formal acceptance of the vessel after due diligence.", signed:!!docsData.signedDocs?.acceptance },
      ]
    },
    {
      heading:"Final Actions",
      desc:"Non-document steps required to complete the transaction.",
      docs:[
        { id:"payment",      label:`Full Payment of ${fmt(negotiate.agreedPrice||0)} Received`, desc:"Buyer has sent and seller has confirmed receipt of the full closing balance.", signed:false, manual:true, manualKey:"payment_received" },
        { id:"keys",         label:"Keys, Manuals & Equipment Delivered",                       desc:"All physical items included in the sale handed over to buyer.", signed:false, manual:true, manualKey:"keys_delivered" },
        { id:"escrow_rel",   label:"Escrow / Deposit Funds Released",                          desc:"Escrow agent or seller has confirmed deposit applied to purchase price.", signed:false, manual:true, manualKey:"escrow_released" },
        { id:"reg_transfer", label:"Registration / Title Filed with State",                    desc:"New owner has submitted title transfer and registration application.", signed:false, manual:true, manualKey:"reg_filed" },
      ]
    }
  ];

  const totalDocs = closingDocSections.flatMap(s=>s.docs);
  const completedCount = totalDocs.filter(d => d.signed || (d.manual && manualChecks[d.manualKey])).length;
  const pct = Math.round((completedCount / totalDocs.length) * 100);
  const selectedMethod = PAYMENT_METHODS.find(m=>m.id===payMethod)||PAYMENT_METHODS[0];

  return (
    <div style={S.page}>
      <div style={{ marginBottom:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={S.h1}>{isRejected ? "Closing — Deal Rejected" : "Final Closing"}</h1>
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>
            {isRejected
              ? `Rejected during due diligence · Earnest money ${fmt(negotiate.deposit||0)} to be returned`
              : `${vessel.year} ${vessel.make} ${vessel.model} · ${fmt(negotiate.agreedPrice)} · Closing ${terms.closingDate||"TBD"}`}
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:22, fontWeight:800, fontFamily:"sans-serif", color: pct===100 ? C.green : C.navy }}>{pct}%</div>
          <div style={{ fontSize:10, fontFamily:"sans-serif", color:C.slate }}>{completedCount}/{totalDocs.length} complete</div>
        </div>
      </div>

      <div style={{ height:5, background:C.mist, borderRadius:3, marginBottom:20, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background: pct===100 ? C.green : C.brass, borderRadius:3, transition:"width 0.4s" }}/>
      </div>

      {!isRejected && (
        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:240, border:`2px solid ${isBuyer?C.brass:C.mist}`, borderRadius:8, padding:"12px 14px", background: isBuyer?"#fff9ee":"#fff" }}>
            <div style={{ fontSize:12, fontWeight:800, fontFamily:"sans-serif", color:C.navy, marginBottom:6 }}>
              🧑‍💼 Buyer's Closing Steps {isBuyer && <span style={{ ...S.pill, background:C.brass, color:C.navy, marginLeft:6 }}>You</span>}
            </div>
            <ul style={{ margin:0, paddingLeft:16, fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.8 }}>
              <li>Verify the seller's wire/escrow details by phone</li>
              <li>Send the balance due ({fmt(balanceDue)})</li>
              <li>Confirm receipt of signed Bill of Sale & title</li>
              <li>Take possession of the vessel and keys</li>
            </ul>
          </div>
          <div style={{ flex:1, minWidth:240, border:`2px solid ${!isBuyer?C.brass:C.mist}`, borderRadius:8, padding:"12px 14px", background: !isBuyer?"#fff9ee":"#fff" }}>
            <div style={{ fontSize:12, fontWeight:800, fontFamily:"sans-serif", color:C.navy, marginBottom:6 }}>
              ⚓ Seller's Closing Steps {!isBuyer && <span style={{ ...S.pill, background:C.brass, color:C.navy, marginLeft:6 }}>You</span>}
            </div>
            <ul style={{ margin:0, paddingLeft:16, fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.8 }}>
              <li>Provide verified wire/escrow instructions</li>
              <li>Sign and deliver the Bill of Sale</li>
              <li>Transfer title and registration documents</li>
              <li>Hand over keys once funds are confirmed</li>
            </ul>
          </div>
        </div>
      )}

      {isRejected && (
        <div style={{ marginBottom:20 }}>
          <RejectionNotice
            rejection={negotiate.vesselRejection || { reasons: ddData.rejectionReasons || (ddData.rejectionReason?[ddData.rejectionReason]:[]), notes: ddData.rejectionNotes, solution: ddData.rejSolution, sig: ddData.rejSigName || parties.buyer.name || "Buyer", date: today() }}
            escrowPath={(negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.escrowPath}
            viewerRole={isBuyer?"buyer":"seller"}
            vessel={vessel}
          />
        </div>
      )}

      {/* ── FINAL PAYMENT SECTION ── */}
      {!isRejected && (
        <div style={{ marginBottom:20 }}>
          <div
            onClick={()=>setPayMethodOpen(v=>!v)}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", background:C.navy, borderRadius: payMethodOpen ? "8px 8px 0 0" : 8, padding:"12px 16px" }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>💰</span>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:C.brass, fontFamily:"sans-serif" }}>Final Payment — {fmt(balanceDue)}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontFamily:"sans-serif" }}>
                  {selectedMethod.icon} {selectedMethod.label} selected · Click to {payMethodOpen?"collapse":"expand"} instructions
                </div>
              </div>
            </div>
            <span style={{ color:"rgba(255,255,255,0.5)", fontSize:14 }}>{payMethodOpen?"▲":"▼"}</span>
          </div>

          {payMethodOpen && (
            <div style={{ border:`1px solid ${C.mist}`, borderTop:"none", borderRadius:"0 0 8px 8px", overflow:"hidden" }}>
              {/* Balance summary */}
              <div className="bc-grid3" style={{ background:C.sandDark, padding:"10px 16px", gap:10 }}>
                {[
                  ["Purchase Price", fmt(negotiate.agreedPrice||0)],
                  ["Deposit Paid", `− ${fmt(negotiate.deposit||0)}`],
                  ["Balance Due", fmt(balanceDue)],
                ].map(([l,v])=>(
                  <div key={l} style={{ background:"#fff", borderRadius:5, padding:"8px 12px" }}>
                    <div style={{ fontSize:10, color:C.slate, fontFamily:"sans-serif" }}>{l}</div>
                    <div style={{ fontSize:15, fontWeight:700, color: l==="Balance Due"?C.navy:C.slate }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Method picker */}
              <div style={{ padding:"14px 16px", background:"#fff", borderBottom:`1px solid ${C.mist}` }}>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>Select Payment Method</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {PAYMENT_METHODS.map(m=>(
                    <button key={m.id} onClick={()=>setPayMethod(m.id)}
                      style={{ padding:"10px 6px", borderRadius:6, cursor:"pointer", textAlign:"center", fontFamily:"sans-serif", border:`2px solid ${payMethod===m.id?m.badgeColor:C.mist}`, background: payMethod===m.id ? `${m.badgeColor}14` : "transparent" }}>
                      <div style={{ fontSize:18, marginBottom:3 }}>{m.icon}</div>
                      <div style={{ fontSize:11, fontWeight:700, color: payMethod===m.id?m.badgeColor:C.navy, lineHeight:1.2 }}>{m.label}</div>
                      <div style={{ fontSize:9, color:C.slate, marginTop:2, fontFamily:"sans-serif" }}>{m.badge}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected method instructions */}
              <div style={{ padding:"16px", background:"#fff" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:22 }}>{selectedMethod.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>{selectedMethod.label}</div>
                    <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate }}>{selectedMethod.shortDesc}</div>
                  </div>
                  {selectedMethod.link && (
                    <a href={selectedMethod.link} target="_blank" rel="noopener noreferrer"
                      style={{ marginLeft:"auto", background:C.green, color:"#fff", borderRadius:5, padding:"6px 14px", fontSize:11, fontFamily:"sans-serif", fontWeight:700, textDecoration:"none" }}>
                      {selectedMethod.linkLabel}
                    </a>
                  )}
                </div>

                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:6 }}>Step-by-step instructions:</div>
                  {selectedMethod.instructions.map((inst,i)=>(
                    <div key={i} style={{ display:"flex", gap:10, marginBottom:7, alignItems:"flex-start" }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", background:C.navy, color:C.brass, fontSize:10, fontWeight:700, fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</div>
                      <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.text, lineHeight:1.6 }}>{inst}</div>
                    </div>
                  ))}
                </div>

                {selectedMethod.warning && (
                  <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:5, padding:"9px 12px", fontSize:11, fontFamily:"sans-serif", color:"#7a5500", lineHeight:1.6 }}>
                    ⚠️ {selectedMethod.warning}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document sections */}
      {closingDocSections.map((section, si) => (
        <div key={si} style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:6 }}>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>{section.heading}</div>
            {section.desc && <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate }}>{section.desc}</div>}
          </div>
          <div style={S.card}>
            {section.docs.map((doc, di) => {
              const isComplete = doc.signed || (doc.manual && manualChecks[doc.manualKey]);
              return (
                <div key={doc.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 0", borderBottom: di < section.docs.length-1 ? `1px solid ${C.mist}` : "none" }}>
                  {doc.manual ? (
                    <input type="checkbox" checked={!!manualChecks[doc.manualKey]} onChange={()=>toggleManual(doc.manualKey)}
                      style={{ width:18, height:18, marginTop:2, cursor:"pointer", accentColor:C.navy, flexShrink:0 }} />
                  ) : (
                    <div style={{ width:20, height:20, borderRadius:"50%", background: isComplete ? C.green : C.mist, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                      {isComplete ? <span style={{ color:"#fff", fontSize:11 }}>✓</span> : <span style={{ color:C.slate, fontSize:9 }}>–</span>}
                    </div>
                  )}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:600, color: isComplete ? C.green : C.navy }}>{doc.label}</div>
                    <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginTop:2 }}>{doc.desc}</div>
                    {!isComplete && !doc.manual && <div style={{ fontSize:10, fontFamily:"sans-serif", color:C.brass, marginTop:3 }}>→ Go to Documents step to sign</div>}
                    {doc.manual && !manualChecks[doc.manualKey] && <div style={{ fontSize:10, fontFamily:"sans-serif", color:C.slate, marginTop:3 }}>Check when complete</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary card */}
      <div style={{...S.card, background:C.navy, color:"#fff", marginTop:4}}>
        <h3 style={{...S.h3, color:C.brass}}>Transaction Summary</h3>
        <div style={{ fontSize:12, fontFamily:"sans-serif", lineHeight:2.2 }}>
          <div>⚓ <strong>Vessel:</strong> {vessel.year} {vessel.make} {vessel.model} — HIN {vessel.hin||"Not entered"}</div>
          <div>💰 <strong>Price:</strong> {fmt(negotiate.agreedPrice)}</div>
          <div>💳 <strong>Payment Method:</strong> {selectedMethod?.icon} {selectedMethod?.label}</div>
          <div>👤 <strong>Buyer:</strong> {parties.buyer.name||"—"} · {parties.buyer.email||"—"}</div>
          <div>👤 <strong>Seller:</strong> {parties.seller.name||"—"} · {parties.seller.email||"—"}</div>
          <div>📅 <strong>Closing:</strong> {terms.closingDate||"TBD"}</div>
          <div>📋 <strong>Status:</strong> {isRejected ? "Rejected — Earnest Money Return Pending" : pct===100 ? "✓ All closing items complete" : `In Progress — ${pct}% complete`}</div>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back to Documents</button>
        <button style={{...S.btnOutline, color:C.red, borderColor:C.red}} onClick={()=>setCleared(true)}>
          Clear Deal & Start Fresh
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function Welcome({ name, onStart, onSignOut }) {
  const steps = [
    ["1", "Describe the boat", "Add the vessel details — make, model, year, hull number."],
    ["2", "Invite the other party", "Send the buyer or seller a link to join the deal."],
    ["3", "Negotiate", "Trade offers and counters in the Deal Room until you agree."],
    ["4", "Sign", "Both parties e-sign the Purchase Agreement and required documents."],
    ["5", "Close", "Handle the deposit, balance, and title transfer — deal done."],
  ];
  return (
    <div style={{ minHeight:"100vh", background:C.navy, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"1.5rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(184,134,58,0.2)" }}>
        <div>
          <div style={{ ...S.logo, fontSize:20 }}>BOATCLOSERS</div>
          <div style={{ ...S.logoSub }}>PRIVATE VESSEL TRANSACTIONS</div>
        </div>
        {onSignOut && <button onClick={onSignOut} style={{ fontSize:11, color:"rgba(255,255,255,0.55)", background:"rgba(255,255,255,0.07)", border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif" }}>Sign Out</button>}
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ background:"#fff", borderRadius:10, padding:"2.5rem", width:"100%", maxWidth:520, border:"1px solid rgba(184,134,58,0.2)" }}>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:25, color:C.navy, margin:"0 0 6px" }}>Welcome{name ? `, ${String(name).split(" ")[0]}` : ""}.</h1>
          <p style={{ fontFamily:"sans-serif", fontSize:14, color:C.slate, lineHeight:1.6, margin:"0 0 22px" }}>
            BoatClosers walks you and the other party through a private boat sale — start to finish — for one flat fee. Here's the path:
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:26 }}>
            {steps.map(([n, title, desc]) => (
              <div key={n} style={{ display:"flex", gap:13, alignItems:"flex-start" }}>
                <div style={{ flexShrink:0, width:26, height:26, borderRadius:"50%", background:C.navy, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontFamily:"sans-serif", fontWeight:700 }}>{n}</div>
                <div>
                  <div style={{ fontFamily:"sans-serif", fontSize:14, fontWeight:700, color:C.navy }}>{title}</div>
                  <div style={{ fontFamily:"sans-serif", fontSize:12.5, color:C.slate, lineHeight:1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onStart} style={{ ...S.btn, width:"100%", padding:"13px 0", fontSize:15, fontWeight:700 }}>Start your deal →</button>
          <p style={{ fontFamily:"sans-serif", fontSize:11.5, color:C.slate, textAlign:"center", margin:"14px 0 0" }}>You can revisit any step at any time — nothing is locked until you sign.</p>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth, prefillEmail, notice, defaultMode }) {
  const [mode, setMode] = useState(defaultMode || "signup");
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail || "");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = mode==="login" ? (email && pw) : (role && name && email && pw);

  const submit = async () => {
    if (!canSubmit || loading) return;
    if (pw.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode === "signup" ? "signup" : "signin",
          email, password: pw, fullName: name, role: role || "buyer"
        })
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      onAuth({
        name: result.user.fullName || name || email,
        email: result.user.email,
        role: result.user.role || role || "buyer",
        userId: result.user.id,
        token: result.token,
        mode
      });
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.navy, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"1.5rem 2rem", display:"flex", alignItems:"center", justifyContent:"center", borderBottom:"1px solid rgba(184,134,58,0.2)" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ ...S.logo, fontSize:22 }}>BOATCLOSERS</div>
          <div style={{ ...S.logoSub, color:"rgba(255,255,255,0.35)" }}>PRIVATE VESSEL TRANSACTIONS</div>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ background:"#fff", borderRadius:10, padding:"2.5rem", width:"100%", maxWidth:420, border:`1px solid rgba(184,134,58,0.2)` }}>
          {notice && (
            <div style={{ background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:8, padding:"11px 14px", marginBottom:18, fontSize:13, fontFamily:"sans-serif", color:"#7a5500", lineHeight:1.5 }}>
              🔐 {notice}
            </div>
          )}
          <div style={{ display:"flex", borderRadius:6, overflow:"hidden", border:`1px solid ${C.mist}`, marginBottom:24 }}>
            {[["signup","Create Account"],["login","Sign In"]].map(([m,l])=>(
              <button key={m} onClick={()=>{ setMode(m); setError(""); }} style={{ flex:1, padding:"9px", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer", background:mode===m?C.navy:"transparent", color:mode===m?"#fff":C.slate, border:"none" }}>{l}</button>
            ))}
          </div>
          {mode==="signup" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:600, color:C.navy, marginBottom:10 }}>I am the...</div>
              <div className="bc-grid2" style={{ gap:10 }}>
                {[["buyer","🛒 Buyer","I am purchasing a vessel"],["seller","⚓ Seller","I own the vessel being sold"]].map(([r,l,d])=>(
                  <button key={r} onClick={()=>setRole(r)} style={{ padding:"14px 10px", borderRadius:6, cursor:"pointer", textAlign:"center", background:role===r?C.navy:"transparent", color:role===r?"#fff":C.navy, border:`2px solid ${role===r?C.brass:C.mist}`, fontFamily:"sans-serif" }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{l.split(" ")[0]}</div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{l.split(" ").slice(1).join(" ")}</div>
                    <div style={{ fontSize:11, color:role===r?"rgba(255,255,255,0.65)":C.slate, marginTop:3 }}>{d}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode==="signup" && (
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Full Name</label>
              <input style={S.input} value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" />
            </div>
          )}
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Email Address</label>
            <input style={S.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div style={{ marginBottom:6 }}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Minimum 6 characters" onKeyDown={e=>e.key==="Enter"&&submit()} />
          </div>
          {error && <div style={{ fontSize:12, color:C.red, fontFamily:"sans-serif", marginBottom:10, marginTop:8 }}>{error}</div>}
          <button style={{...S.btnBrass, width:"100%", marginTop:16, fontSize:14, padding:"12px", opacity:loading?0.6:1}} disabled={!canSubmit||loading} onClick={submit}>
            {loading ? "Please wait..." : mode==="signup" ? "Create Account & Start Deal" : "Sign In"}
          </button>
          <div style={{ marginTop:16, textAlign:"center", fontSize:12, fontFamily:"sans-serif", color:C.slate }}>
            {mode==="signup" ? "Already have an account? " : "New here? "}
            <span style={{ color:C.teal, cursor:"pointer", fontWeight:600 }} onClick={()=>{ setMode(mode==="signup"?"login":"signup"); setError(""); }}>
              {mode==="signup"?"Sign in":"Create account"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  // Pull the real library so counts never go stale.
  const groupOrder = [...new Set(DOCUMENTS.map(d=>d.group))];
  const docGroups = groupOrder.map(g => ({ group:g, count: DOCUMENTS.filter(d=>d.group===g).length }));
  const DOC_COUNT = DOCUMENTS.length;
  const CAT_COUNT = groupOrder.length;

  const GROUP_BLURB = {
    "Closing Instruments": "The core contract, bill of sale, and settlement every sale needs.",
    "Due-Diligence Outcomes": "Accept the boat, renegotiate after survey, or walk away.",
    "Title & Government": "The documents to transfer ownership and registration to the buyer.",
    "Financing & Insurance": "For financed buyers and lender/insurer requirements.",
    "Authority & Signing": "Businesses, co-owners, trusts, and power of attorney.",
    "Deal Structures": "Trade-ins, seller financing, trailers, and gift transfers.",
    "Estate & Inheritance": "Sell or transfer a boat after the owner has passed.",
    "Title Problems": "Lost titles, missing documentation, and registration issues.",
    "Closing-Day": "The handoff: delivery, disclosures, and engine hours.",
  };

  const features = [
    { icon:"📜", title:`${DOC_COUNT} Documents for Every Situation`, desc:"Purchase agreement to title transfer — plus estate sales, loans, lost titles, and documented vessels." },
    { icon:"🎯", title:"Smart Document Selection", desc:"Tell us about your deal; see only the documents you actually need." },
    { icon:"🧭", title:"Guided Closing Checklist", desc:"A step-by-step checklist takes both sides from agreement to filed title transfer." },
    { icon:"💬", title:"Deposit-Backed Offers", desc:"Real offers with earnest money attached — and the boat locked so it can't be sold out from under you." },
    { icon:"✍️", title:"E-Sign — Notary-Aware", desc:"Sign routine documents electronically; notary-required affidavits are clearly flagged." },
    { icon:"🤝", title:"Flat $249 — No Commission", desc:"One flat fee per deal. No broker commission, no subscription, no surprises." },
  ];

  const steps = [
    ["Enter Vessel Details","Year, make, HIN, engines, registration — the foundation for every document."],
    ["Add Both Parties","Buyer and seller details. Invite the other side by email to join free."],
    ["Set Price & Terms","Make offers, choose contingencies, and set the due-diligence window and closing date — together."],
    ["Complete Due Diligence","Survey, title and lien search, sea trial, and insurance — with a built-in renegotiation window."],
    ["Pay & Sign","$249 unlocks all "+DOC_COUNT+" documents. Sign electronically; print-and-notarize where the law requires it."],
    ["Close & File for Title","A final checklist walks both parties through payment, handoff, and the paperwork to file the title and registration transfer with your state or the Coast Guard."],
  ];

  const situations = [
    { icon:"🛥️", title:"Selling to a private buyer", desc:"You found the buyer; we handle the agreement, title transfer, and closing." },
    { icon:"🔍", title:"Buying a boat privately", desc:"Protect your payment through escrow and get the paperwork right before you commit." },
    { icon:"🕊️", title:"You inherited a boat", desc:"Sell or transfer after the owner has passed, with estate-specific documents." },
    { icon:"💵", title:"The boat still has a loan", desc:"Clear the seller's loan and liens so clean title passes at closing." },
    { icon:"📄", title:"Lost or missing title", desc:"Affidavits and step-by-step paths to fix lost titles and registration gaps." },
    { icon:"⚓", title:"Coast Guard documented vessel", desc:"Transfer federal documentation through the NVDC with the correct forms." },
    { icon:"🤝", title:"Seller financing or a trade-in", desc:"Promissory notes, security agreements, and trade-in paperwork done right." },
    { icon:"🏢", title:"Business, co-owner, or power of attorney", desc:"Authority documents ready when someone other than a sole owner signs." },
  ];

  const secure = [
    { icon:"🎯", title:"Real offers, not noise", desc:"Offers come backed by an earnest-money deposit, so sellers can tell a committed buyer from a tire-kicker." },
    { icon:"🔒", title:"Lock it so nobody walks", desc:"Once both sides agree, a signed purchase agreement and deposit lock the deal — no ghosting, no selling out from under you." },
    { icon:"🏦", title:"Move money safely — even remotely", desc:"Funds route through escrow so neither party wires thousands to a stranger. Money releases only when the deal is done." },
  ];

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 760 : false);
  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth < 760);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  const cols = (n) => isMobile ? "1fr" : Array(n).fill("1fr").join(" ");

  const Section = ({ children, style }) => <div style={{ maxWidth:880, margin:"0 auto", padding:"4.5rem 2rem", ...style }}>{children}</div>;

  return (
    <div style={{ fontFamily:"'Georgia','Times New Roman',serif", background:C.sand, color:C.text, minHeight:"100vh" }}>
      {/* Nav */}
      <nav style={{ background:C.navy, padding:"0 2.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, borderBottom:`1px solid rgba(184,134,58,0.3)`, position:"sticky", top:0, zIndex:100 }}>
        <div>
          <div style={S.logo}>BOATCLOSERS</div>
          <div style={{ fontSize:8, color:"rgba(255,255,255,0.35)", letterSpacing:3, fontFamily:"sans-serif", textTransform:"uppercase" }}>Private Vessel Transactions</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ ...S.btnOutline, color:"rgba(255,255,255,0.7)", borderColor:"rgba(255,255,255,0.2)", fontSize:12, padding:"7px 16px" }} onClick={onStart}>Sign In</button>
          <button style={{ ...S.btnBrass, fontSize:12, padding:"7px 18px" }} onClick={onStart}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy2} 55%, #0e3a52 100%)`, color:"#fff", padding:"6rem 2rem 4.5rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`repeating-linear-gradient(90deg, ${C.brass} 0px, ${C.brass} 12px, transparent 12px, transparent 20px)`, opacity:0.4 }} />
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"inline-block", background:"rgba(184,134,58,0.15)", border:`1px solid rgba(184,134,58,0.4)`, borderRadius:20, padding:"5px 16px", fontSize:11, letterSpacing:2, color:C.brass2, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:24 }}>
            Private Boat Transactions · Done Right
          </div>
          <h1 style={{ fontSize:46, fontWeight:800, lineHeight:1.12, marginBottom:20, fontFamily:"'Georgia',serif" }}>
            Buy or Sell a Boat<br/>
            <span style={{ color:C.brass2 }}>With Total Confidence</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.74)", lineHeight:1.75, marginBottom:34, fontFamily:"sans-serif", fontWeight:300 }}>
            Professional-grade tools once reserved for yacht brokers — now in the hands of any private buyer or seller. <strong style={{ color:"#fff", fontWeight:600 }}>No broker, no commission — just $249.</strong>
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button style={{...S.btnBrass, fontSize:15, padding:"13px 32px"}} onClick={onStart}>Start as Buyer</button>
            <button style={{ ...S.btnOutline, color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.3)", fontSize:15, padding:"13px 32px", borderRadius:5 }} onClick={onStart}>Start as Seller</button>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:16, fontFamily:"sans-serif" }}>Free to start · Pay $249 only when you're ready to sign</div>
        </div>
      </header>

      {/* Trust bar */}
      <div style={{ background:C.navy2, borderTop:`1px solid rgba(184,134,58,0.2)`, borderBottom:`1px solid rgba(184,134,58,0.2)`, padding:"1rem 2rem" }}>
        <div style={{ maxWidth:880, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"10px 28px", fontSize:12.5, fontFamily:"sans-serif", color:"rgba(255,255,255,0.7)" }}>
          <span>⚓ Built for real private boat deals</span>
          <span>📜 {DOC_COUNT} documents, {CAT_COUNT} categories</span>
          <span>💵 Flat $249 — not 10% commission</span>
          <span>🔒 We never touch your money</span>
        </div>
      </div>

      {/* Problem / Solution */}
      <Section style={{ textAlign:"center" }}>
        <div style={{ fontSize:11, letterSpacing:3, color:C.brass, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:14 }}>The Problem</div>
        <h2 style={{ fontSize:29, marginBottom:16 }}>A boat deal shouldn't cost you $8,500 in commission.</h2>
        <p style={{ fontSize:15, fontFamily:"sans-serif", color:C.slate, lineHeight:1.85, maxWidth:660, margin:"0 auto 36px" }}>
          On an $85,000 boat, a broker's 10% is around <strong style={{ color:C.navy }}>$8,500</strong> — for paperwork and coordination a motivated buyer and seller can handle themselves. And if your situation is anything but ordinary — an inherited boat, a loan still owed, a lost title — most people have nowhere to turn at all. The hard part was never the deal. It's the documents, the title paperwork, the escrow, and the fear of missing a step that costs you later.
        </p>
        <div style={{ fontSize:11, letterSpacing:3, color:C.brass, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:14 }}>The Solution</div>
        <h2 style={{ fontSize:29, marginBottom:16 }}>Every document, every step — for a flat $249.</h2>
        <p style={{ fontSize:15, fontFamily:"sans-serif", color:C.slate, lineHeight:1.85, maxWidth:660, margin:"0 auto" }}>
          BoatClosers gives you the exact paperwork and closing process used in professional vessel sales — the purchase agreement, the title-transfer documents, escrow options, and a guided due-diligence and closing checklist. Every step reflects real private boat closings, including the messy ones most DIY templates ignore. You stay in control of your own deal — and you keep the commission.
        </p>
      </Section>

      {/* Features */}
      <Section style={{ paddingTop:"1.5rem" }}>
        <h2 style={{ textAlign:"center", fontSize:30, marginBottom:8 }}>Everything You Need to Close a Boat Sale</h2>
        <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:40 }}>From the first offer to the final signature, every part of the deal is built in.</p>
        <div style={{ display:"grid", gridTemplateColumns:cols(3), gap:24 }}>
          {features.map(f=>(
            <div key={f.title} style={{ background:C.white, borderRadius:8, padding:"1.5rem", border:`0.5px solid ${C.mist}` }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{f.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.navy, marginBottom:6 }}>{f.title}</h3>
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Whatever your situation */}
      <div style={{ background:C.sandDark, padding:"4.5rem 2rem" }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:30, marginBottom:8 }}>Whatever Your Situation, There's a Path Through It</h2>
          <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:40, maxWidth:640, marginLeft:"auto", marginRight:"auto" }}>
            BoatClosers isn't only for skipping a broker. It's built for the full range of private vessel transfers — including the complicated ones almost nobody else helps with.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:cols(2), gap:16 }}>
            {situations.map(s=>(
              <div key={s.title} style={{ display:"flex", gap:13, background:C.white, borderRadius:8, padding:"1.25rem 1.4rem", border:`0.5px solid ${C.mist}` }}>
                <div style={{ fontSize:22, flexShrink:0, lineHeight:1.3 }}>{s.icon}</div>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:4 }}>{s.title}</h3>
                  <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center", fontSize:13, fontFamily:"sans-serif", color:C.slate, marginTop:28 }}>
            Don't see your exact situation? With {DOC_COUNT} documents across {CAT_COUNT} categories, the odds are it's covered — and the app shows you only what your deal needs.
          </p>
        </div>
      </div>

      {/* Secure the deal */}
      <div style={{ background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy2} 100%)`, padding:"5rem 2rem" }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <div style={{ fontSize:11, letterSpacing:3, color:C.brass2, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:14 }}>The Part Everyone Gets Wrong</div>
            <h2 style={{ fontSize:30, color:"#fff", marginBottom:16 }}>Secure the Deal — So Nobody Loses the Boat or the Money</h2>
            <p style={{ fontSize:15, fontFamily:"sans-serif", color:"rgba(255,255,255,0.72)", lineHeight:1.8, maxWidth:660, margin:"0 auto" }}>
              The riskiest part of a private boat sale isn't the price — it's the handshake that was never binding, the lowball offers with no commitment behind them, and the stranger you're about to wire money to. BoatClosers makes the commitment real, for both buyer and seller.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:cols(3), gap:18 }}>
            {secure.map(s=>(
              <div key={s.title} style={{ background:"rgba(255,255,255,0.05)", border:`1px solid rgba(184,134,58,0.3)`, borderRadius:9, padding:"1.6rem 1.4rem" }}>
                <div style={{ fontSize:26, marginBottom:12 }}>{s.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:8 }}>{s.title}</h3>
                <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.66)", lineHeight:1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center", fontSize:13, fontFamily:"sans-serif", color:"rgba(255,255,255,0.5)", marginTop:30 }}>
            One binding offer, one deposit, one secure path for the funds — that's the difference between a deal that closes and a deal that falls apart.
          </p>
        </div>
      </div>

      {/* How it works */}
      <Section>
        <h2 style={{ textAlign:"center", fontSize:30, marginBottom:8 }}>How It Works</h2>
        <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:40 }}>Six clear steps from first offer to a clean close.</p>
        <div style={{ display:"grid", gridTemplateColumns:cols(2), gap:16 }}>
          {steps.map(([title,desc],i)=>(
            <div key={i} style={{ display:"flex", gap:14, background:C.white, borderRadius:7, padding:"1.25rem", border:`0.5px solid ${C.mist}` }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:C.navy, color:C.brass2, fontWeight:800, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"sans-serif" }}>{i+1}</div>
              <div>
                <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:4 }}>{title}</h3>
                <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Document library */}
      <div style={{ background:C.sandDark, padding:"4.5rem 2rem" }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:30, marginBottom:8 }}>{DOC_COUNT} Professional Documents, {CAT_COUNT} Categories</h2>
          <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:40, maxWidth:620, marginLeft:"auto", marginRight:"auto" }}>
            Every document auto-fills with your deal data and is organized by exactly when you need it. Your deal only shows the categories that apply to it.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:cols(3), gap:16 }}>
            {docGroups.map(({group,count})=>(
              <div key={group} style={{ background:C.white, borderRadius:8, padding:"1.1rem 1.25rem", border:`0.5px solid ${C.mist}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5 }}>
                  <h3 style={{ fontSize:13.5, fontWeight:700, color:C.navy }}>{group}</h3>
                  <span style={{ fontSize:11, fontFamily:"sans-serif", fontWeight:700, color:C.brass }}>{count}</span>
                </div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>{GROUP_BLURB[group]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background:C.navy, padding:"5rem 2rem" }}>
        <div style={{ maxWidth:460, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:30, color:"#fff", marginBottom:8 }}>Simple, Honest Pricing</h2>
          <p style={{ fontSize:14, fontFamily:"sans-serif", color:"rgba(255,255,255,0.55)", marginBottom:36 }}>No commissions. No subscription. No surprises.</p>
          <div style={{ background:"rgba(255,255,255,0.05)", border:`2px solid ${C.brass}`, borderRadius:12, padding:"2.5rem" }}>
            <div style={{ fontSize:11, letterSpacing:3, color:C.brass, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:10 }}>Per Transaction</div>
            <div style={{ fontSize:56, fontWeight:800, color:"#fff", fontFamily:"sans-serif", lineHeight:1 }}>$249</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:24, fontFamily:"sans-serif" }}>Flat fee · One vessel · One deal</div>
            <div style={{ textAlign:"left", fontSize:13, fontFamily:"sans-serif", lineHeight:2.2, color:"rgba(255,255,255,0.75)" }}>
              {[`All ${DOC_COUNT} professional documents, ${CAT_COUNT} categories`,"Smart selection — see only what your deal needs","Electronic signatures for both parties","Title-transfer & registration paperwork","Full negotiation, offers & contingencies","Three escrow path options","Due-diligence & closing checklists","PDF download package — both parties","No commission, no subscription, ever"].map(f=>(
                <div key={f}>✓ {f}</div>
              ))}
            </div>
            <button style={{...S.btnBrass, marginTop:24, fontSize:15, padding:"13px", width:"100%"}} onClick={onStart}>
              Start Free — Pay When Ready
            </button>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:12, fontFamily:"sans-serif" }}>vs. broker commission: typically $4,000–$15,000+</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <Section style={{ maxWidth:720 }}>
        <h2 style={{ textAlign:"center", fontSize:28, marginBottom:36 }}>Common Questions</h2>
        {[
          ["How do I sell a boat without a broker?","Enter your vessel and both parties, negotiate the price and terms, complete due diligence, then pay $249 to unlock and sign every document the sale needs. BoatClosers gives you the same professional paperwork and closing process a yacht broker uses — you simply run it yourself and keep the commission."],
          ["What documents do I need to sell a boat privately?","At minimum a purchase agreement, bill of sale, and the title-transfer documents — plus a deposit receipt, as-is acknowledgment, and closing statement. Depending on the deal you may also need financing, insurance, estate, or lost-title documents. BoatClosers includes all "+DOC_COUNT+" and shows you exactly which ones your deal requires."],
          ["How do I make an offer on a boat I found on Facebook Marketplace or Craigslist?","Start a deal in BoatClosers, enter the vessel, and send a structured offer with an earnest-money deposit attached. Unlike a comment or a text, a deposit-backed offer shows the seller you're serious and creates a recorded paper trail — and once accepted, a signed agreement locks the boat in so it can't be sold to someone else."],
          ["How do I keep a seller from selling the boat to someone else after we agree?","This is one of the most common ways private deals fall apart. The fix is to secure it: the moment both sides agree, a signed purchase agreement plus an earnest-money deposit binds the deal. The seller can no longer walk to another buyer without consequence, and the buyer can't be left empty-handed after turning others away."],
          ["Is it safe to buy a boat remotely from another state?","Yes, when the money is handled correctly. BoatClosers keeps the whole negotiation and signing remote, and routes funds through escrow — Escrow.com, a private attorney, or another verified path — so you never wire thousands to a stranger on faith. The funds release only when the deal is complete."],
          ["Are these documents legally binding?","Our templates follow recognized maritime and state-transfer standards, but enforceability depends on how accurately you complete them and on your state's requirements. We flag the documents that must be notarized, and we strongly recommend a local maritime attorney review anything involving financing, estates, or title problems before signing."],
          ["How does title transfer work for a Coast Guard documented vessel?","Documented vessels transfer through the National Vessel Documentation Center rather than the state. BoatClosers includes the USCG transfer and documentation forms and walks you through requesting the vessel's abstract of title from the Coast Guard."],
          ["What if the seller still owes money on the boat?","The deal includes a payoff authorization and lien release so the seller's existing loan is cleared from the title at closing — letting clean title pass to the buyer. The buyer should confirm the lien is released before final payment."],
          ["What if I inherited a boat I want to sell?","BoatClosers includes an estate and inheritance section with a plain-language guide plus affidavit of heirship, executor authorization, and small-estate forms. Estate rules vary by state, so the app points you to when a probate attorney is needed."],
          ["Who pays the $249 fee?","Whoever starts the deal pays the flat fee and controls the vessel details and terms. The other party joins free to review, add their information, and sign."],
          ["What escrow options do I have, and do you hold the money?","You choose: Escrow.com (a licensed third party, recommended), a direct wire to the seller, or a private attorney. BoatClosers never holds, touches, or releases funds."],
          ["What if the deal falls through?","If the buyer formally rejects during due diligence, the earnest money is returned and the reason is recorded in a Rejection Notice. BoatClosers does not hold or release any funds."],
        ].map(([q,a])=>(
          <div key={q} style={{ borderBottom:`1px solid ${C.mist}`, padding:"16px 0" }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.navy, marginBottom:8 }}>{q}</h3>
            <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7 }}>{a}</div>
          </div>
        ))}
      </Section>

      {/* CTA */}
      <div style={{ background:C.teal, padding:"4rem 2rem", textAlign:"center" }}>
        <h2 style={{ fontSize:28, color:"#fff", marginBottom:10 }}>Ready to Close Your Boat Deal?</h2>
        <p style={{ fontSize:14, fontFamily:"sans-serif", color:"rgba(255,255,255,0.8)", marginBottom:28 }}>Create your free account, enter your deal, and pay only when you're ready to sign. Keep the commission for yourself.</p>
        <button style={{...S.btnBrass, fontSize:15, padding:"13px 36px"}} onClick={onStart}>Get Started — It's Free</button>
      </div>

      {/* Footer */}
      <footer style={{ background:C.navy, padding:"2rem 2.5rem" }}>
        <div style={{ maxWidth:880, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={S.logo}>BOATCLOSERS</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"sans-serif", marginTop:4 }}>© {new Date().getFullYear()} BoatClosers.com · Buy or sell a boat without a broker · All rights reserved</div>
          </div>
          <div style={{ fontSize:10, fontFamily:"sans-serif", color:"rgba(255,255,255,0.3)", lineHeight:1.8, maxWidth:420, textAlign:"right" }}>
            BoatClosers is a document facilitation platform only. Not a broker, escrow agent, or attorney. Not a party to any transaction. All parties are solely responsible for their own deal outcomes. Consult a licensed maritime attorney for legal advice.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
const emptyVessel = {name:"",year:"",make:"",model:"",hin:"",hullType:"",loa:"",beam:"",engineCount:"1",engineMake:"",engineModel:"",engineHours:"",engineSerial:"",fuelType:"Gasoline",regNumber:"",regState:"",uscgNumber:"",trailerIncluded:"no",trailerVin:"",trailerState:"",askingPrice:"",location:"",description:""};
const emptyParties = {buyer:{name:"",email:"",phone:"",address:"",city:"",stateZip:""},seller:{name:"",email:"",phone:"",address:"",city:"",stateZip:""}};
const emptyNeg = {offers:[],messages:[],agreedPrice:"",escrowPct:0,escrowPath:"escrow_com",deposit:0,dueDiligenceDays:"10",ddStartDate:"",closingDate:""};
const emptyDD = {survey:false,title:false,insurance:false,seatrial:false,engines:false,electronics:false,ddNotes:"",outcome:null,rejectionReason:"",rejectionReasons:[],rejectionNotes:"",rejSolution:"",rejSigName:""};
const emptyDocs = {paid:false,signedDocs:{}};

export default function BoatClosers() {
  const [screen, setScreen] = useState("landing");
  const [toast, setToast] = useState(null);
  const seenRef = useRef({ offers: 0, msgs: 0, init: false });
  const stepSyncRef = useRef({ dd: "", docs: "" });
  const refreshRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t); }, [toast]);
  const [deepLink, setDeepLink] = useState(null);
  const [user, setUser] = useState(null);
  const [dealId, setDealId] = useState(null);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  // Every step change starts at the top of the page, not wherever the last one
  // was scrolled to.
  useEffect(() => { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); } }, [step]);
  const [vessel, setVessel] = useState(emptyVessel);
  const [parties, setParties] = useState(emptyParties);
  const [negotiate, setNegotiate] = useState(emptyNeg);
  const [ddData, setDdData] = useState(emptyDD);
  const [docsData, setDocsData] = useState(emptyDocs);
  const [saving, setSaving] = useState(false);
  const [booting, setBooting] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  // The logged-in user's role ON THIS SPECIFIC DEAL (buyer or seller),
  // computed from the deal's party columns — NOT their signup choice.
  const [myDealRole, setMyDealRole] = useState(null);
  // Whether the invited (second) party has joined yet. Used to lock the other
  // party's contact fields once they're in to edit their own info.
  const [partyBJoined, setPartyBJoined] = useState(false);
  // True if the current user started this deal (party A). Only the initiator
  // is prompted to pay the $249; the invited party sees a waiting message.
  const [amInitiator, setAmInitiator] = useState(true);
  // Holds a human-readable reason if claiming an invite fails, so the user
  // (and we) aren't left staring at a blank deal with no explanation.
  const [inviteError, setInviteError] = useState(null);

  const saveTimer = useRef(null);

  // Work out THIS user's role on THIS deal from the deal's party columns.
  // party_a is the initiator (role = initiator_role), party_b is the invited
  // party (role = invite_role). Falls back to their signup role only if the
  // deal has no party info yet (e.g. a brand-new unsaved deal).
  const computeDealRole = (deal, userId, fallbackRole) => {
    if (!deal || !userId) return fallbackRole || "buyer";
    if (deal.party_a_user_id === userId) return deal.initiator_role || fallbackRole || "buyer";
    if (deal.party_b_user_id === userId) return deal.invite_role || fallbackRole || "seller";
    return fallbackRole || "buyer";
  };
  const latestState = useRef({});

  // Keep a live ref to current state for debounced saving
  useEffect(() => {
    latestState.current = { vessel, parties, negotiate, ddData, docsData, step, maxStep };
  }, [vessel, parties, negotiate, ddData, docsData, step, maxStep]);

  // On first load, restore session from localStorage and load their deal
  useEffect(() => {
    // Email deep-links arrive as /?dealId=XXX&step=N — read them so clicking an
    // email opens THAT deal on the right page, not a blank app.
    let urlDealId = null, urlStep = null, urlTo = null;
    try {
      const qs = new URLSearchParams(window.location.search);
      urlDealId = qs.get("dealId");
      urlTo = qs.get("to");
      const s = qs.get("step");
      if (s !== null && !isNaN(Number(s))) urlStep = Number(s);
    } catch (e) {}

    // A deep link (e.g. the "Review the Offer" email) is addressed to ONE
    // recipient. If this browser isn't signed in as that person, don't show the
    // deal as whoever happens to be logged in — route them to sign in as the
    // intended account first, then drop them on the right deal.
    try {
      if (urlDealId && urlTo) {
        let sess = null;
        try { const s = localStorage.getItem("bc_session"); if (s) sess = JSON.parse(s); } catch (e) {}
        const sessEmail = (sess?.email || "").trim().toLowerCase();
        if (sessEmail !== urlTo.trim().toLowerCase()) {
          setDeepLink({ dealId: urlDealId, step: urlStep, email: urlTo });
          setScreen("auth");
          setBooting(false);
          return;
        }
      }
    } catch (e) {}

    try {
      const stored = localStorage.getItem("bc_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session?.token && session?.userId) {
          // Prefer a dealId from the URL (email link) over the session's.
          const effectiveDealId = urlDealId || session.dealId;
          if (effectiveDealId) setDealId(effectiveDealId);
          fetch("/api/deals" + (effectiveDealId ? ("?dealId=" + encodeURIComponent(effectiveDealId)) : ""), {
            method: "GET",
            headers: { "Authorization": "Bearer " + session.token }
          })
            .then(r => r.json())
            .then(data => {
              setUser({ name: session.name, email: session.email, role: session.role, userId: session.userId, token: session.token });
              if (data?.deal) {
                setDealId(data.deal.id);
                console.log('[ROLE] boot. userId:', session.userId, 'party_a:', data.deal.party_a_user_id, 'party_b:', data.deal.party_b_user_id, 'initiator_role:', data.deal.initiator_role, 'invite_role:', data.deal.invite_role, '=> computed:', computeDealRole(data.deal, session.userId, session.role));
                setMyDealRole(computeDealRole(data.deal, session.userId, session.role));
                setPartyBJoined(!!data.deal.party_b_user_id);
                setAmInitiator(data.deal.party_a_user_id === session.userId || data.deal.initiator_id === session.userId);
                setVessel(data.deal.vessel || emptyVessel);
                setParties(data.deal.parties || emptyParties);
                setNegotiate(data.deal.negotiate || emptyNeg);
                setDdData(data.deal.dd_data || emptyDD);
                setDocsData(data.deal.docs_data || emptyDocs);
                if (typeof data.deal.step === "number") { setStep(data.deal.step); setMaxStep(data.deal.max_step || data.deal.step); }
                // Email deep-link: jump to the task's page if it's already unlocked.
                if (urlStep !== null) {
                  const reachable = Math.min(urlStep, (data.deal.max_step ?? data.deal.step ?? urlStep));
                  setStep(reachable);
                }
                setShowWelcome(false);
              } else {
                setShowWelcome(true);
              }
              setScreen("deal");
              setBooting(false);
            })
            .catch(() => setBooting(false));
          return;
        }
      }
    } catch (e) {}
    setBooting(false);
  }, []);

  // Debounced auto-save to the database (1.2s after last change)
  const scheduleSave = () => {
    if (!user?.token) return;
    if (booting) return; // never autosave before the deal has finished loading
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      const s = latestState.current;
      try {
        const res = await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + user.token },
          body: JSON.stringify({
            dealId, role: user?.role,
            vessel: s.vessel, parties: s.parties, negotiate: s.negotiate,
            dd_data: s.ddData, docs_data: s.docsData, step: s.step, max_step: s.maxStep
          })
        });
        const data = await res.json();
        if (data?.deal?.id && !dealId) setDealId(data.deal.id);
      } catch (e) {}
      setSaving(false);
    }, 1200);
  };

  // Create/save the deal immediately and return its id. Used before actions that
  // need a saved deal (e.g. building an invite link) so the user never has to
  // manually "save first" — we just do it for them.
  const ensureDealSaved = async () => {
    if (dealId) return dealId;
    if (!user?.token) return null;
    try {
      const s = latestState.current;
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + user.token },
        body: JSON.stringify({
          role: user?.role,
          vessel: s.vessel, parties: s.parties, negotiate: s.negotiate,
          dd_data: s.ddData, docs_data: s.docsData, step: s.step, max_step: s.maxStep
        })
      });
      const d = await res.json();
      if (d?.deal?.id) { setDealId(d.deal.id); return d.deal.id; }
    } catch (e) {}
    return null;
  };

  // Wrap each setter so any change schedules a save
  const withSave = (setter) => (fn) => { setter(fn); scheduleSave(); };
  const setVesselAndSave = withSave(setVessel);
  const setPartiesAndSave = withSave(setParties);

  // Make sure the signed-in user's name/email is recorded on their own side of the
  // deal even if they never open the Parties page (e.g. a party who joins mid-deal
  // and lands straight in the deal room). Without this, their name is blank in the
  // Purchase Agreement, the generated documents, and notification emails.
  const namePrefilledRef = useRef(false);
  useEffect(() => { namePrefilledRef.current = false; }, [dealId]);
  useEffect(() => {
    if (booting || screen !== "deal" || !user || !dealId || namePrefilledRef.current) return;
    const side = (myDealRole || user.role) === "seller" ? "seller" : "buyer";
    const cur = parties?.[side] || {};
    if (cur.name) { namePrefilledRef.current = true; return; }
    if (user.name || user.email) {
      namePrefilledRef.current = true;
      setPartiesAndSave(p => ({ ...p, [side]: { ...p[side], name: (p[side]?.name) || user.name || "", email: (p[side]?.email) || user.email || "" } }));
    }
  }, [booting, screen, user, dealId, myDealRole, parties]);
  const setNegotiateAndSave = withSave(setNegotiate);
  const setDdDataAndSave = withSave(setDdData);
  const setDocsDataAndSave = withSave(setDocsData);

  // ── LIVE SYNC ───────────────────────────────────────────────────────────
  // While a deal is open, quietly poll the server so each party sees the other
  // side's new offers, counters, and messages without reloading. This is what
  // keeps the negotiation flowing round after round (and unlocks the next steps
  // the moment the other party pays). Polling uses the raw setters so it never
  // triggers a save loop, and it union-merges so it never wipes an offer or
  // message you just made that hasn't finished saving yet.
  useEffect(() => {
    if (screen !== "deal" || !dealId || !user?.token) return;
    seenRef.current = { offers: 0, msgs: 0, rejected: false, init: false };
    stepSyncRef.current = { dd: "", docs: "" };

    const mergeFromServer = (serverDeal) => {
      if (!serverDeal) return;
      const sNeg = serverDeal.negotiate || {};
      // Notice new activity from the OTHER party so we can flag it on screen,
      // instead of the user having to refresh or check email to find out.
      try {
        const myR = myDealRole || user?.role || "buyer";
        const sOffers = sNeg.offers || [];
        const sMsgs = sNeg.messages || [];
        const seen = seenRef.current;
        if (seen.init) {
          if (sOffers.length > seen.offers) {
            const newest = [...sOffers].sort((a, b) => (a.id || 0) - (b.id || 0)).pop();
            if (newest && newest.from !== myR && newest.from !== "system") {
              setToast({ k: Date.now(), text: "📨 New offer from the other party — it's on your deal now" });
            }
          } else if (sMsgs.length > seen.msgs) {
            const newest = sMsgs[sMsgs.length - 1];
            if (newest && newest.from !== myR && newest.from !== "system") {
              setToast({ k: Date.now(), text: "💬 New message in your deal" });
            }
          } else if (sNeg.vesselRejection && !seen.rejected) {
            setToast({ k: Date.now(), text: "🚫 The buyer ended the deal — see the rejection notice" });
          }
        }
        seenRef.current = { offers: sOffers.length, msgs: sMsgs.length, rejected: !!sNeg.vesselRejection, init: true };
      } catch (e) {}
      setNegotiate(prev => {
        const byId = {};
        for (const o of (prev?.offers || [])) if (o && o.id != null) byId[o.id] = o;
        for (const o of (sNeg.offers || [])) if (o && o.id != null) byId[o.id] = { ...(byId[o.id] || {}), ...o };
        const offers = Object.values(byId).sort((a, b) => (a.id || 0) - (b.id || 0));
        const prevMsgs = prev?.messages || [];
        const srvMsgs = sNeg.messages || [];
        const messages = srvMsgs.length >= prevMsgs.length ? srvMsgs : prevMsgs;
        return {
          ...prev, offers, messages,
          paid: prev?.paid || sNeg.paid,
          dealLocked: prev?.dealLocked || sNeg.dealLocked,
          depositHours: sNeg.depositHours ?? prev?.depositHours,
          depositDeadline: Math.max(Number(sNeg.depositDeadline)||0, Number(prev?.depositDeadline)||0) || prev?.depositDeadline || sNeg.depositDeadline,
          depositProof: sNeg.depositProof || prev?.depositProof,
          depositEnded: prev?.depositEnded || sNeg.depositEnded,
          vesselAcceptance: sNeg.vesselAcceptance || prev?.vesselAcceptance,
          vesselRejection: sNeg.vesselRejection || prev?.vesselRejection,
          addendum: sNeg.addendum || prev?.addendum,
          uploads: { ...(prev?.uploads || {}), ...(sNeg.uploads || {}) },
        };
      });

      // Due-diligence + documents progress: pull the other party's signatures,
      // checks, fills, and prep so they appear live. Only apply when the server
      // copy actually changed, so we don't re-render (and disturb typing) every
      // poll. Local edits always win per-key; the server only ADDS what you don't
      // have yet — so a signature you just made is never dropped mid-save.
      try {
        const sDocs = serverDeal.docs_data || {};
        const sDocsKey = JSON.stringify([sDocs.signedDocs || {}, sDocs.docChecks || {}, sDocs.docFields || {}]);
        if (sDocsKey !== stepSyncRef.current.docs) {
          stepSyncRef.current.docs = sDocsKey;
          setDocsData(prev => {
            prev = prev || {};
            return {
              ...sDocs, ...prev,
              signedDocs: { ...(sDocs.signedDocs || {}), ...(prev.signedDocs || {}) },
              docChecks: { ...(sDocs.docChecks || {}), ...(prev.docChecks || {}) },
              docFields: { ...(sDocs.docFields || {}), ...(prev.docFields || {}) },
            };
          });
        }
        const sDd = serverDeal.dd_data || {};
        const sDdKey = JSON.stringify(sDd.sellerPrep || {});
        if (sDdKey !== stepSyncRef.current.dd) {
          stepSyncRef.current.dd = sDdKey;
          setDdData(prev => {
            prev = prev || {};
            return { ...prev, sellerPrep: { ...(sDd.sellerPrep || {}), ...(prev.sellerPrep || {}) } };
          });
        }
      } catch (e) {}
    };

    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/deals?dealId=" + encodeURIComponent(dealId), {
          headers: { "Authorization": "Bearer " + user.token }
        });
        const data = await res.json();
        mergeFromServer(data?.deal);
      } catch (e) {}
    };

    const id = setInterval(poll, 5000);
    const onFocus = () => poll();
    // Manual "check now" — ignores the hidden-tab guard and always fetches, so a
    // user can force-pull the other party's latest offer instead of waiting.
    refreshRef.current = async () => {
      if (!dealId || !user?.token) return;
      setRefreshing(true);
      try {
        const res = await fetch("/api/deals?dealId=" + encodeURIComponent(dealId), { headers: { "Authorization": "Bearer " + user.token } });
        const data = await res.json();
        mergeFromServer(data?.deal);
      } catch (e) {}
      setTimeout(() => setRefreshing(false), 400);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    poll();
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [screen, dealId, user?.token]);

  // Everything past the negotiation — due diligence, documents, closing — is
  // locked until the deal is finalized: both sign the PA and the $249 is paid.
  const dealPaid = !!(negotiate?.paid || negotiate?.dealLocked || (negotiate?.offers || []).some(o => o && o.status === "accepted"));
  const goToStep = (n) => { if (n >= 3 && !dealPaid) { setStep(2); return; } setStep(n); if (n > maxStep) setMaxStep(n); scheduleSave(); };

  const handleAuth = async (authData) => {
    setUser(authData);
    try {
      localStorage.setItem("bc_session", JSON.stringify({
        token: authData.token, userId: authData.userId,
        name: authData.name, email: authData.email, role: authData.role
      }));
    } catch (e) {}
    setBooting(true);

    // If they arrived via an invite link, claim it now that they're
    // authenticated, before we load whichever deal ends up being theirs.
    let claimedRole = null;
    try {
      const pendingToken = sessionStorage.getItem("pendingInviteToken");
      if (pendingToken) {
        try {
          const acceptRes = await fetch("/api/deals/invite/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: pendingToken, userId: authData.userId })
          });
          const acceptData = await acceptRes.json();
          if (!acceptRes.ok) {
            // Surface the real reason instead of silently landing on a blank deal.
            setInviteError(acceptData?.error || "Could not connect you to that deal.");
            console.error("Invite accept failed:", acceptData?.error);
          } else if (acceptData?.role) {
            // The accept route tells us the TRUE role for this deal — trust it
            // directly rather than re-deriving from a possibly-stale deal copy.
            claimedRole = acceptData.role;
          }
        } catch (err) {
          setInviteError("Network problem connecting you to the deal. Please try the invite link again.");
          console.error("Invite accept network error:", err);
        }
        sessionStorage.removeItem("pendingInviteToken");
      }
    } catch (e) {}

    // Load their existing deal from the database FIRST, so we never
    // overwrite saved work with a blank screen. This now also picks up
    // a deal they were just invited into (see /api/deals GET).
    fetch("/api/deals" + (deepLink?.dealId ? ("?dealId=" + encodeURIComponent(deepLink.dealId)) : ""), {
      method: "GET",
      headers: { "Authorization": "Bearer " + authData.token }
    })
      .then(r => r.json())
      .then(data => {
        if (data?.deal) {
          // Returning user — restore everything from the database.
          setDealId(data.deal.id);
          setMyDealRole(claimedRole || computeDealRole(data.deal, authData.userId, authData.role));
          setPartyBJoined(!!data.deal.party_b_user_id);
          setAmInitiator(data.deal.party_a_user_id === authData.userId || data.deal.initiator_id === authData.userId);
          setVessel(data.deal.vessel || emptyVessel);
          setParties(data.deal.parties || emptyParties);
          setNegotiate(data.deal.negotiate || emptyNeg);
          setDdData(data.deal.dd_data || emptyDD);
          setDocsData(data.deal.docs_data || emptyDocs);
          if (typeof data.deal.step === "number") { setStep(data.deal.step); setMaxStep(data.deal.max_step || data.deal.step); }
          if (deepLink && typeof deepLink.step === "number") {
            const reachable = Math.min(deepLink.step, (data.deal.max_step ?? data.deal.step ?? deepLink.step));
            setStep(reachable);
          }
          setShowWelcome(false);
        } else if (claimedRole) {
          // They accepted an invite but the deal didn't come back yet
          // (timing). Use the claimed role and DON'T autosave a blank deal —
          // a quick reload will pull the real shared deal.
          setMyDealRole(claimedRole);
          setShowWelcome(false);
        } else {
          // Brand new user — start a fresh deal with their name pre-filled.
          setMyDealRole(authData.role || "buyer");
          setParties(p => ({ ...p, [authData.role]: { ...p[authData.role], name: authData.name, email: authData.email } }));
          setTimeout(() => scheduleSave(), 150);
          setShowWelcome(true);
        }
        setDeepLink(null);
        setScreen("deal");
        setBooting(false);
      })
      .catch(() => {
        setDeepLink(null);
        setScreen("deal");
        setBooting(false);
      });
  };

  const handleSignOut = () => {
    try { localStorage.removeItem("bc_session"); } catch (e) {}
    setUser(null); setDealId(null); setStep(0); setMaxStep(0);
    setVessel(emptyVessel); setParties(emptyParties);
    setNegotiate(emptyNeg); setDdData(emptyDD); setDocsData(emptyDocs);
    setScreen("landing");
  };

  if (booting) {
    return (
      <div style={{ minHeight:"100vh", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ ...S.logo, fontSize:22 }}>BOATCLOSERS</div>
          <div style={{ ...S.logoSub, color:"rgba(255,255,255,0.35)" }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (screen==="landing") return <Landing onStart={()=>setScreen("auth")}/>;
  if (screen==="auth") return <AuthScreen onAuth={handleAuth} prefillEmail={deepLink?.email} notice={deepLink ? `Sign in as ${deepLink.email} to review this deal.` : null} defaultMode={deepLink ? "login" : "signup"} />;
  if (screen==="deal" && showWelcome) return <Welcome name={user?.name} onStart={()=>setShowWelcome(false)} onSignOut={handleSignOut} />;

  return (
    <div style={S.app}>
      {inviteError && (
        <div style={{ background:"#fef2f2", borderBottom:"1px solid #fecaca", color:"#b91c1c", padding:"10px 16px", fontSize:13, fontFamily:"sans-serif", textAlign:"center" }}>
          {inviteError} <span onClick={()=>setInviteError(null)} style={{ marginLeft:10, cursor:"pointer", fontWeight:700 }}>✕</span>
        </div>
      )}
      <style>{`
        .bc-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .bc-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
        @media(max-width:640px){
          .bc-grid2,.bc-grid3{grid-template-columns:1fr}
          .bc-aiwidget{width:auto !important;left:12px !important;right:12px !important;height:70vh !important;bottom:12px !important}
        }
      `}</style>
      <nav style={S.nav}>
        <div style={{ cursor:"pointer" }} onClick={()=>setScreen("landing")}>
          <div style={S.logo}>BOATCLOSERS</div>
          <div style={S.logoSub}>Private Vessel Transactions</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {saving && <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontFamily:"sans-serif" }}>Saving…</span>}
          {user && <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif", textTransform:"uppercase", letterSpacing:1 }}>{myDealRole || user.role}</span>}
          {vessel.year && <span style={{ fontSize:11, color:C.brass, fontFamily:"sans-serif" }}>{vessel.year} {vessel.make} {vessel.model}</span>}
          <button title="Reload to pull the other party's latest offers, messages, and updates" style={{ fontSize:11, color:"#fff", background:C.brass, border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }} onClick={()=>window.location.reload()}>🔄 Check for updates</button>
          <button style={{ fontSize:11, color:"rgba(255,255,255,0.55)", background:"rgba(255,255,255,0.07)", border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif" }} onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>
      {toast && (
        <div onClick={()=>setToast(null)} style={{ position:"fixed", top:14, left:"50%", transform:"translateX(-50%)", zIndex:1000, background:C.navy, color:"#fff", padding:"11px 18px", borderRadius:10, boxShadow:"0 6px 22px rgba(0,0,0,0.22)", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer", maxWidth:"92%", textAlign:"center" }}>
          {toast.text}
          <span style={{ opacity:0.6, marginLeft:10, fontSize:11, fontWeight:400 }}>tap to dismiss</span>
        </div>
      )}
      <ProgressBar step={step} setStep={setStep} maxStep={maxStep} dealPaid={dealPaid}/>
      <PreviewBanner step={step} maxStep={maxStep} setStep={setStep}/>
      {step >= 3 && step <= maxStep && (
        <div style={{ background:C.white, borderBottom:`1px solid ${C.mist}`, padding:"8px 2rem" }}>
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <button onClick={()=>goToStep(2)} style={{ background:"transparent", border:`1px solid ${C.mist}`, borderRadius:6, padding:"6px 14px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, color:C.navy, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 }}>
              ← Back to Deal Room
            </button>
          </div>
        </div>
      )}
      {step===0 && <StepVessel data={vessel} setData={setVesselAndSave} userRole={myDealRole || user?.role || "seller"} onNext={()=>goToStep(1)}/>}
      {step===1 && <StepParties data={parties} setData={setPartiesAndSave} userRole={myDealRole || user?.role || "buyer"} partyBJoined={partyBJoined} vessel={vessel} onNext={()=>goToStep(2)} onBack={()=>setStep(0)} dealId={dealId} user={user} ensureSaved={ensureDealSaved}/>}
      {step===2 && <StepNegotiateTerms vessel={vessel} parties={parties} data={negotiate} setData={setNegotiateAndSave} myRole={myDealRole || user?.role || "buyer"} amInitiator={amInitiator} dealId={dealId} onRefresh={()=>window.location.reload()} refreshing={refreshing} onNext={()=>goToStep(3)} onBack={()=>setStep(1)}/>}
      {step===3 && (dealPaid ? <StepDueDiligence data={ddData} setData={setDdDataAndSave} setNegotiate={setNegotiateAndSave} vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} myRole={myDealRole || user?.role || "buyer"} onNext={()=>goToStep(4)} onBack={()=>setStep(2)}/> : <LockedStep stepName={STEPS[3]} onBack={()=>setStep(2)}/>)}
      {step===4 && (dealPaid ? <DocumentsStepV2 data={docsData} setData={setDocsDataAndSave} vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} myRole={myDealRole || user?.role || "buyer"} amInitiator={amInitiator} dealId={dealId} onNext={()=>goToStep(5)} onBack={()=>setStep(3)}/> : <LockedStep stepName={STEPS[4]} onBack={()=>setStep(2)}/>)}
      {step===5 && (dealPaid ? <StepClosing vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} ddData={ddData} docsData={docsData} myRole={myDealRole || user?.role || "buyer"} onBack={()=>setStep(4)}/> : <LockedStep stepName={STEPS[5]} onBack={()=>setStep(2)}/>)}
    </div>
  );
}
