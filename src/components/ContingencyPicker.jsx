'use client'

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
  { key:"survey",    label:"Survey" },
  { key:"seaTrial",  label:"Sea Trial" },
  { key:"financing", label:"Financing" },
  { key:"insurance", label:"Insurance" },
  { key:"title",     label:"Clear Title" },
];

// Sensible default if the buyer hasn't chosen yet.
function defaultSelection(paymentType) {
  const base = ["survey", "seaTrial", "title"];
  if (paymentType === "finance") base.push("financing");
  return base;
}

export default function ContingencyPicker({ value, onChange, paymentType, ddEnd }) {
  const selected = Array.isArray(value) && value.length ? value : defaultSelection(paymentType);

  const toggle = (key) => {
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    onChange(next);
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

      <div style={{ marginTop:8, fontSize:11, fontFamily:"sans-serif", color:C.teal }}>
        Contingent on: <strong>{selected.length ? OPTIONS.filter(o=>selected.includes(o.key)).map(o=>o.label).join(", ") : "None — buyer waives all contingencies"}</strong>
      </div>
    </div>
  );
}
