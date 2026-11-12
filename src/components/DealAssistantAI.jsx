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
import { nextStepFor } from "../lib/nextStep";
export { nextStepFor };

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

// ── "Use your own AI": open ChatGPT or Claude with this step and the deal's
// key facts already filled in (no names, emails or addresses).
const STEP_TITLES = { vessel: "describing the boat", parties: "setting up the buyer and seller", negotiate: "the offer and negotiation", diligence: "due diligence (survey, sea trial, title checks)", documents: "reviewing and signing the documents", closing: "closing" };
const ESCROW_NAMES = { escrow_com: "Escrow.com", sea_yachts: "Sea Yachts (a licensed Florida yacht brokerage)", attorney: "an attorney or title company", brokerage: "a licensed broker", direct: "straight to the seller", custom: "a custom arrangement", none: "no deposit" };
const CONT_NAMES = { survey: "survey", seaTrial: "sea trial", financing: "financing", insurance: "insurance", title: "clear title", personalInspection: "personal inspection" };

export function ownAIPrompt(d, step, guide, question) {
  if (!d) return "";
  const role = d.role === "seller" ? "seller" : "buyer";
  const v = d.vessel || {}, n = d.negotiate || {};
  const boat = [v.year, v.make, v.model].filter(Boolean).join(" ") || "a boat";
  const offers = (Array.isArray(n.offers) ? n.offers : []).filter(Boolean).slice(-4);
  const nx = nextStepFor(step, d);
  const lines = [
    `I'm the ${role} in a private boat sale of a ${boat}${digits(v.askingPrice) ? `, asking ${usd(v.askingPrice)}` : ""}. We're using the BoatClosers app, which walks both of us through the deal: offers, deposit and escrow, due diligence, documents, signing and closing. I'd like a second opinion.`,
    `Where we are: ${STEP_TITLES[step] || step}.${nx ? " The app says next: " + nx.text : ""}`,
    v.isDocumented === "yes" ? "The boat is Coast Guard documented." : v.isDocumented === "no" ? "The boat has a state title (Florida)." : "",
    v.brokerListed === "yes" ? "The boat is listed with a broker; I'm representing myself." : "",
    offers.length ? "Offers so far (oldest first):\n" + offers.map((o) => `- ${o.from || o.by} offered ${usd(o.amount)}${Number(o.escrowPct) ? `, ${o.escrowPct}% deposit held by ${ESCROW_NAMES[o.escrowPath] || "not chosen"}` : ", no deposit"}${o.cashWaived ? ", as-is" : (o.contingencies || []).length ? ", contingent on " + o.contingencies.map((c) => CONT_NAMES[c] || c).join(", ") : ""}${o.ddDays ? `, ${o.ddDays}-day inspection` : ""} (${o.status || "pending"})`).join("\n") : "",
    n.sellerHasLien === "yes" ? "The seller still has a loan on the boat that gets paid off at closing." : "",
    question ? `My question: ${question}` : "Explain where this deal stands, what I should do next and why, what risks to watch for, and what to ask the other side.",
    "Answer like an experienced yacht broker would, in plain words and short steps. Remind me that this is general guidance, not legal or tax advice, and to confirm any wiring instructions by phone.",
    "At the end, remind me to go back to the BoatClosers app to act on it, since that's where offers are sent, documents are signed and the deal is recorded.",
  ];
  return lines.filter(Boolean).join("\n");
}

