'use client'

import { useState, useRef, useEffect } from "react";

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
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: gap||14 }}>{children}</div>;
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
const STEPS = ["Vessel","Parties","Negotiate & Terms","Due Diligence","Documents","Closing"];
function ProgressBar({ step, setStep, maxStep }) {
  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.mist}`, padding:"0.85rem 2rem" }}>
      <div style={{ maxWidth:820, margin:"0 auto", display:"flex", alignItems:"center" }}>
        {STEPS.map((s,i) => {
          const done    = i < step;
          const current = i === step;
          const preview = i > step; // ahead — always clickable as preview
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", flex: i<STEPS.length-1 ? 1 : 0 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div
                  onClick={() => setStep(i)}
                  title={preview ? `Preview ${s}` : done ? `Go back to ${s}` : s}
                  style={{
                    width:28, height:28, borderRadius:"50%",
                    background: done ? C.green : current ? C.brass : "transparent",
                    color: done ? "#fff" : current ? "#fff" : C.slate,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, fontFamily:"sans-serif", flexShrink:0,
                    border: current ? `2px solid ${C.navy}` : preview ? `2px dashed ${C.mist}` : "none",
                    cursor:"pointer",
                    opacity: preview ? 0.65 : 1,
                    transition:"all 0.15s",
                  }}
                >
                  {done ? "✓" : i+1}
                </div>
                <div
                  onClick={() => setStep(i)}
                  style={{
                    fontSize:9, fontFamily:"sans-serif",
                    color: current ? C.navy : done ? C.teal : C.slate,
                    marginTop:3, whiteSpace:"nowrap",
                    fontWeight: current ? 700 : 400,
                    cursor:"pointer",
                    textDecoration: done ? "underline" : preview ? "none" : "none",
                    textDecorationColor: C.teal,
                    opacity: preview ? 0.6 : 1,
                  }}
                >
                  {s}{preview ? " 👁" : ""}
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


// ─────────────────────────────────────────────────────────────────────────────
function StepVessel({ data, setData, onNext }) {
  const set = (k,v) => setData(d => ({...d,[k]:v}));
  // Only year, make, model required — rest optional until paywall
  const canContinue = data.year && data.make && data.model;
  return (
    <div style={S.page}>
      <TipBox tips={TIPS.vessel} />
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={S.h1}>Vessel Information</h1>
        <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>Fill in what you have now. You can complete remaining fields before signing. Year, make, and model are required to continue.</p>
      </div>
      <div style={S.card}>
        <h3 style={S.h3}>Identification</h3>
        <Grid2>
          <Field label="Year *"><input style={S.input} type="number" value={data.year} onChange={e=>set("year",e.target.value)} placeholder="2019" /></Field>
          <Field label="Make / Manufacturer *"><input style={S.input} value={data.make} onChange={e=>set("make",e.target.value)} placeholder="Boston Whaler" /></Field>
          <Field label="Model *"><input style={S.input} value={data.model} onChange={e=>set("model",e.target.value)} placeholder="Outrage 280" /></Field>
          <Field label="Vessel Name (if any)"><input style={S.input} value={data.name} onChange={e=>set("name",e.target.value)} placeholder="Sea Dreams" /></Field>
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
          <Field label="Asking Price ($)"><input style={S.input} type="number" value={data.askingPrice} onChange={e=>set("askingPrice",e.target.value)} placeholder="85000" /></Field>
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
function StepParties({ data, setData, userRole, onNext, onBack }) {
  const set = (side,k,v) => setData(d => ({...d,[side]:{...d[side],[k]:v}}));
  const canContinue = userRole==="seller"
    ? (data.seller.name && data.seller.email)
    : (data.buyer.name && data.buyer.email);

  const sides = userRole==="seller" ? ["seller","buyer"] : ["buyer","seller"];

  return (
    <div style={S.page}>
      <TipBox tips={TIPS.parties} />
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={S.h1}>Buyer & Seller Information</h1>
        <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>
          {userRole==="seller" ? "You are the Seller on this deal." : "You are the Buyer on this deal."} Your side is highlighted. The deal initiator controls vessel details and deal terms.
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {sides.map(side => (
          <div key={side} style={{ ...S.card, border: side===userRole ? `2px solid ${C.brass}` : `0.5px solid ${C.mist}`, position:"relative" }}>
            {side===userRole && <span style={{ ...S.pill, position:"absolute", top:12, right:12, background:C.brass, color:C.navy }}>You</span>}
            <h3 style={S.h3}>{side==="buyer" ? "Buyer" : "Seller"}</h3>
            <Grid2>
              <Field label={`${side==="buyer"?"Buyer":"Seller"} Full Legal Name *`}>
                <input style={S.input} value={data[side].name} onChange={e=>set(side,"name",e.target.value)} />
              </Field>
              <Field label="Email *">
                <input style={S.input} type="email" value={data[side].email} onChange={e=>set(side,"email",e.target.value)} />
              </Field>
              <Field label="Phone">
                <input style={S.input} value={data[side].phone} onChange={e=>set(side,"phone",e.target.value)} />
              </Field>
              <Field label="Address">
                <input style={S.input} value={data[side].address} onChange={e=>set(side,"address",e.target.value)} />
              </Field>
              <Field label="City">
                <input style={S.input} value={data[side].city} onChange={e=>set(side,"city",e.target.value)} />
              </Field>
              <Field label="State / Zip">
                <input style={S.input} value={data[side].stateZip} onChange={e=>set(side,"stateZip",e.target.value)} />
              </Field>
            </Grid2>
            {side!==userRole && (
              <div style={{ marginTop:12, padding:"10px 12px", background:C.sandDark, borderRadius:5, fontSize:12, fontFamily:"sans-serif", color:C.slate }}>
                The other party can fill in their own info after you invite them by email. You can also enter it on their behalf now.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── INVITE OTHER PARTY ── */}
      <div style={{ background:C.navy, borderRadius:8, padding:"14px 18px", marginTop:16, display:"flex", gap:14, alignItems:"flex-start" }}>
        <div style={{ fontSize:22, flexShrink:0 }}>📧</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.brass, fontFamily:"sans-serif", marginBottom:4 }}>Invite the Other Party</div>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.75)", lineHeight:1.7, marginBottom:10 }}>
            The other party needs a free BoatClosers account to receive offer notifications, respond to messages, and sign documents. Enter their email above, then send them this invite link. They create their account, your deal is pre-linked, and their info populates their side automatically.
          </div>
          <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:6, padding:"9px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.5)", wordBreak:"break-all" }}>
              https://boatclosers.com/join?deal=DEAL-ID
            </div>
            <button onClick={()=>{
              navigator.clipboard?.writeText("https://boatclosers.com/join?deal=DEAL-ID");
            }} style={{ background:C.brass, color:C.navy, border:"none", borderRadius:5, padding:"5px 12px", fontSize:11, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", flexShrink:0 }}>
              Copy Link
            </button>
          </div>
          <div style={{ fontSize:10, fontFamily:"sans-serif", color:"rgba(255,255,255,0.35)", marginTop:8 }}>
            💡 When they sign up using this link, their contact info auto-fills the correct side of this deal and both of you get email notifications for offers and messages.
          </div>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={S.btnBrass} disabled={!canContinue} onClick={onNext}>Continue to Negotiate & Terms →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — NEGOTIATE + TERMS (combined)
// ─────────────────────────────────────────────────────────────────────────────
function StepNegotiateTerms({ vessel, parties, data, setData, onNext, onBack }) {
  const [newMsg, setNewMsg] = useState("");
  const [offerAmt, setOfferAmt] = useState(data.currentOffer || vessel.askingPrice || "");
  const [escrowPct, setEscrowPct] = useState(data.escrowPct!==undefined ? String(data.escrowPct) : "0");
  const [escrowPath, setEscrowPath] = useState(data.escrowPath || "escrow_com");
  const [ddDays, setDdDays] = useState(data.dueDiligenceDays || "10");
  const [ddStart, setDdStart] = useState(data.ddStartDate || today());
  const [closingDate, setClosingDate] = useState(data.closingDate || "");
  const [offers, setOffers] = useState(data.offers || []);
  const [messages, setMessages] = useState(data.messages || [
    { from:"seller", text:`Asking price is ${fmt(vessel.askingPrice||0)}. Let's talk!`, time: new Date().toLocaleTimeString() }
  ]);
  // Purchase Agreement modal — triggered when offer accepted
  const [paModal, setPaModal] = useState(null); // null or the offer being accepted
  const [paBuyerName, setPaBuyerName] = useState("");
  const [paSellerName, setPaSellerName] = useState("");
  const [paBuyerDisc, setPaBuyerDisc] = useState(false);
  const [paSellerDisc, setPaSellerDisc] = useState(false);
  const paBothSigned = paBuyerName.trim() && paSellerName.trim() && paBuyerDisc && paSellerDisc;

  // Verbal deal
  const [verbalDeal, setVerbalDeal] = useState(data.verbalDeal||false);
  const [verbalNote, setVerbalNote] = useState(data.verbalNote||"");
  const [negMode, setNegMode] = useState("negotiate"); // "negotiate" | "agreed"

  // Outside deal / agreed price
  const [agreedOutside, setAgreedOutside] = useState("");
  const [outsideMethod, setOutsideMethod] = useState("verbal");

  // DD custom / extension
  const [ddCustom, setDdCustom] = useState(false);
  const [ddExtension, setDdExtension] = useState(data.ddExtension||false);
  const [ddExtDays, setDdExtDays] = useState(data.ddExtDays||"7");
  const [ddExtDepositRule, setDdExtDepositRule] = useState(data.ddExtDepositRule||"returnable");

  // Deposit rule
  const [depositRule, setDepositRule] = useState(data.depositRule||"fully_returnable");
  const [depositRuleCustom, setDepositRuleCustom] = useState(data.depositRuleCustom||"");

  // Payment type + financing
  const [paymentType, setPaymentType] = useState(data.paymentType||"cash");
  const [financeContingency, setFinanceContingency] = useState(data.financeContingency||"14");

  const messagesEnd = useRef(null);
  useEffect(() => { messagesEnd.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(m => [...m, {from:"buyer", text:newMsg, time:new Date().toLocaleTimeString()}]);
    setNewMsg("");
  };

  const makeOffer = () => {
    const amt = Number(offerAmt);
    if (!amt) return;
    const deposit = Math.round(amt*Number(escrowPct)/100);
    const offer = { id:Date.now(), amount:amt, escrowPct:Number(escrowPct), escrowPath, deposit, ddDays, closingDate, verbal:verbalDeal, status:"pending", time:new Date().toLocaleTimeString() };
    setOffers(o => [...o, offer]);
    const escrowLabel = escrowPath==="escrow_com"?"Escrow.com":escrowPath==="attorney"?"Third Party Attorney":"Direct to Seller";
    setMessages(m => [...m, {
      from:"buyer",
      text:`Offer: ${fmt(amt)}${deposit>0?` · ${fmt(deposit)} (${escrowPct}%) earnest money via ${escrowLabel}`:" · No deposit"} · DD: ${ddDays} days · Closing: ${closingDate||"TBD"}`,
      time:new Date().toLocaleTimeString()
    }]);
  };

  // Accepting an offer opens the PA signing modal first
  const acceptOffer = (id) => {
    const acc = offers.find(o => o.id===id);
    if (acc) setPaModal(acc);
  };

  const confirmAcceptWithPA = () => {
    if (!paBothSigned || !paModal) return;
    setOffers(o => o.map(of => of.id===paModal.id ? {...of, status:"accepted", paBuyerSig:paBuyerName, paSellerSig:paSellerName, paDate:today()} : of));
    setMessages(m => [...m, {from:"seller", text:`✓ Offer accepted — ${fmt(paModal.amount)}. Purchase Agreement signed by both parties on ${today()}.`, time:new Date().toLocaleTimeString()}]);
    setPaModal(null); setPaBuyerName(""); setPaSellerName(""); setPaBuyerDisc(false); setPaSellerDisc(false);
  };

  const rejectOffer = (id) => {
    setOffers(o => o.map(of => of.id===id ? {...of, status:"rejected"} : of));
  };

  const acceptedOffer = offers.find(o => o.status==="accepted");

  // Can proceed without accepted offer — just need some data
  const canProceed = offerAmt || acceptedOffer;

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

  // ── PURCHASE AGREEMENT MODAL ─────────────────────────────────────────────
  if (paModal) {
    const esc = paModal.escrowPath==="escrow_com"?"Escrow.com":paModal.escrowPath==="attorney"?"Third Party Attorney":"Direct to Seller";
    return (
      <div style={{ minHeight:"100vh", background:"rgba(8,21,46,0.85)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"2rem 1rem" }}>
        <div style={{ background:C.white, borderRadius:10, width:"100%", maxWidth:680, border:`2px solid ${C.brass}` }}>
          {/* Header */}
          <div style={{ background:C.navy, padding:"1rem 1.5rem", borderRadius:"8px 8px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:9, letterSpacing:3, color:C.brass, fontFamily:"sans-serif", textTransform:"uppercase" }}>BoatClosers.com</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.white, letterSpacing:0.5 }}>PURCHASE & SALE AGREEMENT</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif", marginTop:2 }}>This document is generated upon acceptance of offer · {today()}</div>
            </div>
          </div>

          <div style={{ padding:"1.5rem", overflowY:"auto", maxHeight:"65vh" }}>
            {/* Agreement body */}
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.text, lineHeight:1.8, marginBottom:16 }}>
              <p>This Purchase and Sale Agreement ("Agreement") is entered into as of <strong>{today()}</strong> between:</p>
              <div style={{ background:C.sandDark, borderRadius:5, padding:"10px 14px", margin:"10px 0" }}>
                <div><strong>Buyer:</strong> {parties.buyer.name||"[Buyer Name]"} &nbsp;|&nbsp; {parties.buyer.email||"[Email]"}</div>
                <div><strong>Seller:</strong> {parties.seller.name||"[Seller Name]"} &nbsp;|&nbsp; {parties.seller.email||"[Email]"}</div>
              </div>
              <p><strong>Vessel:</strong> {vessel.year||"[Year]"} {vessel.make||"[Make]"} {vessel.model||"[Model]"} · HIN: {vessel.hin||"[HIN]"} · Reg: {vessel.regNumber||"[Reg]"}</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, margin:"12px 0" }}>
                {[["Purchase Price",fmt(paModal.amount)],["Earnest Money",fmt(paModal.deposit)],["Escrow Method",esc]].map(([l,v])=>(
                  <div key={l} style={{ background:C.sandDark, borderRadius:4, padding:"8px 10px" }}>
                    <div style={{ fontSize:9, color:C.slate, textTransform:"uppercase", letterSpacing:0.5 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{v||"—"}</div>
                  </div>
                ))}
              </div>

              <p><strong>Due Diligence Period:</strong> {paModal.ddDays||"10"} days from execution. Buyer has the right to complete marine survey, sea trial, title search, and obtain insurance during this period, with the option to renegotiate or withdraw.</p>
              <p><strong>Closing Date:</strong> {paModal.closingDate||"To be mutually agreed"}.</p>
              <p>Vessel is sold <strong>"as-is, where-is"</strong> with no express or implied warranties except as specifically stated herein. Seller represents lawful ownership and the authority to convey clear title free of liens and encumbrances.</p>
              <p>If Buyer withdraws without cause after due diligence, earnest money may be forfeited per escrow terms. If Seller fails to perform, Buyer is entitled to return of earnest money and may pursue remedies at law.</p>
              <p style={{ fontWeight:700, color:C.slate }}>FACILITATOR DISCLAIMER: BoatClosers.com is a document facilitation platform only. We are not a broker, escrow agent, attorney, or party to this agreement. Both parties are solely responsible for all aspects of this transaction.</p>
            </div>

            <hr style={S.divider}/>

            {/* Disclaimer checkboxes */}
            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:5, padding:"10px 14px", fontSize:11, fontFamily:"sans-serif", color:"#7a5500", marginBottom:16 }}>
              By signing, both parties agree to the terms above and acknowledge that BoatClosers provides document facilitation only — not legal advice, brokerage, or escrow services.
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Buyer */}
              <div style={{ background:C.sandDark, borderRadius:6, padding:"14px" }}>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>Buyer: {parties.buyer.name||"Buyer"}</div>
                <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
                  <input type="checkbox" checked={paBuyerDisc} onChange={e=>setPaBuyerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
                  I have read and agree to all terms above
                </label>
                <label style={S.label}>Type full name to sign</label>
                <input style={S.input} placeholder="Buyer full legal name" value={paBuyerName} onChange={e=>setPaBuyerName(e.target.value)} />
              </div>
              {/* Seller */}
              <div style={{ background:C.sandDark, borderRadius:6, padding:"14px" }}>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>Seller: {parties.seller.name||"Seller"}</div>
                <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
                  <input type="checkbox" checked={paSellerDisc} onChange={e=>setPaSellerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
                  I have read and agree to all terms above
                </label>
                <label style={S.label}>Type full name to sign</label>
                <input style={S.input} placeholder="Seller full legal name" value={paSellerName} onChange={e=>setPaSellerName(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ padding:"1rem 1.5rem", borderTop:`1px solid ${C.mist}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <button style={S.btnOutline} onClick={()=>setPaModal(null)}>← Cancel</button>
            <button style={{ ...S.btnBrass, opacity: paBothSigned?1:0.4, cursor:paBothSigned?"pointer":"not-allowed" }} disabled={!paBothSigned} onClick={confirmAcceptWithPA}>
              Both Parties Sign & Accept Offer →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <TipBox tips={TIPS.negotiate} />
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={S.h1}>Negotiate & Terms</h1>
        <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>Make offers, set your terms, and agree on a closing timeline — all on one page. You can proceed without a formally accepted offer.</p>
      </div>

      {/* ── VERBAL AGREEMENT ── */}
      <div style={{ ...S.card, borderLeft:`4px solid ${C.teal}`, marginBottom:16 }}>
        <label style={{ display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer" }}>
          <input type="checkbox" checked={verbalDeal} onChange={e=>setVerbalDeal(e.target.checked)} style={{ width:18, height:18, marginTop:2, accentColor:C.teal, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>This deal was verbally negotiated</div>
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, marginTop:3, lineHeight:1.6 }}>
              Check this if the price and terms were agreed by phone, in person, or by verbal agreement before using this platform. You can still enter the agreed price and terms below to generate your documents.
            </div>
          </div>
        </label>
        {verbalDeal && (
          <div style={{ marginTop:12, marginLeft:30 }}>
            <label style={S.label}>Brief description of verbal agreement (optional — for your records)</label>
            <textarea style={{...S.textarea, minHeight:56}} value={verbalNote} onChange={e=>setVerbalNote(e.target.value)} placeholder="e.g. Agreed on $72,000 by phone on June 3rd. Seller to include trailer. No deposit. Closing at seller's marina." />
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.teal, marginTop:6 }}>
              💡 This note will appear in the Purchase Agreement as the basis for the negotiated price.
            </div>
          </div>
        )}
      </div>

      {/* ── HOW MESSAGING WORKS ── */}
      <div style={{ background:C.navy, borderRadius:8, padding:"14px 18px", marginBottom:16, display:"flex", gap:14, alignItems:"flex-start" }}>
        <div style={{ fontSize:24, flexShrink:0 }}>💬</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:C.brass, fontFamily:"sans-serif", marginBottom:4 }}>How to Negotiate with the Other Party</div>
          <div style={{ fontSize:12, fontFamily:"sans-serif", color:"rgba(255,255,255,0.75)", lineHeight:1.7 }}>
            Use the message thread below to negotiate price back and forth — just like texting. When you submit an offer, a notification is sent to the other party's email so they can log in, respond, and counter-offer. They see only their own side and the shared deal — not your account. Once both parties agree, accept the offer to generate the Purchase Agreement for both to sign.
          </div>
          <div style={{ marginTop:8, fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.45)" }}>
            💡 The other party must create a free BoatClosers account to respond. Send them the invite link from the Parties step.
          </div>
        </div>
      </div>

      {/* ── NEGOTIATION PANEL ── */}
      <div style={{ ...S.card, marginBottom:16 }}>
        {/* Mode toggle */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          <button onClick={()=>setNegMode("negotiate")} style={{ padding:"11px", borderRadius:6, cursor:"pointer", border:`2px solid ${negMode==="negotiate"?C.navy:C.mist}`, background:negMode==="negotiate"?C.navy:"transparent", fontFamily:"sans-serif", textAlign:"left" }}>
            <div style={{ fontSize:13, fontWeight:700, color:negMode==="negotiate"?"#fff":C.navy }}>💬 Negotiate Price</div>
            <div style={{ fontSize:10, color:negMode==="negotiate"?"rgba(255,255,255,0.6)":C.slate, marginTop:1 }}>Make offers & counter-offers back and forth</div>
          </button>
          <button onClick={()=>setNegMode("agreed")} style={{ padding:"11px", borderRadius:6, cursor:"pointer", border:`2px solid ${negMode==="agreed"?C.brass:C.mist}`, background:negMode==="agreed"?C.brass:"transparent", fontFamily:"sans-serif", textAlign:"left" }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>✅ Enter Agreed Price</div>
            <div style={{ fontSize:10, color:negMode==="agreed"?"rgba(0,0,0,0.5)":C.slate, marginTop:1 }}>Price already agreed — enter it directly</div>
          </button>
        </div>

        {/* ── NEGOTIATE MODE: messages + offer form ── */}
        {negMode==="negotiate" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <h3 style={S.h3}>Messages</h3>
              <div style={{ height:210, overflowY:"auto", display:"flex", flexDirection:"column", border:`1px solid ${C.mist}`, borderRadius:5, padding:"8px", marginBottom:8 }}>
                {messages.map((m,i) => (
                  <div key={i} style={{ alignSelf:m.from==="buyer"?"flex-end":"flex-start", maxWidth:"88%", background:m.from==="buyer"?C.navy:C.sandDark, color:m.from==="buyer"?"#fff":C.text, borderRadius:m.from==="buyer"?"12px 12px 2px 12px":"12px 12px 12px 2px", padding:"8px 12px", fontSize:12, fontFamily:"sans-serif", lineHeight:1.5, marginBottom:5 }}>
                    <div style={{ fontSize:10, color:m.from==="buyer"?"rgba(255,255,255,0.5)":C.slate, marginBottom:2 }}>{m.from==="buyer"?(parties.buyer.name||"Buyer"):(parties.seller.name||"Seller")} · {m.time}</div>
                    {m.text}
                  </div>
                ))}
                <div ref={messagesEnd}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{...S.input, flex:1, fontSize:12}} value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type a message…" onKeyDown={e=>e.key==="Enter"&&sendMsg()} />
                <button style={S.btn} onClick={sendMsg}>Send</button>
              </div>
            </div>
            <div>
              <h3 style={S.h3}>Make an Offer</h3>
              <Field label="Offer Amount ($)">
                <input style={S.input} type="number" value={offerAmt} onChange={e=>setOfferAmt(e.target.value)} placeholder={vessel.askingPrice||"85000"} />
              </Field>
              <Field label="Earnest Money Deposit">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                  {["0","5","7.5","10"].map(p => (
                    <button key={p} onClick={()=>setEscrowPct(p)} style={{ ...S.btnOutline, background:escrowPct===p?C.navy:"transparent", color:escrowPct===p?"#fff":C.navy, fontSize:11, padding:"7px 0", textAlign:"center" }}>
                      {p==="0"?"No Deposit":`${p}% · ${fmt(Math.round(Number(offerAmt||0)*Number(p)/100))}`}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Escrow Method" span2>
                <EscrowSelector value={escrowPath} onChange={setEscrowPath} depositAmt={Math.round(Number(offerAmt||0)*Number(escrowPct)/100)} />
              </Field>
              <button style={{...S.btnBrass, width:"100%", gridColumn:"span 2"}} onClick={makeOffer} disabled={!offerAmt}>Submit Offer</button>
            </div>
          </div>
        )}

        {/* ── AGREED PRICE MODE ── */}
        {negMode==="agreed" && (
          <div>
            <div style={{ background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:5, padding:"9px 12px", marginBottom:14, fontSize:11, fontFamily:"sans-serif", color:"#7a5500", lineHeight:1.6 }}>
              Use this when the price was already agreed — by phone, in person, text, or handshake — before coming to BoatClosers. The agreed price populates all your documents directly.
            </div>
            <Grid2>
              <Field label="Agreed Purchase Price ($)">
                <input style={{...S.input, fontSize:16, fontWeight:700}} type="number" value={offerAmt} onChange={e=>setOfferAmt(e.target.value)} placeholder="72000" />
              </Field>
              <Field label="How was the price agreed?">
                <select style={S.select} value={outsideMethod} onChange={e=>setOutsideMethod(e.target.value)}>
                  <option value="verbal">Verbal — by phone or in person</option>
                  <option value="text">Text message</option>
                  <option value="email">Email</option>
                  <option value="handshake">Handshake deal</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Earnest Money Deposit">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                  {["0","5","7.5","10"].map(p => (
                    <button key={p} onClick={()=>setEscrowPct(p)} style={{ ...S.btnOutline, background:escrowPct===p?C.navy:"transparent", color:escrowPct===p?"#fff":C.navy, fontSize:11, padding:"7px 0", textAlign:"center" }}>
                      {p==="0"?"No Deposit":`${p}% · ${fmt(Math.round(Number(offerAmt||0)*Number(p)/100))}`}
                    </button>
                  ))}
                </div>
              </Field>
            </Grid2>
            <Field label="Escrow Method">
              <EscrowSelector value={escrowPath} onChange={setEscrowPath} depositAmt={Math.round(Number(offerAmt||0)*Number(escrowPct)/100)} />
            </Field>
            <Field label="Notes about the agreement (optional — appears in Purchase Agreement)">
              <textarea style={{...S.textarea, minHeight:52}} value={verbalNote} onChange={e=>setVerbalNote(e.target.value)} placeholder="e.g. Agreed $72,000 by phone June 3rd. Seller includes trailer. Cash deal. Closing at seller's marina." />
            </Field>
            <button style={{...S.btnBrass, width:"100%"}} disabled={!offerAmt} onClick={()=>{
              const amt = Number(offerAmt);
              const deposit = Math.round(amt*Number(escrowPct)/100);
              const offer = { id:Date.now(), amount:amt, escrowPct:Number(escrowPct), escrowPath, deposit, ddDays, closingDate, verbal:true, outsideMethod, status:"pending", time:new Date().toLocaleTimeString() };
              setOffers(o=>[...o,offer]);
              setMessages(m=>[...m,{from:"seller", text:`Agreed price entered: ${fmt(amt)} (${outsideMethod}).`, time:new Date().toLocaleTimeString()}]);
              setNegMode("negotiate");
            }}>Add Agreed Price to Deal →</button>
          </div>
        )}
      </div>

      {/* ── OFFER HISTORY ── */}
      {offers.length > 0 && (
        <div style={{...S.card, marginBottom:16}}>
          <h3 style={S.h3}>Offer History</h3>
          {offers.map(o => (
            <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.mist}` }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16, fontWeight:700, color:C.navy }}>{fmt(o.amount)}</span>
                  {o.verbal && <span style={{...S.pill, background:C.tealLight, color:C.teal}}>Verbal</span>}
                </div>
                <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:2 }}>
                  Deposit: {o.escrowPct}% ({fmt(o.deposit)}) · {o.escrowPath==="escrow_com"?"Escrow.com":o.escrowPath==="attorney"?"Attorney":"Direct"} · DD: {o.ddDays} days · Close: {o.closingDate||"TBD"}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {o.status==="accepted"
                  ? <span style={{...S.pill, background:C.greenLight, color:C.green}}>Accepted ✓</span>
                  : o.status==="rejected"
                  ? <span style={{...S.pill, background:C.redLight, color:C.red}}>Rejected</span>
                  : <>
                      <button style={{...S.btn, background:C.green, fontSize:11, padding:"5px 12px"}} onClick={()=>acceptOffer(o.id)}>Accept</button>
                      <button style={{...S.btnOutline, fontSize:11, padding:"5px 12px", color:C.red, borderColor:C.red}} onClick={()=>rejectOffer(o.id)}>Reject</button>
                    </>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DEAL TERMS ── */}
      <div style={{ ...S.card, borderTop:`3px solid ${C.brass}`, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ width:32, height:32, borderRadius:6, background:C.brass, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📋</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, fontFamily:"sans-serif", color:C.navy }}>Deal Terms</div>
            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate }}>All terms are part of the negotiation — set them together</div>
          </div>
        </div>

        <hr style={S.divider}/>

        {/* ── DUE DILIGENCE ── */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:4 }}>Due Diligence Period</div>
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12 }}>Buyer's window to survey, check title, get insurance, and sea trial. They may renegotiate or walk away during this period.</div>

          {/* Preset buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:10 }}>
            {["7","10","14","Custom"].map(d => (
              <button key={d} onClick={()=>{ if(d==="Custom") setDdCustom(true); else { setDdDays(d); setDdCustom(false); } }} style={{ ...S.btnOutline, background:(ddDays===d&&!ddCustom)||(d==="Custom"&&ddCustom)?C.navy:"transparent", color:(ddDays===d&&!ddCustom)||(d==="Custom"&&ddCustom)?"#fff":C.navy, padding:"10px 0", textAlign:"center", fontSize:13, fontWeight:700 }}>
                {d==="Custom" ? "Custom" : `${d} Days`}
              </button>
            ))}
          </div>

          {/* Custom DD input */}
          {ddCustom && (
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <input style={{...S.input, maxWidth:100}} type="number" min="1" max="90" value={ddDays} onChange={e=>setDdDays(e.target.value)} placeholder="e.g. 21" />
              <span style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>days</span>
            </div>
          )}

          <Grid2>
            <Field label="Due Diligence Start Date">
              <input style={S.input} type="date" value={ddStart} onChange={e=>setDdStart(e.target.value)} />
            </Field>
            <Field label="Due Diligence End (auto-calculated)">
              <input style={{...S.input, background:C.sandDark, color:C.teal, fontWeight:600}} readOnly value={ddStart && ddDays ? addDays(ddStart,Number(ddDays)) : "—"} />
            </Field>
          </Grid2>

          {/* Extension */}
          <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:5, padding:"10px 14px", marginTop:4 }}>
            <label style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer" }}>
              <input type="checkbox" checked={ddExtension} onChange={e=>setDdExtension(e.target.checked)} style={{ width:15, height:15, marginTop:2, accentColor:C.teal, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.teal }}>Allow due diligence extension if both parties agree</div>
                <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:2 }}>Either party may request an extension. It only takes effect with written agreement from both buyer and seller.</div>
              </div>
            </label>
            {ddExtension && (
              <div style={{ marginTop:10, marginLeft:25 }}>
                <Grid2>
                  <Field label="Max extension days">
                    <input style={S.input} type="number" min="1" max="30" value={ddExtDays} onChange={e=>setDdExtDays(e.target.value)} placeholder="7" />
                  </Field>
                  <Field label="If extension requested, deposit:">
                    <select style={S.select} value={ddExtDepositRule} onChange={e=>setDdExtDepositRule(e.target.value)}>
                      <option value="returnable">Deposit remains fully returnable</option>
                      <option value="nonrefundable">Deposit becomes non-refundable</option>
                      <option value="partial">Deposit partially non-refundable (50%)</option>
                    </select>
                  </Field>
                </Grid2>
              </div>
            )}
          </div>
        </div>

        <hr style={S.divider}/>

        {/* ── DEPOSIT RETURN / KEEP TERMS ── */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:4 }}>Earnest Money — Return or Forfeiture Terms</div>
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10 }}>Define what happens to the deposit if the deal falls through. This language goes directly into the Purchase Agreement.</div>
          <select style={S.select} value={depositRule} onChange={e=>setDepositRule(e.target.value)}>
            <option value="fully_returnable">Fully returnable if buyer rejects during due diligence for any reason</option>
            <option value="returnable_cause">Returnable only if buyer rejects for cause (survey failure, title defect, financing denial)</option>
            <option value="nonrefundable_after_dd">Non-refundable after due diligence period ends if buyer backs out without cause</option>
            <option value="split">Split — 50% returned to buyer, 50% kept by seller if buyer backs out</option>
            <option value="seller_default">If seller defaults, deposit returned plus equal penalty to buyer</option>
            <option value="custom">Custom — describe below</option>
          </select>
          {depositRule==="custom" && (
            <textarea style={{...S.textarea, minHeight:60, marginTop:8}} value={depositRuleCustom} onChange={e=>setDepositRuleCustom(e.target.value)} placeholder="Describe your agreed deposit return / forfeiture terms in plain language…" />
          )}
        </div>

        <hr style={S.divider}/>

        {/* ── CLOSING DATE + PAYMENT ── */}
        <div>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:4 }}>Projected Closing Date & Payment</div>
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12 }}>Closing date and payment method are part of the negotiation. A cash buyer closing quickly is a stronger offer.</div>

          <Grid2>
            <Field label="Target Closing Date">
              <input style={S.input} type="date" value={closingDate} min={ddStart && ddDays ? addDays(ddStart,Number(ddDays)) : today()} onChange={e=>setClosingDate(e.target.value)} />
            </Field>
            <Field label="Days Until Closing">
              <input style={{...S.input, background:C.sandDark, color:C.slate}} readOnly value={closingDate ? `${Math.max(0,Math.ceil((new Date(closingDate)-new Date())/86400000))} days from today` : "—"} />
            </Field>
          </Grid2>

          {/* Payment type */}
          <div style={{ marginBottom:12 }}>
            <label style={S.label}>Closing Payment Method</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                ["cash","💵 All Cash","No lender. Fastest closing. Strongest offer."],
                ["finance","🏦 Financed","Buyer obtaining marine financing. Subject to loan approval."],
                ["cash_quick","⚡ Cash — Quick Close","All cash with closing within 7 days of accepted offer."],
                ["other","📋 Other / TBD","Terms to be specified."],
              ].map(([v,l,d])=>(
                <button key={v} onClick={()=>setPaymentType(v)} style={{ textAlign:"left", padding:"10px 12px", borderRadius:5, cursor:"pointer", border:`2px solid ${paymentType===v?C.navy:C.mist}`, background:paymentType===v?C.navy:"transparent", color:paymentType===v?"#fff":C.navy }}>
                  <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif" }}>{l}</div>
                  <div style={{ fontSize:10, fontFamily:"sans-serif", color:paymentType===v?"rgba(255,255,255,0.65)":C.slate, marginTop:2 }}>{d}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Projected closing payment breakdown */}
          {offerAmt && (
            <div style={{ background:C.sandDark, borderRadius:6, padding:"12px 14px", border:`1px solid ${C.mist}` }}>
              <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>Projected Closing Payment</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, fontFamily:"sans-serif", fontSize:12 }}>
                {[
                  ["Purchase Price", fmt(Number(offerAmt))],
                  ["Earnest Money (credit)", `− ${fmt(Math.round(Number(offerAmt)*Number(escrowPct)/100))}`],
                  ["Balance Due at Closing", fmt(Math.max(0, Number(offerAmt) - Math.round(Number(offerAmt)*Number(escrowPct)/100)))],
                  ["Payment Type", paymentType==="cash"?"All Cash":paymentType==="cash_quick"?"Cash / Quick Close":paymentType==="finance"?"Financed":"TBD"],
                ].map(([l,v])=>(
                  <div key={l} style={{ display:"contents" }}>
                    <div style={{ color:C.slate, padding:"4px 0", borderBottom:`1px solid ${C.mist}` }}>{l}</div>
                    <div style={{ fontWeight:700, color:C.navy, padding:"4px 0", borderBottom:`1px solid ${C.mist}`, textAlign:"right" }}>{v}</div>
                  </div>
                ))}
              </div>
              {paymentType==="finance" && (
                <div style={{ marginTop:10 }}>
                  <label style={S.label}>Financing contingency deadline (days from acceptance)</label>
                  <input style={{...S.input, maxWidth:160}} type="number" value={financeContingency} onChange={e=>setFinanceContingency(e.target.value)} placeholder="14" />
                  <div style={{ fontSize:10, fontFamily:"sans-serif", color:C.slate, marginTop:4 }}>If buyer cannot obtain financing within this window, they may withdraw and receive their deposit back.</div>
                </div>
              )}
              {paymentType==="cash_quick" && (
                <div style={{ marginTop:8, fontSize:11, fontFamily:"sans-serif", color:C.teal }}>⚡ Quick close selected — buyer commits to closing within 7 days of offer acceptance. This will be noted in the Purchase Agreement.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── AGREED PRICE SUMMARY if offer accepted ── */}
      {acceptedOffer && (
        <div style={{...S.cardGold, marginBottom:16}}>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:10 }}>✓ Agreed Price Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[["Purchase Price",fmt(acceptedOffer.amount)],["Earnest Money",fmt(acceptedOffer.deposit)],["Escrow",acceptedOffer.escrowPath==="escrow_com"?"Escrow.com":acceptedOffer.escrowPath==="attorney"?"Attorney":"Direct to Seller"]].map(([l,v])=>(
              <div key={l} style={{ background:C.sandDark, borderRadius:5, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:C.slate, fontFamily:"sans-serif" }}>{l}</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={S.btnBrass} disabled={!canProceed} onClick={proceed}>
          Continue to Due Diligence →
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
  ];
  const selected = options.find(o=>o.id===value)||options[0];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
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
  const escrowLabel = negotiate.escrowPath==="escrow_com"?"Escrow.com":negotiate.escrowPath==="attorney"?"Third Party Attorney":"Direct to Seller";

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

function StepDueDiligence({ data, setData, vessel, parties, terms, negotiate, onNext, onBack }) {
  const set = (k,v) => setData(d => ({...d,[k]:v}));
  const [outcome, setOutcome] = useState(data.outcome||null);
  const [rejectionReason, setRejectionReason] = useState(data.rejectionReason||"");
  const [rejectionNotes, setRejectionNotes] = useState(data.rejectionNotes||"");
  const [buyerDisc, setBuyerDisc] = useState(false);
  const [buyerSigned, setBuyerSigned] = useState(false);
  const [vaSigName, setVaSigName] = useState("");
  const [vaSigned, setVaSigned] = useState(false);
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

  // Insurance state
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insurancePolicyNum, setInsurancePolicyNum] = useState("");
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [insuranceSendEmail, setInsuranceSendEmail] = useState("");
  const [insuranceSentLog, setInsuranceSentLog] = useState([]);

  const canProceed = outcome==="accept"
    ? (buyerDisc && buyerSigned && vaSigned)
    : outcome==="reject"
      ? (buyerDisc && buyerSigned && rejectionReason)
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

      {/* ── VESSEL DECISION ── */}
      <div style={{...S.card, marginTop:16}}>
        <h3 style={S.h3}>Buyer's Vessel Decision</h3>
        <p style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, marginBottom:14 }}>
          Only the buyer accepts or rejects the vessel. If accepted, the Vessel Acceptance document must be signed before proceeding. If rejected, the buyer's earnest money is returned and the reason is recorded in the Rejection Notice.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <button onClick={()=>{ setOutcome("accept"); setBuyerSigned(false); setVaSigned(false); }} style={{ padding:"14px", textAlign:"center", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="accept"?C.green:"transparent", color:outcome==="accept"?"#fff":C.green, border:`2px solid ${C.green}` }}>
            ✓ Accept Vessel
          </button>
          <button onClick={()=>{ setOutcome("reject"); setBuyerSigned(false); setVaSigned(false); }} style={{ padding:"14px", textAlign:"center", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", borderRadius:5, background:outcome==="reject"?C.red:"transparent", color:outcome==="reject"?"#fff":C.red, border:`2px solid ${C.red}` }}>
            ✗ Reject Vessel
          </button>
        </div>

        {outcome==="reject" && (
          <div style={{ background:C.redLight, border:`1px solid #e8c0c0`, borderRadius:6, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.red, marginBottom:10 }}>Reason for Rejection — Required for Rejection Notice Document</div>
            {REJECTION_REASONS.map(r => (
              <label key={r.id} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10, cursor:"pointer" }}>
                <input type="radio" name="rejReason" value={r.id} checked={rejectionReason===r.id} onChange={()=>setRejectionReason(r.id)} style={{ marginTop:2, accentColor:C.red, flexShrink:0 }} />
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
          </div>
        )}

        {outcome==="accept" && (
          <div style={{ border:`1px solid #a8d8b8`, borderRadius:6, overflow:"hidden", marginBottom:14 }}>
            <div style={{ background:C.green, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff", fontFamily:"sans-serif" }}>Vessel Acceptance Document — Required Before Proceeding</div>
              {vaSigned && <span style={{ fontSize:11, background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"2px 10px", fontFamily:"sans-serif" }}>✓ Signed</span>}
            </div>
            <div style={{ background:"#fff", padding:"16px 18px", fontSize:11, fontFamily:"sans-serif", color:C.text, lineHeight:1.8 }}>
              <div style={{ textAlign:"center", borderBottom:`1px solid ${C.mist}`, paddingBottom:10, marginBottom:12 }}>
                <div style={{ fontSize:8, letterSpacing:3, color:C.brass, fontWeight:700, textTransform:"uppercase" }}>BoatClosers.com</div>
                <div style={{ fontSize:13, fontWeight:700, letterSpacing:0.5 }}>VESSEL ACCEPTANCE</div>
                <div style={{ fontSize:10, color:C.slate }}>Date: {today()}</div>
              </div>
              <p>The undersigned Buyer hereby formally accepts the following vessel upon completion of the due diligence period:</p>
              <div style={{ background:C.sandDark, borderRadius:4, padding:"8px 12px", margin:"8px 0" }}>
                <div><strong>{vessel.year||"[Year]"} {vessel.make||"[Make]"} {vessel.model||"[Model]"}</strong> · HIN: {vessel.hin||"[HIN]"}</div>
                <div>Engine: {vessel.engineMake||"[Make]"} {vessel.engineModel||""} · Hours: {vessel.engineHours||"[Hours]"}</div>
                <div>Purchase Price: <strong>{fmt(negotiate.agreedPrice||0)}</strong></div>
              </div>
              <p>Buyer acknowledges that the vessel has been inspected, the due diligence period has concluded, and Buyer accepts the vessel in its present condition. By signing, Buyer agrees to proceed to closing under the terms of the Purchase and Sale Agreement.</p>
              <p style={{ fontWeight:700, color:C.slate }}>BoatClosers is not a party to this transaction. This document is for record-keeping purposes as facilitated by BoatClosers.com.</p>
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
                    <button style={{ ...S.btnBrass, whiteSpace:"nowrap", opacity:(!buyerDisc||!vaSigName.trim())?0.4:1 }} disabled={!buyerDisc||!vaSigName.trim()} onClick={()=>{ setVaSigned(true); setBuyerSigned(true); }}>Sign Acceptance</button>
                  </div>
                ) : (
                  <div style={{ fontSize:12, color:C.green, fontFamily:"sans-serif" }}>✓ Signed by {vaSigName} on {today()}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {outcome==="reject" && rejectionReason && (
          <div style={{ background:C.sandDark, borderRadius:5, padding:"12px 14px", marginTop:8 }}>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:8 }}>Buyer: {parties.buyer.name||"Buyer"} — Formal Rejection</div>
            <div style={{ background:"#fff8e6", border:`1px solid ${C.brass}`, borderRadius:4, padding:"9px 12px", fontSize:10, color:"#7a5500", marginBottom:10 }}>
              BoatClosers is not a party to this transaction. By signing, you accept full responsibility for the rejection and confirm the earnest money return process.
            </div>
            <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, cursor:"pointer", alignItems:"flex-start" }}>
              <input type="checkbox" checked={buyerDisc} onChange={e=>setBuyerDisc(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
              I agree to the disclaimer above
            </label>
            <label style={{ display:"flex", gap:8, fontSize:11, fontFamily:"sans-serif", color:C.slate, cursor:"pointer", alignItems:"flex-start" }}>
              <input type="checkbox" checked={buyerSigned} onChange={e=>setBuyerSigned(e.target.checked)} style={{ marginTop:1, accentColor:C.navy, flexShrink:0 }} />
              I formally reject this vessel for the reason stated above
            </label>
          </div>
        )}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
        <button style={S.btnOutline} onClick={onBack}>← Back</button>
        <button style={S.btnBrass} disabled={!canProceed} onClick={()=>{ setData(d=>({...d,outcome,rejectionReason,rejectionNotes,vaSigName,vaSigned,surveyFile:surveyFile?.name,surveyCompany,surveyorName})); onNext(); }}>
          {outcome==="reject" ? "Proceed to Close (Rejected)" : "Continue to Documents →"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — PAYWALL + DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
function StepDocuments({ data, setData, vessel, parties, terms, negotiate, onNext, onBack }) {
  const [paid, setPaid] = useState(data.paid||false);
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
    escrow: negotiate.escrowPath==="escrow_com"?"Escrow.com":negotiate.escrowPath==="attorney"?"Third Party Attorney":"Direct to Seller",
    closing: terms.closingDate||"[Closing Date]",
    ddDays: terms.dueDiligenceDays||"[DD Days]",
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
            {["21 Professional Legal Documents","Electronic Signatures","Closing Checklist","PDF Download Package","AI Deal Assistant Access","No recurring fees","One deal covered","Buyer & seller copies"].map(f=>(
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
      <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
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
function StepClosing({ vessel, parties, terms, negotiate, ddData, docsData, onBack }) {
  const [cleared, setCleared] = useState(false);
  const [manualChecks, setManualChecks] = useState({});
  const [payMethod, setPayMethod] = useState(negotiate.paymentType || "wire");
  const [payMethodOpen, setPayMethodOpen] = useState(true);
  const isRejected = ddData.outcome==="reject";
  const rejReason = REJECTION_REASONS.find(r=>r.id===ddData.rejectionReason);
  const toggleManual = (k) => setManualChecks(c => ({...c,[k]:!c[k]}));

  const balanceDue = Math.max(0, Number(negotiate.agreedPrice||0) - Number(negotiate.deposit||0));
  const escrowLabel = negotiate.escrowPath==="escrow_com"?"Escrow.com":negotiate.escrowPath==="attorney"?"Third Party Attorney":"Direct to Seller";

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
      docs:[
        { id:"purchase_agreement",  label:"Purchase & Sale Agreement",   desc:"The main binding contract. Must be signed by both parties before any money changes hands.", signed:!!docsData.signedDocs?.purchase_agreement },
        { id:"bill_of_sale",        label:"Bill of Sale",                desc:"Transfers legal ownership from seller to buyer. Required for registration in all states.", signed:!!docsData.signedDocs?.bill_of_sale },
        { id:"closing_statement",   label:"Closing Statement",           desc:"Financial summary showing purchase price, deposit credit, and balance due at closing.", signed:!!docsData.signedDocs?.closing_statement },
        { id:"title_transfer",      label:"Title Transfer Affidavit",    desc:"Seller's sworn statement of ownership and authority to sell. Required for new registration.", signed:!!docsData.signedDocs?.title_transfer },
        { id:"deposit_receipt",     label:"Deposit Receipt",             desc:"Confirms earnest money received and how it applies to the purchase price.", signed:!!docsData.signedDocs?.deposit_receipt },
      ]
    },
    {
      heading:"Survey & Inspection Documents",
      desc:"Required by marine lenders and most insurance companies.",
      docs:[
        { id:"survey_auth",     label:"Survey Authorization",         desc:"Authorizes the marine surveyor to inspect the vessel on behalf of the buyer.", signed:!!docsData.signedDocs?.survey_auth },
        { id:"dd_report",       label:"Due Diligence Report",         desc:"Summary of all inspections completed during the due diligence period.", signed:!!docsData.signedDocs?.dd_report },
        { id:"acceptance",      label:"Vessel Acceptance",            desc:"Buyer's formal acceptance of the vessel after due diligence.", signed:!!docsData.signedDocs?.acceptance },
        { id:"damage_disclosure",label:"Damage Disclosure Statement", desc:"Seller's disclosure of any known defects, damage, or repair history.", signed:!!docsData.signedDocs?.damage_disclosure },
        { id:"sea_trial",       label:"Sea Trial Agreement",          desc:"Documents the underway test and confirms vessel performed as represented.", signed:!!docsData.signedDocs?.sea_trial },
      ]
    },
    {
      heading:"Financing & Insurance Documents",
      desc:"Required if buyer is financing or if a lender is involved.",
      docs:[
        { id:"insurance_binder",  label:"Insurance Binder Confirmation", desc:"Proof the buyer has obtained marine insurance effective at closing. Required by most lenders.", signed:!!docsData.signedDocs?.insurance_binder },
        { id:"commitment_letter", label:"Commitment Letter (if financed)", desc:"Lender's formal commitment to fund the purchase. Required before seller releases the vessel.", signed:false, manual:true, manualKey:"commitment_letter" },
        { id:"loan_payoff",       label:"Loan Payoff Letter (if seller has loan)", desc:"Seller's lender confirmation of payoff amount. Required to deliver clear title.", signed:!!docsData.signedDocs?.loan_payoff },
        { id:"lien_release",      label:"Lien Release",                desc:"Confirms all liens on the vessel have been satisfied. Required for clean title transfer.", signed:!!docsData.signedDocs?.lien_release },
      ]
    },
    {
      heading:"Title & Registration Transfer",
      desc:"Final steps to legally transfer ownership with the state or USCG.",
      docs:[
        { id:"uscg_deletion",    label:"USCG Documentation / Deletion", desc:"For USCG-documented vessels: surrender existing documentation and apply for new.", signed:!!docsData.signedDocs?.uscg_deletion },
        { id:"delivery_receipt", label:"Delivery Receipt",             desc:"Confirms physical delivery of vessel, keys, manuals, and all included equipment.", signed:!!docsData.signedDocs?.delivery_receipt },
        { id:"wire_instructions",label:"Wire Transfer Instructions",   desc:"Bank wiring details for the final closing payment. Verify by phone — never by email alone.", signed:!!docsData.signedDocs?.wire_instructions },
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

      {isRejected && rejReason && (
        <div style={{ background:C.redLight, border:`1px solid #e8c0c0`, borderRadius:6, padding:"12px 14px", marginBottom:20, fontSize:12, fontFamily:"sans-serif" }}>
          <strong style={{ color:C.red }}>Rejection Reason:</strong> {rejReason.label}<br/>
          <span style={{ color:C.slate }}>{rejReason.desc}</span>
          {ddData.rejectionNotes && <div style={{ marginTop:6, color:C.slate }}><strong>Buyer Notes:</strong> {ddData.rejectionNotes}</div>}
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
              <div style={{ background:C.sandDark, padding:"10px 16px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
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
// AI ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────
function AIAssistant({ open, setOpen, step, vessel, parties }) {
  const stepCtx = ["Vessel Details","Parties","Negotiate & Terms","Due Diligence","Documents","Closing"][step]||"";

  const missingHints = [];
  if (!vessel.hin) missingHints.push("HIN");
  if (!vessel.engineSerial) missingHints.push("engine serial number");
  if (!vessel.regNumber) missingHints.push("registration number");
  if (!parties.buyer.name) missingHints.push("buyer name");
  if (!parties.buyer.email) missingHints.push("buyer email");
  if (!parties.seller.name) missingHints.push("seller name");
  if (!parties.seller.email) missingHints.push("seller email");

  const otherPartyEmail = parties.buyer.email || parties.seller.email;
  const otherPartyMissing = !parties.buyer.email || !parties.seller.email;

  // Step-specific suggested questions
  const suggestions = {
    0: ["Where do I find the HIN?","What engine info do I need?","Does USCG documentation replace registration?"],
    1: ["How does the other party join?","Can I invite by email?","Who controls the deal?"],
    2: ["How does the other party see my offer?","What is earnest money?","Which escrow option is safest?","How does negotiation work here?"],
    3: ["What happens during due diligence?","Can I renegotiate after survey?","What if the buyer backs out?"],
    4: ["What is the Purchase Agreement?","How do I send a doc to the other party?","Which documents are required?"],
    5: ["What order should I complete closing?","How do I transfer the title?","When does the seller release the keys?"],
  }[step] || [];

  const openingMsg = `Hi! I'm your BoatClosers Deal Assistant — I'm here to guide you through every step.\n\nYou're on the **${stepCtx}** step.${
    missingHints.length ? `\n\n⚠️ Your documents will have blank fields without: **${missingHints.join(", ")}**. You can add these anytime before paying — go back to the relevant step.` : ""
  }${
    otherPartyMissing ? `\n\n📧 **The other party hasn't been added yet.** Go to the Parties step to enter their email so they receive notifications, can respond to offers, and can sign documents.` : ""
  }\n\nAsk me anything about the process, documents, or your deal.`;

  const [msgs, setMsgs] = useState([{ role:"assistant", text: openingMsg }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const end = useRef(null);
  useEffect(()=>{ end.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const ask = async (question) => {
    const q = question || input;
    if (!q?.trim() || loading) return;
    setInput("");
    setMsgs(m=>[...m,{role:"user",text:q}]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are the BoatClosers Deal Assistant — a friendly, practical guide for private boat buyers and sellers using BoatClosers.com.

Current deal context:
- Step: "${stepCtx}"
- Vessel: ${vessel.year||"?"} ${vessel.make||"?"} ${vessel.model||"?"}
- Missing document fields: ${missingHints.join(", ")||"none"}
- Buyer email on file: ${parties.buyer.email||"NOT YET ADDED"}
- Seller email on file: ${parties.seller.email||"NOT YET ADDED"}

HOW THE TWO-PARTY SYSTEM WORKS (explain this when asked):
- The deal initiator creates the deal and controls vessel details and terms
- They invite the other party by entering their email in the Parties step
- The other party receives an email invitation with a link to create their free BoatClosers account
- Once they sign up (free), they can log in, see the deal, respond to messages, counter-offer, and sign documents
- Both parties see the shared message thread and offer history
- Only the initiator can edit vessel details and deal terms
- The other party can update their own contact info and sign documents
- Neither party can see each other's account password or private info

KEY REMINDERS:
- Always prompt user to complete missing fields: ${missingHints.join(", ")||"none — great!"}
- If other party email is missing, remind user to go to the Parties step and add it
- BoatClosers is NOT a broker, escrow agent, or attorney
- You are NOT a lawyer — recommend maritime attorney for legal advice
- Be warm, practical, and concise — like a knowledgeable friend who knows boats

Help with: HIN location, engine serial numbers, USCG vs state registration, earnest money, escrow options, due diligence, survey, sea trial, title search, lien release, bill of sale, closing statement, purchase agreement, vessel acceptance, rejection, financing contingency, deposit rules.`,
          messages: msgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0).concat([{role:"user",content:q}]).map(m=>({role:m.role,content:m.text}))
        })
      });
      const d = await res.json();
      const reply = d.content?.find(b=>b.type==="text")?.text||"Couldn't get a response — please try again.";
      setMsgs(m=>[...m,{role:"assistant",text:reply}]);
    } catch {
      setMsgs(m=>[...m,{role:"assistant",text:"Connection error. Please try again."}]);
    }
    setLoading(false);
  };

  // Closed state — prominent pulsing button
  if (!open) return (
    <div style={{ position:"fixed", bottom:24, left:24, zIndex:1000 }}>
      <style>{`@keyframes bc-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(184,134,58,0.5)} 50%{box-shadow:0 0 0 10px rgba(184,134,58,0)} }`}</style>
      <button onClick={()=>setOpen(true)} style={{ background:C.navy, color:"#fff", border:`2px solid ${C.brass}`, borderRadius:12, padding:"10px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, boxShadow:"0 4px 20px rgba(0,0,0,0.3)", animation:"bc-pulse 2.5s infinite" }}>
        <span style={{ fontSize:20 }}>⚓</span>
        <div style={{ textAlign:"left" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.brass, fontFamily:"sans-serif", letterSpacing:0.3 }}>Deal Assistant</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", fontFamily:"sans-serif" }}>Ask me anything</div>
        </div>
      </button>
      {missingHints.length > 0 && (
        <div style={{ position:"absolute", top:-8, right:-8, background:C.red, color:"#fff", borderRadius:"50%", width:20, height:20, fontSize:11, fontFamily:"sans-serif", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {missingHints.length}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position:"fixed", bottom:24, left:24, width:360, height:520, background:"#fff", border:`1px solid ${C.mist}`, borderRadius:12, display:"flex", flexDirection:"column", boxShadow:"0 8px 40px rgba(0,0,0,0.2)", zIndex:1000, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:C.navy, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`2px solid ${C.brass}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:C.brass, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚓</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.brass, fontFamily:"sans-serif" }}>Deal Assistant</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif" }}>Step: {stepCtx} {missingHints.length>0?`· ${missingHints.length} field${missingHints.length>1?"s":""} missing`:""}</div>
          </div>
        </div>
        <button onClick={()=>setOpen(false)} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:16, borderRadius:6, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 13px", display:"flex", flexDirection:"column", gap:8 }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"90%", background:m.role==="user"?C.navy:C.sandDark, color:m.role==="user"?"#fff":C.text, borderRadius:m.role==="user"?"11px 11px 2px 11px":"11px 11px 11px 2px", padding:"9px 12px", fontSize:12, fontFamily:"sans-serif", lineHeight:1.6, whiteSpace:"pre-wrap" }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:"flex-start", background:C.sandDark, borderRadius:"11px 11px 11px 2px", padding:"9px 12px", fontSize:12, fontFamily:"sans-serif", color:C.slate, fontStyle:"italic" }}>
            Thinking…
          </div>
        )}
        <div ref={end}/>
      </div>

      {/* Suggested questions */}
      {suggestions.length > 0 && msgs.length <= 2 && (
        <div style={{ padding:"6px 10px", borderTop:`1px solid ${C.mist}`, display:"flex", gap:5, flexWrap:"wrap" }}>
          {suggestions.map(q=>(
            <button key={q} onClick={()=>ask(q)} style={{ fontSize:10, fontFamily:"sans-serif", padding:"4px 9px", borderRadius:12, border:`1px solid ${C.brass}`, background:"transparent", color:C.brass, cursor:"pointer", whiteSpace:"nowrap" }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"8px 10px", borderTop:`1px solid ${C.mist}`, display:"flex", gap:7 }}>
        <input style={{...S.input, flex:1, fontSize:12}} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask about documents, process, your deal…"/>
        <button style={{...S.btn, padding:"8px 13px", flexShrink:0}} onClick={()=>ask()} disabled={loading}>↑</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("signup");
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      onAuth({ name: name || email, email, role: role || "buyer", mode });
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
          <div style={{ display:"flex", borderRadius:6, overflow:"hidden", border:`1px solid ${C.mist}`, marginBottom:24 }}>
            {[["signup","Create Account"],["login","Sign In"]].map(([m,l])=>(
              <button key={m} onClick={()=>{ setMode(m); setError(""); }} style={{ flex:1, padding:"9px", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer", background:mode===m?C.navy:"transparent", color:mode===m?"#fff":C.slate, border:"none" }}>{l}</button>
            ))}
          </div>
          {mode==="signup" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:600, color:C.navy, marginBottom:10 }}>I am the...</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
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
  const features = [
    { icon:"📜", title:"21 Professional Documents", desc:"Every document you need — Purchase Agreement, Bill of Sale, Title Transfer, Escrow Instructions, Survey Auth, and 16 more." },
    { icon:"💰", title:"Free Price Negotiation", desc:"Make offers, counter-offers, and exchange messages. All offer history is recorded and tied to your documents." },
    { icon:"🔒", title:"Three Escrow Paths", desc:"Use Escrow.com for maximum protection, wire direct to seller, or engage a third-party attorney — your choice." },
    { icon:"🔍", title:"Built-In Due Diligence", desc:"Survey, title search, sea trial, and insurance checklist with a renegotiation window built into the timeline." },
    { icon:"✍️", title:"Electronic Signatures", desc:"Every document signed digitally. Both parties get a complete signed closing package." },
    { icon:"🤝", title:"Flat $249 Per Deal", desc:"No broker commission. No recurring fees. One price covers everything from first offer to final title transfer." },
  ];

  const steps = [
    ["Enter Vessel Details","Year, make, HIN, engines, registration — everything needed for your documents."],
    ["Add Both Parties","Buyer and seller contact information. Invite the other party by email."],
    ["Negotiate Price & Terms","Make offers, set due diligence period, and agree on closing date together."],
    ["Complete Due Diligence","Survey, title search, insurance, sea trial — with option to renegotiate."],
    ["Pay & Sign Documents","$249 unlocks all 21 documents. Both parties sign electronically."],
    ["Close & Transfer Title","Final checklist guides you through clean title transfer and payment."],
  ];

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
      <div style={{ background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy2} 55%, #0e3a52 100%)`, color:"#fff", padding:"6rem 2rem 5rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {/* decorative rope line */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`repeating-linear-gradient(90deg, ${C.brass} 0px, ${C.brass} 12px, transparent 12px, transparent 20px)`, opacity:0.4 }} />
        <div style={{ maxWidth:660, margin:"0 auto" }}>
          <div style={{ display:"inline-block", background:"rgba(184,134,58,0.15)", border:`1px solid rgba(184,134,58,0.4)`, borderRadius:20, padding:"5px 16px", fontSize:11, letterSpacing:2, color:C.brass2, fontFamily:"sans-serif", textTransform:"uppercase", marginBottom:24 }}>
            Close Your Deal Without a Broker
          </div>
          <h1 style={{ fontSize:46, fontWeight:800, lineHeight:1.12, marginBottom:20, fontFamily:"'Georgia',serif" }}>
            Private Boat Sales,<br/>
            <span style={{ color:C.brass2 }}>Done Professionally</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", lineHeight:1.75, marginBottom:36, fontFamily:"sans-serif", fontWeight:300 }}>
            Negotiate the price, complete due diligence, sign 21 legal documents, and transfer title — all without a broker. Flat $249 per transaction.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button style={{...S.btnBrass, fontSize:15, padding:"13px 32px"}} onClick={onStart}>Start as Buyer</button>
            <button style={{ ...S.btnOutline, color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.3)", fontSize:15, padding:"13px 32px", borderRadius:5 }} onClick={onStart}>Start as Seller</button>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:16, fontFamily:"sans-serif" }}>Free to start · Pay $249 only when you're ready to sign documents</div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"4.5rem 2rem" }}>
        <h2 style={{ textAlign:"center", fontSize:30, marginBottom:8 }}>Everything You Need to Close</h2>
        <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:40 }}>Professional-grade tools once reserved for yacht brokers — now available to any private buyer or seller.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24 }}>
          {features.map(f=>(
            <div key={f.title} style={{ background:C.white, borderRadius:8, padding:"1.5rem", border:`0.5px solid ${C.mist}` }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{f.icon}</div>
              <div style={{ fontSize:15, fontWeight:700, color:C.navy, marginBottom:6 }}>{f.title}</div>
              <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background:C.sandDark, padding:"4.5rem 2rem" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:30, marginBottom:8 }}>How It Works</h2>
          <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:40 }}>Six clear steps from first offer to title transfer.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {steps.map(([title,desc],i)=>(
              <div key={i} style={{ display:"flex", gap:14, background:C.white, borderRadius:7, padding:"1.25rem", border:`0.5px solid ${C.mist}` }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:C.navy, color:C.brass2, fontWeight:800, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"sans-serif" }}>{i+1}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents preview */}
      <div style={{ maxWidth:820, margin:"0 auto", padding:"4.5rem 2rem" }}>
        <h2 style={{ textAlign:"center", fontSize:30, marginBottom:8 }}>21 Professional Documents</h2>
        <p style={{ textAlign:"center", fontSize:14, fontFamily:"sans-serif", color:C.slate, marginBottom:36 }}>Every document auto-fills with your deal data. All signed electronically by both parties.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
          {DOCS.map(d=>(
            <div key={d.id} style={{ background:C.white, border:`0.5px solid ${C.mist}`, borderRadius:5, padding:"7px 12px", fontSize:11, fontFamily:"sans-serif", color:C.navy }}>
              {d.required && <span style={{ color:C.brass, marginRight:5, fontWeight:700 }}>★</span>}{d.name}
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:16, fontSize:11, fontFamily:"sans-serif", color:C.slate }}>★ Required documents</div>
      </div>

      {/* Pricing */}
      <div style={{ background:C.navy, padding:"5rem 2rem" }}>
        <div style={{ maxWidth:440, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:30, color:"#fff", marginBottom:8 }}>Simple, Honest Pricing</h2>
          <p style={{ fontSize:14, fontFamily:"sans-serif", color:"rgba(255,255,255,0.55)", marginBottom:36 }}>No commissions. No subscription. No surprises.</p>
          <div style={{ background:"rgba(255,255,255,0.05)", border:`2px solid ${C.brass}`, borderRadius:12, padding:"2.5rem" }}>
            <div style={{ fontSize:11, letterSpacing:3, color:C.brass, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:10 }}>Per Transaction</div>
            <div style={{ fontSize:56, fontWeight:800, color:"#fff", fontFamily:"sans-serif", lineHeight:1 }}>$249</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:24, fontFamily:"sans-serif" }}>Flat fee · One vessel · One deal</div>
            <div style={{ textAlign:"left", fontSize:13, fontFamily:"sans-serif", lineHeight:2.3, color:"rgba(255,255,255,0.75)" }}>
              {["21 professional legal documents","Electronic signatures — both parties","Full negotiation & offer history","Three escrow path options","Due diligence checklist","Final closing checklist","AI deal assistant","PDF download package","No recurring charges"].map(f=>(
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
      <div style={{ maxWidth:680, margin:"0 auto", padding:"4.5rem 2rem" }}>
        <h2 style={{ textAlign:"center", fontSize:28, marginBottom:36 }}>Common Questions</h2>
        {[
          ["Is BoatClosers a broker?","No. We are a document facilitation platform. We are not licensed brokers, escrow agents, or attorneys. We are not a party to any transaction. For legal advice, consult a maritime attorney."],
          ["Are these documents legally binding?","Our templates follow YBAA and Florida maritime standards. However, document enforceability depends on how accurately you complete them. We strongly recommend having a local maritime attorney review before signing."],
          ["What if the deal falls through?","If the buyer formally rejects during due diligence, the earnest money is returned. The reason for rejection is documented in the Rejection Notice. BoatClosers does not hold or release funds."],
          ["Who pays the $249 fee?","The person who initiates the deal pays the fee. They also control the vessel details and deal terms. The other party can join for free to view, update their info, and sign."],
          ["What escrow options do I have?","Escrow.com (licensed third party, recommended), direct wire to seller, or a private attorney. We do not act as escrow ourselves."],
        ].map(([q,a])=>(
          <div key={q} style={{ borderBottom:`1px solid ${C.mist}`, padding:"16px 0" }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy, marginBottom:8 }}>{q}</div>
            <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate, lineHeight:1.7 }}>{a}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background:C.teal, padding:"4rem 2rem", textAlign:"center" }}>
        <h2 style={{ fontSize:28, color:"#fff", marginBottom:10 }}>Ready to Close Your Boat Deal?</h2>
        <p style={{ fontSize:14, fontFamily:"sans-serif", color:"rgba(255,255,255,0.8)", marginBottom:28 }}>Create your free account. Enter your deal details. Pay only when you're ready to sign.</p>
        <button style={{...S.btnBrass, fontSize:15, padding:"13px 36px"}} onClick={onStart}>Get Started — It's Free</button>
      </div>

      {/* Footer */}
      <div style={{ background:C.navy, padding:"2rem 2.5rem" }}>
        <div style={{ maxWidth:820, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={S.logo}>BOATCLOSERS</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"sans-serif", marginTop:4 }}>© {new Date().getFullYear()} BoatClosers.com · All rights reserved</div>
          </div>
          <div style={{ fontSize:10, fontFamily:"sans-serif", color:"rgba(255,255,255,0.3)", lineHeight:1.8, maxWidth:420, textAlign:"right" }}>
            BoatClosers is a document facilitation platform only. Not a broker, escrow agent, or attorney. Not a party to any transaction. All parties solely responsible for their own deal outcomes. Consult a licensed maritime attorney for legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
const emptyVessel = {name:"",year:"",make:"",model:"",hin:"",hullType:"",loa:"",beam:"",engineCount:"1",engineMake:"",engineModel:"",engineHours:"",engineSerial:"",fuelType:"Gasoline",regNumber:"",regState:"",uscgNumber:"",trailerIncluded:"no",trailerVin:"",trailerState:"",askingPrice:"",location:"",description:""};
const emptyParties = {buyer:{name:"",email:"",phone:"",address:"",city:"",stateZip:""},seller:{name:"",email:"",phone:"",address:"",city:"",stateZip:""}};
const emptyNeg = {offers:[],messages:[],agreedPrice:"",escrowPct:0,escrowPath:"escrow_com",deposit:0,dueDiligenceDays:"10",ddStartDate:"",closingDate:""};
const emptyDD = {survey:false,title:false,insurance:false,seatrial:false,engines:false,electronics:false,ddNotes:"",outcome:null,rejectionReason:"",rejectionNotes:""};
const emptyDocs = {paid:false,signedDocs:{}};

export default function BoatClosers() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [vessel, setVessel] = useState(emptyVessel);
  const [parties, setParties] = useState(emptyParties);
  const [negotiate, setNegotiate] = useState(emptyNeg);
  const [ddData, setDdData] = useState(emptyDD);
  const [docsData, setDocsData] = useState(emptyDocs);
  const [aiOpen, setAiOpen] = useState(false);

  const goToStep = (n) => { setStep(n); if (n > maxStep) setMaxStep(n); };

  const handleAuth = (authData) => {
    setUser(authData);
    setParties(p => ({ ...p, [authData.role]: { ...p[authData.role], name: authData.name, email: authData.email } }));
    setScreen("deal");
  };

  const handleSignOut = () => {
    setUser(null); setStep(0); setMaxStep(0);
    setVessel(emptyVessel); setParties(emptyParties);
    setNegotiate(emptyNeg); setDdData(emptyDD); setDocsData(emptyDocs);
    setScreen("landing");
  };

  if (screen==="landing") return <Landing onStart={()=>setScreen("auth")}/>;
  if (screen==="auth") return <AuthScreen onAuth={handleAuth}/>;

  return (
    <div style={S.app}>
      <nav style={S.nav}>
        <div style={{ cursor:"pointer" }} onClick={()=>setScreen("landing")}>
          <div style={S.logo}>BOATCLOSERS</div>
          <div style={S.logoSub}>Private Vessel Transactions</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {user && <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif", textTransform:"uppercase", letterSpacing:1 }}>{user.role}</span>}
          {vessel.year && <span style={{ fontSize:11, color:C.brass, fontFamily:"sans-serif" }}>{vessel.year} {vessel.make} {vessel.model}</span>}
          <button style={{ fontSize:11, color:"rgba(255,255,255,0.55)", background:"rgba(255,255,255,0.07)", border:"none", borderRadius:16, padding:"5px 12px", cursor:"pointer", fontFamily:"sans-serif" }} onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>
      <ProgressBar step={step} setStep={setStep} maxStep={maxStep}/>
      <PreviewBanner step={step} maxStep={maxStep} setStep={setStep}/>
      {step===0 && <StepVessel data={vessel} setData={setVessel} onNext={()=>goToStep(1)}/>}
      {step===1 && <StepParties data={parties} setData={setParties} userRole={user?.role||"buyer"} onNext={()=>goToStep(2)} onBack={()=>setStep(0)}/>}
      {step===2 && <StepNegotiateTerms vessel={vessel} parties={parties} data={negotiate} setData={setNegotiate} onNext={()=>goToStep(3)} onBack={()=>setStep(1)}/>}
      {step===3 && <StepDueDiligence data={ddData} setData={setDdData} vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} onNext={()=>goToStep(4)} onBack={()=>setStep(2)}/>}
      {step===4 && <StepDocuments data={docsData} setData={setDocsData} vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} onNext={()=>goToStep(5)} onBack={()=>setStep(3)}/>}
      {step===5 && <StepClosing vessel={vessel} parties={parties} terms={negotiate} negotiate={negotiate} ddData={ddData} docsData={docsData} onBack={()=>setStep(4)}/>}
      <AIAssistant open={aiOpen} setOpen={setAiOpen} step={step} vessel={vessel} parties={parties}/>
    </div>
  );
}
