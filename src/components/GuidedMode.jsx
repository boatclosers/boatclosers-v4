'use client'
// ─────────────────────────────────────────────────────────────────────────────
// GUIDED MODE — one question at a time for the Vessel, Parties and first-offer
// steps. It is a different way of ASKING, not a second app: every answer is
// written straight into the same vessel / parties / negotiate data the full form
// uses, so saving, documents, the Deal Room and signing are untouched.
//
// Switched on per browser from BoatClosersApp (see GUIDED_PUBLIC there). To remove
// it completely: delete this file and the few lines marked "GUIDED MODE" in
// BoatClosersApp.jsx.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { FONT } from "../lib/theme";
import HinInlineCheck from "./HinInlineCheck";
import { SEA_YACHTS, seaYachtsTierPrice, seaYachtsTierCost } from "../lib/seaYachts";

const K = {
  navy: "#08152e", brass: "#b8863a", brassText: "#8a6224", paper: "#fffdf9",
  mist: "#ddd5c6", line: "#eee7da", slate: "#44586d", cream: "#f3ecdf",
  sel: "#fbf5ea", white: "#ffffff", red: "#9b2c2c",
};

const digits = (v) => String(v ?? "").replace(/[^0-9.]/g, "");
const moneyText = (v) => { const d = String(v ?? "").replace(/[^0-9]/g, ""); return d ? Number(d).toLocaleString("en-US") : ""; };
const usd = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("en-US");
const validYear = (y) => { const n = Number(y); return Number.isInteger(n) && n >= 1900 && n <= new Date().getFullYear() + 1; };
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
const capFirst = (s) => (typeof s === "string" && s.length) ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const CONTINGENCIES = [
  ["survey", "Survey", "A marine surveyor inspects the boat"],
  ["seaTrial", "Sea trial", "You take it out on the water"],
  ["financing", "Financing", "Your loan has to be approved"],
  ["insurance", "Insurance", "You can get it insured"],
  ["title", "Clear title", "No liens or title problems"],
  ["personalInspection", "My own inspection", "You or your mechanic look it over"],
];

// ── Voice answers (Chrome, Edge, Safari). The mic button only appears where the
// browser supports it, so nobody taps a button that can't work.
function useVoice() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  const recRef = useRef(null);
  useEffect(() => {
    try { setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition)); } catch (e) {}
    return () => { try { recRef.current && recRef.current.abort(); } catch (e) {} };
  }, []);
  const start = (onText) => {
    let SR = null;
    try { SR = window.SpeechRecognition || window.webkitSpeechRecognition; } catch (e) {}
    if (!SR) return;
    try {
      const r = new SR();
      recRef.current = r;
      r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = (e) => {
        const t = e?.results?.[0]?.[0]?.transcript || "";
        if (t) onText(t.trim());
      };
      r.onerror = (e) => {
        setListening(false);
        setNote(e?.error === "not-allowed" ? "Microphone is blocked. Allow it in your browser, or type your answer." : "Didn't catch that. Try again or type it.");
      };
      r.onend = () => setListening(false);
      setNote(""); setListening(true);
      r.start();
    } catch (e) { setListening(false); }
  };
  const stop = () => { try { recRef.current && recRef.current.stop(); } catch (e) {} setListening(false); };
  return { supported, listening, note, start, stop, clear: () => setNote("") };
}

