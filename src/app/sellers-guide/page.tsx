import type { Metadata } from 'next'
import RoleGuide, { type GuideStep } from '@/components/RoleGuide'

const URL = 'https://www.boatclosers.com/sellers-guide'
const TITLE = "Seller's Guide: How to Sell Your Boat Privately, Step by Step"
const DESC =
  'The cleanest order to sell a boat yourself: get the title and payoff ready, price on sold boats, screen buyers with deposits, use escrow, and close without loose ends.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'article', url: URL, title: TITLE, description: DESC },
}

const steps: GuideStep[] = [
  {
    id: 'paperwork-first',
    title: 'Get your paperwork in order before you list',
    body: [
      'Find the title and make sure it is in your name. If there is a loan on the boat, call the lender for a payoff letter now, because they will need to send a lien release at closing. If the boat is Coast Guard documented, have the documentation number handy.',
      'Gather the registration, the HIN, the engine hours and whatever maintenance records you have. A buyer who sees an organized folder trusts the boat more.',
    ],
    inApp: 'The vessel step holds all of this in one place, and every document in the deal fills itself in from it.',
    links: [{ href: '/guides/seller-due-diligence-boat-sale', label: 'Seller due diligence' }],
  },
  {
    id: 'price-it',
    title: 'Price it on what similar boats sold for',
    body: [
      'Asking prices tell you what other sellers hope for. Sold prices tell you what buyers actually paid. Price against sold boats of the same make, length, engines and hours.',
      'Leave room for the survey. Almost every survey finds something, and a buyer who feels they can renegotiate a little is less likely to walk away.',
    ],
    inApp: 'When an offer comes in, the buyer’s reason for their number travels with it, so you are negotiating facts, not guesses.',
    links: [{ href: '/guides/sell-a-boat-without-a-broker', label: 'Selling a boat without a broker' }],
  },
  {
    id: 'prepare-for-survey',
    title: 'Get the boat ready to be inspected',
    body: [
      'Clean it, charge the batteries, keep shore power connected and put enough fuel aboard for a sea trial. Clear access to the engine room, the bilge and every locker.',
      'Do not start the engines before the surveyor arrives. They will want to see a cold start, and a warm engine on arrival makes buyers suspicious.',
    ],
    inApp: 'A seller readiness checklist covers access, power, fuel and safety gear so nothing delays the survey day.',
  },
  {
    id: 'screen-buyers',
    title: 'Screen buyers with a real offer and a deposit',
    body: [
      'Expect a lot of "is this still available?" and lowball numbers with a question mark. The quickest filter is to ask serious buyers to make a written offer with a deposit attached.',
      'If you list on Facebook Marketplace, leave links out of the listing itself. Send your deal link in a message once a buyer reaches out.',
    ],
    inApp: 'You send one invite link. The buyer joins your deal with just their name and makes a structured offer you can accept, counter or decline.',
  },
  {
    id: 'negotiate-terms',
    title: 'Negotiate the terms, not just the price',
    body: [
      'Agree on the deposit, how long the buyer has to inspect the boat (ten to fourteen days is typical), the closing date and what stays with the boat: trailer, electronics, canvas, gear.',
      'Put a deadline on every offer and counter. Deals without deadlines are the ones that quietly die.',
    ],
    inApp: 'Every offer and counter carries its terms and an expiration, and the signed purchase agreement takes the boat off the market.',
    links: [{ href: '/guides/how-to-negotiate-boat-purchase', label: 'How boat negotiations work' }],
  },
  {
    id: 'use-escrow',
    title: 'Let escrow hold the money',
    body: [
      'Do not hold the buyer’s deposit yourself, and never release the boat on a personal check or a wire you have not confirmed. A neutral escrow holder such as Escrow.com protects you as much as the buyer.',
      'When the money sits with a third party, there is no argument later about who owes what if the deal falls through.',
    ],
    inApp: 'You choose the escrow method in the agreement, and both sides confirm the deposit has arrived before the deal moves forward.',
    links: [{ href: '/guides/boat-deposit-and-escrow', label: 'Deposits and escrow' }],
  },
  {
    id: 'handle-the-survey',
    title: 'Handle the survey results calmly',
    body: [
      'If the survey finds problems, the buyer will usually ask for a lower price or repairs. Ask for the actual report and repair quotes, then decide whether to adjust, fix it yourself or let the buyer walk.',
      'If the buyer rejects the boat inside their inspection window, the deposit goes back to them under the agreement. That is the deal working as designed, not a loss.',
    ],
    inApp: 'Renegotiations happen in the same thread, and a rejection is recorded in a signed notice so there is no dispute about the deposit.',
    links: [{ href: '/guides/boat-survey-came-back-bad', label: 'When a survey comes back bad' }],
  },
  {
    id: 'close',
    title: 'Close and hand over the boat',
    body: [
      'At closing, the buyer’s funds arrive through escrow, your loan is paid off and the lender issues a lien release, and you sign the bill of sale and the title over to the buyer. Hand over keys and the boat only after the funds are confirmed.',
      'Give the buyer the maintenance records, spare keys and manuals. It costs you nothing and protects your reputation.',
    ],
    inApp: 'The bill of sale, title transfer and lien release paperwork are filled in from the deal, with notary items clearly flagged.',
    links: [{ href: '/guides/boat-bill-of-sale', label: 'What a bill of sale must include' }],
  },
  {
    id: 'after-the-sale',
    title: 'Tie up loose ends after the sale',
    body: [
      'In Florida, file a notice of sale (form HSMV 82050) with your county tax collector within 30 days. It records that the boat is no longer yours, which protects you if the new owner gets a ticket or has an accident before they title it.',
      'Cancel or transfer your insurance once the boat is gone, and keep copies of everything you signed.',
    ],
    inApp: "Florida's HSMV 82050 is in the deal's document set, and you can download every signed document as a PDF package after closing.",
  },
]

export default function Page() {
  return (
    <RoleGuide
      role="seller"
      title="How to sell your boat privately, step by step"
      intro="The cleanest order to sell a boat yourself, from getting the title ready to filing the notice of sale. Follow these steps and you will filter out tire-kickers, get paid safely, and walk away with no loose ends."
      steps={steps}
    />
  )
}
