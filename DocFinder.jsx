import React, { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// "WHICH DOCUMENT DO I NEED?" — interactive guide
//
// A plain-language decision tree over the full document library. The customer
// answers a question, branches, and lands on the exact document(s) they need,
// each with a one-line reason and a button to open it. Turns 50 documents from
// something overwhelming into something helpful.
//
// The TREE is pure data: each node is either a QUESTION (with options that point
// to the next node) or a RESULT (a list of documents). Doc ids match documents.js.
// onOpenDoc(id) lets the parent jump to / scroll to that document.
// ─────────────────────────────────────────────────────────────────────────────

const TREE = {
  start: {
    q: "What are you trying to do?",
    hint: "Pick the closest — you can always go back.",
    options: [
      { label: "Buy or sell a boat (a normal sale)", to: "sale" },
      { label: "Transfer a boat with no sale (gift, family, add/remove a name)", to: "transfer" },
      { label: "Deal with a boat after someone passed away", to: "estate" },
      { label: "Fix a title problem (lost title, no paperwork)", to: "titleproblem" },
      { label: "Handle something that came up mid-deal", to: "middeal" },
    ],
  },

  // ── NORMAL SALE ────────────────────────────────────────────────────────────
  sale: {
    q: "Where are you in the sale?",
    options: [
      { label: "Just starting — need the core paperwork", to: "sale_core" },
      { label: "Buyer is financing or needs insurance", to: "sale_finance" },
      { label: "Doing the title/registration transfer", to: "sale_title" },
      { label: "Closing day — the handoff", to: "sale_closing" },
    ],
  },
  sale_core: {
    result: "The core documents every sale needs",
    docs: [
      { id: "psa", why: "The main contract — price, terms, contingencies, dates." },
      { id: "dep", why: "Records the earnest-money deposit that holds the boat." },
      { id: "asis", why: "Buyer accepts condition; seller discloses known defects." },
      { id: "bos", why: "Transfers ownership at closing." },
      { id: "fl_82050", why: "Florida\u2019s official Bill of Sale — use if your county tax collector requires the state form." },
      { id: "stmt", why: "The final money tally for both sides." },
      { id: "inventory", why: "Optional — itemize exactly what gear conveys, if it matters." },
    ],
  },
  sale_finance: {
    result: "For a financed or insured purchase",
    docs: [
      { id: "fin_conditions", why: "Checklist of what the lender and insurer will require." },
      { id: "commitment", why: "The lender's written commitment to fund the loan." },
      { id: "binder", why: "Proof the buyer has insurance in place before closing." },
      { id: "survey_report", why: "Lenders and insurers usually require a marine survey." },
    ],
  },
  sale_title: {
    q: "Is it a state-titled boat or a USCG-documented vessel?",
    options: [
      { label: "State-titled (most boats)", to: "sale_title_state" },
      { label: "USCG-documented vessel", to: "sale_title_uscg" },
      { label: "Not sure", to: "sale_title_unsure" },
    ],
  },
  sale_title_state: {
    result: "To transfer a state-titled boat",
    docs: [
      { id: "title_app", why: "Buyer's application for a new title in their name." },
      { id: "notice_sale", why: "Notifies the state the boat changed hands." },
      { id: "hin_affidavit", why: "If the HIN needs to be verified for the title office." },
      { id: "lien_release", why: "If there was a loan — proof the lien is cleared." },
    ],
  },
  sale_title_uscg: {
    result: "For a USCG-documented vessel",
    docs: [
      { id: "uscg_transfer", why: "The Coast Guard bill of sale and transfer/deletion." },
      { id: "mortgage_release", why: "If there's a preferred ship's mortgage to release." },
      { id: "lost_cod", why: "If the Certificate of Documentation is lost." },
    ],
  },
  sale_title_unsure: {
    result: "Quick way to tell",
    plain:
      "If the boat has a state registration sticker/number (like FL-1234-AB) it's state-titled. If it has a name and hailing port on the hull and a USCG Official Number, it's documented. When in doubt, a title & lien search settles it.",
    docs: [
      { id: "title_search_letter", why: "Requests the official title/lien history so you know what you've got." },
    ],
  },
  sale_closing: {
    result: "Closing-day handoff documents",
    docs: [
      { id: "delivery_receipt", why: "Confirms the buyer took possession and when." },
      { id: "defect_disclosure", why: "Seller's final written disclosure of known defects." },
      { id: "engine_hours", why: "Records engine hours at handoff — prevents later disputes." },
      { id: "stmt", why: "The settlement statement, if not already done." },
    ],
  },

  // ── TRANSFER, NO SALE ───────────────────────────────────────────────────────
  transfer: {
    q: "What kind of transfer?",
    options: [
      { label: "Gift or family transfer", to: "transfer_gift" },
      { label: "Just a bill of sale, boat has no title", to: "transfer_bosonly" },
      { label: "Add / remove a co-owner or fix a name", to: "transfer_name" },
      { label: "Someone signing on behalf of an owner or business", to: "transfer_authority" },
    ],
  },
  transfer_gift: {
    result: "For a gift or family transfer",
    docs: [
      { id: "gift_transfer", why: "Documents the transfer as a gift, not a sale." },
      { id: "bos", why: "Still transfers legal ownership of the boat." },
      { id: "title_app", why: "New owner applies to retitle in their name." },
    ],
  },
  transfer_bosonly: {
    result: "When there's no title, only a bill of sale",
    docs: [
      { id: "bos_only", why: "Affidavit supporting a bill-of-sale-only transfer." },
      { id: "chain_title", why: "Documents the ownership chain when the paper trail is thin." },
      { id: "title_search_letter", why: "Confirms no hidden liens before you rely on a BOS alone." },
    ],
  },
  transfer_name: {
    result: "To add/remove an owner or fix a name",
    docs: [
      { id: "coowner", why: "A co-owner consents to the sale or transfer." },
      { id: "same_person", why: "Affidavit when a name is spelled differently across documents." },
    ],
  },
  transfer_authority: {
    q: "Who's signing?",
    options: [
      { label: "Someone with power of attorney", to: "transfer_poa" },
      { label: "An officer signing for a company/LLC", to: "transfer_entity" },
    ],
  },
  transfer_poa: {
    result: "Signing under power of attorney",
    docs: [{ id: "poa", why: "Authorizes a named person to sign the transfer for the owner." }],
  },
  transfer_entity: {
    result: "Signing for a business",
    docs: [{ id: "entity_auth", why: "Shows the company authorized this person to sell the vessel." }],
  },

  // ── ESTATE ──────────────────────────────────────────────────────────────────
  estate: {
    q: "Is there a probate/estate process, or a will?",
    hint: "If you're unsure, start with the guide.",
    options: [
      { label: "Start me at the beginning", to: "estate_start" },
      { label: "There's an executor / administrator", to: "estate_executor" },
      { label: "No formal estate — small or informal", to: "estate_small" },
    ],
  },
  estate_start: {
    result: "Start here for an inherited boat",
    docs: [
      { id: "estate_guide", why: "Plain-language walkthrough of your options." },
      { id: "death_cert", why: "You'll need a certified death certificate for any path." },
    ],
  },
  estate_executor: {
    result: "When there's an executor or administrator",
    docs: [
      { id: "executor_auth", why: "Authorizes the executor to sell the vessel." },
      { id: "death_cert", why: "Required to prove the estate." },
      { id: "bos", why: "The executor uses this to transfer the boat once authorized." },
    ],
  },
  estate_small: {
    result: "For a small or informal estate",
    docs: [
      { id: "small_estate", why: "Affidavit to transfer without full probate, where allowed." },
      { id: "heirship", why: "Establishes who the legal heirs are." },
      { id: "death_cert", why: "Required to prove the owner passed." },
    ],
  },

  // ── TITLE PROBLEMS ──────────────────────────────────────────────────────────
  titleproblem: {
    q: "What's the title problem?",
    options: [
      { label: "Lost or missing title", to: "tp_lost_title" },
      { label: "Lost registration", to: "tp_lost_reg" },
      { label: "Documented vessel — lost COD", to: "tp_lost_cod" },
      { label: "Old loan still shows on the title", to: "tp_oldlien" },
      { label: "No paperwork at all", to: "tp_none" },
    ],
  },
  tp_lost_title: {
    result: "For a lost or missing title",
    docs: [
      { id: "lost_title", why: "Affidavit to request a duplicate/replacement title." },
      { id: "title_search_letter", why: "Confirms current owner and any liens first." },
    ],
  },
  tp_lost_reg: {
    result: "For a lost registration",
    docs: [{ id: "lost_reg", why: "Registration-only / lost registration affidavit." }],
  },
  tp_lost_cod: {
    result: "For a documented vessel's lost COD",
    docs: [{ id: "lost_cod", why: "Affidavit for a lost Certificate of Documentation." }],
  },
  tp_oldlien: {
    result: "When an old loan still shows",
    docs: [
      { id: "lien_release", why: "Proof the state lien is satisfied and released." },
      { id: "mortgage_release", why: "For a USCG preferred ship's mortgage." },
      { id: "payoff", why: "If the loan isn't actually paid off yet — demand the payoff." },
    ],
  },
  tp_none: {
    result: "When there's no paperwork at all",
    docs: [
      { id: "bos_only", why: "Bill-of-sale-only transfer affidavit." },
      { id: "chain_title", why: "Reconstructs the ownership chain." },
      { id: "hin_affidavit", why: "Verifies the hull ID when records are missing." },
      { id: "title_search_letter", why: "Find out what the state actually has on file." },
    ],
  },

  // ── MID-DEAL SITUATIONS ─────────────────────────────────────────────────────
  middeal: {
    q: "What came up?",
    options: [
      { label: "Survey found issues — seller will repair", to: "md_repair" },
      { label: "Survey found issues — renegotiate the price", to: "md_reneg" },
      { label: "Need more time on a deadline", to: "md_extend" },
      { label: "Buyer wants to skip/waive a contingency", to: "md_waive" },
      { label: "Someone wants to use the boat before closing", to: "md_possession" },
      { label: "Deal is falling apart — walking away", to: "md_terminate" },
      { label: "Part of the price is a trade-in or a loan", to: "md_structure" },
    ],
  },
  md_repair: {
    result: "Seller agrees to repair before closing",
    docs: [{ id: "repair_agreement", why: "Locks in what gets fixed, by when, and who pays." }],
  },
  md_reneg: {
    result: "Renegotiating after the survey",
    docs: [
      { id: "amend", why: "Records the agreed price/term change as an addendum." },
      { id: "survey_report", why: "The findings that justify the change." },
    ],
  },
  md_extend: {
    result: "Extending a deadline",
    docs: [{ id: "extension_addendum", why: "Both sign to move a deadline — a real record, not just a verbal 'ok'." }],
  },
  md_waive: {
    result: "Waiving a contingency",
    docs: [{ id: "contingency_waiver", why: "Buyer knowingly gives up a condition, in writing." }],
  },
  md_possession: {
    result: "Using the boat before closing",
    docs: [{ id: "early_possession", why: "Sets who's responsible and insured before title passes — don't skip this." }],
  },
  md_terminate: {
    result: "Ending the deal",
    docs: [
      { id: "term", why: "Notice of termination and how the deposit is handled." },
    ],
  },
  md_structure: {
    q: "Which one?",
    options: [
      { label: "Trade-in as part of the price", to: "md_tradein" },
      { label: "Seller is financing the buyer", to: "md_sellerfinance" },
      { label: "There's a trailer included", to: "md_trailer" },
    ],
  },
  md_tradein: {
    result: "Trade-in as partial payment",
    docs: [{ id: "trade_in", why: "Records the trade-in boat and adjusts the balance due." }],
  },
  md_sellerfinance: {
    result: "Seller financing the buyer",
    docs: [
      { id: "promissory_note", why: "The buyer's written promise to pay over time." },
      { id: "security_agreement", why: "Gives the seller a security interest until it's paid off." },
    ],
  },
  md_trailer: {
    result: "Trailer included in the sale",
    docs: [{ id: "trailer_bos", why: "A trailer has its own title — it needs its own bill of sale." }],
  },
};

export default function DocFinder({ DOCUMENTS, onOpenDoc, C, S, onClose }) {
  const [path, setPath] = useState(["start"]);
  const nodeKey = path[path.length - 1];
  const node = TREE[nodeKey];
  const docTitle = (id) => (DOCUMENTS.find((d) => d.id === id) || {}).title || id;

  const go = (to) => setPath((p) => [...p, to]);
  const back = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const restart = () => setPath(["start"]);

  const brass = (C && C.brass) || "#b8863a";
  const navy = (C && C.navy) || "#08152e";
  const slate = (C && C.slate) || "#475569";
  const mist = (C && C.mist) || "#e2e8f0";
  const sand = (C && C.sandDark) || "#f4f1ea";

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: navy }}>Which document do I need?</div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: slate, cursor: "pointer", lineHeight: 1 }}>×</button>
        )}
      </div>

      {node.q && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: navy, marginBottom: node.hint ? 4 : 12 }}>{node.q}</div>
          {node.hint && <div style={{ fontSize: 12, color: slate, marginBottom: 12 }}>{node.hint}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {node.options.map((o) => (
              <button
                key={o.to}
                onClick={() => go(o.to)}
                style={{
                  textAlign: "left", padding: "13px 15px", borderRadius: 8, border: `1px solid ${mist}`,
                  background: "#fff", color: navy, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  fontFamily: "sans-serif", lineHeight: 1.4,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = brass; e.currentTarget.style.background = "#fffdf8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = mist; e.currentTarget.style.background = "#fff"; }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {node.result && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: brass, marginBottom: 4 }}>{node.result}</div>
          {node.plain && <div style={{ fontSize: 12.5, color: slate, lineHeight: 1.7, marginBottom: 12, background: sand, borderRadius: 8, padding: "11px 13px" }}>{node.plain}</div>}
          <div style={{ fontSize: 12, color: slate, marginBottom: 12 }}>You'll want {node.docs.length === 1 ? "this document" : `these ${node.docs.length} documents`}:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {node.docs.map((d) => (
              <div key={d.id} style={{ border: `1px solid ${mist}`, borderLeft: `4px solid ${brass}`, borderRadius: 8, padding: "12px 14px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: navy }}>{docTitle(d.id)}</div>
                  {onOpenDoc && (
                    <button onClick={() => onOpenDoc(d.id)} style={{ fontSize: 12, fontWeight: 700, color: navy, background: "transparent", border: `1px solid ${brass}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>Open →</button>
                  )}
                </div>
                <div style={{ fontSize: 12, color: slate, lineHeight: 1.6, marginTop: 5 }}>{d.why}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 18, borderTop: `1px solid ${mist}`, paddingTop: 14 }}>
        {path.length > 1 && (
          <button onClick={back} style={{ fontSize: 12.5, fontWeight: 600, color: slate, background: "transparent", border: `1px solid ${mist}`, borderRadius: 6, padding: "8px 14px", cursor: "pointer" }}>← Back</button>
        )}
        {path.length > 1 && (
          <button onClick={restart} style={{ fontSize: 12.5, fontWeight: 600, color: slate, background: "transparent", border: `1px solid ${mist}`, borderRadius: 6, padding: "8px 14px", cursor: "pointer" }}>Start over</button>
        )}
      </div>
    </div>
  );
}