// Spoken numbers come back as "eighty five thousand" or "85,000". Handle both.
function spokenToNumber(t) {
  const plain = String(t).replace(/[,$]/g, "");
  const m = plain.match(/\d+(\.\d+)?/);
  const small = { zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90 };
  const words = plain.toLowerCase().replace(/-/g, " ").split(/\s+/);
  let total = 0, cur = 0, used = false;
  for (const w of words) {
    if (/^\d+(\.\d+)?$/.test(w)) { cur += Number(w); used = true; }
    else if (small[w] != null) { cur += small[w]; used = true; }
    else if (w === "hundred") { cur = (cur || 1) * 100; used = true; }
    else if (w === "thousand" || w === "k") { total += (cur || 1) * 1000; cur = 0; used = true; }
    else if (w === "million") { total += (cur || 1) * 1000000; cur = 0; used = true; }
  }
  if (used) return String(Math.round(total + cur));
  return m ? m[0] : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Question lists. Each question reads and writes the real deal data directly.
// ─────────────────────────────────────────────────────────────────────────────
function vesselQuestions(p) {
  const v = p.vessel || {};
  const set = (k, val) => p.setVessel((d) => ({ ...d, [k]: val }));
  const seller = p.role === "seller";
  const boat = [v.year, v.make, v.model].filter(Boolean).join(" ");
  const ask = Number(digits(v.askingPrice));
  return [
    { id: "year", sec: "The boat", kind: "text", inputMode: "numeric",
      title: seller ? "What year is your boat?" : "What year is the boat?",
      help: seller ? "Check what the buyer entered and fix anything that's off." : "From the listing is fine. The seller confirms everything when they join.",
      placeholder: "e.g. 2019", value: v.year || "", onChange: (t) => set("year", digits(t).slice(0, 4)),
      required: true, valid: () => validYear(v.year), error: "Enter a 4-digit year, like 2019." },
    { id: "make", sec: "The boat", kind: "text", title: "Who makes it?", placeholder: "e.g. Grady-White",
      chips: ["Boston Whaler", "Grady-White", "Sea Ray", "Yellowfin", "Intrepid", "Regulator"],
      value: v.make || "", onChange: (t) => set("make", capFirst(t)), required: true, valid: () => !!String(v.make || "").trim(), error: "Add the make to continue." },
    { id: "model", sec: "The boat", kind: "text", title: "What model is it?", placeholder: "e.g. Freedom 285",
      value: v.model || "", onChange: (t) => set("model", capFirst(t)), required: true, valid: () => !!String(v.model || "").trim(), error: "Add the model to continue." },
    { id: "askingPrice", sec: "The boat", kind: "money",
      title: seller ? "What's your asking price?" : "What is the seller asking?",
      help: seller ? "The buyer's offer will be compared against this." : "Just for reference. Your actual offer comes later.",
      placeholder: "85,000", value: v.askingPrice || "", onChange: (t) => set("askingPrice", String(t).replace(/[^0-9]/g, "")),
      required: true, valid: () => Number(digits(v.askingPrice)) > 0, error: "Add the asking price to continue.",
      note: (!seller && ask > 0 && ask <= (p.expressMax || 0))
        ? { text: "Simple deal with the price already agreed and no deposit? BoatClosers Express ($29.99) may be all you need.", href: "/express", link: "See Express" } : null },
    { id: "hin", sec: "The boat", kind: "text", mono: true,
      title: "Do you have the Hull ID (HIN)?",
      help: "12 characters, usually on the back right corner of the hull. It goes on the bill of sale.",
      placeholder: "ABC12345D919", value: v.hin || "", onChange: (t) => set("hin", String(t).toUpperCase().replace(/\s+/g, "")),
      skipLabel: seller ? "I'll add it later" : "Skip, the seller can add it",
      extra: <HinInlineCheck hin={v.hin} year={v.year} make={v.make} onFillYear={(y) => set("year", y)} /> },
    { id: "isDocumented", sec: "The boat", kind: "choice", title: "Is it Coast Guard documented?",
      help: "It decides which transfer papers your deal needs.",
      why: "A documented boat has a Coast Guard Certificate of Documentation and an official number carved inside the hull, not a state decal. It transfers through the Coast Guard instead of the county. Larger boats usually are; most trailer boats are not.",
      options: [["yes", "Yes, it's documented"], ["no", "No, it has a state title"], ["unsure", "Not sure"]],
      value: v.isDocumented || "", onChange: (val) => set("isDocumented", val) },
    { id: "brokerListed", sec: "The boat", kind: "choice", title: "Is the boat listed with a broker?",
      help: seller ? "If you've listed it with a broker, the paperwork works a little differently." : "Fine either way. If it is, we'll point out what that means when you build your offer.",
      options: [["no", "No, private sale"], ["yes", "Yes, a broker has it listed"], ["unsure", "Not sure"]],
      value: v.brokerListed || "", onChange: (val) => set("brokerListed", val) },
    { id: "trailerIncluded", sec: "The boat", kind: "choice", title: "Does a trailer come with it?",
      options: [["no", "No trailer"], ["yes", "Yes, trailer included"]],
      value: v.trailerIncluded || "", onChange: (val) => set("trailerIncluded", val) },
    { id: "vreview", sec: "The boat", kind: "review",
      title: seller ? "Here's your boat" : "Here's the boat",
      rows: [
        ["Boat", boat || "Not added yet", "year"],
        ["Asking price", ask ? usd(ask) : "Not added yet", "askingPrice"],
        ["Hull ID (HIN)", v.hin || (seller ? "Add before signing" : "Seller will add it"), "hin"],
        ["Title", v.isDocumented === "yes" ? "Coast Guard documented" : v.isDocumented === "no" ? "State titled" : "Not sure yet", "isDocumented"],
        ["Listed with a broker", v.brokerListed === "yes" ? "Yes" : v.brokerListed === "no" ? "No" : "Not sure", "brokerListed"],
        ["Trailer", v.trailerIncluded === "yes" ? "Included" : "No", "trailerIncluded"],
      ],
      note: "Engines, length, registration and the rest are optional for now. They're needed on the documents, so " + (seller ? "please add them" : "you or the seller can add them") + " any time before signing.",
      moreLabel: "Add engines, registration and more",
      finishLabel: "Looks right, continue",
      onFinish: () => p.onNext() },
  ];
}

function partiesQuestions(p, invite) {
  const role = p.role === "seller" ? "seller" : "buyer";
  const other = role === "buyer" ? "seller" : "buyer";
  const me = (p.parties && p.parties[role]) || {};
  const them = (p.parties && p.parties[other]) || {};
  const setSide = (side, k, val) => p.setParties((d) => ({ ...d, [side]: { ...d[side], [k]: val } }));
  const documented = p.vessel?.isDocumented === "yes" || (p.vessel?.isDocumented !== "no" && !!String(p.vessel?.uscgNumber || "").trim());
  const addr = [me.address, me.city, me.stateZip].filter(Boolean).join(", ");
  return [
    { id: "myName", sec: "You", kind: "text", title: "What's your full legal name?",
      help: "Exactly as it should appear on the bill of sale.", placeholder: "First and last name",
      value: me.name || "", onChange: (t) => setSide(role, "name", t), required: true, valid: () => !!String(me.name || "").trim(), error: "Add your name to continue." },
    { id: "myEmail", sec: "You", kind: "text", inputMode: "email", title: "And your email?",
      help: "Where we send offers, signatures and deadlines.", placeholder: "you@example.com",
      value: me.email || "", onChange: (t) => setSide(role, "email", t.trim()), required: true, valid: () => validEmail(me.email), error: "Enter a valid email address." },
    { id: "myPhone", sec: "You", kind: "text", inputMode: "tel", title: "Best phone number?", help: "Optional. Handy for the other side on closing day.",
      placeholder: "(561) 555-0123", value: me.phone || "", onChange: (t) => setSide(role, "phone", t), skipLabel: "Skip for now" },
    { id: "updates", sec: "You", kind: "custom", title: "How should we send you deal updates?",
      help: "Email, text, or both. You can change this any time.", render: () => p.contactPrefsEl || null, show: () => !!p.contactPrefsEl },
    { id: "myAddress", sec: "You", kind: "address", title: "What's your mailing address?",
      help: "It goes on the purchase agreement and bill of sale. You can add it later, before signing.",
      fields: [["address", "Street address", me.address], ["city", "City", me.city], ["stateZip", "State and ZIP", me.stateZip]],
      onField: (k, t) => setSide(role, k, t), skipLabel: "Add it later" },
    { id: "citizen", sec: "You", kind: "text", show: () => documented, title: "What's your citizenship?",
      help: "Only a U.S. citizen can own a Coast Guard documented boat, so the purchase agreement states each side's citizenship.",
      placeholder: "e.g. United States", chips: ["United States"], value: me.citizen || "", onChange: (t) => setSide(role, "citizen", t), skipLabel: "Add it later" },
    { id: "viewing", sec: `The ${other}`, kind: "choice", show: () => !p.partyBJoined,
      title: role === "buyer" ? "Have you seen the boat in person?" : "Has the buyer seen the boat in person?",
      help: "If not, the invite asks to set up a viewing first instead of opening with paperwork.",
      options: [[false, "Yes, already seen it"], [true, "Not yet, ask for a viewing"]],
      value: p.parties?.viewingRequested, onChange: (val) => p.setParties((d) => ({ ...d, viewingRequested: val })) },
    { id: "inviteEmail", sec: `The ${other}`, kind: "text", inputMode: "email", show: () => !p.partyBJoined,
      title: `What's the ${other}'s email?`,
      help: `We'll email them a link to join. They add their own details and join free.`,
      placeholder: `${other}@example.com`, value: them.email || "", onChange: (t) => setSide(other, "email", t.trim()),
      skipLabel: "I don't have it, give me a link instead", onSkip: () => invite.setMode("link") },
    { id: "invite", sec: `The ${other}`, kind: "invite", show: () => !p.partyBJoined, title: `Invite the ${other}`, other, email: them.email },
    { id: "preview", sec: "Review", kind: "review", title: "Here's who's on the deal",
      rows: [
        ["You (" + role + ")", [me.name, me.email].filter(Boolean).join(" · ") || "Not added yet", "myName"],
        ["Phone", me.phone || "Not added", "myPhone"],
        ["Mailing address", addr || "Add before signing", "myAddress"],
        ...(documented ? [["Citizenship", me.citizen || "Add before signing", "citizen"]] : []),
        [capFirst(other), p.partyBJoined ? (them.name || "Joined") : (invite.sent ? "Invited" + (them.email ? " · " + them.email : "") : invite.link ? "Invite link created" : "Not invited yet"), p.partyBJoined ? null : "inviteEmail"],
      ],
      note: p.partyBJoined ? `The ${other} has joined and fills in their own details.` : `The ${other} fills in their own details when they join.`,
      moreLabel: "Open the full form",
      finishLabel: role === "buyer" ? "Continue to my offer" : "Continue to the Deal Room",
      onFinish: () => p.onNext(),
      finishBlocked: !(String(me.name || "").trim() && validEmail(me.email)),
      finishBlockedMsg: "Add your name and email first." },
  ];
}

function escrowOptions(seaOn) {
  return [
    { id: "escrow_com", label: "Escrow.com", sub: "Licensed online escrow. Neither side can touch the money until the deal is done." },
    ...(seaOn ? [{ id: "sea_yachts", label: "Sea Yachts (licensed broker)", sub: "A licensed Florida yacht brokerage holds it in a state-regulated trust account, and a real broker you can call runs the closing.", sea: true }] : []),
    { id: "attorney", label: "An attorney or title company", sub: "A licensed professional holds it. Common on larger deals." },
    { id: "brokerage", label: seaOn ? "Another licensed broker" : "A licensed broker", sub: "A state-licensed brokerage holds it in their trust account." },
    { id: "direct", label: "Straight to the seller", sub: "Fastest, but nobody neutral holds the money. The least protected choice." },
    { id: "custom", label: "Something else we agreed", sub: "Describe it in your offer terms." },
  ];
}

function offerQuestions(p) {
  const n = p.negotiate || {};
  const v = p.vessel || {};
  const set = (patch) => p.setNegotiate((d) => ({ ...d, ...patch }));
  const offer = Number(String(n.currentOffer || "").replace(/[^0-9]/g, ""));
  const ask = Number(digits(v.askingPrice));
  const pct = String(n.escrowPct ?? "");
  const hasDeposit = pct !== "" && pct !== "0";
  const deposit = hasDeposit && offer ? Math.round(offer * Number(pct) / 100) : 0;
  const conts = Array.isArray(n.selectedContingencies) ? n.selectedContingencies : [];
  const opts = escrowOptions(p.seaYachtsOn);
  const holder = opts.find((o) => o.id === n.escrowPath);
  let compare = "";
  if (ask) {
    compare = "They're asking " + usd(ask) + ".";
    if (offer && offer < ask) compare += " That's " + usd(ask - offer) + " (" + Math.round((1 - offer / ask) * 100) + "%) under.";
    if (offer && offer > ask) compare += " That's above asking.";
  }
  return [
    { id: "offer", sec: "Your offer", kind: "money", title: "What would you like to offer?",
      help: "Nothing is binding until you both sign. The seller can accept, counter or decline.",
      placeholder: ask ? moneyText(Math.round(ask * 0.92)) : "78,000", value: n.currentOffer || "",
      onChange: (t) => set({ currentOffer: String(t).replace(/[^0-9]/g, "") }),
      required: true, valid: () => offer > 0, error: "Enter your offer amount.", hint: compare,
      why: v.brokerListed === "yes" ? "This boat is listed with a broker. Their commission usually assumes a second broker brings the buyer. If you're representing yourself, that's worth raising when you pick your number. The full offer screen explains it." : null },
    { id: "deposit", sec: "Your offer", kind: "choice", title: "How much deposit will you put down?",
      help: "The deposit takes the boat off the market while you inspect it, and shows the seller you're serious.",
      why: "10% is the standard between brokers, but on a private sale a smaller deposit often does the job. What matters is that it's real money you'd hate to lose. You get it back if the boat fails an inspection you made the deal depend on.",
      options: ["0", "2", "3", "5", "7.5", "10"].map((x) => [x, x === "0" ? "No deposit" : x + "%", x !== "0" && offer ? usd(offer * Number(x) / 100) : (x === "0" ? "The boat isn't held off the market" : "")]),
      grid: true, value: pct, onChange: (val) => set(val === "0" ? { escrowPct: "0", escrowPath: "none" } : { escrowPct: val, escrowPath: n.escrowPath === "none" ? "" : (n.escrowPath || "") }) },
    { id: "holder", sec: "Your offer", kind: "choice", show: () => hasDeposit, noAuto: true,
      title: "Who should hold your " + (deposit ? usd(deposit) + " " : "") + "deposit?",
      help: "BoatClosers never holds money. Pick who does. The seller agrees to it when they accept.",
      why: "Most people pick Escrow.com: it's licensed, online, and charges on the deposit only, not the boat's price. Want a real licensed person you can call? Pick a broker or an attorney. Sending straight to the seller is the least protected.",
      options: opts.map((o) => [o.id, o.label, o.sub]),
      value: n.escrowPath || "", onChange: (val) => set({ escrowPath: val }),
      required: true, valid: () => !!n.escrowPath && n.escrowPath !== "none", error: "Pick who holds the deposit.",
      after: holder && holder.sea ? <SeaYachtsPanel price={offer} /> : null },
    { id: "dd", sec: "Your offer", kind: "choice", title: "How many days do you want to inspect the boat?",
      help: "Your window for a survey and sea trial. If something's wrong, you can walk away with your deposit.",
      why: "Broker tip: 10 days is typical. Book your surveyor before you send the offer so the clock doesn't run out on you.",
      options: [["7", "7 days"], ["10", "10 days"], ["14", "14 days"], ["21", "21 days"]], grid: true,
      value: String(n.dueDiligenceDays || ""), onChange: (val) => set({ dueDiligenceDays: val }) },
    { id: "contingencies", sec: "Your offer", kind: "multi", title: "What does your offer depend on?",
      help: "Tap all that apply. Each one goes into the purchase agreement as a reason you can cancel and get your deposit back.",
      why: "Broker tip: most serious offers include at least a survey. Financing only if you're getting a loan.",
      options: CONTINGENCIES.map(([k, l, s]) => [k, l, s]), values: n.cashWaived ? [] : conts,
      onToggle: (k) => { const on = conts.indexOf(k) >= 0; set({ cashWaived: false, selectedContingencies: on ? conts.filter((x) => x !== k) : conts.concat([k]) }); },
      none: { label: "None, I'm buying it as-is", on: !!n.cashWaived, toggle: () => set(n.cashWaived ? { cashWaived: false } : { cashWaived: true, selectedContingencies: [] }) },
      required: true, valid: () => conts.length > 0 || !!n.cashWaived, error: "Pick at least one, or choose as-is." },
    { id: "lien", sec: "Your offer", kind: "choice", title: "Does the seller still owe money on the boat?",
      help: "If there's a loan, it's paid off at closing so the title comes to you clean. It's the most common reason a deal stalls at the end.",
      options: [["no", "No, it's owned free and clear"], ["yes", "Yes, there's a loan to pay off"], ["unsure", "Not sure yet"]],
      value: n.sellerHasLien || "", onChange: (val) => set({ sellerHasLien: val }) },
    { id: "oreview", sec: "Review", kind: "review", title: "Your offer",
      rows: [
        ["Offer", offer ? usd(offer) + (ask && offer < ask ? " (" + usd(ask - offer) + " under asking)" : "") : "Not added yet", "offer"],
        ["Deposit", hasDeposit ? (pct + "%" + (deposit ? " · " + usd(deposit) : "")) : "No deposit", "deposit"],
        ...(hasDeposit ? [["Held by", holder ? holder.label : "Not chosen yet", "holder"]] : []),
        ["Inspection window", n.dueDiligenceDays ? n.dueDiligenceDays + " days" : "Not chosen", "dd"],
        ["Depends on", n.cashWaived ? "Nothing, as-is" : (conts.length ? conts.map((k) => (CONTINGENCIES.find((c) => c[0] === k) || [k, k])[1]).join(", ") : "Not chosen"), "contingencies"],
        ["Loan on the boat", n.sellerHasLien === "yes" ? "Yes, payoff at closing" : n.sellerHasLien === "no" ? "No" : "Not sure yet", "lien"],
      ],
      note: "Next you'll see your complete offer with all of this filled in. Add a closing date if you like, check it over, and press Send.",
      finishLabel: "Review and send my offer",
      onFinish: () => { set({ builderOpen_buyer: true }); p.onShowForm(); } },
  ];
}

// The Sea Yachts option, shown only where it's switched on (or in owner preview).
function SeaYachtsPanel({ price }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12, border: `1px solid ${K.navy}`, borderRadius: 14, padding: "14px 16px", background: "#f6f8fb", fontFamily: FONT.sans }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: K.navy, marginBottom: 8 }}>What Sea Yachts costs</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SEA_YACHTS.tiers.map((t) => {
          const cost = seaYachtsTierCost(t, price);
          return (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, lineHeight: 1.45 }}>
              <div style={{ color: K.navy }}><b style={{ fontWeight: 600 }}>{t.name}</b><div style={{ color: K.slate, fontSize: 13 }}>{seaYachtsTierPrice(t)}</div></div>
              {cost ? <div style={{ fontWeight: 600, color: K.navy, whiteSpace: "nowrap" }}>{usd(cost)}<div style={{ fontWeight: 400, fontSize: 12, color: K.slate, textAlign: "right" }}>on your deal</div></div> : null}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 13, color: K.slate, marginTop: 10, lineHeight: 1.5 }}>Charged by Sea Yachts, on top of the $249 BoatClosers fee. You both sign a short Sea Yachts agreement before any money moves.</div>
      <button type="button" onClick={() => setOpen(!open)} style={{ border: 0, background: "transparent", padding: "10px 0 4px", fontSize: 13.5, fontWeight: 600, color: K.brassText, cursor: "pointer", fontFamily: FONT.sans }}>
        {open ? "Hide the details" : "Add-ons, disclaimers and license"}
      </button>
      {open && (
        <div style={{ fontSize: 13, color: K.navy, lineHeight: 1.55 }}>
          <div style={{ fontWeight: 600, margin: "6px 0 4px" }}>Optional add-ons</div>
          {SEA_YACHTS.addOns.map(([a, b]) => (
            <div key={a} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "3px 0", borderBottom: `1px solid ${K.line}` }}><span>{a}</span><span style={{ whiteSpace: "nowrap", color: K.slate }}>{b}</span></div>
          ))}
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: K.slate }}>
            {SEA_YACHTS.disclaimers.map((d) => <li key={d} style={{ marginBottom: 4 }}>{d}</li>)}
          </ul>
          <div style={{ marginTop: 8 }}>
            {SEA_YACHTS.legalName}{SEA_YACHTS.licenseNumber ? ` · License ${SEA_YACHTS.licenseNumber}` : ""} · Broker {SEA_YACHTS.broker}.{" "}
            <a href={SEA_YACHTS.verifyUrl} target="_blank" rel="noopener noreferrer" style={{ color: K.navy, fontWeight: 600 }}>Verify the license with the state</a>
          </div>
          {(SEA_YACHTS.phone || SEA_YACHTS.email) && (
            <div style={{ marginTop: 6 }}>Talk to a real person {SEA_YACHTS.replyPromise}: {SEA_YACHTS.phone && <a href={`tel:${SEA_YACHTS.phone}`} style={{ color: K.navy, fontWeight: 600 }}>{SEA_YACHTS.phone}</a>}{SEA_YACHTS.phone && SEA_YACHTS.email && " · "}{SEA_YACHTS.email && <a href={`mailto:${SEA_YACHTS.email}`} style={{ color: K.navy, fontWeight: 600 }}>{SEA_YACHTS.email}</a>}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────────────
const optionStyle = (on) => ({
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%",
  minHeight: 58, padding: "13px 16px", borderRadius: 14, fontSize: 16.5, fontWeight: 500, textAlign: "left",
  color: K.navy, cursor: "pointer", fontFamily: FONT.sans, boxSizing: "border-box",
  background: on ? K.sel : K.white, border: on ? `2px solid ${K.brass}` : `1px solid ${K.mist}`, margin: on ? 0 : 1,
});
const Dot = ({ on, square }) => (
  <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, boxSizing: "border-box", borderRadius: square ? 6 : "50%",
    background: on ? K.navy : "transparent", border: on ? `6px solid ${K.brass}` : "2px solid #b9ae9c" }} />
);
const inputStyle = (money, mono) => ({
  width: "100%", boxSizing: "border-box", minHeight: 60, borderRadius: 14, border: `1px solid ${K.mist}`, background: K.white,
  fontFamily: mono ? "ui-monospace, Menlo, monospace" : FONT.sans, letterSpacing: mono ? 1 : 0, fontSize: 21, fontWeight: 500,
  color: K.navy, padding: money ? "0 16px 0 34px" : "0 16px", outline: "none",
});