function OwnAI({ d, step, guide, question, onConnect }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const prompt = ownAIPrompt(d, step, guide, question);
  const q = encodeURIComponent(prompt);
  const btn = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44, borderRadius: 11, border: `1.5px solid ${K.navy}`, background: K.white, color: K.navy, fontSize: 13.5, fontWeight: 600, textDecoration: "none", cursor: "pointer", fontFamily: FONT.sans, textAlign: "center", padding: "0 6px" };
  return (
    <div style={{ marginTop: 16, border: `1px solid ${K.mist}`, borderRadius: 14, background: K.white, padding: "12px 13px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: K.brassText }}>Second opinion</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>Ask your own AI</div>
      <div style={{ fontSize: 13.5, color: K.slate, lineHeight: 1.5, marginTop: 4 }}>
        Opens ChatGPT or Claude with this step and your deal's key numbers filled in{question ? ", plus your question" : ""}. No names, emails or addresses are sent.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginTop: 10 }}>
        <a href={`https://chatgpt.com/?q=${q}`} target="_blank" rel="noopener noreferrer" style={btn}>ChatGPT</a>
        <a href={`https://claude.ai/new?q=${q}`} target="_blank" rel="noopener noreferrer" style={btn}>Claude</a>
        <button type="button" style={btn} onClick={async () => { try { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch (e) {} }}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <div style={{ fontSize: 12.5, color: K.navy, background: K.cream, borderRadius: 10, padding: "8px 10px", marginTop: 10, lineHeight: 1.45 }}>
        <b>Then come back here to act.</b> Your AI only gives advice. Offers, signatures and payments happen in BoatClosers.
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8, fontSize: 12.5 }}>
        <button type="button" onClick={() => setShow(!show)} style={{ border: 0, background: "transparent", padding: "6px 0", color: K.navy, fontWeight: 600, textDecoration: "underline", cursor: "pointer", fontFamily: FONT.sans, fontSize: 12.5 }}>{show ? "Hide what gets sent" : "See what gets sent"}</button>
        <button type="button" onClick={onConnect} style={{ border: 0, background: "transparent", padding: "6px 0", color: K.slate, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans, fontSize: 12.5 }}>Connect your AI (advanced)</button>
      </div>
      {show && <pre style={{ whiteSpace: "pre-wrap", fontFamily: FONT.sans, fontSize: 12.5, lineHeight: 1.5, background: K.paper, borderRadius: 10, padding: 10, margin: "6px 0 0" }}>{prompt}</pre>}
    </div>
  );
}

