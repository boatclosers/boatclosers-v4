// ─────────────────────────────────────────────────────────────────────────────
// SEA YACHTS ESCROW & CLOSING — the one place to configure it.
// Plan: "Sea Yachts Escrow & Closing Plan" doc (Nov 2026).
//
// Sea Yachts LLC (a licensed Florida yacht brokerage owned by BoatClosers'
// founder) can hold the deposit and run the closing as a neutral,
// limited-scope broker for both parties. Customers stay on BoatClosers.
//
// OFF until ENABLED is true. While off, customers never see it and nothing
// about existing deals changes. Before switching on (see the plan's checklist):
//   1. Attorney review — limited-scope agreement, financing-contingency
//      release, boats under 32 ft in the trust account, money-transmitter
//      rules, ownership disclosure, these disclaimers, the Terms.
//   2. Tax confirmation (collect vs. waiver when holding the full closing).
//   3. Fill in licenseNumber, phone and email; confirm the prices below.
//   4. Crime/fidelity insurance in place; confirm every wire by phone.
// ─────────────────────────────────────────────────────────────────────────────

export const SEA_YACHTS = {
  ENABLED: false,

  legalName: "Sea Yachts LLC",
  broker: "Garry Chupurdy Jr.",
  licenseNumber: "",          // e.g. "BK0000000" — shown beside the Verify link
  phone: "",                  // shown so people can call a real person
  email: "",
  replyPromise: "within one business day",

  // Florida DBPR public license lookup.
  verifyUrl: "https://www.myfloridalicense.com/portalsearches/VerifyLicensee",

  // Suggested starting prices from the plan — not final until Garry confirms.
  tiers: [
    {
      id: "deposit",
      name: "Deposit only",
      flat: 395,
      covers:
        "We hold the earnest-money deposit in our trust account and release it under your signed agreement. Best when your lender pays the seller directly.",
    },
    {
      id: "financed",
      name: "Financed closing",
      pct: 1, min: 995,
      covers:
        "We hold the deposit while your loan is approved, work the lender's checklist (signed agreement, title, survey, insurance naming the lender), coordinate the lender's funds and any payoff of the seller's loan, and run the closing.",
    },
    {
      id: "cash",
      name: "Cash closing",
      pct: 1.25, min: 1250, cap: 5000,
      covers:
        "We hold the deposit and the full purchase payment, pay off any loan on the boat, handle the sales tax, release the funds at closing and give you both an itemized closing statement.",
    },
  ],

  addOns: [
    ["Florida title and registration (through our documentation partner)", "Partner's price + $150"],
    ["Coast Guard documentation transfer, incl. lender mortgage recording", "Partner's price + $200"],
    ["Out-of-state buyer sales tax exemption paperwork", "$295"],
    ["Rush closing, under 72 hours", "$250"],
    ["Remote closing / mobile notary coordination", "Notary cost + $75"],
    ["Deposit held more than 60 days", "$50 per month"],
  ],

  disclaimers: [
    "Sea Yachts LLC is owned by BoatClosers' founder. Its fee is separate from the $249 BoatClosers fee.",
    "Sea Yachts acts as a neutral, limited-scope broker for both of you: it holds the money and runs the closing, and does not negotiate for or advise either side.",
    "Funds are held only under the signed Sea Yachts escrow & closing agreement and released only as it says, or on joint written instructions. If you disagree about the money, it stays put until you both agree in writing or a court decides.",
    "Sales tax is a state tax, not our fee. We either collect and pay it to Florida for you, or you sign a waiver confirming you'll pay it when you title or register the boat with your county tax collector.",
    "Sea Yachts does not guarantee the boat's condition, title history or value. BoatClosers is a software platform, not a broker, escrow agent or law firm. Neither gives legal or tax advice.",
  ],
};

const money = (n) => "$" + Number(n).toLocaleString("en-US");

export function seaYachtsTierPrice(t) {
  if (!t) return "Quoted";
  if (t.flat != null) return `${money(t.flat)} flat`;
  if (t.pct != null) {
    let s = `${t.pct}% of the price`;
    if (t.min != null) s += `, ${money(t.min)} minimum`;
    if (t.cap != null) s += `, ${money(t.cap)} max`;
    return s;
  }
  return "Quoted before you sign";
}

// What a tier costs on a given sale price (for the "on your deal" line).
export function seaYachtsTierCost(t, price) {
  const p = Number(price) || 0;
  if (!t) return null;
  if (t.flat != null) return t.flat;
  if (t.pct == null || !p) return null;
  let c = Math.round((p * t.pct) / 100);
  if (t.min != null) c = Math.max(c, t.min);
  if (t.cap != null) c = Math.min(c, t.cap);
  return c;
}
