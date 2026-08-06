'use client'

// ═══════════════════════════════════════════════════════════════════════════
// BOATCLOSERS — DOCUMENTS STEP (v2)
// src/components/DocumentsStepV2.jsx
//
// Reworked Documents step that reads the polished closing set from documents.js.
// Self-contained: add this file, then in BoatClosersApp.jsx import it and use it
// in place of <StepDocuments ...> on the step===4 line. Nothing else changes.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from "react";
import { DOCUMENTS, fillDocument } from "../data/documents";

// ── palette (matches the main app) ──
const C = {
  navy:"#08152e", navy2:"#0d2145", teal:"#0e6b7c", tealLight:"#e4f4f7",
  brass:"#b8863a", brass2:"#d4a84b", sand:"#f5f0e8", sandDark:"#ede6d8",
  white:"#ffffff", slate:"#3d5166", mist:"#d9d2c5", red:"#a82828",
  redLight:"#fdecea", green:"#1a5c35", greenLight:"#e4f0ea", text:"#1a2840",
};
const fmt = (n) => n ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(n)) : "";
const today = () => new Date().toISOString().split("T")[0];
// Full, provable timestamp: keeps the exact moment (ms) plus a human-readable
// local string, so a signed document can show date AND time, not just the day.
const signedStamp = () => { const d = new Date(); return { at: d.getTime(), when: d.toLocaleString() }; };
// Signature must match the party name (flexible on middle names/initials, case,
// and spacing). Empty party name → nothing to enforce.
const _nameParts = (s) => String(s||"").toLowerCase().replace(/[.,]/g," ").split(/\s+/).filter(Boolean);
const sigMatchesName = (signature, partyName) => {
  const exp = _nameParts(partyName), got = _nameParts(signature);
  if (exp.length === 0) return true;
  if (got.length === 0) return false;
  const first = exp[0], last = exp[exp.length - 1];
  return exp.length === 1 ? got.includes(first) : (got.includes(first) && got.includes(last));
};
const addDays = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };

const S = {
  page:{ maxWidth:820, margin:"0 auto", padding:"2rem 1.5rem" },
  card:{ background:C.white, border:`0.5px solid ${C.mist}`, borderRadius:8, padding:"1.5rem" },
  cardGold:{ background:C.white, border:`2px solid ${C.brass}`, borderRadius:8, padding:"1.5rem" },
  h1:{ fontSize:24, fontWeight:700, color:C.navy, marginBottom:6 },
  h3:{ fontSize:15, fontWeight:600, color:C.navy, marginBottom:10, fontFamily:"sans-serif" },
  label:{ fontSize:12, color:C.slate, fontFamily:"sans-serif", marginBottom:4, display:"block", fontWeight:500 },
  input:{ width:"100%", border:`1px solid ${C.mist}`, borderRadius:5, padding:"9px 11px", fontSize:13, fontFamily:"sans-serif", background:C.white, color:C.text, boxSizing:"border-box" },
  btn:{ background:C.navy, color:"#fff", border:"none", borderRadius:5, padding:"10px 22px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif", fontWeight:600 },
  btnBrass:{ background:C.brass, color:C.navy, border:"none", borderRadius:5, padding:"10px 22px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif", fontWeight:700 },
  btnOutline:{ background:"transparent", color:C.navy, border:`1px solid ${C.mist}`, borderRadius:5, padding:"9px 20px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif" },
  btnTeal:{ background:C.teal, color:"#fff", border:"none", borderRadius:5, padding:"10px 22px", fontSize:13, cursor:"pointer", fontFamily:"sans-serif", fontWeight:600 },
  divider:{ border:"none", borderTop:`1px solid ${C.mist}`, margin:"1.25rem 0" },
  pill:{ display:"inline-block", fontSize:10, fontFamily:"sans-serif", fontWeight:700, padding:"3px 9px", borderRadius:20, letterSpacing:0.5, textTransform:"uppercase" },
  tag:{ display:"inline-block", fontSize:10, fontFamily:"sans-serif", background:C.sandDark, color:C.slate, padding:"2px 7px", borderRadius:3, marginRight:4 },
};