// ─────────────────────────────────────────────────────────────────────────────
// The guided screen
// ─────────────────────────────────────────────────────────────────────────────
export default function GuidedStep(props) {
  const { step } = props;
  const voice = useVoice();
  const [i, setI] = useState(0);
  const [why, setWhy] = useState(false);
  const [err, setErr] = useState("");

  // Invite state (same server call the full form makes).
  const [inviteMode, setInviteMode] = useState("email");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteErr, setInviteErr] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const role = props.role === "seller" ? "seller" : "buyer";
  const other = role === "buyer" ? "seller" : "buyer";

  const runInvite = async (asLink) => {
    const email = props.parties?.[other]?.email;
    if (!asLink && !validEmail(email)) { setInviteErr(`Enter the ${other}'s email first, or get a link instead.`); return; }
    if (!props.user?.userId) { setInviteErr("Please sign in again, then try."); return; }
    setInviteBusy(true); setInviteErr("");
    let id = props.dealId;
    if (!id && props.ensureSaved) id = await props.ensureSaved();
    if (!id) { setInviteBusy(false); setInviteErr("Couldn't save the deal yet. Add the boat details first, then try again."); return; }
    try {
      const res = await fetch("/api/deals/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(props.authToken ? { Authorization: "Bearer " + props.authToken } : (props.authHeaders ? props.authHeaders() : {})) },
        body: JSON.stringify({ dealId: id, inviteEmail: (!asLink && email) ? email : `link-share-${other}@boatclosers.com`, inviteRole: other, userId: props.user.userId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setInviteErr(j?.error || "Could not create the invite."); setInviteBusy(false); return; }
      if (asLink) setInviteLink(j.shortUrl || j.inviteUrl || ""); else setInviteSent(true);
    } catch (e) { setInviteErr("Network error, please try again."); }
    setInviteBusy(false);
  };
  const invite = { sent: inviteSent, link: inviteLink, setMode: setInviteMode };

  const all = step === 0 ? vesselQuestions(props) : step === 1 ? partiesQuestions(props, invite) : offerQuestions(props);
  const qs = all.filter((q) => !q.show || q.show());
  const idx = Math.min(i, qs.length - 1);
  const q = qs[idx];
  const isLast = idx === qs.length - 1;
  const answered = qs.filter((x) => x.kind !== "review").length;
  const pos = q.kind === "review" ? answered : idx + 1;

  // Scroll to the top of the question when it changes, so phones don't land mid-page.
  const topRef = useRef(null);
  useEffect(() => {
    setWhy(false); setErr(""); voice.clear();
    try { topRef.current && topRef.current.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (e) {}
  }, [idx, step]); // eslint-disable-line

  const goTo = (id) => { const n = qs.findIndex((x) => x.id === id); if (n >= 0) setI(n); };
  const next = () => {
    if (q.required && q.valid && !q.valid()) { setErr(q.error || "Please answer this to continue."); return; }
    if (q.kind === "review") {
      if (q.finishBlocked) { setErr(q.finishBlockedMsg || ""); return; }
      q.onFinish && q.onFinish();
      return;
    }
    setI(Math.min(idx + 1, qs.length - 1));
  };
  const back = () => setI(Math.max(0, idx - 1));
  const skip = () => { q.onSkip && q.onSkip(); setI(Math.min(idx + 1, qs.length - 1)); };

  const onVoice = () => {
    if (voice.listening) { voice.stop(); return; }
    voice.start((t) => {
      if (q.kind === "money" || q.inputMode === "numeric") q.onChange(spokenToNumber(t));
      else if (q.inputMode === "email") q.onChange(t.toLowerCase().replace(/\s+at\s+/g, "@").replace(/\s+dot\s+/g, ".").replace(/\s+/g, ""));
      else q.onChange(t);
    });
  };

  const sectionLabel = step === 0 ? "Step 1 · The boat" : step === 1 ? "Step 2 · The people" : "Step 3 · Your offer";
  const nextLabel = q.kind === "review" ? q.finishLabel : (q.kind === "invite" ? (inviteSent || inviteLink ? "Continue" : "Skip for now") : "Continue");

  return (
    <div ref={topRef} style={{ maxWidth: 600, margin: "0 auto", padding: "22px 18px 40px", fontFamily: FONT.sans, color: K.navy, scrollMarginTop: 80 }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 13, marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: K.brassText, letterSpacing: 0.6, textTransform: "uppercase" }}>{sectionLabel}</span>
        <span style={{ color: K.slate }}>{pos} of {answered}</span>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: "#ece5d8", overflow: "hidden", marginBottom: 26 }}>
        <div style={{ height: 6, borderRadius: 6, background: K.brass, width: Math.round((pos / answered) * 100) + "%", transition: "width .3s" }} />
      </div>

      <div style={{ background: K.paper, border: `1px solid ${K.line}`, borderRadius: 22, padding: "26px 22px 22px", boxShadow: "0 1px 2px rgba(8,21,46,0.04)" }}>
        <h2 style={{ margin: 0, fontFamily: FONT.serif, fontWeight: 500, fontSize: 30, lineHeight: 1.15 }}>{q.title}</h2>
        {q.help && <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.5, color: K.slate }}>{q.help}</p>}

        {/* Text and money */}
        {(q.kind === "text" || q.kind === "money") && (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                {q.kind === "money" && <span aria-hidden="true" style={{ position: "absolute", left: 15, fontSize: 21, fontWeight: 500, color: K.slate }}>$</span>}
                <input aria-label={q.title} autoFocus type="text" inputMode={q.kind === "money" ? "numeric" : (q.inputMode || "text")}
                  autoComplete="off" spellCheck={q.inputMode === "email" || q.mono ? false : undefined} autoCapitalize={q.inputMode === "email" ? "none" : undefined}
                  value={q.kind === "money" ? moneyText(q.value) : q.value} placeholder={q.placeholder}
                  onChange={(e) => { setErr(""); q.onChange(e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter") next(); }}
                  style={inputStyle(q.kind === "money", q.mono)} />
              </div>
              {voice.supported && (
                <button type="button" onClick={onVoice} aria-label={voice.listening ? "Stop listening" : "Answer by voice"}
                  style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 14, border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    background: voice.listening ? K.brass : K.navy, color: voice.listening ? K.navy : K.paper }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
                </button>
              )}
            </div>
            {voice.listening && <div style={{ marginTop: 10, fontSize: 14, color: K.brassText, fontWeight: 500 }}>Listening… say your answer</div>}
            {voice.note && <div style={{ marginTop: 10, fontSize: 14, color: K.slate }}>{voice.note}</div>}
            {q.chips && !q.value && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {q.chips.map((c) => (
                  <button key={c} type="button" onClick={() => q.onChange(c)} style={{ border: `1px solid ${K.mist}`, background: K.white, borderRadius: 999, padding: "10px 14px", fontSize: 14, color: K.navy, minHeight: 44, cursor: "pointer", fontFamily: FONT.sans }}>{c}</button>
                ))}
              </div>
            )}
            {q.hint && <div style={{ marginTop: 12, fontSize: 15, color: K.slate }}>{q.hint}</div>}
            {q.extra && <div style={{ marginTop: 10 }}>{q.extra}</div>}
            {q.note && (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: K.cream, fontSize: 14, lineHeight: 1.5 }}>
                {q.note.text} {q.note.href && <a href={q.note.href} style={{ color: K.navy, fontWeight: 600 }}>{q.note.link}</a>}
              </div>
            )}
          </div>
        )}

        {/* Address */}
        {q.kind === "address" && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {q.fields.map(([k, label, val]) => (
              <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5, color: K.slate, fontWeight: 500 }}>
                {label}
                <input type="text" value={val || ""} onChange={(e) => q.onField(k, e.target.value)} autoComplete={k === "address" ? "street-address" : k === "city" ? "address-level2" : "postal-code"} style={{ ...inputStyle(false), minHeight: 54, fontSize: 18 }} />
              </label>
            ))}
          </div>
        )}

        {/* Single choice */}
        {q.kind === "choice" && (
          <div style={{ marginTop: 22, display: q.grid ? "grid" : "flex", gridTemplateColumns: q.grid ? "repeat(2, minmax(0, 1fr))" : undefined, flexDirection: "column", gap: 10 }}>
            {q.options.map(([val, label, sub]) => {
              const on = q.value === val;
              return (
                <button key={String(val)} type="button" aria-pressed={on} style={optionStyle(on)}
                  onClick={() => { setErr(""); q.onChange(val); if (!q.noAuto && !isLast) setTimeout(() => setI((cur) => (cur === idx ? Math.min(idx + 1, qs.length - 1) : cur)), 260); }}>
                  <span style={{ minWidth: 0 }}>{label}{sub ? <span style={{ display: "block", fontSize: 13.5, fontWeight: 400, color: K.slate, marginTop: 3, lineHeight: 1.4 }}>{sub}</span> : null}</span>
                  <Dot on={on} />
                </button>
              );
            })}
          </div>
        )}
        {q.after}

        {/* Multi choice */}
        {q.kind === "multi" && (
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map(([val, label, sub]) => {
              const on = q.values.indexOf(val) >= 0;
              return (
                <button key={val} type="button" aria-pressed={on} style={optionStyle(on)} onClick={() => { setErr(""); q.onToggle(val); }}>
                  <span>{label}{sub ? <span style={{ display: "block", fontSize: 13.5, fontWeight: 400, color: K.slate, marginTop: 3 }}>{sub}</span> : null}</span>
                  <Dot on={on} square />
                </button>
              );
            })}
            {q.none && (
              <button type="button" aria-pressed={q.none.on} style={optionStyle(q.none.on)} onClick={() => { setErr(""); q.none.toggle(); }}>
                <span>{q.none.label}</span><Dot on={q.none.on} square />
              </button>
            )}
          </div>
        )}

        {/* Custom (e.g. update preferences, reusing the full form's own control) */}
        {q.kind === "custom" && <div style={{ marginTop: 20 }}>{q.render()}</div>}

        {/* Invite */}
        {q.kind === "invite" && (
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            {inviteSent ? (
              <div style={{ padding: "14px 16px", borderRadius: 14, background: "#e8f1ea", fontSize: 15, lineHeight: 1.5 }}>
                Invite sent to <b>{props.parties?.[other]?.email}</b>. We'll let you know the moment they join.
              </div>
            ) : inviteLink ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 15, color: K.slate }}>Send this link to the {other} by text or message:</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly aria-label="Invite link" value={inviteLink} onFocus={(e) => e.target.select()} style={{ ...inputStyle(false), fontSize: 15, minHeight: 52 }} />
                  <button type="button" onClick={() => { try { navigator.clipboard.writeText(inviteLink); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{ flexShrink: 0, minWidth: 84, borderRadius: 14, border: 0, background: K.navy, color: K.paper, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{copied ? "Copied" : "Copy"}</button>
                </div>
              </div>
            ) : (
              <>
                {inviteMode === "email" && validEmail(props.parties?.[other]?.email) && (
                  <button type="button" disabled={inviteBusy} onClick={() => runInvite(false)} style={{ ...optionStyle(false), justifyContent: "center", background: K.brass, border: 0, fontWeight: 600 }}>
                    {inviteBusy ? "Sending…" : `Email the invite to ${props.parties?.[other]?.email}`}
                  </button>
                )}
                <button type="button" disabled={inviteBusy} onClick={() => runInvite(true)} style={{ ...optionStyle(false), justifyContent: "center", fontWeight: 600 }}>
                  {inviteBusy && inviteMode === "link" ? "Creating…" : "Get a link I can text them"}
                </button>
                <div style={{ fontSize: 13.5, color: K.slate, lineHeight: 1.5 }}>Nothing is shared with the {other} until you send this. They join free.</div>
              </>
            )}
            {inviteErr && <div role="alert" style={{ fontSize: 14, color: K.red }}>{inviteErr}</div>}
          </div>
        )}

        {/* Review */}
        {q.kind === "review" && (
          <div style={{ marginTop: 18 }}>
            <div style={{ border: `1px solid ${K.mist}`, borderRadius: 16, background: K.white, overflow: "hidden" }}>
              {q.rows.map(([label, value, target], n) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderTop: n ? `1px solid ${K.line}` : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: K.slate }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2, overflowWrap: "anywhere" }}>{value}</div>
                  </div>
                  {target && <button type="button" onClick={() => goTo(target)} style={{ border: 0, background: "transparent", fontSize: 14, fontWeight: 600, color: K.navy, textDecoration: "underline", padding: "12px 4px", cursor: "pointer", fontFamily: FONT.sans }}>Edit</button>}
                </div>
              ))}
            </div>
            {q.note && <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.5, color: K.slate }}>{q.note}</p>}
            {q.moreLabel && (
              <button type="button" onClick={props.onShowForm} style={{ marginTop: 12, border: `1px dashed ${K.brass}`, background: "transparent", borderRadius: 12, padding: "12px 14px", fontSize: 14.5, fontWeight: 600, color: K.navy, cursor: "pointer", fontFamily: FONT.sans, width: "100%" }}>
                {q.moreLabel} (full form)
              </button>
            )}
          </div>
        )}

        {/* Why we ask */}
        {q.why && (
          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={() => setWhy(!why)} style={{ border: 0, background: "transparent", padding: "8px 0", fontSize: 14, fontWeight: 600, color: K.brassText, cursor: "pointer", fontFamily: FONT.sans }}>
              {why ? "Hide" : "Why are we asking?"}
            </button>
            {why && <div style={{ padding: "12px 14px", borderRadius: 12, background: K.cream, fontSize: 14, lineHeight: 1.55 }}>{q.why}</div>}
          </div>
        )}

        {err && <div role="alert" style={{ marginTop: 14, fontSize: 14.5, color: K.red, fontWeight: 500 }}>{err}</div>}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {idx > 0 && (
            <button type="button" onClick={back} aria-label="Back" style={{ width: 56, minHeight: 56, borderRadius: 14, border: `1px solid ${K.mist}`, background: K.white, color: K.navy, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}
          <button type="button" onClick={next} style={{ flex: 1, minHeight: 56, borderRadius: 14, border: 0, background: K.navy, color: K.paper, fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans }}>{nextLabel}</button>
        </div>
        {q.skipLabel && (
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <button type="button" onClick={skip} style={{ border: 0, background: "transparent", padding: 10, fontSize: 15, fontWeight: 500, color: K.slate, cursor: "pointer", fontFamily: FONT.sans }}>{q.skipLabel}</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button type="button" onClick={props.onShowForm} style={{ border: 0, background: "transparent", padding: 10, fontSize: 14, color: K.slate, textDecoration: "underline", cursor: "pointer", fontFamily: FONT.sans }}>
          See all fields on one page instead
        </button>
      </div>
    </div>
  );
}
