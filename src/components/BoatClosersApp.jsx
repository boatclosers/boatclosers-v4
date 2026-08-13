'use client'
import DocumentsStepV2 from "./DocumentsStepV2";
import ContingencyPicker from "./ContingencyPicker";
import { useState, useRef, useEffect, useCallback } from "react";
import { DOCUMENTS, fillDocument } from "../data/documents";
import VesselLookup from "./VesselLookup";
import DocFinder from "./DocFinder";
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

// Dates arrive from HTML date inputs as YYYY-MM-DD, which is unreadable on a
// contract. Documents get longhand — "August 10, 2026" — which cannot be misread
// the way 08/10 versus 10/08 can. Anything that is not a plain date is passed
// through untouched, so blanks and the missing-value marker survive.
const longDate = (v) => {
  const s = String(v == null ? "" : v).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return v;
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const mi = Number(m[2]) - 1;
  if (mi < 0 || mi > 11) return v;
  return `${MONTHS[mi]} ${Number(m[3])}, ${m[1]}`;
};

const isValidYear = (y) => { const n = Number(y); return Number.isInteger(n) && n >= 1900 && n <= new Date().getFullYear() + 1; };
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e||"").trim());
// ── SIGNATURE NAME MATCH ──────────────────────────────────────────────────────
// An e-signature must match the name entered for that party in the Parties step,
// so a signed document actually binds the named person. Flexible on purpose: the
// FIRST and LAST name must match, but the signer may add middle names/initials
// ("John A. Smith" signs fine for "John Smith"). Case- and spacing-insensitive.
// If the party name isn't set yet, we can't check — allow it (nothing to match).
const signedStamp = () => { const d = new Date(); return { at: d.getTime(), when: d.toLocaleString() }; };
const _nameParts = (s) => String(s||"").toLowerCase().replace(/[.,]/g," ").split(/\s+/).filter(Boolean);
const sigMatchesName = (signature, partyName) => {
  const exp = _nameParts(partyName);
  const got = _nameParts(signature);
  if (exp.length === 0) return true;      // no party name on file → nothing to enforce
  if (got.length === 0) return false;     // empty signature never matches a real name
  const first = exp[0], last = exp[exp.length - 1];
  const hasFirst = got.includes(first);
  const hasLast = got.includes(last);
  return exp.length === 1 ? hasFirst : (hasFirst && hasLast);
};
const isValidPhone = (p) => { const d = (p||"").replace(/\D/g,""); return d.length===0 || (d.length >= 7 && d.length <= 15); };
// Human-friendly time remaining until an offer's expiresAt timestamp.
const hoursLeft = (expiresAt) => {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const addDays = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };
// Deposits can be a preset percentage or a custom dollar figure. A custom figure is
// stored as the exact percentage it represents (full precision, so the dollars come
// back out exactly), and only rounded when shown to a human.
// Escrow.com publishes tiered rates charged on the amount they HOLD — not on the
// boat's price. Because BoatClosers escrows only the deposit, the fee lands on the
// deposit. Buyers routinely confuse the two and picture a four-figure bill, then
// skip escrow entirely and wire a stranger. Showing the real number prevents that.
// Rates as published (updated May 2024) — an estimate, always verify current rates.
function escrowComFee(amount) {
  const a = Number(amount) || 0;
  if (a <= 0) return 0;
  let pct, min;
  if (a <= 5000)        { pct = 0.026; min = 50;   }
  else if (a <= 50000)  { pct = 0.024; min = 130;  }
  else if (a <= 200000) { pct = 0.019; min = 1200; }
  else if (a <= 500000) { pct = 0.015; min = 3800; }
  else                  { pct = 0.012; min = 7500; }
  return Math.max(Math.round(a * pct), min);
}
const pctLabel = (p) => {
  const n = Number(p);
  if (!isFinite(n) || !n) return "0";
  return String(Math.round(n * 100) / 100);
};
const CONTINGENCY_LABELS = { survey:"Survey", personalInspection:"Personal Inspection", seaTrial:"Sea Trial", financing:"Financing", insurance:"Insurance", title:"Clear Title" };
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
.bc-pa .bc-blank{display:inline-block;min-width:110px;border-bottom:1px solid #b9b2a4;vertical-align:baseline}
.bc-pa .bc-val{font-weight:700;color:#08152e}
.bc-pa .field{border-bottom:1px solid #e6e0d4;padding:6px 0;display:flex;justify-content:space-between;gap:14px;font-size:12.5px;font-family:'Helvetica Neue',Arial,sans-serif}
.bc-pa .field .k{color:#3d5166;flex-shrink:0}
.bc-pa .field .v{font-weight:700;color:#08152e;text-align:right}
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
  { id:"inventory",           name:"Inventory Schedule",                category:"Closing",       required:false, suggested:true },
  { id:"fl_82050",            name:"Florida Bill of Sale (HSMV 82050)",  category:"Closing",       required:false },
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
  { id:"inspection_failed",label:"Personal inspection — vessel not as represented", desc:"On in-person inspection the vessel\u2019s condition, equipment, or appearance did not match what was represented." },
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
// NOTE: this falls through to "Direct to Seller" for anything unrecognised, and it
// feeds the Purchase Agreement — so every escrow id must be listed here explicitly.
// A missing entry silently mislabels who is holding the money on a signed contract.
// Documents rendered outside the Documents step don't pass through its blank-line
// conversion, so the marker for "not filled in" leaked through as the word
// MISSING in the middle of a binding agreement.
function showBlanks(html) {
  return String(html || "").replace(/\u2591MISSING\u2591/g,
    '<span class="bc-blank" title="Not filled in yet \u2014 add it in Vessel or Parties">&nbsp;</span>');
}

// The agreed terms live on the accepted offer. negotiate.agreedPrice / .deposit /
// .escrowPath are mirrors that only some code paths write, so reading them
// directly is how a signed receipt ends up with a blank amount and the wrong
// escrow method. Everything that needs the agreed figures comes through here.
function agreedTerms(neg) {
  const n = neg || {};
  const offers = Array.isArray(n.offers) ? n.offers : [];
  const acc = offers.find(o => o && o.status === "accepted")
           || offers.find(o => o && o.status === "agreed");
  return {
    price: Number(acc?.amount ?? n.agreedPrice ?? 0),
    deposit: Number(acc?.deposit ?? n.deposit ?? 0),
    escrowPath: acc?.escrowPath || n.escrowPath || "",
    escrowPct: acc?.escrowPct ?? n.escrowPct ?? 0,
  };
}

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
// ─────────────────────────────────────────────────────────────────────────────
// LEGAL FOOTER — on every screen
//
// Three things a transaction platform has to say plainly and keep saying: what it
// is, what it is not, and where the full terms live. The disclaimer describes what
// this app actually does. Terms and Privacy have been reviewed and approved by
// counsel — any change to their wording should go back to them before it ships.
// ─────────────────────────────────────────────────────────────────────────────
// The disclaimer describes what this app actually does, so it lives here. Terms
// and Privacy already exist further down the file as LEGAL — they were just never
// linked to from anywhere. The footer opens all three without leaving the deal.
const DISCLAIMER = {
  title: "Disclaimer",
  sections: [
    ["What BoatClosers is", ["A guided transaction platform. It organizes a private boat sale, generates documents from the information you enter, and records what each party agreed and signed. It is software, not a person acting on your behalf."]],
    ["What BoatClosers is not", ["Not your attorney, accountant, surveyor, or escrow agent. It does not give legal or tax advice, does not hold or transfer your money, and does not represent either party in the transaction."]],
    ["What we do not verify", ["We do not verify identity, ownership, the accuracy of anything you type, the condition of the vessel, whether a lien exists, or whether a document was properly notarized.", "Documents are generated from your entries. If an entry is wrong, the document will be wrong."]],
    ["Documents and state law", ["Our documents are templates drawn on common practice. Requirements differ by state, by county, and for federally documented vessels, and they change.", "Confirm with your state titling agency, the U.S. Coast Guard, or an attorney that a document meets your requirements before relying on it."]],
    ["Notarization and offline steps", ["Some documents must be printed, signed in person, or notarized. Those steps happen outside this app and we cannot verify they were done correctly."]],
    ["Money", ["Funds move directly between you, the other party, and any escrow provider you choose. BoatClosers never holds them.", "The $249 fee is for use of the platform and is separate from the sale."]],
    ["Finality", ["Finalizing a deal is permanent by design. Once finalized, terms, documents, and signatures cannot be changed by either party or by us."]],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// YOUR DEALS
//
// Signing in only ever loads your current ACTIVE deal, so a finalized one became
// invisible — the record people paid for, reachable only through an old email
// link. This lists every deal you are a party to and opens any of them.
// ─────────────────────────────────────────────────────────────────────────────
function MyDeals({ C, S, deals, loading, onOpen, onBack, onNew }) {
  const LABEL = {
    active:    { text: "In progress", bg: C.brass,  tint: "#fffaf0" },
    finalized: { text: "Closed",      bg: C.green,  tint: "#f4f7f5" },
    canceled:  { text: "Ended",       bg: C.slate,  tint: C.sand   },
  };
  const when = (d) => { try { return new Date(d).toLocaleDateString(); } catch { return ""; } };
  const money = (n) => (n ? fmt(Number(n)) : "");
  return (
    <div style={{ minHeight:"100vh", background:C.sand }}>
      <nav style={S.nav}>
        <div style={{ cursor:"pointer" }} onClick={onBack}>
          <div style={S.logo}>BOATCLOSERS</div>
          <div style={S.logoSub}>Private Vessel Transactions</div>
        </div>
        <button onClick={onBack} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", borderRadius:16, padding:"6px 14px", fontSize:12, cursor:"pointer", fontFamily:"sans-serif" }}>&larr; Back</button>
      </nav>

      <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 1.25rem 40px" }}>
        <h1 style={S.h1}>Your deals</h1>
        <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginTop:4, marginBottom:20 }}>
          Every deal you have been part of. Closed deals stay here permanently &mdash; open one any time to view, print or email its documents.
        </div>

        {loading ? (
          <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>Loading&hellip;</div>
        ) : !deals.length ? (
          <div style={{ background:C.white, border:`1px solid ${C.mist}`, borderRadius:9, padding:"22px 20px", textAlign:"center", fontFamily:"sans-serif" }}>
            <div style={{ fontSize:13.5, color:C.navy, fontWeight:700 }}>No deals yet</div>
            <div style={{ fontSize:12.5, color:C.slate, marginTop:5, lineHeight:1.6 }}>When you start a deal or accept an invitation, it will appear here.</div>
            <button onClick={onNew} style={{ ...S.btnBrass, marginTop:14, fontSize:13, padding:"10px 22px" }}>Start a deal</button>
          </div>
        ) : (
          <div style={{ background:C.white, border:`1px solid ${C.mist}`, borderRadius:9, overflow:"hidden" }}>
            {deals.map((d, i) => {
              const L = LABEL[d.status] || LABEL.active;
              return (
                <button key={d.id} onClick={()=>onOpen(d.id)}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, width:"100%", textAlign:"left", background:L.tint,
                    border:"none", borderBottom: i < deals.length-1 ? `1px solid ${C.sand}` : "none", borderLeft:`3px solid ${L.bg}`,
                    padding:"14px 16px", cursor:"pointer", fontFamily:"sans-serif" }}>
                  <span style={{ flex:1, minWidth:0 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'Georgia',serif", fontSize:15.5, color:C.navy }}>{d.boat || "Untitled deal"}</span>
                      <span style={{ fontSize:9.5, letterSpacing:0.7, textTransform:"uppercase", fontWeight:800, color:"#fff", background:L.bg, borderRadius:9, padding:"2px 8px" }}>{L.text}</span>
                      {d.vesselName && <span style={{ fontSize:11.5, color:C.slate, fontStyle:"italic" }}>&ldquo;{d.vesselName}&rdquo;</span>}
                    </span>
                    <span style={{ display:"block", fontSize:12, color:C.slate, marginTop:4, lineHeight:1.6 }}>
                      {[
                        d.price ? `${d.agreed ? "Agreed" : "Asking"} ${money(d.price)}` : null,
                        d.role === "initiator" ? "You started this" : "You were invited",
                        d.status === "finalized" && d.finalizedAt ? `Closed ${when(d.finalizedAt)}` : `Updated ${when(d.updatedAt)}`,
                      ].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span style={{ fontSize:11.5, color:C.brass, fontWeight:700, whiteSpace:"nowrap", marginTop:3 }}>
                    {d.status === "active" ? "Continue \u2192" : "View \u2192"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LegalFooter({ C, authedFetch, signedIn }) {
  const [openKey, setOpenKey] = useState(null);
  // A mailto opens whatever the machine happens to have configured — often a
  // browser tab and nothing else. Signed-in users write to us in the app instead,
  // which also carries who they are and which deal they are on. Visitors on the
  // landing page have no session, so they get an address they can copy.
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpMsg, setHelpMsg] = useState("");
  const [helpState, setHelpState] = useState("");
  const sendHelp = async () => {
    if (helpState === "sending" || !helpMsg.trim()) return;
    setHelpState("sending");
    try {
      const res = await (authedFetch || fetch)("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType: "Question from the footer", message: helpMsg.trim() }),
      });
      const d = await res.json();
      if (d?.ok) { setHelpState("sent"); setHelpMsg(""); }
      else setHelpState(d?.error || "Couldn't send that just now. Please try again.");
    } catch (e) { setHelpState("Couldn't reach us just now. Please try again."); }
  };
  const doc = openKey === "disclaimer" ? DISCLAIMER : openKey ? LEGAL[openKey] : null;
  const link = { background:"transparent", border:"none", color:"rgba(255,255,255,0.75)", fontSize:11.5, textDecoration:"underline", cursor:"pointer", fontFamily:"sans-serif", padding:0 };
  return (
    <>
      <footer style={{ background:C.navy, color:"rgba(255,255,255,0.6)", padding:"20px 22px 24px", marginTop:40, fontFamily:"sans-serif" }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <div style={{ fontSize:11.5, lineHeight:1.7, marginBottom:11 }}>
            BoatClosers organizes private boat sales and generates documents from what you enter. It is <b style={{ color:"rgba(255,255,255,0.85)" }}>not a law firm, escrow agent, or surveyor</b>, does not hold your funds, and does not verify ownership, condition, liens, or notarization. Document requirements vary by state &mdash; confirm with your titling agency or an attorney before relying on one.
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
            <button style={link} onClick={()=>setOpenKey("disclaimer")}>Disclaimer</button>
            <button style={link} onClick={()=>setOpenKey("terms")}>Terms of Service</button>
            <button style={link} onClick={()=>setOpenKey("privacy")}>Privacy Policy</button>
            {signedIn
              ? <button style={link} onClick={()=>{ setHelpOpen(true); setHelpState(""); }}>Contact support</button>
              : <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.75)" }}>support@boatclosers.com</span>}
          </div>
          <div style={{ fontSize:10.5, marginTop:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
            &copy; {new Date().getFullYear()} BoatClosers.com
          </div>
        </div>
      </footer>

      {helpOpen && (
        <div onClick={()=>setHelpOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.75)", zIndex:5100, overflowY:"auto", padding:"20px 12px", fontFamily:"sans-serif" }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ maxWidth:520, margin:"8vh auto 0", background:"#fff", borderRadius:12, overflow:"hidden", border:`2px solid ${C.brass}` }}>
            <div style={{ background:C.navy, color:"#fff", padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12.5, letterSpacing:1, color:C.brass }}>CONTACT SUPPORT</span>
              <button onClick={()=>setHelpOpen(false)} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:20, cursor:"pointer", lineHeight:1 }}>&times;</button>
            </div>
            <div style={{ padding:"18px 20px 20px" }}>
              {helpState === "sent" ? (
                <div style={{ fontSize:13, color:C.green, lineHeight:1.7 }}>
                  ✓ Sent. We&rsquo;ll reply to the email address on your account. Nothing on your deal has changed.
                </div>
              ) : (
                <>
                  <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, marginBottom:10 }}>
                    Tell us what&rsquo;s going on and we&rsquo;ll come back to you. Your name, email and the deal you&rsquo;re on come through with it, so there&rsquo;s no need to repeat them.
                  </div>
                  <textarea value={helpMsg} onChange={e=>setHelpMsg(e.target.value)}
                    placeholder="What can we help with?"
                    style={{ width:"100%", minHeight:110, fontSize:13, fontFamily:"sans-serif", padding:"10px 12px", border:`1px solid ${C.mist}`, borderRadius:7, resize:"vertical", boxSizing:"border-box" }} />
                  {helpState && helpState !== "sending" && (
                    <div style={{ fontSize:12, color:"#dc2626", marginTop:7 }}>{helpState}</div>
                  )}
                  <div style={{ display:"flex", gap:9, marginTop:12, flexWrap:"wrap" }}>
                    <button onClick={sendHelp} disabled={helpState === "sending" || !helpMsg.trim()}
                      style={{ background:C.brass, color:"#fff", border:"none", borderRadius:18, padding:"9px 20px", fontSize:12.5, fontWeight:800, cursor:"pointer", opacity:(helpState==="sending"||!helpMsg.trim())?0.55:1 }}>
                      {helpState === "sending" ? "Sending…" : "Send"}
                    </button>
                    <button onClick={()=>setHelpOpen(false)}
                      style={{ background:"transparent", border:`1px solid ${C.mist}`, color:C.slate, borderRadius:18, padding:"9px 20px", fontSize:12.5, cursor:"pointer" }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {doc && (
        <div onClick={()=>setOpenKey(null)} style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.75)", zIndex:5000, overflowY:"auto", padding:"20px 12px", fontFamily:"sans-serif" }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:660, margin:"0 auto", background:"#fff", borderRadius:12, overflow:"hidden", border:`2px solid ${C.brass}` }}>
            <div style={{ background:C.navy, color:"#fff", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0 }}>
              <span style={{ fontFamily:"'Georgia',serif", fontSize:16, color:C.brass }}>{doc.title}</span>
              <button onClick={()=>setOpenKey(null)} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:20, cursor:"pointer", lineHeight:1 }}>&times;</button>
            </div>
            <div style={{ padding:"18px 20px 22px" }}>
              {(doc.sections || []).map(([h, paras]) => (
                <div key={h} style={{ marginBottom:15 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:4 }}>{h}</div>
                  {(Array.isArray(paras) ? paras : [paras]).map((t, i) => (
                    <div key={i} style={{ fontSize:12.5, color:C.slate, lineHeight:1.75, marginBottom:6 }}>{t}</div>
                  ))}
                </div>
              ))}
              <div style={{ fontSize:11, color:C.slate, borderTop:`1px solid ${C.mist}`, paddingTop:12, lineHeight:1.6 }}>
                BoatClosers.com &middot; questions to support@boatclosers.com
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ASSISTANT = {
  closing: {
    title: "Closing",
    buyer: {
      summary: "The last step. Confirm the money has moved, take possession of the boat, file the title paperwork with your state, then finalize. Finalizing is permanent \u2014 it seals the deal into a record neither side can change.",
      todo: [
        "Work through Before you finalize at the top \u2014 sign what is left and tick off each step as it happens",
        "Send the balance the way you agreed, and confirm it here once it has gone",
        "Take possession of the vessel, keys, and everything on the inventory",
        "File the title and registration with your state or the Coast Guard",
        "Finalize only once the money, the boat, and the paperwork have all changed hands",
      ],
      next: "Once finalized, the deal becomes a permanent record you can view, print, download or email at any time.",
      faqs: [
        { q:"What does finalizing actually do?", a:"It seals the deal. Terms, documents, and signatures become a permanent record \u2014 nothing can be changed, added or deleted afterwards, by either party or by us. You keep full access to all of it." },
        { q:"When should I press it?", a:"After the money has moved and you have the boat. There is no deadline and nothing expires if you wait a week." },
        { q:"What if a document is still unsigned?", a:"You can still finalize, but you will be asked to confirm you understand it can never be signed in the app afterwards. If it matters, sign it first." },
        { q:"Can finalizing be undone?", a:"No. Not by you, not by the seller, not by support. That permanence is what makes the record worth having." },
        { q:"What if the deal fell apart instead?", a:"Do not finalize \u2014 use End deal in the header. The party who paid keeps their fee as a 60-day credit toward another deal." },
      ],
    },
    seller: {
      summary: "The last step. Confirm the money has arrived and cleared, hand over the boat and everything on the inventory, then finalize. Finalizing is permanent \u2014 it seals the deal into a record neither side can change.",
      todo: [
        "Work through Before you finalize at the top \u2014 sign what is left and tick off each step as it happens",
        "Confirm the balance has arrived and cleared, not just that it was sent",
        "Hand over the vessel, keys, manuals, and everything on the inventory",
        "Report the sale to your state so your liability for the boat ends",
        "Finalize only once the funds have cleared and the boat has changed hands",
      ],
      next: "Once finalized, the deal becomes a permanent record you can view, print, download or email at any time.",
      faqs: [
        { q:"What does finalizing actually do?", a:"It seals the deal. Terms, documents, and signatures become a permanent record \u2014 nothing can be changed, added or deleted afterwards, by either party or by us. You keep full access to all of it." },
        { q:"Should I finalize before the money clears?", a:"No. A wire that has been sent is not a wire that has arrived, and a cheque can be reversed. Wait for cleared funds \u2014 there is no deadline." },
        { q:"Do I still owe anything afterwards?", a:"Report the sale to your state if you have not. That is what ends your liability for the boat, and the Notice of Sale is in your documents." },
        { q:"Can finalizing be undone?", a:"No. Not by you, not by the buyer, not by support." },
        { q:"What if the buyer disappears?", a:"Do not finalize \u2014 use End deal in the header. Your fee becomes a 60-day credit toward another deal." },
      ],
    },
  },
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

function DealAssistant({ step, role, vessel, seen, onSeen }) {
  // Open by default on the early steps where guidance is most needed; collapsed
  // by default on the later steps (due diligence, documents) where the panel is
  // mostly noise — the user can still expand it anytime.
  // Where `seen` is supplied, the panel opens the first time only and stays
  // collapsed afterwards, so the explanation is read once and then gets out of
  // the way rather than sitting between the heading and the work.
  const [open, setOpen] = useState(() => seen !== undefined ? !seen : !["diligence", "documents"].includes(step));
  useEffect(() => { if (seen === false && onSeen) onSeen(); }, []); // eslint-disable-line
  const [faqOpen, setFaqOpen] = useState(null);
  const c = ASSISTANT[step];
  if (!c) return null;
  const r = role === "seller" ? "seller" : "buyer";
  const g = c[r] || c;
  const faqs = g.faqs || c.faqs || [];
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
    <div className="bc-progress" style={{ background:C.white, borderBottom:`1px solid ${C.mist}`, padding:"0.85rem 2rem" }}>
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
                  className="bc-steplabel"
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
// A one-line answer to "what happens now?" at the end of each step. Motivated
// buyers and sellers forgive a long form; what makes them abandon a deal is not
// knowing whether anything actually happened, or whose turn it is.
// A one-line "here's what's normal" from a broker who has closed these deals.
// First-timers don't want to DECIDE — they want to be told what's standard and
// be able to override it.
function BrokerTip({ children }) {
  // Collapsed by default. The guidance is worth having, but five open paragraphs
  // turned the offer form into a wall of reading — and a buyer facing a wall of
  // text doesn't read it, they just pick whatever looks safest and move on.
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop:7 }}>
      <button onClick={()=>setOpen(v=>!v)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontSize:11, fontFamily:"sans-serif", fontWeight:700, color:"#7a5500", display:"inline-flex", alignItems:"center", gap:4 }}>
        💡 Broker tip {open ? "▲" : "▾"}
      </button>
      {open && (
        <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:"#475569", lineHeight:1.6, marginTop:5, paddingLeft:9, borderLeft:"2px solid #b8863a" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function WhatsNext({ children }) {
  return (
    <div style={{ background:"#eef4fb", borderLeft:"3px solid #08152e", borderRadius:6, padding:"10px 13px", marginTop:20, fontSize:12.5, fontFamily:"sans-serif", color:"#334155", lineHeight:1.6 }}>
      <strong style={{ color:"#08152e" }}>What happens next: </strong>{children}
    </div>
  );
}

function StepVessel({ data, setData, userRole, onNext }) {
  const set = (k,v) => setData(d => ({...d,[k]:v}));
  const [showGenerator, setShowGenerator] = useState(!!(data.genMake || data.genKw || data.genHours));
  // Only year, make, model required — rest optional until paywall
  const canContinue = data.year && data.make && data.model && data.askingPrice && isValidYear(data.year);
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
      <div style={{ background:C.navy, borderRadius:9, padding:"15px 18px", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div style={{ flexShrink:0 }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:"sans-serif" }}>Asking Price <span style={{ color:C.brass }}>*</span></div>
          {data.askingPrice && Number(data.askingPrice) > 0 && (
            <div style={{ fontSize:12, color:C.brass, fontWeight:700, fontFamily:"sans-serif", marginTop:2 }}>{fmt(Number(data.askingPrice))}</div>
          )}
        </div>
        <div style={{ position:"relative", flex:1, minWidth:200, maxWidth:300 }}>
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:18, fontWeight:800, color:C.brass, fontFamily:"sans-serif", pointerEvents:"none" }}>$</span>
          <input
            type="number"
            value={data.askingPrice}
            onChange={e=>set("askingPrice",e.target.value)}
            placeholder="85,000"
            style={{ width:"100%", boxSizing:"border-box", padding:"11px 14px 11px 32px", fontSize:19, fontWeight:800, fontFamily:"sans-serif", color:C.navy, background:"#fff", border:`2px solid ${C.brass}`, borderRadius:7, outline:"none" }}
          />
        </div>
      </div>
      <div style={S.card}>
        <h3 style={S.h3}>Identification</h3>
        <Grid2>
          <Field label="Year *"><input style={S.input} type="number" value={data.year} onChange={e=>set("year",e.target.value)} placeholder="2019" />{data.year && !isValidYear(data.year) && <div style={{ fontSize:11, color:"#b91c1c", fontFamily:"sans-serif", marginTop:3 }}>Enter a valid 4-digit year.</div>}</Field>
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
        {/* Generator — optional, collapsed by default so it doesn't crowd the page. */}
        {!showGenerator ? (
          <button onClick={()=>setShowGenerator(true)} style={{ marginTop:12, background:"transparent", color:C.navy, border:`1px dashed ${C.brass}`, borderRadius:7, padding:"9px 14px", fontSize:12.5, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer" }}>
            + Add generator details (optional)
          </button>
        ) : (
          <div style={{ marginTop:12, border:`1px solid ${C.mist}`, borderRadius:8, padding:"14px 16px", background:C.sandDark }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.navy, fontFamily:"sans-serif" }}>⚡ Generator</div>
              <button onClick={()=>{ setShowGenerator(false); set("genMake",""); set("genKw",""); set("genHours",""); }} style={{ background:"none", border:"none", color:C.slate, fontSize:12, fontFamily:"sans-serif", cursor:"pointer", textDecoration:"underline" }}>Remove</button>
            </div>
            <Grid2>
              <Field label="Generator Make"><input style={S.input} value={data.genMake||""} onChange={e=>set("genMake",e.target.value)} placeholder="Onan / Kohler / Northern Lights" /></Field>
              <Field label="Output (kW)"><input style={S.input} type="number" value={data.genKw||""} onChange={e=>set("genKw",e.target.value)} placeholder="7.5" /></Field>
              <Field label="Generator Hours"><input style={S.input} type="number" value={data.genHours||""} onChange={e=>set("genHours",e.target.value)} placeholder="320" /></Field>
            </Grid2>
          </div>
        )}
        <hr style={S.divider}/>
        <h3 style={S.h3}>Registration & Documentation</h3>
        <Grid2>
          <Field label="State Registration # — needed for documents"><input style={S.input} value={data.regNumber} onChange={e=>set("regNumber",e.target.value)} placeholder="FL1234AB" /></Field>
          {/* A title number and a registration number are different things. Documents
              that ask for the title number were being handed the registration number,
              which puts a wrong figure on the title paperwork. */}
          <Field label="Certificate of Title # — if you have it"><input style={S.input} value={data.titleNumber || ""} placeholder="as shown on the title" onChange={e=>set("titleNumber", e.target.value)} /></Field>
          <Field label="Registration State"><input style={S.input} value={data.regState} onChange={e=>set("regState",e.target.value)} placeholder="FL" maxLength={2} /></Field>
          {/* A fact about the listing, asked once here so the buyer can be told what
              it means later — at the moment they are deciding their number, rather
              than in a paragraph nobody reads up front. */}
          <Field label="Is this boat listed by a broker?">
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[["yes","Yes — broker listed"],["no","No — private sale"],["unsure","Not sure"]].map(([v,lbl]) => (
                <button key={v} type="button" onClick={()=>set("brokerListed", v)}
                  style={{ fontSize:12.5, padding:"8px 14px", borderRadius:18, cursor:"pointer", fontFamily:"sans-serif", fontWeight:700,
                    border:`1.5px solid ${data.brokerListed===v ? C.brass : C.mist}`,
                    background: data.brokerListed===v ? C.brass : C.white,
                    color: data.brokerListed===v ? "#fff" : C.slate }}>{lbl}</button>
              ))}
            </div>
          </Field>

          {/* An explicit answer, not an inference from whether a number was typed.
              A seller who has a documented boat but no number to hand still needs
              the citizenship question and the foreign-buyer warning. */}
          <Field label="Is this vessel U.S. Coast Guard documented?">
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[["yes","Yes"],["no","No — state titled"],["unsure","Not sure"]].map(([v,lbl]) => (
                <button key={v} type="button" onClick={()=>set("isDocumented", v)}
                  style={{ fontSize:12.5, padding:"8px 14px", borderRadius:18, cursor:"pointer", fontFamily:"sans-serif", fontWeight:700,
                    border:`1.5px solid ${data.isDocumented===v ? C.brass : C.mist}`,
                    background: data.isDocumented===v ? C.brass : C.white,
                    color: data.isDocumented===v ? "#fff" : C.slate }}>{lbl}</button>
              ))}
            </div>
            {data.isDocumented === "unsure" && (
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginTop:8 }}>
                A documented vessel has a Certificate of Documentation from the Coast Guard and its official number carved into the hull &mdash; not a state registration decal. Larger boats usually are; most trailerable boats are not.
              </div>
            )}
          </Field>
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
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, marginTop:"1.5rem" }}>
        {!canContinue && (
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.red, textAlign:"right", maxWidth:440, lineHeight:1.5 }}>
            ⚠️ Before you continue, please add: {[
              (!data.year || !isValidYear(data.year)) && "a valid year",
              !data.make && "make",
              !data.model && "model",
              !data.askingPrice && "an asking price",
            ].filter(Boolean).join(", ")}.
          </div>
        )}
        <button style={S.btnBrass} disabled={!canContinue} onClick={onNext}>Continue to Parties →</button>
      </div>
      <WhatsNext>You'll add who's buying and who's selling, then invite the other party by email. Nothing is shared with them until you send that invite.</WhatsNext>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — PARTIES (role-aware)
// ─────────────────────────────────────────────────────────────────────────────
function StepParties({ data, setData, userRole, partyBJoined, vessel, offers, onNext, onBack, dealId, user, ensureSaved }) {
  // Citizenship is only asked where it changes anything: a Coast Guard documented
  // vessel may only be owned by a US citizen.
  // The explicit answer wins; a typed documentation number still counts, so deals
  // saved before that question existed keep working.
  const isDocumented = vessel?.isDocumented === "yes"
    || (vessel?.isDocumented !== "no" && !!String(vessel?.uscgNumber || "").trim());
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
        setInviteLink(result.shortUrl || result.inviteUrl);
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
    ? (data.seller.name && isValidEmail(data.seller.email))
    : (data.buyer.name && isValidEmail(data.buyer.email));

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
      {/* ── INVITE OTHER PARTY (only until the other side joins) ── */}
      {isDocumented && (
        <div style={{ background:"#f7fbfd", border:`1px solid ${C.teal}`, borderRadius:9, padding:"13px 15px", marginBottom:16, fontFamily:"sans-serif" }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:4 }}>🇺🇸 This vessel is U.S. Coast Guard documented</div>
          <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.7 }}>
            A documented vessel may only be owned by a <b>U.S. citizen</b>, which is why each party&rsquo;s citizenship is asked below.
            If the buyer is not a U.S. citizen the boat cannot stay documented &mdash; it must be removed from documentation and
            retitled in the buyer&rsquo;s state instead. That is done with the Coast Guard&rsquo;s own transfer and deletion paperwork,
            which is in your Documents step under <b>USCG Bill of Sale &amp; Transfer / Deletion</b>. Worth settling before you go
            further, because it changes which forms this sale needs.
          </div>
        </div>
      )}

      {(() => {
        // An offer landing while you are on Parties was invisible — you sat on a
        // finished form with no sign the deal had moved. Not an auto-jump: someone
        // mid-address would lose what they were typing, and the poll fires at any moment.
        const live = (offers || []).filter(o => o && o.status !== "rejected" && o.status !== "expired");
        const latest = live[live.length - 1];
        if (!latest) return null;
        if (latest.from === (userRole === "seller" ? "seller" : "buyer")) return null;
        return (
          <button onClick={onNext}
            style={{ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", background:"#f0fdf4",
              border:"2px solid #22a06b", borderRadius:9, padding:"13px 15px", marginBottom:16, cursor:"pointer", fontFamily:"sans-serif" }}>
            <span style={{ fontSize:20, lineHeight:1 }}>📩</span>
            <span style={{ flex:1 }}>
              <span style={{ display:"block", fontSize:13.5, fontWeight:800, color:"#166534" }}>
                {latest.status === "agreed" ? "Price agreed" : "An offer has arrived"}
                {latest.amount ? ` \u2014 ${fmt(Number(latest.amount))}` : ""}
              </span>
              <span style={{ display:"block", fontSize:11.5, color:"#176844", marginTop:2, lineHeight:1.5 }}>
                It is waiting in the Deal Room. Nothing here needs finishing first.
              </span>
            </span>
            <span style={{ fontSize:12, fontWeight:800, color:"#166534", whiteSpace:"nowrap" }}>Open the Deal Room &rarr;</span>
          </button>
        );
      })()}

      {!partyBJoined ? (
      <div style={{ background:C.navy, borderRadius:8, padding:"14px 18px", marginTop:16, display:"flex", gap:14, alignItems:"flex-start" }}>
        <div style={{ fontSize:22, flexShrink:0 }}>📧</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.brass, fontFamily:"sans-serif", marginBottom:4 }}>Invite the Other Party</div>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.75)", lineHeight:1.7, marginBottom:12 }}>
            The other party needs a free BoatClosers account to join this deal, respond to offers, and sign documents. When they join, your deal is pre-linked and they fill in their own side.
          </div>

          {/* Asked here rather than at sign-up, because this is the moment the invite
              actually goes out — and by now the boat details exist, so the request
              can name the vessel. If they haven't seen it, the invite leads with a
              viewing instead of paperwork. BoatClosers never sets or confirms a time. */}
          {inviteMode === null && !inviteSent && !inviteLink && (
            <div style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, padding:"11px 13px", marginBottom:14 }}>
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:"#fff", fontWeight:600, marginBottom:7 }}>
                {userRole === "seller" ? "Has the buyer seen the boat in person?" : "Have you seen this boat in person?"}
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:7 }}>
                <button onClick={()=>setData(d=>({...d, viewingRequested:false}))} style={{ flex:1, background: data?.viewingRequested===false ? C.brass : "rgba(255,255,255,0.12)", color: data?.viewingRequested===false ? C.navy : "#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius:5, padding:"7px 10px", fontSize:11.5, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                  Yes
                </button>
                <button onClick={()=>setData(d=>({...d, viewingRequested:true}))} style={{ flex:1, background: data?.viewingRequested===true ? C.brass : "rgba(255,255,255,0.12)", color: data?.viewingRequested===true ? C.navy : "#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius:5, padding:"7px 10px", fontSize:11.5, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                  Not yet
                </button>
              </div>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>
                {data?.viewingRequested === true
                  ? <>Your invite will ask to <b style={{color:"#fff"}}>arrange a viewing</b> instead of opening with paperwork. You two agree the time between yourselves &mdash; BoatClosers doesn&rsquo;t set or confirm appointments.</>
                  : data?.viewingRequested === false
                  ? <>Good &mdash; your invite will go straight to the deal.</>
                  : <>If they haven&rsquo;t been aboard yet, the invite can ask for a viewing first.</>}
              </div>
            </div>
          )}

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
        <div style={{ background:"#eef7f0", border:"1px solid #22a06b", borderRadius:8, padding:"13px 16px", marginTop:16, fontFamily:"sans-serif" }}>
          <div style={{ fontSize:12.5, color:"#176844", fontWeight:700 }}>✓ Both parties have joined this deal</div>
          <div style={{ fontSize:12, color:"#176844", marginTop:4, lineHeight:1.6 }}>
            Before you go on, check two things: <b>your own details below</b>, and <b>the boat</b>. Both are copied straight onto the Purchase Agreement, the bill of sale and the title paperwork &mdash; a wrong hull number or year is a wasted trip to the tag office.
          </div>
          {(vessel?.year || vessel?.make || vessel?.model) && (
            <div style={{ background:"#fff", border:"1px solid #cfe6d8", borderRadius:6, padding:"10px 12px", marginTop:10 }}>
              <div style={{ fontSize:13.5, color:C.navy, fontFamily:"'Georgia',serif" }}>
                {[vessel.year, vessel.make, vessel.model].filter(Boolean).join(" ")}
                {vessel.name ? <span style={{ fontSize:11.5, color:C.slate, fontStyle:"italic", fontFamily:"sans-serif" }}> &ldquo;{vessel.name}&rdquo;</span> : null}
              </div>
              <div style={{ fontSize:11.5, color:C.slate, marginTop:4, lineHeight:1.7 }}>
                {[
                  vessel.hin ? `HIN ${vessel.hin}` : "HIN not entered",
                  vessel.loa ? `${vessel.loa} ft` : null,
                  vessel.regNo ? `Reg ${vessel.regNo}` : null,
                  vessel.regState || vessel.location || null,
                  vessel.uscgNumber ? `USCG ${vessel.uscgNumber}` : null,
                  String(vessel.trailerIncluded||"").toLowerCase()==="yes" ? "Trailer included" : null,
                ].filter(Boolean).join(" · ")}
              </div>
              <button onClick={()=>onBack && onBack()}
                style={{ marginTop:9, background:"transparent", border:`1px solid ${C.mist}`, color:C.navy, borderRadius:14, padding:"5px 13px", fontSize:11.5, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
                Edit vessel details &rarr;
              </button>
            </div>
          )}
        </div>
      )}
      <WhatsNext>Next you'll build the offer &mdash; price, deposit, contingencies and dates. When you send it, the other party gets an email and can accept, counter, or flag a conflict.</WhatsNext>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {sides.map(side => {
          const isMine = side === userRole;
          // You can edit your own side always. You can edit the OTHER side only
          // to pre-fill it before that party has joined; once they're in, it
          // locks to them.
          // Read-only for the other party at all times — before they join it is an
          // empty card that fills in as they complete their side, after they join it
          // is theirs. Either way nobody types into someone else's details.
          const locked = !isMine;
          return (
          <div key={side} style={{ ...S.card, border: side===userRole ? `2px solid ${C.brass}` : `0.5px solid ${C.mist}`, position:"relative", ...(!isMine && !partyBJoined ? { background:C.sandDark, opacity:0.92 } : {}) }}>
            {side===userRole && <span style={{ ...S.pill, position:"absolute", top:12, right:12, background:C.brass, color:C.navy }}>You</span>}
            {locked && <span style={{ ...S.pill, position:"absolute", top:12, right:12, background:C.mist, color:C.slate }}>🔒 Locked</span>}
            <h3 style={S.h3}>{side==="buyer" ? "Buyer" : "Seller"}</h3>
            {!isMine && !partyBJoined && (
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom:10 }}>
                The {side} fills this in when they join &mdash; nothing needed from you here. Use the invite above to bring them in.
              </div>
            )}
            <Grid2>
              <Field label={`${side==="buyer"?"Buyer":"Seller"} Full Legal Name *`}>
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} value={data[side].name} readOnly={locked} onChange={e=>!locked&&set(side,"name",capFirst(e.target.value))} />
              </Field>
              <Field label="Email *">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} type="email" value={data[side].email} readOnly={locked} onChange={e=>!locked&&set(side,"email",e.target.value)} />
                {!locked && data[side].email && !isValidEmail(data[side].email) && <div style={{ fontSize:11, color:"#b91c1c", fontFamily:"sans-serif", marginTop:3 }}>Enter a valid email address.</div>}
              </Field>
              <Field label="Phone">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input} value={data[side].phone} readOnly={locked} onChange={e=>!locked&&set(side,"phone",e.target.value)} />
                {!locked && !isValidPhone(data[side].phone) && <div style={{ fontSize:11, color:"#b91c1c", fontFamily:"sans-serif", marginTop:3 }}>Enter a valid phone number.</div>}
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
              {/* The Purchase Agreement states each party's citizenship, and only a
                  US citizen may own a Coast Guard documented vessel. It used to be
                  asserted as "United States" without anyone being asked. */}
              {isDocumented && <Field label="Citizenship">
                <input style={locked?{...S.input,background:C.sandDark,color:C.slate,cursor:"not-allowed"}:S.input}
                  value={data[side].citizen || ""} readOnly={locked} placeholder="e.g. United States"
                  onChange={e=>!locked&&set(side,"citizen",e.target.value)} />
              </Field>}
            </Grid2>
            {locked && (
              <div style={{ marginTop:12, padding:"10px 12px", background:C.sandDark, borderRadius:5, fontSize:12, fontFamily:"sans-serif", color:C.slate }}>
                🔒 This is the other party&rsquo;s information. {partyBJoined
                  ? "They control their own contact details and you can't edit them."
                  : "It fills in when they join \u2014 they enter their own details, so nothing here is yours to complete."}
              </div>
            )}
          </div>
          );
        })}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <div style={{ textAlign:"right" }}>
          {!canContinue && (
            <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.red, marginBottom:6 }}>
              ⚠️ Please add {[
                !(userRole==="seller"?data.seller.name:data.buyer.name) && "your full legal name",
                (() => { const e = userRole==="seller"?data.seller.email:data.buyer.email; return !e ? "your email" : !isValidEmail(e) ? "a valid email address" : false; })(),
              ].filter(Boolean).join(" and ")} to continue.
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
function StepNegotiateTerms({ vessel, parties, data, setData, myRole, amInitiator, dealId, stripeReturn, onRefresh, refreshing, authedFetch, onNext, onBack }) {
  const [newMsg, setNewMsg] = useState("");
  const [offerAmt, setOfferAmt] = useState(data.currentOffer || "");
  const [askingPrice, setAskingPrice] = useState(vessel.askingPrice || data.askingPrice || "");
  // Smart defaults: a first-time seller shouldn't have to KNOW what's normal.
  // 10% earnest money is the standard for private boat sales, and it's also what
  // switches on the whole deposit/secured-hold mechanic — leaving this at "None"
  // by default meant most deals had nothing holding the boat off the market.
  // No pre-selected percentage. The deposit is a term the BUYER proposes and the
  // SELLER accepts or rejects — pre-filling it would quietly decide a negotiating
  // point on the buyer's behalf. Blank until they pick, and the offer won't send
  // with Escrow Terms switched on and no amount chosen.
  const [escrowPct, setEscrowPct] = useState(data.escrowPct!==undefined ? String(data.escrowPct) : "");
  // "Custom" is a dollar figure the buyer types. It's converted to the exact
  // percentage on the way in, so every downstream calculation, document and email
  // keeps working off a single number instead of two competing ones.
  const [customDep, setCustomDep] = useState("");
  const [customMode, setCustomMode] = useState(false);
  // Where the deposit is held is the buyer's call and the seller's to accept —
  // not something to pre-pick. Blank until chosen; the offer won't send without it.
  const [escrowPath, setEscrowPath] = useState(data.escrowPath || "");
  const [sellerTermsOpen, setSellerTermsOpen] = useState(false);
  // Optional: put the unrepresented-buyer request in writing with the offer, so it
  // is on the record rather than a phone call neither side remembers the same way.
  const [askCoBroke, setAskCoBroke] = useState(!!data.askCoBroke);
  const [depositReceiptOpen, setDepositReceiptOpen] = useState(false);
  // Advancing with an unconfirmed deposit is allowed — someone paying through
  // Escrow.com, or still arranging it, must not be blocked — but not silently.
  const [depositAckOpen, setDepositAckOpen] = useState(false);
  // A loan on the boat has to be cleared before title can transfer. These details
  // went onto three separate documents, typed three times, with three chances to
  // disagree — on paperwork that goes to a bank. Asked once, here.
  const [hasLien, setHasLien] = useState(data.sellerHasLien || "");
  const [lienholderName, setLienholderName] = useState(data.lienholderName || "");
  const [lienAcctNo, setLienAcctNo] = useState(data.lienAcctNo || "");
  const [lienAmount, setLienAmount] = useState(data.lienAmount || "");
  const saveLien = (patch) => setData(d => ({ ...d, ...patch }));
  const [ddDays, setDdDays] = useState(data.dueDiligenceDays || "10");
  const [ddStart, setDdStart] = useState(data.ddStartDate || today());
  const [offerExpiry, setOfferExpiry] = useState("48"); // hours the offer stays valid; "0" = no expiry
  // Offer countdowns are worked out when the screen draws, so without a nudge they
  // sit frozen at whatever they said when the page loaded — an offer could read
  // "expires in 3h" long after it had lapsed. Redrawing once a minute keeps the
  // countdown honest and flips an offer to expired the moment it does.
  const [, setClockTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setClockTick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);
  const [feePayer, setFeePayer] = useState("full"); // who pays the $249: full=initiator, split, other
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
  const _bkey = `builderOpen_${myRole}`;
  const [showBuilder, setShowBuilder] = useState(data[_bkey] ?? false);
  // Remember whether the builder is open so it doesn't collapse when the user
  // navigates back to edit Vessel or Parties. Skip the initial mount so it
  // doesn't fire an extra save that could race with offer sync.
  const builderMountRef = useRef(true);
  useEffect(() => {
    if (builderMountRef.current) { builderMountRef.current = false; return; }
    setData(d => (d[_bkey] === showBuilder ? d : { ...d, [_bkey]: showBuilder }));
  }, [showBuilder]);
  const [quickAmt, setQuickAmt] = useState("");
  const [localContingencies, setLocalContingencies] = useState(data.selectedContingencies || []);
  const [cashWaived, setCashWaived] = useState(!!data.cashWaived);

  // ── Derived rules. These MUST sit below every piece of state they read: a const
  // that references a later `const` throws at runtime (temporal dead zone), and the
  // build won't warn you — the step just white-screens.
  //
  // Closing cannot land before due diligence ends; the survey, sea trial and title
  // checks are the whole point of that window. The date input carries a `min`, but
  // that only guards the picker — it doesn't survive someone shortening the DD
  // period AFTER picking a closing date, and it doesn't block sending.
  const ddEndDate = (ddStart && ddDays) ? addDays(ddStart, Number(ddDays)) : "";
  const closingTooEarly = !!(inclDates && closingDate && ddEndDate && closingDate < ddEndDate);
  // Where the deposit is held only matters if there IS a deposit.
  const needsEscrowPath = !!(inclDepositTerms && escrowPath !== "none" && escrowPct !== "" && escrowPct !== "0" && !escrowPath);
  // Every term the buyer is meant to CHOOSE must actually be chosen before the
  // offer goes out. Nothing here is pre-decided, so nothing can be sent by accident.
  const offerBlocked = !offerAmt
    || needsEscrowPath
    || (inclContingencies && localContingencies.length === 0 && !cashWaived)
    || closingTooEarly;
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
  // Why this number. Buyer-only: a seller counters, they do not make an offer.
  // Kept off the Purchase Agreement — it is context, not a term.
  const [priceNote, setPriceNote] = useState("");
  const [priceNoteOpen, setPriceNoteOpen] = useState(false);
  const [negMode, setNegMode] = useState("negotiate"); // "negotiate" | "agreed"
  // Seller-only: flag a conflict on dates/deposit terms via email to the buyer.
  const [conflictOpen, setConflictOpen] = useState(false);
  // The same overlay serves two jobs: a seller flagging a conflict mid-negotiation,
  // and either party asking for a change before they sign.
  const [askMode, setAskMode] = useState("conflict");   // conflict | presign | revise
  const preSignAsk = askMode === "presign";
  const reviseAsk = askMode === "revise";
  const setPreSignAsk = (v) => setAskMode(v ? "presign" : "conflict");
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
          toRole: myRole === "seller" ? "buyer" : "seller",
          preSign: preSignAsk || reviseAsk,
          kind: reviseAsk ? "revise" : undefined,
          fromName: (myRole === "seller" ? parties?.seller?.name : parties?.buyer?.name) || ""
        })
      });
      const r = await res.json();
      if (!res.ok) { setConflictErr(r?.error || "Could not send."); setConflictSending(false); return; }
      if (reviseAsk) {
        // Reopening here rather than on click, so a failed email doesn't leave the
        // deal unpicked apart with nobody told.
        reviseOffer({ note: "↩️ Asked the buyer to revise the terms. The offer is open for editing again." });
      }
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
    if (closingTooEarly) return;
    if (needsEscrowPath) return;
    if (inclContingencies && localContingencies.length === 0 && !cashWaived) return;
    const deposit = Math.round(amt*Number(escrowPct||0)/100);
    // A seller counters the PRICE only. Everything else on the offer is the
    // buyer's to write, so it is carried forward from the offer being countered
    // rather than read from a form the seller no longer sees.
    const _base = fromRole === "seller"
      ? [...offers].reverse().find(o => o && o.from !== "seller")
      : null;
    const offer = {
      id:Date.now(), from:fromRole, amount:amt, askingPrice:Number(askingPrice)||0,
      // Only meaningful on a broker-listed boat, and only from the buyer's side.
      askCoBroke: (vessel?.brokerListed === "yes" && fromRole !== "seller") ? askCoBroke : false,
      escrowPct: _base ? _base.escrowPct : Number(escrowPct),
      escrowPath: _base ? _base.escrowPath : escrowPath,
      deposit: _base ? _base.deposit : deposit,
      verbal:verbalDeal, status:"pending", time:new Date().toLocaleTimeString(),
      // opt-in contingencies
      inclContingencies: _base ? _base.inclContingencies : inclContingencies,
      contingencies: _base ? (_base.contingencies || []) : (inclContingencies ? localContingencies : []),
      cashWaived: _base ? _base.cashWaived : cashWaived,
      // opt-in dates & payment
      inclDates: _base ? _base.inclDates : inclDates,
      ddDays: _base ? _base.ddDays : (inclDates ? ddDays : ""),
      ddStart: _base ? _base.ddStart : (inclDates ? ddStart : ""),
      closingDate: _base ? _base.closingDate : (inclDates ? closingDate : ""),
      paymentType: _base ? _base.paymentType : (inclDates ? paymentType : ""),
      financeContingency: _base ? _base.financeContingency : (inclDates ? financeContingency : ""),
      ddExtension: _base ? _base.ddExtension : (inclDates ? ddExtension : false),
      ddExtDays: _base ? _base.ddExtDays : ddExtDays,
      ddExtDepositRule: _base ? _base.ddExtDepositRule : ddExtDepositRule,
      // opt-in deposit terms / notes
      inclDepositTerms: _base ? _base.inclDepositTerms : inclDepositTerms,
      depositRule: _base ? _base.depositRule : (inclDepositTerms ? depositRule : ""),
      depositRuleCustom: _base ? _base.depositRuleCustom : depositRuleCustom,
      // The note explains the BUYER's number, so a seller counter never inherits it.
      note: fromRole === "seller" ? "" : verbalNote,
      // Explains the number to the other party. Never on a seller's counter.
      priceNote: fromRole === "seller" ? "" : (priceNote || "").trim(),
      depositHours: _base ? _base.depositHours : (Number(depositHours) || 24),
      feePayer: _base ? _base.feePayer : feePayer,
      expiresHours: Number(offerExpiry) || 0,
      expiresAt: offerExpiry !== "0" ? Date.now() + Number(offerExpiry) * 3600000 : null,
    };
    setOffers(o => {
      const updated = [...o.map(of => of.status==="pending" ? {...of, status:"countered"} : of), offer];
      setData(d => ({...d, offers: updated}));
      return updated;
    });
    const escrowLabel = escLabel(escrowPath);
    const parts = [`${fromRole==="buyer"?"Offer":"Counter"}: ${fmt(amt)}`];
    parts.push(deposit>0?`${fmt(deposit)} (${pctLabel(escrowPct)}%) earnest via ${escrowLabel}`:"No deposit");
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
    // A non-preset percentage came from a custom dollar figure — restore that view.
    if (!["0","2","3","5","7.5","10"].includes(String(o.escrowPct))) {
      setCustomMode(true);
      setCustomDep(String(o.deposit || ""));
    } else { setCustomMode(false); setCustomDep(""); }
    setEscrowPath(o.escrowPath);
    setInclContingencies(!!o.inclContingencies);
    if (o.contingencies) setLocalContingencies(o.contingencies);
    setCashWaived(!!o.cashWaived);
    setInclDates(!!o.inclDates);
    if (o.ddDays) setDdDays(o.ddDays);
    if (o.ddStart) setDdStart(o.ddStart);
    if (o.closingDate) setClosingDate(o.closingDate);
    if (o.paymentType) setPaymentType(o.paymentType);
    setInclDepositTerms(!!o.inclDepositTerms);
    if (o.feePayer) setFeePayer(o.feePayer);
    if (o.depositRule) setDepositRule(o.depositRule);
    setOfferFrom(myRole==="seller" ? "seller" : "buyer");
    setNegMode("negotiate");
    setShowBuilder(true);
    setTimeout(() => offerFormRef.current?.scrollIntoView({ behavior:"smooth", block:"center" }), 60);
  };

  // Do-over: reopen the agreed offer to fix a forgotten term BEFORE signing.
  // Withdraw my own signature so the terms can be reopened. Only mine, only while
  // the other party has not signed and nothing has been paid — the server enforces
  // the same three conditions, so a stale save cannot wipe a signature.
  const withdrawSignature = () => {
    const ag = offers.find(o => o.status === "agreed");
    if (!ag) return;
    const me = myRole === "seller" ? "seller" : "buyer";
    const cleared = offers.map(of => of.id === ag.id
      ? (me === "buyer"
          ? { ...of, paBuyerSig:null, paBuyerDisc:null, paBuyerDate:null, withdrawnBy:"buyer" }
          : { ...of, paSellerSig:null, paSellerDisc:null, paSellerDate:null, withdrawnBy:"seller" })
      : of);
    const note = { from: myRole, text:"↩️ Withdrew their signature so the terms can be revised before signing.", time:new Date().toLocaleTimeString() };
    const msgs = [...messages, note];
    setOffers(cleared);
    setMessages(msgs);
    setData(d => ({ ...d, offers: cleared, messages: msgs }));
  };

  const reviseOffer = (opts = {}) => {
    const ag = offers.find(o => o.status==="agreed");
    if (!ag) return;
    counterOffer(ag.id);
    // The signature is a name AND a disclosure tick — clearing only the name left
    // the tick behind, so the deal still read as signed and the server restored
    // the rest. Both lines have to go, and the dates with them.
    const reverted = offers.map(of => of.id===ag.id ? {...of,
      status:"countered",
      paBuyerSig:null, paBuyerDisc:null, paBuyerDate:null,
      paSellerSig:null, paSellerDisc:null, paSellerDate:null,
    } : of);
    const note = { from: myRole, text: opts.note || "↩️ Reopened the offer to revise the terms before signing.", time:new Date().toLocaleTimeString() };
    const msgs = [...messages, note];
    setOffers(reverted);
    setMessages(msgs);
    setData(d => ({ ...d, offers: reverted, messages: msgs, priceAgreed:false, agreedOfferId:null }));
  };

  // Accepting an offer opens the modal — pay first, then sign the PA.
  const acceptOffer = (id) => {
    const acc = offers.find(o => o.id===id);
    if (!acc) return;
    if (acc.expiresAt && Date.now() > acc.expiresAt) {
      setMessages(m => [...m, { from:"system", text:"⚠️ That offer has expired and can no longer be accepted. Send a new offer to continue.", time:new Date().toLocaleTimeString() }]);
      return;
    }
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
    // The signature must match this party's name on the deal. Belt-and-suspenders:
    // the button is already disabled on a mismatch, but never let a bad sig through.
    const myPartyName = myRole === "buyer" ? parties.buyer?.name : parties.seller?.name;
    if (!sigMatchesName(myName, myPartyName)) return;
    const _st = signedStamp();
    const patch = myRole === "buyer"
      ? { paBuyerSig: myName, paBuyerDisc: true, paBuyerDate: today(), paBuyerAt: _st.at, paBuyerWhen: _st.when }
      : { paSellerSig: myName, paSellerDisc: true, paSellerDate: today(), paSellerAt: _st.at, paSellerWhen: _st.when };
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
  const _agreedForFee = offers.find(o => o.status==="agreed" || o.status==="accepted");
  const payPlan = data.payPlan || _agreedForFee?.feePayer || "full";
  const setPayPlan = (p) => setData(d => ({ ...d, payPlan: p }));
  const openCheckout = async (who, fee) => {
    if (!dealId) { alert("This deal is still saving — please wait a moment and try again."); return; }
    setPayWho(who);
    try {
      // The fee is set on the server now — sending an amount from here would be
      // pointless at best and a way to underpay at worst.
      const doFetch = authedFetch || fetch;
      const res = await doFetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, who, appUrl: (typeof window !== "undefined" ? window.location.origin : "") })
      });
      const d = await res.json();
      if (d?.url) { window.location.href = d.url; return; }
      alert(d?.error || "Couldn't start checkout. Please try again.");
    } catch (e) {
      alert("Couldn't reach checkout. Please check your connection and try again.");
    }
  };
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

  // Returning from a successful Stripe payment: record it (locks the deal, or the
  // split half). Guarded so it only fires once and never double-locks.
  const stripeHandledRef = useRef(false);
  useEffect(() => {
    if (!stripeReturn?.paid || stripeHandledRef.current) return;
    if (data.dealLocked || data.paid) { stripeHandledRef.current = true; return; }
    if (agreedOffer) {
      stripeHandledRef.current = true;
      recordPayment(stripeReturn.who || "initiator");
    }
  }, [stripeReturn, data.dealLocked, data.paid, offers.length]);

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
    const offer = { ...baseOffer, id: Date.now(), from: fromRole, amount: amt, deposit, status: "pending", time: new Date().toLocaleTimeString(), expiresAt: baseOffer.expiresHours ? Date.now() + baseOffer.expiresHours * 3600000 : null };
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

  // Price-Agreed / celebration box. Shown once, at the top of the Deal Room. It
  // used to be mirrored at the bottom so nobody scrolled past it, but two identical
  // boxes with the same buttons on one screen read as a bug.
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
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <button style={{ ...S.btnBrass, fontSize:14, padding:"11px 22px" }} onClick={()=>{ setPaModal(agreedOffer); setPaStage("sign"); }}>
                  {iSigned ? "View Purchase Agreement →" : "Sign the Purchase Agreement →"}
                </button>
                {iSigned && !bothSigned && (
                  <button style={{ ...S.btnOutline, fontSize:13, padding:"11px 18px" }} onClick={withdrawSignature}
                    title="Clears your signature so the terms can be edited. The other party has not signed.">
                    ↩️ Withdraw my signature
                  </button>
                )}
                {!iSigned && ((myRole === "seller" && buyerSigned) || (myRole !== "seller" && sellerSigned)) && (
                  <button style={{ ...S.btnOutline, fontSize:13, padding:"11px 18px" }}
                    onClick={()=>{ setConflictTopic("dates"); setPreSignAsk(true); setConflictOpen(true); }}
                    title="Ask the other party for a change before you sign">
                    ✋ I need a change before I sign
                  </button>
                )}
                {!buyerSigned && !sellerSigned && myRole === "seller" && (
                  <button style={{ ...S.btnOutline, fontSize:13, padding:"11px 18px" }}
                    onClick={()=>{ setConflictTopic("dates"); setAskMode("revise"); setConflictOpen(true); }}
                    title="Reopen the offer and tell the buyer what needs changing">
                    ↩️ Ask the buyer to revise
                  </button>
                )}
                {!buyerSigned && !sellerSigned && myRole !== "seller" && (
                  <button style={{ ...S.btnOutline, fontSize:13, padding:"11px 18px" }} onClick={()=>reviseOffer()} title="Reopen the offer to fix a term before signing">↩️ Revise offer</button>
                )}
              </div>
            </>
          ) : amInitiator ? (
            <>
              <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6, marginBottom:12, fontWeight:600 }}>
                The Purchase Agreement is fully signed. Pay the one-time <b>$249</b> to make the deal binding and unlock Due Diligence, Documents, and Closing for both parties.
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <button style={{ ...S.btnBrass, fontSize:15, padding:"13px 26px" }} onClick={()=>openCheckout("initiator",249)}>💳 Pay $249 &amp; unlock the deal →</button>
                <button style={{ ...S.btnOutline, fontSize:13, padding:"13px 18px" }} onClick={()=>{ setPaModal(agreedOffer); setPaStage("sign"); }}>View signed agreement</button>
              </div>
              <div style={{ background:"#eef4fb", borderLeft:"3px solid #08152e", borderRadius:6, padding:"10px 13px", marginTop:14, fontSize:12, fontFamily:"sans-serif", color:"#334155", lineHeight:1.6 }}>
                <strong style={{ color:"#08152e" }}>If this deal falls through: </strong>
                your $249 carries over. You have 60 days to start another deal &mdash; a different
                buyer, or a different boat &mdash; at no additional fee, with this boat&rsquo;s details
                already filled in. The fee is only fully used once a deal actually closes.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:13, fontFamily:"sans-serif", color:"#166534", lineHeight:1.6, marginBottom:12, fontWeight:600 }}>
                ✓ All signed! Waiting for the party who started this deal to pay the one-time $249 and make it binding — <b>nothing for you to pay</b>. You'll be unlocked automatically the moment they do.
              </div>
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
      effectiveDate: longDate(today()),
      sellerName: parties.seller.name || paModal.paSellerSig || "\u2591MISSING\u2591",
      sellerAddress: `${parties.seller.address||""} ${parties.seller.city||""} ${parties.seller.stateZip||""}`.trim() || "\u2591MISSING\u2591ss]",
      sellerCitizen: parties.seller.citizen || "\u2591MISSING\u2591",
      buyerName: parties.buyer.name || paModal.paBuyerSig || "\u2591MISSING\u2591",
      buyerAddress: `${parties.buyer.address||""} ${parties.buyer.city||""} ${parties.buyer.stateZip||""}`.trim() || "\u2591MISSING\u2591",
      buyerCitizen: parties.buyer.citizen || "\u2591MISSING\u2591",
      vesselYear: vessel.year||"\u2591MISSING\u2591", vesselMake: vessel.make||"\u2591MISSING\u2591", vesselModel: vessel.model||"\u2591MISSING\u2591",
      vesselLength: vessel.loa ? vessel.loa+" ft" : "\u2591MISSING\u2591",
      hullMaterial: vessel.hullType || "\u2591MISSING\u2591",
      hin: vessel.hin || "\u2591MISSING\u2591",
      uscgOfficialNo: vessel.uscgNumber || "N/A",
      titleNo: vessel.titleNumber || "\u2591MISSING\u2591",
      regNo: vessel.regNumber || "\u2591MISSING\u2591",
      vesselState: vessel.regState || vessel.location || "\u2591MISSING\u2591",
      engineDesc: (`${vessel.engineMake||""} ${vessel.engineModel||""}`.trim()
        ? `${vessel.engineCount||"1"} \u00d7 ${vessel.engineMake||""} ${vessel.engineModel||""}`.trim()
        : "\u2591MISSING\u2591"),
      salePrice: fmt(paAgreed), salePriceWords: priceToWords(paAgreed),
      // The deposit clause reads this to name the right holder.
      escrowPath: paModal.escrowPath || data?.escrowPath || "",
      depositAmount: fmt(paDep), depositPct: pctLabel(paModal.escrowPct||0)+"%",
      // The contract used to say the deposit was due "upon execution" while the app
      // enforced an agreed 12/24/36-hour window, and it named no consequence at all
      // for a buyer who simply never funded. Both parties signing a term with no
      // deadline and no remedy is what left sellers relying on goodwill.
      DEPOSIT_TERMS: paDep > 0
        ? `<p>Buyer shall deliver the earnest money deposit to the escrow holder identified in this Agreement within <strong>${Number(paModal.depositHours) || 24} hours</strong> of this Agreement being executed by both parties. Time is of the essence as to this obligation. If Buyer fails to deliver the deposit within that period, Seller may, at Seller&rsquo;s sole option and upon written notice to Buyer, either extend the time for delivery or terminate this Agreement, whereupon neither party shall have further obligation to the other and Seller shall be free to offer the Vessel to other buyers. Return or forfeiture of a deposit once delivered is governed by the contingencies and remedies stated elsewhere in this Agreement.</p>`
        : `<p>No earnest money deposit is required under this Agreement. The Vessel is not held off the market, and Seller may continue to show and offer the Vessel to other buyers until Closing.</p>`,
      balanceDue: fmt(Math.max(0, paAgreed - paDep)),
      closingDate: longDate(paModal.closingDate || "\u2591MISSING\u2591"),
      closingLocation: vessel.location || "the location where the Vessel is moored",
      surveyDeadline: longDate(paDDEnd) || "____________", inspectionDeadline: longDate(paDDEnd) || "____________", seaTrialDeadline: longDate(paDDEnd) || "____________", financingDeadline: longDate(paDDEnd) || "____________",
      brokerFee: "$249.00",
      selectedContingencies: (Array.isArray(paModal.contingencies) && paModal.contingencies.length) ? paModal.contingencies : ["survey","seaTrial","title"],
      paymentType: paModal.paymentType || "",
    };
    const paDoc = DOCUMENTS.find(d => d.id === "psa");
    // The sentinel is a marker, not text — the Documents page turns it into a
    // blank line. Rendered raw here, the agreement literally read "MISSING".
    const paHtml = paDoc ? showBlanks(fillDocument(paDoc, paFill)) : "";

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
                  <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.green, fontWeight:700 }}>✓ Signed — {live.paBuyerSig}{live.paBuyerWhen ? <span style={{ display:"block", fontSize:10.5, fontWeight:400, color:C.slate, marginTop:2 }}>{live.paBuyerWhen}</span> : null}</div>
                ) : iAmBuyer ? (
                  <>
                    <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
                      <input type="checkbox" checked={paBuyerDisc} onChange={e=>setPaBuyerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
                      I have read and agree to all terms above
                    </label>
                    <label style={S.label}>Type your full name to sign</label>
                    <input style={S.input} placeholder="Your full legal name" value={paBuyerName} onChange={e=>setPaBuyerName(e.target.value)} />
                    {parties.buyer?.name && paBuyerName.trim() && !sigMatchesName(paBuyerName, parties.buyer.name) && (
                      <div style={{ fontSize:11.5, color:C.red, fontFamily:"sans-serif", fontWeight:700, marginTop:5, lineHeight:1.5 }}>Your signature must match the buyer name on this deal: <b>{parties.buyer.name}</b>. To change it, update the buyer name in the Parties step.</div>
                    )}
                    <button style={{ ...S.btnBrass, width:"100%", marginTop:10, fontSize:13, padding:"9px", opacity:(paBuyerName.trim()&&paBuyerDisc&&sigMatchesName(paBuyerName, parties.buyer?.name))?1:0.4 }} disabled={!(paBuyerName.trim()&&paBuyerDisc&&sigMatchesName(paBuyerName, parties.buyer?.name))} onClick={()=>signMyLine(paModal.id)}>Sign as buyer</button>
                  </>
                ) : (
                  <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, fontStyle:"italic" }}>⏳ Awaiting the buyer's signature</div>
                )}
              </div>
              <div style={{ background:C.sandDark, borderRadius:6, padding:"14px", border: sellerSigned ? `1.5px solid ${C.green}` : `1px solid ${C.mist}` }}>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>Seller: {parties.seller.name||"Seller"}{!iAmBuyer ? " (you)" : ""}</div>
                {sellerSigned ? (
                  <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.green, fontWeight:700 }}>✓ Signed — {live.paSellerSig}{live.paSellerWhen ? <span style={{ display:"block", fontSize:10.5, fontWeight:400, color:C.slate, marginTop:2 }}>{live.paSellerWhen}</span> : null}</div>
                ) : !iAmBuyer ? (
                  <>
                    <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
                      <input type="checkbox" checked={paSellerDisc} onChange={e=>setPaSellerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
                      I have read and agree to all terms above
                    </label>
                    <label style={S.label}>Type your full name to sign</label>
                    <input style={S.input} placeholder="Your full legal name" value={paSellerName} onChange={e=>setPaSellerName(e.target.value)} />
                    {parties.seller?.name && paSellerName.trim() && !sigMatchesName(paSellerName, parties.seller.name) && (
                      <div style={{ fontSize:11.5, color:C.red, fontFamily:"sans-serif", fontWeight:700, marginTop:5, lineHeight:1.5 }}>Your signature must match the seller name on this deal: <b>{parties.seller.name}</b>. To change it, update the seller name in the Parties step.</div>
                    )}
                    <button style={{ ...S.btnBrass, width:"100%", marginTop:10, fontSize:13, padding:"9px", opacity:(paSellerName.trim()&&paSellerDisc&&sigMatchesName(paSellerName, parties.seller?.name))?1:0.4 }} disabled={!(paSellerName.trim()&&paSellerDisc&&sigMatchesName(paSellerName, parties.seller?.name))} onClick={()=>signMyLine(paModal.id)}>Sign as seller</button>
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
              <button style={{ ...S.btnBrass, fontSize:14, padding:"11px 20px" }} onClick={()=>openCheckout("initiator", 249)}>
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
            <h1 style={S.h1}>{myRole==="seller" ? "Review the Offer" : "Build Your Offer"}</h1>
            <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>{myRole==="seller"
              ? "Set your asking price, then review the buyer\u2019s offer when it arrives. You can accept it, counter on price, or flag a conflict on the terms. Free until you lock the deal."
              : "Put together your price, deposit, and terms, send it to the other party, and negotiate until you agree. Free until you lock the deal."}</p>
          </>
        )}
      </div>


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

      {/* The seller's four responses are accept, counter, reject and flag a
          conflict. The first three sit on the offer itself; this one was buried
          inside the builder, so it now sits beside the button that opens it. */}
      {myRole === "seller" && offers.length > 0 && !frozen && !acceptedOffer && !conflictSent && (
        <button onClick={()=>setConflictOpen(true)}
          style={{ width:"100%", fontSize:15, padding:"14px 12px", fontWeight:800, marginBottom:10, cursor:"pointer",
            fontFamily:"sans-serif", borderRadius:8, background:C.white, color:"#8a5a12",
            border:`2px solid ${C.brass}` }}>
          ⚠️ Something in these terms doesn&rsquo;t work &mdash; tell the buyer &rarr;
        </button>
      )}
      {/* The confirmation lived in the block that moved, so it moves with it. */}
      {myRole === "seller" && conflictSent && !frozen && !acceptedOffer && (
        <div style={{ background:"#f7fbfd", border:`1px solid ${C.teal}`, borderRadius:8, padding:"11px 13px", marginBottom:10, fontFamily:"sans-serif", fontSize:12, color:C.slate, lineHeight:1.6 }}>
          ✓ Sent. The buyer has been emailed and can revise their offer &mdash; nothing here has changed in the meantime.
        </div>
      )}

      {/* ── EDIT FULL TERMS — opens the builder for contingencies, dates, deposit ── */}
      {offers.length > 0 && !frozen && (
        <button onClick={()=>{ if(!showBuilder && latestPendingTop){ counterOffer(latestPendingTop.id); } else { setShowBuilder(v=>!v); } }}
          style={showBuilder
            ? { ...S.btnOutline, width:"100%", fontSize:13, padding:"10px 0", fontWeight:700, marginBottom:16 }
            : { ...S.btnBrass, width:"100%", fontSize:16.5, fontWeight:800, padding:"15px 12px",
                letterSpacing:0.2, marginBottom:16, boxShadow:"0 3px 10px rgba(184,134,58,0.35)" }}>
          {showBuilder ? "✕ Close" : (myRole==="seller" ? "⚙️ See the buyer's full terms →" : "✏️ Counter with full terms — contingencies, dates, deposit →")}
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
          {Number(acceptedOffer.deposit) > 0 && (() => {
            // Signed terms and a secured deal are two different things. The PA binds
            // the terms; the deposit is what actually takes the boat off the market.
            // Saying "Terms Locked" without this reads as "we're done" when the money
            // hasn't moved yet.
            const verif = data.depositVerification || null;
            const hasProof = !!(data.depositProof && data.depositProof.ref);
            const verified = verif?.status === "confirmed";
            const disputed = verif?.status === "disputed";
            const bg = verified ? C.greenLight : disputed ? C.redLight : "#fff8e6";
            const bd = verified ? C.green : disputed ? C.red : C.brass;
            const head = verified ? "✓ Deposit verified — this deal is secured"
              : disputed ? "⚠️ The seller could not verify the deposit — deal on hold"
              : hasProof ? "⏸️ Waiting on the seller to confirm the deposit"
              : "⏳ Waiting on the earnest-money deposit";
            const body = verified
              ? `The ${fmt(acceptedOffer.deposit)} earnest money is confirmed. The boat is held off the market while due diligence is completed.`
              : disputed
              ? `The buyer submitted proof but the seller reports the ${fmt(acceptedOffer.deposit)} has not arrived. Nothing moves forward until it's sorted out on the Due Diligence step.`
              : hasProof
              ? `The buyer has submitted proof of the ${fmt(acceptedOffer.deposit)} deposit. The seller is confirming it actually arrived — the deal is secured once they do.`
              : myRole === "seller"
              ? `The terms are signed, but the boat isn't secured yet. The buyer sends the ${fmt(acceptedOffer.deposit)} earnest money directly to you, then signs a receipt for it. You confirm it arrived and the deal is secured.`
              : `The terms are signed, but the boat isn't secured yet. Send the ${fmt(acceptedOffer.deposit)} the way you agreed, then sign the receipt to record it \u2014 that is what holds the boat off the market.`;
            // The buyer is the one who sends the deposit; give them a real button to
            // the step where it happens. Without this the banner says "handle it on
            // Due Diligence" but offers no way to get there — a dead end after signing.
            const showDepositCta = !verified;
            return (
              <div style={{ background:bg, border:`1px solid ${bd}`, borderRadius:6, padding:"11px 13px", marginTop:10, fontFamily:"sans-serif" }}>
                <div style={{ fontSize:12.5, fontWeight:800, color: verified ? C.green : disputed ? C.red : "#7a5500", marginBottom:3 }}>{head}</div>
                <div style={{ fontSize:12, color:C.slate, lineHeight:1.6 }}>{body}</div>
                {showDepositCta && onNext && (
                  <button onClick={()=>{
                      // Escrow.com verifies itself — there is nothing to sign, so
                      // send them to the step that shows the status instead.
                      if (data?.escrowPath === "escrow_com") { onNext(); return; }
                      setDepositReceiptOpen(true);
                    }}
                    style={{ ...S.btnBrass, marginTop:10, fontSize:12.5, fontWeight:800, padding:"9px 16px" }}>
                    {disputed ? "Sort out the deposit →" : hasProof ? "Check the deposit status →" : (myRole === "seller" ? `Confirm the ${fmt(acceptedOffer.deposit)} arrived →` : `Send the ${fmt(acceptedOffer.deposit)} earnest money →`)}
                  </button>
                )}
              </div>
            );
          })()}
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

        {/* 💵 Price — the OFFER is the star; asking price is muted reference */}
        <div style={{ border:`1px solid ${C.mist}`, borderRadius:8, padding:"14px", marginBottom:10, background:"#fff" }}>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>💵 Price</div>
          <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, margin:"3px 0 12px", lineHeight:1.55, display: myRole==="seller" ? "none" : undefined }}>The seller's asking price is shown for reference. Enter the amount you're actually offering below.</div>

          {/* Asking price. For the BUYER this is muted reference with a one-tap
              match. For the SELLER it is their own anchor — shown plainly, and
              never with an "offer full asking" button, which would have them
              offering their own price back to themselves. */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background:C.sandDark, borderRadius:6, padding:"8px 12px", marginBottom:12, flexWrap:"wrap" }}>
            <label style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, fontWeight:600 }}>{myRole==="seller" ? "Your asking price" : "Asking price (reference)"}</label>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <input style={{ ...S.input, width:130, textAlign:"right", padding:"6px 10px", fontSize:13, color:C.slate, background:"#fff", margin:0 }} type="number" value={askingPrice} onChange={e=>setAskingPrice(e.target.value)} placeholder={vessel.askingPrice||"85000"} />
              {Number(askingPrice)>0 && myRole!=="seller" && (
                <button type="button" onClick={()=>setOfferAmt(String(Number(askingPrice)))} style={{ background:C.navy, color:"#fff", border:"none", borderRadius:5, padding:"7px 12px", fontSize:11.5, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer", whiteSpace:"nowrap" }}>
                  Offer full asking →
                </button>
              )}
            </div>
          </div>

          {/* Raised where the number is actually being decided, and only when it
              applies — a broker-listed boat, and a buyer who has no broker of their
              own. It states the position; it does not name a figure. */}
          {vessel?.brokerListed === "yes" && myRole !== "seller" && (
            <div style={{ background:"#f7fbfd", border:`1px solid ${C.teal}`, borderRadius:8, padding:"12px 14px", marginBottom:10, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:C.navy, marginBottom:4 }}>You&rsquo;re representing yourself on a broker-listed boat</div>
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.7 }}>
                A listing broker&rsquo;s commission normally assumes a second broker brings the buyer and takes a share of it. Nobody is doing that here &mdash; you are, with BoatClosers handling the paperwork. That is worth taking into account when you decide your number, and far easier to raise <b>before</b> terms are agreed than after. What they will do about it is up to them.
              </div>
              <label style={{ display:"flex", alignItems:"flex-start", gap:8, marginTop:10, cursor:"pointer" }}>
                <input type="checkbox" checked={askCoBroke}
                  onChange={e=>{ setAskCoBroke(e.target.checked); setData(d => ({ ...d, askCoBroke: e.target.checked })); }}
                  style={{ width:15, height:15, marginTop:2, accentColor:C.teal, flexShrink:0 }} />
                <span style={{ fontSize:11.5, color:C.slate, lineHeight:1.6 }}>
                  Note on my offer that I am unrepresented and would like the unclaimed buyer&rsquo;s side taken into account. Puts it in writing with the offer &mdash; it does not change your number.
                </span>
              </label>
            </div>
          )}

          {/* Your offer — pronounced, gold-highlighted */}
          <div style={{ border:`2px solid ${C.brass}`, borderRadius:8, padding:"12px 14px", background:"#fffaf0" }}>
            {/* A seller does not make an offer — they counter one. Same field,
                honest label. */}
            <label style={{ fontSize:13, fontFamily:"sans-serif", color:C.navy, fontWeight:800, display:"block", marginBottom:6 }}>{myRole==="seller" ? "\ud83d\udcb0 Your Counter Price" : "\ud83d\udcb0 Your Offer Price"}</label>
            <input style={{ ...S.input, fontSize:22, fontWeight:800, color:C.navy, padding:"12px 14px", border:`1.5px solid ${C.brass}`, background:"#fff", margin:0 }} type="number" value={offerAmt} onChange={e=>setOfferAmt(e.target.value)} placeholder={myRole==="seller" ? "Enter your counter" : "Enter your offer here"} />
            {/* Optional, buyer only, collapsed. A bare lower number reads as
                haggling; a reason reads as a case. */}
            {myRole !== "seller" && (
              <div style={{ marginTop:9 }}>
                {!priceNoteOpen && !priceNote ? (
                  <button type="button" onClick={()=>setPriceNoteOpen(true)}
                    style={{ background:"transparent", border:"none", color:C.teal, fontSize:11.5, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", textDecoration:"underline", padding:0 }}>
                    Add a note about your number (optional)
                  </button>
                ) : (
                  <>
                    <label style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, display:"block", marginBottom:4 }}>Why this number (optional &mdash; the seller sees this with your offer)</label>
                    <textarea value={priceNote} onChange={e=>setPriceNote(e.target.value)}
                      placeholder="e.g. needs a trailer, the port engine is due for service, or it wasn't quite what the listing described"
                      style={{ ...S.textarea, minHeight:52, fontSize:12.5 }} />
                  </>
                )}
              </div>
            )}
            {offerAmt && Number(askingPrice)>0 && (
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color: Number(offerAmt) < Number(askingPrice) ? C.teal : C.slate, marginTop:6, fontWeight:700 }}>
                {Number(offerAmt) < Number(askingPrice)
                  ? `${fmt(Number(askingPrice)-Number(offerAmt))} below asking`
                  : Number(offerAmt) > Number(askingPrice)
                    ? `${fmt(Number(offerAmt)-Number(askingPrice))} above asking`
                    : "Full asking price"}
              </div>
            )}
          </div>
        </div>

        {/* Terms below are authored by the buyer — read-only for the seller. */}
        {myRole==="seller" && (
          <div style={{ background:"#f7fbfd", border:`1px solid ${C.mist}`, borderRadius:8, padding:"12px 14px", marginBottom:10, fontFamily:"sans-serif" }}>
            <div style={{ fontSize:12.5, fontWeight:800, color:C.navy, marginBottom:3 }}>The terms below belong to the buyer</div>
            <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.65 }}>
              Dates, contingencies and deposit terms are the buyer&rsquo;s to write, so they are shown here for reference only. What you can do is <b>counter on price</b> above, or <b>flag a conflict</b> at the bottom if something in these terms does not work for you.
            </div>
            <button type="button" onClick={()=>setSellerTermsOpen(o=>!o)}
              style={{ marginTop:9, background:"transparent", border:`1px solid ${C.mist}`, color:C.navy, borderRadius:14, padding:"5px 13px", fontSize:11.5, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
              {sellerTermsOpen ? "\u25b2 Hide the buyer\u2019s terms" : "\u25bc View the buyer\u2019s terms"}
            </button>
          </div>
        )}
        <div style={ myRole==="seller"
          ? { pointerEvents:"none", opacity:0.6, display: sellerTermsOpen ? undefined : "none" }
          : undefined }>

        {/* 📅 Dates & Timeline — opt-in */}
        <OfferSection icon="📅" title="Dates &amp; Timeline" desc="The due-diligence window to inspect the boat and your target closing date. Leave these out for a simple, as-is cash deal you want to close fast." checked={inclDates} onToggle={()=>setInclDates(v=>!v)}>
          <label style={S.label}>Due Diligence Period</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:8 }}>
            {["7","10","14","Custom"].map(d => (
              <button key={d} onClick={()=>{ if(d==="Custom") setDdCustom(true); else { setDdDays(d); setDdCustom(false); } }} style={{ ...S.btnOutline, background:(ddDays===d&&!ddCustom)||(d==="Custom"&&ddCustom)?C.navy:"transparent", color:(ddDays===d&&!ddCustom)||(d==="Custom"&&ddCustom)?"#fff":C.navy, padding:"8px 0", textAlign:"center", fontSize:12, fontWeight:700 }}>{d==="Custom"?"Custom":`${d}d`}</button>
            ))}
          </div>
          {ddCustom && (<div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><input style={{...S.input, maxWidth:90}} type="number" min="1" max="90" value={ddDays} onChange={e=>setDdDays(e.target.value)} placeholder="21" /><span style={{ fontSize:12, color:C.slate, fontFamily:"sans-serif" }}>days</span></div>)}
          <BrokerTip>10&ndash;14 days is typical. That's enough to book a surveyor, haul the boat out, and run a sea trial without rushing &mdash; surveyors are often booked a week out. Go shorter only if the survey is already scheduled.</BrokerTip>
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
            <Field label="Target Closing Date"><input style={{...S.input, ...(closingTooEarly ? { borderColor:C.red } : {})}} type="date" value={closingDate} min={ddEndDate || today()} onChange={e=>setClosingDate(e.target.value)} /></Field>
            <Field label="Final Payment"><select style={S.select} value={paymentType} onChange={e=>setPaymentType(e.target.value)}><option value="cash">All Cash</option><option value="finance">Financed</option><option value="other">Other / TBD</option></select></Field>
          </Grid2>
          {closingTooEarly && (
            <div style={{ background:C.redLight, border:`1px solid ${C.red}`, borderRadius:6, padding:"10px 13px", marginTop:9, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12, color:C.red, fontWeight:700, lineHeight:1.5 }}>⚠️ Closing is set before due diligence ends ({ddEndDate}).</div>
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, marginTop:4 }}>You can't close on a boat you're still allowed to inspect &mdash; the survey and sea trial have to finish first. Push the closing date out, or shorten the due-diligence window.</div>
              <button style={{...S.btnOutline, fontSize:12, padding:"7px 13px", marginTop:8}} onClick={()=>setClosingDate(addDays(ddEndDate, 7))}>Move closing to {addDays(ddEndDate, 7)}</button>
            </div>
          )}
          {paymentType==="finance" && (<Field label="Financing contingency (days)"><input style={{...S.input, maxWidth:140}} type="number" value={financeContingency} onChange={e=>setFinanceContingency(e.target.value)} placeholder="14" /></Field>)}
          <BrokerTip>Leave about a week between the end of due diligence and closing. That's the gap where funds get wired, the title and lien release come through, and insurance is bound &mdash; closing the day after a survey almost never happens on time.</BrokerTip>
        </OfferSection>

        {/* 🛡️ Contingencies — opt-in (placed after timeline so the escrow choice sits last) */}
        <OfferSection icon="🛡️" title="Contingencies" desc="Conditions that must be met or you can walk away with your deposit back — like a passing survey or sea trial. Most serious offers include at least a survey contingency." checked={inclContingencies} onToggle={()=>setInclContingencies(v=>!v)}>
          <ContingencyPicker value={localContingencies} onChange={setLocalContingencies} paymentType={paymentType} ddEnd={ddStart && ddDays ? addDays(ddStart, Number(ddDays)) : ""} cashWaived={cashWaived} onCashWaived={setCashWaived} />

          {/* How long the offer stands. A deadline is a condition of the offer, so
              it belongs with the others rather than floating above the send button. */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background:C.sandDark, borderRadius:6, padding:"8px 12px", marginTop:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate }}>⏳ This offer is good for:</span>
            <select style={{...S.select, width:"auto", padding:"6px 10px", fontSize:12}} value={offerExpiry} onChange={e=>setOfferExpiry(e.target.value)}>
              <option value="0">No expiration</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>
          <BrokerTip>48 hours keeps a deal moving without pressuring anyone. An offer with no deadline is the single most common way private boat sales quietly die &mdash; the other side means to reply, then a week goes by.</BrokerTip>
        </OfferSection>

        {/* 🏦 Money owed on the boat — the most common reason a closing slips */}
        <div style={{ border:`1px solid ${hasLien==="yes" ? C.brass : C.mist}`, borderRadius:8, marginBottom:10, background: hasLien==="yes" ? "#fffdf8" : "#fff", padding:"13px 14px" }}>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>🏦 Money Owed on the Boat</div>
          <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:3, marginBottom:11, lineHeight:1.55 }}>
            If the seller still owes on a loan, it has to be paid off before the title can transfer. Worth settling early &mdash; it is the most common reason a boat deal stalls at the end.
          </div>
          <label style={S.label}>Is there a loan or lien on the vessel?</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            {[["no","No — owned free and clear"],["yes","Yes — there is a payoff"],["unsure","Not sure yet"]].map(([v,lbl]) => (
              <button key={v} type="button" onClick={()=>{ setHasLien(v); saveLien({ sellerHasLien: v }); }}
                style={{ fontSize:12.5, padding:"8px 14px", borderRadius:18, cursor:"pointer", fontFamily:"sans-serif", fontWeight:700,
                  border:`1.5px solid ${hasLien===v ? C.brass : C.mist}`, background: hasLien===v ? C.brass : C.white, color: hasLien===v ? "#fff" : C.slate }}>{lbl}</button>
            ))}
          </div>

          {hasLien === "unsure" && (
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, background:C.sand, borderRadius:6, padding:"10px 12px" }}>
              Worth settling before closing. A lien search and a written payoff request are both in your documents, and the seller&rsquo;s lender can confirm in a phone call.
            </div>
          )}

          {hasLien === "yes" && (
            <>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom:10 }}>
                These fill in the Payoff Demand, the Lien Release and the Closing Statement, so they only need typing once. Leave blank for now if you don&rsquo;t have them yet.
              </div>
              <Field label="Lender / lienholder name">
                <input style={S.input} value={lienholderName} placeholder="e.g. Bank of the Islands, N.A."
                  onChange={e=>{ setLienholderName(e.target.value); saveLien({ lienholderName: e.target.value }); }} />
              </Field>
              <Field label="Loan or account number">
                <input style={S.input} value={lienAcctNo} placeholder="as it appears on the statement"
                  onChange={e=>{ setLienAcctNo(e.target.value); saveLien({ lienAcctNo: e.target.value }); }} />
              </Field>
              <Field label="Approximate payoff amount">
                <input style={S.input} value={lienAmount} placeholder="$" inputMode="decimal"
                  onChange={e=>{ setLienAmount(e.target.value); saveLien({ lienAmount: e.target.value }); }} />
              </Field>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
                Get the exact figure from the lender in writing, good through your closing date. Verbal payoff numbers change with interest.
              </div>
            </>
          )}
        </div>

        {/* 🔒 Escrow Terms — opt-in (deposit amount, terms, and where it's held all together) */}
        <OfferSection icon="🔒" title="Escrow Terms" desc="Money the buyer puts down to take the boat off the market while they inspect it. It isn't an extra cost — it comes off the purchase price at closing. Set the amount, what happens to it if the deal falls apart, and who holds it in the meantime. BoatClosers never touches the money; a neutral third party you both agree on holds it." checked={inclDepositTerms} onToggle={()=>setInclDepositTerms(v=>!v)}>
          <label style={S.label}>Escrow Method &mdash; where the deposit is held</label>
          <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom:7 }}>
            Choose this first. Who holds the money affects what it costs to hold &mdash; which is worth knowing before you settle on an amount.
          </div>
          <EscrowSelector value={escrowPath} onChange={(v)=>{ setEscrowPath(v); if (v === "none") { setEscrowPct("0"); setCustomMode(false); } }} depositAmt={Math.round(Number(offerAmt||0)*Number(escrowPct)/100)} />
          {escrowPath==="escrow_com" && (
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:6, lineHeight:1.5 }}>Opening Escrow.com launches a new tab. Everything above is already saved, so you can set it up there and come back to send your offer.</div>
          )}
          {/* Percentage only appears AFTER a method is chosen — and never for "No deposit".
              The method is the decision; the amount follows from it. */}
          {escrowPath === "none" ? (
            <div style={{ background:"#f4f4f5", border:`1px solid ${C.mist}`, borderRadius:6, padding:"11px 13px", marginTop:14, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12.5, color:C.navy, fontWeight:700, lineHeight:1.5 }}>🚫 No earnest money on this offer</div>
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, marginTop:5 }}>The deal moves straight to due diligence with nothing to deposit or confirm. The boat isn&rsquo;t held off the market &mdash; the seller can keep showing it until closing.</div>
            </div>
          ) : !escrowPath ? (
            <div style={{ background:C.sandDark, border:`1px solid ${C.mist}`, borderRadius:6, padding:"11px 13px", marginTop:14, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12, color:C.slate, lineHeight:1.6 }}>Choose how earnest money is handled above, then set the amount here.</div>
            </div>
          ) : (<>
          <div style={{ height:16 }}/>
          <label style={S.label}>Earnest Money Deposit</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:5 }}>
            {["0","2","3","5","7.5","10"].map(p => {
              const on = !customMode && escrowPct===p;
              const dollars = (p!=="0" && offerAmt) ? fmt(Math.round(Number(offerAmt)*Number(p)/100)) : null;
              return (
                <button key={p} onClick={()=>{ setCustomMode(false); setEscrowPct(p); }} style={{ ...S.btnOutline, background:on?C.navy:"transparent", color:on?"#fff":C.navy, fontSize:12.5, fontWeight:700, padding:"9px 0 7px", textAlign:"center", lineHeight:1.3 }}>
                  <div>{p==="0"?"None":`${p}%`}</div>
                  {dollars && <div style={{ fontSize:10, fontWeight:600, opacity:on?0.85:0.6, marginTop:2 }}>{dollars}</div>}
                </button>
              );
            })}
            <button onClick={()=>setCustomMode(true)} style={{ ...S.btnOutline, background:customMode?C.navy:"transparent", color:customMode?"#fff":C.navy, fontSize:12.5, fontWeight:700, padding:"9px 0 7px", textAlign:"center", lineHeight:1.3 }}>
              <div>Custom</div>
              {customMode && customDep && <div style={{ fontSize:10, fontWeight:600, opacity:0.85, marginTop:2 }}>{fmt(Number(customDep))}</div>}
            </button>
          </div>
          {customMode && (
            <div style={{ marginTop:8 }}>
              {!offerAmt ? (
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.red, fontWeight:700, lineHeight:1.5 }}>Enter your offer price first &mdash; a custom deposit is worked out against it.</div>
              ) : (
                <>
                  <label style={S.label}>Custom deposit amount</label>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:17, fontWeight:800, color:C.navy, fontFamily:"sans-serif" }}>$</span>
                    <input style={{...S.input, maxWidth:190}} type="number" min="0" step="100" value={customDep}
                      onChange={e=>{
                        const v = e.target.value;
                        setCustomDep(v);
                        const amt = Number(offerAmt)||0;
                        setEscrowPct(v && amt ? String((Number(v)/amt)*100) : "0");
                      }}
                      placeholder="5000" />
                  </div>
                  {customDep && Number(customDep)>0 && (
                    <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:6, lineHeight:1.6 }}>
                      That&rsquo;s <b>{pctLabel(escrowPct)}%</b> of your {fmt(Number(offerAmt))} offer.
                      {Number(customDep) > Number(offerAmt) && <span style={{ color:C.red, fontWeight:700 }}> &mdash; that&rsquo;s more than the offer itself, double-check it.</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {(escrowPct==="0" || escrowPct==="") ? (
            <div style={{ background:C.sandDark, borderRadius:6, padding:"11px 13px", marginTop:8, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.7 }}>
                <b>Thinking about it?</b> Earnest money is a good-faith deposit that takes the boat <b>off the market</b> while you inspect it. It shows the seller you&rsquo;re serious, and it buys you protected time for a survey and sea trial without worrying they&rsquo;ll sell it to someone else. Most private boat deals include one.
              </div>
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, marginTop:7 }}>
                Pick an amount and we&rsquo;ll walk you through what happens to it if the deal falls through. Prefer no deposit? Leave it on <b>None</b> &mdash; the offer still works, it just doesn&rsquo;t hold the boat.
              </div>
            </div>
          ) : (
            <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:6, padding:"10px 13px", marginTop:8, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12.5, color:C.teal, fontWeight:700, lineHeight:1.5 }}>
                {offerAmt ? <>✓ {fmt(Math.round(Number(offerAmt)*Number(escrowPct)/100))} earnest money ({pctLabel(escrowPct)}% of your offer)</> : <>✓ {pctLabel(escrowPct)}% earnest money &mdash; enter your offer price to see the amount</>}
              </div>
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, marginTop:4 }}>
                You&rsquo;ll send this after both sides sign, not now. Next, choose what happens to it if the deal falls through.
              </div>
            </div>
          )}
          <BrokerTip>10% is the standard between yacht brokers, but remember what the deposit is actually <i>for</i>: taking the boat off the market while you inspect it, and proving to the seller you&rsquo;re serious. On a private sale a smaller deposit often does that job perfectly well &mdash; what matters to a seller is that it&rsquo;s real money you&rsquo;d hate to lose, not that it hits a particular percentage. Offer too little and they may keep showing the boat; they can always counter. One thing worth knowing: escrow is charged on the amount held, not on the boat&rsquo;s price, so a deposit costs far less to escrow than people expect. Choose &ldquo;None&rdquo; only if you&rsquo;ve agreed to handle the deposit outside this deal.</BrokerTip>
          {escrowPct!=="" && escrowPct!=="0" && (<>
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
          </>)}
          </>)}
        </OfferSection>
        </div>


        {/* Submit */}
        {offerBlocked && !myOfferAwaiting && (
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.red, marginTop:8, textAlign:"center", lineHeight:1.5 }}>
            ⚠️ Before you send, please {[
              !offerAmt && "enter your offer price",
              needsEscrowPath && "choose where the deposit will be held",
              (inclContingencies && localContingencies.length===0 && !cashWaived) && "choose your contingencies, or use the cash-offer option to waive them all",
              closingTooEarly && "set a closing date after due diligence ends",
            ].filter(Boolean).join(", and ")}.
          </div>
        )}
        {/* The send bar. This is the single most consequential control on the page —
            it puts a real, binding-in-spirit offer in front of another person — so it
            gets its own visual block, a recap of exactly what's about to go out, and
            the actual dollar figure printed on the button. A customer should never
            press this wondering what they just sent. */}
        <div style={{ marginTop:16, border:`2px solid ${offerBlocked||myOfferAwaiting ? C.mist : C.brass}`, borderRadius:10, overflow:"hidden", background: offerBlocked||myOfferAwaiting ? "#f8fafc" : "#fffdf7" }}>
          {!offerBlocked && !myOfferAwaiting && (
            <div style={{ padding:"12px 15px", borderBottom:`1px solid ${C.mist}`, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:10.5, letterSpacing:1.4, textTransform:"uppercase", color:C.slate, fontWeight:700, marginBottom:7 }}>
                You're about to send
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px 16px", fontSize:12, color:C.text, lineHeight:1.8 }}>
                <span><b style={{ fontSize:15, color:C.navy }}>{fmt(Number(offerAmt)||0)}</b> offer</span>
                {inclDepositTerms && escrowPct!=="0" && escrowPct!=="" && <span>· {fmt(Math.round(Number(offerAmt||0)*Number(escrowPct)/100))} deposit ({pctLabel(escrowPct)}%) via {escLabel(escrowPath)}</span>}
                {inclDepositTerms && escrowPct==="0" && <span>· no deposit</span>}
                {inclContingencies && <span>· {localContingencies.length ? localContingencies.map(k=>CONTINGENCY_LABELS[k]||k).join(", ") : cashWaived ? "💵 cash offer, no contingencies" : "no contingencies"}</span>}
                {inclDates && <span>· {ddDays}-day due diligence{closingDate ? `, closing ${closingDate}` : ""}</span>}
                {offerExpiry!=="0" && <span>· expires in {offerExpiry}h</span>}
              </div>
            </div>
          )}
          <div style={{ padding:"13px 15px" }}>
            <button style={{...S.btnBrass, width:"100%", fontSize:16.5, fontWeight:800, padding:"15px 12px", letterSpacing:0.2, opacity:(offerBlocked||myOfferAwaiting)?0.45:1, boxShadow:(offerBlocked||myOfferAwaiting)?"none":"0 3px 10px rgba(184,134,58,0.35)"}} onClick={makeOffer} disabled={offerBlocked||myOfferAwaiting}>
              {offerAmt && !offerBlocked
                ? `📨 Send ${fmt(Number(offerAmt))} ${(offers.length===0 && myRole!=="seller") ? "Offer" : "Counter-Offer"} to the ${myRole==="seller" ? "Buyer" : "Seller"} →`
                : `📨 ${(offers.length===0 && myRole!=="seller") ? "Send Offer to Seller" : (myRole==="seller" ? "Send Counter-Offer to Buyer" : "Send Counter-Offer to Seller")} →`}
            </button>
            {!offerBlocked && !myOfferAwaiting && (
              <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, textAlign:"center", marginTop:8, lineHeight:1.5 }}>
                They'll get an email straight away and can accept, counter, or flag a conflict. You can withdraw or revise until they respond.
              </div>
            )}
          </div>
        </div>
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
        {/* Moved out of the builder — see the standalone block above the ladder.
            Reaching it used to mean opening a form the seller cannot author. */}
      </div>
      ) : null}

      {conflictOpen && !conflictSent && (
        <div onClick={()=>{ setConflictOpen(false); setConflictErr(""); setAskMode("conflict"); setPreSignAsk(false); }}
          style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.7)", zIndex:4000, overflowY:"auto", padding:"20px 12px", fontFamily:"sans-serif" }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ maxWidth:520, margin:"4vh auto 0", background:"#fff", borderRadius:12, overflow:"hidden", border:`2px solid ${C.brass}` }}>
            <div style={{ background:C.navy, color:"#fff", padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12.5, letterSpacing:1, color:C.brass }}>{reviseAsk ? "ASK THE BUYER TO REVISE" : preSignAsk ? "ASK FOR A CHANGE BEFORE SIGNING" : "FLAG A CONFLICT"}</span>
              <button onClick={()=>{ setConflictOpen(false); setConflictErr(""); setAskMode("conflict"); setPreSignAsk(false); }}
                style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:20, cursor:"pointer", lineHeight:1 }}>&times;</button>
            </div>
            <div style={{ padding:"18px 20px 20px" }}>
              <div style={{ fontFamily:"'Georgia',serif", fontSize:18, color:C.navy, marginBottom:6 }}>{reviseAsk ? "Ask the buyer to revise the terms" : preSignAsk ? "Ask for a change before you sign" : "Ask the buyer to adjust their terms"}</div>
              <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, marginBottom:14 }}>
                {reviseAsk
                  ? <>The buyer writes the terms, so only they can change them. Tell them what needs revising and the offer reopens for editing &mdash; they will get an email and the agreed price is set aside until you both agree again. <b>This does not end the deal.</b></>
                  : preSignAsk
                  ? <>The other party has already signed, so nothing can be edited while their signature stands. Tell them what needs to change &mdash; they can withdraw their signature to reopen the terms, and you both sign the revised agreement. <b>Sending this does not sign anything or end the deal.</b></>
                  : <>You can&rsquo;t edit the buyer&rsquo;s offer &mdash; they author the terms. What you can do is tell them exactly what doesn&rsquo;t work, so they can change it and send the offer again.</>}
              </div>
              <label style={{ ...S.label, marginBottom:5 }}>What&rsquo;s the conflict about?</label>
              <select style={{ ...S.input, marginBottom:12 }} value={conflictTopic} onChange={e=>setConflictTopic(e.target.value)}>
                <option value="dates">Schedule / Dates</option>
                <option value="deposit">Deposit Terms</option>
                <option value="contingencies">Contingencies</option>
              </select>
              <label style={{ ...S.label, marginBottom:5 }}>What needs to change?</label>
              <textarea style={{ ...S.textarea, minHeight:96 }} value={conflictMsg} onChange={e=>setConflictMsg(e.target.value)}
                placeholder="e.g. The 10-day closing date won't work — I need until the 30th to clear the lien." />
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, marginTop:8 }}>
                {reviseAsk
                  ? "The buyer gets an email and the offer reopens for them to edit. Nothing is signed or cancelled."
                  : preSignAsk
                  ? "This emails the other party. Their signature stays in place until they choose to withdraw it."
                  : "This goes to the buyer by email with your deal attached. It does not change or reject their offer \u2014 they still hold the terms."}
              </div>
              {conflictErr && <div style={{ fontSize:12, color:"#dc2626", marginTop:8 }}>{conflictErr}</div>}
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button onClick={()=>{ setConflictOpen(false); setConflictErr(""); setAskMode("conflict"); setPreSignAsk(false); }} style={{ ...S.btnOutline, flex:1, fontSize:13 }}>Cancel</button>
                <button onClick={sendConflict} disabled={conflictSending} style={{ ...S.btnBrass, flex:1, fontSize:13, opacity:conflictSending?0.6:1 }}>
                  {conflictSending ? "Sending\u2026" : (reviseAsk ? "Reopen and ask the buyer" : preSignAsk ? "Send the request" : "Email the buyer")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              const oExpired = o.status==="pending" && o.expiresAt && Date.now() > o.expiresAt;
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
                      {/* Ticking the box has to reach the other side, or it records
                          nothing anyone will act on. */}
                      {o.askCoBroke && <span style={{...S.pill, background:C.tealLight, color:C.teal}} title="The buyer has no broker and asks that the unclaimed buyer's side be taken into account.">Unrepresented buyer</span>}
                      {/* The reason travels with the number it explains — a message
                          six replies later is no longer attached to anything. */}
                      {o.priceNote && (
                        <div style={{ background:"#fff", border:`1px solid ${C.mist}`, borderRadius:6, padding:"8px 10px", marginTop:6, fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.55, fontStyle:"italic" }}>
                          &ldquo;{o.priceNote}&rdquo;
                          <div style={{ fontStyle:"normal", fontSize:10.5, color:C.mist2 || "#8a8578", marginTop:3 }}>&mdash; the {o.from === "seller" ? "seller" : "buyer"}&rsquo;s note</div>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:4, lineHeight:1.5 }}>
                      Deposit: {fmt(o.deposit)} ({pctLabel(o.escrowPct)}%) · {escLabel(o.escrowPath)}
                      {o.inclContingencies && o.contingencies?.length ? ` · Contingent on ${contingencyNames(o.contingencies)}` : " · no contingencies"}
                      {o.inclDates ? ` · Due Diligence ${o.ddDays} days · Close ${o.closingDate||"TBD"}` : " · dates open"}
                    </div>

                    {/* status / actions */}
                    <div style={{ marginTop:9 }}>
                      {o.status==="pending" && o.expiresAt && !oExpired && (
                        <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.brass, fontWeight:600, marginBottom:6 }}>⏳ Expires in {hoursLeft(o.expiresAt)}</div>
                      )}
                      {o.status==="accepted" && <span style={{...S.pill, background:C.green, color:"#fff"}}>Accepted ✓ — Purchase Agreement signed</span>}
                      {o.status==="agreed" && <span style={{...S.pill, background:"#166534", color:"#fff"}}>Price agreed ✓ — awaiting lock</span>}
                      {o.status==="rejected" && <span style={{...S.pill, background:C.red, color:"#fff"}}>Rejected</span>}
                      {o.status==="countered" && <span style={{...S.pill, background:C.mist, color:C.slate}}>Countered — see newer offer below</span>}
                      {isLatestPending && !frozen && oExpired ? (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.red, background:C.redLight, borderRadius:6, padding:"8px 12px", lineHeight:1.6 }}>
                          ⚠️ This offer expired. {o.from===myRole ? "Send a fresh offer above to keep the deal moving." : "It can no longer be accepted — send a counter-offer above to restart negotiation."}
                        </div>
                      ) : isLatestPending && !frozen && (
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
                            {myRole==="seller" && (
                              <button
                                onClick={()=>{ setShowBuilder(true); setConflictOpen(true); setTimeout(()=>offerFormRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),80); }}
                                title="Not about the price? Use this to ask the buyer to change the dates, deposit, or contingencies before you accept. It sends the buyer your concern — they make the actual edits and send a revised offer."
                                style={{...S.btn, background:"#b45309", color:"#fff", fontSize:12, padding:"8px 14px", whiteSpace:"nowrap"}}>
                                ⚑ Flag a conflict
                              </button>
                            )}
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


      <WhatsNext>Once the price is agreed and the deal is locked, you move to due diligence &mdash; survey, sea trial, and the earnest-money deposit that holds the boat off the market.</WhatsNext>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={{...S.btnBrass, opacity:canProceed?1:0.5}} disabled={!canProceed}
          onClick={()=>{
            // Soft gate — never a block. Escrow.com verifies itself, and a deal with
            // no deposit has nothing to confirm, so neither is interrupted.
            const dv = data?.depositVerification;
            const needsDeposit = !!(acceptedOffer && Number(acceptedOffer.deposit) > 0);
            const auto = data?.escrowPath === "escrow_com";
            if (needsDeposit && !auto && dv?.status !== "confirmed") { setDepositAckOpen(true); return; }
            proceed();
          }}>
          {canProceed ? "Continue to Due Diligence →" : "🔒 Finalize the deal to continue"}
        </button>
      </div>

      {/* The deposit is what makes the deal real, so it happens here rather than a
          step away. Same receipt both parties sign — signing it IS the buyer's
          confirmation. */}
      <EarnestReceiptModal open={depositReceiptOpen} onClose={()=>setDepositReceiptOpen(false)}
        vessel={vessel} parties={parties} negotiate={data} setNegotiate={setData} myRole={myRole} />

      {/* Soft gate: you can go on without the deposit confirmed, but not without
          being told what that means. */}
      {depositAckOpen && (
        <div onClick={()=>setDepositAckOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.7)", zIndex:4200, overflowY:"auto", padding:"20px 12px", fontFamily:"sans-serif" }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ maxWidth:480, margin:"8vh auto 0", background:"#fff", borderRadius:12, overflow:"hidden", border:`2px solid ${C.brass}` }}>
            <div style={{ background:C.navy, color:"#fff", padding:"13px 20px", fontSize:12.5, letterSpacing:1 }}>
              <span style={{ color:C.brass }}>THE BOAT ISN&rsquo;T SECURED YET</span>
            </div>
            <div style={{ padding:"18px 20px 20px" }}>
              <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7 }}>
                The earnest money hasn&rsquo;t been confirmed by both of you, so nothing is holding this boat off the market. You can carry on to due diligence &mdash; surveys and sea trials often get booked before the deposit clears &mdash; but the seller is still free to take another offer until it is confirmed.
              </div>
              <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}>
                <button onClick={()=>{ setDepositAckOpen(false); setDepositReceiptOpen(true); }}
                  style={{ ...S.btnBrass, flex:1, fontSize:13, minWidth:160 }}>Handle the deposit first</button>
                <button onClick={()=>{ setDepositAckOpen(false); proceed(); }}
                  style={{ ...S.btnOutline, flex:1, fontSize:13, minWidth:160 }}>Carry on anyway &rarr;</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  // Nothing is pre-selected. This used to fall back to options[0] when `value` was
  // empty, so the page rendered Escrow.com's full explanation, disclaimer and button
  // before the buyer had chosen anything — it looked decided when it wasn't.
  //
  // The long explanations are also collapsed now. Five options each carrying a
  // paragraph plus a warning box buried the rest of the offer form; the one-line
  // description is enough to choose from, and the detail is one tap away.
  const [showDetail, setShowDetail] = useState(false);
  const options = [
    {
      id:"escrow_com", icon:"🏦", label:"Escrow.com", badge:"Online", badgeColor:C.green,
      tint:C.greenLight, line:"#a8d8b8",
      desc:"Licensed third-party escrow. Funds held securely until both parties confirm the deal is complete.",
      detail:"Escrow.com is a licensed, regulated escrow service. Neither buyer nor seller can access funds until conditions are met. Their fee is charged on the amount they hold — and here that's only the deposit, not the boat's purchase price. On a typical deposit that works out to a couple of hundred dollars. Sign-up requires identity verification, which can take a day or two, so start it early rather than on the day the deposit is due. BoatClosers has no affiliation with Escrow.com and earns nothing from their fees.",
      warn:"Escrow.com's policy: if the buyer rejects the vessel or the transaction is cancelled after funds have been approved, the BUYER pays the escrow fee — even if you agreed the seller would cover it. Budget for that before you reject. BoatClosers.com has no affiliation with Escrow.com, earns no referral fee, and is not responsible for their services, fees, or outcomes. Deposit return is solely between buyer, seller, and Escrow.com per their agreement.",
    },
    {
      id:"direct", icon:"💵", label:"Direct to Seller", badge:"Simple", badgeColor:C.slate,
      tint:C.sandDark, line:C.mist,
      desc:"Buyer sends the deposit straight to the seller. Faster, but no neutral third party holds the money.",
      detail:"Deposit return in the event of deal failure is entirely between buyer and seller. BoatClosers documents (Deposit Receipt, Rejection Notice) support your claim but we do not hold or release funds.",
      warn:"This is the least protected option. If the deal falls apart, getting the deposit back depends entirely on the seller. BoatClosers provides the Deposit Receipt and Rejection Notice to support your claim, but we do not hold, verify, or release any funds.",
    },
    {
      id:"attorney", icon:"⚖️", label:"Third Party Attorney", badge:"Professional", badgeColor:C.teal,
      tint:C.tealLight, line:C.teal,
      desc:"A licensed attorney or title company holds the deposit. Common on larger or more complex deals.",
      detail:"Both parties agree on an attorney or title company to act as escrow agent. Many charge a flat fee for holding a deposit rather than a percentage, which on a larger deposit is often cheaper than an online escrow service — worth asking for a quote before you decide. Their fees and terms are outside BoatClosers. Our documents support the transaction but we are not involved in fund handling.",
      warn:"Agree on the attorney or title company in writing before transferring any funds. BoatClosers documents (Escrow Instructions, Closing Statement) can be shared with them to support their work.",
    },
    {
      id:"brokerage", icon:"🛥️", label:"Licensed Broker", badge:"Brokerage", badgeColor:C.navy,
      tint:"#eef2f7", line:C.navy,
      desc:"A state-licensed yacht brokerage holds the deposit in their trust account.",
      detail:"If the boat is listed with a broker — or you're using a buyer's broker — a state-licensed brokerage can hold the deposit in their trust/escrow account per state law. Brokerage trust accounts are regulated by the state and often carry little or no separate holding fee, since it's part of the brokerage's normal business. Any commission and terms are between you and the broker.",
      warn:"Confirm the brokerage is licensed in the boat's state and get the escrow terms in writing before sending funds. The broker holds the deposit in their trust account; BoatClosers does not hold, verify, or release funds.",
    },
    {
      id:"custom", icon:"✍️", label:"Custom / Other", badge:"Your Terms", badgeColor:C.slate,
      tint:"#fff9ee", line:C.brass,
      desc:"You've agreed on another holder or method — describe it in your terms.",
      detail:"Use this if you've agreed on a holder or method not listed (a bank, a mutual escrow agent, or another arrangement). BoatClosers does not hold or release funds.",
      warn:"Check who you're sending money to before you send it. Independent boat closing and documentation agents are not always bonded, licensed, or subject to fiduciary duty — the oversight on them is thin compared with attorneys, licensed brokerages, and regulated escrow companies. Ask whether they are bonded and licensed in their state, and get it in writing. Then spell out who holds the deposit and the exact terms in Additional Contingencies above, so it appears on the Purchase Agreement.",
    },
    {
      id:"none", icon:"🚫", label:"No Deposit", badge:"None", badgeColor:C.slate,
      tint:"#f4f4f5", line:C.mist,
      desc:"No earnest money on this offer. The boat is not held off the market and the deal moves straight to due diligence.",
      detail:"Some cash buyers or quick private sales skip earnest money entirely. There's nothing for either party to send or confirm — the deal proceeds directly. Be aware the seller isn't committing to hold the boat for you, and can keep showing it to other buyers.",
      warn:"With no deposit, nothing holds the boat off the market. The seller can accept another offer at any time before closing, and you have no earnest money at stake to signal commitment.",
    },
  ];
  const selected = options.find(o => o.id === value) || null;

  return (
    <div>
      <div className="bc-grid3" style={{ gap:8, marginBottom:8 }}>
        {options.map(opt=>(
          <button key={opt.id} onClick={()=>{ onChange(opt.id); setShowDetail(false); }} style={{ padding:"10px 8px", borderRadius:6, cursor:"pointer", border:`2px solid ${value===opt.id?opt.badgeColor:C.mist}`, background:value===opt.id?opt.tint:"transparent", textAlign:"center", fontFamily:"sans-serif", transition:"all 0.15s" }}>
            <div style={{ fontSize:18, marginBottom:4 }}>{opt.icon}</div>
            <div style={{ fontSize:12, fontWeight:700, color:value===opt.id?opt.badgeColor:C.navy }}>{opt.label}</div>
            <div style={{ fontSize:9, color:value===opt.id?opt.badgeColor:C.slate, marginTop:2, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{opt.badge}</div>
          </button>
        ))}
      </div>

      {!selected ? (
        <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:"#b91c1c", fontWeight:700, lineHeight:1.5 }}>
          Choose where the deposit will be held.
        </div>
      ) : (
        <div style={{ background:selected.tint, border:`1px solid ${selected.line}`, borderRadius:6, padding:"10px 13px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
            <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.text, lineHeight:1.6, flex:1 }}>{selected.desc}</div>
            <button onClick={()=>setShowDetail(v=>!v)} style={{ background:"none", border:`1px solid ${selected.line}`, borderRadius:5, color:selected.badgeColor, fontSize:10.5, fontFamily:"sans-serif", fontWeight:700, padding:"4px 9px", cursor:"pointer", whiteSpace:"nowrap" }}>
              {showDetail ? "Hide details ▲" : "Details ▾"}
            </button>
          </div>
          {showDetail && (
            <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${selected.line}` }}>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.text, lineHeight:1.7, marginBottom:8 }}>{selected.detail}</div>
              <div style={{ background:"rgba(255,255,255,0.65)", border:`1px solid ${selected.line}`, borderRadius:5, padding:"8px 11px", fontSize:11, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
                {selected.warn}
              </div>
            </div>
          )}
          {value==="escrow_com" && depositAmt > 0 && (
            <div style={{ background:"#fff", border:`1px solid ${selected.line}`, borderRadius:5, padding:"9px 11px", marginTop:9, fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7 }}>
              <b style={{ color:C.navy }}>What this actually costs:</b> Escrow.com charges on the amount they hold. You&rsquo;re escrowing the <b>{fmt(depositAmt)} deposit</b>, not the boat&rsquo;s full price &mdash; so the fee is roughly <b style={{ color:C.green }}>{fmt(escrowComFee(depositAmt))}</b>, not a percentage of the whole sale.
              <br/><span style={{ fontSize:11 }}>Estimate based on their published tiers; check their calculator for the current rate. Note their policy: if the buyer rejects the vessel or cancels after funds are approved, the buyer pays the escrow fee.</span>
            </div>
          )}
          {value==="escrow_com" && (
            <a href="https://www.escrow.com" target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.green, color:"#fff", borderRadius:5, padding:"7px 14px", fontSize:11.5, fontFamily:"sans-serif", fontWeight:700, textDecoration:"none", marginTop:9 }}>
              🏦 Open Escrow.com →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EARNEST MONEY RECEIPT MODAL
// ─────────────────────────────────────────────────────────────────────────────
// The Deposit Receipt is the single signing surface for the earnest money.
// Both parties sign the SAME document — the buyer attests they sent the funds,
// the seller attests they arrived — the way they both sign the Purchase Agreement.
// Keeping it in one document instead of scattered inline fields is what makes it
// legible to a customer: one receipt, two signatures, done.
function EarnestReceiptModal({ open, onClose, vessel, parties, negotiate, setNegotiate, myRole }) {
  const [refNo, setRefNo] = useState("");
  const [sigName, setSigName] = useState("");
  const [note, setNote] = useState("");
  if (!open) return null;

  const isBuyer = myRole !== "seller";
  // Same split source that blanked the price on the Bill of Sale: the agreed
  // figures live on the accepted offer, and negotiate.deposit / agreedPrice are
  // only written on some paths. Take the offer first — on a signed receipt a
  // blank amount is worse than useless.
  const _terms = agreedTerms(negotiate);
  const amt = fmt(_terms.deposit);
  const price = fmt(_terms.price);
  // Same split source again: the escrow method is agreed on the offer, so a deal
  // that never wrote negotiate.escrowPath showed "Direct to Seller" on the receipt
  // while the rest of the app correctly ran the Escrow.com flow.
  const escrowLabel = escLabel(_terms.escrowPath);
  // For Escrow.com deals the "reference" the buyer enters IS the Escrow.com
  // transaction ID — a number the app can later check against the API to confirm
  // funding automatically. Captured as its own field so the automated pieces have a
  // clean, validated value, separate from the free-text references used by
  // attorney/broker/direct deals.
  const isEscrowCom = _terms.escrowPath === "escrow_com";
  const proof = negotiate.depositProof || null;
  const verif = negotiate.depositVerification || null;
  const buyerSigned = !!(proof && proof.sig);
  const sellerSigned = !!(verif && verif.status === "confirmed" && verif.sig);
  const disputed = verif?.status === "disputed";

  const signAsBuyer = () => {
    if (!refNo.trim() || !sigName.trim() || !setNegotiate) return;
    if (isEscrowCom && !/^\d+$/.test(refNo.trim())) return;
    if (!sigMatchesName(sigName, parties.buyer?.name)) return;
    setNegotiate(n => ({ ...n, depositProof: { ref: refNo.trim(), note: note.trim(), sig: sigName.trim(), at: Date.now(), by: "buyer" }, depositVerification: null, depositBuyerConfirmed: { at: Date.now(), name: sigName.trim(), ref: refNo.trim() }, ...(isEscrowCom ? { escrowTxId: refNo.trim() } : {}) }));
    setRefNo(""); setSigName(""); setNote("");
  };
  const signAsSeller = () => {
    if (!sigName.trim() || !setNegotiate) return;
    if (!sigMatchesName(sigName, parties.seller?.name)) return;
    // Set BOTH the verification record AND the depositSellerConfirmed flag that
    // depVerified reads. Previously this only set depositVerification, so the
    // seller's signature never counted toward "both confirmed" and the deal stayed
    // locked forever. Now the seller signing the receipt IS their confirmation —
    // exactly mirroring how signAsBuyer sets depositBuyerConfirmed.
    setNegotiate(n => ({ ...n, depositVerification: { status: "confirmed", at: Date.now(), by: "seller", note: note.trim(), sig: sigName.trim() }, depositSellerConfirmed: { at: Date.now(), name: sigName.trim() } }));
    setSigName(""); setNote("");
  };
  const disputeAsSeller = () => {
    if (!setNegotiate) return;
    setNegotiate(n => ({ ...n, depositVerification: { status: "disputed", at: Date.now(), by: "seller", note: note.trim() } }));
    setSigName(""); setNote("");
  };

  const sigLine = (label, name, when, extra) => (
    <div style={{ flex:1, minWidth:200 }}>
      <div style={{ borderBottom:`1px solid ${C.slate}`, minHeight:26, fontSize:14, fontFamily:"Georgia, serif", fontStyle:"italic", color:C.navy, paddingBottom:2 }}>{name || ""}</div>
      <div style={{ fontSize:9.5, color:C.slate, marginTop:3, lineHeight:1.5 }}>{label}{when ? ` · ${when}` : ""}{extra ? <><br/>{extra}</> : null}</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:"1rem", overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:10, width:"100%", maxWidth:560, border:`2px solid ${C.brass}`, overflow:"hidden", margin:"auto" }}>
        <div style={{ background:C.navy, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:C.brass, fontFamily:"sans-serif", textTransform:"uppercase" }}>BoatClosers.com</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>Earnest Money Deposit Receipt</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", borderRadius:5, width:28, height:28, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"1.5rem" }}>
          <div style={{ background:C.sandDark, borderRadius:6, padding:"16px 18px", fontSize:12, fontFamily:"sans-serif", lineHeight:2, color:C.text, marginBottom:16 }}>
            <div style={{ textAlign:"center", borderBottom:`1px solid ${C.mist}`, paddingBottom:10, marginBottom:12 }}>
              <div style={{ fontSize:14, fontWeight:800, letterSpacing:1 }}>DEPOSIT RECEIPT</div>
              <div style={{ fontSize:10, color:C.slate }}>Date: {today()}</div>
            </div>
            <div><strong>Received from (Buyer):</strong> {parties.buyer.name || <span style={{ borderBottom:"1px solid #b9b2a4", display:"inline-block", minWidth:120 }}>&nbsp;</span>}</div>
            <div><strong>Received by (Seller):</strong> {parties.seller.name || <span style={{ borderBottom:"1px solid #b9b2a4", display:"inline-block", minWidth:120 }}>&nbsp;</span>}</div>
            <div><strong>Vessel:</strong> {vessel.year||""} {vessel.make||""} {vessel.model||""} · HIN: {vessel.hin || <span style={{ borderBottom:"1px solid #b9b2a4", display:"inline-block", minWidth:110 }}>&nbsp;</span>}</div>
            <div><strong>Purchase Price:</strong> {price}</div>
            <div style={{ background:"#fff", border:`1px solid ${C.brass}`, borderRadius:4, padding:"8px 12px", margin:"8px 0" }}>
              <strong style={{ fontSize:14 }}>Earnest Money Amount: {amt}</strong>
            </div>
            <div><strong>Escrow Method:</strong> {escrowLabel}</div>
            {proof?.ref && <div><strong>Confirmation / Reference #:</strong> {proof.ref}</div>}
            {proof?.note && <div style={{ fontSize:11, color:C.slate }}>Buyer's note: {proof.note}</div>}
            {verif?.note && <div style={{ fontSize:11, color:C.slate }}>Seller's note: {verif.note}</div>}
            <div style={{ fontSize:10, color:C.slate, marginTop:8, lineHeight:1.6 }}>
              This receipt confirms that earnest money in the amount stated above has been tendered by the Buyer as a deposit toward the purchase of the vessel described. Deposit return or forfeiture is governed by the terms of the Purchase and Sale Agreement executed between the parties. BoatClosers.com is not a party to this transaction, does not hold these funds, does not verify their receipt, and is not responsible for deposit return or disbursement.
            </div>
            <div style={{ display:"flex", gap:18, flexWrap:"wrap", marginTop:16, paddingTop:12, borderTop:`1px solid ${C.mist}` }}>
              {sigLine("Buyer — sent the deposit", proof?.sig, proof?.at ? new Date(proof.at).toLocaleDateString() : "", buyerSigned ? null : "Not yet signed")}
              {sigLine("Seller — confirmed receipt", sellerSigned ? verif.sig : "", sellerSigned && verif?.at ? new Date(verif.at).toLocaleDateString() : "", sellerSigned ? null : "Not yet signed")}
            </div>
          </div>

          {disputed && (
            <div style={{ background:C.redLight, border:`1px solid ${C.red}`, borderRadius:6, padding:"11px 13px", marginBottom:14, fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:C.red, marginBottom:3 }}>⚠️ The seller reports these funds have not arrived</div>
              <div style={{ fontSize:12, color:C.slate, lineHeight:1.6 }}>{verif.note ? `Their note: ${verif.note}. ` : ""}Wires can take 1&ndash;2 business days to land. Check with your escrow agent, then the buyer can sign a corrected receipt below.</div>
            </div>
          )}

          {isBuyer && (!buyerSigned || disputed) && (
            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:6, padding:"13px 15px", fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:"#7a5500", marginBottom:7 }}>Sign as the buyer</div>
              <label style={S.label}>{isEscrowCom ? "Escrow.com transaction ID" : "Confirmation / reference #"}</label>
              <input style={S.input} value={refNo} onChange={e=>setRefNo(e.target.value)} placeholder={isEscrowCom ? "e.g. 5588989 — the numbered ID from your Escrow.com transaction" : "Wire confirmation, escrow transaction #, or check #"} />
              {isEscrowCom && (
                <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginTop:4 }}>
                  You&rsquo;ll find this number on your transaction at escrow.com &mdash; it&rsquo;s how BoatClosers confirms your deposit automatically, so you won&rsquo;t have to wait on the seller to verify it by hand.
                </div>
              )}
              {isEscrowCom && refNo.trim() && !/^\d+$/.test(refNo.trim()) && (
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.red, fontWeight:700, marginTop:4 }}>The Escrow.com transaction ID is numbers only.</div>
              )}
              <div style={{ height:8 }}/>
              <label style={S.label}>Note (optional)</label>
              <input style={S.input} value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Wired from Chase on 8/14" />
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, margin:"10px 0 7px" }}>
                By typing your full name you sign this receipt, confirming you have <b>actually sent</b> the {amt} earnest money as described. Your signature is recorded with the date and time.
              </div>
              <input style={S.input} value={sigName} onChange={e=>setSigName(e.target.value)} placeholder="Type your full name to sign" />
              {parties.buyer?.name && sigName.trim() && !sigMatchesName(sigName, parties.buyer.name) && (
                <div style={{ fontSize:11.5, color:C.red, fontFamily:"sans-serif", fontWeight:700, marginTop:5, lineHeight:1.5 }}>Your signature must match the buyer name on this deal: <b>{parties.buyer.name}</b>.</div>
              )}
              <button style={{...S.btnBrass, width:"100%", marginTop:10, fontSize:13, padding:"11px", opacity:(refNo.trim()&&sigName.trim()&&(!isEscrowCom||/^\d+$/.test(refNo.trim()))&&sigMatchesName(sigName, parties.buyer?.name))?1:0.5}} disabled={!refNo.trim()||!sigName.trim()||(isEscrowCom&&!/^\d+$/.test(refNo.trim()))||!sigMatchesName(sigName, parties.buyer?.name)} onClick={signAsBuyer}>Sign the receipt</button>
            </div>
          )}

          {!isBuyer && buyerSigned && !sellerSigned && (
            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:6, padding:"13px 15px", fontFamily:"sans-serif" }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:"#7a5500", marginBottom:7 }}>Sign as the seller</div>
              <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:6, padding:"10px 12px", fontSize:12, color:C.slate, lineHeight:1.6, marginBottom:10 }}>
                <b>Before you sign:</b> confirm with your escrow agent, attorney, or bank that the {amt} is actually <b>in the account</b>. Don't rely on a screenshot or the buyer's word &mdash; a wire can be recalled, and a confirmation number is not proof the money landed.
              </div>
              <label style={S.label}>Note (optional &mdash; the buyer sees this)</label>
              <input style={S.input} value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Escrow.com shows funds received 8/14" />
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, margin:"10px 0 7px" }}>
                By typing your full name you sign this receipt, confirming the {amt} <b>has arrived</b> and you verified it yourself. Signing releases the deal into due diligence.
              </div>
              <input style={S.input} value={sigName} onChange={e=>setSigName(e.target.value)} placeholder="Type your full name to sign" />
              {parties.seller?.name && sigName.trim() && !sigMatchesName(sigName, parties.seller.name) && (
                <div style={{ fontSize:11.5, color:C.red, fontFamily:"sans-serif", fontWeight:700, marginTop:5, lineHeight:1.5 }}>Your signature must match the seller name on this deal: <b>{parties.seller.name}</b>.</div>
              )}
              <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                <button style={{...S.btn, background:C.green, color:"#fff", flex:1, minWidth:170, fontSize:13, padding:"11px", opacity:(sigName.trim()&&sigMatchesName(sigName, parties.seller?.name))?1:0.5}} disabled={!sigName.trim()||!sigMatchesName(sigName, parties.seller?.name)} onClick={signAsSeller}>✓ Sign &mdash; funds received</button>
                <button style={{...S.btnOutline, flex:1, minWidth:170, fontSize:13, padding:"11px"}} onClick={disputeAsSeller}>Not received yet</button>
              </div>
            </div>
          )}

          {isBuyer && buyerSigned && !sellerSigned && !disputed && (
            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:6, padding:"12px 14px", fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
              <b style={{ color:"#7a5500" }}>You've signed.</b> The seller now confirms the funds arrived and signs the same receipt. You'll be emailed the moment they do, and due diligence opens then.
            </div>
          )}
          {!isBuyer && !buyerSigned && (
            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:6, padding:"12px 14px", fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
              Waiting for the buyer to send the deposit and sign this receipt. You'll be emailed when they do, and you'll sign underneath to confirm it arrived.
            </div>
          )}
          {buyerSigned && sellerSigned && (
            <div style={{ background:C.greenLight, border:"1px solid #a8d8b8", borderRadius:6, padding:"12px 14px", fontSize:12.5, fontFamily:"sans-serif", color:C.green, lineHeight:1.6, fontWeight:700 }}>
              ✓ Fully signed by both parties — this deal is secured and due diligence is open.
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
function RejectionNotice({ rejection, escrowPath, viewerRole, vessel, isInitiator }) {
  // The ref must be created before any early return: React counts hooks per render,
  // and bailing out first meant the count changed the moment a deal was rejected —
  // "Rendered more hooks than during the previous render", and a blank screen.
  const noticeRef = useRef(null);
  if (!rejection) return null;
  const printNotice = () => {
    const node = noticeRef.current;
    if (!node) return;
    const w = window.open("", "_blank", "width=820,height=940");
    if (!w) { alert("Please allow pop-ups for this site so you can print or save the notice."); return; }
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Vessel Rejection Notice</title><style>body{font-family:Georgia,serif;color:#222;max-width:720px;margin:0 auto;padding:30px;line-height:1.6}@media print{@page{margin:0.6in}}</style></head><body><div style="text-align:center;border-bottom:2px solid #b0863c;padding-bottom:10px;margin-bottom:18px"><div style="letter-spacing:3px;font-size:11px;color:#b0863c;font-weight:700">BOATCLOSERS.COM</div><div style="font-size:18px;font-weight:700;margin-top:6px">Vessel Rejection &amp; Deposit-Return Record</div></div>' + node.innerHTML + '<scr'+'ipt>window.onload=function(){setTimeout(function(){window.print();},250);};</scr'+'ipt></body></html>');
    w.document.close();
  };
  const reasons = (rejection.reasons||[]).map(id => REJECTION_REASONS.find(r=>r.id===id)).filter(Boolean);
  const pathLabel = escrowPath==="escrow_com" ? "Escrow.com" : escrowPath==="attorney" ? "a closing attorney's trust account" : "a direct party-to-party deposit";
  const refundSteps = escrowPath==="escrow_com"
    ? ["Open your Escrow.com transaction for this deal.", "Either party requests cancellation; Escrow.com returns the buyer's deposit through their standard cancellation process.", "Make sure both parties receive Escrow.com's written cancellation confirmation."]
    : escrowPath==="attorney"
    ? ["Contact the closing attorney holding the deposit in trust.", "Both parties instruct the attorney in writing to return the deposit to the buyer.", "Keep the attorney's written confirmation of the return for your records."]
    : ["Whoever is holding the deposit returns it directly to the buyer, by the same method it was paid.", "Both parties confirm the return in writing (a simple email is fine).", "Keep that written confirmation for your records."];
  return (
    <div>
    <div ref={noticeRef} style={{ border:`1px solid ${C.red}`, borderRadius:8, overflow:"hidden", marginTop:4 }}>
      <div style={{ background:C.red, color:"#fff", padding:"10px 14px", fontSize:12, fontWeight:700, fontFamily:"sans-serif", letterSpacing:0.5 }}>VESSEL REJECTION NOTICE — DEAL ENDED</div>
      {isInitiator && (
        <div style={{ background:"#eef7f0", borderBottom:`1px solid ${C.green}`, padding:"12px 16px", fontFamily:"sans-serif" }}>
          <div style={{ fontSize:12, fontWeight:800, color:"#166534", letterSpacing:0.3, marginBottom:4 }}>💡 Your fee carries over — 60-day credit</div>
          <div style={{ fontSize:11.5, color:"#256b3f", lineHeight:1.65 }}>
            This deal fell through, so you don't start over from scratch. As the party who paid, you have <b>60 days from today</b> to begin a new deal — a backup buyer, or a different boat — with no additional fee. The one-time $249 is only fully used once a deal actually closes. If you don't start a new deal within 60 days, the credit expires.
          </div>
        </div>
      )}
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
    <div style={{ marginTop:12, background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:8, padding:"12px 14px", fontFamily:"sans-serif" }}>
      <div style={{ fontSize:12.5, fontWeight:800, color:"#7a5500", marginBottom:4 }}>📄 Keep this on file{isInitiator ? " — your proof of records" : ""}</div>
      <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6, marginBottom:10 }}>
        {isInitiator
          ? "This rejection notice is your official record of why the deal ended and how the earnest-money deposit is returned. Save or print a copy now and keep it — you may need it for the deposit return or your records."
          : "Save or print a copy of this rejection notice for your records."}
      </div>
      <button onClick={printNotice} style={{ ...S.btnBrass, fontSize:13, padding:"9px 18px" }}>🖨️ Print / Save Rejection Notice</button>
    </div>
    </div>
  );
}

function StepDueDiligence({ data, setData, setNegotiate, vessel, parties, terms, negotiate, myRole, amInitiator, dealId, onNext, onBack, authToken }) {
  const set = (k,v) => setData(d => ({...d,[k]:v}));
  const isBuyer = myRole !== "seller";
  // ── Earnest-money deposit timeline: set at lock, buyer proves, seller may extend ──
  const [proofRef, setProofRef] = useState("");
  const [proofNote, setProofNote] = useState("");
  const dep = negotiate || {};
  const _ddTerms = agreedTerms(negotiate);
  const depHasProof = !!(dep.depositProof && dep.depositProof.ref);
  const depDeadline = Number(dep.depositDeadline) || 0;
  const depEnded = !!dep.depositEnded;
  // Submitting proof no longer secures the deal by itself — it hands the claim to
  // the seller to verify. Resubmitting after a dispute clears the old verdict.
  const [proofSig, setProofSig] = useState("");
  const submitProof = () => { if (proofRef.trim() && proofSig.trim() && setNegotiate) setNegotiate(n => ({ ...n, depositProof: { ref: proofRef.trim(), note: proofNote.trim(), sig: proofSig.trim(), at: Date.now(), by: "buyer" }, depositVerification: null })); };
  // ── Deposit verification handshake ──────────────────────────────────────────
  // The buyer can only ever CLAIM the money was sent; the seller (or their escrow
  // agent) is the one who can actually see it arrive. So the deal HOLDS between
  // those two moments: proof submitted → seller confirms → secured. Without this,
  // a typed reference number alone was enough to move a deal forward.
  // ── Due Diligence is gated on the deposit ──────────────────────────────────
  // The deposit exists so the buyer can survey, sea-trial and inspect WITHOUT the
  // seller selling the boat out from under them. That protection has to be in
  // place BEFORE the inspection period starts, not settled halfway through it.
  // If the accepted offer carried no deposit, there is nothing to wait for and
  // Due Diligence opens immediately.
  const depositRequired = _ddTerms.deposit > 0;
  const depBuyerSigned = !!(dep.depositProof && dep.depositProof.sig);
  const depSellerSigned = !!(dep.depositVerification && dep.depositVerification.status === "confirmed" && dep.depositVerification.sig);
  const depVerif = dep.depositVerification || null;
  const depDisputed = depVerif?.status === "disputed";
  // ── Who can actually confirm the deposit depends on WHERE it went ──────────
  //   • escrow_com  → Escrow.com's API confirms it. No signatures.
  //   • direct      → money hit the SELLER's own account; only they can see it,
  //                   so the seller confirms. This is the one path where a seller
  //                   confirmation is a real fact, not a guess.
  //   • attorney/broker → money is in a third party's trust account the seller
  //                   CAN'T see. Asking them to "confirm" is asking them to guess.
  //                   Instead the BUYER's signed claim (with reference #) opens due
  //                   diligence — a signed statement that makes the buyer liable if
  //                   it's false. We trust the bonded professional holding the funds,
  //                   not the buyer's honesty alone.
  const escMethod = _ddTerms.escrowPath;
  const apiConfirms = escMethod === "escrow_com";
  // ── THE APP ONLY VERIFIES. It is not part of moving the money. ─────────────
  // The buyer sends the deposit outside the app (to the seller, an attorney, a
  // broker escrow — the app has nothing to do with that). The app's ONLY job is
  // to know the deposit happened so the deal can move forward.
  //   • Escrow.com  → the app is CONNECTED, so it verifies AUTOMATICALLY. No clicks.
  //   • Every other → the app can't see the money, so BOTH parties confirm:
  //                   the buyer ("I've sent it") and the seller ("I received it").
  //                   Two confirmations, one from each side, and the deal moves.
  // A party is confirmed if EITHER their explicit flag is set OR they've signed the
  // earnest-money receipt. The receipt signature is the strongest confirmation, so
  // a fully-signed receipt unlocks the deal even if the flags weren't written.
  const buyerSignedReceipt = !!(dep.depositProof && dep.depositProof.sig);
  const sellerSignedReceipt = !!(dep.depositVerification && dep.depositVerification.status === "confirmed" && dep.depositVerification.sig);
  const depBuyerConfirmed = !!dep.depositBuyerConfirmed || buyerSignedReceipt;
  const depSellerConfirmed = !!dep.depositSellerConfirmed || sellerSignedReceipt;
  const depVerified = apiConfirms
    ? (depVerif?.status === "confirmed")        // Escrow.com API verified it
    : (depBuyerConfirmed && depSellerConfirmed); // both sides confirmed (flag OR signed receipt)
  // ── Deposit no longer HARD-gates due diligence ────────────────────────────
  // The buyer can start the lead-time work — booking a surveyor, arranging a sea
  // trial — while the deposit is still being funded/verified, because those things
  // take days to schedule and waiting wastes everyone's time. What the deposit
  // still governs is the FINISH: the buyer can't ACCEPT or REJECT the vessel until
  // the deposit is verified, so nobody reaches the closing line on an unfunded deal.
  const depositSecured = !depositRequired || depVerified;
  // The waived flag lets the initiator say "proceed without waiting" (below).
  const depositWaived = !!dep.depositTimerWaived;
  // "Paused" = a required deposit's deadline passed without verification and the
  // initiator hasn't resolved it. Planning stays open; the decision gets locked.
  const depTimerExpired = depositRequired && !depVerified && !depositWaived && depDeadline > 0 && Date.now() > depDeadline && !depEnded;
  const decisionUnlocked = depositSecured || depositWaived;
  // Kept for older references: DD content renders; only the decision is gated now.
  const ddOpen = true;
  const depAwaitingVerify = depositRequired && !depVerified && !depEnded;
  const [verifyNote, setVerifyNote] = useState("");
  const [verifySig, setVerifySig] = useState("");
  const confirmDeposit = () => { if (verifySig.trim() && setNegotiate) setNegotiate(n => ({ ...n, depositVerification: { status: "confirmed", at: Date.now(), by: "seller", note: verifyNote.trim(), sig: verifySig.trim() } })); };
  const disputeDeposit = () => { if (setNegotiate) setNegotiate(n => ({ ...n, depositVerification: { status: "disputed", at: Date.now(), by: "seller", note: verifyNote.trim() } })); };
  // ── Deposit checkpoint: the seller must say WHERE the money goes, and the buyer
  // must acknowledge it and commit to the deadline, before proof can be submitted.
  // This is what forces the deposit conversation to actually happen in the deal
  // instead of dying in a text thread.
  const depInstr = dep.depositInstructions || null;
  const depInstrPosted = !!(depInstr && depInstr.details);
  const depCommit = dep.depositCommitment || null;
  const depCommitted = !!(depCommit && depCommit.name);
  // The escrow method was negotiated in the offer and printed on the signed Purchase
  // Agreement. This form used to default to "Escrow.com" regardless, so a deal agreed
  // on an attorney trust account could be issued Escrow.com instructions — contract and
  // instructions saying different things, with nothing flagging it.
  const agreedMethod = ({
    escrow_com: "Escrow.com",
    attorney: "Attorney / title company trust account",
    brokerage: "Licensed broker escrow account",
    direct: "Direct to seller (no third party)",
    custom: "Other",
  })[dep.escrowPath] || "";
  const [instrMethod, setInstrMethod] = useState(agreedMethod || "Escrow.com");
  const methodDiffers = !!(agreedMethod && instrMethod !== agreedMethod);
  const [instrDetails, setInstrDetails] = useState("");
  const [commitName, setCommitName] = useState("");
  const postInstructions = () => { if (instrDetails.trim() && setNegotiate) setNegotiate(n => ({ ...n, depositInstructions: { method: instrMethod, details: instrDetails.trim(), at: Date.now() } })); };
  // ── The two confirmations (non-Escrow.com deals) ──────────────────────────
  // Each party marks their own side. The deal moves when both are in. No account
  // details, no posting — the money moved outside the app; this just records that
  // it happened, from both perspectives, so neither side can fake it alone.
  const confirmBuyerSent = () => { if (setNegotiate) setNegotiate(n => ({ ...n, depositBuyerConfirmed: { at: Date.now(), name: (parties?.buyer?.name || "Buyer") } })); };
  const confirmSellerReceived = () => { if (setNegotiate) setNegotiate(n => ({ ...n, depositSellerConfirmed: { at: Date.now(), name: (parties?.seller?.name || "Seller") } })); };
  const undoMyDepositConfirm = () => {
    if (!setNegotiate) return;
    if (isBuyer) setNegotiate(n => { const c = { ...n }; delete c.depositBuyerConfirmed; return c; });
    else setNegotiate(n => { const c = { ...n }; delete c.depositSellerConfirmed; return c; });
  };
  // Wire-fraud guard: changing posted instructions VOIDS the buyer's commitment and
  // flags the change, so a swapped account number can never slip through on the back
  // of an agreement the buyer made to different details. This is the classic attack —
  // criminals watch the thread, then send "updated" wire info at the last minute.
  const [editingInstr, setEditingInstr] = useState(false);
  const openInstrEditor = () => { setInstrMethod(depInstr?.method || "Escrow.com"); setInstrDetails(depInstr?.details || ""); setEditingInstr(true); };
  const updateInstructions = () => {
    if (!instrDetails.trim() || !setNegotiate) return;
    setNegotiate(n => ({ ...n, depositInstructions: { method: instrMethod, details: instrDetails.trim(), at: Date.now() }, depositCommitment: null, depositInstrChangedAt: Date.now() }));
    setEditingInstr(false);
  };
  const signCommitment = () => { if (commitName.trim() && setNegotiate) setNegotiate(n => ({ ...n, depositCommitment: { name: commitName.trim(), at: Date.now(), amount: n.deposit, deadline: n.depositDeadline } })); };
  const extendDeposit = (h) => { if (setNegotiate) setNegotiate(n => ({ ...n, depositDeadline: Date.now() + h*3600*1000, depositEnded: false, depositTimerWaived: false })); };
  const [customExtend, setCustomExtend] = useState("");
  const extendDepositTo = (dateStr) => { const t = Date.parse(dateStr + "T23:59:59"); if (t && setNegotiate) setNegotiate(n => ({ ...n, depositDeadline: t, depositEnded: false, depositTimerWaived: false })); setCustomExtend(""); };
  // Initiator chooses to proceed without waiting for verification. One-time per
  // expiry: it clears THIS lapse and unlocks the decision; a later stall re-arms.
  const waiveDepositTimer = () => { if (setNegotiate) setNegotiate(n => ({ ...n, depositTimerWaived: true })); };
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
  // The buyer must pass a plain-language commitment warning before the acceptance
  // signing appears. Accepting the vessel waives contingencies and commits them to
  // close — walking away after this risks their deposit. Make that unmissable.
  const [acceptCommitAck, setAcceptCommitAck] = useState(!!negotiate?.vesselAcceptance);
  const [showReceipt, setShowReceipt] = useState(false);
  // The Deal Room banner sets openReceipt when the buyer taps "send the earnest
  // money", so they arrive with the receipt already open rather than hunting for it.
  useEffect(() => {
    if (!negotiate?.openReceipt) return;
    setNegotiate(n => { const x = { ...n }; delete x.openReceipt; return x; });
    setTimeout(() => setShowReceipt(true), 120);
  }, [negotiate?.openReceipt]); // eslint-disable-line
  // ── DEPOSIT GATE ───────────────────────────────────────────────────────────
  // The deposit is in control of forward motion. Any attempt to move the deal on
  // (accept/reject/propose the vessel, continue to documents) runs through
  // requireDeposit(). If the deposit isn't verified, it opens the deposit modal
  // right there — reminding them and letting them finish it — instead of letting
  // them proceed. Planning stays open; only forward motion is gated.
  const [depositGateOpen, setDepositGateOpen] = useState(false);
  const requireDeposit = (fn) => () => {
    if (decisionUnlocked) { fn(); return; }
    setDepositGateOpen(true);
  };
  // ── Live Escrow.com status (Piece 2) ───────────────────────────────────────
  // For Escrow.com deals, ask the server what Escrow.com reports about this deal's
  // transaction, and show the customer where it stands. Read-only display; it does
  // not advance the deal (that's Piece 3). Runs on open and on a manual Refresh.
  const [escStatus, setEscStatus] = useState(null);
  const [escLoading, setEscLoading] = useState(false);
  const dealIsEscrowCom = negotiate?.escrowPath === "escrow_com";
  const dealTxId = negotiate?.escrowTxId || "";
  const refreshEscrow = useCallback(async () => {
    if (!dealIsEscrowCom || !dealTxId || !dealId) return;
    setEscLoading(true);
    try {
      const r = await fetch("/api/deals/escrow-status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const j = await r.json();
      setEscStatus(j);
      // Piece 3: the SERVER verifies (tamper-proof). If it just did, mirror that
      // into local state so due diligence opens immediately, no reload needed.
      if (j?.autoVerified && setNegotiate) {
        setNegotiate(n => (n?.depositVerification?.status === "confirmed" ? n : ({
          ...n,
          depositVerification: {
            status: "confirmed", at: Date.now(), by: "escrow_com_api",
            note: `Automatically confirmed by Escrow.com — transaction #${dealTxId} is funded.`,
            sig: "Escrow.com (verified via API)", auto: true,
          },
        })));
      }
    } catch { setEscStatus({ ok:false, error:"Couldn't reach the server." }); }
    setEscLoading(false);
  }, [dealIsEscrowCom, dealTxId, dealId, setNegotiate]);
  useEffect(() => { refreshEscrow(); }, [refreshEscrow]);
  // ── Escrow.com 3-option flow (Piece 2) ─────────────────────────────────────
  // Option A: app creates the transaction via API. Option B: buyer creates it on
  // escrow.com and enters the ID. Option C: app creates it but buyer reviews first.
  // Once a transaction exists (by any path), we show its LIVE status and auto-verify.
  const [escChoice, setEscChoice] = useState(null); // "auto" | "manual" | null
  const [escCreating, setEscCreating] = useState(false);
  const [escCreateErr, setEscCreateErr] = useState("");
  const createEscrowTx = useCallback(async () => {
    if (!dealId) return;
    setEscCreating(true); setEscCreateErr("");
    try {
      const r = await fetch("/api/deals/escrow-create", {
        method: "POST", headers: { "Content-Type": "application/json", ...(authToken ? { "Authorization": "Bearer " + authToken } : {}) },
        body: JSON.stringify({ dealId }),
      });
      const j = await r.json();
      if (j?.ok && j?.transactionId) {
        if (setNegotiate) setNegotiate(nn => ({ ...nn, escrowTxId: String(j.transactionId) }));
        setTimeout(() => refreshEscrow(), 400);
      } else {
        setEscCreateErr(j?.error || "Escrow.com couldn't create the transaction. Try again or set it up on escrow.com yourself.");
      }
    } catch {
      setEscCreateErr("Couldn't reach the server. Try again.");
    }
    setEscCreating(false);
  }, [dealId, setNegotiate, refreshEscrow]);

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
      ? (buyerDisc && buyerSigned && rejectionReasons.length>0 && rejSigName.trim() && sigMatchesName(rejSigName, parties.buyer?.name))
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
      <EarnestReceiptModal open={showReceipt} onClose={()=>setShowReceipt(false)} vessel={vessel} parties={parties} negotiate={negotiate} setNegotiate={setNegotiate} myRole={myRole} />
      {/* ── DEPOSIT GATE MODAL ────────────────────────────────────────────────
          Opens whenever someone tries to move the deal forward before the deposit
          is verified. It contains the deposit action itself, so they finish it
          right here rather than hunting for it. Closes automatically once verified. */}
      {depositGateOpen && !decisionUnlocked && (
        <div onClick={()=>setDepositGateOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:4000, padding:"1rem", fontFamily:"sans-serif" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, maxWidth:440, width:"100%", padding:"1.6rem", border:`2px solid ${C.brass}`, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontSize:26, textAlign:"center", marginBottom:6 }}>🔒</div>
            <div style={{ fontSize:17, fontWeight:800, color:C.navy, textAlign:"center", marginBottom:5 }}>Finish the deposit to move forward</div>
            <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, textAlign:"center", marginBottom:16 }}>
              The vessel decision and the rest of the deal stay locked until the {fmt(dep.deposit)} earnest-money deposit is verified. Your survey and sea-trial planning stay open &mdash; but nothing moves forward until this is done.
            </div>
            {apiConfirms ? (
              <div style={{ background:"#eff6ff", border:`1px solid #93c5fd`, borderRadius:8, padding:"14px 16px" }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#1d4ed8", marginBottom:4 }}>Verifying through Escrow.com</div>
                <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, marginBottom: (isBuyer && !dealTxId) ? 11 : 10 }}>
                  {dealTxId
                    ? <>BoatClosers checks transaction <b>#{dealTxId}</b> directly. Once it shows funded, this unlocks automatically.</>
                    : isBuyer
                      ? <>Open your transaction at <b>escrow.com</b>, fund the {fmt(dep.deposit)} deposit, then enter your transaction ID so we can verify it.</>
                      : <>The buyer funds on Escrow.com and it verifies automatically. Nothing needed from you.</>}
                </div>
                {isBuyer && !dealTxId && (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <a href="https://www.escrow.com/login" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, fontWeight:700, color:C.navy, border:`1px solid ${C.brass}`, borderRadius:6, padding:"9px 14px", textDecoration:"none" }}>Open Escrow.com ↗</a>
                    <button style={{...S.btnBrass, fontSize:12.5, padding:"9px 16px"}} onClick={()=>{ setDepositGateOpen(false); setShowReceipt(true); }}>Enter transaction ID →</button>
                  </div>
                )}
                {isBuyer && dealTxId && (
                  <button onClick={refreshEscrow} disabled={escLoading} style={{ ...S.btnOutline, fontSize:12, padding:"8px 14px" }}>{escLoading ? "Checking…" : "Check Escrow.com now"}</button>
                )}
              </div>
            ) : (
              <div style={{ background:"#fffdf5", border:`1px solid ${C.brass}`, borderRadius:8, padding:"15px 17px" }}>
                <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, marginBottom:12 }}>
                  The deposit is sent {escMethod === "attorney" ? "to the attorney/title company" : escMethod === "brokerage" ? "to the broker's trust account" : escMethod === "custom" ? "to the holder you agreed on" : "directly to the seller"}, outside BoatClosers. <b>Both of you confirm</b> once it's done.
                </div>
                {(isBuyer ? !depBuyerConfirmed : !depSellerConfirmed) ? (
                  <button onClick={()=>{ setDepositGateOpen(false); setShowReceipt(true); }} style={{ ...S.btnBrass, width:"100%", fontSize:14, fontWeight:800, padding:"12px 20px", marginBottom:12 }}>
                    📄 Sign the earnest-money receipt →
                  </button>
                ) : (
                  <div style={{ background:C.greenLight, border:`1px solid ${C.green}`, borderRadius:6, padding:"9px 12px", marginBottom:12, fontSize:12, color:C.navy }}>
                    ✓ You confirmed {isBuyer ? "you sent" : "you received"} the deposit.
                  </div>
                )}
                <div style={{ fontSize:12, color:C.slate, lineHeight:1.6, borderTop:`1px solid ${C.mist}`, paddingTop:10 }}>
                  {isBuyer
                    ? (depSellerConfirmed ? <><b style={{color:C.green}}>✓ The seller confirmed they received it.</b></> : <>Waiting on the seller to confirm they received it.</>)
                    : (depBuyerConfirmed ? <><b style={{color:C.green}}>✓ The buyer confirmed they sent it.</b></> : <>Waiting on the buyer to confirm they've sent it.</>)}
                </div>
              </div>
            )}
            <button onClick={()=>setDepositGateOpen(false)} style={{ ...S.btnOutline, width:"100%", marginTop:14, fontSize:12.5, padding:"10px" }}>Close &mdash; I'll finish this first</button>
          </div>
        </div>
      )}
      <TipBox tips={TIPS.diligence}/>
      <DealAssistant step="diligence" role={myRole} vessel={vessel} />
      {negotiate.vesselRejection && (
        <div style={{ background:C.redLight, border:`1px solid ${C.red}`, borderRadius:8, padding:"13px 16px", marginBottom:16 }}>
          <div style={{ fontSize:13.5, fontWeight:800, fontFamily:"sans-serif", color:C.red, marginBottom:3 }}>🚫 This deal has ended</div>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>The buyer rejected the vessel after due diligence. The full notice and the deposit-return steps are below{myRole==="seller" ? "" : " and on the closing page"}. No further action moves this deal forward.</div>
        </div>
      )}
      {/* The buyer is the one deciding whether to accept the vessel, so this is
          theirs. A seller does not need to look up the history of their own boat. */}
      {myRole !== "seller" && <VesselLookup hin={vessel?.hin} />}

      {/* Closing day is the default move day, but the seller's situation decides
          what is actually workable — dockage paid to month end, a marina that wants
          the slip immediately, or a trailer boat someone is driving three days for.
          A question to ask, not a term to record. */}
      {myRole !== "seller" && (
        <div style={{ background:C.white, border:`1px solid ${C.mist}`, borderRadius:8, padding:"12px 14px", marginBottom:20, fontFamily:"sans-serif" }}>
          <div style={{ fontSize:12.5, fontWeight:800, color:C.navy, marginBottom:4 }}>⏱ Ask when the boat needs to move</div>
          <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.7 }}>
            Closing day is usually the day it moves, but that depends on the seller. Their dockage may be paid to the end of the month, or the marina may want the slip back as soon as it sells. If it is on a trailer, or you are arranging transport, you may need days rather than hours &mdash; and closing can happen on or before the agreed date if that helps.
            <br /><br />
            Settle it with the seller now, while you still have room to move the date. Message them in the deal so you both have it in writing.
          </div>
        </div>
      )}
      {depositRequired && !depVerified && (() => {
        const msLeft = depDeadline > 0 ? (depDeadline - Date.now()) : 0;
        const expired = depDeadline > 0 && !depHasProof && msLeft <= 0;
        const hoursLeft = Math.max(0, Math.floor(msLeft/3600000));
        const minsLeft = Math.max(0, Math.floor((msLeft%3600000)/60000));
        return (
          <div style={{ ...S.card, borderTop:`3px solid ${(depEnded || expired || depDisputed) ? C.red : depVerified ? C.green : C.brass}`, marginBottom:16 }}>
            <h3 style={S.h3}>Earnest Money Deposit</h3>
            {depEnded ? (
              <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.red, fontWeight:700, lineHeight:1.5 }}>✗ Deal void — the deposit window passed without proof. The agreement, including the signed Purchase Agreement, is no longer binding.</div>
            ) : depVerified ? (
              <>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.green, fontWeight:700 }}>✓ Deposit verified by the seller — this deal is secured</div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:5, lineHeight:1.5 }}>Ref {dep.depositProof?.ref || "\u2014"}{dep.depositProof?.note ? ` · ${dep.depositProof.note}` : ""}{depVerif?.note ? ` · Seller's note: ${depVerif.note}` : ""}. The boat is held off the market while due diligence is completed.</div>
              </>
            ) : depDisputed ? (
              <>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.red, fontWeight:700, lineHeight:1.5 }}>⚠️ The seller could not verify this deposit — the deal is on hold</div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:5, lineHeight:1.5 }}>The buyer submitted ref {dep.depositProof?.ref || "\u2014"}, but the seller reports the funds have not arrived.{depVerif?.note ? ` Seller's note: ${depVerif.note}` : ""} Nothing moves forward until this is sorted out.</div>
                {isBuyer ? (
                  <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, marginTop:8, lineHeight:1.6 }}>Check with your escrow agent or bank, then submit corrected proof below. Wires can take 1&ndash;2 business days to land, so this may simply be timing. Use the message thread to tell the seller what you find.</div>
                ) : (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
                    {[12,24,36].map(h => (<button key={h} style={{...S.btnOutline, fontSize:12, padding:"8px 12px"}} onClick={()=>extendDeposit(h)}>Give {h}h more</button>))}
                    <button style={{...S.btn, background:C.red, fontSize:12, padding:"8px 14px"}} onClick={endDealForDeposit}>Void the deal (no deposit)</button>
                  </div>
                )}
              </>
            ) : depAwaitingVerify ? (
              <>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:"#7a5500", fontWeight:700, lineHeight:1.5 }}>⏸️ Deal on hold &mdash; waiting for the seller to verify the deposit</div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:5, lineHeight:1.5 }}>The buyer submitted proof (ref {dep.depositProof?.ref || "\u2014"}{dep.depositProof?.note ? ` · ${dep.depositProof.note}` : ""}). This deal is <b>not secured yet</b> &mdash; it becomes secured once the seller confirms the money actually arrived.</div>
              </>
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
            ) : depDeadline > 0 ? (
              <>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.navy, fontWeight:700 }}>⏳ Proof of deposit due in {hoursLeft}h {minsLeft}m</div>
                <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:5, lineHeight:1.5 }}>Earnest money keeps this deal alive. If proof isn't provided before the timer runs out, the deal can be declared <b>null and void — including the signed Purchase Agreement</b>, and the <b>seller is then free to accept other offers</b>.</div>
              </>
            ) : (
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>The {fmt(dep.deposit)} earnest money secures this deal. Complete it below to unlock the vessel decision.</div>
            )}
            {/* ── DEPOSIT: the app only VERIFIES ──────────────────────────────
                Escrow.com verifies automatically (it's connected). Every other
                method: the money moves OUTSIDE the app, and both parties confirm
                it happened — buyer "I've sent it", seller "I've received it". When
                both are in, the deal moves. No instructions, no account details. */}
            {depositRequired && !depVerified && !depEnded && (
              <div style={{ marginTop:14 }}>
                {apiConfirms ? (
                  dealTxId ? (
                    // ── TRANSACTION EXISTS → show the LIVE status tracker ──────────
                    (() => {
                      const s = escStatus || {};
                      const funded = s.ok && s.found && s.funded;
                      const step = s.step || 1;
                      const steps = ["Agreement","Funded","In progress","Inspection","Closed"];
                      return (
                        <div style={{ background: funded ? C.greenLight : "#eff6ff", border:`1px solid ${funded ? C.green : "#93c5fd"}`, borderLeft:`5px solid ${funded ? C.green : "#1d4ed8"}`, borderRadius:8, padding:"15px 17px", fontFamily:"sans-serif" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:11 }}>
                            <div style={{ fontSize:13.5, fontWeight:800, color: funded ? C.green : "#1d4ed8" }}>🏦 Escrow.com transaction #{dealTxId}</div>
                            <button onClick={refreshEscrow} disabled={escLoading} style={{ ...S.btnOutline, fontSize:11, padding:"5px 11px" }}>{escLoading ? "Checking…" : "Refresh"}</button>
                          </div>
                          <div style={{ display:"flex", gap:4, marginBottom:10 }}>
                            {steps.map((label, i) => {
                              const on = (i+1) <= step;
                              return (
                                <div key={label} style={{ flex:1, textAlign:"center" }}>
                                  <div style={{ height:6, borderRadius:3, background: on ? (funded ? C.green : "#3b82f6") : C.mist }} />
                                  <div style={{ fontSize:8.5, color: on ? C.navy : C.slate, marginTop:3, fontWeight: on ? 700 : 400 }}>{label}</div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ fontSize:12, color:C.slate, lineHeight:1.7 }}>
                            {funded
                              ? <><b style={{color:C.green}}>✓ Funded — the {fmt(dep.deposit)} deposit is secured in escrow.</b> The deal moves forward automatically.</>
                              : <>{s.label || "Waiting for funding."} {isBuyer && <>Fund the {fmt(dep.deposit)} on Escrow.com and this updates on its own.</>}</>}
                            {s.env === "sandbox" && <span style={{ color:C.slate }}> (test mode)</span>}
                          </div>
                          {isBuyer && !funded && (
                            <a href={`https://www.escrow.com/transaction/${dealTxId}`} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:11, fontSize:12, fontWeight:700, color:C.navy, border:`1px solid ${C.brass}`, borderRadius:6, padding:"9px 14px", textDecoration:"none" }}>Open on Escrow.com to fund ↗</a>
                          )}
                        </div>
                      );
                    })()
                  ) : !isBuyer ? (
                    // Seller, no transaction yet — nothing for them to do.
                    <div style={{ background:"#eff6ff", border:`1px solid #93c5fd`, borderRadius:8, padding:"14px 16px", fontFamily:"sans-serif" }}>
                      <div style={{ fontSize:13, fontWeight:800, color:"#1d4ed8", marginBottom:3 }}>The buyer is setting up the Escrow.com deposit</div>
                      <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7 }}>Once they create and fund the {fmt(dep.deposit)} transaction, BoatClosers verifies it automatically &mdash; nothing needed from you.</div>
                    </div>
                  ) : (
                    // ── BUYER, no transaction yet → THE 3 OPTIONS ──────────────────
                    <div style={{ background:"#eff6ff", border:`1px solid #93c5fd`, borderLeft:`5px solid #1d4ed8`, borderRadius:8, padding:"15px 17px", fontFamily:"sans-serif" }}>
                      <div style={{ fontSize:13.5, fontWeight:800, color:"#1d4ed8", marginBottom:4 }}>Set up your {fmt(dep.deposit)} Escrow.com deposit</div>
                      <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, marginBottom:13 }}>
                        BoatClosers is connected to Escrow.com, so it can create the transaction for you &mdash; or you can set it up yourself and paste the ID. Either way, it then tracks live and verifies on its own.
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                        <button onClick={createEscrowTx} disabled={escCreating} style={{ ...S.btnBrass, width:"100%", fontSize:13.5, fontWeight:800, padding:"12px 16px", opacity:escCreating?0.6:1 }}>
                          {escCreating ? "Creating your transaction…" : "⚡ Create the transaction for me"}
                        </button>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <div style={{ flex:1, height:1, background:C.mist }} /><div style={{ fontSize:10.5, color:C.slate }}>OR</div><div style={{ flex:1, height:1, background:C.mist }} />
                        </div>
                        <a href="https://www.escrow.com/login" target="_blank" rel="noopener noreferrer" style={{ textAlign:"center", fontSize:12.5, fontWeight:700, color:C.navy, border:`1px solid ${C.brass}`, borderRadius:6, padding:"11px 14px", textDecoration:"none" }}>I&rsquo;ll set it up on Escrow.com myself ↗</a>
                        <button onClick={()=>setShowReceipt(true)} style={{ ...S.btnOutline, width:"100%", fontSize:12.5, padding:"10px 14px" }}>I already have a transaction ID — enter it</button>
                      </div>
                      {escCreateErr && <div style={{ fontSize:11.5, color:C.red, fontWeight:700, marginTop:9, lineHeight:1.5 }}>{escCreateErr}</div>}
                    </div>
                  )
                ) : (
                  // Non-Escrow.com: both parties confirm. Shows the person their own
                  // action, plus the other side's status, in one box — no waiting loop.
                  <div style={{ background:"#fffdf5", border:`1px solid ${C.brass}`, borderLeft:`5px solid ${C.brass}`, borderRadius:8, padding:"15px 17px", fontFamily:"sans-serif" }}>
                    <div style={{ fontSize:13.5, fontWeight:800, color:"#7a5500", marginBottom:5 }}>The {fmt(dep.deposit)} earnest-money deposit</div>
                    <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, marginBottom:12 }}>
                      The deposit is sent {escMethod === "attorney" ? "to the attorney/title company" : escMethod === "brokerage" ? "to the broker's trust account" : escMethod === "custom" ? "to the holder you agreed on" : "directly to the seller"}, outside BoatClosers. Once <b>both of you confirm</b> it's done, the deal moves forward. BoatClosers only records the confirmation &mdash; it doesn't hold the money.
                    </div>
                    {/* MY action */}
                    {isBuyer && !depBuyerConfirmed ? (
                      <>
                        <div style={{ fontSize:12, color:C.slate, lineHeight:1.7, marginBottom:10 }}>
                          Send the <b>{fmt(dep.deposit)}</b> {escMethod === "attorney" ? "to the attorney/title company" : escMethod === "brokerage" ? "to the broker's trust account" : escMethod === "custom" ? "to the agreed holder" : "to the seller"} using the payment details you arranged, then sign the earnest-money receipt below to record that you&rsquo;ve sent it.
                        </div>
                        <button onClick={()=>setShowReceipt(true)} style={{ ...S.btnBrass, width:"100%", maxWidth:360, fontSize:14, fontWeight:800, padding:"12px 20px", marginBottom:12 }}>
                          📄 Sign the earnest-money receipt →
                        </button>
                      </>
                    ) : !isBuyer && !depSellerConfirmed ? (
                      <>
                        <div style={{ fontSize:12, color:C.slate, lineHeight:1.7, marginBottom:10 }}>
                          Check your {escMethod === "attorney" ? "attorney/title company" : escMethod === "brokerage" ? "broker's trust account" : "account"}. Once the <b>{fmt(dep.deposit)}</b> has actually arrived, sign the earnest-money receipt below to confirm you received it.
                        </div>
                        <button onClick={()=>setShowReceipt(true)} style={{ ...S.btnBrass, width:"100%", maxWidth:360, fontSize:14, fontWeight:800, padding:"12px 20px", marginBottom:12 }}>
                          📄 Sign the earnest-money receipt →
                        </button>
                      </>
                    ) : (
                      <div style={{ background:C.greenLight, border:`1px solid ${C.green}`, borderRadius:6, padding:"9px 12px", marginBottom:12, fontSize:12, color:C.navy }}>
                        ✓ You confirmed {isBuyer ? "you sent" : "you received"} the deposit. <button onClick={undoMyDepositConfirm} style={{ background:"none", border:"none", color:C.slate, fontSize:11, textDecoration:"underline", cursor:"pointer", padding:0 }}>Undo</button>
                      </div>
                    )}
                    {/* OTHER side's status */}
                    <div style={{ fontSize:12, color:C.slate, lineHeight:1.6, borderTop:`1px solid ${C.mist}`, paddingTop:10 }}>
                      {isBuyer
                        ? (depSellerConfirmed ? <><b style={{color:C.green}}>✓ The seller has confirmed they received it.</b></> : <>Waiting on the seller to confirm they received it.</>)
                        : (depBuyerConfirmed ? <><b style={{color:C.green}}>✓ The buyer has confirmed they sent it.</b></> : <>Waiting on the buyer to confirm they've sent it.</>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Deposit-pause banner. Planning stays open below; only the vessel decision
          is locked while a required deposit is unverified past its deadline. The
          INITIATOR — who paid — chooses what to do, with role-appropriate options. */}
      {depositRequired && !depVerified && !depositWaived && !dep.depositEnded && (() => {
        const isInitiator = amInitiator;
        const initiatorIsSeller = (negotiate.initiatorRole || (isBuyer ? "buyer" : "seller")) === "seller";
        // The deposit box above handles all "what to do" messaging. This block now
        // ONLY steps in when the deadline passes unverified → pause the deal.
        if (!depTimerExpired) return null;
        // Expired and unresolved → PAUSED. Initiator decides.
        return (
          <div style={{ background:"#fdecec", border:`1px solid ${C.red}`, borderRadius:8, padding:"13px 15px", marginBottom:14, fontFamily:"sans-serif" }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.red, marginBottom:3 }}>⏸️ Deal paused — the deposit deadline passed without verification</div>
            <div style={{ fontSize:12, color:C.slate, lineHeight:1.6, marginBottom:isInitiator?10:0 }}>
              {initiatorIsSeller
                ? `The ${fmt(dep.deposit)} earnest money wasn't confirmed in time. Your planning stays open, but the vessel decision is locked until this is sorted.`
                : `Your ${fmt(dep.deposit)} deposit wasn't verified before the deadline. Your planning stays open, but you can't finalize the vessel decision until it's resolved.`}
            </div>
            {isInitiator ? (
              <>
                <div style={{ fontSize:11.5, fontWeight:700, color:C.navy, marginBottom:6 }}>You started this deal — how would you like to proceed?</div>
                <div style={{ fontSize:11.5, color:C.slate, marginBottom:5 }}>Give more time:</div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:8 }}>
                  {[12,24,36].map(h => (
                    <button key={h} style={{...S.btnOutline, fontSize:12, padding:"7px 13px"}} onClick={()=>extendDeposit(h)}>+{h} hours</button>
                  ))}
                  <input type="date" value={customExtend} onChange={e=>setCustomExtend(e.target.value)} style={{...S.input, width:150, fontSize:12, padding:"6px 9px"}} />
                  <button style={{...S.btnOutline, fontSize:12, padding:"7px 13px", opacity:customExtend?1:0.5}} disabled={!customExtend} onClick={()=>extendDepositTo(customExtend)}>Set date</button>
                </div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  <button style={{...S.btnOutline, fontSize:12, padding:"8px 14px"}} onClick={()=>{ onBack(); }}>← Back to the Deal Room</button>
                  <button style={{...S.btn, background:C.red, color:"#fff", fontSize:12, padding:"8px 14px"}} onClick={()=>{ if (confirm("Cancel this deal? This ends it for both parties.")) endDealForDeposit(); }}>Cancel the deal</button>
                </div>
                <div style={{ fontSize:11, color:C.slate, lineHeight:1.6, marginTop:8 }}>
                  Prefer to trust {initiatorIsSeller ? "the buyer" : "the seller"} and keep going? <button onClick={()=>waiveDepositTimer()} style={{ background:"none", border:"none", padding:0, color:C.brass, fontWeight:700, fontSize:11, cursor:"pointer", textDecoration:"underline" }}>Proceed without waiting</button> — you can accept or reject the vessel at your own risk.
                </div>
              </>
            ) : (
              <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.6 }}>
                The person who started the deal has been asked how they&rsquo;d like to proceed &mdash; extend the deadline, return to the Deal Room, or cancel. You&rsquo;ll be notified of their decision.
              </div>
            )}
          </div>
        );
      })()}

      <>
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
        {negotiate.deposit > 0 && depVerified && (
          <button onClick={()=>setShowReceipt(true)} style={{ ...S.btnOutline, fontSize:11, padding:"7px 14px", whiteSpace:"nowrap" }}>
            📄 View receipt
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
                  <div style={{ fontSize:12, color:C.text, marginTop:6 }}>Original price: <b>{fmt(_ddTerms.price)}</b></div>
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
              <RejectionNotice rejection={negotiate.vesselRejection} escrowPath={(negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.escrowPath} viewerRole="seller" vessel={vessel} isInitiator={amInitiator} />
            )}
            {/* The seller has no vessel decision to make, so they need their OWN way
                to move on to Documents once the deposit is verified. Without this the
                seller got stuck on Due Diligence while the buyer moved ahead. */}
            {decisionUnlocked ? (
              <button onClick={onNext} style={{ ...S.btnBrass, width:"100%", marginTop:16, fontSize:14, fontWeight:800, padding:"13px 20px" }}>Continue to Documents &rarr;</button>
            ) : (
              <div style={{ background:C.sandDark, border:`1px solid ${C.brass}`, borderRadius:8, padding:"13px 15px", marginTop:16, fontFamily:"sans-serif", fontSize:12.5, color:C.slate, lineHeight:1.6 }}>
                Once the {fmt(dep.deposit)} deposit is confirmed by both sides, you&rsquo;ll continue to the documents here. Your paperwork prep above stays open in the meantime.
              </div>
            )}
          </div>
        ) : (
        <>
        <p style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, marginBottom:14 }}>
          After due diligence you may accept the vessel as-is, reject it (earnest money returned, reason recorded), or propose a new final price — which reopens negotiation. Only you, the buyer, can make this decision.
        </p>
        {!decisionUnlocked ? (
          <div style={{ background:C.sandDark, border:`1px solid ${C.brass}`, borderRadius:8, padding:"16px 18px", marginBottom:16, textAlign:"center", fontFamily:"sans-serif" }}>
            <div style={{ fontSize:24, marginBottom:6 }}>🔒</div>
            <div style={{ fontSize:13.5, fontWeight:800, color:C.navy, marginBottom:5 }}>The vessel decision unlocks once the deposit is verified</div>
            <div style={{ fontSize:12, color:C.slate, lineHeight:1.7, maxWidth:460, margin:"0 auto" }}>
              Go ahead and complete your survey and sea trial &mdash; all your planning stays open. You&rsquo;ll be able to accept, reject, or propose a new price for the {fmt(dep.deposit)} vessel the moment the deposit is confirmed{depTimerExpired ? ", or once the deal initiator resolves the paused deadline above" : ""}. This protects everyone: you don&rsquo;t finalize a purchase before the money that holds the boat is actually secured.
            </div>
          </div>
        ) : (
        <div className="bc-grid3" style={{ gap:10, marginBottom:16 }}>
          <button onClick={requireDeposit(()=>{ setOutcome("accept"); setBuyerSigned(false); setVaSigned(false); setAcceptCommitAck(!!negotiate?.vesselAcceptance); set("outcome","accept"); })} style={{ padding:"14px 8px", textAlign:"center", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="accept"?C.green:"transparent", color:outcome==="accept"?"#fff":C.green, border:`2px solid ${C.green}` }}>
            ✓ Accept As-Is
          </button>
          <button onClick={requireDeposit(()=>{ setOutcome("propose_price"); set("outcome","propose_price"); })} style={{ padding:"14px 8px", textAlign:"center", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="propose_price"?C.brass:"transparent", color:outcome==="propose_price"?C.navy:C.brass, border:`2px solid ${C.brass}` }}>
            ↺ Propose New Price
          </button>
          <button onClick={requireDeposit(()=>{ setOutcome("reject"); setBuyerSigned(false); setVaSigned(false); set("outcome","reject"); })} style={{ padding:"14px 8px", textAlign:"center", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="reject"?C.red:"transparent", color:outcome==="reject"?"#fff":C.red, border:`2px solid ${C.red}` }}>
            ✗ Reject Vessel
          </button>
        </div>
        )}

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
                  <div style={{ marginTop:6 }}>Original agreed price: <b>{fmt(_ddTerms.price)}</b></div>
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

        {outcome==="accept" && !acceptCommitAck && (
          <div style={{ border:`2px solid ${C.green}`, borderRadius:8, overflow:"hidden", marginBottom:14, fontFamily:"sans-serif" }}>
            <div style={{ background:C.green, padding:"12px 16px", color:"#fff", fontSize:14, fontWeight:800 }}>Before you accept — this is a commitment</div>
            <div style={{ background:"#fff", padding:"18px 20px" }}>
              <div style={{ fontSize:13, color:C.navy, lineHeight:1.8, marginBottom:14 }}>
                Accepting <b>{vessel.year} {vessel.make} {vessel.model}</b> as-is is the point of no return in this deal. Once you sign the acceptance:
              </div>
              <ul style={{ fontSize:12.5, color:C.slate, lineHeight:1.9, margin:"0 0 14px", paddingLeft:20 }}>
                <li>You <b>waive your remaining contingencies</b> — survey, sea trial, inspection, and the rest. You can no longer walk away over those.</li>
                <li>You are <b>committing to close</b> the purchase on the agreed terms and closing date.</li>
                <li>If you back out after this, you may <b>forfeit your {fmt(dep.deposit)} earnest-money deposit</b> and could be held liable under the Purchase Agreement.</li>
              </ul>
              <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:6, padding:"11px 14px", fontSize:12, color:"#7a5500", lineHeight:1.7, marginBottom:16 }}>
                If the survey found problems, don&rsquo;t accept yet &mdash; use <b>Propose New Price</b> to renegotiate, or <b>Reject</b> to end the deal and recover your deposit. Only accept when you are ready to buy this boat.
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button onClick={()=>setAcceptCommitAck(true)} style={{ ...S.btn, background:C.green, color:"#fff", fontSize:13.5, fontWeight:800, padding:"12px 20px", flex:1, minWidth:200 }}>I understand &mdash; continue to sign</button>
                <button onClick={()=>{ setOutcome(""); set("outcome",""); }} style={{ ...S.btnOutline, fontSize:13, padding:"12px 18px" }}>Go back</button>
              </div>
            </div>
          </div>
        )}

        {outcome==="accept" && acceptCommitAck && (
          <div style={{ border:`1px solid #a8d8b8`, borderRadius:6, overflow:"hidden", marginBottom:14 }}>
            <div style={{ background:C.green, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff", fontFamily:"sans-serif" }}>Vessel Acceptance Document — Required Before Proceeding</div>
              {vaSigned && <span style={{ fontSize:11, background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"2px 10px", fontFamily:"sans-serif" }}>✓ Signed</span>}
            </div>
            <div style={{ background:"#fff", padding:"16px 18px" }}>
              <style>{PA_DOC_CSS}</style>
              <div className="bc-pa" style={{ background:"#fffdf8", border:`1px solid ${C.mist}`, borderTop:`4px solid ${C.brass}`, borderRadius:4, padding:"18px 20px", marginBottom:14 }} dangerouslySetInnerHTML={{ __html: showBlanks(fillDocument(DOCUMENTS.find(d=>d.id==="accept"), {
                effectiveDate: longDate(today()),
                sellerName: parties.seller?.name || "Seller",
                buyerName: parties.buyer?.name || vaSigName || "Buyer",
                vesselYear: vessel.year||"", vesselMake: vessel.make||"", vesselModel: vessel.model||"",
                hin: vessel.hin || "____________",
                contList: (negotiate.selectedContingencies || (negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.contingencies || []).map(c=>CONTINGENCY_LABELS[c]||c).join(", ") || "the selected contingencies",
                closingDate: negotiate.closingDate || (negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.closingDate || "____________",
                depositAmount: fmt((negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.deposit || 0),
              }) ) }} />
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
                      {parties.buyer?.name && vaSigName.trim() && !sigMatchesName(vaSigName, parties.buyer.name) && (
                        <div style={{ fontSize:11.5, color:C.red, fontFamily:"sans-serif", fontWeight:700, marginTop:5, lineHeight:1.5 }}>Your signature must match the buyer name on this deal: <b>{parties.buyer.name}</b>.</div>
                      )}
                    </div>
                    <button style={{ ...S.btnBrass, whiteSpace:"nowrap", opacity:(!buyerDisc||!vaSigName.trim()||!sigMatchesName(vaSigName, parties.buyer?.name))?0.4:1 }} disabled={!buyerDisc||!vaSigName.trim()||!sigMatchesName(vaSigName, parties.buyer?.name)} onClick={()=>{ if(!sigMatchesName(vaSigName, parties.buyer?.name)) return; setVaSigned(true); setBuyerSigned(true); if(setNegotiate){ const _st=signedStamp(); setNegotiate(n=>({...n, vesselAcceptance:{ sig:vaSigName.trim(), date:today(), at:_st.at, when:_st.when }})); } }}>Sign Acceptance</button>
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
              <RejectionNotice rejection={{ reasons: rejectionReasons, notes: rejectionNotes, solution: rejSolution, sig: (rejSigName.trim()||parties.buyer.name||"Buyer"), date: today() }} escrowPath={(negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.escrowPath} viewerRole="buyer" vessel={vessel} isInitiator={amInitiator} />
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
            {parties.buyer?.name && rejSigName.trim() && !sigMatchesName(rejSigName, parties.buyer.name) && (
              <div style={{ fontSize:11.5, color:C.red, fontFamily:"sans-serif", fontWeight:700, marginTop:6, lineHeight:1.5 }}>Your signature must match the buyer name on this deal: <b>{parties.buyer.name}</b>.</div>
            )}
            {rejSigName.trim() && buyerDisc && buyerSigned && sigMatchesName(rejSigName, parties.buyer?.name) && <div style={{ fontSize:11, color:C.green, fontFamily:"sans-serif", marginTop:8 }}>✓ Ready to sign — press "Proceed to Close (Rejected)" below to record the rejection and notify the seller.</div>}
          </div>
        )}
        </>
        )}
      </div>

      <WhatsNext>Next are the documents &mdash; the bill of sale, title transfer, and the rest. You'll review and sign each required one, and the other party is emailed as they're signed.</WhatsNext>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={S.btnBrass} disabled={!canProceed} onClick={()=>{ setData(d=>({...d,outcome,rejectionReasons,rejectionNotes,rejSolution,rejSigName,vaSigName,vaSigned,surveyFile:surveyFile?.name,surveyCompany,surveyorName})); if(setNegotiate){ if(outcome==="propose_price" && newPrice){ setNegotiate(n=>({...n, addendum:{ newPrice:Number(newPrice), reason:newPriceReason||"", buyer:parties.buyer.name||"Buyer", date:(n.addendum&&n.addendum.date)||today() }, vesselAcceptance: n.vesselAcceptance || { sig:parties.buyer.name||"Buyer", date:today() } })); } if(outcome==="accept" && vaSigName.trim()){ setNegotiate(n=>({...n, vesselAcceptance: n.vesselAcceptance || { sig:vaSigName.trim(), date:today() }})); } if(outcome==="reject" && rejectionReasons.length>0){ const _st=signedStamp(); setNegotiate(n=>({...n, vesselRejection:{ reasons:rejectionReasons, notes:rejectionNotes, solution:rejSolution, sig:(rejSigName.trim()||parties.buyer.name||"Buyer"), date:today(), at:_st.at, when:_st.when }})); } } if(!decisionUnlocked){ setDepositGateOpen(true); return; } onNext(); }}>
          {outcome==="reject" ? "Proceed to Close (Rejected)" : "Continue to Documents →"}
        </button>
      </div>
      </>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — CLOSING
// ─────────────────────────────────────────────────────────────────────────────
function StepClosing({ vessel, parties, terms, negotiate, setNegotiate, ddData, docsData, setDocsData, myRole, amInitiator, onBack, onOpenDoc, onFinalize }) {
  const isBuyer = myRole !== "seller";
  const [cleared, setCleared] = useState(false);
  const [dealFinalized, setDealFinalized] = useState(!!negotiate.dealFinalized);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  // The four "Final Actions" were hardcoded as never done, so the pre-finalize
  // warning listed steps nobody could ever tick off. They are now real and saved
  // to the deal, so both parties see the same state.
  const steps = negotiate.closingSteps || {};
  const toggleStep = (id) => setNegotiate(n => ({ ...n, closingSteps: { ...(n.closingSteps || {}), [id]: !(n.closingSteps || {})[id] } }));
  const [manualChecks, setManualChecks] = useState({});
  const [payMethod, setPayMethod] = useState(negotiate.paymentType || "wire");
  const [payMethodOpen, setPayMethodOpen] = useState(true);
  const isRejected = ddData.outcome==="reject";
  const toggleManual = (k) => setManualChecks(c => ({...c,[k]:!c[k]}));

  const _clTerms = agreedTerms(negotiate);
  const balanceDue = Math.max(0, _clTerms.price - _clTerms.deposit);
  const escrowLabel = escLabel(_clTerms.escrowPath);

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

  // Seven documents can serve as the bill of sale. Whichever one they signed is
  // the bill of sale for this deal — checking a single id reported "unsigned" to
  // anyone who used the state form or the itemised version.
  const BOS_VARIANTS = ["bill_of_sale","bos_plain","fl_82050","fl_bos_itemized","cg_1340","uscg_transfer"];
  const BOS_LABELS = {
    bill_of_sale:"Vessel Bill of Sale (Notarized)", bos_plain:"Vessel Bill of Sale (Simple)",
    fl_82050:"Florida Bill of Sale — HSMV 82050", fl_bos_itemized:"Itemized Bill of Sale — Hull & Motors",
    cg_1340:"U.S. Coast Guard Bill of Sale — CG-1340", uscg_transfer:"USCG Bill of Sale & Transfer",
  };
  const bosSignedId = BOS_VARIANTS.find(id => docsData.signedDocs?.[id]);

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
      desc:"Everything your deal needs — signed in the Documents step.",
      docs: (docsData.requiredList && docsData.requiredList.length)
        ? [
            { id: bosSignedId || "bill_of_sale", label: bosSignedId ? BOS_LABELS[bosSignedId] : "Bill of Sale", desc: bosSignedId ? "Transfers legal ownership from seller to buyer." : "Transfers legal ownership. Pick the version that fits your sale on the Documents step.", signed: !!bosSignedId },
            ...docsData.requiredList.map(r => ({
              id: r.id,
              label: r.label,
              desc: r.why ? `Added because of: ${r.why}.` : "",
              signed: !!docsData.signedDocs?.[r.id],
            })),
          ]
        : [
        { id:"purchase_agreement",  label:"Purchase & Sale Agreement",   desc:"The main binding contract between buyer and seller.", signed:!!docsData.signedDocs?.purchase_agreement },
        { id: bosSignedId || "bill_of_sale", label: bosSignedId ? BOS_LABELS[bosSignedId] : "Bill of Sale", desc: bosSignedId ? "Transfers legal ownership from seller to buyer." : "Transfers legal ownership. Pick the version that fits your sale on the Documents step.", signed: !!bosSignedId },
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
        { id:"payment",      label:`Full Payment of ${fmt(_clTerms.price)} Received`, desc:"Buyer has sent and seller has confirmed receipt of the full closing balance.", signed:!!steps["payment"], manual:true, manualKey:"payment_received" },
        { id:"keys",         label:"Keys, Manuals & Equipment Delivered",                       desc:"All physical items included in the sale handed over to buyer.", signed:!!steps["keys"], manual:true, manualKey:"keys_delivered" },
        { id:"escrow_rel",   label:"Escrow / Deposit Funds Released",                          desc:"Escrow agent or seller has confirmed deposit applied to purchase price.", signed:!!steps["escrow_rel"], manual:true, manualKey:"escrow_released" },
        { id:"reg_transfer", label:"Registration / Title Filed with State",                    desc:"New owner has submitted title transfer and registration application.", signed:!!steps["reg_transfer"], manual:true, manualKey:"reg_filed" },
      ]
    }
  ];

  const selectedMethod = PAYMENT_METHODS.find(m=>m.id===payMethod)||PAYMENT_METHODS[0];

  return (
    <div style={S.page}>
      <div style={{ marginBottom:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={S.h1}>{isRejected ? "Closing — Deal Rejected" : "Final Closing"}</h1>
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>
            {isRejected
              ? `Rejected during due diligence · Earnest money ${fmt(negotiate.deposit||0)} to be returned`
              : `${vessel.year} ${vessel.make} ${vessel.model} · ${fmt(_clTerms.price)} · Closing ${terms.closingDate||"TBD"}`}
          </p>
        </div>
      </div>

      {!isRejected && (
        <DealAssistant step="closing" role={myRole} vessel={vessel}
          seen={!!negotiate.closingGuideSeen}
          onSeen={()=>setNegotiate(n => ({ ...n, closingGuideSeen: true }))} />
      )}

      {/* ── WHAT IS LEFT ─────────────────────────────────────────────────────────
          Near the top, because it is the thing that decides whether you should be
          finalizing at all. Documents open where they are signed; the practical
          steps tick off here. ─────────────────────────────────────────────────── */}
      {!isRejected && !dealFinalized && (() => {
        const all = closingDocSections.flatMap(sec => (sec.docs || []));
        const docsLeft  = all.filter(d => d && d.signed === false && !d.manual);
        const stepsLeft = all.filter(d => d && d.signed === false && d.manual);
        const stepsDone = all.filter(d => d && d.manual && d.signed);
        const nothingLeft = !docsLeft.length && !stepsLeft.length;
        return (
          <div style={{ background: nothingLeft ? "#f4f7f5" : "#fffaf0", border:`1.5px solid ${nothingLeft ? C.green : C.brass}`, borderRadius:9, marginBottom:20, overflow:"hidden" }}>
            <div style={{ padding:"13px 16px", borderBottom:`1px solid ${nothingLeft ? "#d7e5dc" : "#f0e2c8"}` }}>
              <div style={{ fontSize:13.5, fontFamily:"sans-serif", fontWeight:800, color: nothingLeft ? C.green : "#8a5a12" }}>
                {nothingLeft ? "✓ Everything is done — you're ready to finalize" : `Before you finalize — ${docsLeft.length + stepsLeft.length} outstanding`}
              </div>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginTop:3 }}>
                {nothingLeft
                  ? "Every document is signed and every step is confirmed. Finalizing will seal the record."
                  : "You can still finalize without these — but once you do, nothing here can be signed or changed again."}
              </div>
            </div>

            {docsLeft.length > 0 && (
              <div>
                <div style={{ padding:"9px 16px", background:"#fdf3e3", fontSize:10.5, fontFamily:"sans-serif", color:"#8a5a12", letterSpacing:0.5, textTransform:"uppercase", fontWeight:700 }}>
                  Documents to sign &mdash; {docsLeft.length}
                </div>
                {docsLeft.map(d => (
                  <div key={d.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 16px", borderTop:`1px solid #f4e8d4`, fontFamily:"sans-serif", background:"#fff" }}>
                    <span style={{ width:17, height:17, borderRadius:"50%", border:`1.5px solid ${C.brass}`, flexShrink:0, marginTop:2 }} />
                    <span style={{ flex:1 }}>
                      <span style={{ fontSize:12.5, color:C.navy, display:"block", fontWeight:600 }}>{d.label}</span>
                      {d.desc && <span style={{ fontSize:11, color:C.slate, display:"block", marginTop:2, lineHeight:1.5 }}>{d.desc}</span>}
                    </span>
                    <button onClick={()=>onOpenDoc ? onOpenDoc(d.id) : onBack()}
                      style={{ fontSize:11.5, background:C.brass, border:"none", color:"#fff", borderRadius:14, padding:"6px 14px", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"sans-serif", fontWeight:700 }}>Sign &rarr;</button>
                  </div>
                ))}
              </div>
            )}

            {(stepsLeft.length > 0 || stepsDone.length > 0) && (
              <div>
                <div style={{ padding:"9px 16px", background:"#f5f0e8", fontSize:10.5, fontFamily:"sans-serif", color:C.slate, letterSpacing:0.5, textTransform:"uppercase", fontWeight:700 }}>
                  Steps to confirm &mdash; {stepsDone.length} of {stepsDone.length + stepsLeft.length} done
                </div>
                {[...stepsLeft, ...stepsDone].map(d => (
                  <button key={d.id} onClick={()=>toggleStep(d.id)}
                    style={{ display:"flex", alignItems:"flex-start", gap:10, width:"100%", textAlign:"left", padding:"11px 16px", borderTop:`1px solid ${C.sand}`, border:"none", borderTopWidth:1, borderTopStyle:"solid", background:"#fff", cursor:"pointer", fontFamily:"sans-serif" }}>
                    <span style={{ width:17, height:17, borderRadius:4, flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800,
                      background: d.signed ? C.green : "transparent", color:"#fff", border: d.signed ? "none" : `1.5px solid ${C.mist}` }}>{d.signed ? "✓" : ""}</span>
                    <span style={{ flex:1 }}>
                      <span style={{ fontSize:12.5, color: d.signed ? C.slate : C.navy, display:"block", fontWeight: d.signed ? 400 : 600, textDecoration: d.signed ? "line-through" : "none" }}>{d.label}</span>
                      {d.desc && !d.signed && <span style={{ fontSize:11, color:C.slate, display:"block", marginTop:2, lineHeight:1.5 }}>{d.desc}</span>}
                    </span>
                    <span style={{ fontSize:11, color: d.signed ? C.green : C.slate, whiteSpace:"nowrap", marginTop:2, fontWeight:600 }}>{d.signed ? "Confirmed" : "Tap to confirm"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {isRejected && (
        <div style={{ marginBottom:20 }}>
          <RejectionNotice
            rejection={negotiate.vesselRejection || { reasons: ddData.rejectionReasons || (ddData.rejectionReason?[ddData.rejectionReason]:[]), notes: ddData.rejectionNotes, solution: ddData.rejSolution, sig: ddData.rejSigName || parties.buyer.name || "Buyer", date: today() }}
            escrowPath={(negotiate.offers||[]).find(o=>o.status==="accepted"||o.status==="agreed")?.escrowPath}
            viewerRole={isBuyer?"buyer":"seller"}
            vessel={vessel}
            isInitiator={amInitiator}
          />
        </div>
      )}

      {/* ── FINAL PAYMENT SECTION ── */}
      {!isRejected && (
        <div style={{ marginBottom:20 }}>
          {/* The one line worth keeping from the old closing-steps boxes, moved to
              where the money is about to move rather than a checklist above. Wire
              fraud is the single most expensive mistake available on this page. */}
          <div style={{ background:"#fffaf0", border:`1.5px solid ${C.brass}`, borderRadius:8, padding:"12px 14px", marginBottom:10, fontFamily:"sans-serif" }}>
            <div style={{ fontSize:12.5, fontWeight:800, color:"#8a5a12", marginBottom:4 }}>Before you send anything, phone {isBuyer ? "the seller" : "the buyer"}</div>
            <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.7 }}>
              {isBuyer
                ? <>Confirm the account details <b>by voice</b>, on a number you already had &mdash; not one from the email carrying the instructions. Wire details intercepted or altered by email are how money disappears in a boat sale, and a wire is very hard to recover once sent.</>
                : <>Give your account details <b>by voice</b>, and expect the buyer to call and confirm them before sending. If anyone emails changed instructions in your name, that is not you &mdash; tell the buyer to phone you before acting on anything.</>}
            </div>
          </div>
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
                  ["Purchase Price", fmt(_clTerms.price)],
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

      {/* ── THE HANDOVER ────────────────────────────────────────────────────────
          The title and the bill of sale are signed wet-ink, together, when the
          money changes hands — the app cannot do that part. What it can do is set
          out the sequence so neither side is exposed. */}
      {!isRejected && (() => {
        const h = (docsData && docsData.handover) || {};
        const done = h.done === true || (h.mode === "distance" && h.sellerSent && h.buyerGot);
        const isSeller = myRole === "seller";
        const steps = h.mode === "distance"
          ? ["Seller signs the title and gets the bill of sale notarised",
             "Seller photographs the signed title and posts both, tracked",
             "Seller shares the photo and the tracking number in the deal",
             "Buyer checks the bill of sale is notarised and the names match the title exactly",
             "Buyer wires the balance and shares proof of payment",
             "Buyer confirms the title arrived"]
          : ["Seller brings the title, signed by every registered owner, and the bill of sale",
             "Seller brings the lien release, if there was a loan on the boat",
             "Buyer brings the balance in cleared funds",
             "Sign the title and the bill of sale together, at the table",
             "Seller hands over keys, title and paperwork; buyer hands over the money"];
        return (
          <div style={{ background: done ? "#f4f7f5" : C.white, border:`1.5px solid ${done ? C.green : C.brass}`, borderRadius:9, padding:"14px 16px", marginBottom:20, fontFamily:"sans-serif" }}>
            <div style={{ fontSize:13.5, fontWeight:800, color: done ? C.green : C.navy, marginBottom:4 }}>
              {done ? "✓ Title and bill of sale handed over" : (h.mode === "distance" ? "📦 Handing over by post" : h.mode === "person" ? "🤝 Handing over in person" : "📜 The title and bill of sale")}
            </div>
            <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.7 }}>
              {done
                ? "Both sides have confirmed. Nothing further is needed here."
                : <>These two are signed by hand, together, at the moment the money changes hands &mdash; not in the app. {isSeller
                    ? "Tell us how you're handing over and we'll set out the steps."
                    : "The seller sets this up; you'll both sign at the handover."}</>}
            </div>
            {!done && isSeller && !h.mode && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:11 }}>
                {[["person","\ud83e\udd1d Meeting in person"],["distance","\ud83d\udce6 We won\u2019t meet \u2014 by post"]].map(([v,lbl]) => (
                  <button key={v} onClick={()=>setDocsData(d => ({ ...d, handover: { ...(d.handover || {}), mode: v } }))}
                    style={{ fontSize:12.5, padding:"9px 15px", borderRadius:18, cursor:"pointer", fontWeight:700, border:`1.5px solid ${C.mist}`, background:C.white, color:C.slate, fontFamily:"sans-serif" }}>{lbl}</button>
                ))}
              </div>
            )}
            {!done && (
              <>
                <ol style={{ margin:"10px 0 0", paddingLeft:19, fontSize:12, color:C.slate, lineHeight:1.8 }}>
                  {steps.map((t,i) => <li key={i} style={{ marginBottom:2 }}>{t}</li>)}
                </ol>
                {h.mode === "distance" && (
                  <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.65, marginTop:9, background:"#fffaf0", border:`1px solid ${C.brass}`, borderRadius:7, padding:"10px 12px" }}>
                    One of you has to go first, so do it in this order &mdash; the photo proves the title exists and is signed, the tracking proves it is on its way. An escrow service removes the risk entirely if you would rather not rely on it.
                  </div>
                )}
                <button onClick={onBack}
                  style={{ marginTop:11, background:"transparent", border:`1px solid ${C.mist}`, color:C.navy, borderRadius:16, padding:"7px 15px", fontSize:11.5, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
                  Open it on the Documents step &rarr;
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Document sections — the steps are handled by "Before you finalize" above,
          which is the same list but tickable, so only the documents render here. */}
      {closingDocSections.filter(sec => sec.heading !== "Final Actions").map((section, si) => (
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
          <div>💰 <strong>Price:</strong> {fmt(_clTerms.price)}</div>
          <div>💳 <strong>Payment Method:</strong> {selectedMethod?.icon} {selectedMethod?.label}</div>
          <div>👤 <strong>Buyer:</strong> {parties.buyer.name||"—"} · {parties.buyer.email||"—"}</div>
          <div>👤 <strong>Seller:</strong> {parties.seller.name||"—"} · {parties.seller.email||"—"}</div>
          <div>📅 <strong>Closing:</strong> {terms.closingDate||"TBD"}</div>
          <div>📋 <strong>Status:</strong> {isRejected ? "Rejected — Earnest Money Return Pending" : dealFinalized ? "✓ Finalized — Deal Closed" : "In Progress"}</div>
        </div>
      </div>

      {dealFinalized ? (
        <div style={{ background:C.greenLight, border:`1px solid ${C.green}`, borderRadius:8, padding:"18px 20px", marginTop:"1.5rem", textAlign:"center", fontFamily:"sans-serif" }}>
          <div style={{ fontSize:15, fontWeight:800, color:C.green, marginBottom:4 }}>🔒 Deal Finalized &amp; Closed</div>
          <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7 }}>This deal is locked. All terms, documents, and signatures are final and can no longer be changed. Keep or print your copies for your records.</div>
        </div>
      ) : (
        <div style={{ marginTop:"1.5rem" }}>
          <div style={{ background:C.sandDark, border:`1px solid ${C.brass}`, borderRadius:8, padding:"14px 16px", marginBottom:14, fontFamily:"sans-serif" }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:4 }}>{amInitiator ? "Ready to close this deal?" : "Waiting on the other party to finalize"}</div>
            <div style={{ fontSize:12, color:C.slate, lineHeight:1.7 }}>{!amInitiator && <><b>The person who started this deal finalizes it.</b> Everything above is still yours to complete &mdash; sign what is outstanding and tick off your steps, and they will close it when both sides are done.<br/><br/></>}Finalizing locks the entire deal &mdash; terms, documents, and signatures become permanent and can&rsquo;t be changed. Do this once the sale is fully complete and both sides have their copies.</div>
          </div>
          {!amInitiator ? (
            <div style={{ display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
              <button style={S.btnOutline} onClick={onBack}>&larr; Back to Documents</button>
            </div>
          ) : !confirmFinalize ? (
            <div style={{ display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
              <button style={S.btnOutline} onClick={onBack}>&larr; Back to Documents</button>
              <button style={{ ...S.btnBrass, fontSize:14, fontWeight:800, padding:"12px 22px" }} onClick={()=>setConfirmFinalize(true)}>✓ Finalize &mdash; Deal Closed</button>
            </div>
          ) : (
            <div style={{ background:"#fff", border:`2px solid ${C.green}`, borderRadius:8, padding:"15px 17px", fontFamily:"sans-serif" }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:8 }}>Lock this deal permanently?</div>
              <div style={{ fontSize:12, color:C.slate, lineHeight:1.7, marginBottom:12 }}>This can&rsquo;t be undone. The deal, its documents, and all signatures will be frozen as the final record of the sale.</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button style={{ ...S.btn, background:C.green, color:"#fff", fontSize:13.5, fontWeight:800, padding:"11px 20px", flex:1, minWidth:180 }} onClick={()=>{ setDealFinalized(true); setConfirmFinalize(false); if(setNegotiate) setNegotiate(n=>({ ...n, dealFinalized:{ at:Date.now(), by:myRole } })); if(typeof onFinalize==="function") onFinalize(); }}>🔒 Yes, finalize &amp; close the deal</button>
                <button style={{ ...S.btnOutline, fontSize:13, padding:"11px 18px" }} onClick={()=>setConfirmFinalize(false)}>Not yet</button>
              </div>
            </div>
          )}
        </div>
      )}
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
          <div style={{ ...S.logo, fontSize:20 }}>BOATCLOSERS<span style={{ color:C.brass }}>.COM</span></div>
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

function AuthScreen({ onAuth, prefillEmail, notice, defaultMode, defaultRole, onHome }) {
  const [mode, setMode] = useState(defaultMode || "signup");
  const [role, setRole] = useState(defaultRole || null);
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
          <div style={{ ...S.logo, fontSize:22 }}>BOATCLOSERS<span style={{ color:C.brass }}>.COM</span></div>
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
              {/* Three across: two roles and a way back. The third is styled as an
                  aside rather than a role, so nobody mistakes it for one. */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[["buyer","🛒 Buyer","I am purchasing a vessel"],["seller","⚓ Seller","I own the vessel being sold"],["__home","↩ Not yet","Take me back to read more first"]].map(([r,l,d])=>(
                  <button key={r} onClick={()=>{ if (r === "__home") { onHome && onHome(); return; } setRole(r); }} style={{ padding:"14px 10px", borderRadius:6, cursor:"pointer", textAlign:"center", background:role===r?C.navy:"transparent", color: r==="__home" ? C.slate : (role===r?"#fff":C.navy), border: r==="__home" ? `1px dashed ${C.mist}` : `2px solid ${role===r?C.brass:C.mist}`, fontFamily:"sans-serif" }}>
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
          {mode!=="signup" && (
            <div style={{ marginTop:12, textAlign:"center", fontSize:12, fontFamily:"sans-serif" }}>
              <a href="/forgot-password" style={{ color:C.slate, textDecoration:"underline" }}>Forgot password?</a>
            </div>
          )}
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
function Landing({ onStart, onLegal }) {
  const [showDocFinder, setShowDocFinder] = useState(false);
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
    { icon:"🎯", title:"Auto-Filled Documents", desc:"Enter your deal once — every document fills itself in with your vessel, parties, price, and dates. No retyping onto twenty forms." },
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
    { icon:"🔎", title:"Know what you're buying", desc:"Due diligence links you straight to the Coast Guard's free vessel search, the official Abstract of Title for liens, and independent history reports for accidents, storm damage, sinking, theft and salvage." },
    { icon:"🔒", title:"Lock it so nobody walks", desc:"Once both sides agree, a signed purchase agreement and deposit lock the deal — no ghosting, no selling out from under you." },
    { icon:"🏦", title:"Move money safely — even remotely", desc:"Deposits and balances can route through Escrow.com, a licensed escrow service, so neither party wires thousands to a stranger. Money releases only when the deal is done. Prefer an attorney's trust account, a broker's escrow, or paying the seller direct? You choose — the agreement records whichever you pick." },
  ];

  const dealroom = [
    { icon:"🔄", title:"Negotiate the whole deal — not just price", desc:"Price, deposit, contingencies, and closing dates bundle into one clean offer. Counter back and forth with no limit until you both agree. It's the work a broker does — done by you, for free." },
    { icon:"🚩", title:"Flag a conflict instead of walking away", desc:"Don't like a date or a term? Flag it and the other side adjusts, instead of the deal falling apart. Small disagreements that usually kill private sales actually get resolved." },
    { icon:"⏱️", title:"Keep it moving — no ghosting", desc:"Put an expiration on your offer so it can't sit forever, and watch every counter and message update live for both sides. You always know exactly where the deal stands." },
  ];

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 760 : false);
  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth < 760);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  const cols = (n) => isMobile ? "1fr" : Array(n).fill("1fr").join(" ");

  const Section = ({ children, style }) => <div style={{ maxWidth:880, margin:"0 auto", padding:isMobile?"3rem 1.25rem":"4.5rem 2rem", ...style }}>{children}</div>;

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
      <header style={{ background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy2} 55%, #0e3a52 100%)`, color:"#fff", padding:isMobile?"3.5rem 1.25rem 3rem":"6rem 2rem 4.5rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`repeating-linear-gradient(90deg, ${C.brass} 0px, ${C.brass} 12px, transparent 12px, transparent 20px)`, opacity:0.4 }} />
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"inline-block", background:"rgba(184,134,58,0.15)", border:`1px solid rgba(184,134,58,0.4)`, borderRadius:20, padding:"5px 16px", fontSize:11, letterSpacing:2, color:C.brass2, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:24 }}>
            Private Boat Transactions · Done Right
          </div>
          <h1 style={{ fontSize:isMobile?32:46, fontWeight:800, lineHeight:1.12, marginBottom:20, fontFamily:"'Georgia',serif" }}>
            Buy or Sell a Boat<br/>
            <span style={{ color:C.brass2 }}>With Total Confidence</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.74)", lineHeight:1.75, marginBottom:34, fontFamily:"sans-serif", fontWeight:300 }}>
            Professional-grade tools once reserved for yacht brokers — now in the hands of any private buyer or seller. <strong style={{ color:"#fff", fontWeight:600 }}>No broker, no commission — just $249.</strong>
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button style={{...S.btnBrass, fontSize:15, padding:"13px 32px"}} onClick={()=>onStart("buyer")}>Start as Buyer</button>
            <button style={{ ...S.btnOutline, color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.3)", fontSize:15, padding:"13px 32px", borderRadius:5 }} onClick={()=>onStart("seller")}>Start as Seller</button>
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
        <h2 style={{ fontSize:29, marginBottom:16 }}>A boat deal shouldn't cost you $15,000 in commission.</h2>
        <p style={{ fontSize:15, fontFamily:"sans-serif", color:C.slate, lineHeight:1.85, maxWidth:660, margin:"0 auto 36px" }}>
          On a $150,000 boat, a broker's 10% is around <strong style={{ color:C.navy }}>$15,000</strong> — for paperwork and coordination a motivated buyer and seller can handle themselves. And if your situation is anything but ordinary — an inherited boat, a loan still owed, a lost title — most people have nowhere to turn at all. The hard part was never the deal. It's the documents, the title paperwork, the escrow, and the fear of missing a step that costs you later.
        </p>
        <div style={{ fontSize:11, letterSpacing:3, color:C.brass, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:14 }}>The Solution</div>
        <h2 style={{ fontSize:29, marginBottom:16 }}>Every document, every step — for a flat $249.</h2>
        <p style={{ fontSize:15, fontFamily:"sans-serif", color:C.slate, lineHeight:1.85, maxWidth:660, margin:"0 auto" }}>
          BoatClosers gives you the exact paperwork and closing process used in professional vessel sales — the purchase agreement, the title-transfer documents, escrow options, and a guided due-diligence and closing checklist. Every step reflects real private boat closings, including the messy ones most DIY templates ignore. You stay in control of your own deal — and you keep the commission.
        </p>
      </Section>

      {/* Deal tracker preview */}
      <div style={{ background:C.white, padding:"4.5rem 2rem", borderTop:`0.5px solid ${C.mist}`, borderBottom:`0.5px solid ${C.mist}` }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <div style={{ fontSize:11, letterSpacing:3, color:C.brass, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:14, textAlign:"center" }}>The Whole Deal, In One Place</div>
          <h2 style={{ textAlign:"center", fontSize:28, marginBottom:8 }}>Watch Your Deal Move From Offer to Closed</h2>
          <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:44, maxWidth:600, marginLeft:"auto", marginRight:"auto" }}>
            Every deal follows one clear track. Both sides always know exactly where things stand and what happens next — that's what the flat $249 buys you.
          </p>
          <div style={{ display:"flex", flexDirection:isMobile?"column":"row", justifyContent:"space-between", gap:isMobile?16:0 }}>
            {[
              ["📝","Offer & Terms","Deposit-backed offer, accepted by both sides"],
              ["🔒","Deal Locked","Purchase agreement signed — boat off the market"],
              ["🔍","Due Diligence","Survey, sea trial, and title & lien check"],
              ["✍️","Documents Signed","Every form auto-filled, signed, and shared"],
              ["🏁","Closed","Title transferred and the deal is done"],
            ].map(([ic,t,d],i,a)=>(
              <div key={t} style={{ flex:1, textAlign:"center", position:"relative", padding:isMobile?"0":"0 4px" }}>
                {!isMobile && i<a.length-1 && <div style={{ position:"absolute", top:23, left:"50%", width:"100%", height:2, background:C.mist, zIndex:0 }} />}
                <div style={{ width:48, height:48, borderRadius:"50%", background:C.navy, color:C.brass2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:21, margin:"0 auto", position:"relative", zIndex:1 }}>{ic}</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginTop:11, fontFamily:"sans-serif" }}>{t}</div>
                <div style={{ fontSize:11, color:C.slate, fontFamily:"sans-serif", lineHeight:1.5, marginTop:3, maxWidth:150, marginLeft:"auto", marginRight:"auto" }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      {/* The Deal Room — negotiation */}
      <div style={{ background:"#fff", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <div style={{ fontSize:11, letterSpacing:3, color:C.brass2, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:14 }}>Where a Fair Deal Actually Happens</div>
            <h2 style={{ fontSize:30, color:C.navy, marginBottom:16 }}>The Deal Room — Where Stuck Deals Get Unstuck</h2>
            <p style={{ fontSize:15, fontFamily:"sans-serif", color:C.slate, lineHeight:1.8, maxWidth:680, margin:"0 auto" }}>
              Most private boat sales don't fall apart over price — they fall apart over a missed text, a term nobody would budge on, or an offer with nothing behind it. The Deal Room gives both sides one place to negotiate the entire deal, back and forth, until it's fair — the job a broker would charge thousands for.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:cols(3), gap:18 }}>
            {dealroom.map(d=>(
              <div key={d.title} style={{ background:C.sand, border:`1px solid ${C.mist}`, borderRadius:9, padding:"1.6rem 1.4rem" }}>
                <div style={{ fontSize:26, marginBottom:12 }}>{d.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.navy, marginBottom:8, fontFamily:"sans-serif" }}>{d.title}</h3>
                <p style={{ fontSize:13.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7 }}>{d.desc}</p>
              </div>
            ))}
          </div>
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
          {/* Four cards, so two-by-two rather than one stranded on its own row. */}
          <div style={{ display:"grid", gridTemplateColumns:cols(2), gap:18 }}>
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
          <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:20, maxWidth:620, marginLeft:"auto", marginRight:"auto" }}>
            Every document auto-fills with your deal data and is organized by exactly when you need it. Your deal only shows the categories that apply to it.
          </p>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <button onClick={()=>setShowDocFinder(true)} style={{ background:C.navy, color:C.brass, border:`1px solid ${C.brass}`, borderRadius:8, padding:"12px 22px", fontSize:14, fontWeight:800, fontFamily:"sans-serif", cursor:"pointer" }}>
              🧭 Not sure which you need? Answer a few questions →
            </button>
          </div>
          {showDocFinder && (
            <div onClick={()=>setShowDocFinder(false)} style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.75)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:5000, padding:"3vh 1rem", overflowY:"auto" }}>
              <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, maxWidth:600, width:"100%", padding:"1.6rem", border:`2px solid ${C.brass}` }}>
                <DocFinder DOCUMENTS={DOCUMENTS} C={C} S={S} onClose={()=>setShowDocFinder(false)} onOpenDoc={()=>{ setShowDocFinder(false); onStart(); }} />
              </div>
            </div>
          )}
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
              {[`All ${DOC_COUNT} professional documents, ${CAT_COUNT} categories`,"Smart selection — see only what your deal needs","Electronic signatures for both parties","Title-transfer & registration paperwork","Full negotiation, offers & contingencies","Five escrow options — Escrow.com, attorney, licensed broker, direct, or custom","Due-diligence & closing checklists","PDF download package — both parties","No commission, no subscription, ever"].map(f=>(
                <div key={f}>✓ {f}</div>
              ))}
            </div>
            <button style={{...S.btnBrass, marginTop:24, fontSize:15, padding:"13px", width:"100%"}} onClick={onStart}>
              Start Free — Pay When Ready
            </button>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:12, fontFamily:"sans-serif" }}>vs. broker commission: typically $10,000–$50,000+</div>
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
          ["What escrow options do I have, and do you hold the money?","You choose from five: Escrow.com (a licensed third party, recommended), a licensed boat brokerage's trust account, a private attorney or title company, a direct wire to the seller, or your own custom arrangement. BoatClosers never holds, touches, or releases funds."],
          ["The boat I want is listed with a broker. Can I still use BoatClosers?","Yes. You deal with the listing broker directly and BoatClosers handles your side of the paperwork \u2014 the offer, the agreement, the deposit, due diligence and closing. It is also worth knowing that a listing broker's commission normally assumes a second broker brings the buyer and takes a share of it. If nobody is doing that \u2014 because you are representing yourself \u2014 that is a reasonable thing to raise when you decide your number, and far easier to raise before terms are agreed than after. BoatClosers points it out at the right moment when you build your offer. What the broker does about it is entirely theirs to decide."],
          ["A broker keeps calling about my boat. Should I talk to them?","Ask one question first: do you have a buyer, or do you want the listing? If they have a buyer, that is worth hearing out. They are working for that buyer, not for you, and how they are paid is between them and their buyer unless you agree otherwise. If they ask you to pay something, that is a separate conversation and it belongs in writing before you go any further \u2014 what the fee is, and what triggers it. If instead they want the listing, they are asking you to sign a commission agreement in exchange for running the sale. That can be a fair trade if you would rather hand it over, and you are free to take it. You just do not need one to sell through BoatClosers."],
          ["Can I still use a broker or attorney if I want one?","Yes. BoatClosers is built so you don't need one, but nothing stops you from bringing one in — for example, letting a licensed brokerage's trust account hold the escrow deposit, or having an attorney review the agreement before you sign. You run the deal and bring in whatever help you're comfortable with."],
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

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGAL PAGES (Terms + Privacy) — reviewed and approved by counsel. Any change to
// the wording below should go back to them before it ships.
// ─────────────────────────────────────────────────────────────────────────────
// A FIXED date, deliberately. As new Date() this claimed the Terms had been
// updated today, every day — which tells a customer nothing and makes it
// impossible to know which version they agreed to. Change it by hand when the
// wording actually changes, and only after counsel has seen it.
const LEGAL_UPDATED = "August 12, 2026";
const LEGAL = {
  terms: {
    title: "Terms of Service",
    sections: [
      ["Agreement to these terms", ["BoatClosers is operated by Sea Yachts LLC, a Florida limited liability company (\u201cBoatClosers\u201d, \u201cwe\u201d, \u201cus\u201d). By creating an account or using BoatClosers, you agree to these Terms. If you don\u2019t agree, please don\u2019t use the service.", "Sea Yachts LLC also operates a separate yacht brokerage business. That business is not part of BoatClosers, is not a party to your transaction, and has no role in any deal you run here."]],
      ["What BoatClosers is — and isn't", ["BoatClosers is a self-service platform that helps a buyer and seller organize a private boat sale — building offers, generating documents, collecting electronic signatures, and tracking the deal to closing.", "BoatClosers is NOT a yacht or boat broker, dealer, escrow agent, title company, law firm, or financial advisor. We do not represent either party, do not give legal, tax, or financial advice, and are not a party to any transaction between users."]],
      ["You are responsible for your deal", ["You are responsible for the accuracy of the information you enter, for verifying the vessel, title, and any liens, for your own due diligence, and for complying with all applicable federal, state, and local laws. Every decision in your transaction is yours. The documents and checklists we provide are general starting points and may not fit your specific situation."]],
      ["We never hold your money", ["BoatClosers never holds, receives, transfers, or releases funds. Any deposit, escrow, or payment is arranged directly between you, the other party, and any third-party escrow provider you choose. We are not responsible for those funds or for the conduct of any escrow provider."]],
      ["Electronic signatures and records", ["You consent to sign and receive documents electronically, and you agree that electronic signatures and records are valid and binding to the same extent as handwritten ones."]],
      ["Fees and the 60-day credit", ["BoatClosers charges a flat one-time fee of $249 per deal, due when you lock the deal to move toward closing. Everything up to that point is free.", "If a deal you paid for falls through before closing, you may start another deal at no additional fee within 60 days of when it fell through; after 60 days the credit expires. Except where required by law, fees are otherwise non-refundable."]],
      ["Your account", ["Keep your login secure — you're responsible for activity under your account. You must be at least 18 years old and legally able to enter a contract to use BoatClosers."]],
      ["No warranty", ["The service and all documents are provided \u201Cas is\u201D and \u201Cas available,\u201D without warranties of any kind. We do not guarantee that any deal will close, that a document is legally sufficient for your situation, or that the service will be uninterrupted or error-free."]],
      ["Limitation of liability", ["To the maximum extent allowed by law, BoatClosers is not liable for any indirect, incidental, or consequential damages, or for any loss arising from your transaction, the other party's conduct, any third-party escrow, or your reliance on documents. Our total liability to you is limited to the fees you paid us."]],
      ["Indemnification", ["You agree to hold BoatClosers harmless from claims, losses, and expenses arising out of your use of the service or your transaction."]],
      ["Maritime matters — important notices", [
        "Vessel transactions are subject to a distinct body of federal maritime (admiralty) law in addition to state law. By using BoatClosers you acknowledge the following:",
        "Maritime liens: A vessel can carry maritime liens that do not appear on a state title or in ordinary lien searches — including liens for crew wages, salvage, necessaries (repairs, dockage, fuel, supplies), and preferred ship mortgages recorded with the U.S. Coast Guard. A maritime lien follows the vessel, not the owner: a buyer can take a vessel subject to liens created before the sale. BoatClosers does not and cannot search for, verify, or clear maritime liens. Buyers are strongly advised to obtain a USCG abstract of title for documented vessels, a state title and lien search, and where appropriate marine-title insurance or an attorney's opinion before closing.",
        "Documented vessels: For vessels documented with the U.S. Coast Guard, transfer must comply with federal documentation requirements (including a USCG bill of sale and re-documentation or deletion filings with the National Vessel Documentation Center). State title paperwork alone may not transfer a documented vessel. The parties are solely responsible for the correct federal filings.",
        "Registration, tax, and duty: The parties are responsible for state registration and titling, sales and use tax, and — for cross-border transactions — customs, import duty, and export compliance in their own jurisdictions.",
        "Risk of loss and insurance: Boats are subject to marine perils (sinking, collision, grounding, storm, fire, theft). Until risk of loss passes at closing as stated in the parties' agreement, each party should maintain appropriate marine insurance. BoatClosers is not an insurer and provides no coverage of any kind.",
        "Salvage and casualty: If a vessel is involved in a casualty or salvage event during a pending deal, the parties' rights are governed by their agreement and by maritime law — not by BoatClosers, which has no role, responsibility, or authority in any such event.",
        "No admiralty role: BoatClosers is a document-facilitation platform only. It is not a vessel documentation agent, marine surveyor, admiralty attorney, classification society, or flag-state authority, and nothing in the service constitutes maritime legal advice.",
      ]],
      ["Changes and termination", ["We may update these Terms or the service over time. We may suspend or close accounts that violate these Terms. Continued use after an update means you accept the updated Terms."]],
      ["Governing law and disputes", ["These Terms are governed by the laws of the State of Florida, without regard to conflict-of-law rules. Any dispute arising from these Terms or your use of BoatClosers will be resolved exclusively in the state or federal courts located in Florida, and both parties consent to the jurisdiction of those courts."]],
      ["Contact", ["Questions about these Terms: support@boatclosers.com."]],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["Overview", ["This policy explains what information BoatClosers collects, how we use it, and the choices you have."]],
      ["Information we collect", ["Account information you give us: your name, email, and password. Deal information you enter: vessel details, the parties' contact information, prices, offers, messages, and dates. Files you upload, such as survey reports or deposit proof."]],
      ["How we use your information", ["To provide and operate the service: create and route your documents, let both parties collaborate on the same deal, send transactional emails (invites, offer and signature notifications), and provide support."]],
      ["How we share your information", ["With the other party to your deal — sharing a deal between a buyer and seller is the whole point of the platform. With service providers that run the platform on our behalf (for example, our hosting and database provider, our email-delivery provider, and, when enabled, our payment processor), under their own terms. And if required by law. We do not sell your personal information."]],
      ["Where your data is stored and security", ["Your data is stored with our hosting and database provider. We use reasonable technical and organizational safeguards to protect it, but no method of storage or transmission is perfectly secure."]],
      ["Data retention and your choices", ["We keep deal data to provide the service and maintain records. You can request access to, correction of, or deletion of your account data by emailing us — though some records may be retained where the law requires it."]],
      ["Children", ["BoatClosers is for adults 18 and older and is not directed to children. We do not knowingly collect information from anyone under 18."]],
      ["Cookies and local storage", ["We use essential cookies and browser storage to keep you signed in and to run the app. [If you add analytics or marketing tools later, disclose them here.]"]],
      ["Changes to this policy", ["We may update this policy from time to time. The \u201Clast updated\u201D date at the top shows the current version."]],
      ["Contact", ["Questions about your privacy or data: support@boatclosers.com."]],
    ],
  },
};

function LegalScreen({ page, onBack }) {
  const doc = LEGAL[page] || LEGAL.terms;
  return (
    <div style={{ minHeight:"100vh", background:C.sand }}>
      <nav style={S.nav}>
        <div style={{ cursor:"pointer" }} onClick={onBack}>
          <div style={S.logo}>BOATCLOSERS</div>
        </div>
        <button style={{ fontSize:12, color:"#fff", background:C.brass, border:"none", borderRadius:16, padding:"6px 16px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }} onClick={onBack}>← Back</button>
      </nav>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"2.5rem 1.5rem 4rem" }}>
        <h1 style={{ fontSize:30, color:C.navy, marginBottom:6, fontFamily:"'Georgia',serif" }}>{doc.title}</h1>
        <div style={{ fontSize:12, color:C.slate, fontFamily:"sans-serif", marginBottom:20 }}>Last updated {LEGAL_UPDATED}</div>
        {doc.sections.map(([h, paras], i) => (
          <div key={i} style={{ marginBottom:22 }}>
            <h2 style={{ fontSize:16, color:C.navy, fontFamily:"sans-serif", fontWeight:700, marginBottom:8 }}>{i+1}. {h}</h2>
            {paras.map((p, j) => <p key={j} style={{ fontSize:13.5, fontFamily:"sans-serif", color:C.text, lineHeight:1.75, marginBottom:8 }}>{p}</p>)}
          </div>
        ))}
        <button style={{...S.btnBrass, marginTop:10}} onClick={onBack}>← Back to BoatClosers</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
const emptyVessel = {name:"",year:"",make:"",model:"",hin:"",hullType:"",loa:"",beam:"",engineCount:"1",engineMake:"",engineModel:"",engineHours:"",engineSerial:"",fuelType:"Gasoline",regNumber:"",regState:"",uscgNumber:"",trailerIncluded:"no",trailerVin:"",trailerState:"",askingPrice:"",location:"",description:""};
const emptyParties = {buyer:{name:"",email:"",phone:"",address:"",city:"",stateZip:""},seller:{name:"",email:"",phone:"",address:"",city:"",stateZip:""}};
// escrowPct and escrowPath start EMPTY, not 0/"escrow_com". This object is the real
// source of the offer form's starting values — setting them here was pre-deciding
// the deposit amount and the escrow holder before the buyer had chosen either, and
// no amount of changing the useState defaults downstream could override it.
const emptyNeg = {offers:[],messages:[],agreedPrice:"",escrowPct:"0",escrowPath:"",deposit:0,dueDiligenceDays:"10",ddStartDate:"",closingDate:""};
const emptyDD = {survey:false,title:false,insurance:false,seatrial:false,engines:false,electronics:false,ddNotes:"",outcome:null,rejectionReason:"",rejectionReasons:[],rejectionNotes:"",rejSolution:"",rejSigName:""};
const emptyDocs = {paid:false,signedDocs:{}};

export default function BoatClosers() {
  const [screen, setScreen] = useState("landing");
  const [myDeals, setMyDeals] = useState([]);
  const [myDealsLoading, setMyDealsLoading] = useState(false);
  const [authRole, setAuthRole] = useState(null);
  const [stripeReturn, setStripeReturn] = useState(null);
  // If we just came back from Stripe Checkout, ask our server to confirm the
  // session was really paid, then hand the result to the deal room to lock the
  // deal. Clean the URL either way so a refresh doesn't re-trigger it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("stripe");
    if (status === "success" && params.get("session_id")) {
      const sid = params.get("session_id");
      fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sid)}`)
        .then(r => r.json())
        .then(v => {
          // The verify route still returns a `dbg` string describing exactly what
          // happened during the lock. It is logged here (invisible to the customer)
          // so a failed lock can still be diagnosed from a support session, without
          // ever showing raw internals to someone who just paid.
          if (v?.dbg && !String(v.dbg).includes('LOCKED') && !String(v.dbg).includes('wasLocked=true')) {
            console.warn('[PAY VERIFY] deal did not lock:', v.dbg);
          }
          if (v?.paid) {
            if (v.dealId) {
              window.location.replace(`/?dealId=${encodeURIComponent(v.dealId)}&step=3`);
            } else {
              setStripeReturn({ paid: true, who: v.who || "initiator", dealId: null }); setStep(2);
            }
          }
        })
        .catch(() => {});
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "cancel") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  const [toast, setToast] = useState(null);
  // ── Cross-app messaging: a header button + unread badge that follows the user
  //    onto every step, so a message sent while they're on Due Diligence or
  //    Closing is never missed. Data lives in negotiate.messages (already polled).
  const [msgPanelOpen, setMsgPanelOpen] = useState(false);
  const [msgLastSeen, setMsgLastSeen] = useState(0);
  const [msgDraft, setMsgDraft] = useState("");
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
  const [cancelModal, setCancelModal] = useState(false);
  // When a guest is inside a finalized deal, how long they have left to download
  // their documents. Set by the server; null for the initiator, who keeps it.
  const [guestUntil, setGuestUntil] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [supportModal, setSupportModal] = useState(false);
  const [supportType, setSupportType] = useState("A conflict or disagreement with the other party");
  const [supportMsg, setSupportMsg] = useState("");
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportErr, setSupportErr] = useState("");
  const submitSupport = async () => {
    if (!supportMsg.trim()) { setSupportErr("Please describe the problem first."); return; }
    if (supportSending) return;
    setSupportSending(true); setSupportErr("");
    try {
      // Signed-in call: the route takes the sender's identity from the session
      // rather than from this payload, so it cannot be used to send mail as
      // someone else.
      const res = await authedFetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user?.name, email: user?.email, dealId, role: myDealRole || user?.role, issueType: supportType, message: supportMsg })
      });
      const d = await res.json();
      if (d?.ok) { setSupportSent(true); setSupportMsg(""); }
      else setSupportErr(d?.error || "Couldn't send. Please try again.");
    } catch (e) { setSupportErr("Couldn't reach support. Please check your connection and try again."); }
    setSupportSending(false);
  };
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Holds the live tokens so authedFetch can refresh without a stale closure.
  const tokenRef = useRef({ token: null, refreshToken: null });
  const [savedOk, setSavedOk] = useState(false);
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
    if ((deal.initiator_id || deal.party_a_user_id) === userId) return deal.initiator_role || fallbackRole || "buyer";
    if ((deal.other_party_id || deal.party_b_user_id) === userId) return deal.invite_role || fallbackRole || "seller";
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
              tokenRef.current = { token: session.token, refreshToken: session.refreshToken || null };
            setUser({ name: session.name, email: session.email, role: session.role, userId: session.userId, token: session.token, refreshToken: session.refreshToken || null });
              // The server has closed this deal to them — cancelled, or their
              // 60-day window after finalizing has passed. Clear the stored id so
              // a stale tab or bookmark cannot keep pulling them back in.
              if (data?.accessEnded) {
                setDealId(null);
                try {
                  const raw = localStorage.getItem("bc_session");
                  if (raw) { const ss = JSON.parse(raw); delete ss.dealId; localStorage.setItem("bc_session", JSON.stringify(ss)); }
                } catch (e) {}
                setScreen("landing");
                setToast({ k: Date.now(), text: data.accessEnded === "canceled"
                  ? "That deal was ended, so it's no longer open. You can start a deal of your own any time."
                  : "Your access to that closed deal has ended. You can start a deal of your own any time." });
                return;
              }
              if (data?.deal) {
                if (data.guestUntil) setGuestUntil(data.guestUntil);
                setDealId(data.deal.id);
                setMyDealRole(computeDealRole(data.deal, session.userId, session.role));
                setPartyBJoined(!!(data.deal.other_party_id || data.deal.party_b_user_id));
          finalizedRef.current = !!(data.deal.negotiate && data.deal.negotiate.dealFinalized);
                finalizedRef.current = !!(data.deal.negotiate && data.deal.negotiate.dealFinalized);
                setAmInitiator((data.deal.initiator_id || data.deal.party_a_user_id) === session.userId);
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
    // A finalized deal is a permanent, frozen record — never save changes to it.
    // Guard on the SERVER-confirmed finalized status (set at load), so the single
    // finalize action itself still persists; every save AFTER that is blocked, and
    // after reload the deal loads finalized and stays frozen.
    if (finalizedRef.current) {
      // Silently discarding someone's typing is worse than refusing it out loud —
      // that silence is what made a locked deal look like it was still editable.
      setToast({ k: Date.now(), text: "🔒 This deal is finalized — nothing can be changed. Start a new deal to sell again." });
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      const s = latestState.current;
      try {
        const res = await authedFetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dealId, role: myDealRole || user?.role,
            vessel: s.vessel, parties: s.parties, negotiate: s.negotiate,
            dd_data: s.ddData, docs_data: s.docsData, step: s.step, max_step: s.maxStep
          })
        });
        // The server can now refuse: a finalized deal cannot spawn another, a
        // lapsed credit cannot, and an offer cannot be accepted before the fee is
        // paid. Say what happened instead of retrying into a silent failure.
        if (res.status === 403 || res.status === 402) {
          let msg = "";
          try { msg = (await res.json())?.error || ""; } catch (e) { msg = ""; }
          setToast({ k: Date.now(), text: msg || "That isn't allowed on this deal. Email support@boatclosers.com." });
          setSaveError(false);
          return;
        }
        if (!res.ok) throw new Error("save failed (" + res.status + ")");
        const data = await res.json();
        if (data?.deal?.id && !dealId) setDealId(data.deal.id);
        setSaveError(false);
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 2000);
      } catch (e) {
        setSaveError(true);
      }
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
      const res = await authedFetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The DEAL role (what they chose for THIS deal) is authoritative — not the
          // account signup role. A user who signed up as "buyer" can start a new deal
          // as the seller; sending user.role here stored the wrong initiator_role and
          // flipped everyone back to buyer after paying. Prefer myDealRole.
          role: myDealRole || user?.role,
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
  // Server-confirmed finalized status. Once a loaded deal is finalized, this stays
  // true and blocks all further saves. It is NOT set by the local finalize click,
  // so that first finalize save persists; it flips true only from loaded state.
  const finalizedRef = useRef(false);
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
  // ── Messaging helpers ──────────────────────────────────────────────────────
  const _msgs = Array.isArray(negotiate?.messages) ? negotiate.messages : [];
  const _myRole = myDealRole || user?.role || "buyer";
  // Unread = messages from the OTHER party (or system) with a timestamp newer than
  // the last time this user opened the panel. System/other-party only — never your own.
  const msgUnread = _msgs.filter(m => {
    if (!m) return false;
    const mine = m.from === _myRole || m.from === "me";
    if (mine) return false;
    const t = m.at || (m.time ? Date.parse("1970/01/01 " + m.time) : 0) || 0;
    return t > msgLastSeen || (!t && msgLastSeen === 0 && _msgs.indexOf(m) >= 0 && msgLastSeen < 1);
  }).length;
  const openMsgPanel = () => { setMsgPanelOpen(true); setMsgLastSeen(Date.now()); };
  const sendDealMessage = () => {
    const text = msgDraft.trim(); if (!text) return;
    const note = { from: _myRole, text, time: new Date().toLocaleTimeString(), at: Date.now() };
    setNegotiateAndSave(n => ({ ...n, messages: [ ...(Array.isArray(n.messages) ? n.messages : []), note ] }));
    setMsgDraft("");
  };
  const setDdDataAndSave = withSave(setDdData);
  const setDocsDataAndSave = withSave(setDocsData);

  // End the current deal: mark it canceled, drop a note in the thread, and save so
  // the other party sees it. Available at ANY stage, deliberately — the moment you
  // most need a way out is after the deal is locked and the other side goes quiet.
  // Leaving the deal entirely: clears the local state and the stored deal id, so
  // the next sign-in does not drop them back into a closed deal.
  // The stored deal id survives a reset unless it is explicitly removed, and the
  // boot effect reads it on the next load. Every path that abandons a deal clears
  // it, or the old one reappears.
  // Everything that belongs to the OTHER party, cleared together. Forgetting any
  // one of these is how a reset deal ends up half-attached to the last one.
  const clearOtherParty = () => {
    setPartyBJoined(false);
    setMyDealRole(null);
    setAmInitiator(true);
    setGuestUntil(null);
  };

  const forgetStoredDeal = () => {
    try {
      const raw = localStorage.getItem("bc_session");
      if (raw) { const sess = JSON.parse(raw); delete sess.dealId; localStorage.setItem("bc_session", JSON.stringify(sess)); }
    } catch (e) {}
  };

  const leaveDeal = () => {
    setDealId(null);
    setVessel(emptyVessel); setParties(emptyParties); setNegotiate(emptyNeg); setDdData(emptyDD); setDocsData(emptyDocs);
    setStep(0); setMaxStep(0);
    forgetStoredDeal();
    clearOtherParty();
    setScreen("landing");
  };

  const cancelDeal = () => {
    const who = myDealRole || user?.role || "a party";
    const whoName = user?.name || who;
    const note = { from:"system", text:`✗ ${whoName} canceled this deal${cancelReason?` — "${cancelReason}"`:""}. The deal is now closed.`, time:new Date().toLocaleTimeString() };
    setNegotiateAndSave(n => ({ ...n, canceled: { by: who, byName: whoName, reason: cancelReason, date: today() }, messages: [ ...(n.messages||[]), note ] }));
    setCancelModal(false);
    setCancelReason("");
  };
  // Reset everything to a clean slate for a brand-new deal (keeps you signed in).
  const startNewDeal = () => {
    setDealId(null);
    forgetStoredDeal();
    clearOtherParty();
    setVessel(emptyVessel); setParties(emptyParties); setNegotiate(emptyNeg); setDdData(emptyDD); setDocsData(emptyDocs);
    setStep(0); setMaxStep(0); setShowWelcome(true);
  };
  // Same boat, next buyer. When a deal dies at the deposit stage the vessel hasn't
  // changed — making someone re-type the year, make, model, HIN and specs is the
  // friction that turns "let's find another buyer" into "I want my money back".
  const relistBoat = () => {
    if (!amInitiator) {
      setToast({ k: Date.now(), text: "Only the person who started this deal can relist it." });
      return;
    }
    setDealId(null);
    forgetStoredDeal();
    clearOtherParty();
    setParties(emptyParties); setNegotiate(emptyNeg); setDdData(emptyDD); setDocsData(emptyDocs);
    // Land on Parties, where the invite lives — the boat details are already
    // filled in, so dropping them on step 0 makes them page through a form they
    // have nothing to change.
    setStep(1); setMaxStep(1); setShowWelcome(false);
    setToast({ k: Date.now(), text: "Boat details carried over — send a new invite below to bring someone in." });
  };

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
        const STATUS_RANK = { pending:0, sent:0, expired:1, countered:1, rejected:2, agreed:3, accepted:4 };
        const _rank = s => STATUS_RANK[s] ?? 0;
        const byId = {};
        for (const o of (prev?.offers || [])) if (o && o.id != null) byId[o.id] = o;
        for (const o of (sNeg.offers || [])) {
          if (!o || o.id == null) continue;
          const local = byId[o.id];
          if (!local) { byId[o.id] = o; continue; }
          const merged = { ...local, ...o };
          // Never let a stale poll pull an offer BACKWARD — a just-made accept or
          // signature the save hasn't caught up to yet must not be reverted.
          if (_rank(local.status) > _rank(o.status)) merged.status = local.status;
          merged.agreedBy = local.agreedBy || o.agreedBy;
          merged.paBuyerSig = local.paBuyerSig || o.paBuyerSig;
          merged.paSellerSig = local.paSellerSig || o.paSellerSig;
          byId[o.id] = merged;
        }
        const offers = Object.values(byId).sort((a, b) => (a.id || 0) - (b.id || 0));
        const prevMsgs = prev?.messages || [];
        const srvMsgs = sNeg.messages || [];
        // Union messages (dedupe by from+time+text) so a message either side just
        // sent — but hasn't finished saving — is never wiped by an incoming poll.
        const _seenMsg = new Set();
        const messages = [];
        for (const m of [...srvMsgs, ...prevMsgs]) {
          if (!m) continue;
          const k = (m.from || "") + "|" + (m.time || "") + "|" + (m.text || "");
          if (_seenMsg.has(k)) continue;
          _seenMsg.add(k);
          messages.push(m);
        }
        return {
          ...prev, offers, messages,
          paid: prev?.paid || sNeg.paid,
          dealLocked: prev?.dealLocked || sNeg.dealLocked,
          depositHours: sNeg.depositHours ?? prev?.depositHours,
          depositDeadline: Math.max(Number(sNeg.depositDeadline)||0, Number(prev?.depositDeadline)||0) || prev?.depositDeadline || sNeg.depositDeadline,
          depositProof: sNeg.depositProof || prev?.depositProof,
          depositEnded: prev?.depositEnded || sNeg.depositEnded,
          // Deposit confirmation fields — the seller's "funds received" signature
          // lives here. Without these in the merge, the buyer's screen wouldn't
          // unlock the vessel decision until a full page refresh.
          depositVerification: sNeg.depositVerification || prev?.depositVerification,
          depositSellerConfirmed: sNeg.depositSellerConfirmed || prev?.depositSellerConfirmed,
          depositBuyerConfirmed: sNeg.depositBuyerConfirmed || prev?.depositBuyerConfirmed,
          depositDisputed: sNeg.depositDisputed || prev?.depositDisputed,
          depositTimerWaived: prev?.depositTimerWaived || sNeg.depositTimerWaived,
          canceled: prev?.canceled || sNeg.canceled,
          dealFinalized: prev?.dealFinalized || sNeg.dealFinalized,
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
        const res = await authedFetch("/api/deals?dealId=" + encodeURIComponent(dealId));
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
  // A finalized deal is a closed, permanent record. The server already refuses every
  // write to one (423), but until now the screen still LOOKED editable: you could
  // retype the HIN, move on, and never be told the change went nowhere. That made a
  // properly locked deal feel reusable. The earlier steps are now visibly sealed.
  const dealFrozen = !!negotiate?.dealFinalized;
  const goToStep = (n) => { if (n >= 3 && !dealPaid) { setStep(2); return; } setStep(n); if (n > maxStep) setMaxStep(n); scheduleSave(); };

  // ── Authenticated fetch with silent token refresh ─────────────────────────
  // Supabase access tokens expire after ~1 hour. Rather than dying with a
  // "Couldn't save" 401 when someone leaves a deal open, this wraps fetch: on a
  // 401 it trades the long-lived refresh token for a fresh access token (once)
  // and retries. Only if the refresh token itself is dead do we surface the
  // clean "please sign in again" prompt — no more mysterious save failures.
  const doRefresh = async () => {
    const rt = tokenRef.current.refreshToken;
    if (!rt) return null;
    try {
      const r = await fetch("/api/auth/refresh", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!r.ok) return null;
      const j = await r.json();
      if (!j?.token) return null;
      tokenRef.current = { token: j.token, refreshToken: j.refreshToken || rt };
      setUser(u => u ? { ...u, token: j.token, refreshToken: j.refreshToken || rt } : u);
      try {
        const s = JSON.parse(localStorage.getItem("bc_session") || "{}");
        localStorage.setItem("bc_session", JSON.stringify({ ...s, token: j.token, refreshToken: j.refreshToken || rt }));
      } catch (e) {}
      return j.token;
    } catch { return null; }
  };

  // Load a specific deal into the app, whatever its status. Sign-in only ever
  // fetches the current ACTIVE deal, so without this a finalized deal was
  // unreachable except through a ?dealId= link in an old email.
  const openDealById = async (id) => {
    if (!id) return;
    try {
      const res = await authedFetch("/api/deals?dealId=" + encodeURIComponent(id));
      const data = await res.json();
      const d = data?.deal;
      if (!d) { setToast({ k: Date.now(), text: "That deal could not be opened." }); return; }
      setDealId(d.id);
      setMyDealRole(computeDealRole(d, user?.userId, user?.role));
      setPartyBJoined(!!(d.other_party_id || d.party_b_user_id));
      finalizedRef.current = !!(d.negotiate && d.negotiate.dealFinalized);
      setAmInitiator((d.initiator_id || d.party_a_user_id) === user?.userId);
      setVessel(d.vessel || emptyVessel);
      setParties(d.parties || emptyParties);
      setNegotiate(d.negotiate || emptyNeg);
      setDdData(d.dd_data || emptyDD);
      setDocsData(d.docs_data || emptyDocs);
      if (typeof d.step === "number") { setStep(d.step); setMaxStep(d.max_step || d.step); }
      setScreen("deal");
      try {
        const raw = localStorage.getItem("bc_session");
        if (raw) { const sess = JSON.parse(raw); sess.dealId = d.id; localStorage.setItem("bc_session", JSON.stringify(sess)); }
      } catch (e) {}
    } catch (e) {
      setToast({ k: Date.now(), text: "Could not open that deal. Please try again." });
    }
  };

  const openMyDeals = async () => {
    setScreen("mydeals");
    setMyDealsLoading(true);
    try {
      const res = await authedFetch("/api/deals?list=1");
      const data = await res.json();
      setMyDeals(Array.isArray(data?.deals) ? data.deals : []);
    } catch (e) { setMyDeals([]); }
    setMyDealsLoading(false);
  };

  const authedFetch = async (url, opts = {}) => {
    const tok = tokenRef.current.token || user?.token;
    const withAuth = (t) => ({ ...opts, headers: { ...(opts.headers || {}), "Authorization": "Bearer " + t } });
    let res = await fetch(url, withAuth(tok));
    if (res.status === 401) {
      const fresh = await doRefresh();
      if (fresh) {
        res = await fetch(url, withAuth(fresh)); // retry once with the new token
      } else {
        setSessionExpired(true); // refresh token dead → clean prompt
      }
    }
    return res;
  };

  const handleAuth = async (authData) => {
    setUser(authData);
    tokenRef.current = { token: authData.token, refreshToken: authData.refreshToken || null };
    setSessionExpired(false);
    try {
      localStorage.setItem("bc_session", JSON.stringify({
        token: authData.token, refreshToken: authData.refreshToken || null, userId: authData.userId,
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
          setPartyBJoined(!!(data.deal.other_party_id || data.deal.party_b_user_id));
          setAmInitiator((data.deal.initiator_id || data.deal.party_a_user_id) === authData.userId);
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
    setSessionExpired(false);
    tokenRef.current = { token: null, refreshToken: null };
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

  // Every screen carries the legal footer — landing, sign-in, and the deal.
  const withFooter = (node) => (<>{node}<LegalFooter C={C} authedFetch={authedFetch} signedIn={!!user} /></>);
  if (screen==="landing") return withFooter(<Landing onStart={(r)=>{ if(r==="buyer"||r==="seller") setAuthRole(r); setScreen("auth"); }} onLegal={(p)=>setScreen(p)}/>);
  if (screen==="mydeals") return withFooter(
    <MyDeals C={C} S={S} deals={myDeals} loading={myDealsLoading}
      onOpen={(id)=>openDealById(id)}
      onBack={()=>setScreen("deal")}
      onNew={()=>{ startNewDeal(); setScreen("deal"); }} />
  );
  if (screen==="terms") return withFooter(<LegalScreen page="terms" onBack={()=>setScreen("landing")} />);
  if (screen==="privacy") return withFooter(<LegalScreen page="privacy" onBack={()=>setScreen("landing")} />);
  if (screen==="auth") return withFooter(<AuthScreen onAuth={handleAuth} onHome={()=>setScreen("landing")} prefillEmail={deepLink?.email} notice={deepLink ? `Sign in as ${deepLink.email} to review this deal.` : null} defaultMode={deepLink ? "login" : "signup"} defaultRole={authRole} />);
  if (screen==="deal" && showWelcome) return withFooter(<Welcome name={user?.name} onStart={()=>setShowWelcome(false)} onSignOut={handleSignOut} />);

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
          /* The header is a fixed 60px row that never wraps, carrying eight items.
             On a phone it ran straight off the edge. Let it become two rows. */
          .bc-nav{height:auto !important;padding:9px 12px 10px !important;flex-wrap:wrap;row-gap:8px}
          .bc-brand{flex:1 1 100%}
          .bc-brandsub{display:none}
          .bc-navactions{width:100%;flex-wrap:wrap;justify-content:flex-start;gap:6px !important}
          /* Direct children only — the session-timeout dialog also lives in here. */
          .bc-navactions > button{font-size:11px !important;padding:6px 11px !important}
          /* The vessel name is long and already shown on every step below. */
          .bc-navvessel{display:none}
          /* Six step labels set to never wrap forced the bar wider than the screen. */
          .bc-progress{padding:0.7rem 0.6rem !important}
          .bc-steplabel{font-size:8.5px !important;white-space:normal !important;line-height:1.2;text-align:center;max-width:52px}
        }
      `}</style>
      <nav className="bc-nav" style={S.nav}>
        <div className="bc-brand" style={{ cursor:"pointer" }} onClick={()=>setScreen("landing")}>
          <div style={S.logo}>BOATCLOSERS</div>
          <div className="bc-brandsub" style={S.logoSub}>Private Vessel Transactions</div>
        </div>
        <div className="bc-navactions" style={{ display:"flex", alignItems:"center", gap:12 }}>
          {sessionExpired && (
            <div style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:4000, padding:"1rem", fontFamily:"sans-serif" }}>
              <div style={{ background:"#fff", borderRadius:12, maxWidth:380, padding:"1.75rem", textAlign:"center", border:`2px solid ${C.brass}` }}>
                <div style={{ fontSize:30, marginBottom:8 }}>🔐</div>
                <div style={{ fontSize:17, fontWeight:800, color:C.navy, marginBottom:6 }}>Your session timed out</div>
                <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.7, marginBottom:16 }}>
                  For your security, you&rsquo;ve been signed out after a long period. Your deal is safe and saved &mdash; just sign in again to pick up exactly where you left off.
                </div>
                <button onClick={handleSignOut} style={{ ...S.btnBrass, width:"100%", fontSize:14, padding:"12px" }}>Sign in again</button>
              </div>
            </div>
          )}
          {saveError ? (
            <button onClick={()=>{ setSaveError(false); scheduleSave(); }} title="Your last change didn't save. Click to try again — keep this tab open." style={{ fontSize:10.5, color:"#fff", background:C.red, border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }}>⚠️ Couldn't save — Retry</button>
          ) : saving ? (
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)", fontFamily:"sans-serif" }}>Saving…</span>
          ) : savedOk ? (
            <span style={{ fontSize:10, color:"#8fd6a6", fontFamily:"sans-serif" }}>✓ Saved</span>
          ) : null}
          {user && <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif", textTransform:"uppercase", letterSpacing:1 }}>{myDealRole || user.role}</span>}
          {vessel.year && <span className="bc-navvessel" style={{ fontSize:11, color:C.brass, fontFamily:"sans-serif" }}>{vessel.year} {vessel.make} {vessel.model}</span>}
          <button title="Messages with the other party" onClick={openMsgPanel} style={{ position:"relative", fontSize:11, color:"#fff", background: msgUnread>0 ? C.red : "rgba(255,255,255,0.07)", border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }}>💬 Messages{msgUnread>0 && <span style={{ marginLeft:5, background:"#fff", color:C.red, borderRadius:10, padding:"0 6px", fontSize:10, fontWeight:800 }}>{msgUnread}</span>}</button>
          {(dealId || step>0) && !negotiate.canceled && (
            <button title="End this deal and free yourself to start another" onClick={()=>setCancelModal(true)} style={{ fontSize:11, color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.07)", border:`1px solid rgba(214,110,110,0.5)`, borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }}>End deal</button>
          )}
          <button onClick={openMyDeals} title="All your deals, including closed ones"
            style={{ fontSize:11, color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }}>My deals</button>
          <button title="Reload to pull the other party's latest offers, messages, and updates" style={{ fontSize:11, color:"#fff", background:C.brass, border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }} onClick={()=>window.location.reload()}>🔄 Check for updates</button>
          <button title="Get help or report a problem or conflict" style={{ fontSize:11, color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.07)", border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 }} onClick={()=>{ setSupportSent(false); setSupportErr(""); setSupportModal(true); }}>help</button>
          <button style={{ fontSize:11, color:"rgba(255,255,255,0.55)", background:"rgba(255,255,255,0.07)", border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif" }} onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>
      {toast && (
        <div onClick={()=>{ if(toast.text && toast.text.includes("message")) { openMsgPanel(); } setToast(null); }} style={{ position:"fixed", top:14, left:"50%", transform:"translateX(-50%)", zIndex:1000, background:C.navy, color:"#fff", padding:"11px 18px", borderRadius:10, boxShadow:"0 6px 22px rgba(0,0,0,0.22)", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer", maxWidth:"92%", textAlign:"center" }}>
          {toast.text}
          <span style={{ opacity:0.6, marginLeft:10, fontSize:11, fontWeight:400 }}>tap to dismiss</span>
        </div>
      )}
      {/* ── CROSS-APP MESSAGE PANEL — slides in from the right on any step ── */}
      {msgPanelOpen && (
        <div onClick={()=>setMsgPanelOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.45)", zIndex:2000, display:"flex", justifyContent:"flex-end" }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:"min(420px, 94vw)", height:"100%", background:"#fff", display:"flex", flexDirection:"column", boxShadow:"-8px 0 30px rgba(0,0,0,0.2)" }}>
            <div style={{ background:C.navy, color:"#fff", padding:"15px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:800, fontFamily:"sans-serif" }}>💬 Messages</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:"sans-serif", marginTop:2 }}>You &amp; the other party on this deal</div>
              </div>
              <button onClick={()=>setMsgPanelOpen(false)} style={{ background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", background:"#f8fafc", fontFamily:"sans-serif" }}>
              {_msgs.length === 0 ? (
                <div style={{ textAlign:"center", color:C.slate, fontSize:13, marginTop:30, lineHeight:1.7 }}>No messages yet.<br/>Send one below to reach the other party.</div>
              ) : _msgs.map((m, i) => {
                if (!m) return null;
                const mine = m.from === _myRole || m.from === "me";
                const sys = m.from === "system";
                if (sys) return <div key={i} style={{ textAlign:"center", fontSize:11.5, color:C.slate, margin:"10px 0", fontStyle:"italic" }}>{m.text}</div>;
                return (
                  <div key={i} style={{ display:"flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom:10 }}>
                    <div style={{ maxWidth:"78%", background: mine ? C.brass : "#fff", color: mine ? "#fff" : C.navy, border: mine ? "none" : `1px solid ${C.mist}`, borderRadius:12, padding:"9px 13px", fontSize:13, lineHeight:1.5 }}>
                      <div style={{ fontSize:10, fontWeight:800, opacity:0.7, marginBottom:3, textTransform:"uppercase", letterSpacing:0.5 }}>{mine ? "You" : (m.from || "Other party")}</div>
                      {m.text}
                      {m.time && <div style={{ fontSize:9.5, opacity:0.6, marginTop:4, textAlign:"right" }}>{m.time}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop:`1px solid ${C.mist}`, padding:"12px 14px", background:"#fff", display:"flex", gap:8 }}>
              <input value={msgDraft} onChange={e=>setMsgDraft(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") sendDealMessage(); }} placeholder="Type a message…" style={{ flex:1, border:`1px solid ${C.mist}`, borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"sans-serif", outline:"none" }} />
              <button onClick={sendDealMessage} disabled={!msgDraft.trim()} style={{ background: msgDraft.trim() ? C.navy : C.mist, color:"#fff", border:"none", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:800, fontFamily:"sans-serif", cursor: msgDraft.trim() ? "pointer" : "default" }}>Send</button>
            </div>
          </div>
        </div>
      )}
      <ProgressBar step={step} setStep={setStep} maxStep={maxStep} dealPaid={dealPaid}/>

      {negotiate.dealFinalized && (
        <div style={{ background:C.greenLight, borderBottom:`2px solid ${C.green}`, padding:"12px 1.25rem", textAlign:"center", fontFamily:"sans-serif" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"#0f6e56", marginBottom:3 }}>🔒 Deal Finalized &amp; Closed — permanent record</div>
          <div style={{ fontSize:12, color:C.slate, lineHeight:1.6, maxWidth:600, margin:"0 auto" }}>
            Everything here is frozen: terms, documents, and signatures are final and can no longer be changed, added, or deleted. You can view and print any part of it as your record of the sale, but nothing can be edited.
          
          </div>
          {guestUntil && (
            // The guest keeps 60 days to download. Saying so is the difference
            // between them saving their bill of sale and losing it.
            <div style={{ fontSize:12, color:"#0f6e56", fontWeight:700, marginTop:8, lineHeight:1.6, maxWidth:620, margin:"8px auto 0" }}>
              You can open this deal until <b>{new Date(guestUntil).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</b> to download or print anything you need. Save your copies before then.
            </div>
          )}
        </div>
      )}

      {negotiate.canceled && !negotiate.dealFinalized && (
        <div style={{ background:"#fdecec", borderBottom:`2px solid ${C.red}`, padding:"14px 1.25rem", textAlign:"center", fontFamily:"sans-serif" }}>
          <div style={{ fontSize:14, fontWeight:800, color:C.red, marginBottom:4 }}>This deal was canceled</div>
          <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.6, maxWidth:600, margin:"0 auto 10px" }}>
            {negotiate.canceled.byName} canceled this deal on {negotiate.canceled.date}{negotiate.canceled.reason?` — “${negotiate.canceled.reason}”`:""}. It's now closed for both parties.
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            {amInitiator ? (
              <>
                {/* The fee follows the person who paid it, so only they carry a deal
                    forward. Re-inviting keeps the boat and the terms and simply
                    replaces the other party. */}
                <button onClick={()=>relistBoat()} style={{ ...S.btnBrass, fontSize:13, padding:"9px 20px" }}>Same boat, invite someone else &rarr;</button>
                <button onClick={()=>startNewDeal()} style={{ ...S.btnOutline, fontSize:13, padding:"9px 20px" }}>Start a fresh deal (different boat)</button>
              </>
            ) : (
              <>
                {/* The invited party paid nothing. Giving them "Start a fresh deal"
                    handed them a full deal builder for free — they go back to the
                    landing page and start their own deal like anyone else. */}
                <button onClick={leaveDeal} style={{ ...S.btnBrass, fontSize:13, padding:"9px 20px" }}>Close this deal and sign out of it &rarr;</button>
              </>
            )}
          </div>
        </div>
      )}

      {negotiate.depositEnded && !negotiate.canceled && (() => {
        // The deal ended because the earnest money never arrived. For whoever paid
        // the $249 this is the moment they either roll into a new deal or ask for
        // their money back — so both doors are here, with the better one first.
        const iPaid = dealPaid && amInitiator;
        return (
          <div style={{ background:"#fdecec", borderBottom:`2px solid ${C.red}`, padding:"14px 1.25rem", textAlign:"center", fontFamily:"sans-serif" }}>
            <div style={{ fontSize:14, fontWeight:800, color:C.red, marginBottom:4 }}>This deal ended — the earnest-money deposit was never funded</div>
            <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.6, maxWidth:640, margin:"0 auto 12px" }}>
              {iPaid
                ? "The deposit didn't arrive before the agreed deadline, so this deal is closed. Your $249 isn't spent — it carries over. You have 60 days to start another deal with a different buyer, or a different boat, at no additional fee."
                : "The deposit didn't arrive before the agreed deadline, so this deal is closed. Nothing further is owed by either party."}
            </div>
            {iPaid && (
              <>
                {amInitiator && <button onClick={()=>relistBoat()} style={{ ...S.btnBrass, fontSize:13.5, padding:"11px 24px" }}>Find another buyer — start a new deal with this boat →</button>}
                <div style={{ marginTop:11 }}>
                  <button
                    onClick={()=>{ setSupportType("Request a refund of my $249 fee"); setSupportMsg(`The earnest-money deposit was never funded on this deal, so it ended before closing.\n\nDeal ID: ${dealId || "—"}\n\nWhat happened: `); setSupportSent(false); setSupportErr(""); setSupportModal(true); }}
                    style={{ background:"none", border:"none", color:C.slate, fontSize:12, fontFamily:"sans-serif", cursor:"pointer", textDecoration:"underline" }}>
                    I'd rather request a refund
                  </button>
                </div>
              </>
            )}
            {!iPaid && (
              // Whoever did not pay was left sitting in a dead deal with no way
              // out. They leave it; they do not get a free one.
              <button onClick={leaveDeal} style={{ ...S.btnBrass, fontSize:13, padding:"9px 20px" }}>Close this deal and sign out of it &rarr;</button>
            )}
          </div>
        );
      })()}

      {(() => {
        // A rejected offer with nothing accepted is a dead end the app used to just
        // leave people sitting in. Surfaced at the TOP so it can't be missed — the
        // rejection pill down in the offer ladder was far too easy to scroll past.
        const offs = negotiate.offers || [];
        const last = offs.length ? offs[offs.length - 1] : null;
        // Only worth surfacing when you are NOT already in the Deal Room. Shown on
        // step 2 as well, the "Back to the Deal Room" button appeared to do nothing
        // — you were looking at the room, with the banner still pinned above it.
        const stalled = step !== 2
          && offs.length > 0
          && !offs.some(o => o.status === "accepted")
          && last?.status === "rejected"
          && !negotiate.canceled
          && !negotiate.depositEnded;
        if (!stalled) return null;
        const isBuyer = (myDealRole || user?.role) === "buyer";
        return (
          <div style={{ background:"#fff8e6", borderBottom:`2px solid ${C.brass}`, padding:"14px 1.25rem", textAlign:"center", fontFamily:"sans-serif" }}>
            <div style={{ fontSize:13.5, fontWeight:800, color:"#7a5500", marginBottom:4 }}>No agreement yet — the last offer was rejected</div>
            <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.6, maxWidth:640, margin:"0 auto 12px" }}>
              {isBuyer
                ? "You can send another offer with different terms, or use the message thread to find out what the seller actually needs. If you can't get there, nothing is lost — this deal simply ends."
                : "You can counter with terms that work for you, or talk it through in the message thread. If this buyer isn't the one, you can start fresh with a different buyer and keep this boat's details."}
            </div>
            <div style={{ display:"flex", gap:9, justifyContent:"center", flexWrap:"wrap" }}>
              {/* setStep alone did nothing useful: the buyer is already on step 2 so
                  nothing changed, and the seller sits on step 1 where raw setStep
                  never raises maxStep, so the step bar blocked them. goToStep is the
                  path the rest of the app uses — it lifts maxStep and saves. */}
              <button onClick={()=>goToStep(2)} style={{ ...S.btnBrass, fontSize:13, padding:"10px 20px" }}>Back to the Deal Room →</button>
              {!isBuyer && amInitiator && <button onClick={()=>relistBoat()} style={{ ...S.btnOutline, fontSize:13, padding:"10px 20px" }}>Start over with a different buyer</button>}
            </div>
          </div>
        );
      })()}

      {!negotiate.canceled && (dealId || step>0) && (
        <div style={{ maxWidth:880, margin:"0 auto", padding:"8px 1.25rem 0", textAlign:"right" }}>
          <button onClick={()=>setCancelModal(true)} style={{ background:"none", border:"none", color:C.slate, fontSize:11.5, fontFamily:"sans-serif", cursor:"pointer", textDecoration:"underline" }}>End this deal</button>
        </div>
      )}

      {dealPaid && !negotiate.canceled && negotiate.deposit > 0 && negotiate.depositDeadline && !negotiate.depositEnded && (() => {
        // One banner, five states, shown identically to BOTH parties so neither is
        // ever guessing whose move it is: waiting to fund → on hold pending the
        // seller's verification → secured → disputed → overdue.
        const verif = negotiate.depositVerification || null;
        const hasProof = !!(negotiate.depositProof && negotiate.depositProof.ref);
        const verified = verif?.status === "confirmed";
        const disputed = verif?.status === "disputed";
        const awaiting = hasProof && !verif;
        const overdue = !hasProof && Date.now() > negotiate.depositDeadline;
        const left = hoursLeft(negotiate.depositDeadline);
        const isBuyer = (myDealRole || user?.role) === "buyer";
        const bg = verified ? "#eafaf1" : (overdue || disputed) ? "#fdecec" : "#fff8e6";
        const bar = verified ? C.green : (overdue || disputed) ? C.red : C.brass;
        const headColor = verified ? C.green : (overdue || disputed) ? C.red : "#7a5500";
        const head = verified ? "✓ Deal secured — deposit verified by the seller"
          : disputed ? "⚠️ Deal on hold — the seller could not verify the deposit"
          : awaiting ? "⏸️ Deal on hold — waiting for the seller to verify the deposit"
          : overdue ? "⚠️ Earnest-money deposit is overdue"
          : `⏳ Earnest-money deposit due in ${left}`;
        const body = verified
          ? "The boat is held off the market while due diligence is completed. Both sides are protected: the buyer has the agreed time to inspect, and the seller has the buyer's committed deposit."
          : disputed
          ? (isBuyer
              ? "The seller reports the funds haven't arrived. Check with your escrow agent or bank — wires can take 1–2 business days — then submit corrected proof on the Due Diligence step."
              : "You reported the deposit hasn't arrived. Nothing moves forward until it's sorted. You can give the buyer more time or void the deal on the Due Diligence step.")
          : awaiting
          ? (isBuyer
              ? "Your proof is in and the clock has stopped. The seller is confirming with their escrow agent that the funds arrived — this deal is not secured until they do."
              : "The buyer submitted proof of their deposit. Confirm with your escrow agent that the money actually arrived, then verify it on the Due Diligence step — the deal is not secured until you do.")
          : isBuyer
          ? (overdue
              ? "Your deposit proof is past the agreed deadline. Upload it on the Due Diligence step now — the seller may end the deal if it isn't provided."
              : "Send your earnest-money deposit, then upload the proof on the Due Diligence step. The deposit is what holds this boat off the market for you.")
          : (overdue
              ? "The buyer's deposit proof is past the agreed deadline. You can give them more time or end the deal."
              : "Waiting for the buyer to submit their earnest-money deposit proof within the agreed window.");
        const showBtn = !verified && ((isBuyer && !awaiting) || (!isBuyer && (awaiting || disputed)));
        return (
          <div style={{ background:bg, borderBottom:`2px solid ${bar}`, padding:"12px 1.25rem", textAlign:"center", fontFamily:"sans-serif" }}>
            <div style={{ fontSize:13, fontWeight:800, color:headColor, marginBottom:3 }}>{head}</div>
            <div style={{ fontSize:12, color:C.slate, lineHeight:1.6, maxWidth:620, margin:"0 auto" }}>{body}</div>
            {/* Same fault as the rejection banner: raw setStep never raises maxStep,
                so the step bar refused the move and the button looked dead. */}
            {showBtn && <button onClick={()=>goToStep(3)} style={{ ...S.btnBrass, fontSize:12, padding:"7px 16px", marginTop:8 }}>Go to Due Diligence →</button>}
          </div>
        );
      })()}
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
      {dealFrozen && step <= 3 && (
        <div style={{ maxWidth:880, margin:"12px auto 0", padding:"0 1.25rem" }}>
          <div style={{ background:"#f4f7f5", border:`1px solid ${C.green}`, borderRadius:8, padding:"12px 14px", fontFamily:"sans-serif", fontSize:12.5, color:C.slate, lineHeight:1.6 }}>
            🔒 <b>Sealed.</b> This deal is finalized, so the vessel, parties, terms and due-diligence pages are read-only from here on. You can still open <b>Documents</b> to view, print or send anything from the sale. To sell another boat, or the same boat to someone else, start a new deal.
            <div style={{ marginTop:10 }}>
              <button onClick={()=>startNewDeal()} style={{ ...S.btnBrass, fontSize:12.5, padding:"8px 18px" }}>Start a new deal →</button>
            </div>
          </div>
        </div>
      )}
      <div style={dealFrozen && step <= 3 ? { pointerEvents:"none", opacity:0.6, userSelect:"text" } : undefined} aria-disabled={dealFrozen && step <= 3 ? "true" : undefined}>
      {step===0 && <StepVessel data={vessel} setData={setVesselAndSave} userRole={myDealRole || user?.role || "seller"} onNext={()=>goToStep(1)}/>}
      {step===1 && <StepParties data={parties} setData={setPartiesAndSave} userRole={myDealRole || user?.role || "buyer"} partyBJoined={partyBJoined} vessel={vessel} offers={negotiate?.offers} onNext={()=>goToStep(2)} onBack={()=>setStep(0)} dealId={dealId} user={user} ensureSaved={ensureDealSaved}/>}
      {step===2 && <StepNegotiateTerms vessel={vessel} parties={parties} data={negotiate} setData={setNegotiateAndSave} myRole={myDealRole || user?.role || "buyer"} amInitiator={amInitiator} dealId={dealId} stripeReturn={stripeReturn} authedFetch={authedFetch} onRefresh={()=>window.location.reload()} refreshing={refreshing} onNext={()=>goToStep(3)} onBack={()=>setStep(1)}/>}
      {step===3 && (dealPaid ? <StepDueDiligence data={ddData} setData={setDdDataAndSave} setNegotiate={setNegotiateAndSave} vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} myRole={myDealRole || user?.role || "buyer"} amInitiator={amInitiator} dealId={dealId} authToken={tokenRef.current?.token} onNext={()=>goToStep(4)} onBack={()=>setStep(2)}/> : <LockedStep stepName={STEPS[3]} onBack={()=>setStep(2)}/>)}
      {step===4 && (dealPaid ? <DocumentsStepV2 data={docsData} setData={setDocsDataAndSave} vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} myRole={myDealRole || user?.role || "buyer"} amInitiator={amInitiator} dealId={dealId} onNext={()=>goToStep(5)} onBack={()=>setStep(3)}/> : <LockedStep stepName={STEPS[4]} onBack={()=>setStep(2)}/>)}
      </div>
      {step===5 && (dealPaid ? <StepClosing vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} setNegotiate={setNegotiateAndSave} ddData={ddData} docsData={docsData} setDocsData={setDocsDataAndSave} myRole={myDealRole || user?.role || "buyer"} amInitiator={amInitiator}  onBack={()=>setStep(4)}
                    onOpenDoc={(id)=>{ setDocsDataAndSave(d => ({ ...d, openDocId: id })); setStep(4); }}
                    onFinalize={()=>{ setTimeout(()=>{ finalizedRef.current = true; }, 2500); }}/> : <LockedStep stepName={STEPS[5]} onBack={()=>setStep(2)}/>)}

      {cancelModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" }}>
          <div style={{ background:"#fff", borderRadius:12, padding:"1.75rem", maxWidth:440, width:"100%" }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.navy, fontFamily:"'Georgia',serif", marginBottom:8 }}>End this deal?</div>
            <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7, marginBottom:14 }}>
              {dealPaid ? (
                <>This deal is locked and the Purchase &amp; Sale Agreement is signed. Ending it closes the deal for both parties and no one can move it forward. Your offers, terms, and signed documents stay on record as evidence of what was agreed.
                {" "}{amInitiator ? <b>Your $249 isn&rsquo;t lost — you have 60 days to start another deal, with a different buyer or a different boat, at no extra charge.</b> : "The party who paid keeps their fee as a 60-day credit toward another deal."}
                {" "}If earnest money is being held, settle that between yourselves or with your escrow provider. This can&rsquo;t be undone.</>
              ) : (
                <>This ends the deal for both you and the other party. Your offers and terms stay on record, but no one can move it forward. You can start a new deal afterward. This can&rsquo;t be undone.</>
              )}
            </div>
            <Field label={dealPaid ? "Reason (required — shared with the other party)" : "Reason (optional — shared with the other party)"}>
              <textarea style={{...S.textarea, minHeight:60}} value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="e.g. Decided to keep the boat / found another buyer / changed my mind" />
            </Field>
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={()=>{ setCancelModal(false); setCancelReason(""); }} style={{ ...S.btnOutline, flex:1 }}>Keep the deal</button>
              <button onClick={cancelDeal} disabled={dealPaid && !cancelReason.trim()}
                style={{ ...S.btn, flex:1, background:C.red, color:"#fff", border:"none", opacity:(dealPaid && !cancelReason.trim())?0.45:1, cursor:(dealPaid && !cancelReason.trim())?"not-allowed":"pointer" }}>End deal</button>
            </div>
          </div>
        </div>
      )}

      {supportModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" }}>
          <div style={{ background:"#fff", borderRadius:12, padding:"1.75rem", maxWidth:480, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
            {supportSent ? (
              <>
                <div style={{ fontSize:18, fontWeight:800, color:C.navy, fontFamily:"'Georgia',serif", marginBottom:8 }}>✓ Request sent</div>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7, marginBottom:18 }}>Thanks — we've sent your request to the BoatClosers team and emailed you a confirmation. We'll review it and reply by email.</div>
                <button onClick={()=>{ setSupportModal(false); setSupportSent(false); }} style={{ ...S.btnBrass }}>Close</button>
              </>
            ) : (
              <>
                <div style={{ fontSize:18, fontWeight:800, color:C.navy, fontFamily:"'Georgia',serif", marginBottom:6 }}>Help &amp; Support</div>
                <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.65, marginBottom:16 }}>
                  Having trouble, or a disagreement with the other party? Tell us what's going on and the BoatClosers team will help — we can explain the process, help both sides communicate, and review the issue. We're not a party to your deal and don't hold funds, and any refund request is reviewed case by case.
                </div>
                <label style={S.label}>What do you need help with?</label>
                <select style={S.select} value={supportType} onChange={e=>setSupportType(e.target.value)}>
                  <option>A conflict or disagreement with the other party</option>
                  <option>A problem with a deposit</option>
                  <option>A technical problem with the app</option>
                  <option>Request a refund of my $249 fee</option>
                  <option>Something else</option>
                </select>
                <div style={{ height:12 }}/>
                <label style={S.label}>Tell us what's happening</label>
                <textarea style={{...S.textarea, minHeight:110}} value={supportMsg} onChange={e=>setSupportMsg(e.target.value)} placeholder="Describe the problem and what you'd like to happen. Include any details that help us understand it." />
                {supportErr && <div style={{ fontSize:12, color:C.red, fontFamily:"sans-serif", marginTop:8 }}>{supportErr}</div>}
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button onClick={()=>setSupportModal(false)} style={{ ...S.btnOutline, flex:1 }}>Cancel</button>
                  <button onClick={submitSupport} disabled={supportSending} style={{ ...S.btnBrass, flex:1, opacity:supportSending?0.6:1 }}>{supportSending ? "Sending…" : "Send to BoatClosers"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <LegalFooter C={C} authedFetch={authedFetch} signedIn={!!user} />
    </div>
  );
}
