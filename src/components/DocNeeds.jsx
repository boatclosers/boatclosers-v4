import React, { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// "WHICH DOCUMENTS DO I NEED?" — full-screen guided flow
//
// Three stages:
//   1. Explain what is about to happen, and show what the deal ALREADY tells us
//      so the customer is never asked something the app should know.
//   2. Ask only what cannot be worked out, one question per screen, with a plain
//      reason why it matters. "Not sure" is always a real answer.
//   3. Show the resulting set, grouped by what they DO with each document, with
//      the reason each group appeared.
//
// This never hides documents — the full library is always one button away.
// ─────────────────────────────────────────────────────────────────────────────

const isFL = (s) => /\b(fl|fla|florida)\b/i.test(String(s || ""));

// What the deal already answers. Nothing here is ever asked.
export function readKnownFacts({ vessel = {}, parties = {}, negotiate = {}, terms = {} }) {
  const uscg = String(vessel.uscgNumber || vessel.uscgOfficialNo || vessel.officialNo || "").trim();
  const financing = !!(negotiate.financeContingency || /financ/i.test(String(negotiate.paymentType || "")));
  return {
    boat: [vessel.year, vessel.make, vessel.model].filter(Boolean).join(" "),
    florida: isFL(vessel.regState) || isFL(vessel.location) || isFL(parties?.seller?.stateZip) || isFL(parties?.buyer?.stateZip),
    documented: !!uscg,
    trailer: String(vessel.trailerIncluded || "").toLowerCase() === "yes",
    financing,
    state: String(vessel.regState || "").trim(),
  };
}

// The questions the deal cannot answer. Order matters — the ones that can kill a
// sale come first, because that is the order a broker would ask them.
const QUESTIONS = [
  {
    id: "lien",
    q: "Does the seller still owe money on the boat?",
    why: "A loan or lien has to be cleared before the title can transfer. This is the most common reason a boat deal falls apart at the last minute.",
    options: [
      { v: "yes", label: "Yes — there's a loan or lien to pay off" },
      { v: "no", label: "No — owned free and clear" },
      { v: "unsure", label: "Not sure — we'll add the paperwork to find out" },
    ],
  },
  {
    id: "title",
    q: "Does the seller have the title in hand?",
    why: "Without it, ownership can't transfer the normal way — but there is a documented route for every situation.",
    options: [
      { v: "yes", label: "Yes — they have the paper title" },
      { v: "lost", label: "It's lost, destroyed, or never arrived" },
      { v: "never", label: "There has never been a title — only a bill of sale" },
      { v: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "owner",
    q: "Is the registered owner selling it themselves?",
    why: "If the owner has died, or somebody is signing for them, the buyer needs proof that the signer is allowed to sell.",
    options: [
      { v: "self", label: "Yes — the owner is signing" },
      { v: "agent", label: "No — someone is signing on their behalf" },
      { v: "estate", label: "The owner has passed away" },
    ],
  },
  {
    id: "names",
    q: "Whose name is on the title?",
    why: "Everyone on the title has to agree to the sale, and a company or trust needs to show who may sign for it.",
    options: [
      { v: "one", label: "One person" },
      { v: "two", label: "Two or more people" },
      { v: "entity", label: "A business, LLC, or trust" },
      { v: "unsure", label: "Not sure" },
    ],
  },
];

// Follow-ups, asked only when the answer above makes them relevant.
const FOLLOWUPS = {
  estate: {
    id: "probate",
    q: "Has a court appointed someone to handle the estate?",
    why: "That decides which affidavit the state will accept from you.",
    options: [
      { v: "executor", label: "Yes — there's an executor or administrator" },
      { v: "none", label: "No — no probate was opened" },
      { v: "unsure", label: "Not sure" },
    ],
  },
};

// ── Turn answers + known facts into a grouped set of documents ────────────────
export function buildNeeds(a, k) {
  const groups = [];
  const add = (heading, note, ids) => {
    const list = ids.filter(Boolean);
    if (list.length) groups.push({ heading, note, ids: list });
  };

  add("Sign these to close the sale", "Every sale needs these, whatever the situation.",
    ["psa", "dep", "asis", "accept", "stmt"]);

  const bos = k.documented ? "cg_1340" : "bos";
  add("Take these to title the boat",
    k.documented ? "Your vessel is Coast Guard documented, so transfer happens federally."
      : k.florida ? "Florida titled, so these are the forms the tag office wants."
      : `These transfer ownership and registration${k.state ? " in " + k.state : ""}.`,
    [bos, k.florida ? "fl_82040vs" : "title_app", k.documented ? "cg_1258" : null, "notice_sale"]);

  if (a.lien === "yes" || a.lien === "unsure")
    add(a.lien === "yes" ? "Because there's money owed" : "To check whether money is owed",
      a.lien === "yes" ? "The loan has to be paid off and released before the title is clean."
        : "You said you weren't sure — these will tell you, and clear it if there is.",
      ["payoff", "lien_release", "title_search_letter"]);

  if (a.title === "lost" || a.title === "unsure")
    add("Because the title is missing", "Replaces a lost title so the sale can go through.",
      [k.florida ? "fl_82101" : "lost_title", k.documented ? "lost_cod" : null]);
  if (a.title === "never")
    add("Because there has never been a title", "Builds a paper record of ownership from what does exist.",
      ["bos_only", "chain_title", "hin_affidavit"]);

  if (a.owner === "estate")
    add("Because the owner has passed away", "Read the guide first — it explains which of these is yours.",
      ["estate_guide",
       a.probate === "executor" ? "executor_auth" : a.probate === "none" ? "heirship" : "heirship",
       a.probate === "none" ? "small_estate" : null, "death_cert"]);
  if (a.owner === "agent")
    add("Because someone is signing for the owner", "Proves the signer is allowed to sell the boat.",
      ["poa", k.florida ? "fl_82053" : null]);

  if (a.names === "two")
    add("Because more than one name is on the title", "Every owner has to consent to the sale.", ["coowner"]);
  if (a.names === "entity")
    add("Because the seller is a business or trust", "Shows who may sign on the company's behalf.", ["entity_auth"]);

  if (k.trailer)
    add("Because a trailer is included", "A trailer transfers separately, with its own title.", ["trailer_bos"]);
  if (k.financing)
    add("Because the buyer is financing", "The lender and insurer will ask for these before closing.",
      ["commitment", "fin_conditions", "binder"]);

  // No document should appear twice, even if two situations both call for it.
  const seen = new Set();
  return groups.map(g => ({ ...g, ids: g.ids.filter(id => !seen.has(id) && seen.add(id)) }))
               .filter(g => g.ids.length);
}

export default function DocNeeds({ DOCUMENTS = [], C, S, facts, initial = {}, onClose, onUse, onOpenDoc }) {
  const [stage, setStage] = useState("intro");
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState(initial);

  const k = facts || {};
  const asked = [...QUESTIONS];
  if (ans.owner === "estate") asked.splice(3, 0, FOLLOWUPS.estate);
  const current = asked[step];
  const groups = buildNeeds(ans, k);
  const byId = (id) => DOCUMENTS.find(d => d.id === id);
  const total = groups.reduce((n, g) => n + g.ids.length, 0);

  const known = [
    k.boat,
    k.florida ? "Florida registered" : k.state ? `Registered in ${k.state}` : null,
    k.documented ? "Coast Guard documented" : "Not Coast Guard documented",
    k.financing ? "Buyer is financing" : "Cash sale",
    k.trailer ? "Trailer included" : "No trailer",
  ].filter(Boolean);

  const wrap = { position:"fixed", inset:0, background:"rgba(8,21,46,0.55)", zIndex:3000, overflowY:"auto", padding:"18px 12px", fontFamily:"sans-serif" };
  const sheet = { maxWidth:640, margin:"0 auto", background:C.sand, borderRadius:12, overflow:"hidden", border:`2px solid ${C.brass}` };
  const pad = { padding:"20px 22px" };

  const answer = (v) => {
    const next = { ...ans, [current.id]: v };
    setAns(next);
    const list = [...QUESTIONS];
    if (next.owner === "estate") list.splice(3, 0, FOLLOWUPS.estate);
    if (step + 1 >= list.length) setStage("result"); else setStep(step + 1);
  };

  return (
    <div style={wrap} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>

        <div style={{ background:C.navy, color:"#fff", padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12.5, letterSpacing:1, color:C.brass }}>WHICH DOCUMENTS DO I NEED?</span>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:19, cursor:"pointer", lineHeight:1 }}>&times;</button>
        </div>

        {stage === "intro" && (
          <div style={pad}>
            <div style={{ fontFamily:"'Georgia',serif", fontSize:20, color:C.navy, marginBottom:8 }}>Let&rsquo;s work out what your sale needs</div>
            <div style={{ fontSize:13, color:C.slate, lineHeight:1.7 }}>
              Every boat sale needs a different set of paperwork, and getting it wrong usually means a wasted trip to the tag office.
              {" "}<strong style={{ color:C.navy }}>We&rsquo;ll work yours out for you.</strong> Most of it we already know from your deal &mdash; we&rsquo;ll ask a few things we can&rsquo;t know, then build your list.
            </div>

            <div style={{ background:C.white, borderRadius:8, padding:"13px 15px", marginTop:15, border:`1px solid ${C.mist}` }}>
              <div style={{ fontSize:10.5, color:C.slate, letterSpacing:1, textTransform:"uppercase", marginBottom:9 }}>What we already have</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {known.map(t => (
                  <span key={t} style={{ fontSize:11.5, background:C.sand, border:`1px solid ${C.mist}`, color:C.slate, padding:"4px 11px", borderRadius:13 }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize:11, color:C.slate, marginTop:10, lineHeight:1.55, opacity:0.85 }}>
                Anything wrong here? Fix it in <strong>Vessel</strong> or <strong>Price &amp; Terms</strong> and this list changes with it.
              </div>
            </div>

            <div style={{ display:"flex", gap:11, marginTop:17, flexWrap:"wrap", alignItems:"center" }}>
              <button onClick={()=>{ setStep(0); setStage("q"); }} style={{ background:C.brass, color:"#fff", border:"none", borderRadius:20, padding:"11px 24px", fontSize:13.5, fontWeight:700, cursor:"pointer" }}>Start &mdash; {QUESTIONS.length} questions</button>
              <span style={{ fontSize:11.5, color:C.slate }}>about a minute &middot; change any answer later</span>
            </div>
          </div>
        )}

        {stage === "q" && current && (
          <div style={pad}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:15 }}>
              {asked.map((_, i) => (
                <span key={i} style={{ height:4, flex:1, borderRadius:2, background: i < step ? C.green : i === step ? C.brass : C.sandDark }} />
              ))}
              <span style={{ fontSize:10.5, color:C.slate, marginLeft:5, whiteSpace:"nowrap" }}>{step+1} of {asked.length}</span>
            </div>

            <div style={{ fontFamily:"'Georgia',serif", fontSize:18, color:C.navy, marginBottom:7 }}>{current.q}</div>
            <div style={{ fontSize:12.5, color:C.slate, lineHeight:1.65, marginBottom:15 }}>{current.why}</div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {current.options.map(o => {
                const on = ans[current.id] === o.v;
                return (
                  <button key={o.v} onClick={()=>answer(o.v)}
                    style={{ textAlign:"left", border:`1.5px solid ${on ? C.brass : C.mist}`, background: on ? "#fdf8ef" : C.white, borderRadius:8, padding:"13px 15px", fontSize:13.5, color:C.navy, cursor:"pointer", fontFamily:"sans-serif" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display:"flex", gap:14, marginTop:15, alignItems:"center" }}>
              <button onClick={()=> step === 0 ? setStage("intro") : setStep(step-1)} style={{ background:"transparent", border:"none", color:C.slate, fontSize:12, cursor:"pointer" }}>&larr; Back</button>
              <button onClick={()=>answer("unsure")} style={{ background:"transparent", border:"none", color:C.slate, fontSize:12, textDecoration:"underline", cursor:"pointer" }}>Skip this question</button>
            </div>
          </div>
        )}

        {stage === "result" && (
          <div>
            <div style={{ ...pad, paddingBottom:14, borderBottom:`1px solid ${C.mist}`, background:C.white }}>
              <div style={{ fontFamily:"'Georgia',serif", fontSize:19, color:C.navy }}>Your sale needs {total} document{total===1?"":"s"}</div>
              <div style={{ fontSize:12, color:C.slate, marginTop:5, lineHeight:1.6 }}>
                Suggestions based on your deal and your answers &mdash; not rules. You can open anything else at any time.
                {" "}<button onClick={()=>{ setStep(0); setStage("q"); }} style={{ background:"transparent", border:"none", color:C.brass, textDecoration:"underline", cursor:"pointer", fontSize:12, padding:0 }}>Change an answer</button>
              </div>
            </div>

            {groups.map(g => (
              <div key={g.heading}>
                <div style={{ background:C.sandDark, padding:"11px 22px" }}>
                  <div style={{ fontSize:11, color:C.navy, letterSpacing:0.5, textTransform:"uppercase", fontWeight:700 }}>{g.heading} &mdash; {g.ids.length}</div>
                  {g.note && <div style={{ fontSize:11.5, color:C.slate, marginTop:3, lineHeight:1.5 }}>{g.note}</div>}
                </div>
                {g.ids.map(id => {
                  const d = byId(id);
                  if (!d) return null;
                  return (
                    <button key={id} onClick={()=>{ if (onOpenDoc) { onOpenDoc(id); } }}
                      style={{ display:"block", width:"100%", textAlign:"left", background:C.white, border:"none", borderBottom:`1px solid ${C.sand}`, padding:"12px 22px", cursor:"pointer", fontFamily:"sans-serif" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                        <span style={{ fontSize:13, color:C.navy }}>{d.title}</span>
                        <span style={{ fontSize:11, color:C.brass, whiteSpace:"nowrap" }}>Open &rarr;</span>
                      </div>
                      {(d.useWhen || d.desc) && <div style={{ fontSize:11.5, color:C.slate, marginTop:3, lineHeight:1.5 }}>{d.useWhen || d.desc}</div>}
                    </button>
                  );
                })}
              </div>
            ))}

            <div style={{ ...pad, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <button onClick={()=>{ if (onUse) onUse(groups, ans); if (onClose) onClose(); }}
                style={{ background:C.brass, color:"#fff", border:"none", borderRadius:20, padding:"11px 24px", fontSize:13.5, fontWeight:700, cursor:"pointer" }}>Use this list</button>
              <button onClick={onClose} style={{ background:C.white, border:`1px solid ${C.mist}`, color:C.slate, borderRadius:20, padding:"11px 18px", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>Show all documents instead</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
