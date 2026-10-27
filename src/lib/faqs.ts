// Single source for BoatClosers FAQs — used by the homepage FAQ section and
// the /faq page, so the two never drift apart. Edit questions here only.
import { DOCUMENTS } from '../data/documents'

const DOC_COUNT = DOCUMENTS.length

export type Faq = {
  id: string
  q: string
  a: string
  guide?: { slug: string; title: string }
}

export type FaqGroup = { topic: string; items: Faq[] }

export const FAQ_GROUPS: FaqGroup[] = [
  {
    topic: 'Selling a boat privately',
    items: [
      {
        id: 'sell-without-broker',
        q: 'How do I sell a boat without a broker?',
        a: 'Enter your vessel and both parties, negotiate the price and terms, complete due diligence, then pay $249 to unlock and sign every document the sale needs. BoatClosers gives you the same professional paperwork and closing process a yacht broker uses — you simply run it yourself.',
        guide: { slug: 'sell-a-boat-without-a-broker', title: 'How to Sell a Boat Privately Without a Broker' },
      },
      {
        id: 'seller-owes-money',
        q: 'What if the seller still owes money on the boat?',
        a: "The deal includes a payoff authorization and lien release so the seller's existing loan is cleared from the title at closing — letting clean title pass to the buyer. The buyer should confirm the lien is released before final payment.",
        guide: { slug: 'seller-due-diligence-boat-sale', title: 'Seller Due Diligence: What You Owe the Buyer and What Protects You' },
      },
      {
        id: 'inherited-boat',
        q: 'What if I inherited a boat I want to sell?',
        a: 'BoatClosers includes an estate and inheritance section with a plain-language guide plus affidavit of heirship, executor authorization, and small-estate forms. Estate rules vary by state, so the app points you to when a probate attorney is needed.',
      },
    ],
  },
  {
    topic: 'Buying a boat privately',
    items: [
      {
        id: 'offer-marketplace',
        q: 'How do I make an offer on a boat I found on Facebook Marketplace or Craigslist?',
        a: "Start a deal in BoatClosers, enter the vessel, and send a structured offer with an earnest-money deposit attached. Unlike a comment or a text, a deposit-backed offer shows the seller you're serious and creates a recorded paper trail — and once accepted, a signed agreement locks the boat in so it can't be sold to someone else.",
        guide: { slug: 'how-to-negotiate-boat-purchase', title: 'How to Negotiate a Private Boat Purchase' },
      },
      {
        id: 'seller-sells-to-someone-else',
        q: 'How do I keep a seller from selling the boat to someone else after we agree?',
        a: "This is one of the most common ways private deals fall apart. The fix is to secure it: the moment both sides agree, a signed purchase agreement plus an earnest-money deposit binds the deal. The seller can no longer walk to another buyer without consequence, and the buyer can't be left empty-handed after turning others away.",
        guide: { slug: 'boat-deposit-and-escrow', title: 'Why Every Private Boat Deal Needs a Deposit and Escrow' },
      },
      {
        id: 'buy-remotely',
        q: 'Is it safe to buy a boat remotely from another state?',
        a: 'Yes, when the money is handled correctly. BoatClosers keeps the whole negotiation and signing remote, and routes funds through escrow — Escrow.com, a private attorney, or another verified path — so you never wire thousands to a stranger on faith. The funds release only when the deal is complete.',
        guide: { slug: 'buy-used-boat-private-seller-florida', title: 'How to Buy a Used Boat From a Private Seller in Florida' },
      },
      {
        id: 'broker-listed-boat',
        q: 'The boat I want is listed with a broker. Can I still use BoatClosers?',
        a: "Yes. You deal with the listing broker directly and BoatClosers handles your side of the paperwork — the offer, the agreement, the deposit, due diligence and closing. It is also worth knowing that a listing broker's commission normally assumes a second broker brings the buyer and takes a share of it. If nobody is doing that — because you are representing yourself — that is a reasonable thing to raise when you decide your number, and far easier to raise before terms are agreed than after. BoatClosers points it out at the right moment when you build your offer. What the broker does about it is entirely theirs to decide.",
      },
    ],
  },
  {
    topic: 'Documents and title',
    items: [
      {
        id: 'documents-needed',
        q: 'What documents do I need to sell a boat privately?',
        a: `At minimum a purchase agreement, bill of sale, and the title-transfer documents — plus a deposit receipt, as-is acknowledgment, and closing statement. Depending on the deal you may also need financing, insurance, estate, or lost-title documents. BoatClosers includes all ${DOC_COUNT} and shows you exactly which ones your deal requires.`,
        guide: { slug: 'documents-needed-private-boat-sale', title: 'What Documents You Need to Close a Private Boat Sale' },
      },
      {
        id: 'legally-binding',
        q: 'Are these documents legally binding?',
        a: "Our templates follow recognized maritime and state-transfer standards, but enforceability depends on how accurately you complete them and on your state's requirements. We flag the documents that must be notarized, and we strongly recommend a local maritime attorney review anything involving financing, estates, or title problems before signing.",
        guide: { slug: 'boat-bill-of-sale', title: 'Boat Bill of Sale: What It Must Include to Hold Up' },
      },
      {
        id: 'uscg-documented',
        q: 'How does title transfer work for a Coast Guard documented vessel?',
        a: "Documented vessels transfer through the National Vessel Documentation Center rather than the state. BoatClosers includes the USCG transfer and documentation forms and walks you through requesting the vessel's abstract of title from the Coast Guard.",
      },
    ],
  },
  {
    topic: 'Money, escrow and fees',
    items: [
      {
        id: 'escrow-options',
        q: 'What escrow options do I have, and do you hold the money?',
        a: "You choose from five: Escrow.com (a licensed third party, recommended), a licensed boat brokerage's trust account, a private attorney or title company, a direct wire to the seller, or your own custom arrangement. BoatClosers never holds, touches, or releases funds.",
        guide: { slug: 'boat-deposit-and-escrow', title: 'Why Every Private Boat Deal Needs a Deposit and Escrow' },
      },
      {
        id: 'deal-falls-through',
        q: 'What if the deal falls through?',
        a: 'If the buyer formally rejects during due diligence, the earnest money is returned and the reason is recorded in a Rejection Notice. BoatClosers does not hold or release any funds.',
        guide: { slug: 'boat-survey-came-back-bad', title: 'What to Do When a Boat Survey Comes Back Bad' },
      },
      {
        id: 'who-pays',
        q: 'Who pays the $249 fee?',
        a: 'Whoever starts the deal pays the flat fee and controls the vessel details and terms. The other party joins free to review, add their information, and sign.',
      },
      {
        id: 'use-broker-or-attorney',
        q: 'Can I still use a broker or attorney if I want one?',
        a: "Yes. BoatClosers is built so you don't need one, but nothing stops you from bringing one in — for example, letting a licensed brokerage's trust account hold the escrow deposit, or having an attorney review the agreement before you sign. You run the deal and bring in whatever help you're comfortable with.",
      },
    ],
  },
]

export const FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.items)