function Field({ label, children, span2 }) {
  return <div style={{ gridColumn: span2 ? "span 2" : "span 1", marginBottom:14 }}>{label && <label style={S.label}>{label}</label>}{children}</div>;
}
function Grid2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>;
}
function DataWarning({ vessel, parties }) {
  const missing = [];
  if (!vessel.hin) missing.push("HIN (Hull ID Number)");
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

// spell a dollar amount in words for document bodies
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

// Everything typed into a document's blanks is stashed here the instant it is
// typed, outside of React. Background syncing and re-mounts kept wiping answers a
// second or two after they appeared; this stash always wins over whatever the
// deal currently says, so what you typed cannot be taken off the screen.
const LOCAL_FILLS = { dealId: null, fields: {}, checks: {} };
// A second copy lives in the browser itself, so answers survive a rebuilt screen,
// a refresh, or a closed tab even before the deal has finished saving them.
const FILLS_KEY = (id) => "bc_fills_" + (id || "pending");
const loadFills = (id) => {
  try {
    const raw = window.localStorage.getItem(FILLS_KEY(id));
    if (!raw) return null;
    const v = JSON.parse(raw);
    return (v && typeof v === "object") ? { fields: v.fields || {}, checks: v.checks || {} } : null;
  } catch (e) { return null; }
};
const saveFills = (id) => {
  try {
    window.localStorage.setItem(FILLS_KEY(id), JSON.stringify({ fields: LOCAL_FILLS.fields, checks: LOCAL_FILLS.checks }));
  } catch (e) {}
};
const mergeLocal = (base, mine) => {
  const out = { ...(base || {}) };
  Object.keys(mine).forEach(docId => { out[docId] = { ...(out[docId] || {}), ...mine[docId] }; });
  return out;
};

// The fill-in form. It holds the answers entirely on its own while you type and
// says nothing to the rest of the app until Save is pressed \u2014 so a background
// refresh cannot rebuild the screen mid-sentence and clear the boxes. Every
// keystroke is still quietly copied to the browser, purely as a safety net.
function FillInForm({ doc, blanks, initial, C, onKeep, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial);
  const [savedAt, setSavedAt] = useState(0);
  const set = (fk, v) => {
    setDraft(d => { const n = { ...d, [fk]: v }; onKeep(fk, v); return n; });
    if (savedAt) setSavedAt(0);
  };
  const answered = blanks.filter(b => (draft[b.fk] || "") !== "").length;
  return (
    <div style={{ marginTop:12, background:"#fffaf0", border:`1px solid ${C.brass}`, borderRadius:8, padding:"14px 14px 16px" }}>
      <div style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.navy, lineHeight:1.6, marginBottom:14 }}>
        ✏️ <strong>Fill in {doc.title}</strong> — these are the only blanks on this document. Everything else fills itself from your deal and stays locked. Fill in what you need, then press <strong>Save</strong> at the bottom.
      </div>
      {blanks.map((b, i) => (
        <div key={b.fk} style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:4, lineHeight:1.45 }}>{b.label}</div>
          {b.kind === "check" ? (
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontFamily:"sans-serif", color:C.navy, cursor:"pointer" }}>
              <input type="checkbox" checked={draft[b.fk]==="on"} onChange={e=>set(b.fk, e.target.checked ? "on" : "")} style={{ width:17, height:17 }} />
              <span>Yes</span>
            </label>
          ) : (
            <input
              type="text"
              value={draft[b.fk] || ""}
              onChange={e=>set(b.fk, e.target.value)}
              placeholder={"Blank " + (i+1)}
              style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px", fontSize:16, fontFamily:"sans-serif", color:C.navy, border:`1px solid ${C.mist}`, borderRadius:6, outline:"none", background:"#fff" }}
            />
          )}
        </div>
      ))}
      {doc.checklist && (
        <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:4, marginBottom:12 }}>
          The tick-boxes on this document stay on the document itself — press Save, then tap <strong>View</strong> to check them off.
        </div>
      )}
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap", marginTop:4 }}>
        <button onClick={()=>{ onSave(draft); setSavedAt(Date.now()); }}
          style={{ background:C.brass, color:"#fff", border:"none", borderRadius:20, padding:"11px 24px", fontSize:13.5, fontWeight:800, fontFamily:"sans-serif", cursor:"pointer" }}>
          💾 Save {answered > 0 ? `(${answered} of ${blanks.length})` : ""}
        </button>
        <button onClick={()=>{ onSave(draft); onCancel(); }}
          style={{ background:"transparent", color:C.slate, border:`1px solid ${C.mist}`, borderRadius:20, padding:"10px 18px", fontSize:12.5, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer" }}>
          Save &amp; show the document
        </button>
        {savedAt > 0 && <span style={{ fontSize:12, fontFamily:"sans-serif", color:C.green, fontWeight:800 }}>✓ Saved</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL ASSISTANT — Documents
//
// Every other step has one; this page did not. It explains what this step is for
// and the order to work in, so nobody has to infer it from the boxes below.
// ─────────────────────────────────────────────────────────────────────────────
function DocsAssistant({ C, myRole, seen, onSeen }) {
  // Open on the first visit so the reasoning is read once, collapsed after so it
  // stops being a wall of text between the heading and the work.
  const [open, setOpen] = useState(!seen);
  useEffect(() => { if (!seen) onSeen(); }, []); // eslint-disable-line
  const isBuyer = myRole !== "seller";
  return (
    <div style={{ border:`1px solid ${C.navy}`, borderRadius:8, marginBottom:20, overflow:"hidden", background:C.white }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"11px 14px", background:C.navy }}>
        <span style={{ fontSize:18 }}>\ud83e\udded</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, fontFamily:"sans-serif", color:"#fff" }}>Deal Assistant</div>
          <div style={{ fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.6)" }}>Documents &mdash; what to do, and in what order</div>
        </div>
        <span style={{ color:C.brass, fontSize:12, fontFamily:"sans-serif", fontWeight:700, whiteSpace:"nowrap" }}>{open ? "\u25b2 Hide" : "\u25bc Show"}</span>
      </div>

      {open && (
        <div style={{ padding:"14px 16px", fontFamily:"sans-serif" }}>
          <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.75 }}>
            Your price has been agreed on and payment has been made. Now it&rsquo;s time to turn your deal into legally binding paperwork.
          </div>
          <ol style={{ margin:"11px 0 0", paddingLeft:19, fontSize:12.5, color:C.slate, lineHeight:1.75 }}>
            <li style={{ marginBottom:8 }}>
              Start with <b>Required documents to sign</b>. That list is built for your transaction from your deal details and your answers. You are not expected to complete all 55 available documents &mdash; only the ones listed for your deal.
            </li>
            <li style={{ marginBottom:8 }}>
              Open each document, complete any gold-highlighted fields, and <b>E-Sign</b> it. The {isBuyer ? "seller" : "buyer"} signs their required documents separately. Once both parties have signed, both signatures appear on the completed document.
            </li>
            <li style={{ marginBottom:8 }}>
              <b>Choose only one Bill of Sale.</b> Several versions exist because states and the U.S. Coast Guard have different requirements. Use <b>Which one do I need?</b> in the Bill of Sale box &mdash; it recommends the right version for your sale, explains why, and tells you if anything needs signing alongside it.
            </li>
            <li style={{ marginBottom:8 }}>
              Some documents cannot be signed electronically, including official state and federal forms and anything requiring notarization. Print those, complete them as instructed, then upload the signed copy. Each document tells you when this applies as soon as you open it.
            </li>
            <li>
              Your vessel information and party details fill in automatically from your deal and are locked to protect accuracy. If you spot an error, correct it in <b>Vessel</b> or <b>Parties</b> and every document updates with it.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIND A DOCUMENT — plain-language search
//
// People describe what happened to them, not the name of a form. "Owner died",
// not "Affidavit of Heirship". Matching runs over hidden keywords first, then the
// title and the plain-English "use this when" line.
// ─────────────────────────────────────────────────────────────────────────────
const SITUATIONS = ["Owner passed away", "Lost the title", "Still owe money on it", "Seller is a company", "Taking a trade-in", "Buyer paying me over time"];
const _nrm = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function FindDocument({ C, DOC_SET, onOpenDoc, signed }) {
  const [q, setQ] = useState("");
  const words = _nrm(q).split(" ").filter(w => w.length > 2);
  const results = !words.length ? [] : DOC_SET.map(d => {
    const keys = _nrm(d.keywords);
    const rest = _nrm(`${d.title} ${d.useWhen || ""} ${d.desc || ""} ${d.group}`);
    let score = 0;
    words.forEach(w => { if (keys.includes(w)) score += 2; else if (rest.includes(w)) score += 1; });
    return { d, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);

  return (
    <div style={{ border:`1px solid ${C.mist}`, borderRadius:9, marginBottom:16, overflow:"hidden", background:C.white }}>
      <div style={{ padding:"14px 16px 12px" }}>
        <div style={{ fontSize:13.5, fontFamily:"sans-serif", fontWeight:800, color:C.navy }}>Looking for something else?</div>
        <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, lineHeight:1.55, marginTop:3, marginBottom:10 }}>
          Describe your situation in your own words &mdash; you don&rsquo;t need to know what the document is called.
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:9, border:`1.5px solid ${q ? C.brass : C.mist}`, borderRadius:20, padding:"8px 14px", background: q ? "#fffaf0" : C.white }}>
          <span style={{ color:C.brass, fontSize:13 }}>&#9906;</span>
          <input type="text" value={q} onChange={e=>setQ(e.target.value)}
            placeholder="owner died &middot; lost the title &middot; still owe money"
            style={{ flex:1, border:"none", outline:"none", fontSize:13.5, fontFamily:"sans-serif", color:C.navy, background:"transparent", minWidth:0 }} />
          {q && <button onClick={()=>setQ("")} title="Clear" style={{ border:"none", background:"transparent", color:C.slate, fontSize:16, cursor:"pointer", lineHeight:1 }}>&times;</button>}
        </div>
        {!q && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
            {SITUATIONS.map(sq => (
              <button key={sq} onClick={()=>setQ(sq)}
                style={{ fontSize:11.5, background:C.sand, border:`1px solid ${C.mist}`, color:C.slate, padding:"5px 12px", borderRadius:14, cursor:"pointer", fontFamily:"sans-serif" }}>{sq}</button>
            ))}
          </div>
        )}
      </div>

      {q && (results.length === 0 ? (
        <div style={{ padding:"12px 16px", background:C.sand, fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6 }}>
          Nothing matched that. Try fewer words, or open the groups below &mdash; every document is in one of them.
        </div>
      ) : (
        <div>
          <div style={{ padding:"8px 16px", background:C.sand, fontSize:10.5, fontFamily:"sans-serif", color:C.slate, letterSpacing:0.5, textTransform:"uppercase" }}>
            {results.length} suggestion{results.length===1?"":"s"}
          </div>
          {results.map(({ d }) => (
            <button key={d.id} onClick={()=>{ setQ(""); onOpenDoc(d.id); }}
              style={{ display:"block", width:"100%", textAlign:"left", background:C.white, border:"none", borderTop:`1px solid ${C.sand}`, padding:"11px 16px", cursor:"pointer", fontFamily:"sans-serif" }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                <span style={{ fontSize:13, color:C.navy, fontWeight:600 }}>{d.title}</span>
                <span style={{ fontSize:11, color: signed[d.id] ? C.green : C.brass, whiteSpace:"nowrap" }}>{signed[d.id] ? "Signed \u2713" : "Open \u2192"}</span>
              </div>
              {(d.useWhen || d.desc) && <div style={{ fontSize:11.5, color:C.slate, marginTop:3, lineHeight:1.5 }}>{d.useWhen || d.desc}</div>}
              <div style={{ fontSize:10, color:C.slate, marginTop:4, opacity:0.7 }}>{d.group}</div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// Renders a filled document. Checkbox lists (doc.checklist) and "____" blanks
// become interactive in-app when `editable` is true; otherwise read-only.
function DocPaper({ doc, html, editable, checkState, toggleCheck, savedFields, onField }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const blanks = root.querySelectorAll(".bc-fill-in");
    const handlers = [];
    // Blanks are never typed on directly — they only display what was entered in
    // the Fill In form. Nothing here is editable, so nothing can be clobbered.
    blanks.forEach((el) => {
      const saved = savedFields[el.getAttribute("data-fk")];
      const has = saved != null && saved !== "";
      el.removeAttribute("contenteditable");
      el.classList.toggle("filled", has);
      el.textContent = has ? saved : "________";
    });
    // Checkboxes (☐/☑) embedded in the document body — clickable when editable.
    const checks = root.querySelectorAll(".bc-check");
    checks.forEach((el) => {
      const fk = el.getAttribute("data-fk");
      el.textContent = savedFields[fk] === "on" ? "\u2611" : "\u2610";
    });
    return () => handlers.forEach(([el, h, ev]) => el.removeEventListener(ev, h));
  }, [html, editable, savedFields]); // eslint-disable-line

  if (doc.checklist && html.includes("<!--CHECKLIST-->")) {
    const [before, after] = html.split("<!--CHECKLIST-->");
    let lastSec = null;
    return (
      <div className="bc-doc" ref={ref}>
        <div dangerouslySetInnerHTML={{ __html: before }} />
        <div className="bc-checklist">
          {doc.checklist.map((it, idx) => {
            const secHeader = it.section && it.section !== lastSec ? (lastSec = it.section, <div key={"s"+idx} className="bc-cl-sec">{it.section}</div>) : null;
            const on = !!(checkState[doc.id]||{})[idx];
            return (
              <div key={idx}>
                {secHeader}
                <div className={"bc-cl-item"+(editable?"":" locked")} onClick={editable ? ()=>toggleCheck(doc.id, idx) : undefined}>
                  <span className={"bc-cl-box"+(on?" on":"")}>{on ? "✓" : ""}</span>
                  <span className="bc-cl-text"><b>{it.label}</b>{it.desc ? <span className="bc-cl-desc">{it.desc}</span> : null}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div dangerouslySetInnerHTML={{ __html: after }} />
      </div>
    );
  }
  return <div className="bc-doc" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function DocumentsStepV2({ data, setData, vessel, parties, terms, negotiate, myRole, amInitiator, dealId, onNext, onBack }) {
  // Single payment happens at the PA-lock step in Negotiate. Once an offer is
  // accepted (PA locked), the deal is paid — Documents shows NO second paywall.
  const paLocked = !!((negotiate?.offers || []).find(o => o.status === "accepted")) || !!(negotiate && (negotiate.paid || negotiate.dealLocked)) || !!data.paid;
  const [paid, setPaid] = useState(paLocked);
  const [payDisc, setPayDisc] = useState(false);
  const [agreedTos, setAgreedTos] = useState(false);
  // The Purchase Agreement is signed during the deal (sign-before-pay). Carry those
  // signatures in so it shows as already complete here — no need to re-sign it.
  const _accOffer = (negotiate?.offers || []).find(o => o.status === "accepted");
  const _va = negotiate?.vesselAcceptance;
  const _ad = negotiate?.addendum;
  const _paPrefill = {
    ...((_accOffer && (_accOffer.paBuyerSig || _accOffer.paSellerSig))
      ? { purchase_agreement: { name: `${_accOffer.paBuyerSig || parties.buyer.name || "Buyer"} & ${_accOffer.paSellerSig || parties.seller.name || "Seller"}`, date: _accOffer.paDate || today(), prefilled: true } }
      : {}),
    ...((_va && _va.sig)
      ? { acceptance: { name: _va.sig, date: _va.date || today(), prefilled: true } }
      : {}),
    ...((_ad && (_ad.newPrice || _ad.buyer))
      ? { renegotiation: { name: _ad.buyer || parties.buyer.name || "Buyer", date: _ad.date || today(), prefilled: true } }
      : {}),
    // The Earnest Money Deposit Receipt is signed back in the deposit step (it lives
    // on negotiate.depositProof / depositVerification). Without this, the Documents
    // step didn't know that and kept showing "Sign →" for a receipt already completed —
    // asking the customer to do the same thing twice. Mirror the deposit-step signatures
    // here so a confirmed deposit shows the receipt as Done.
    ...((negotiate?.depositProof && negotiate.depositProof.sig)
      ? { deposit_receipt: {
            name: negotiate?.depositVerification?.sig
              ? `${negotiate.depositProof.sig} & ${negotiate.depositVerification.sig}`
              : negotiate.depositProof.sig,
            date: today(),
            prefilled: true,
          } }
      : {}),
  };
  const [signed, setSigned] = useState({ ..._paPrefill, ...(data.signedDocs||{}) });
  const [sigName, setSigName] = useState({});

  const [docAction, setDocAction] = useState({});
  // Strip anything executable so an edited doc can't carry injected scripts when
  // it's later sent to the other party. Formatting/text is preserved.
  const sanitizeHtml = (html) => String(html || '')
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*(iframe|object|embed|link|meta|style)[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>]*\2/gi, '$1="#"');
  const [activeDoc, setActiveDoc] = useState(null); // the one document currently opened for work
  // Collapsible groups — required group open by default, the rest collapsed.
  const [openGroups, setOpenGroups] = useState({ "Closing Instruments": true });
  // ── Florida detection ──────────────────────────────────────────────────────
  // Look for Florida in the buyer, seller, or vessel location. If found, the
  // official FL state forms are surfaced automatically. If not found, the user can
  // still opt in ("this transfer is happening in Florida").
  const _isFL = (s) => /\b(fl|fla|florida)\b/i.test(String(s || ""));
  const flDetected = _isFL(parties.buyer?.stateZip) || _isFL(parties.seller?.stateZip)
    || _isFL(vessel?.location) || _isFL(vessel?.regState);
  const [flOptIn, setFlOptIn] = useState(false);
  // ── USCG-documented detection ──────────────────────────────────────────────
  // A vessel with a Coast Guard Official Number is federally documented, so the
  // CG-1340 / CG-1258 forms apply. Detect from the official number; allow opt-in.
  const docDetected = !!String(vessel?.uscgNumber || vessel?.uscgOfficialNo || vessel?.officialNo || "").trim();
  const [docOptIn, setDocOptIn] = useState(false);
  const [quizOpen, setQuizOpen] = useState(true);
  const [quizMore, setQuizMore] = useState(false);
  const [quiz, setQuiz] = useState({ pay:"", trailer:false, documented:false, florida:false, lien:false, estate:false, coowner:false, entity:false, poa:false, tradein:false, gift:false, sellerfin:false, losttitle:false, lostreg:false, survey:false, defects:false });
  // documentedActive / floridaActive computed after quiz so the quiz answers count.
  const documentedActive = docDetected || docOptIn || !!quiz.documented;
  const floridaActive = flDetected || flOptIn || !!quiz.florida;
  const [esignConsent, setEsignConsent] = useState({}); // per-doc consent before e-signing
  const toggleGroup = (g) => setOpenGroups(o => ({ ...o, [g]: !o[g] }));
  const [sendEmail, setSendEmail] = useState({});
  const [sendNote, setSendNote] = useState({});
  const [sentLog, setSentLog] = useState({});
  const [sending, setSending] = useState({});
  const [sendErr, setSendErr] = useState({});
  const [uploadedFile, setUploadedFile] = useState({});
  const [uploadedData, setUploadedData] = useState({}); // { docId: { name, type, dataURL } } — actual file bytes
  const [uploadErr, setUploadErr] = useState({});
  const [uploading, setUploading] = useState({});
  const [manualSig, setManualSig] = useState({});
  const [manualFields, setManualFields] = useState({});
  // A new deal starts with an empty stash.
  // Only wipe the stash when moving between two REAL deals. The deal id often
  // arrives a moment after the page does, and treating that as "a different deal"
  // was itself throwing away answers a second or two after they were typed.
  if (dealId && LOCAL_FILLS.dealId && LOCAL_FILLS.dealId !== dealId) { LOCAL_FILLS.fields = {}; LOCAL_FILLS.checks = {}; }
  if (dealId) LOCAL_FILLS.dealId = dealId;
  // Pick the browser copy back up on a fresh screen, and carry over anything that
  // was typed before the deal id had arrived.
  const fillsLoaded = useRef(false);
  if (!fillsLoaded.current && typeof window !== "undefined") {
    fillsLoaded.current = true;
    const pending = loadFills(null);
    const mine = loadFills(dealId);
    [pending, mine].forEach(src => {
      if (!src) return;
      Object.keys(src.fields).forEach(k => { LOCAL_FILLS.fields[k] = { ...(LOCAL_FILLS.fields[k] || {}), ...src.fields[k] }; });
      Object.keys(src.checks).forEach(k => { LOCAL_FILLS.checks[k] = { ...(LOCAL_FILLS.checks[k] || {}), ...src.checks[k] }; });
    });
    if (dealId && pending) { saveFills(dealId); try { window.localStorage.removeItem(FILLS_KEY(null)); } catch (e) {} }
  }
  // No stored copy of the answers lives here, deliberately. Something in the app
  // was resetting that copy a few seconds after the page loaded, which is what made
  // filled-in answers vanish from the screen while the database still held them.
  // They are now worked out fresh on every draw: what the deal says, with anything
  // typed on this device laid on top. There is no copy left to reset.
  const checkState = mergeLocal(data.docChecks, LOCAL_FILLS.checks);
  const fieldState = mergeLocal(data.docFields, LOCAL_FILLS.fields);
  const [closeAck, setCloseAck] = useState(false); // acknowledge offline/notary docs before closing

  // One-line "is this section for me?" descriptions under each group header.
  const GROUP_DESC = {
    "Closing Instruments": "The core paperwork every sale needs — purchase agreement, bill of sale, deposit receipt, as-is acknowledgment, and closing statement. Everyone signs these.",
    "Due-Diligence Outcomes": "Use after the survey and sea trial — formally accept the boat, renegotiate the price, or walk away and reclaim your deposit.",
    "Title & Government": "The documents that transfer ownership and registration to the buyer with your state or the Coast Guard. Add these once you're ready to file.",
    "Financing & Insurance": "Only if the buyer is getting a loan or the lender/insurer needs proof of coverage — commitment letter, binder, and a conditions checklist.",
    "Authority & Signing": "Only if someone other than a sole individual owner is signing — a business, multiple co-owners, a trust, or a power of attorney.",
    "Deal Structures": "For deals that aren't a straight cash sale — a trade-in, seller financing, a trailer included, or gifting the boat to family.",
    "Estate & Inheritance": "Only if the owner has passed away. Start with the plain-language guide, then the right affidavit for your situation, plus the death certificate.",
    "Title Problems": "When the paperwork is a mess — a lost title, no title on record, a gap in ownership history, missing Coast Guard documentation, or a lapsed registration.",
    "Closing-Day": "Sign these at the handoff — delivery and possession receipt, the seller's disclosure of known defects, and the engine-hours statement.",
  };

  const toggleCheck = (docId, idx) => {
    const next = { ...checkState, [docId]: { ...(checkState[docId]||{}), [idx]: !(checkState[docId]||{})[idx] } };
    LOCAL_FILLS.checks[docId] = { ...(LOCAL_FILLS.checks[docId] || {}), [idx]: next[docId][idx] };
    saveFills(dealId);
    setData(d => ({ ...d, docChecks: next }));
  };
  // Keep a keystroke in the browser only — no app-wide update, so typing is never
  // interrupted. This is the safety net if the tab closes before Save is pressed.
  const keepField = (docId, key, val) => {
    LOCAL_FILLS.fields[docId] = { ...(LOCAL_FILLS.fields[docId] || {}), [key]: String(val || "").slice(0, 300) };
    saveFills(dealId);
  };
  // Save a whole form at once, on the Save button.
  const saveFields = (docId, draft) => {
    const clean = {};
    Object.keys(draft || {}).forEach(k => {
      clean[k] = sanitizeHtml(String(draft[k] || "")).replace(/<[^>]*>/g, "").slice(0, 300);
    });
    const next = { ...fieldState, [docId]: { ...(fieldState[docId] || {}), ...clean } };
    LOCAL_FILLS.fields[docId] = { ...(LOCAL_FILLS.fields[docId] || {}), ...clean };
    saveFills(dealId);
    setData(d => ({ ...d, docFields: next }));
  };
  const setField = (docId, key, val) => {
    // Typed values are plain text only — scrub anything markup-like before it is
    // stored, printed, or emailed to the other party.
    const clean = sanitizeHtml(String(val || "")).replace(/<[^>]*>/g, "").slice(0, 300);
    const next = { ...fieldState, [docId]: { ...(fieldState[docId]||{}), [key]: clean } };
    LOCAL_FILLS.fields[docId] = { ...(LOCAL_FILLS.fields[docId] || {}), [key]: clean };
    saveFills(dealId);
    setData(d => ({ ...d, docFields: next }));
  };
  // A document can be locked to one role with editRole. Only that role fills it
  // in-app; the other party prints/uploads instead.
  // A finalized deal is a closed record. The server refuses every write to one, so
  // offering Fill In, E-Sign or Upload would only fail quietly and make a properly
  // locked deal look editable. Viewing, printing and sending stay open — that record
  // of the sale is exactly what the parties paid for.
  const frozen = !!(negotiate && negotiate.dealFinalized);
  const canEditDoc = (doc) => !frozen && (!doc.editRole || doc.editRole === myRole);
  // Turn the "____" blanks in a document (outside the signature block) into
  // fillable spans the right party can type into.
  const prepHtml = (rawHtml, docId) => {
    const sigAt = rawHtml.indexOf('<div class="sig"');
    const head = sigAt >= 0 ? rawHtml.slice(0, sigAt) : rawHtml;
    const tail = sigAt >= 0 ? rawHtml.slice(sigAt) : "";
    let n = 0, c = 0;
    let head2 = head.replace(/_{4,}/g, () => `<span class="bc-fill-in" data-fk="${docId}:${n++}">________</span>`);
    head2 = head2.replace(/[\u2610\u2611\u2612]/g, () => `<span class="bc-check" data-fk="${docId}:chk${c++}">\u2610</span>`);
    // Missing deal values become a plain locked line, AFTER the fillable blanks
    // have been worked out — so they are shown, but never offered for typing.
    const miss = /\u2591MISSING\u2591/g;
    head2 = head2.replace(miss, '<span class="bc-missing" title="Comes from your Vessel, Parties or Terms">________</span>');
    return head2 + tail.replace(miss, '<span class="bc-missing">________</span>');
  };

  // Open one document into focused view: mark it active, show its filled body,
  // and make sure its group is expanded.
  const openDoc = (docId) => {
    setActiveDoc(docId);
    setDocAction(d => ({ ...d, [docId]: "view" }));
    const grp = (DOC_SET.find(x => x.id === docId) || {}).group;
    if (grp) setOpenGroups(g => ({ ...g, [grp]: true }));
  };

  // Jump to a document from the required-docs tracker: open it and scroll to it.
  const jumpToDoc = (docId) => {
    openDoc(docId);
    if (typeof document !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById("bcdoc-" + docId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  };

  // ── Build the deal object documents.js fills from ──
  const agreed = Number(negotiate.agreedPrice||0);
  const dep = Number(negotiate.deposit||0);
  const ddEndCalc = terms.ddStartDate && terms.dueDiligenceDays ? addDays(terms.ddStartDate, Number(terms.dueDiligenceDays)) : "";
  // Use the buyer's picks from Negotiate & Terms; fall back to a sensible default.
  let selectedContingencies = negotiate.selectedContingencies;
  if (!Array.isArray(selectedContingencies) || !selectedContingencies.length) {
    selectedContingencies = ["survey","seaTrial","title"];
    if (negotiate.paymentType === "finance") selectedContingencies.push("financing");
  }
  // Any user-fillable field that has no data yet renders as an editable blank line
  // (prepHtml turns 4+ underscores into a tap-to-type box) instead of dead "[label]"
  // text — so a missing buyer name, HIN, closing date, etc. can be filled right in
  // the document. Fields that are entered elsewhere simply convey their value.
  // A deal value that has not been entered yet (no HIN, no closing date, and so on).
  // This deliberately contains NO underscores: a run of underscores is how a
  // document marks a blank for the customer to complete, and an empty HIN is not
  // that — it belongs to Vessel and must never become a typeable box.
  const BLANK = "\u2591MISSING\u2591";
  const engineParts = `${vessel.engineMake||""} ${vessel.engineModel||""}`.trim();
  // The deal reference must stay identical between renders. It used to be built
  // from Date.now(), so every re-render produced a different document, React
  // rewrote the page, and whatever was being typed into a blank was destroyed.
  const dealRefSeed = useRef(data.dealRef || ("BC-" + String(Date.now()).slice(-5)));
  const dealRef = data.dealRef || dealRefSeed.current;
  useEffect(() => {
    if (!data.dealRef) setData(d => (d.dealRef ? d : { ...d, dealRef: dealRefSeed.current }));
  }, []); // eslint-disable-line
  const deal = {
    dealRef,
    effectiveDate: today(),
    sellerName: parties.seller.name || _accOffer?.paSellerSig || BLANK,
    sellerAddress: `${parties.seller.address||""} ${parties.seller.city||""} ${parties.seller.stateZip||""}`.trim() || BLANK,
    sellerCitizen: "United States",
    buyerName: parties.buyer.name || _accOffer?.paBuyerSig || BLANK,
    buyerAddress: `${parties.buyer.address||""} ${parties.buyer.city||""} ${parties.buyer.stateZip||""}`.trim() || BLANK,
    buyerCitizen: "United States",
    vesselYear: vessel.year||"[Year]", vesselMake: vessel.make||"[Make]", vesselModel: vessel.model||"[Model]",
    vesselLength: vessel.loa ? vessel.loa+" ft" : BLANK,
    hullMaterial: vessel.hullType || BLANK,
    engineSerial: vessel.engineSerial || BLANK,
    engineCount: vessel.engineCount || BLANK,
    trailerVin: vessel.trailerVin || BLANK,
    trailerState: vessel.trailerState || BLANK,
    hin: vessel.hin || BLANK,
    uscgOfficialNo: vessel.uscgNumber || "N/A",
    titleNo: vessel.regNumber || BLANK,
    regNo: vessel.regNumber || BLANK,
    vesselState: vessel.regState || vessel.location || BLANK,
    engineDesc: engineParts ? `${vessel.engineCount||"1"} × ${engineParts}` : BLANK,
    salePrice: fmt(agreed), salePriceWords: priceToWords(agreed),
    depositAmount: fmt(dep), depositPct: (negotiate.escrowPct||0)+"%",
    balanceDue: fmt(Math.max(0, agreed-dep)),
    reducedPrice: "", reduction: "",
    closingDate: terms.closingDate || negotiate.closingDate || _accOffer?.closingDate || BLANK,
    closingLocation: vessel.location || "the location where the Vessel is moored",
    surveyDeadline: ddEndCalc || BLANK,
    seaTrialDeadline: ddEndCalc || BLANK,
    financingDeadline: ddEndCalc || BLANK,
    brokerFee: "$249.00",
    selectedContingencies,
    paymentType: negotiate.paymentType || "",
    docStatus: signed,
    // Title & Government pack signals + fillable fields
    hasLien: !!(negotiate.sellerHasLien || data.hasLien),
    lienholderName: negotiate.lienholderName || BLANK,
    lienAcctNo: negotiate.lienAcctNo || BLANK,
    lienAmount: negotiate.lienAmount ? fmt(Number(negotiate.lienAmount)) : BLANK,
  };

  // ── Map curated docs onto app IDs so the Closing step stays in sync ──
  const ID_MAP = { psa:"purchase_agreement", bos:"bill_of_sale", dep:"deposit_receipt", asis:"as_is_acknowledgment", stmt:"closing_statement", accept:"acceptance", amend:"renegotiation", term:"rejection" };
  const REQUIRED = new Set(["purchase_agreement","bill_of_sale","deposit_receipt","as_is_acknowledgment","closing_statement","acceptance"]);
  const hasAddendum = !!(negotiate?.addendum && (negotiate.addendum.newPrice || negotiate.addendum.buyer));
  const DOC_SET = DOCUMENTS
    .filter(d => typeof d.showIf !== "function" || d.showIf(deal))
    // State and federal forms are always available. They used to be hidden behind an
    // "Add" box, which meant a customer who needed one had to know it existed before
    // they could find it. Detection now decides what we RECOMMEND, not what exists.
    .map(d => { const mid = ID_MAP[d.id]||d.id; return { ...d, id: mid, required: REQUIRED.has(mid) || (mid==="renegotiation" && hasAddendum) }; });
  const GROUPS = [...new Set(DOC_SET.map(d=>d.group))];

  // Bill of Sale gets its own dedicated box — it's the document that actually
  // transfers ownership, second only to the title. Collect every BoS variant.
  const [bosQ, setBosQ] = useState({});
  const [bosQOpen, setBosQOpen] = useState(false);
  const BOS_IDS = new Set(["bill_of_sale","bos_plain","fl_82050","fl_bos_itemized","cg_1340","trailer_bos","uscg_transfer"]);
  // The Bill of Sale box always shows EVERY bill-of-sale option (standard, simple,
  // Florida, Coast Guard) so a seller can always pick the right one — even if the
  // deal wasn't auto-detected as FL/documented. Built from the full doc list, then
  // mapped through ID_MAP so ids match (bos → bill_of_sale).
  const bosDocs = DOCUMENTS
    .map(d => ({ ...d, id: ID_MAP[d.id] || d.id }))
    .filter(d => BOS_IDS.has(d.id));
  // Which version leads. A tag office knows its own form on sight, so where the
  // state or the Coast Guard publishes one, that goes first.
  const bosLeadId = documentedActive ? "cg_1340" : floridaActive ? "fl_82050" : "bill_of_sale";
  const bosPrimary = bosDocs.find(d => d.id === bosLeadId) || bosDocs.find(d => d.id === "bill_of_sale");
  // Official forms above ours, and the recommended one at the very top.
  const OFFICIAL = new Set(["fl_82050","fl_82040vs","cg_1340","cg_1258","uscg_transfer"]);
  bosDocs.sort((a, b) => {
    if (a.id === bosLeadId) return -1;
    if (b.id === bosLeadId) return 1;
    const ao = OFFICIAL.has(a.id) ? 0 : 1, bo = OFFICIAL.has(b.id) ? 0 : 1;
    return ao - bo;
  });
  const bosSigned = bosDocs.some(d => signed[d.id]); // any BoS variant signed = satisfied
  // The main required list EXCLUDES the bill of sale (it has its own box).
  let requiredDocs = DOC_SET.filter(d => d.required && d.id !== "bill_of_sale");
  // Questionnaire → suggested documents (additive; the full list stays browsable).
  const REC_MAP = {
    core: ["psa","bos","dep","asis","stmt","title_app","delivery_receipt"],
    finance: ["commitment","fin_conditions","binder"],
    trailer: ["trailer_bos"],
    documented: ["uscg_transfer"],
    lien: ["payoff","lien_release"],
    estate: ["estate_guide","heirship","executor_auth"],
    coowner: ["coowner"],
    entity: ["entity_auth"],
    poa: ["poa"],
    tradein: ["trade_in"],
    gift: ["gift_transfer"],
    sellerfin: ["promissory_note","security_agreement"],
    losttitle: ["lost_title","bos_only"],
    lostreg: ["lost_reg"],
    survey: ["survey_report"],
    defects: ["defect_disclosure","engine_hours"],
  };
  const recIds = (() => {
    const s = new Set(REC_MAP.core);
    if (quiz.pay === "finance") REC_MAP.finance.forEach(id => s.add(id));
    ["trailer","documented","lien","estate","coowner","entity","poa","tradein","gift","sellerfin","losttitle","lostreg","survey","defects"].forEach(k => { if (quiz[k]) (REC_MAP[k]||[]).forEach(id => s.add(id)); });
    return [...s];
  })();
  const recDocs = recIds.map(id => DOC_SET.find(d => d.id === id)).filter(Boolean);
  // Anything the questions turned up goes straight into the required list, with the
  // reason attached. Suggesting them in a side box meant they were easy to miss.
  const REASON = {
    payoff:"money still owed", lien_release:"money still owed", title_search_letter:"money still owed",
    lost_title:"title missing", bos_only:"title missing", lost_reg:"registration missing",
    estate_guide:"owner has passed away", heirship:"owner has passed away",
    executor_auth:"owner has passed away", small_estate:"owner has passed away", death_cert:"owner has passed away",
    poa:"someone signing for the owner", coowner:"more than one owner", entity_auth:"business or trust",
    promissory_note:"seller financing", security_agreement:"seller financing",
    trade_in:"trade-in", gift_transfer:"gift transfer", trailer_bos:"trailer included",
    uscg_transfer:"Coast Guard documented", commitment:"buyer financing",
    fin_conditions:"buyer financing", binder:"buyer financing",
    survey_report:"survey", defect_disclosure:"disclosed defects", engine_hours:"disclosed defects",
  };
  const quizStarted = !!quiz.pay || Object.keys(quiz).some(k => k !== "pay" && quiz[k]);
  // The core set, plus whatever the questions added.
  const _coreReq = requiredDocs;
  const _coreIds = new Set(_coreReq.map(d => d.id).concat(["bill_of_sale"]));
  const _added = recDocs.filter(d => !_coreIds.has(d.id) && REASON[d.id]).map(d => ({ ...d, addedWhy: REASON[d.id] }));
  requiredDocs = [..._coreReq, ..._added];
  const allRequiredSigned = requiredDocs.every(d => signed[d.id]) && bosSigned;
  const reqMissing = requiredDocs.filter(d => !signed[d.id]);
  const reqNotaryMissing = reqMissing.filter(d => (d.body||"").includes("Notary Acknowledgment"));
  const signedCount = Object.keys(signed).length;

  // ── PAYWALL ──
  if (!paid) {
    return (
      <div style={S.page}>
        <div style={{ marginBottom:"1.5rem" }}>
          <h1 style={S.h1}>Unlock All Documents</h1>
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>Your deal is ready. Pay the flat $249 fee to unlock all documents, e-signatures, and your closing package.</p>
        </div>

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
            {["Professional Legal Documents","Electronic Signatures","Closing Checklist","PDF Download Package","AI Deal Assistant Access","No recurring fees","One deal covered","Buyer & seller copies"].map(f=>(
              <div key={f} style={{ fontSize:12, fontFamily:"sans-serif", color:C.navy }}>✓ {f}</div>
            ))}
          </div>
        </div>

        <div style={{...S.card, marginTop:16}}>
          <h3 style={S.h3}>Deal Summary</h3>
          <div style={{ fontSize:12, fontFamily:"sans-serif", lineHeight:2, color:C.slate }}>
            <div><strong>Vessel:</strong> {deal.vesselYear} {deal.vesselMake} {deal.vesselModel} · HIN: {deal.hin}</div>
            <div><strong>Agreed Price:</strong> {deal.salePrice}</div>
            <div><strong>Buyer:</strong> {parties.buyer.name||"[Buyer]"} ({parties.buyer.email||"[Email]"})</div>
            <div><strong>Seller:</strong> {parties.seller.name||"[Seller]"} ({parties.seller.email||"[Email]"})</div>
            <div><strong>Closing Date:</strong> {deal.closingDate}</div>
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

  // ── helpers ──
  const setAction = (id, action) => setDocAction(d => ({ ...d, [id]: d[id] === action ? null : action }));
  // Turn a filled in-app document into a self-contained HTML file so it can be
  // One built copy of each document per unique deal state. Handing React the very
  // same string on re-render means it leaves the page alone — so a blank being
  // typed into is never torn out from under the user.
  const htmlCache = useRef({ key: "", map: {} });
  const getDocHtml = (docObj) => {
    const key = JSON.stringify(deal);
    if (htmlCache.current.key !== key) htmlCache.current = { key, map: {} };
    const m = htmlCache.current.map;
    if (!m[docObj.id]) m[docObj.id] = prepHtml(fillDocument(docObj, deal), docObj.id);
    return m[docObj.id];
  };

  // Put the signing date onto the signature line, for the side that actually
  // signed. Signature dates are never typed by hand \u2014 they are stamped from the
  // moment of signing, so a document cannot claim a date nobody agreed to.
  const niceDate = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    return m ? `${m[2]}/${m[3]}/${m[1]}` : String(iso || "");
  };
  const stampSignatures = (html, docId) => {
    const sig = signed[docId];
    if (!sig || !sig.date) return html;
    const stamp = niceDate(sig.date);
    // Signing offline or uploading a notarised copy covers both sides at once.
    const bothSides = !!(sig.manual || sig.uploaded || sig.notarizedOffline);
    const who = sig.role === "seller" ? "seller" : sig.role === "buyer" ? "buyer" : null;
    const lines = (html.match(/Date:\s*_{4,}/g) || []).length;
    return html.replace(/(Date:\s*)(_{4,})/g, (m, lead, blank, off) => {
      if (bothSides || lines === 1 || !who) return lead + `<span class="bc-stamp">${stamp}</span>`;
      // Work out whose signature box this date belongs to: whichever side is
      // named last before it.
      const ctx = html.slice(Math.max(0, off - 260), off).toLowerCase();
      const sAt = ctx.lastIndexOf("seller"), bAt = ctx.lastIndexOf("buyer");
      const side = sAt > bAt ? "seller" : (bAt > -1 ? "buyer" : null);
      return (side === who) ? lead + `<span class="bc-stamp">${stamp}</span>` : m;
    });
  };

  // Every blank and checkbox in a document, each labelled with the words that come
  // just before it, so the Fill In form reads like the document itself.
  const plain = (h) => String(h).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const labelFor = (lead) => {
    const inList = /<li[^>]*>\s*$/i.test(lead);
    const heads = lead.match(/<(?:b|strong|h3)[^>]*>[\s\S]*?<\/(?:b|strong|h3)>/gi);
    const sec = heads ? plain(heads[heads.length - 1]) : "";
    if (inList && sec) return sec;
    // The most useful label is the words between the last heading and the blank —
    // on a power of attorney that is "Agent name", not the whole recital.
    // Start after the last heading AND after the previous blank, so each box is
    // labelled by its own words instead of inheriting the one before it.
    let afterHead = lead.replace(/[\s\S]*<\/(?:b|strong|h3)>/i, "");
    afterHead = afterHead.replace(/[\s\S]*(?:bc-fill-in|bc-check)[^>]*>[\s\S]*?<\/span>/i, "");
    const tail = plain(afterHead).replace(/_{2,}/g, " ").replace(/\s+/g, " ").trim()
      .replace(/^[\/\-\u2013\u2014,;:.]+\s*/, "").replace(/[:;,]$/, "").trim();
    if (tail.length >= 3 && tail.length <= 60) return tail;
    // Strip out the underscores belonging to OTHER blanks — they are noise in a label.
    let t = plain(lead).replace(/_{2,}/g, " ").replace(/\s+/g, " ").trim();
    const cut = Math.max(t.lastIndexOf(". "), t.lastIndexOf(": "), t.lastIndexOf("; "));
    if (cut > -1 && t.length - cut > 4) t = t.slice(cut + 1);
    // Never cut a word in half: trimming to a fixed length turned "Registration"
    // into "egistration". Drop the partial word the cut leaves behind.
    if (t.length > 90) t = t.slice(-90).replace(/^\S*\s+/, "");
    t = t.trim().replace(/^[\/\-\u2013\u2014,;:.]+\s*/, "").replace(/[:;,]$/, "").trim();
    if (t.length < 12 && sec) return sec;
    return t || sec || "Fill in";
  };
  const getBlanks = (docObj) => {
    const html = getDocHtml(docObj);
    const out = [];
    const re = /<span class="bc-(fill-in|check)" data-fk="([^"]+)">/g;
    let m;
    while ((m = re.exec(html))) {
      out.push({ fk: m[2], kind: m[1], label: labelFor(html.slice(0, m.index)) });
    }
    // Where a heading covers several blanks in a row, number them 1, 2, 3\u2026
    const counts = {};
    out.forEach(b => { counts[b.label] = (counts[b.label] || 0) + 1; });
    const seen = {};
    out.forEach(b => {
      if (counts[b.label] > 1) {
        seen[b.label] = (seen[b.label] || 0) + 1;
        b.label = b.label + " \u2014 " + seen[b.label];
      }
    });
    return out;
  };

  // attached to the "send" email. Bakes in merge fields AND any values typed into
  // the tap-to-fill blanks, then wraps it in the same document styling.
  const b64Unicode = (str) => { try { return btoa(unescape(encodeURIComponent(str))); } catch (e) { return btoa(str); } };
  const buildDocFile = (docObj) => {
    let body = stampSignatures(getDocHtml(docObj), docObj.id);
    const saved = fieldState[docObj.id] || {};
    body = body.replace(/<span class="bc-fill-in" data-fk="([^"]+)">________<\/span>/g, (m, fk) => {
      const v = saved[fk];
      return `<span class="bc-fill-in">${(v != null && v !== "") ? String(v).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "________"}</span>`;
    });
    // Ticked boxes travel with the document too, not just typed answers.
    body = body.replace(/<span class="bc-check" data-fk="([^"]+)">[\s\S]*?<\/span>/g,
      (m, fk) => `<span class="bc-check">${saved[fk] === "on" ? "\u2611" : "\u2610"}</span>`);
    body = body.replace("<!--CHECKLIST-->", "");
    const css = docCSS +
      "\n.bc-doc-paper{max-height:none;overflow:visible;border:none;border-top:4px solid " + C.brass + ";padding:26px 28px}" +
      "\nbody{margin:0;padding:24px;background:#fff}" +
      "\n.bc-fill-hint,.bc-lock-note{display:none}" +
      "\n.bc-fill-in{border-bottom:1px solid " + C.brass + ";padding:0 4px;min-width:80px;display:inline-block}" +
      "\n.bc-stamp{font-weight:700;padding:0 6px;border-bottom:1px solid " + C.brass + "}" +
      "\n.bc-missing{border-bottom:1px solid #bbb;padding:0 4px;min-width:80px;display:inline-block;color:transparent}" +
      "\n@page{margin:0.6in}";
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + (docObj.title || "Document") + '</title><style>' + css + '</style></head><body>' +
      '<div class="bc-doc-paper">' +
      (docObj.eyebrow ? '<div class="bc-doc-eyebrow">' + docObj.eyebrow + '</div>' : '') +
      '<div class="bc-doc-title">' + (docObj.title || "") + '</div>' +
      body +
      '</div></body></html>';
  };

  const sendDoc = async (docId, docName) => {
    const to = sendEmail[docId]?.trim(); if (!to) return;
    setSendErr(e => ({ ...e, [docId]: "" }));
    setSending(s => ({ ...s, [docId]: true }));
    try {
      const att = uploadedData[docId];
      let attachment = att?.dataURL ? { filename: att.name, content: String(att.dataURL).split(",")[1] || "" } : null;
      if (!attachment) {
        const docObj = DOC_SET.find(d => d.id === docId);
        if (docObj) {
          const safe = (docName || "Document").replace(/[^\w\- ]+/g, "").trim().slice(0, 60) || "Document";
          attachment = { filename: safe + ".html", content: b64Unicode(buildDocFile(docObj)) };
        }
      }
      const res = await fetch("/api/deals/send-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, to, docName: docName || "Document", note: sendNote[docId] || "", fromName: parties?.[myRole]?.name || "", attachment })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || "Send failed — please try again.");
      setSentLog(s => ({ ...s, [docId]: [...(s[docId]||[]), { to, time: new Date().toLocaleTimeString(), note: sendNote[docId]||"" }] }));
      setSendEmail(e => ({ ...e, [docId]: "" })); setSendNote(n => ({ ...n, [docId]: "" }));
    } catch (err) {
      setSendErr(e => ({ ...e, [docId]: err?.message || "Send failed — please try again." }));
    } finally {
      setSending(s => ({ ...s, [docId]: false }));
    }
  };
  const confirmManualSig = (docId) => {
    const b = manualFields[docId]?.buyer?.trim(); const s = manualFields[docId]?.seller?.trim();
    if (!b || !s) return;
    setManualSig(m => ({ ...m, [docId]: { buyer: b, seller: s, date: today() } }));
    setSigned(sg => ({ ...sg, [docId]: { name: `${b} & ${s} (manual)`, date: today(), manual: true } }));
  };
  const handleUpload = (docId, file) => {
    if (!file) return;
    setUploadErr(e => ({ ...e, [docId]: "" }));
    if (file.size > 8 * 1024 * 1024) {
      setUploadErr(e => ({ ...e, [docId]: "That file is larger than 8MB. Please upload a smaller PDF or image." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataURL = reader.result;
      setUploadedFile(u => ({ ...u, [docId]: file.name }));
      setUploadedData(d => ({ ...d, [docId]: { name: file.name, type: file.type, dataURL } }));
      setSigned(sg => ({ ...sg, [docId]: { name: `Uploaded: ${file.name}`, date: today(), uploaded: true } }));
      setUploading(s => ({ ...s, [docId]: true }));
      try {
        const b64 = String(dataURL).split(",")[1] || "";
        const res = await fetch("/api/deals/upload-doc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dealId, docId, filename: file.name, contentType: file.type, base64: b64 }) });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || !j.success) throw new Error(j.error || "Could not store the file.");
      } catch (err) {
        setUploadErr(e => ({ ...e, [docId]: "Saved on your screen, but storing it for the other party failed: " + (err?.message || "") + " You can still Send it by email." }));
      } finally {
        setUploading(s => ({ ...s, [docId]: false }));
      }
    };
    reader.onerror = () => { setUploadErr(e => ({ ...e, [docId]: "Couldn't read that file — please try a different one." })); };
    reader.readAsDataURL(file);
  };
  const printDoc = (docId, title, retry) => {
    const node = docId != null ? document.getElementById("bc-print-" + docId) : null;
    // If Print is tapped straight from the Fill In screen the finished document is
    // not on screen yet — switch to it, then print a moment later.
    if (!node && docId != null && !retry) {
      setDocAction(d => ({ ...d, [docId]: "view" }));
      setTimeout(() => printDoc(docId, title, true), 250);
      return;
    }
    if (!node) { window.print(); return; }
    const w = window.open("", "_blank", "width=820,height=1040");
    if (!w) { alert("Please allow pop-ups for this site to print the document."); return; }
    w.document.write(
      '<!doctype html><html><head><title>' + (title || "Document") + '</title>' +
      '<meta charset="utf-8"><style>' + docCSS +
      '\n.bc-doc-paper{max-height:none;overflow:visible;border:none;border-top:none;padding:0}' +
      '\nbody{margin:0;padding:28px;background:#fff}' +
      '\n.bc-fill-hint,.bc-lock-note{display:none}' +
      '\n@page{margin:0.6in}' +
      '</style></head><body>' + node.innerHTML + '</body></html>'
    );
    w.document.close();
    w.focus();
    setTimeout(function(){ try { w.print(); } catch (e) {} }, 300);
  };

  const ActionBtn = ({ docId, action, icon, label, color }) => {
    const active = docAction[docId] === action;
    const c = color || C.navy;
    return (
      <button onClick={() => setAction(docId, action)} title={label}
        style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, fontFamily:"sans-serif", fontWeight:600, padding:"7px 13px", borderRadius:20, cursor:"pointer", border:`1.5px solid ${active ? c : "#e3ddd0"}`, background: active ? c : C.white, color: active ? "#fff" : c, whiteSpace:"nowrap", transition:"all .12s", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>
        <span style={{ fontSize:12 }}>{icon}</span> {label}
      </button>
    );
  };

  const docCSS = `
.bc-doc-paper{background:#fffdf8;border:1px solid ${C.mist};border-top:4px solid ${C.brass};border-radius:4px;padding:26px 28px;max-height:460px;overflow-y:auto;font-family:Georgia,'Times New Roman',serif;color:#1c1c1a}
.bc-doc-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${C.brass};font-weight:700;text-align:center;font-family:sans-serif}
.bc-doc-title{font-family:Georgia,serif;text-align:center;color:${C.navy};font-size:21px;line-height:1.2;margin:8px 0 3px;font-weight:700}
.bc-doc-ref{text-align:center;color:${C.slate};font-size:10px;letter-spacing:.05em;text-transform:uppercase;font-family:sans-serif}
.bc-doc-rule{height:1px;background:${C.mist};margin:14px 0 18px}
.bc-doc{font-size:13.5px;line-height:1.7}
.bc-doc h3{font-family:Georgia,serif;color:${C.navy};font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin:20px 0 7px}
.bc-doc p{margin:0 0 11px}
.bc-doc .recital{font-style:italic;color:#33352f}
.bc-doc ol{margin:0 0 11px;padding-left:20px}
.bc-doc ol li{margin-bottom:7px}
.bc-doc .sig{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:26px}
.bc-doc .sig .ln{border-bottom:1.5px solid ${C.navy};height:26px;margin-bottom:5px}
.bc-doc .sig small{font-size:11px;color:${C.slate};display:block;line-height:1.5;font-family:sans-serif}
.bc-doc .notary{margin-top:22px;border:1px solid ${C.mist};border-radius:4px;padding:14px 16px;background:#fbf8f0}
.bc-doc .notary .nt{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${C.brass};font-weight:700;margin-bottom:8px;font-family:sans-serif}
.bc-doc .notary p{font-size:12px;line-height:1.6}
.bc-doc table.stmt{width:100%;border-collapse:collapse;margin:4px 0 14px;font-size:13px}
.bc-doc table.stmt td{padding:8px 4px;border-bottom:1px solid ${C.mist};vertical-align:top}
.bc-doc table.stmt td.r{text-align:right;white-space:nowrap}
.bc-doc table.stmt tr.head td{font-weight:700;color:${C.navy};border-bottom:1.5px solid ${C.navy};text-transform:uppercase;font-size:10px}
.bc-doc table.stmt tr.tot td{font-weight:700;color:${C.navy};border-bottom:2px solid ${C.brass};border-top:1.5px solid ${C.navy};font-size:14px}
.bc-doc table.stmt td.sec{padding-top:14px;font-weight:700;color:${C.teal};text-transform:uppercase;font-size:10px;border-bottom:none}
.bc-doc .note{font-size:11.5px;color:${C.slate};font-style:italic;border-left:2px solid ${C.brass};padding:3px 0 3px 11px;margin:14px 0}
.bc-doc .lawbanner{background:#fbeaea;border:1px solid ${C.red};border-radius:6px;padding:10px 13px;margin-bottom:16px;font-size:11.5px;line-height:1.55;color:#7a1c1c}
.bc-doc .lawbanner b{color:${C.red}}
.bc-doc .estbanner{background:#fbf4e3;border:1px solid #8a6d1a;border-radius:6px;padding:10px 13px;margin-bottom:16px;font-size:11.5px;line-height:1.55;color:#6b540f}
.bc-doc .estbanner b{color:#8a6d1a}
.bc-doc .sysbadge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:20px;margin-bottom:12px;font-family:sans-serif}
.bc-doc .sys-state{background:#e4f0ea;color:#1a5c35}
.bc-doc .sys-uscg{background:#e4f4f7;color:#0e6b7c}
.bc-doc .sys-reg{background:#fff3cd;color:#7a5500}
.bc-notary-flag{background:#fbf4e3;border:1px solid #8a6d1a;border-radius:6px;padding:10px 13px;margin-bottom:16px;font-size:11.5px;line-height:1.55;color:#6b540f;font-family:sans-serif}
.bc-notary-flag strong{color:#8a6d1a}
.bc-checklist{margin:6px 0 14px}
.bc-fill-in{display:inline-block;min-width:90px;border-bottom:1px solid ${C.mist};padding:0 5px;line-height:1.7}
.bc-stamp{font-weight:700;color:${C.navy};border-bottom:1px solid ${C.brass};padding:0 6px}
.bc-missing{display:inline-block;min-width:90px;border-bottom:1px solid ${C.mist};padding:0 5px;line-height:1.7;color:transparent;user-select:none}
.bc-fill-in.filled{border-bottom:1.5px solid ${C.brass};color:${C.navy};font-weight:600}
.bc-check{font-size:16px;color:${C.slate};user-select:none;padding:0 2px}
.bc-check.editable{cursor:pointer;color:${C.navy}}
.bc-check.editable:hover{color:${C.brass}}
.bc-fill-hint{background:${C.tealLight};border:1px solid ${C.teal};border-radius:6px;padding:9px 13px;margin-bottom:14px;font-size:11.5px;line-height:1.5;color:${C.teal};font-family:sans-serif}
.bc-lock-note{background:#fbf4e3;border:1px solid #8a6d1a;border-radius:6px;padding:9px 13px;margin-bottom:14px;font-size:11.5px;line-height:1.5;color:#6b540f;font-family:sans-serif}
.bc-cl-item.locked{opacity:.7;cursor:default}
.bc-cl-sec{font-family:Georgia,serif;color:${C.navy};font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin:16px 0 6px}
.bc-cl-item{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid ${C.mist};cursor:pointer}
.bc-cl-box{width:18px;height:18px;border:1.5px solid ${C.slate};border-radius:4px;flex:none;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-family:sans-serif}
.bc-cl-box.on{background:${C.green};border-color:${C.green}}
.bc-cl-text{flex:1}
.bc-cl-text b{color:${C.navy}}
.bc-cl-desc{display:block;font-size:12px;color:${C.slate};font-style:italic;margin-top:2px;line-height:1.5}
.bc-doc .field{border-bottom:1px solid ${C.mist};padding:6px 0;display:flex;justify-content:space-between;gap:14px;font-size:13px}
.bc-doc .field .k{color:${C.slate}}
.bc-doc .field .v{font-weight:600;color:${C.navy};text-align:right}
.bc-doc .check{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid ${C.mist}}
.bc-doc .check .box{width:17px;height:17px;border:1.5px solid ${C.slate};border-radius:4px;flex:none;margin-top:2px}
.bc-doc .check .ct{flex:1}
.bc-doc .check .ct b{color:${C.navy}}
.bc-doc .check .ct .d{font-size:12px;color:${C.slate};font-style:italic;margin-top:2px;line-height:1.5}
.bc-doc .muted{font-size:11px;color:${C.slate};font-style:italic;text-transform:none;letter-spacing:0}
.bc-doc .reqlist{margin:6px 0 4px}
.bc-doc .req{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid ${C.mist}}
.bc-doc .req .rmark{font-size:16px;line-height:1.3;flex:none;width:18px;text-align:center}
.bc-doc .req .rlabel{flex:1;color:${C.navy};font-weight:600}
.bc-doc .req .rstatus{font-size:11px;font-family:sans-serif;color:${C.slate};text-align:right;max-width:46%;line-height:1.4}
.bc-doc .req.done .rmark{color:${C.green}}
.bc-doc .req.ready .rmark{color:${C.brass}}
.bc-doc .req.todo .rmark{color:${C.slate}}
.bc-doc .req.done .rstatus{color:${C.green}}
.bc-doc .reqtally{margin-top:10px;font-size:12.5px;color:${C.navy}}
.bc-doc .reqtally b{color:${C.green}}
.bc-doc .footer-flag{text-align:center;margin-top:24px;font-size:9px;color:${C.slate};letter-spacing:.12em;text-transform:uppercase;font-family:sans-serif}
.bc-doc .val{font-weight:600;color:${C.navy}}
.bc-docrow{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.bc-docbtns{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;flex-shrink:0}
@media(max-width:640px){
  .bc-docrow{flex-direction:column;gap:10px}
  .bc-docbtns{justify-content:flex-start;width:100%}
  .bc-docbtns button{flex:1 1 auto;justify-content:center;min-width:84px}
}`;

  // ── DOCUMENTS VIEW ──
  return (
    <div style={S.page}>
      <style>{docCSS}</style>
      <div style={{ marginBottom:"1.25rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={S.h1}>Documents</h1>
        </div>
        <span style={{...S.pill, background:C.greenLight, color:C.green}}>Paid ✓</span>
      </div>

      {!frozen && <DocsAssistant C={C} myRole={myRole} seen={!!data.docsGuideSeen} onSeen={()=>setData(d => ({ ...d, docsGuideSeen: true }))} />}
      {frozen && (
        <div style={{ background:"#f4f7f5", border:`1px solid ${C.green}`, borderRadius:8, padding:"12px 14px", marginBottom:18, fontFamily:"sans-serif", fontSize:12.5, color:C.slate, lineHeight:1.6 }}>
          🔒 <b>This deal is finalized.</b> Your documents are a closed record and can no longer be signed, filled in, replaced or added to. You can still open, print, download and email any of them, for as long as you need them.
        </div>
      )}

      <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:6, padding:"10px 14px", marginBottom:16, fontSize:11, fontFamily:"sans-serif", color:C.teal, lineHeight:1.8 }}>
        <strong>Each document has five options:</strong> &nbsp;
        ✏️ <strong>E-Sign</strong> — type your name to sign in-app &nbsp;·&nbsp;
        ✍️ <strong>Manual Sign</strong> — record wet ink signatures &nbsp;·&nbsp;
        📤 <strong>Send</strong> — email the document &nbsp;·&nbsp;
        📎 <strong>Upload</strong> — attach a signed PDF &nbsp;·&nbsp;
        🖨️ <strong>Print</strong> — open print dialog
      </div>

      {/* ── OPTIONAL: which documents does your deal need? (skippable) ── */}
      {quizOpen && (
        <div style={{ border:`1px solid ${C.mist}`, borderRadius:8, padding:"14px 16px", marginBottom:22, background:"#f7fbfd" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
            <div>
              <div style={{ fontSize:14, fontFamily:"sans-serif", fontWeight:800, color:C.navy }}>🧭 Not sure which documents you need?</div>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:2, lineHeight:1.5 }}>Answer a few quick questions and we'll point you to the right ones — or skip and browse all documents below.</div>
            </div>
            <button onClick={()=>setQuizOpen(false)} style={{ background:"transparent", border:`1px solid ${C.mist}`, color:C.slate, borderRadius:5, padding:"5px 10px", fontSize:11.5, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer", whiteSpace:"nowrap" }}>Skip — browse all ↓</button>
          </div>

          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
            {/* Payment */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.navy, fontWeight:600 }}>How is the buyer paying?</span>
              <div style={{ display:"flex", gap:6 }}>
                {[["cash","Cash"],["finance","Financing"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setQuiz(q=>({...q,pay:v}))} style={{ padding:"6px 14px", borderRadius:6, fontSize:12, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer", border:`2px solid ${quiz.pay===v?C.brass:C.mist}`, background:quiz.pay===v?"#fff8e6":"#fff", color:C.navy }}>{l}</button>
                ))}
              </div>
            </div>
            {/* Yes/No toggles — most pertinent up front */}
            {[["trailer","Is a trailer included in the sale?"],["documented","Is the vessel U.S. Coast Guard documented?"],["florida","Is this transfer happening in Florida?"],["lien","Does the seller still owe money on the boat (a lien to pay off)?"],["estate","Is this an estate or inherited sale?"]].map(([k,label])=>(
              <div key={k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.navy, fontWeight:600 }}>{label}</span>
                <div style={{ display:"flex", gap:6 }}>
                  {[[true,"Yes"],[false,"No"]].map(([v,l])=>(
                    <button key={String(v)} onClick={()=>setQuiz(q=>({...q,[k]:v}))} style={{ padding:"6px 14px", borderRadius:6, fontSize:12, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer", border:`2px solid ${quiz[k]===v?C.brass:C.mist}`, background:quiz[k]===v?"#fff8e6":"#fff", color:C.navy }}>{l}</button>
                  ))}
                </div>
              </div>
            ))}

            {/* Expandable — less common situations */}
            {quizMore && [["coowner","Are there co-owners on the current title?"],["entity","Is the buyer or seller a business or LLC?"],["poa","Is anyone signing with power of attorney?"],["tradein","Is a trade-in part of the deal?"],["gift","Is this a gift or family transfer?"],["sellerfin","Is the seller financing it (buyer pays over time)?"],["losttitle","Is the title lost or missing?"],["lostreg","Is the registration lost?"],["survey","Do you want a marine survey on record?"],["defects","Record engine hours / disclose known defects?"]].map(([k,label])=>(
              <div key={k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:12.5, fontFamily:"sans-serif", color:C.navy, fontWeight:600 }}>{label}</span>
                <div style={{ display:"flex", gap:6 }}>
                  {[[true,"Yes"],[false,"No"]].map(([v,l])=>(
                    <button key={String(v)} onClick={()=>setQuiz(q=>({...q,[k]:v}))} style={{ padding:"6px 14px", borderRadius:6, fontSize:12, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer", border:`2px solid ${quiz[k]===v?C.brass:C.mist}`, background:quiz[k]===v?"#fff8e6":"#fff", color:C.navy }}>{l}</button>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={()=>setQuizMore(m=>!m)} style={{ alignSelf:"flex-start", background:"transparent", border:"none", color:C.teal, fontSize:12, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer", padding:"2px 0", marginTop:2 }}>
              {quizMore ? "▴ Fewer questions" : "▾ More questions (for less common situations)"}
            </button>
          </div>

        </div>
      )}
      {!quizOpen && (
        <button onClick={()=>setQuizOpen(true)} style={{ background:"transparent", border:`1px dashed ${C.mist}`, color:C.slate, borderRadius:6, padding:"8px 14px", fontSize:11.5, fontWeight:700, fontFamily:"sans-serif", cursor:"pointer", marginBottom:16 }}>🧭 Help me pick the right documents</button>
      )}

      {/* ── BILL OF SALE — its own box (the ownership-transfer document) ── */}
      <div style={{ border:`2px solid ${bosSigned ? C.green : "#4a90d9"}`, borderRadius:8, padding:"13px 16px", marginBottom:16, background: bosSigned ? C.greenLight : "#eaf4ff" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <div style={{ fontSize:13.5, fontFamily:"sans-serif", fontWeight:800, color:C.navy }}>
            {bosSigned ? "✓ Bill of Sale complete" : "📜 Bill of Sale — required"}
          </div>
          <span style={{ fontSize:11, fontFamily:"sans-serif", fontWeight:700, color: bosSigned ? C.green : "#2b6cb0" }}>transfers ownership</span>
        </div>
        <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginBottom:11, lineHeight:1.55 }}>
          This is the document that legally transfers the boat. Choose the version that fits your sale — you only need <b>one</b>. {documentedActive ? "Your vessel is Coast Guard documented, so the CG-1340 applies." : floridaActive ? "Florida\u2019s official 82050 is included." : ""}
        </div>
        {/* Optional: a few questions that produce a ranked set — the form the state
            wants first, then anything that sensibly goes alongside it. */}
        {!bosSigned && (bosQOpen ? (() => {
          const documented = bosQ.doc === undefined ? (documentedActive ? "yes" : undefined) : bosQ.doc;
          const st = bosQ.state, pw = bosQ.power, split = bosQ.split;
          // A ranked set, not a single answer. Where a state publishes its own form
          // the state's form is what the office wants — ours sits alongside it, not
          // instead of it.
          const picks = [];
          const add = (id, role, note) => { const d = bosDocs.find(x => x.id === id); if (d) picks.push({ d, role, note }); };
          if (documented === "yes") {
            add("cg_1340", "use", "A federally documented vessel transfers on the Coast Guard's own form. This is the one the NVDC expects.");
            add("bill_of_sale", "also", "Optional alongside it. Our version carries fuller warranty and as-is language than the one-page federal form, which some buyers want on record.");
            add("uscg_transfer", "also-need", "Only if the boat is coming off documentation as part of this sale.");
            if (st === "fl") add("fl_82050", "also-need", "If the buyer will also register it in Florida, the state will want its own form on file.");
          } else if (st === "fl") {
            add("fl_82050", "use", "Florida wants its own form. The tag office knows it on sight and will generally expect it regardless of what else you sign, so start here.");
            if (pw === "outboard" && split !== "no")
              add("fl_bos_itemized", "also", "Sign this as well if you are pricing the hull and motors separately. Florida titles outboards apart from the hull, so the allocation belongs on a document \u2014 not just in conversation.");
            add("bill_of_sale", "also", "Optional. The state form is brief; ours adds warranty of title, as-is language, and lien disclosure. Use both, not one instead of the other.");
          } else if (st === "other") {
            add("bill_of_sale", "use", "Our notarised version, accepted in most states. Check first whether your state publishes its own form \u2014 if it does, that one takes priority and ours goes alongside it.");
            add("bos_plain", "also", "A shorter version with no notary block. Only if your state does not require notarisation \u2014 confirm before relying on it.");
          }
          if (documented !== "yes" && String(vessel?.trailerIncluded||"").toLowerCase() === "yes")
            add("trailer_bos", "also-need", "A trailer has its own title and transfers separately. Sign this as well as, not instead of, the above.");
          const answered = documented === "yes" || (documented === "no" && st && (st === "other" || (pw && (pw !== "outboard" || split))));
          const ask = (k, q, opts, cur) => (
            <div style={{ marginBottom:11 }}>
              <div style={{ fontSize:12.5, color:C.navy, fontWeight:700, marginBottom:6 }}>{q}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {opts.map(([v, label]) => (
                  <button key={v} onClick={()=>setBosQ(b => ({ ...b, [k]: v }))}
                    style={{ fontSize:12.5, padding:"9px 15px", borderRadius:18, cursor:"pointer", fontFamily:"sans-serif", fontWeight:700,
                      border:`1.5px solid ${cur===v ? "#2b6cb0" : C.mist}`,
                      background: cur===v ? "#2b6cb0" : "#fff",
                      color: cur===v ? "#fff" : C.slate, boxShadow: cur===v ? "0 1px 3px rgba(43,108,176,0.3)" : "none" }}>
                    {cur===v ? "\u2713 " : ""}{label}
                  </button>
                ))}
              </div>
            </div>
          );
          const ROLE = {
            use:      { label:"Sign this one",  bg:"#2b6cb0", tint:"#fff",     border:"2px solid #2b6cb0" },
            also:     { label:"Also works",     bg:"#0e6b7c", tint:"#f4fbfc",  border:"1px solid #bcdfe5" },
            "also-need": { label:"Also needed", bg:"#8a5a12", tint:"#fffaf0",  border:"1px solid #e3c98f" },
          };
          const steps = (documented ? 1 : 0) + (st ? 1 : 0) + (pw ? 1 : 0) + (split ? 1 : 0);
          const total = documented === "yes" ? 1 : st === "other" ? 2 : (pw === "outboard" ? 4 : 3);
          return (
            <div style={{ background:"linear-gradient(180deg,#f4f9ff 0%,#ffffff 100%)", border:"1.5px solid #4a90d9", borderRadius:9, padding:"14px 16px 13px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
                <span style={{ fontSize:17, lineHeight:1 }}>\ud83e\udded</span>
                <span style={{ flex:1, fontSize:13.5, fontWeight:800, color:C.navy }}>Which one do I need?</span>
                <span style={{ fontSize:10.5, color:C.slate, whiteSpace:"nowrap" }}>{Math.min(steps,total)} of {total}</span>
              </div>

              {ask("doc", "Is the vessel U.S. Coast Guard documented?", [["yes","Yes"],["no","No"],["unsure","Not sure"]], documented)}
              {documented !== "yes" && ask("state", "Which state will the buyer title it in?", [["fl","Florida"],["other","Another state"]], st)}
              {documented !== "yes" && st === "fl" && ask("power", "How is it powered?", [["outboard","Outboard motor(s)"],["inboard","Inboard or sterndrive"]], pw)}
              {documented !== "yes" && st === "fl" && pw === "outboard" && ask("split", "Price the hull and motors separately?", [["yes","Yes"],["no","No, one price"],["unsure","Not sure"]], split)}

              {answered && picks.length > 0 && (
                <div style={{ marginTop:6 }}>
                  <div style={{ fontSize:10, color:"#2b6cb0", letterSpacing:1.2, textTransform:"uppercase", fontWeight:800, marginBottom:7 }}>
                    For your sale &mdash; {picks.length} document{picks.length===1?"":"s"}
                  </div>
                  {picks.map(({ d, role, note }) => {
                    const r = ROLE[role];
                    return (
                      <div key={d.id} style={{ background:r.tint, border:r.border, borderRadius:8, padding:"11px 13px", marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                          <span style={{ fontSize:9.5, letterSpacing:0.8, textTransform:"uppercase", fontWeight:800, color:"#fff", background:r.bg, borderRadius:9, padding:"2px 8px" }}>{r.label}</span>
                          {signed[d.id] && <span style={{ fontSize:10.5, color:C.green, fontWeight:700 }}>\u2713 signed</span>}
                        </div>
                        <div style={{ fontFamily:"'Georgia',serif", fontSize:14.5, color:C.navy, lineHeight:1.3 }}>{d.title}</div>
                        <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.55, marginTop:4 }}>{note}</div>
                        <button onClick={()=>jumpToDoc(d.id)}
                          style={{ marginTop:9, background: role==="use" ? "#2b6cb0" : "transparent", color: role==="use" ? "#fff" : C.navy,
                            border: role==="use" ? "none" : `1px solid ${C.mist}`, borderRadius:16, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
                          Open it &rarr;
                        </button>
                      </div>
                    );
                  })}
                  <div style={{ fontSize:11, color:C.slate, lineHeight:1.55, marginTop:2 }}>
                    These are suggestions, not rules. Every version stays available below, and your county or state office has the final say.
                  </div>
                </div>
              )}
              <button onClick={()=>{ setBosQOpen(false); setBosQ({}); }}
                style={{ marginTop:12, background:"transparent", border:"none", color:C.slate, fontSize:11.5, textDecoration:"underline", cursor:"pointer", fontFamily:"sans-serif", padding:0 }}>Start over / close</button>
            </div>
          );
        })() : (
          <button onClick={()=>setBosQOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", background:"linear-gradient(180deg,#f4f9ff 0%,#eaf3fc 100%)", border:"1.5px solid #4a90d9", borderRadius:9, padding:"13px 15px", cursor:"pointer", fontFamily:"sans-serif" }}>
            <span style={{ fontSize:20, lineHeight:1 }}>\ud83e\udded</span>
            <span style={{ flex:1 }}>
              <span style={{ display:"block", fontSize:13.5, fontWeight:800, color:C.navy }}>Which one do I need?</span>
              <span style={{ display:"block", fontSize:11.5, color:C.slate, marginTop:2, lineHeight:1.5 }}>Three quick questions and we&rsquo;ll pick the right version for your sale &mdash; and tell you why.</span>
            </span>
            <span style={{ fontSize:12, fontWeight:800, color:"#2b6cb0", whiteSpace:"nowrap" }}>Start &rarr;</span>
          </button>
        ))}

        <div style={{ fontSize:10.5, fontFamily:"sans-serif", color:C.slate, letterSpacing:0.5, textTransform:"uppercase", margin:"18px 0 7px" }}>All versions</div>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {bosDocs.map(doc => {
            const done = !!signed[doc.id];
            const rowNotary = (doc.body||"").includes("Notary Acknowledgment") || (doc.body||"").includes("bc-notary-flag") || doc.id==="cg_1340";
            const isPrimary = doc.id === bosLeadId;
            return (
              <button key={doc.id} onClick={()=>jumpToDoc(doc.id)}
                style={{ display:"flex", alignItems:"center", gap:9, width:"100%", textAlign:"left", background:"transparent", border:"none", borderBottom:`1px solid ${bosSigned ? "#cfe6d8" : "#cfe0f5"}`, padding:"9px 2px", cursor:"pointer", fontFamily:"sans-serif" }}>
                <span style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, background: done ? C.green : "transparent", color: done ? "#fff" : C.slate, border: done ? "none" : `1.5px solid ${C.mist}` }}>{done ? "✓" : ""}</span>
                <span style={{ flex:1, fontSize:12.5, color:C.navy, fontWeight: done ? 400 : (isPrimary?700:600), textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1 }}>
                  {doc.title}
                  {isPrimary && <span style={{ fontSize:10, color:"#2b6cb0", fontWeight:700, marginLeft:6 }}>{OFFICIAL.has(doc.id) ? "· recommended — your state's own form" : "· standard"}</span>}
                  {!isPrimary && OFFICIAL.has(doc.id) && <span style={{ fontSize:10, color:C.teal, fontWeight:700, marginLeft:6 }}>· official form</span>}
                  {rowNotary && !done ? <span style={{ fontSize:10.5, color:"#8a6d1a", fontWeight:600 }}> · needs notary</span> : null}
                </span>
                <span style={{ fontSize:11, color: done ? C.green : "#2b6cb0", fontWeight:600, whiteSpace:"nowrap" }}>{done ? "Done" : "Open →"}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ── REQUIRED DOCUMENTS TRACKER ── */}
      <div style={{ border:`2px solid ${allRequiredSigned ? C.green : C.brass}`, borderRadius:8, padding:"13px 16px", marginBottom:22, background: allRequiredSigned ? C.greenLight : "#fff9ee" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:700, color:C.navy }}>
            {allRequiredSigned ? "✓ All required documents signed" : "Required documents to sign"}
          </div>
          <span style={{ fontSize:12, fontFamily:"sans-serif", fontWeight:700, color: allRequiredSigned ? C.green : C.brass }}>
            {requiredDocs.filter(d=>signed[d.id]).length} of {requiredDocs.length} signed
          </span>
        </div>
        <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, lineHeight:1.5 }}>
          The core documents a sale needs. Tap any one to open it. Documents that require a notary must be printed, notarized, and uploaded — the app can't verify notarization, so those are completed offline.
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {requiredDocs.map(doc => {
            const done = !!signed[doc.id];
            const rowNotary = (doc.body||"").includes("Notary Acknowledgment");
            return (
              <button key={doc.id} onClick={()=>jumpToDoc(doc.id)}
                style={{ display:"flex", alignItems:"center", gap:9, width:"100%", textAlign:"left", background:"transparent", border:"none", borderBottom:`1px solid ${allRequiredSigned ? "#cfe6d8" : "#f0e2c4"}`, padding:"8px 2px", cursor:"pointer", fontFamily:"sans-serif" }}>
                <span style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, background: done ? C.green : "transparent", color: done ? "#fff" : C.slate, border: done ? "none" : `1.5px solid ${C.mist}` }}>{done ? "✓" : ""}</span>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontSize:12.5, color:C.navy, fontWeight: done ? 400 : 600, textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1 }}>{doc.title}{rowNotary && !done ? <span style={{ fontSize:10.5, color:"#8a6d1a", fontWeight:600 }}> · needs notary</span> : null}</span>
                  {doc.addedWhy && <span style={{ fontSize:10.5, color:C.slate, display:"block", marginTop:1, fontFamily:"sans-serif" }}>added because of: {doc.addedWhy}</span>}
                </span>
                <span style={{ fontSize:11, color: done ? C.green : C.brass, fontWeight:600, whiteSpace:"nowrap" }}>{done ? "Done" : rowNotary ? "Notarize offline" : "Sign →"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {GROUPS.map(g=>{
        const groupDocs = DOC_SET.filter(d=>d.group===g);
        const groupSigned = groupDocs.filter(d=>signed[d.id]).length;
        const hasRequired = groupDocs.some(d=>d.required);
        const open = openGroups[g];
        return (<React.Fragment key={g}>
        <div style={{ marginBottom:10 }}>
          <button onClick={()=>toggleGroup(g)} style={{ display:"flex", width:"100%", alignItems:"flex-start", gap:12, textAlign:"left", cursor:"pointer", background: open ? C.white : "#faf7f0", border:`1px solid ${hasRequired ? C.brass : C.mist}`, borderRadius: open ? "8px 8px 0 0" : 8, padding:"13px 16px" }}>
            <span style={{ fontSize:14, color:C.slate, marginTop:1, flexShrink:0, transform: open?"rotate(90deg)":"none", transition:"transform .15s" }}>▶</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:13.5, fontFamily:"sans-serif", fontWeight:700, color:C.navy }}>{g}</span>
                <span style={{ fontSize:10, fontFamily:"sans-serif", fontWeight:700, color:C.slate, background:C.sandDark, borderRadius:20, padding:"2px 8px" }}>{groupDocs.length} doc{groupDocs.length>1?"s":""}</span>
                {hasRequired && <span style={{ fontSize:10, fontFamily:"sans-serif", fontWeight:700, color:"#7a5500", background:"#fff3cd", borderRadius:20, padding:"2px 8px" }}>Required</span>}
                {groupSigned>0 && <span style={{ fontSize:10, fontFamily:"sans-serif", fontWeight:700, color:C.green, background:C.greenLight, borderRadius:20, padding:"2px 8px" }}>{groupSigned} signed ✓</span>}
              </div>
              <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, marginTop:4, lineHeight:1.55 }}>{GROUP_DESC[g]}</div>
              {!open && <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.brass, marginTop:5, fontWeight:600 }}>Tap to open →</div>}
            </div>
          </button>
          {open && (
          <div style={{ ...S.card, borderRadius:"0 0 8px 8px", borderTop:"none", marginBottom:0 }}>
            {DOC_SET.filter(d=>d.group===g).map((doc,i,arr)=>{
              const needsNotary = doc.kind !== "upload" && (doc.body||"").includes("Notary Acknowledgment");
              return (
              <div key={doc.id} id={"bcdoc-"+doc.id}>
                {activeDoc!==doc.id ? (
                  <button onClick={()=>openDoc(doc.id)} className="bc-docrow" style={{ width:"100%", textAlign:"left", background:"transparent", border:"none", borderRadius:6, padding:"11px 4px", cursor:"pointer", fontFamily:"sans-serif" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                      <div style={{ width:28, height:28, borderRadius:5, flexShrink:0, background: signed[doc.id] ? C.greenLight : C.sandDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{signed[doc.id] ? (signed[doc.id].uploaded ? "📎" : signed[doc.id].manual ? "✍️" : "✅") : "📄"}</div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:12.5, fontWeight:600, color:C.navy }}>{doc.title}</div>
                        <div style={{ display:"flex", gap:5, marginTop:2, flexWrap:"wrap" }}>
                          {doc.required && <span style={{...S.tag, background:"#fff3cd", color:"#7a5500"}}>Required</span>}
                          {needsNotary && <span style={{...S.tag, background:"#fbf4e3", color:"#8a6d1a"}}>Notary</span>}
                          {signed[doc.id] && <span style={{...S.tag, background:C.greenLight, color:C.green}}>✓ Signed</span>}
                          {sentLog[doc.id]?.length > 0 && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>Sent</span>}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize:11.5, color:C.brass, fontWeight:700, whiteSpace:"nowrap" }}>Open →</span>
                  </button>
                ) : (
                <div style={{ background:"#fcfaf4", borderRadius:8, border:`1px solid ${C.mist}`, padding:"12px 14px" }}>
                  <button onClick={()=>setActiveDoc(null)} style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.slate, background:"none", border:"none", cursor:"pointer", padding:"0 0 10px", fontWeight:700 }}>← Back to documents</button>
                  <div className="bc-docrow">
                    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                      <div style={{ width:30, height:30, borderRadius:5, flexShrink:0, background: signed[doc.id] ? C.greenLight : C.sandDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                        {signed[doc.id] ? (signed[doc.id].uploaded ? "📎" : signed[doc.id].manual ? "✍️" : "✅") : "📄"}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:600, color:C.navy }}>{doc.title}</div>
                        {doc.desc && <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:1, lineHeight:1.4 }}>{doc.desc}</div>}
                        <div style={{ display:"flex", gap:5, marginTop:2, flexWrap:"wrap" }}>
                          {doc.required && <span style={{...S.tag, background:"#fff3cd", color:"#7a5500"}}>Required</span>}
                          {!doc.required && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>Optional</span>}
                          {needsNotary && <span style={{...S.tag, background:"#fbf4e3", color:"#8a6d1a"}}>Notary required</span>}
                          {(doc.checklist || getDocHtml(doc).includes("bc-fill-in")) && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>{doc.editRole ? `Fill in app · ${doc.editRole} only` : "Fill in app"}</span>}
                          {signed[doc.id] && <span style={{...S.tag, background:C.greenLight, color:C.green}}>✓ {signed[doc.id].date} · {signed[doc.id].name}</span>}
                          {sentLog[doc.id]?.length > 0 && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>Sent ×{sentLog[doc.id].length}</span>}
                          {uploadedFile[doc.id] && !signed[doc.id]?.uploaded && <span style={{...S.tag}}>📎 {uploadedFile[doc.id]}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="bc-docbtns">
                      <ActionBtn docId={doc.id} action="view"   icon="👁" label="View"   />
                      {canEditDoc(doc) && (getBlanks(doc).length > 0 || !!doc.checklist) && <ActionBtn docId={doc.id} action="fill" icon="✏️" label="Fill In" color={C.brass} />}
                      {!frozen && doc.kind !== "upload" && !needsNotary && !doc.viewOnly && <ActionBtn docId={doc.id} action="esign"  icon="✏️" label="E-Sign" color={C.green} />}
                      {!frozen && doc.kind !== "upload" && !doc.viewOnly && <ActionBtn docId={doc.id} action="manual" icon="✍️" label="Manual" color={C.teal} />}
                      <ActionBtn docId={doc.id} action="send"   icon="📤" label="Send"   color={C.brass} />
                      {!frozen && !doc.viewOnly && <ActionBtn docId={doc.id} action="upload" icon="📎" label="Upload" color={C.slate} />}
                      <button onClick={()=>printDoc(doc.id, doc.title)} title="Print" style={{ fontSize:13, padding:"7px 11px", borderRadius:20, cursor:"pointer", border:`1.5px solid #e3ddd0`, background:C.white, color:C.slate }}>🖨️</button>
                    </div>
                  </div>

                  {/* VIEW — filled-in polished document, or upload-slot guide */}
                  {docAction[doc.id]==="view" && (
                    <div style={{ marginTop:12 }}>
                      {doc.kind === "upload" ? (
                        <div style={{ textAlign:"center", padding:"26px 22px", border:`2px dashed ${C.mist}`, borderRadius:8, background:"#fcfaf4" }}>
                          <div style={{ fontSize:32 }}>{doc.icon}</div>
                          <div style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:C.navy, margin:"8px 0 4px" }}>{doc.title}</div>
                          <div style={{ display:"inline-block", fontSize:10, fontFamily:"sans-serif", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:C.teal, background:C.tealLight, padding:"3px 10px", borderRadius:20, marginBottom:12 }}>{doc.issued}</div>
                          <div style={{ fontSize:13, fontFamily:"sans-serif", color:C.text, lineHeight:1.7, maxWidth:460, margin:"0 auto 14px", textAlign:"left" }} dangerouslySetInnerHTML={{ __html: doc.guide }} />
                          {(() => {
                            const up = negotiate?.uploads?.[doc.id];
                            const localUrl = uploadedData[doc.id]?.dataURL;
                            const name = uploadedFile[doc.id] || up?.name;
                            const viewUrl = localUrl || up?.url;
                            const has = !!(uploadedFile[doc.id] || up);
                            if (uploading[doc.id] && !up) return <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.navy, fontWeight:600 }}>Saving file…</div>;
                            return has ? (
                              <div>
                                <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green }}>✓ Uploaded: <strong>{name}</strong></div>
                                {viewUrl && (
                                  <div style={{ marginTop:10, display:"flex", gap:12, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
                                    <a href={viewUrl} target="_blank" rel="noopener noreferrer" download={name} style={{ fontSize:12, fontFamily:"sans-serif", fontWeight:700, color:C.navy, textDecoration:"underline" }}>⬇ View / download</a>
                                    <label style={{ fontSize:12, fontFamily:"sans-serif", fontWeight:700, color:C.slate, cursor:"pointer", textDecoration:"underline" }}>
                                      ↻ Replace file
                                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) handleUpload(doc.id, e.target.files[0]); }}/>
                                    </label>
                                  </div>
                                )}
                                <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:8 }}>{up ? "Stored on the deal — both parties can see it." : "Saved on your screen."} To email a copy, use the <strong>Send</strong> button.</div>
                              </div>
                            ) : (
                              <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:6, padding:"10px 22px", fontSize:13, fontFamily:"sans-serif", fontWeight:700 }}>
                                📎 Upload {doc.tab}
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) handleUpload(doc.id, e.target.files[0]); }}/>
                              </label>
                            );
                          })()}
                          {uploadErr[doc.id] && <div style={{ color:C.red, fontSize:11.5, fontFamily:"sans-serif", fontWeight:600, marginTop:10 }}>⚠️ {uploadErr[doc.id]}</div>}
                          <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginTop:10 }}>Accepted: {doc.accept}</div>
                        </div>
                      ) : (
                        <div className="bc-doc-paper" id={"bc-print-"+doc.id}>
                          <div className="bc-doc-eyebrow">{doc.eyebrow}</div>
                          <div className="bc-doc-title">{doc.title}</div>
                          <div className="bc-doc-ref">Ref {deal.dealRef} · {deal.vesselYear} {deal.vesselMake} {deal.vesselModel}</div>
                          {doc.externalUrl && (
                            <div style={{ textAlign:"center", margin:"10px 0 4px" }}>
                              <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", background:C.navy, color:"#fff", textDecoration:"none", borderRadius:7, padding:"10px 18px", fontSize:13, fontWeight:800, fontFamily:"sans-serif" }}>↗ Open &amp; fill in the official form{doc.tab ? ` \u2014 ${doc.tab.replace(/^FL Official /,"").replace(/^USCG /,"")}` : ""}</a>
                              <div style={{ fontSize:11, color:C.slate, marginTop:6, fontFamily:"sans-serif" }}>Opens the agency&rsquo;s own fillable form in a new tab. Type into it there, print, and sign.</div>
                            </div>
                          )}
                          <div className="bc-doc-rule"></div>
                          {needsNotary && (
                            <div className="bc-notary-flag">
                              ⚖ <strong>Must be notarized.</strong> A typed e-signature can't be notarized. Print this, sign it in front of a notary, then come back and mark it done below (optionally uploading the notarized copy as proof).
                              {!signed[doc.id] ? (
                                <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                                  <button onClick={()=>setSigned(sg=>({ ...sg, [doc.id]: { name:"Completed offline (notarized)", date:today(), at:signedStamp().at, when:signedStamp().when, manual:true, notarizedOffline:true } }))} style={{ background:"#8a6d1a", color:"#fff", border:"none", borderRadius:6, padding:"9px 14px", fontSize:12, fontWeight:800, fontFamily:"sans-serif", cursor:"pointer" }}>✓ I've had this notarized — mark it done</button>
                                  <label style={{ background:"#fff", color:"#8a6d1a", border:"1px solid #8a6d1a", borderRadius:6, padding:"9px 14px", fontSize:12, fontWeight:800, fontFamily:"sans-serif", cursor:"pointer" }}>
                                    📎 Upload notarized copy (optional)
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) handleUpload(doc.id, e.target.files[0]); }}/>
                                  </label>
                                </div>
                              ) : (
                                <div style={{ marginTop:10, fontSize:12, fontWeight:800, color:"#0f6e56", fontFamily:"sans-serif" }}>✓ {signed[doc.id].uploaded ? "Notarized copy uploaded" : "Marked notarized (completed offline)"} — {signed[doc.id].when || signed[doc.id].date}
                                  <button onClick={()=>setSigned(sg=>{ const c={...sg}; delete c[doc.id]; return c; })} style={{ marginLeft:10, background:"none", border:"none", color:C.slate, fontSize:11, textDecoration:"underline", cursor:"pointer", fontWeight:400 }}>undo</button>
                                </div>
                              )}
                            </div>
                          )}
                          {(() => {
                            const filledHtml = stampSignatures(getDocHtml(doc), doc.id);
                            const editable = canEditDoc(doc);
                            const interactive = !!doc.checklist || filledHtml.includes("bc-fill-in");
                            return (
                              <>
                                {interactive ? (editable ? (
                                  <div className="bc-fill-hint">✏️ <strong>This document has blanks to complete — tap “Fill In” above.</strong> Everything else comes straight from your <strong>Vessel</strong>, <strong>Parties</strong>, and agreed <strong>Terms</strong> and is locked, so it can never disagree with your deal. If any of that looks wrong, fix it at the source and every document updates.</div>
                                ) : (
                                  <div className="bc-lock-note">🔒 Only the {doc.editRole} fills this one in here. You can still view it, print it, and upload a signed copy.</div>
                                )) : (
                                  <div className="bc-lock-note">🔒 <strong>Nothing to fill in on this one.</strong> It builds itself from your deal, and the signature and notary lines are left blank on purpose — those get completed at signing.</div>
                                )}
                                <DocPaper
                                  doc={doc}
                                  html={filledHtml}
                                  editable={editable}
                                  checkState={checkState}
                                  toggleCheck={toggleCheck}
                                  savedFields={fieldState[doc.id]||{}}
                                  onField={(fk,val)=>setField(doc.id, fk, val)}
                                />
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* FILL IN — plain form boxes, one per blank. Nothing from the
                      deal itself appears here, so vessel & parties stay locked. */}
                  {docAction[doc.id]==="fill" && (
                    <FillInForm
                      key={doc.id}
                      doc={doc}
                      blanks={getBlanks(doc)}
                      initial={fieldState[doc.id] || {}}
                      C={C}
                      onKeep={(fk, v) => keepField(doc.id, fk, v)}
                      onSave={(draft) => saveFields(doc.id, draft)}
                      onCancel={() => setDocAction(d => ({ ...d, [doc.id]: "view" }))}
                    />
                  )}

                  {/* E-SIGN */}
                  {docAction[doc.id]==="esign" && (
                    <div style={{ marginTop:12, background:C.greenLight, border:`1px solid #a8d8b8`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.green, marginBottom:10 }}>✏️ Electronic Signature — {doc.title}</div>
                      <div style={{ background:C.navy, borderRadius:4, padding:"9px 12px", fontSize:11, fontFamily:"sans-serif", color:"rgba(255,255,255,0.85)", marginBottom:12, lineHeight:1.6 }}>
                        ⚠️ <strong style={{ color:C.brass }}>Preview only — not legally binding until BoatClosers receives payment.</strong> Upon payment confirmation, the executed package is released to both parties. BoatClosers provides document facilitation only — not legal advice or brokerage services.
                      </div>
                      {!signed[doc.id] || signed[doc.id].manual || signed[doc.id].uploaded ? (
                        <>
                          {/* E-Sign consent & disclosure */}
                          <div style={{ background:"#fffdf8", border:`1px solid ${C.mist}`, borderRadius:5, padding:"11px 13px", marginBottom:12 }}>
                            <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, lineHeight:1.65 }}>
                              <strong style={{ color:C.navy }}>Before you sign electronically, please understand:</strong>
                              <ul style={{ margin:"6px 0 0", paddingLeft:18 }}>
                                <li style={{ marginBottom:4 }}>By typing your name and signing, you agree to conduct this transaction electronically and that your electronic signature is intended to be your legal signature on this document.</li>
                                <li style={{ marginBottom:4 }}>BoatClosers is a document-preparation tool only. It does <strong>not</strong> verify the identity of any signer, does not guarantee the legal validity or enforceability of any signature, and is not responsible for record-keeping, storage, or authentication of signed documents.</li>
                                <li style={{ marginBottom:4 }}>You are responsible for keeping your own signed copies. If you need a verifiable, court-defensible signature, use a dedicated e-signature service or sign in ink before a notary.</li>
                                <li style={{ marginBottom:0 }}><strong>Not comfortable signing electronically?</strong> Use the <strong>Manual</strong> option to record an in-person ink signature, or <strong>Print</strong> the document to sign by hand. Notarized documents must always be printed and signed in ink before a notary.</li>
                              </ul>
                            </div>
                            <label style={{ display:"flex", gap:9, alignItems:"flex-start", cursor:"pointer", marginTop:10 }}>
                              <input type="checkbox" checked={!!esignConsent[doc.id]} onChange={e=>setEsignConsent(c=>({...c,[doc.id]:e.target.checked}))} style={{ width:15, height:15, marginTop:1, accentColor:C.green, flexShrink:0 }} />
                              <span style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.navy, fontWeight:600, lineHeight:1.5 }}>I have read the above, I consent to sign electronically, and I understand BoatClosers does not verify or store my signature.</span>
                            </label>
                          </div>
                          {(() => {
                            const myName = myRole === "seller" ? parties.seller?.name : parties.buyer?.name;
                            const typed = (sigName[doc.id]||"").trim();
                            const nameOk = sigMatchesName(typed, myName);
                            const canSign = !!typed && !!esignConsent[doc.id] && nameOk;
                            return (
                              <>
                                <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                                  <div style={{ flex:1 }}>
                                    <label style={S.label}>Type your full legal name to sign electronically</label>
                                    <input style={S.input} placeholder="Full legal name" value={sigName[doc.id]||""} onChange={e=>setSigName(s=>({...s,[doc.id]:e.target.value}))}/>
                                  </div>
                                  <button style={{...S.btnBrass, opacity:canSign?1:0.45, cursor:canSign?"pointer":"not-allowed"}} disabled={!canSign} onClick={()=>{ if(!sigMatchesName((sigName[doc.id]||"").trim(), myName)) return; const st=signedStamp(); setSigned(s=>({...s,[doc.id]:{name:sigName[doc.id],date:today(),at:st.at,when:st.when,consent:true,role:myRole}})); setAction(doc.id,"esign"); }}>Sign Document</button>
                                </div>
                                {myName && typed && !nameOk && (
                                  <div style={{ fontSize:11.5, color:C.red, fontFamily:"sans-serif", fontWeight:700, marginTop:6, lineHeight:1.5 }}>Your signature must match your name on this deal: <b>{myName}</b>. To change it, update your name in the Parties step.</div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green }}>✓ Already signed by {signed[doc.id].name} on {signed[doc.id].when || signed[doc.id].date}</div>
                      )}
                    </div>
                  )}

                  {/* MANUAL */}
                  {docAction[doc.id]==="manual" && (
                    <div style={{ marginTop:12, background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.teal, marginBottom:8 }}>✍️ Record Manual / Wet Ink Signatures</div>
                      <p style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12, lineHeight:1.6 }}>
                        Print the document, have both parties sign by hand, then record the signed names here to mark it complete. Retain the original for your records.
                      </p>
                      {!manualSig[doc.id] ? (
                        <>
                          <Grid2>
                            <Field label="Buyer signed name"><input style={S.input} placeholder="Buyer's name as signed" value={manualFields[doc.id]?.buyer||""} onChange={e=>setManualFields(f=>({...f,[doc.id]:{...f[doc.id],buyer:e.target.value}}))}/></Field>
                            <Field label="Seller signed name"><input style={S.input} placeholder="Seller's name as signed" value={manualFields[doc.id]?.seller||""} onChange={e=>setManualFields(f=>({...f,[doc.id]:{...f[doc.id],seller:e.target.value}}))}/></Field>
                          </Grid2>
                          <button style={S.btnTeal} disabled={!manualFields[doc.id]?.buyer?.trim()||!manualFields[doc.id]?.seller?.trim()} onClick={()=>{ confirmManualSig(doc.id); setAction(doc.id,"manual"); }}>✓ Confirm Both Parties Signed</button>
                        </>
                      ) : (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.teal }}>✓ Manual signatures recorded — Buyer: {manualSig[doc.id].buyer} · Seller: {manualSig[doc.id].seller} · {manualSig[doc.id].date}</div>
                      )}
                    </div>
                  )}

                  {/* SEND */}
                  {docAction[doc.id]==="send" && (
                    <div style={{ marginTop:12, background:"#fff9ee", border:`1px solid ${C.brass}`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.brass, marginBottom:8 }}>📤 Send Document by Email</div>
                      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                        {[parties.buyer.email, parties.seller.email].filter(Boolean).map(e=>(
                          <button key={e} onClick={()=>setSendEmail(s=>({...s,[doc.id]:e}))} style={{ fontSize:11, fontFamily:"sans-serif", padding:"4px 10px", borderRadius:16, border:`1px solid ${C.brass}`, background:"transparent", color:C.brass, cursor:"pointer" }}>{e}</button>
                        ))}
                        <span style={{ fontSize:10, fontFamily:"sans-serif", color:C.slate, alignSelf:"center" }}>or type below</span>
                      </div>
                      <Grid2>
                        <Field label="Recipient email"><input style={S.input} type="email" placeholder="recipient@email.com" value={sendEmail[doc.id]||""} onChange={e=>setSendEmail(s=>({...s,[doc.id]:e.target.value}))}/></Field>
                        <Field label="Optional note"><input style={S.input} placeholder="Please review and sign…" value={sendNote[doc.id]||""} onChange={e=>setSendNote(n=>({...n,[doc.id]:e.target.value}))}/></Field>
                      </Grid2>
                      <button style={S.btnBrass} disabled={!sendEmail[doc.id]?.trim() || sending[doc.id]} onClick={()=>{ sendDoc(doc.id, doc.title); }}>{sending[doc.id] ? "Sending…" : "Send Document →"}</button>
                      {sendErr[doc.id] && <div style={{ color:C.red, fontSize:12, marginTop:8, fontFamily:"sans-serif", fontWeight:600 }}>⚠️ {sendErr[doc.id]}</div>}
                      {sentLog[doc.id]?.length > 0 && (
                        <div style={{ marginTop:10, fontSize:11, fontFamily:"sans-serif", color:C.slate }}>
                          <strong>Sent log:</strong>
                          {sentLog[doc.id].map((s,i)=>(<div key={i}>→ {s.to} at {s.time}{s.note ? ` — "${s.note}"` : ""}</div>))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* UPLOAD */}
                  {docAction[doc.id]==="upload" && (
                    <div style={{ marginTop:12, background:C.sandDark, border:`1px solid ${C.mist}`, borderRadius:6, padding:"14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:"sans-serif", color:C.slate, marginBottom:8 }}>📎 Upload Signed Document</div>
                      <p style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:12, lineHeight:1.6 }}>
                        If signed outside the platform (wet ink, notary, attorney, DocuSign), upload the signed PDF here to attach it to your deal file.
                      </p>
                      {!uploadedFile[doc.id] ? (
                        <label style={{ display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer", background:C.navy, color:"#fff", borderRadius:5, padding:"9px 18px", fontSize:12, fontFamily:"sans-serif", fontWeight:600 }}>
                          <span>📎</span> Choose File to Upload
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) handleUpload(doc.id, e.target.files[0]); setAction(doc.id,"upload"); }}/>
                        </label>
                      ) : (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green }}>
                          ✓ Uploaded: <strong>{uploadedFile[doc.id]}</strong> — attached on {today()}
                          <button onClick={()=>{ setUploadedFile(u=>({...u,[doc.id]:null})); setSigned(s=>{const n={...s}; delete n[doc.id]; return n;}); }} style={{ marginLeft:12, fontSize:11, fontFamily:"sans-serif", background:"none", border:`1px solid ${C.mist}`, borderRadius:4, padding:"2px 8px", cursor:"pointer", color:C.slate }}>Replace</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}
                {i<arr.length-1 && <hr style={{...S.divider, margin:0}}/>}
              </div>
            );})}
          </div>
          )}
        </div>
        {g === "Closing Instruments" && <FindDocument C={C} DOC_SET={DOC_SET} onOpenDoc={jumpToDoc} signed={signed} />}
        </React.Fragment>
        );
      })}

      <div style={{ marginTop:"1.5rem" }}>
        {!allRequiredSigned && (
          <div style={{ border:`1.5px solid ${C.brass}`, background:"#fff9ee", borderRadius:8, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:700, color:"#7a5500", marginBottom:6 }}>⚠️ A few documents still need finishing before this sale is truly closed</div>
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom:10 }}>
              Still outstanding: {[...(!bosSigned ? ["a Bill of Sale (choose one in the Bill of Sale box above)"] : []), ...reqMissing.map(d=>d.title)].join(", ")}.
              {reqNotaryMissing.length > 0 && <> Note that <b>{reqNotaryMissing.map(d=>d.title).join(", ")}</b> must be printed, signed in front of a notary, and uploaded. <b>BoatClosers can't verify notarization</b> — completing that correctly is your responsibility.</>}
            </div>
            <label style={{ display:"flex", gap:9, alignItems:"flex-start", cursor:"pointer", fontSize:12, fontFamily:"sans-serif", color:C.navy, lineHeight:1.5 }}>
              <input type="checkbox" checked={closeAck} onChange={e=>setCloseAck(e.target.checked)} style={{ marginTop:1, accentColor:C.brass, flexShrink:0 }} />
              I understand these documents still need to be completed{reqNotaryMissing.length>0?" and notarized":""} outside the app, that BoatClosers does not verify or notarize them, and I'm choosing to proceed.
            </label>
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <button style={S.btnOutline} onClick={onBack}>← Back</button>
          <button style={{...S.btnBrass, opacity:(allRequiredSigned||closeAck)?1:0.45, cursor:(allRequiredSigned||closeAck)?"pointer":"not-allowed"}} disabled={!allRequiredSigned && !closeAck} onClick={()=>{setData(d=>({...d,signedDocs:signed}));onNext();}}>
            {allRequiredSigned ? "Proceed to Closing →" : "Proceed to Closing anyway →"}
          </button>
        </div>
      </div>
    </div>
  );
}
