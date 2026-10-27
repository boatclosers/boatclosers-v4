import type { Metadata } from 'next'
import RoleGuide, { type GuideStep } from '@/components/RoleGuide'

const URL = 'https://www.boatclosers.com/buyers-guide'
const TITLE = "Buyer's Guide: How to Buy a Boat From a Private Seller, Step by Step"
const DESC =
  'The safest order to buy a used boat privately: check the HIN and liens, make a deposit-backed offer, use escrow, survey and sea trial, close and title the boat.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { type: 'article', url: URL, title: TITLE, description: DESC },
}

const steps: GuideStep[] = [
  {
    id: 'check-the-boat',
    title: 'Check the boat before you get attached',
    body: [
      'Before you drive out to see it, ask the seller for the hull identification number (HIN), a photo of the title or registration, and whether there is a loan on the boat. A seller who will not share the HIN is a seller to walk away from.',
      'Run the HIN to confirm the builder and model year match the ad and to look for open recalls. Then check for liens. If the boat is Coast Guard documented, request the abstract of title from the National Vessel Documentation Center, which shows recorded mortgages.',
    ],
    inApp: 'The vessel step links you straight to the Coast Guard vessel search, the abstract of title for documented boats, and a boat history report.',
    links: [
      { href: '/hin-check', label: 'Free HIN check' },
      { href: '/lien-check', label: 'Free lien check' },
    ],
  },
  {
    id: 'see-it-and-price-it',
    title: 'See it in person and price it on sold boats',
    body: [
      'Look at the boat before you make a real offer. Start the engines cold, check the bilge, the transom, the soft spots in the deck, and the hour meters.',
      'Base your number on what similar boats actually sold for, not on asking prices. Expect the survey to give you a second chance to negotiate, so do not spend all your leverage now.',
    ],
    inApp: 'You enter the price you are willing to pay and the reason for it, and the seller sees both together.',
    links: [{ href: '/guides/how-to-negotiate-boat-purchase', label: 'How to negotiate a boat purchase' }],
  },
  {
    id: 'make-a-written-offer',
    title: 'Make a written offer with a deposit',
    body: [
      'A text saying "would you take $9k?" is not an offer. A real offer states the price, the deposit, the date you will close, and what it depends on: usually a marine survey and a sea trial you are satisfied with.',
      'Around 10% is a common deposit, but on a private sale a smaller one often does the job, as long as it is real money. Put a deadline on the offer, usually 48 hours, so it cannot sit for a week.',
    ],
    inApp: 'Offers and counters go back and forth in one thread with an expiration on each, until both sides accept and sign the purchase agreement.',
  },
  {
    id: 'use-escrow',
    title: 'Send the deposit to escrow, not to the seller',
    body: [
      'Once the agreement is signed, the deposit goes to a neutral third party such as Escrow.com, an attorney, or a licensed brokerage trust account. If you send it straight to a stranger and the deal falls apart, getting it back depends entirely on them.',
      'With escrow, the money is released only under the terms you both signed: back to you if the boat fails inspection, or toward the price if you accept it.',
    ],
    inApp: 'You pick the escrow method in the offer, and both sides confirm each stage of the deposit so there is a record of it.',
    links: [{ href: '/guides/boat-deposit-and-escrow', label: 'Why every deal needs a deposit and escrow' }],
  },
  {
    id: 'survey-and-sea-trial',
    title: 'Survey, sea trial and title search',
    body: [
      'Hire your own marine surveyor, not one the seller suggests. Plan for a haul-out so the hull can be inspected, and run the sea trial at full load and speed. Ten to fourteen days is a typical window to get all of this done.',
      'Bind insurance during this window too. Many insurers and lenders want to see the survey, and you will need proof of coverage before you can take the boat.',
    ],
    inApp: 'A due diligence checklist tracks the survey, sea trial, lien search and insurance against the deadline in your agreement.',
    links: [{ href: '/guides/marine-survey-what-it-covers', label: 'What a marine survey covers' }],
  },
  {
    id: 'accept-or-renegotiate',
    title: 'Accept, renegotiate or walk away',
    body: [
      'If the survey is clean, accept the boat in writing. If it finds problems, get repair quotes and ask for a lower price or for repairs before closing.',
      'If the problems are serious, you can reject the boat inside your inspection window and your deposit comes back under the terms of the agreement. Do it in writing and before the deadline.',
    ],
    inApp: 'You choose Accept, Renegotiate or Reject. A rejection produces a signed notice that the escrow holder uses to return your deposit.',
    links: [{ href: '/guides/boat-survey-came-back-bad', label: 'What to do when a survey comes back bad' }],
  },
  {
    id: 'close',
    title: 'Close the deal',
    body: [
      'At closing, the rest of the money moves through escrow, the seller signs the bill of sale and the title over to you, and any loan on the boat is paid off with a lien release. Do not hand over the final payment until you know the lien is being cleared.',
      'Check that the HIN on the boat, the title and the bill of sale all match before you sign anything.',
    ],
    inApp: 'Every closing document is filled in from the deal, flagged if it needs a notary, and signed electronically where the law allows.',
    links: [{ href: '/guides/documents-needed-private-boat-sale', label: 'Documents you need to close' }],
  },
  {
    id: 'title-and-register',
    title: 'Title and register the boat',
    body: [
      'In Florida you generally have 30 days to apply for title and registration at your county tax collector. Bring the signed title, the bill of sale and your ID. Sales tax is collected when you title the boat.',
      'For a Coast Guard documented vessel, the transfer goes through the National Vessel Documentation Center instead of the state.',
    ],
    inApp: "Florida's vessel title application (HSMV 82040-VS) and the state bill of sale form are in your deal's document set, ready for the tax collector.",
    links: [{ href: '/guides/buy-used-boat-private-seller-florida', label: 'Buying a used boat in Florida' }],
  },
]

export default function Page() {
  return (
    <RoleGuide
      role="buyer"
      title="How to buy a boat from a private seller, step by step"
      intro="The safest order to do things in, from the first message to the title in your name. Follow these steps and you will know what you are buying, your deposit stays protected, and the paperwork holds up."
      steps={steps}
    />
  )
}
