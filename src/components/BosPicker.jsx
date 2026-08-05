import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// "WHICH BILL OF SALE?" — the picker
//
// Seven documents in the library transfer ownership, and a customer needs ONE.
// Listing them side by side made them all look required and gave no way to
// choose. This picks for them and explains why.
//
// Official state and federal forms are listed FIRST, deliberately: the tag
// office knows its own form on sight, and a clerk who recognises the paperwork
// is the difference between a ten-minute visit and a second trip.
// ─────────────────────────────────────────────────────────────────────────────

// id, whether it is an official government form, and when it is the right choice.
export const BOS_OPTIONS = [
  { id: "fl_82050",  official: true,  needs: "florida",
    note: "Florida's own bill of sale, pre-filled from your deal. On a Florida transfer this is enough on its own \u2014 the tag office needs nothing else in its place." },
  { id: "cg_1340",   official: true,  needs: "documented",
    note: "The federal bill of sale for a Coast Guard documented vessel." },
  { id: "uscg_transfer", official: true, needs: "documented",
    note: "Use when the boat is coming off Coast Guard documentation as part of the sale." },
  { id: "bos",       official: false, needs: null,
    note: "Our full version with a notary block. Where there is no official state form, this is the one to use." },
  { id: "bos_plain", official: false, needs: null,
    note: "Quick private sale with nothing to notarize. Check your state accepts an un-notarized bill of sale before relying on it." },
  { id: "trailer_bos", official: false, needs: "trailer",
    note: "Extra, not instead. A trailer transfers separately and has its own title." },
];

// Which one to put forward. Government forms win where they apply.
export function recommendBos({ florida, documented }) {
  if (documented) return "cg_1340";
  if (florida) return "fl_82050";
  return "bos";
}

export default function BosPicker({ DOCUMENTS = [], C, facts = {}, chosen, onChoose, onOpenDoc, onClose }) {
  const rec = recommendBos(facts);
  const byId = (id) => DOCUMENTS.find(d => d.id === id);
  const applies = (o) =>
    o.needs === "florida" ? !!facts.florida
    : o.needs === "documented" ? !!facts.documented
    : o.needs === "trailer" ? !!facts.trailer
    : true;

  const why = (o) => {
    // In Florida the 82050 is sufficient on its own, but a notarized bill of sale
    // is equally accepted — so say so rather than making it look second best.
    if (o.id === "bos" && facts.florida && !facts.documented)
      return "Also accepted in Florida, if you'd rather use a notarized bill of sale than the state form. Either one works \u2014 you don't need both.";
    if (o.id === "fl_82050" && facts.documented)
      return "Florida's form covers the state side, but a documented vessel transfers federally \u2014 use the CG-1340 above for the sale itself.";
    if (o.needs === "documented" && !facts.documented) return "Only for federally documented vessels. Yours isn't documented, so you don't need this.";
    if (o.needs === "florida" && !facts.florida) return "Only for Florida transfers.";
    if (o.needs === "trailer" && !facts.trailer) return "Only if a trailer is part of the sale.";
    return o.note;
  };

  const official = BOS_OPTIONS.filter(o => o.official);
  const ours = BOS_OPTIONS.filter(o => !o.official);

  const row = (o) => {
    const d = byId(o.id);
    if (!d) return null;
    const isRec = o.id === rec;
    const isChosen = chosen === o.id;
    const usable = applies(o);
    return (
      <div key={o.id} style={{ padding: isRec ? "14px 18px" : "12px 18px", borderBottom:`1px solid ${C.sand}`,
        background: isRec ? "#fdf8ef" : C.white, borderLeft: isRec ? `3px solid ${C.brass}` : "3px solid transparent", opacity: usable ? 1 : 0.72 }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline", flexWrap:"wrap" }}>
          <span style={{ fontSize:13.5, color:C.navy, fontWeight: isRec ? 700 : 400 }}>{d.title}</span>
          {isRec && <span style={{ fontSize:10, background:C.greenLight, color:C.green, padding:"3px 9px", borderRadius:10, whiteSpace:"nowrap" }}>Recommended for you</span>}
          {!isRec && o.id === "bos" && facts.florida && !facts.documented && <span style={{ fontSize:10, background:C.tealLight, color:C.teal, padding:"3px 9px", borderRadius:10, whiteSpace:"nowrap" }}>Also works</span>}
          {isChosen && !isRec && <span style={{ fontSize:10, background:C.tealLight, color:C.teal, padding:"3px 9px", borderRadius:10, whiteSpace:"nowrap" }}>Your choice</span>}
        </div>
        <div style={{ fontSize:11.5, color:C.slate, marginTop:4, lineHeight:1.55 }}>{why(o)}</div>
        <div style={{ display:"flex", gap:8, marginTop:9, flexWrap:"wrap" }}>
          <button onClick={()=>{ onChoose(o.id); onOpenDoc(o.id); }}
            style={{ background: isRec ? C.brass : "transparent", color: isRec ? "#fff" : C.slate,
              border: isRec ? "none" : `1px solid ${C.mist}`, borderRadius:16, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
            {isRec ? "Use this one" : "Use this instead"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(8,21,46,0.55)", zIndex:3000, overflowY:"auto", padding:"18px 12px", fontFamily:"sans-serif" }}>
      <div onClick={e=>e.stopPropagation()} style={{ maxWidth:620, margin:"0 auto", background:C.white, borderRadius:12, overflow:"hidden", border:`2px solid ${C.brass}` }}>

        <div style={{ background:C.navy, color:"#fff", padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12.5, letterSpacing:1, color:C.brass }}>WHICH BILL OF SALE?</span>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:19, cursor:"pointer", lineHeight:1 }}>&times;</button>
        </div>

        <div style={{ padding:"16px 18px", borderBottom:`1px solid ${C.mist}` }}>
          <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.65 }}>
            This is the document that actually transfers the boat. <strong style={{ color:C.navy }}>You need one of these, not all of them.</strong> Where your state or the Coast Guard publishes its own form, use theirs &mdash; that is the paper the clerk is expecting.
          </div>
        </div>

        <div style={{ padding:"10px 18px", background:C.tealLight, fontSize:10.5, color:C.teal, letterSpacing:0.5, textTransform:"uppercase" }}>Official forms &mdash; what the tag office wants</div>
        {official.map(row)}

        <div style={{ padding:"10px 18px", background:C.sand, fontSize:10.5, color:C.slate, letterSpacing:0.5, textTransform:"uppercase" }}>BoatClosers versions &mdash; if no official form applies</div>
        {ours.map(row)}

        <div style={{ padding:"14px 18px" }}>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${C.mist}`, color:C.slate, borderRadius:18, padding:"9px 18px", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>Decide later</button>
        </div>

      </div>
    </div>
  );
}
