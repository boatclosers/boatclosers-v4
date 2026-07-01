'use client'

// ═══════════════════════════════════════════════════════════════════════════
// BOATCLOSERS — DOCUMENTS STEP (v2)
// src/components/DocumentsStepV2.jsx
//
// Reworked Documents step that reads the polished closing set from documents.js.
// Self-contained: add this file, then in BoatClosersApp.jsx import it and use it
// in place of <StepDocuments ...> on the step===4 line. Nothing else changes.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";
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

// Renders a filled document. Checkbox lists (doc.checklist) and "____" blanks
// become interactive in-app when `editable` is true; otherwise read-only.
function DocPaper({ doc, html, editable, checkState, toggleCheck, savedFields, onField }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const blanks = root.querySelectorAll(".bc-fill-in");
    const handlers = [];
    blanks.forEach((el) => {
      const fk = el.getAttribute("data-fk");
      const saved = savedFields[fk];
      if (editable) {
        el.setAttribute("contenteditable", "true");
        el.classList.add("editable");
        el.textContent = (saved != null && saved !== "") ? saved : "";
        const onBlur = () => onField(fk, (el.textContent || "").trim());
        el.addEventListener("blur", onBlur);
        handlers.push([el, onBlur]);
      } else {
        el.textContent = (saved != null && saved !== "") ? saved : "________";
      }
    });
    return () => handlers.forEach(([el, h]) => el.removeEventListener("blur", h));
  }, [html, editable]); // eslint-disable-line

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
  };
  const [signed, setSigned] = useState({ ..._paPrefill, ...(data.signedDocs||{}) });
  const [sigName, setSigName] = useState({});

  const [docAction, setDocAction] = useState({});
  const [activeDoc, setActiveDoc] = useState(null); // the one document currently opened for work
  // Collapsible groups — required group open by default, the rest collapsed.
  const [openGroups, setOpenGroups] = useState({ "Closing Instruments": true });
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
  const [checkState, setCheckState] = useState(data.docChecks || {}); // docId -> { itemIndex: true }
  const [fieldState, setFieldState] = useState(data.docFields || {}); // docId -> { fieldKey: text }
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

  const toggleCheck = (docId, idx) => setCheckState(s => {
    const next = { ...s, [docId]: { ...(s[docId]||{}), [idx]: !(s[docId]||{})[idx] } };
    setData(d => ({ ...d, docChecks: next }));
    return next;
  });
  const setField = (docId, key, val) => setFieldState(s => {
    const next = { ...s, [docId]: { ...(s[docId]||{}), [key]: val } };
    setData(d => ({ ...d, docFields: next }));
    return next;
  });
  // A document can be locked to one role with editRole. Only that role fills it
  // in-app; the other party prints/uploads instead.
  const canEditDoc = (doc) => !doc.editRole || doc.editRole === myRole;
  // Turn the "____" blanks in a document (outside the signature block) into
  // fillable spans the right party can type into.
  const prepHtml = (rawHtml, docId) => {
    const sigAt = rawHtml.indexOf('<div class="sig"');
    const head = sigAt >= 0 ? rawHtml.slice(0, sigAt) : rawHtml;
    const tail = sigAt >= 0 ? rawHtml.slice(sigAt) : "";
    let n = 0;
    const head2 = head.replace(/_{4,}/g, () => `<span class="bc-fill-in" data-fk="${docId}:${n++}">________</span>`);
    return head2 + tail;
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
  const BLANK = "____________________";
  const engineParts = `${vessel.engineMake||""} ${vessel.engineModel||""}`.trim();
  const deal = {
    dealRef: data.dealRef || ("BC-" + String(Date.now()).slice(-5)),
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
    .map(d => { const mid = ID_MAP[d.id]||d.id; return { ...d, id: mid, required: REQUIRED.has(mid) || (mid==="renegotiation" && hasAddendum) }; });
  const GROUPS = [...new Set(DOC_SET.map(d=>d.group))];

  const requiredDocs = DOC_SET.filter(d => d.required);
  const allRequiredSigned = requiredDocs.every(d => signed[d.id]);
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
  const sendDoc = async (docId, docName) => {
    const to = sendEmail[docId]?.trim(); if (!to) return;
    setSendErr(e => ({ ...e, [docId]: "" }));
    setSending(s => ({ ...s, [docId]: true }));
    try {
      const att = uploadedData[docId];
      const attachment = att?.dataURL ? { filename: att.name, content: String(att.dataURL).split(",")[1] || "" } : null;
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
  const printDoc = (docId, title) => {
    const node = docId != null ? document.getElementById("bc-print-" + docId) : null;
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
.bc-fill-in.editable{display:inline-block;min-width:90px;border-bottom:1.5px solid ${C.brass};padding:0 5px;outline:none;color:${C.navy};font-weight:600;line-height:1.7}
.bc-fill-in.editable:focus{background:#fffaf0}
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
          <p style={{ fontSize:13, fontFamily:"sans-serif", color:C.slate }}>{signedCount} of {DOC_SET.length} complete · {requiredDocs.filter(d=>signed[d.id]).length}/{requiredDocs.length} required</p>
        </div>
        <span style={{...S.pill, background:C.greenLight, color:C.green}}>Paid ✓</span>
      </div>

      <div style={{ background:C.tealLight, border:`1px solid ${C.teal}`, borderRadius:6, padding:"10px 14px", marginBottom:16, fontSize:11, fontFamily:"sans-serif", color:C.teal, lineHeight:1.8 }}>
        <strong>Each document has five options:</strong> &nbsp;
        ✏️ <strong>E-Sign</strong> — type your name to sign in-app &nbsp;·&nbsp;
        ✍️ <strong>Manual Sign</strong> — record wet ink signatures &nbsp;·&nbsp;
        📤 <strong>Send</strong> — email the document &nbsp;·&nbsp;
        📎 <strong>Upload</strong> — attach a signed PDF &nbsp;·&nbsp;
        🖨️ <strong>Print</strong> — open print dialog
      </div>

      <div style={{ height:5, background:C.mist, borderRadius:3, marginBottom:20, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(signedCount/DOC_SET.length)*100}%`, background:C.green, borderRadius:3, transition:"width 0.4s" }}/>
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
                <span style={{ flex:1, fontSize:12.5, color:C.navy, fontWeight: done ? 400 : 600, textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1 }}>{doc.title}{rowNotary && !done ? <span style={{ fontSize:10.5, color:"#8a6d1a", fontWeight:600 }}> · needs notary</span> : null}</span>
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
        return (
        <div key={g} style={{ marginBottom:10 }}>
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
                          {(doc.checklist || prepHtml(fillDocument(doc, deal), doc.id).includes("bc-fill-in")) && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>{doc.editRole ? `Fill in app · ${doc.editRole} only` : "Fill in app"}</span>}
                          {signed[doc.id] && <span style={{...S.tag, background:C.greenLight, color:C.green}}>✓ {signed[doc.id].date} · {signed[doc.id].name}</span>}
                          {sentLog[doc.id]?.length > 0 && <span style={{...S.tag, background:C.tealLight, color:C.teal}}>Sent ×{sentLog[doc.id].length}</span>}
                          {uploadedFile[doc.id] && !signed[doc.id]?.uploaded && <span style={{...S.tag}}>📎 {uploadedFile[doc.id]}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="bc-docbtns">
                      <ActionBtn docId={doc.id} action="view"   icon="👁" label="View"   />
                      {doc.kind !== "upload" && !needsNotary && !doc.viewOnly && <ActionBtn docId={doc.id} action="esign"  icon="✏️" label="E-Sign" color={C.green} />}
                      {doc.kind !== "upload" && !doc.viewOnly && <ActionBtn docId={doc.id} action="manual" icon="✍️" label="Manual" color={C.teal} />}
                      <ActionBtn docId={doc.id} action="send"   icon="📤" label="Send"   color={C.brass} />
                      {!doc.viewOnly && <ActionBtn docId={doc.id} action="upload" icon="📎" label="Upload" color={C.slate} />}
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
                          <div className="bc-doc-rule"></div>
                          {needsNotary && (
                            <div className="bc-notary-flag">
                              ⚖ <strong>Must be notarized.</strong> A typed e-signature can't be notarized. Print this, sign it in front of a notary, then upload the notarized copy. Use <em>Manual</em> to record the signed names.
                            </div>
                          )}
                          {(() => {
                            const filledHtml = prepHtml(fillDocument(doc, deal), doc.id);
                            const editable = canEditDoc(doc);
                            const interactive = !!doc.checklist || filledHtml.includes("bc-fill-in");
                            return (
                              <>
                                {interactive && (editable ? (
                                  <div className="bc-fill-hint">✏️ Tap the boxes and blank lines to fill this in right here, then print or send it — no need to print and scan.</div>
                                ) : (
                                  <div className="bc-lock-note">🔒 Only the {doc.editRole} fills this one in here. If you need to change it, print it and upload a signed copy.</div>
                                ))}
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
                          <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                            <div style={{ flex:1 }}>
                              <label style={S.label}>Type your full legal name to sign electronically</label>
                              <input style={S.input} placeholder="Full legal name" value={sigName[doc.id]||""} onChange={e=>setSigName(s=>({...s,[doc.id]:e.target.value}))}/>
                            </div>
                            <button style={{...S.btnBrass, opacity:(sigName[doc.id]?.trim() && esignConsent[doc.id])?1:0.45, cursor:(sigName[doc.id]?.trim() && esignConsent[doc.id])?"pointer":"not-allowed"}} disabled={!sigName[doc.id]?.trim() || !esignConsent[doc.id]} onClick={()=>{ setSigned(s=>({...s,[doc.id]:{name:sigName[doc.id],date:today(),consent:true}})); setAction(doc.id,"esign"); }}>Sign Document</button>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.green }}>✓ Already signed by {signed[doc.id].name} on {signed[doc.id].date}</div>
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
        );
      })}

      <div style={{ marginTop:"1.5rem" }}>
        {!allRequiredSigned && (
          <div style={{ border:`1.5px solid ${C.brass}`, background:"#fff9ee", borderRadius:8, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontFamily:"sans-serif", fontWeight:700, color:"#7a5500", marginBottom:6 }}>⚠️ A few documents still need finishing before this sale is truly closed</div>
            <div style={{ fontSize:12, fontFamily:"sans-serif", color:C.slate, lineHeight:1.6, marginBottom:10 }}>
              Still outstanding: {reqMissing.map(d=>d.title).join(", ")}.
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
