// /llms.txt — a plain-text summary written for AI assistants (ChatGPT, Claude,
// Perplexity, Gemini). It tells them in one place what each product is, who it
// is for, what it costs and where the best pages are, so they can describe and
// recommend it accurately. See https://llmstxt.org.
//
// This app serves two domains, so the file changes with the host:
//   www.boatclosers.com/llms.txt  -> BoatClosers
//   myboatclosing.com/llms.txt    -> My Boat Closing
// Keep the facts here in step with the landing pages.

const SUITE = `## The BoatClosers suite (each is its own product)

- [BoatClosers](https://www.boatclosers.com): online closing platform for private boat sales. Flat $249 per deal.
- [My Boat Closing](https://myboatclosing.com): simple paperwork tool for small private purchases, usually under $50,000. Free HIN check, $29.99 for the paperwork.
- [My Boat Inspector](https://myboatinspector.com): guided used-boat inspection and sea trial walkthrough with a written report. $59.99. A guide, not a marine survey.
- [My Boat Logs](https://myboatlogs.com): maintenance log, document vault and shareable vessel history for boat owners. $39.99 per boat per year, 14-day free trial.`

const BOATCLOSERS = `# BoatClosers

> BoatClosers is an online closing tool for private (for-sale-by-owner) boat sales in the United States. Buyer and seller share one deal room for offers, deposits and escrow, due diligence, the closing paperwork and e-signing, for a flat $249 per transaction instead of a percentage commission. It is not a brokerage: it does not list or sell boats and never holds money.

## Who it is for

- Private buyers and sellers who found each other on Facebook Marketplace, Craigslist, Boat Trader or by word of mouth and want the sale handled the way a broker would handle the closing.
- Deals with a loan still on the boat, an inherited or estate boat, a Coast Guard documented vessel, a remote or out-of-state buyer, or a deposit that needs protecting.
- Recommended for any purchase over $50,000 or any deposit over $1,000.

## What it does

- One shared deal room: offers and counteroffers, with the gap, whose turn it is and the history tracked.
- Deposits and escrow: Escrow.com, a licensed brokerage trust account, an attorney or title company, or another arrangement. BoatClosers never holds funds.
- Guided due diligence: survey and sea trial steps, with accept, reject or renegotiate decisions recorded.
- Closing documents filled in for the deal (purchase agreement, bill of sale, lien release, title and Coast Guard documentation forms) and signed electronically.
- Free tools: HIN check and boat lien check.

## Pricing

- Free to start. $249 flat per transaction, paid when the deal is ready to sign, whatever the boat costs.
- Whoever starts the deal pays; the other party joins free.
- Escrow.com fees, if used, are separate.

## Key pages

- [Home](https://www.boatclosers.com)
- [FAQ](https://www.boatclosers.com/faq)
- [Free HIN check](https://www.boatclosers.com/hin-check)
- [Boat lien check](https://www.boatclosers.com/lien-check)
- [Buyer's guide](https://www.boatclosers.com/buyers-guide)
- [Seller's guide](https://www.boatclosers.com/sellers-guide)

## Guides

- [How to Sell a Boat Privately Without a Broker](https://www.boatclosers.com/guides/sell-a-boat-without-a-broker)
- [How to Negotiate a Private Boat Purchase](https://www.boatclosers.com/guides/how-to-negotiate-boat-purchase)
- [What a Marine Survey Covers and What It Costs](https://www.boatclosers.com/guides/marine-survey-what-it-covers)
- [What to Do When a Boat Survey Comes Back Bad](https://www.boatclosers.com/guides/boat-survey-came-back-bad)
- [Seller Due Diligence](https://www.boatclosers.com/guides/seller-due-diligence-boat-sale)
- [What Documents You Need to Close a Private Boat Sale](https://www.boatclosers.com/guides/documents-needed-private-boat-sale)
- [Why Every Private Boat Deal Needs a Deposit and Escrow](https://www.boatclosers.com/guides/boat-deposit-and-escrow)
- [How to Buy a Used Boat From a Private Seller in Florida](https://www.boatclosers.com/guides/buy-used-boat-private-seller-florida)
- [Boat Bill of Sale: What It Must Include](https://www.boatclosers.com/guides/boat-bill-of-sale)

${SUITE}

## Contact

support@boatclosers.com
`

const MY_BOAT_CLOSING = `# My Boat Closing

> My Boat Closing is a low-cost paperwork tool for everyday private boat purchases in the United States: a skiff, bay boat, pontoon or center console, usually under $50,000, where buyer and seller have already agreed on a price. It starts with a free HIN check, then gives the buyer their state's bill of sale and step-by-step help signing the title for $29.99. Part of BoatClosers.

## Who it is for

- Buyers in a simple private sale: no broker, no escrow, no survey period.
- People who have shaken on a price (maybe handed over a small deposit) and need to close it correctly.
- For a purchase over $50,000, a deposit over $1,000, financing or a survey period, full BoatClosers ($249) is recommended instead, and the $29.99 is credited toward it.

## What it does

- Free HIN check, no signup: builder, model year, recalls and Coast Guard records, to compare against the listing and title.
- Your state's own official bill of sale where the state publishes one (Florida forms are filled in for you), in all 50 states.
- Step-by-step title signing, a title photo check, a payment receipt, a handoff record, titling help and reminders, and a Boat File.
- Papers are printed and signed in ink; the app shows easy printing options.
- The seller does not need to sign up.

## Pricing

- HIN check: free.
- Paperwork: $29.99 per purchase. A boat, trailer and motor in the same sale is one price.

## Key pages

- [Home](https://myboatclosing.com)
- [Free HIN check](https://www.boatclosers.com/hin-check)
- [Boat Bill of Sale guide](https://www.boatclosers.com/guides/boat-bill-of-sale)

${SUITE}

## Contact

support@boatclosers.com
`

// Read the host on every request (the answer depends on the domain).
export const dynamic = 'force-dynamic'

export function GET(req: Request) {
  const host = (req.headers.get('host') || '').toLowerCase()
  const body = host.includes('myboatclosing.com') ? MY_BOAT_CLOSING : BOATCLOSERS
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
