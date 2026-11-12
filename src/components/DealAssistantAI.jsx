'use client'
// ─────────────────────────────────────────────────────────────────────────────
// DEAL ASSISTANT (new) — replaces the big panel on every page with:
//   1. A one-line "Next step" bar worked out from the deal itself (free, instant).
//   2. An "Ask" drawer: an AI assistant that can see this deal's details and
//      answers in plain words, plus the step guide (the old panel's content).
// Server side: app/api/assistant/route.ts. Owner preview only until
// ASSISTANT_PUBLIC in BoatClosersApp.jsx is true.
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { FONT } from "../lib/theme";
import { useVoice } from "./useVoice";

export const DealCtx = createContext(null);
export const useDealCtx = () => useContext(DealCtx);

const K = {
  navy: "#08152e", navy2: "#0d2145", brass: "#b8863a", brassText: "#8a6224", paper: "#fffdf9",
  mist: "#ddd5c6", line: "#eee7da", slate: "#44586d", cream: "#f3ecdf", white: "#ffffff", red: "#9b2c2c",
};
const usd = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("en-US");
const digits = (v) => Number(String(v ?? "").replace(/[^0-9.]/g, "")) || 0;
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());

const Compass = ({ size = 18, color = K.brass }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </svg>
);

// ── What should this person do next? Worked out from the deal, not the AI.
export function nextStepFor(step, d) {
  if (!d) return null;
  const role = d.role === "seller" ? "seller" : "buyer";
  const other = role === "buyer" ? "seller" : "buyer";
  const v = d.vessel || {}, p = d.parties || {}, n = d.negotiate || {}, dd = d.ddData || {};
  const me = p[role] || {};
  const offers = Array.isArray(n.offers) ? n.offers.filter(Boolean) : [];
  const last = offers[offers.length - 1];
  if (n.dealFinalized) return { text: "This deal is finalized. Everything is saved as a permanent record you can view, print or email.", tone: "done" };

  if (step === "vessel") {
    if (role === "seller" && !d.amInitiator) return { text: "Check the details the buyer entered for your boat and fix anything that's wrong. The documents depend on it." };
    const miss = [!v.year && "year", !v.make && "make", !v.model && "model", !digits(v.askingPrice) && "asking price"].filter(Boolean);
    if (miss.length) return { text: `Add the ${miss.join(", ").replace(/, ([^,]*)$/, " and $1")} to continue.` };
    if (!v.hin) return { text: role === "buyer" ? "Add the HIN if you have it. If not, move on: the seller can add it when they join." : "Add the HIN. It goes on the bill of sale and title paperwork." };
    return { text: "The boat details look good. Next: who's buying and who's selling.", tone: "ok" };
  }
  if (step === "parties") {
    if (!me.name || !validEmail(me.email)) return { text: "Add your full legal name and email to continue." };
    if (!d.partyBJoined) return { text: `Invite the ${other} so they can join and respond. They join free.` };
    return { text: `The ${other} has joined. Next: ${role === "buyer" ? "build your offer" : "the Deal Room"}.`, tone: "ok" };
  }
  if (step === "negotiate") {
    if (!last) return role === "buyer"
      ? { text: "Build your offer below: price, deposit and what it depends on. It's free to send." }
      : { text: "Waiting on the buyer's offer. We'll email you the moment it lands." };
    const from = last.from || last.by;
    const amt = last.amount ? usd(last.amount) : "an offer";
    if (last.status === "accepted" || last.status === "agreed" || d.dealPaid) {
      if (!d.dealPaid) return d.amInitiator ? { text: `${amt} is agreed. Pay the $249 to unlock the purchase agreement and signing.` } : { text: `${amt} is agreed. Waiting on the other side to unlock signing.` };
      return { text: "Price agreed and signed. Next: due diligence, the survey and sea trial window.", tone: "ok" };
    }
    if (last.status === "declined" || last.status === "withdrawn") return { text: "The last offer is off the table. Send a new one or message the other side." };
    if (last.expiresAt && Date.now() > last.expiresAt) return { text: `The ${amt} offer expired. ${from === role ? "Send it again or revise it." : "Ask them to resend, or make your own."}` };
    if (from === role) return { text: `Waiting on the ${other} to respond to your ${amt}. We'll let you know.` };
    return { text: `The ${other} sent ${amt}. Your move: accept, counter, or ask a question.`, tone: "action" };
  }
  if (step === "diligence") {
    if (dd.outcome === "accepted" || dd.outcome === "accept") return { text: "Inspection done and accepted. Next: sign the documents.", tone: "ok" };
    if (dd.outcome === "rejected" || dd.outcome === "reject") return { text: "The boat was rejected in due diligence. The Rejection Notice records why and the deposit goes back." };
    const start = n.ddStartDate || (last && last.ddStart);
    const days = Number(n.dueDiligenceDays || (last && last.ddDays) || 0);
    if (start && days) {
      const end = new Date(start); end.setDate(end.getDate() + days);
      const left = Math.ceil((end.getTime() - Date.now()) / 86400000);
      if (left < 0) return { text: "The inspection window has ended. Record your decision so the deal can move on.", tone: "action" };
      const todo = !dd.survey ? "book the survey" : !dd.seatrial ? "schedule the sea trial" : "record your decision";
      return { text: `${left} day${left === 1 ? "" : "s"} left to inspect. Next: ${role === "buyer" ? todo : "make the boat available for the survey and sea trial"}.`, tone: left <= 2 ? "action" : undefined };
    }
    return { text: role === "buyer" ? "Book the survey and sea trial, then record your decision before the window closes." : "Make the boat available for the buyer's survey and sea trial." };
  }
  if (step === "documents") return { text: "Sign the documents marked for you. Each one opens with a short summary first." };
  if (step === "closing") return { text: role === "buyer" ? "Send the balance, take the boat, file the title, then finalize." : "Confirm the money arrived, hand over the boat and keys, sign the title, then finalize." };
  return null;
}