// ── Advanced: a private connector link for their own AI (read-only).
function ConnectAI({ token }) {
  const [state, setState] = useState({ loading: true, on: false, lastUsed: null, unavailable: false });
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const H = token ? { Authorization: "Bearer " + token } : {};
  useEffect(() => {
    fetch("/api/ai-links", { headers: H }).then((r) => r.json()).then((j) => setState({ loading: false, on: !!j.on, lastUsed: j.lastUsed || null, unavailable: !!j.unavailable })).catch(() => setState((s) => ({ ...s, loading: false })));
  }, []); // eslint-disable-line
  const make = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/ai-links", { method: "POST", headers: H });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "That didn't work.");
      setUrl(j.url); setState((s) => ({ ...s, on: true })); setCopied(false);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const off = async () => {
    setBusy(true);
    const r = await fetch("/api/ai-links", { method: "DELETE", headers: H }).catch(() => null);
    if (r && r.ok) { setState((s) => ({ ...s, on: false })); setUrl(""); }
    setBusy(false);
  };
  const box = { background: K.white, border: `1px solid ${K.line}`, borderRadius: 14, padding: "12px 14px", marginBottom: 12 };
  const primary = { width: "100%", minHeight: 46, border: 0, borderRadius: 12, background: K.navy, color: K.white, fontWeight: 600, fontSize: 14.5, cursor: "pointer", fontFamily: FONT.sans };
  return (
    <div style={{ fontSize: 14, lineHeight: 1.55 }}>
      <h3 style={{ margin: "0 0 6px", fontFamily: FONT.serif, fontWeight: 500, fontSize: 22 }}>Connect your own AI</h3>
      <p style={{ margin: "0 0 12px", color: K.slate }}>
        Most people don't need this: the Ask tab and the ChatGPT and Claude buttons cover it. This is for people who want their own assistant to look up their deals any time, from their own chats or by voice.
      </p>
      <div style={box}>
        <div>Your AI can <b>read</b> your deals (the boat, every offer and counter, deadlines and what's next) and explain them. It <b>can't</b> send offers, sign, pay or change anything. Those happen in BoatClosers, where both sides see them.</div>
      </div>
      {url ? (
        <div style={box}>
          <b>Your private connector link</b>
          <div style={{ color: K.slate, fontSize: 13 }}>Copy it now. For your security it won't be shown again.</div>
          <code style={{ display: "block", wordBreak: "break-all", background: K.paper, borderRadius: 8, padding: 8, margin: "8px 0", fontSize: 12.5 }}>{url}</code>
          <button type="button" style={primary} onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch (e) {} }}>{copied ? "Copied" : "Copy link"}</button>
        </div>
      ) : (
        <div style={box}>
          {state.on && <div style={{ color: K.slate, fontSize: 13, marginBottom: 8 }}>An AI link is on{state.lastUsed ? `, last used ${new Date(state.lastUsed).toLocaleDateString()}` : ", not used yet"}. Making a new one turns the old one off.</div>}
          <button type="button" disabled={busy || state.loading} style={primary} onClick={make}>{busy ? "One moment…" : state.on ? "Make a new link" : "Make my AI link"}</button>
        </div>
      )}
      {err && <div role="alert" style={{ color: K.red, fontSize: 13.5, marginBottom: 10 }}>{err}</div>}
      <div style={box}>
        <b>Add it to your AI</b>
        <div style={{ marginTop: 6 }}><b style={{ fontWeight: 600 }}>ChatGPT:</b> on the website, open Settings, then Apps. Under Advanced settings, turn on Developer mode, create a new app named BoatClosers, paste your link, choose No authentication and save.</div>
        <div style={{ marginTop: 6 }}><b style={{ fontWeight: 600 }}>Claude:</b> open Settings, then Connectors, choose Add custom connector, name it BoatClosers and paste your link.</div>
        <div style={{ marginTop: 6 }}><b style={{ fontWeight: 600 }}>Others:</b> any assistant that supports MCP connectors (remote servers) can use the same link.</div>
        <div style={{ marginTop: 6, color: K.slate, fontSize: 13 }}>Menu names change from time to time. Then start a chat with it on and say: "Where does my boat deal stand?"</div>
      </div>
      <div style={{ ...box, color: K.slate, fontSize: 13 }}>
        Anyone with the link can read your deals, so keep it private. Make a new link any time and the old one stops working. Your AI handles what you tell it under its own privacy terms, and it's a guide, not a lawyer or broker.
      </div>
      {state.on && !url && <button type="button" disabled={busy} onClick={off} style={{ border: 0, background: "transparent", color: K.red, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans, fontSize: 14, padding: "8px 0" }}>Turn off AI access</button>}
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
        <button type="button" onClick={() => { setTab("ask"); setOpen(true); }} aria-label="Open the Virtual Broker"
          style={{ position: "fixed", right: 18, bottom: 18, zIndex: 60, display: "flex", alignItems: "center", gap: 8, border: 0, borderRadius: 999,
            background: K.navy, color: K.white, padding: "13px 18px 13px 15px", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 6px 20px rgba(8,21,46,0.28)", fontFamily: FONT.sans }}>
          <Compass size={19} /> Ask
        </button>
      )}
      {open && (
        <div role="dialog" aria-label="Virtual Broker" aria-modal="false"
          style={{ position: "fixed", zIndex: 70, right: mobile ? 0 : 18, bottom: mobile ? 0 : 18, top: mobile ? 0 : "auto",
            width: mobile ? "100%" : 400, height: mobile ? "100%" : "min(640px, calc(100vh - 36px))",
            background: K.paper, borderRadius: mobile ? 0 : 18, boxShadow: "0 12px 40px rgba(8,21,46,0.28)", display: "flex", flexDirection: "column",
            overflow: "hidden", fontFamily: FONT.sans, color: K.navy, border: mobile ? 0 : `1px solid ${K.mist}` }}>
          {/* Header */}
          <div style={{ background: K.navy, color: K.white, padding: "14px 14px 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Compass size={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Virtual Broker</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{guide?.title ? guide.title + " · " : ""}knows your deal's details</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"
                style={{ border: 0, background: "rgba(255,255,255,0.1)", color: K.white, width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div role="tablist" style={{ display: "flex", gap: 4, marginTop: 12 }}>
              {[["ask", "Ask"], ["guide", "Step guide"], ["connect", "Your AI"]].map(([k, l]) => (
                <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}
                  style={{ border: 0, background: tab === k ? K.paper : "transparent", color: tab === k ? K.navy : "rgba(255,255,255,0.8)", borderRadius: "10px 10px 0 0",
                    padding: "9px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans }}>{l}</button>
              ))}
            </div>
          </div>

          {tab === "connect" ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 20px" }}><ConnectAI token={d.token} /></div>
          ) : tab === "ask" ? (
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
                {!busy && (msgs.length === 0 || err || msgs.length >= 2) && (
                  <OwnAI d={d} step={curStep} guide={guide} question={input.trim() || [...msgs].reverse().find((m) => m.role === "user")?.content || ""} onConnect={() => setTab("connect")} />
                )}
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
