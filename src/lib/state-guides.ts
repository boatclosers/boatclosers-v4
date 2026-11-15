// State-by-state private boat sale guides, served at /guides/<slug>.
// The page layout lives in src/app/guides/[slug]/page.tsx; this file is only
// facts. To add a state, copy one entry and fill it in from that state's own
// agency pages. Every number must come from an official source listed in
// `sources`. If an official page doesn't say it, leave it out.
//
// Texas has its own hand-built page at /guides/texas-boat-bill-of-sale.

export type StateGuide = {
  slug: string
  state: string
  title: string
  description: string
  checked: string // date the facts were checked
  dateModified: string // ISO date for structured data
  intro: string
  shortAnswer: string
  numbers: { label: string; value: string }[]
  sellerSteps: string[]
  buyerSteps: string[]
  notes: { title: string; text: string }[]
  faq: { q: string; a: string }[]
  sources: { name: string; url: string }[]
  agencyName: string
}

const CHECKED = 'November 14, 2026'
const ISO = '2026-11-14'

export const STATE_GUIDES: StateGuide[] = [
  {
    slug: 'california-boat-bill-of-sale',
    state: 'California',
    title: 'California Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in California: the signed pink slip, the REG 135 bill of sale, the seller’s 5-day REG 138 notice, the buyer’s 30-day deadline, use tax and trailers.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the California DMV',
    intro:
      'In California, boats are titled and registered by the DMV, the same office that handles cars. The seller has 5 days to report the sale and the buyer has 30 days to transfer it. Here is how a private boat sale closes in California.',
    shortAnswer:
      'The seller signs the California Certificate of Ownership (the "pink slip") on the release line, gives the buyer a Bill of Sale (form REG 135), and files a Notice of Transfer and Release of Liability (REG 138) within 5 days. The buyer adds their name and address to the title, completes an Application for Vessel Certificate of Number (BOAT 101), and submits everything with the fees and use tax to the DMV within 30 days.',
    numbers: [
      { label: 'Seller reports the sale (REG 138)', value: 'Within 5 days of the sale' },
      { label: 'Buyer submits transfer and pays fees', value: 'Within 30 days of purchase, or penalties apply' },
      { label: 'Transfer fee', value: 'Typically $15' },
      { label: 'Use tax', value: 'Based on the price and your local tax rate (usually 7.5% to 10%)' },
    ],
    sellerSteps: [
      'Sign the California Certificate of Ownership (pink slip) on the release line, usually line 1. If there is a lienholder, the lienholder must also sign to release its interest.',
      'Give the buyer a Bill of Sale, form REG 135. The DMV calls it highly recommended when the title is present, because it records the price and date.',
      'Submit a Notice of Transfer and Release of Liability (REG 138) within 5 days of the sale. It can be filed online or by mail.',
      'If the title is lost, complete an Application for Replacement or Transfer of Title (REG 227).',
    ],
    buyerSteps: [
      'Check that the hull identification number (HIN) on the boat matches the title before you pay.',
      'Write your name and address on the back of the signed title.',
      'Complete an Application for Vessel Certificate of Number (BOAT 101).',
      'Submit the documents and pay the transfer fee and use tax within 30 days of purchase, at a DMV field office or by mail to DMV, PO Box 942869, Sacramento, CA 94269.',
      'Title or register the trailer separately.',
    ],
    notes: [
      {
        title: 'Trailers',
        text: 'Boat trailers are registered separately from the boat. Get a separate title or Permanent Trailer Identification (PTI) paperwork for the trailer, and list its price separately from the boat.',
      },
      {
        title: 'Bought out of state',
        text: 'A boat bought in another state and brought into California can owe California use tax. If sales or use tax was paid to the other state, you pay only the difference, if any.',
      },
    ],
    faq: [
      {
        q: 'Do I need a bill of sale to transfer a boat in California?',
        a: 'The DMV says a Bill of Sale (REG 135) is not strictly required when the signed title is present, but it is highly recommended to document the purchase price and date.',
      },
      {
        q: 'How long do I have to transfer a boat title in California?',
        a: 'The buyer must submit the transfer documents and pay the fees within 30 days of the purchase to avoid penalties. The seller must file the Notice of Transfer and Release of Liability (REG 138) within 5 days of the sale.',
      },
      {
        q: 'How much tax do I pay on a used boat in California?',
        a: 'Use tax based on the purchase price and your local tax rate, usually between 7.5% and 10%, paid to the DMV when you transfer the boat.',
      },
      {
        q: 'Is the trailer transferred with the boat?',
        a: 'No. A boat trailer is registered separately. Get its own title or Permanent Trailer Identification (PTI) paperwork.',
      },
    ],
    sources: [
      { name: 'California DMV, Vessel Title Transfer Checklist', url: 'https://qr.dmv.ca.gov/portal/file/vessel_title_transfer_checklist-pdf' },
      { name: 'California DMV, Bill of Sale (REG 135)', url: 'https://www.dmv.ca.gov/forms/reg/reg135.htm' },
      { name: 'California DMV, Agents Handbook: Vessel Transfers', url: 'https://www.dmv.ca.gov/portal/handbook/agents-handbook-for-registration-of-undocumented-vessels/transfers/' },
      { name: 'California DMV, Vessel Registration Fees and Use Tax', url: 'https://www.dmv.ca.gov/portal/handbook/agents-handbook-for-registration-of-undocumented-vessels/vessel-registration-fees-and-use-tax/' },
    ],
  },
  {
    slug: 'michigan-boat-bill-of-sale',
    state: 'Michigan',
    title: 'Michigan Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Michigan: which boats need a title, what the bill of sale must show, the 6% sales tax at the Secretary of State, and trailers.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Michigan Secretary of State',
    intro:
      'In Michigan, boats are titled and registered at the Secretary of State, not the DNR. Not every boat needs a title, so the paperwork depends on the boat. Here is how a private boat sale closes in Michigan.',
    shortAnswer:
      'If the boat is titled, the seller signs the title over to the buyer. The buyer takes the signed title (or, for an untitled boat, a bill of sale or the signed previous registration), their license or ID, and payment for the 6% sales tax to a Secretary of State office to register the boat.',
    numbers: [
      { label: 'Sales tax', value: '6%, due at registration unless you show it was already paid' },
      { label: 'Title required', value: 'Boats 20 feet or longer, and boats with a permanently affixed (inboard) engine' },
      { label: 'Registration term', value: 'Three years, expiring March 31 of the third year' },
    ],
    sellerSteps: [
      'If the boat is titled, sign the title to transfer ownership.',
      'If the boat is not titled, give the buyer a bill of sale showing the year and make, the hull identification number (HIN), and both parties’ names and addresses, or the previous registration signed by you.',
      'If there is a loan on the boat, get it paid off and the lien released before you hand over the title.',
      'If the title is lost, you and the buyer must go to a Secretary of State office together with proof of the HIN and a lien termination statement.',
    ],
    buyerSteps: [
      'Check that the HIN on the boat matches the title or bill of sale before you pay.',
      'Bring your license or ID and proof of ownership (the signed title, or for an untitled boat a bill of sale or signed previous registration) to a Secretary of State office.',
      'Pay the 6% sales tax at registration, unless you can show it was already paid or the sale to a qualifying family member is exempt.',
    ],
    notes: [
      {
        title: 'Which boats need a title',
        text: 'Michigan requires a title for watercraft 20 feet or longer and for watercraft with a permanently affixed engine, regardless of length. Boats with a U.S. Coast Guard Certificate of Documentation don’t need a Michigan title.',
      },
      {
        title: 'Trailers',
        text: 'Michigan requires a title for trailers weighing 2,500 pounds or more. List the trailer price separately from the boat on the bill of sale.',
      },
      {
        title: 'Boats from another state',
        text: 'A boat registered in another state can be used on Michigan waters for up to 60 days, if it is stored or anchored in Michigan, before it needs a Michigan registration.',
      },
    ],
    faq: [
      {
        q: 'Do I need a title to sell a boat in Michigan?',
        a: 'Only if the boat must be titled: watercraft 20 feet or longer, or with a permanently affixed engine regardless of length. For other boats, a bill of sale with the year, make, HIN and both parties’ names and addresses, or the previous registration signed by the seller, is proof of ownership.',
      },
      {
        q: 'How much sales tax do I pay on a used boat in Michigan?',
        a: '6%, collected by the Secretary of State when the boat is registered, unless you show the tax was already paid or the sale to a family member qualifies for an exemption.',
      },
      {
        q: 'What should a Michigan boat bill of sale include?',
        a: 'At minimum the year and make, the hull identification number, and the names and addresses of the buyer and seller, plus the price and date. Our general guide covers what else belongs on any boat bill of sale.',
      },
    ],
    sources: [
      { name: 'Michigan Secretary of State, Recreational vehicles and watercraft', url: 'https://www.michigan.gov/sos/vehicle/recreational-vehicles-watercraft' },
    ],
  },
  {
    slug: 'minnesota-boat-bill-of-sale',
    state: 'Minnesota',
    title: 'Minnesota Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Minnesota: signing the DNR title, the bill of sale for untitled boats, the $17 transfer fee, why a private sale isn’t taxed, and trailers.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Minnesota DNR',
    intro:
      'In Minnesota, boats are titled and registered through the DNR and its deputy registrar offices. A boat bought from a private individual is not subject to sales tax, which surprises a lot of buyers. Here is how a private boat sale closes in Minnesota.',
    shortAnswer:
      'For a Minnesota-titled boat, the seller signs the front of the title and the buyer completes and signs the back. The buyer submits the title and application at a deputy registrar office or by mail to the DNR, with the $17 title transfer fee. For an untitled boat, the seller gives a bill of sale with the year, make, HIN and their printed name and signature.',
    numbers: [
      { label: 'Title transfer fee', value: '$17.00' },
      { label: 'Sales tax on a boat bought from a private individual', value: 'Not taxable' },
      { label: 'Where to file', value: 'Any deputy registrar office, or by mail to the Minnesota DNR' },
    ],
    sellerSteps: [
      'For a Minnesota-titled boat, sign the front of the title.',
      'For a boat registered in Minnesota but not titled, give the buyer a bill of sale listing the year, make, hull identification number (HIN), and your printed name and signature.',
      'For a boat titled in another state, give the buyer the original signed title. If that state doesn’t title boats, give the registration card and a bill of sale.',
      'If the title shows a lien, get a lien release from the lienholder for the buyer.',
    ],
    buyerSteps: [
      'Check that the HIN on the boat matches the title or bill of sale before you pay.',
      'For a Minnesota-titled boat, complete and sign the back of the title.',
      'Submit the title (or bill of sale and a signed universal registration form for an untitled boat) at a deputy registrar office, or mail it to Minnesota DNR, Box 26 - Watercraft, 500 Lafayette Rd., St. Paul, MN 55155-4026.',
      'Include a lien release if the title lists a lien, and pay the $17 title transfer fee plus any registration fee.',
      'Wait for your new registration card and decals before using the boat.',
    ],
    notes: [
      {
        title: 'Why there is no sales tax',
        text: 'Minnesota Revenue’s guidance for DNR registrations says a watercraft bought from a private party (an individual) is not taxable. A boat bought from a dealer or a business in the business of selling boats is taxable.',
      },
      {
        title: 'Trailers',
        text: 'The boat and the trailer are handled by different offices: the DNR registers the boat, while trailers are titled and registered through Driver and Vehicle Services. List the trailer price separately from the boat.',
      },
    ],
    faq: [
      {
        q: 'Do I pay sales tax on a used boat from a private seller in Minnesota?',
        a: 'No. Minnesota Revenue’s DNR guidance says a watercraft purchased from a private party (an individual) is not taxable. Purchases from a dealer or a business in the business of selling boats are taxable.',
      },
      {
        q: 'Who signs where on a Minnesota boat title?',
        a: 'The seller signs the front of the Minnesota watercraft title. The buyer completes and signs the back.',
      },
      {
        q: 'How much does it cost to transfer a boat title in Minnesota?',
        a: 'The title transfer fee is $17.00, plus a registration fee if the registration is being transferred or renewed.',
      },
    ],
    sources: [
      { name: 'Minnesota DNR, Watercraft registration and title', url: 'https://www.dnr.state.mn.us/licenses/watercraft/index.html' },
      { name: 'Minnesota Department of Revenue, DNR Sales and Use Tax Resource', url: 'https://www.revenue.state.mn.us/sites/default/files/2023-05/dnr-sales-tax-resource.pdf' },
    ],
  },
  {
    slug: 'north-carolina-boat-bill-of-sale',
    state: 'North Carolina',
    title: 'North Carolina Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in North Carolina: the notarized seller signature, the VL-1 form, which boats need a title, why a private sale isn’t taxed, and the trailer’s highway use tax.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the NC Wildlife Resources Commission',
    intro:
      'In North Carolina, boats are titled and registered by the Wildlife Resources Commission, not the DMV. The one rule that trips people up: the seller’s signature must be notarized. Here is how a private boat sale closes in North Carolina.',
    shortAnswer:
      'For a titled boat, the seller signs the transfer section of the original North Carolina title in front of a notary. For an untitled boat, the seller signs a bill of sale in front of a notary. The buyer submits the notarized title or bill of sale with a completed, signed VL-1 form to the Wildlife Resources Commission.',
    numbers: [
      { label: 'Seller’s signature', value: 'Must be notarized (title transfer section or bill of sale)' },
      { label: 'Title required', value: 'Motorized boats and sailboats 14 feet or longer bought or transferred since Jan. 1, 2007, and all personal watercraft' },
      { label: 'Sales tax on a boat bought from an individual', value: 'Not taxed (occasional or isolated sale)' },
      { label: 'Boat bought from a dealer', value: '3%, up to $1,500 per boat' },
    ],
    sellerSteps: [
      'For a titled boat, sign the transfer section of the original title in front of a notary.',
      'For an untitled boat, sign a bill of sale in front of a notary. Include the registration number, hull identification number (HIN), a description of the boat, and the names of the sellers and buyers. The Commission publishes a Bill of Sale for a Vessel form you can use.',
      'If you are selling from a state that doesn’t title boats, give the buyer a copy of your out-of-state registration card too.',
      'If the title has been lost, give the buyer a completed Seller’s Statement of Lost Title form and a notarized bill of sale.',
      'If there is a lien, get a notarized lien release from the lender.',
    ],
    buyerSteps: [
      'Check that the HIN on the boat matches the title or bill of sale before you pay.',
      'Make sure the seller’s signature is notarized before you leave with the boat.',
      'Complete and sign form VL-1. Every owner must sign it.',
      'Submit the VL-1 with the notarized title or bill of sale and the fee to the Wildlife Resources Commission.',
      'Title the trailer separately at the DMV and pay its highway use tax.',
    ],
    notes: [
      {
        title: 'Why there is usually no sales tax',
        text: 'North Carolina’s 3% boat tax (capped at $1,500 per boat) applies to dealer sales. Sales by individuals who aren’t in the business of selling boats are occasional or isolated sales and aren’t subject to sales or use tax.',
      },
      {
        title: 'Trailers',
        text: 'A boat trailer is subject to North Carolina’s 3% highway use tax, not the boat tax. It is paid when you apply for the trailer’s certificate of title. List the trailer price separately from the boat.',
      },
      {
        title: 'Boats brought in from another state',
        text: 'Out-of-state registered boats used in North Carolina for more than 60 consecutive days must be registered in North Carolina. If you bought from a dealer in another state, you may owe North Carolina use tax, with credit for tax paid there.',
      },
    ],
    faq: [
      {
        q: 'Does a boat bill of sale have to be notarized in North Carolina?',
        a: 'Yes, the seller’s signature must be notarized, on the title transfer section for a titled boat or on the bill of sale for an untitled boat.',
      },
      {
        q: 'Do I pay sales tax on a used boat from a private seller in North Carolina?',
        a: 'No. Sales by individuals who are not in the business of selling boats are occasional or isolated sales and are not subject to sales or use tax. Boats bought from a dealer pay 3%, up to $1,500 per boat.',
      },
      {
        q: 'Which boats need a title in North Carolina?',
        a: 'Motorized vessels and sailboats 14 feet or longer that have been bought or transferred since January 1, 2007, and all personal watercraft.',
      },
      {
        q: 'Who titles boats in North Carolina, the DMV or Wildlife?',
        a: 'The NC Wildlife Resources Commission titles and registers boats. The DMV titles boat trailers.',
      },
    ],
    sources: [
      { name: 'NC Wildlife Resources Commission, Registration and Titling', url: 'https://www.ncwildlife.gov/boating/registration-and-titling' },
      { name: 'NC Wildlife Resources Commission, Bill of Sale for a Vessel', url: 'https://ncwildlife.gov/bill-sale-form-6-2023pdf/open' },
      { name: 'NC Wildlife Resources Commission, boat tax publication', url: 'https://www.ncwildlife.org/portals/0/License/Documents/Publication1.pdf' },
      { name: 'NC Department of Revenue, Boats and Related Items', url: 'https://www.ncdor.gov/taxes-forms/sales-and-use-tax/boats' },
    ],
  },
  {
    slug: 'new-york-boat-bill-of-sale',
    state: 'New York',
    title: 'New York Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in New York: which boats get a title, the DTF-802 sales tax form, the bill of sale, sales tax at the DMV and the $230,000 cap.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the New York DMV',
    intro:
      'In New York, boats are registered and titled by the DMV, and sales tax on a private sale is collected at the DMV when the buyer registers. Newer, longer boats get a title; older or shorter ones use the registration as the ownership document. Here is how a private boat sale closes in New York.',
    shortAnswer:
      'The seller gives the buyer a signed bill of sale and the ownership document: the title for a motorboat model year 1987 or newer and 14 feet or longer, or the registration for older or shorter boats. Buyer and seller complete form DTF-802, and the buyer takes everything to the DMV, which calculates and collects the sales tax when the boat is registered.',
    numbers: [
      { label: 'Boats that get a New York title', value: 'Motorboats model year 1987 or newer, 14 feet or longer' },
      { label: 'Sales tax form for a private sale', value: 'DTF-802, Statement of Transaction' },
      { label: 'Who collects the sales tax', value: 'The DMV, at registration' },
      { label: 'Sales tax cap', value: 'Any amount over $230,000 is exempt' },
    ],
    sellerSteps: [
      'Give the buyer a signed bill of sale. New York DMV’s Vehicle Bill of Sale, form MV-912, can be used.',
      'Give the buyer the ownership document: the signed title for a motorboat model year 1987 or newer and 14 feet or longer, or the registration for older or shorter boats.',
      'Complete and sign the seller’s part of form DTF-802 if the boat was sold for less than fair market value or given as a gift.',
      'If there is a loan on the boat, get the lien released before closing.',
    ],
    buyerSteps: [
      'Check that the hull identification number (HIN) on the boat matches the title or registration before you pay. Boats from model year 1973 on must have a 12-character HIN to be registered.',
      'Complete and sign the front of form DTF-802 with the purchase price.',
      'Take the bill of sale, the ownership document, DTF-802 and proof of identity to a DMV office to register the boat and apply for a title if required.',
      'Pay the sales tax there. The DMV calculates and collects it and gives you a receipt.',
    ],
    notes: [
      {
        title: 'Which boats get a title',
        text: 'New York titles motorboats model year 1987 or newer that are 14 feet or longer. For boats from 1986 or earlier, or under 14 feet, the registration is the ownership document.',
      },
      {
        title: 'Bought out of state',
        text: 'If you bought the boat out of state and paid sales tax there, claim credit on form DTF-804 with the original bill of sale. To claim any other sales tax exemption, use form DTF-803.',
      },
      {
        title: 'Gifts',
        text: 'If the boat was a gift, file DTF-802 with the giver’s section signed. A gift is exempt from sales tax.',
      },
    ],
    faq: [
      {
        q: 'Do I pay sales tax on a used boat from a private seller in New York?',
        a: 'Yes. In a private sale, buyer and seller complete form DTF-802, and the DMV calculates and collects the sales tax when the buyer registers the boat. Any amount of the price over $230,000 is exempt.',
      },
      {
        q: 'Does my boat need a title in New York?',
        a: 'Only motorboats from model year 1987 or newer that are 14 feet or longer get a New York title. For older or shorter boats, the registration is the ownership document.',
      },
      {
        q: 'What is form DTF-802?',
        a: 'The Statement of Transaction, the New York Department of Taxation and Finance form used to report the price of a private sale or gift of a boat so the DMV can calculate the sales tax.',
      },
    ],
    sources: [
      { name: 'New York DMV, Registering and titling a boat (MV-21B)', url: 'https://dmvsearch.webnycdn.ny.gov/forms/mv821b.pdf' },
      { name: 'New York DMV, Certificate of title information', url: 'https://dmv.ny.gov/brochure/information-and-instructions-about-your-certificate-title' },
      { name: 'New York DMV, Vehicle Bill of Sale (MV-912)', url: 'https://dmv.ny.gov/forms/mv912.pdf' },
      { name: 'NY Department of Taxation and Finance, DMV transaction forms (DTF-802, 803, 804)', url: 'https://www.tax.ny.gov/forms/dmv_transaction_forms.htm' },
    ],
  },
]

export const getStateGuide = (slug: string) => STATE_GUIDES.find((g) => g.slug === slug)