// ── The slim bar that sits where the old panel was.
export function AssistantBar({ step, guide }) {
  const d = useDealCtx();
  const nx = nextStepFor(step, d);
  const toneBg = nx?.tone === "action" ? "#fbf3e4" : nx?.tone === "ok" ? "#eef5f0" : K.white;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", border: `1px solid ${K.mist}`, background: toneBg, borderRadius: 12, padding: "10px 12px 10px 14px", marginBottom: 18, fontFamily: FONT.sans }}>
      <Compass />
      <div style={{ flex: "1 1 220px", minWidth: 0, fontSize: 14, lineHeight: 1.45, color: K.navy }}>
        <b style={{ fontWeight: 600 }}>Next:</b> {nx ? nx.text : (guide?.summary || "")}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onClick={() => d?.openAssistant?.({ step, guide, tab: "guide" })}
          style={{ border: `1px solid ${K.mist}`, background: K.white, color: K.navy, borderRadius: 9, padding: "8px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans }}>Step guide</button>
        <button type="button" onClick={() => d?.openAssistant?.({ step, guide, tab: "ask" })}
          style={{ border: 0, background: K.navy, color: K.white, borderRadius: 9, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans }}>Ask a question</button>
      </div>
    </div>
  );
}

// ── Floating button + drawer, mounted once for the whole deal.
const STEP_NAMES = ["vessel", "parties", "negotiate", "diligence", "documents", "closing"];
const GENERIC_Q = {
  vessel: ["Is it Coast Guard documented or state titled?", "Where do I find the HIN?"],
  parties: ["Does the other person need to pay anything?", "What if I don't have their email?"],
  negotiate: ["Is my offer reasonable?", "Who should hold the deposit?", "Which contingencies should I include?"],
  diligence: ["What should the surveyor check?", "The survey found problems. What now?"],
  documents: ["Which documents need a notary?", "What am I signing here?"],
  closing: ["How do I avoid wire fraud?", "How do I transfer the title in Florida?"],
};

export function AssistantDock({ guides }) {
  const d = useDealCtx();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("ask");
  const [stepKey, setStepKey] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [faqOpen, setFaqOpen] = useState(null);
  const voice = useVoice();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const curStep = stepKey || STEP_NAMES[d?.step ?? 0] || "vessel";
  const guide = (guides && guides(curStep, d?.role)) || null;

  // The bar asks the dock to open on a tab.
  useEffect(() => {
    if (!d) return;
    d.registerOpener && d.registerOpener((o) => { setStepKey(o?.step || null); setTab(o?.tab || "ask"); setOpen(true); });
  }, [d && d.registerOpener]); // eslint-disable-line
  useEffect(() => { setStepKey(null); }, [d?.step]);
  useEffect(() => { try { listRef.current && (listRef.current.scrollTop = listRef.current.scrollHeight); } catch (e) {} }, [msgs, busy, open, tab]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!d) return null;

  const ask = async (text) => {
    const q = String(text || "").trim();
    if (!q || busy) return;
    setErr(""); setInput("");
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next); setBusy(true); setTab("ask");
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(d.token ? { Authorization: "Bearer " + d.token } : {}) },
        body: JSON.stringify({
          dealId: d.dealId || null, step: curStep, role: d.role,
          guide: guide ? { title: guide.title, summary: guide.summary, todo: guide.todo, next: guide.next, faqs: guide.faqs } : null,
          // Unsaved screen state, so answers match what they see right now.
          live: { vessel: d.vessel, negotiate: d.negotiate ? { ...d.negotiate, messages: undefined } : null, partyBJoined: d.partyBJoined, dealPaid: d.dealPaid, amInitiator: d.amInitiator },
          messages: next.slice(-12),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "The assistant couldn't answer just now.");
      setMsgs([...next, { role: "assistant", content: j.answer }]);
    } catch (e) {
      setErr(e.message || "Something went wrong.");
      setMsgs(next);
    }
    setBusy(false);
    setTimeout(() => { try { inputRef.current && inputRef.current.focus(); } catch (e) {} }, 50);
  };

  const chips = [...((guide?.faqs || []).slice(0, 2).map((f) => f.q)), ...(GENERIC_Q[curStep] || [])].slice(0, 4);
  const mobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <>
      {!open && (
        <button type="button" onClick={() => { setTab("ask"); setOpen(true); }} aria-label="Open the Deal Assistant"
          style={{ position: "fixed", right: 18, bottom: 18, zIndex: 60, display: "flex", alignItems: "center", gap: 8, border: 0, borderRadius: 999,
            background: K.navy, color: K.white, padding: "13px 18px 13px 15px", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 6px 20px rgba(8,21,46,0.28)", fontFamily: FONT.sans }}>
          <Compass size={19} /> Ask
        </button>
      )}
      {open && (
        <div role="dialog" aria-label="Deal Assistant" aria-modal="false"
          style={{ position: "fixed", zIndex: 70, right: mobile ? 0 : 18, bottom: mobile ? 0 : 18, top: mobile ? 0 : "auto",
            width: mobile ? "100%" : 400, height: mobile ? "100%" : "min(640px, calc(100vh - 36px))",
            background: K.paper, borderRadius: mobile ? 0 : 18, boxShadow: "0 12px 40px rgba(8,21,46,0.28)", display: "flex", flexDirection: "column",
            overflow: "hidden", fontFamily: FONT.sans, color: K.navy, border: mobile ? 0 : `1px solid ${K.mist}` }}>
          {/* Header */}
          <div style={{ background: K.navy, color: K.white, padding: "14px 14px 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Compass size={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Deal Assistant</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{guide?.title ? guide.title + " · " : ""}knows your deal's details</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"
                style={{ border: 0, background: "rgba(255,255,255,0.1)", color: K.white, width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div role="tablist" style={{ display: "flex", gap: 4, marginTop: 12 }}>
              {[["ask", "Ask"], ["guide", "Step guide"]].map(([k, l]) => (
                <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}
                  style={{ border: 0, background: tab === k ? K.paper : "transparent", color: tab === k ? K.navy : "rgba(255,255,255,0.8)", borderRadius: "10px 10px 0 0",
                    padding: "9px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans }}>{l}</button>
              ))}
            </div>
          </div>

          {tab === "ask" ? (
            <>
              <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
                {msgs.length === 0 && (
                  <div>
                    <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14.5, lineHeight: 1.55 }}>
                      Ask me anything about this deal or how a private boat sale works. I can see where your deal stands, so you can ask things like "is my offer reasonable?" or "what happens next?"
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                      {chips.map((c) => (
                        <button key={c} type="button" onClick={() => ask(c)}
                          style={{ textAlign: "left", border: `1px solid ${K.mist}`, background: K.white, borderRadius: 12, padding: "11px 13px", fontSize: 14, color: K.navy, cursor: "pointer", fontFamily: FONT.sans }}>{c}</button>
                      ))}
                    </div>
                  </div>
                )}
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", margin: "8px 0" }}>
                    <div style={{ maxWidth: "88%", whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.55, padding: "10px 13px", borderRadius: 14,
                      background: m.role === "user" ? K.navy : K.white, color: m.role === "user" ? K.white : K.navy, border: m.role === "user" ? 0 : `1px solid ${K.line}` }}>{m.content}</div>
                  </div>
                ))}
                {busy && <div style={{ fontSize: 13.5, color: K.slate, margin: "10px 2px" }}>Thinking…</div>}
                {err && <div role="alert" style={{ fontSize: 13.5, color: K.red, margin: "10px 2px", lineHeight: 1.5 }}>{err} The step guide still has the answers to common questions.</div>}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); ask(input); }} style={{ display: "flex", gap: 8, padding: "10px 12px", borderTop: `1px solid ${K.line}`, background: K.white }}>
                <input ref={inputRef} aria-label="Your question" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your deal…" maxLength={800}
                  style={{ flex: 1, minWidth: 0, minHeight: 46, border: `1px solid ${K.mist}`, borderRadius: 12, padding: "0 12px", fontSize: 15, fontFamily: FONT.sans, color: K.navy, outline: "none" }} />
                {voice.supported && (
                  <button type="button" aria-label={voice.listening ? "Stop listening" : "Ask by voice"} onClick={() => voice.listening ? voice.stop() : voice.start((t) => setInput(t))}
                    style={{ width: 46, height: 46, borderRadius: 12, border: 0, background: voice.listening ? K.brass : K.cream, color: K.navy, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
                  </button>
                )}
                <button type="submit" disabled={busy || !input.trim()}
                  style={{ minWidth: 64, height: 46, borderRadius: 12, border: 0, background: busy || !input.trim() ? "#9aa3b2" : K.navy, color: K.white, fontWeight: 600, fontSize: 14.5, cursor: busy ? "default" : "pointer", fontFamily: FONT.sans }}>Send</button>
              </form>
              <div style={{ fontSize: 11.5, color: K.slate, textAlign: "center", padding: "0 12px 10px", background: K.white, lineHeight: 1.45 }}>
                General guidance, not legal or tax advice. BoatClosers never holds your money.
              </div>
            </>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 20px", fontSize: 14, lineHeight: 1.6 }}>
              {!guide ? <div style={{ color: K.slate }}>No guide for this step.</div> : (
                <>
                  <p style={{ margin: "0 0 14px" }}>{guide.summary}</p>
                  {guide.todo && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: K.brassText, marginBottom: 6 }}>What to do now</div>
                      {guide.todo.map((t, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, color: K.navy }}><span style={{ color: K.brassText, fontWeight: 700 }}>{i + 1}.</span><span>{t}</span></div>
                      ))}
                    </div>
                  )}
                  {guide.next && <div style={{ background: K.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}><b>What happens next:</b> {guide.next}</div>}
                  {(guide.tips || []).length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: K.brassText, marginBottom: 6 }}>Broker tips</div>
                      {guide.tips.map((t, i) => <div key={i} style={{ marginBottom: 6, color: K.navy }}>· {String(t).replace(/^[^A-Za-z0-9$]+/, "")}</div>)}
                    </div>
                  )}
                  {(guide.faqs || []).length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: K.brassText, marginBottom: 4 }}>Common questions</div>
                      {guide.faqs.map((f, i) => (
                        <div key={i} style={{ borderBottom: `1px solid ${K.line}` }}>
                          <button type="button" onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}
                            style={{ display: "flex", justifyContent: "space-between", gap: 10, width: "100%", border: 0, background: "transparent", padding: "11px 0", fontSize: 14, fontWeight: 600, color: K.navy, textAlign: "left", cursor: "pointer", fontFamily: FONT.sans }}>
                            <span>{f.q}</span><span style={{ color: K.brassText }}>{faqOpen === i ? "–" : "+"}</span>
                          </button>
                          {faqOpen === i && <div style={{ color: K.slate, padding: "0 0 12px" }}>{f.a}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={() => setTab("ask")}
                    style={{ marginTop: 16, width: "100%", border: 0, background: K.navy, color: K.white, borderRadius: 12, padding: "12px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans }}>
                    Still stuck? Ask a question
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
