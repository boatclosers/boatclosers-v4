'use client'
import { useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// BOATCLOSERS — CONTINGENCY PICKER
// src/components/ContingencyPicker.jsx
//
// A compact row of toggle pills for the Negotiate & Terms step. The buyer turns
// each contingency on/off; the choices save onto the deal as selectedContingencies
// and flow into the Purchase Agreement automatically. Deadlines follow the due
// diligence window already set above — no extra date pickers.
//
// Keys MUST match documents.js: survey, seaTrial, financing, insurance, title
// ═══════════════════════════════════════════════════════════════════════════

const C = {
  navy:"#08152e", teal:"#0e6b7c", tealLight:"#e4f4f7", brass:"#b8863a",
  sandDark:"#ede6d8", white:"#ffffff", slate:"#3d5166", mist:"#d9d2c5", green:"#1a5c35",
};

const OPTIONS = [
  { key:"survey",             label:"Survey" },
  { key:"personalInspection", label:"Personal Inspection" },
  { key:"seaTrial",           label:"Sea Trial" },
  { key:"financing",          label:"Financing" },
  { key:"insurance",          label:"Insurance" },
  { key:"title",              label:"Clear Title" },
];

// NOTHING is pre-selected. Contingencies are terms the buyer proposes and the
// seller accepts or rejects — lighting them up automatically decides a negotiating
// point on the buyer's behalf. The one exception is a financed offer, where
// financing and insurance are not really optional (see the effect above).
//
// It was also a live mismatch: the picker used to auto-display survey/seaTrial/title
// while the parent state stayed empty, so a buyer who never touched this control saw
// three contingencies selected and sent an offer carrying NONE. The Purchase Agreement
// would then record a waived survey the buyer believed they had.
export default function ContingencyPicker({ value, onChange, paymentType, ddEnd, cashWaived, onCashWaived }) {
  const selected = Array.isArray(value) ? value : [];
  const financed = /financ|loan/i.test(String(paymentType || ""));

  // A financed buyer needs both, and the second is the one people miss: no lender
  // funds a boat without proof of insurance. Added automatically, still removable
  // — a buyer with an existing fleet policy may genuinely not need them.
  useEffect(() => {
    if (!financed || cashWaived) return;
    const missing = ["financing", "insurance"].filter(k => !selected.includes(k));
    if (missing.length) onChange([...selected, ...missing]);
  }, [financed]); // eslint-disable-line

  const toggle = (key) => {
    // Choosing any contingency cancels a prior cash-waiver — they're opposites.
    if (cashWaived && onCashWaived) onCashWaived(false);
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    onChange(next);
  };

  // A cash buyer who has seen the boat may deliberately waive every contingency
  // for a clean, fast "as-is" offer. That's a real choice — but a serious one, so
  // it's an explicit, confirmed action rather than "just leave everything off",
  // which is indistinguishable from forgetting to pick.
  const waiveAll = () => {
    if (typeof window !== "undefined" && !window.confirm(
      "Make this a no-contingency cash offer?\n\nYou'll be waiving your survey, personal inspection, sea trial, financing, insurance, and title contingencies. That means no built-in right to walk away or renegotiate based on what an inspection finds — you'd be agreeing to buy the boat as-is.\n\nOnly do this if you've already seen the boat and accept its condition. Continue?"
    )) return;
    onChange([]);
    if (onCashWaived) onCashWaived(true);
  };

  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", color:C.navy, marginBottom:4 }}>
        Buyer's Contingencies
      </div>
      <div style={{ fontSize:11, fontFamily:"sans-serif", color:C.slate, marginBottom:10, lineHeight:1.6 }}>
        Tap to choose what this offer is contingent on. Each one you select is added to the Purchase Agreement;
        anything you leave off is waived. Deadlines follow your due diligence window{ddEnd ? ` (by ${ddEnd})` : ""}.
      </div>

      {selected.length === 0 && !cashWaived && (
        <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:"#b91c1c", fontWeight:700, marginBottom:8, lineHeight:1.5 }}>
          Nothing selected yet — choose what this offer depends on. Most private boat offers are contingent on a survey, a sea trial, and clear title. Buying as-is for cash? Use the <b>cash offer</b> option below.
        </div>
      )}
      {cashWaived && selected.length === 0 && (
        <div style={{ fontSize:11.5, fontFamily:"sans-serif", color:C.navy, fontWeight:700, marginBottom:8, lineHeight:1.5, background:C.sandDark, borderRadius:6, padding:"9px 12px" }}>
          💵 No-contingency cash offer. You're buying the boat as-is, with no survey, personal inspection, sea-trial, financing, insurance, or title contingency. You can add a contingency any time before sending by tapping one above.
        </div>
      )}
      {financed && !cashWaived && (
        <div style={{ background:"#f7fbfd", border:`1px solid ${C.mist}`, borderRadius:7, padding:"11px 13px", marginBottom:11, fontFamily:"sans-serif" }}>
          <div style={{ fontSize:12, fontWeight:800, color:C.navy, marginBottom:4 }}>Financing and Insurance added for you</div>
          <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.65 }}>
            Your lender will not release funds without proof of insurance, so the two go together. You can remove either one, but do it deliberately.
          </div>
        </div>
      )}

      {selected.includes("insurance") && (
        <div style={{ background:"#fffaf0", border:"1px solid #e3c98f", borderRadius:7, padding:"11px 13px", marginBottom:11, fontFamily:"sans-serif" }}>
          <div style={{ fontSize:12, fontWeight:800, color:"#8a5a12", marginBottom:4 }}>Insurance is not a formality</div>
          <div style={{ fontSize:11.5, color:C.slate, lineHeight:1.65 }}>
            Cover can be refused outright &mdash; an older or wooden hull, high performance, survey findings, or a buyer with little boating history are all common reasons. Confirm you can actually get a policy <b>during due diligence</b>, while this contingency still protects your deposit. Find out afterwards and the money is already at risk.
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {OPTIONS.map(opt => {
          const on = selected.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              style={{
                display:"flex", alignItems:"center", gap:7,
                padding:"8px 14px", borderRadius:999, cursor:"pointer",
                fontFamily:"sans-serif", fontSize:12, fontWeight:700,
                border:`1.5px solid ${on ? C.green : C.mist}`,
                background: on ? C.green : "transparent",
                color: on ? "#fff" : C.slate,
                transition:"all 0.15s",
              }}
            >
              <span style={{
                width:15, height:15, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: on ? "rgba(255,255,255,0.25)" : C.sandDark,
                fontSize:10, color: on ? "#fff" : C.slate,
              }}>{on ? "✓" : ""}</span>
              {opt.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={waiveAll}
        style={{
          marginTop:10, width:"100%", padding:"9px 14px", borderRadius:8, cursor:"pointer",
          fontFamily:"sans-serif", fontSize:12, fontWeight:700,
          border:`1.5px solid ${cashWaived ? C.brass : C.mist}`,
          background: cashWaived ? C.brass : "transparent",
          color: cashWaived ? C.navy : C.slate,
        }}>
        💵 {cashWaived ? "Cash offer — all contingencies waived" : "Make this a cash offer (waive all contingencies)"}
      </button>

      <div style={{ marginTop:8, fontSize:11, fontFamily:"sans-serif", color:C.teal }}>
        Contingent on: <strong>{selected.length ? OPTIONS.filter(o=>selected.includes(o.key)).map(o=>o.label).join(", ") : cashWaived ? "None — cash offer, buyer waives all contingencies" : "None selected yet"}</strong>
      </div>
    </div>
  );
}
