// Data for topic guides that share one layout (src/components/TopicGuide.tsx).
// Each guide has its own small page file under src/app/guides/<slug>/page.tsx.

import { BOAT_ALERT_NAME, BOAT_ALERT_URL, BOAT_ALERT_WHAT, BOAT_ALERT_DISCLOSURE } from './boatAlert'

export type TopicGuide = {
  slug: string
  title: string
  h1: string
  h1Accent: string
  description: string
  dateModified: string
  intro: string
  sections: { h: string; paras?: string[]; list?: string[]; ordered?: boolean }[]
  faq: { q: string; a: string }[]
  cta: 'bc' | 'mbc' | 'both'
  related: { slug: string; title: string }[]
  sources?: { name: string; url: string }[]
  /** Useful outside services (not official sources), shown under their own heading. */
  links?: { name: string; url: string; note?: string }[]
}

const DATE = '2026-11-14'

export const TOPIC_GUIDES: TopicGuide[] = [
  {
    slug: 'buy-a-boat-with-a-loan-on-it',
    title: 'How to Buy a Boat When the Seller Still Owes Money on It',
    h1: 'Buying a Boat When the Seller',
    h1Accent: 'Still Owes Money on It',
    description:
      'How a lien payoff works in a private boat sale: get a payoff letter, pay the lender first, get the lien released, and never hand the seller the full price while a loan is still on the title.',
    dateModified: DATE,
    intro:
      'Plenty of good boats still have a loan on them. That is not a reason to walk away. It just means the money has to move in the right order, so you end up owning the boat free and clear instead of inheriting the seller’s debt.',
    sections: [
      {
        h: 'The short answer',
        paras: [
          'Never pay the seller the full price while the lender is still on the title. Part of your money goes straight to the lender to pay off the loan, the rest goes to the seller, and the closing is not finished until the lender releases its lien in writing.',
        ],
      },
      {
        h: 'How to tell if there is a loan',
        list: [
          'Ask the seller directly, in writing, before you make an offer.',
          'Look at the title. A lienholder is usually printed on the front, and many states hold the title electronically until the loan is paid.',
          'For a Coast Guard documented boat, order an Abstract of Title from the National Vessel Documentation Center. Recorded preferred ship mortgages show up there.',
          'Run a lien check on the HIN before any money moves.',
        ],
      },
      {
        h: 'The order that protects you',
        ordered: true,
        list: [
          'The seller requests a written payoff letter from the lender. It shows the exact amount, a good-through date, and where to send the money.',
          'Sign a purchase agreement that says the boat will be delivered free of liens and that the payoff comes out of the purchase price.',
          'Put your deposit in escrow, not in the seller’s account.',
          'At closing, the payoff amount goes directly to the lender. The remainder goes to the seller.',
          'The lender sends a lien release (or the title with the lien signed off). For a documented boat, the lender files a satisfaction of mortgage with the NVDC.',
          'Only then do you file for your new title or documentation.',
        ],
      },
      {
        h: 'When the loan is bigger than the price',
        paras: [
          'If the seller owes more than you are paying, they have to bring the difference to closing. Do not agree to “pay off what you can” and trust them to cover the rest later. If the full payoff is not funded at closing, the lien stays on the boat, and the boat is what the lender can come after.',
        ],
      },
      {
        h: 'Red flags',
        list: [
          'The seller won’t let you talk to the lender or see the payoff letter.',
          'The seller wants the full price wired to them and promises to “take care of the bank.”',
          'The title is “lost” and a duplicate is “on the way.”',
          'The payoff letter is expired or doesn’t match the HIN.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I buy a boat that still has a loan on it?',
        a: 'Yes. The loan is paid off out of the purchase price at closing. Part of your money goes directly to the lender, the rest goes to the seller, and the lender then releases its lien so the title can transfer to you.',
      },
      {
        q: 'Who pays off the seller’s boat loan?',
        a: 'The seller does, using your purchase money. In practice the payoff amount from the lender’s payoff letter is sent straight to the lender at closing, so the seller never holds that part of the money.',
      },
      {
        q: 'How long does it take to get a lien release?',
        a: 'It depends on the lender and the state. Some lenders release electronically within days; others mail a paper release or title in a few weeks. Your purchase agreement should require the seller to cooperate until the release is in hand.',
      },
      {
        q: 'What if the seller owes more than the boat is worth?',
        a: 'The seller has to bring the shortfall to closing so the loan is paid in full. If they can’t, the deal shouldn’t close, because an unpaid lien stays with the boat.',
      },
    ],
    cta: 'bc',
    related: [
      { slug: 'boat-deposit-and-escrow', title: 'Why every private boat deal needs a deposit and escrow' },
      { slug: 'seller-due-diligence-boat-sale', title: 'Seller due diligence: verify your title and payoff first' },
      { slug: 'documents-needed-private-boat-sale', title: 'What documents you need to close a private boat sale' },
    ],
    sources: [
      {
        name: 'NVDC fee schedule (Abstract of Title, CG-1332)',
        url: 'https://www.dco.uscg.mil/Portals/9/DCO%20Documents/NVDC/Instructions/09-2025/FEE%20SCHEDULE%2009-2025.pdf',
      },
    ],
  },

  {
    slug: 'sell-an-inherited-boat',
    title: 'How to Sell an Inherited Boat',
    h1: 'How to Sell an',
    h1Accent: 'Inherited Boat',
    description:
      'Selling a boat that belonged to someone who passed away: proving you have the right to sell, the documents titling agencies usually ask for, pricing a boat you don’t know, and closing cleanly.',
    dateModified: DATE,
    intro:
      'Selling a boat you inherited is mostly a paperwork problem. The title is in someone else’s name, so before you can sign it over, you have to show you have the legal right to. Once that is settled, it sells like any other boat.',
    sections: [
      {
        h: 'Step one: who has the right to sign',
        paras: [
          'Whoever signs the title or bill of sale has to have legal authority to do it. Usually that is the executor or personal representative named by the probate court, or the heir if the estate is small enough to skip full probate under your state’s rules.',
          'If the boat was jointly owned “with right of survivorship,” the surviving owner may only need a death certificate to take full ownership.',
        ],
      },
      {
        h: 'Documents agencies usually ask for',
        list: [
          'A certified copy of the death certificate.',
          'Letters testamentary or letters of administration from the probate court, or your state’s small-estate affidavit.',
          'The original title (or a request for a duplicate if it can’t be found).',
          'A lien release if there was still a loan on the boat.',
          'For a Coast Guard documented boat, the NVDC asks for proof of authority as well, and the new owner files Form CG-1258 with a bill of sale.',
        ],
        paras: [
          'Exact requirements vary by state, so check with the agency that titles boats where the boat is registered before you list.',
        ],
      },
      {
        h: 'Find out what you actually have',
        paras: [
          'You probably don’t know the boat’s history, and buyers will ask. Collect whatever records you can find: receipts, logbooks, registration renewals. Then do a basic inspection so you can describe the condition honestly. A boat that has sat for a while often needs batteries, fuel system work and a water pump impeller before it will run right.',
          'Price it against recently sold boats of the same make, model, year and engine, not asking prices. If it needs work, say so and price accordingly.',
        ],
      },
      {
        h: 'Closing',
        paras: [
          'Sell as-is, in writing. Take payment through escrow or a verified bank transfer, never a check you can’t confirm. Sign the bill of sale as executor or personal representative, include a copy of your authority with the paperwork, and keep copies of everything for the estate’s records.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I sell a boat that is still in my deceased parent’s name?',
        a: 'Yes, once you have legal authority to act for the estate. That usually means letters from the probate court naming you executor or personal representative, or a small-estate affidavit if your state allows one. You then sign the title or bill of sale in that capacity.',
      },
      {
        q: 'Do I have to transfer the boat into my name before selling it?',
        a: 'Often not. Many states let the executor sell directly from the estate to the buyer. Some heirs title it in their own name first. Check with your state’s titling agency.',
      },
      {
        q: 'What if I can’t find the title?',
        a: 'The executor or heir can usually apply for a duplicate title with proof of authority. For a documented boat, the record is held by the Coast Guard, so a lost certificate is not a barrier to transfer.',
      },
      {
        q: 'Do I have to tell buyers I don’t know the boat’s history?',
        a: 'Be honest about what you know and don’t know, sell as-is in writing, and encourage the buyer to inspect it. That protects you and builds trust.',
      },
    ],
    cta: 'both',
    related: [
      { slug: 'sell-a-boat-without-a-broker', title: 'How to sell a boat privately without a broker' },
      { slug: 'seller-due-diligence-boat-sale', title: 'Seller due diligence' },
      { slug: 'boat-bill-of-sale', title: 'Boat bill of sale: what it must include' },
    ],
  },

  {
    slug: 'coast-guard-documented-boat-transfer',
    title: 'How to Transfer a Coast Guard Documented Boat',
    h1: 'How to Transfer a',
    h1Accent: 'Coast Guard Documented Boat',
    description:
      'Buying or selling a USCG documented vessel: Form CG-1340 bill of sale, Form CG-1258 application, the Abstract of Title, mortgages, current NVDC fees, and state registration.',
    dateModified: DATE,
    intro:
      'A documented boat is registered with the federal government through the Coast Guard’s National Vessel Documentation Center (NVDC) instead of, or as well as, a state title. The transfer is straightforward once you know the forms.',
    sections: [
      {
        h: 'The short answer',
        paras: [
          'The seller signs a bill of sale (Form CG-1340) in front of a notary. The buyer applies for an exchange of the Certificate of Documentation on Form CG-1258 through the NVDC’s online eStorefront and uploads the bill of sale. If there is a mortgage, it has to be satisfied or the lender has to consent.',
        ],
      },
      {
        h: 'Before you buy: order the Abstract of Title',
        paras: [
          'The Abstract of Title (Form CG-1332) is the boat’s federal ownership history. It shows the owners of record and any recorded preferred ship mortgages or claims of lien. Order it before money moves. It costs $25 under the NVDC fee schedule effective September 2025.',
        ],
      },
      {
        h: 'The steps',
        ordered: true,
        list: [
          'Confirm the seller is the owner of record and check for recorded mortgages on the Abstract of Title.',
          'Sign a purchase agreement and put the deposit in escrow.',
          'At closing, any mortgage is paid off from the purchase money and the lender files a satisfaction of mortgage with the NVDC.',
          'The seller signs Form CG-1340 Bill of Sale, with the signature acknowledged before a notary.',
          'The buyer files Form CG-1258 on the NVDC eStorefront for an exchange of the Certificate of Documentation, and uploads the bill of sale.',
          'Register the boat in the state where it is mainly used, if that state requires it. Many states register documented boats even though they don’t title them.',
        ],
      },
      {
        h: 'Current NVDC fees',
        list: [
          'Exchange of Certificate of Documentation (recreational, 1 year): $84',
          'Approval of exchange when a mortgagee must consent: $24',
          'Filing and recording a bill of sale: $8 per page',
          'Abstract of Title (CG-1332): $25',
        ],
        paras: ['Fees are non-refundable. Check the NVDC fee schedule for changes before you file.'],
      },
      {
        h: 'Watch out for look-alike sites',
        paras: [
          'Several private companies run websites that look official and charge extra to file documentation paperwork. You can file directly with the NVDC yourself. The official site is on dco.uscg.mil.',
        ],
      },
    ],
    faq: [
      {
        q: 'What form do I use to sell a documented boat?',
        a: 'The seller signs Form CG-1340 Bill of Sale, with the signature acknowledged before a notary. The buyer then files Form CG-1258 to exchange the Certificate of Documentation into their name.',
      },
      {
        q: 'How much does it cost to transfer a documented boat?',
        a: 'Under the NVDC fee schedule effective September 2025, an exchange of the Certificate of Documentation for a recreational vessel is $84 for one year, plus $8 per page to record the bill of sale, and $24 if a mortgagee has to consent.',
      },
      {
        q: 'How do I check for a mortgage on a documented boat?',
        a: 'Order an Abstract of Title (Form CG-1332) from the NVDC. It lists recorded preferred ship mortgages and claims of lien against the vessel.',
      },
      {
        q: 'Do I still need state registration for a documented boat?',
        a: 'Often, yes. Many states require documented boats used in their waters to be registered and pay a fee, even though they do not issue a state title. Check with the state where the boat is kept.',
      },
    ],
    cta: 'bc',
    related: [
      { slug: 'buy-a-boat-with-a-loan-on-it', title: 'Buying a boat when the seller still owes money on it' },
      { slug: 'documents-needed-private-boat-sale', title: 'What documents you need to close a private boat sale' },
      { slug: 'boat-bill-of-sale', title: 'Boat bill of sale: what it must include' },
    ],
    sources: [
      {
        name: 'NVDC: Exchange, reinstatement or return to documentation (instructions)',
        url: 'https://www.dco.uscg.mil/Portals/9/DCO%20Documents/NVDC/Instructions/EXCHANGE%20REINSTATEMENT%20RETURN%20TO%20DOCUMENTATION%2003-2025.pdf',
      },
      {
        name: 'NVDC fee schedule (September 2025)',
        url: 'https://www.dco.uscg.mil/Portals/9/DCO%20Documents/NVDC/Instructions/09-2025/FEE%20SCHEDULE%2009-2025.pdf',
      },
    ],
  },

  {
    slug: 'avoid-boat-buying-scams-facebook-marketplace-craigslist',
    title: 'How to Buy a Boat on Facebook Marketplace or Craigslist Without Getting Scammed',
    h1: 'Buying a Boat on Marketplace or Craigslist',
    h1Accent: 'Without Getting Scammed',
    description:
      'The common boat-buying scams on Facebook Marketplace and Craigslist, the warning signs, and a simple process for checking the seller, the boat and the payment before you hand over money.',
    dateModified: DATE,
    intro:
      'Most private sellers are honest. The scams that do happen follow a few patterns, and nearly all of them depend on one thing: getting you to send money before you have checked the boat, the seller and the paperwork.',
    sections: [
      {
        h: 'The scams that keep showing up',
        list: [
          'The too-good-to-be-true boat. A late-model boat priced far under market, a seller who is “deployed” or “moving,” and a request for a deposit to hold it.',
          'The fake escrow site. The seller insists on an escrow company you have never heard of and sends you a link. The site looks real; the money disappears.',
          'The title that isn’t clean. The boat is real, but there is a loan on it, it is stolen, or the seller isn’t the owner.',
          'The overpayment. A buyer sends a seller too much and asks for the difference back. The original payment bounces later.',
        ],
      },
      {
        h: 'Check the seller',
        list: [
          'Talk on the phone and meet in person, at the boat.',
          'The name on the seller’s ID should match the name on the title or registration.',
          'Be wary of brand-new profiles with no history, or a seller who won’t let you see the boat.',
        ],
      },
      {
        h: 'Check the boat',
        list: [
          'Find the HIN on the transom and make sure it matches the title or registration exactly.',
          'Run a free HIN check and a lien check before you pay anything.',
          'Run the HIN through a boat history report for theft, salvage and total-loss records.',
          'Inspect it yourself or have it inspected, and do a sea trial.',
        ],
      },
      {
        h: 'Check the payment',
        list: [
          'Never wire a deposit to a personal account for a boat you haven’t seen.',
          'Use an escrow company you look up yourself. Type its address into your browser rather than clicking a link the seller sent.',
          'Don’t pay with gift cards, crypto or payment apps for a boat purchase.',
          'Pay the balance at closing, when the signed title or bill of sale changes hands.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is it safe to buy a boat on Facebook Marketplace?',
        a: 'It can be, if you see the boat in person, confirm the HIN matches the title, run a lien check, and pay through escrow or at closing instead of sending a deposit up front to a stranger.',
      },
      {
        q: 'How do I know if a boat escrow site is fake?',
        a: 'Be suspicious of any escrow company the seller insists on and links you to. Look the company up yourself, check that it is licensed, and type its address directly into your browser.',
      },
      {
        q: 'Should I send a deposit to hold a boat?',
        a: 'Not to a personal account for a boat you haven’t seen. Make a written offer, see the boat, then put the deposit in escrow under a signed purchase agreement.',
      },
      {
        q: 'How do I check if a boat is stolen or has a loan?',
        a: 'Match the HIN on the hull to the title and registration, run a HIN and lien check, run a boat history report for theft and salvage records, and for a documented boat order an Abstract of Title from the Coast Guard.',
      },
    ],
    links: [
      {
        name: BOAT_ALERT_NAME,
        url: BOAT_ALERT_URL,
        note: `${BOAT_ALERT_WHAT} ${BOAT_ALERT_DISCLOSURE}`,
      },
    ],
    cta: 'both',
    related: [
      { slug: 'boat-deposit-and-escrow', title: 'Why every private boat deal needs a deposit and escrow' },
      { slug: 'buy-a-boat-with-a-loan-on-it', title: 'Buying a boat when the seller still owes money on it' },
      { slug: 'how-to-negotiate-boat-purchase', title: 'How to negotiate a private boat purchase' },
    ],
  },

  {
    slug: 'agreed-on-a-price-for-a-boat-now-what',
    title: 'We Agreed on a Price for a Boat. Now What? A Closing Checklist',
    h1: 'We Agreed on a Price.',
    h1Accent: 'Now What?',
    description:
      'A simple checklist for buyers and sellers who have shaken hands on a private boat sale: what to check, what to sign, how to pay safely, and what to file afterward.',
    dateModified: DATE,
    intro:
      'You found the boat, you agreed on a price, maybe you even put some money down. Here is everything that still needs to happen, in order, so nobody gets surprised at the dock.',
    sections: [
      {
        h: '1. Check the boat’s identity',
        list: [
          'Find the HIN on the transom and compare it to the title or registration, character by character.',
          'Run a free HIN check and confirm there is no loan on it, or that the payoff is handled at closing.',
          'Run a boat history report to check for theft, salvage or a past insurance total loss.',
        ],
      },
      {
        h: '2. Put it in writing',
        list: [
          'Write down the price, what is included (trailer, engine, electronics, gear), and the closing date.',
          'If you gave a deposit, write down how much and when it is refundable.',
        ],
      },
      {
        h: '3. Get the right paperwork for your state',
        list: [
          'Use your state’s bill of sale if it has one, or a bill of sale that includes the HIN, price, date, as-is wording and both signatures.',
          'Check whether your state needs a notary.',
          'The seller signs the title over in the right spots. Don’t accept a title signed by someone who isn’t the owner.',
        ],
      },
      {
        h: '4. Pay safely',
        list: [
          'Pay at the moment the signed title and bill of sale change hands.',
          'Use a cashier’s check you can verify with the issuing bank, a bank transfer you have confirmed, or escrow.',
        ],
      },
      {
        h: '5. After the handshake',
        list: [
          'Buyer: title and register the boat in your name before your state’s deadline, and pay any sales or use tax.',
          'Seller: keep a copy of everything and file a notice of sale if your state has one, so you are not on the hook for what happens next.',
          'Both: keep the paperwork somewhere safe.',
        ],
      },
      {
        h: 'When you need more than a checklist',
        paras: [
          'If the deal involves a survey, financing, a loan payoff, a documented vessel or a large deposit, use a full deal room so the contingencies and escrow are written down properly.',
        ],
      },
    ],
    faq: [
      {
        q: 'What do I do after agreeing on a price for a boat?',
        a: 'Confirm the HIN matches the title, check for liens, put the price and terms in writing, use your state’s bill of sale, pay at the moment the signed title changes hands, and then title and register the boat before your state’s deadline.',
      },
      {
        q: 'Is it too late to protect myself if I already gave a deposit?',
        a: 'No. Write down the deposit amount and terms now, have both sides sign, and follow the rest of the checklist before paying the balance.',
      },
      {
        q: 'Does the boat bill of sale need to be notarized?',
        a: 'It depends on the state. Some require a notary, most don’t. A notarized bill of sale is never a bad idea.',
      },
    ],
    links: [
      {
        name: BOAT_ALERT_NAME,
        url: BOAT_ALERT_URL,
        note: `${BOAT_ALERT_WHAT} ${BOAT_ALERT_DISCLOSURE}`,
      },
    ],
    cta: 'mbc',
    related: [
      { slug: 'boat-bill-of-sale', title: 'Boat bill of sale: what it must include' },
      { slug: 'documents-needed-private-boat-sale', title: 'What documents you need to close a private boat sale' },
      { slug: 'avoid-boat-buying-scams-facebook-marketplace-craigslist', title: 'Avoiding scams on Marketplace and Craigslist' },
    ],
  },

  {
    slug: 'how-to-sign-over-a-boat-title',
    title: 'How to Sign Over a Boat Title in a Private Sale',
    h1: 'How to Sign Over',
    h1Accent: 'a Boat Title',
    description:
      'How to sign a boat title over to a buyer in a private sale: who signs, where, the mistakes that get titles rejected, and what to do when there is a loan, two owners, or no title at all.',
    dateModified: '2026-11-17',
    intro:
      'A title signed in the wrong spot, by the wrong person or with a cross-out can send the buyer back to the seller for a new one. Most title problems at the tag office are avoidable with a few minutes of care at the handoff.',
    sections: [
      {
        h: 'Before anyone signs',
        list: [
          'Match the HIN on the transom to the title, character for character.',
          'Check that the person signing is the owner named on the title. Compare it to their ID.',
          'Look for a lienholder on the title. If there is one, you need a lien release or the lender’s satisfaction before or at closing.',
          'Use your state’s current forms. Some states reject older versions.',
        ],
      },
      {
        h: 'Signing it',
        list: [
          'The seller signs and prints their name exactly as it appears on the title, in the seller section only.',
          'Fill in the buyer’s full name and address, the sale date and the price where the title asks for them.',
          'Use ink and write clearly. Don’t use correction fluid or cross anything out; many states treat an altered title as void.',
          'If your state requires a notary for the title or bill of sale, sign in front of the notary, not before.',
        ],
      },
      {
        h: 'Two owners, a loan, or no title',
        list: [
          'Two owners joined by “and” usually both have to sign. Joined by “or”, one may be enough. Check your state’s rule.',
          'If the seller still owes money, the loan has to be paid off and the lien released before the title is clear. Escrow is the safe way to handle the payoff.',
          'If the boat is Coast Guard documented, ownership moves through the National Vessel Documentation Center, not a state title.',
          'Some states don’t title boats, or not small ones. Then the registration and a good bill of sale carry the weight.',
        ],
      },
      {
        h: 'After the signatures',
        list: [
          'The buyer takes the signed title, the bill of sale and any lien release to the state office before the deadline and pays any sales tax.',
          'The seller keeps copies and files a notice of sale if the state has one.',
        ],
      },
    ],
    faq: [
      {
        q: 'Where does the seller sign on a boat title?',
        a: 'In the seller or transfer section, printing and signing their name exactly as it appears on the front. Layouts differ by state, so read the title carefully before signing.',
      },
      {
        q: 'What happens if a boat title is signed wrong?',
        a: 'The state office may reject it, and the seller may need to apply for a duplicate title and sign again. Avoid cross-outs and correction fluid.',
      },
      {
        q: 'Does a boat title need to be notarized?',
        a: 'Some states require a notary for the title or the bill of sale, and many don’t. Check your state agency’s rules before closing.',
      },
    ],
    cta: 'both',
    related: [
      { slug: 'boat-bill-of-sale', title: 'Boat bill of sale: what it must include' },
      { slug: 'buy-a-boat-with-a-loan-on-it', title: 'Buying a boat when the seller still owes money on it' },
      { slug: 'coast-guard-documented-boat-transfer', title: 'Transferring a Coast Guard documented boat' },
    ],
  },

  {
    slug: 'after-you-sell-a-boat',
    title: 'Sold Your Boat? What to Do After the Sale',
    h1: 'Sold Your Boat?',
    h1Accent: 'What to Do Next',
    description:
      'What a seller should do after selling a boat privately: file a notice of sale, deal with the registration and numbers, cancel insurance, keep copies, and hand over the records.',
    dateModified: '2026-11-17',
    intro:
      'The boat is gone and the money is in the bank, but a few loose ends can still come back to you: a registration in your name, an insurance policy you’re still paying for, or a question about what was included.',
    sections: [
      {
        h: 'File a notice of sale',
        paras: [
          'Many states let the seller report the sale, so you aren’t on the hook for tickets, fees or accidents after the boat leaves. Do it right away, with the buyer’s name, the date and the HIN.',
        ],
      },
      {
        h: 'Registration and numbers',
        list: [
          'Follow your state’s rule for the registration certificate and decals. In some states they stay with the boat; in others they don’t.',
          'If the boat was Coast Guard documented, make sure the documentation is transferred or deleted so it isn’t left in your name.',
        ],
      },
      {
        h: 'Insurance and the marina',
        list: [
          'Cancel or move your insurance once the sale is final, not before.',
          'Tell your marina or storage facility, and settle any slip contract.',
          'Cancel a towing membership or move it to your next boat.',
        ],
      },
      {
        h: 'Keep copies',
        list: [
          'The signed bill of sale, a photo of the signed title, the payment receipt and any lien release.',
          'The handoff record: what was included, and the date.',
          'Keep them for a few years. They answer most questions that come up later.',
        ],
      },
      {
        h: 'Hand over the history',
        paras: [
          'Give the buyer the manuals, warranties and service records that go with the boat. A boat log or history report passes the boat’s story on without your personal details.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do I need to tell the state I sold my boat?',
        a: 'Many states have a notice of sale or similar form for sellers, and filing it protects you if the buyer doesn’t title the boat. Check your state boating or motor vehicle agency.',
      },
      {
        q: 'Do the registration numbers stay with the boat?',
        a: 'It depends on the state. Some keep the number with the boat, some don’t. Follow your state’s rule.',
      },
      {
        q: 'When should I cancel my boat insurance?',
        a: 'After the sale is final and the buyer has taken the boat, not before.',
      },
    ],
    cta: 'bc',
    related: [
      { slug: 'sell-a-boat-without-a-broker', title: 'How to sell a boat privately without a broker' },
      { slug: 'seller-due-diligence-boat-sale', title: 'Seller due diligence' },
      { slug: 'documents-needed-private-boat-sale', title: 'What documents you need to close a private boat sale' },
    ],
  },

  {
    slug: 'buying-a-boat-trailer-and-motor-together',
    title: 'Buying a Boat, Trailer and Motor Together: Paperwork for Each',
    h1: 'Boat, Trailer and Motor:',
    h1Accent: 'Paperwork for Each',
    description:
      'When a used boat comes with a trailer and an outboard, each can have its own title, registration or serial number. Here is what to check and sign for each one in a private sale.',
    dateModified: '2026-11-17',
    intro:
      'Most small boats sell as a package: the hull, the outboard and the trailer. To the state, those can be two or three separate things with separate paperwork, and buyers who only deal with the boat’s title can end up with a trailer they can’t register.',
    sections: [
      {
        h: 'The boat',
        list: [
          'Check the HIN on the transom against the title or registration.',
          'Sign the boat’s title over, or use a bill of sale where the state doesn’t title boats.',
        ],
      },
      {
        h: 'The trailer',
        list: [
          'A trailer has its own VIN, usually on the tongue. Check it against the trailer’s title or registration.',
          'In many states the trailer is titled or registered separately from the boat, so it needs its own signed title or bill of sale.',
          'An old trailer with no paperwork can be hard to register. Ask before you agree on the price.',
        ],
      },
      {
        h: 'The motor',
        list: [
          'Write down the outboard’s make, model and serial number from its plate.',
          'A few states title or register outboard motors separately. Check your state’s rule.',
          'List the motor and its serial number on the bill of sale either way. It helps prove ownership if it’s ever stolen.',
        ],
      },
      {
        h: 'One deal, every piece on paper',
        paras: [
          'Put the boat, the trailer and the motor on the bill of sale with their numbers, and list everything else that goes with the deal. Pay at the moment all the signed papers change hands.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does a boat trailer need its own title?',
        a: 'In many states, yes: trailers are titled or registered separately from boats. Check your state motor vehicle agency.',
      },
      {
        q: 'Do I need a separate bill of sale for the trailer?',
        a: 'Some states want one; in others one bill of sale that lists the trailer’s VIN is enough. Listing every piece with its number is the safe choice.',
      },
      {
        q: 'Is the outboard motor titled separately from the boat?',
        a: 'In most states it isn’t, but a few do title or register outboards. Either way, record the motor’s serial number on the bill of sale.',
      },
    ],
    cta: 'mbc',
    related: [
      { slug: 'boat-bill-of-sale', title: 'Boat bill of sale: what it must include' },
      { slug: 'agreed-on-a-price-for-a-boat-now-what', title: 'We agreed on a price. Now what?' },
      { slug: 'documents-needed-private-boat-sale', title: 'What documents you need to close a private boat sale' },
    ],
  },
]

export function getTopicGuide(slug: string) {
  const g = TOPIC_GUIDES.find((x) => x.slug === slug)
  if (!g) throw new Error(`Unknown topic guide: ${slug}`)
  return g
}
