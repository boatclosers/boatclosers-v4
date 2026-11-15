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
  {
    slug: 'florida-boat-bill-of-sale',
    state: 'Florida',
    title: 'Florida Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Florida: the signed title, form HSMV 82050 for the bill of sale and notice of sale, HSMV 82040 VS, the 30-day deadline, 6% sales tax and the $18,000 cap.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'your county tax collector or the Florida Department of Highway Safety and Motor Vehicles',
    intro:
      'In Florida, boats are titled and registered at your county tax collector’s office, and sales tax is due even when you buy from a private seller. The buyer has 30 days. Here is how a private boat sale closes in Florida.',
    shortAnswer:
      'The seller signs the transfer section on the back of the Florida title with the price and date, gives the buyer a bill of sale (form HSMV 82050 works), and files a notice of sale within 30 days. Within 30 days of the purchase, the buyer takes the signed title, bill of sale, ID and a completed Application for Certificate of Title (HSMV 82040 VS) to the county tax collector and pays the sales tax.',
    numbers: [
      { label: 'Buyer’s deadline to title and register', value: '30 days from purchase' },
      { label: 'State sales tax', value: '6% of the price, plus your county’s surtax on the first $5,000' },
      { label: 'Most sales tax on one boat', value: '$18,000 total, state and county combined' },
      { label: 'Seller’s notice of sale', value: 'Within 30 days, on HSMV 82050 or the back of the title' },
    ],
    sellerSteps: [
      'Sign the transfer section on the back of the Florida title with the sale price and date. No cross-outs or white-out.',
      'Give the buyer a bill of sale. Form HSMV 82050, Notice of Sale and/or Bill of Sale, can serve as both.',
      'File a notice of sale with the county tax collector within 30 days, on HSMV 82050 or the completed section of the title. That takes the boat out of your name.',
      'If there is a loan on the boat, get the lien satisfied before closing.',
      'Give the buyer a separate bill of sale for the trailer.',
    ],
    buyerSteps: [
      'Check that the hull identification number (HIN) on the boat matches the title before you pay.',
      'Keep proof of the purchase date (the dated bill of sale) on board until the boat is registered.',
      'Within 30 days, take the signed title, bill of sale, your ID and a completed Application for Certificate of Title (HSMV 82040 VS) to any county tax collector’s office.',
      'Pay the sales tax there. The tax collector calculates it.',
      'Title the trailer too if it needs its own title.',
    ],
    notes: [
      {
        title: 'Sales tax on a private sale',
        text: 'Florida collects sales tax on a casual sale (no dealer involved) on the boat, an inboard motor and the trailer. The total state and county tax on a boat is capped at $18,000.',
      },
      {
        title: 'Late registration',
        text: 'Operating an unregistered boat after the 30-day window is a second-degree misdemeanor in Florida, and a late fee applies to transfers filed after 30 days.',
      },
      {
        title: 'Trailers',
        text: 'Florida titles trailers separately. Trailers weighing 2,000 pounds or more need their own title. List the trailer price separately from the boat.',
      },
      {
        title: 'Coast Guard documented boats',
        text: 'Federally documented boats are exempt from Florida titling. Ownership transfers through the National Vessel Documentation Center, but the boat is still registered with the county.',
      },
    ],
    faq: [
      {
        q: 'How long do I have to title a boat in Florida after buying it?',
        a: '30 days from the purchase. During that time, keep proof of the purchase date on board. Operating an unregistered boat after 30 days is a second-degree misdemeanor.',
      },
      {
        q: 'Do I pay sales tax on a boat bought from a private seller in Florida?',
        a: 'Yes. Florida collects 6% state sales tax plus your county’s surtax on the first $5,000 when you title the boat, even in a private sale. The total tax on a boat is capped at $18,000.',
      },
      {
        q: 'What form is the Florida boat bill of sale?',
        a: 'Form HSMV 82050, Notice of Sale and/or Bill of Sale, can be used as the bill of sale and as the seller’s notice of sale. The buyer applies for title on form HSMV 82040 VS.',
      },
    ],
    sources: [
      { name: 'Florida HSMV, Vessel Titling and Registrations', url: 'https://flhsmv.gov/motor-vehicles-tag-titles/vessels/vessel-titling-registrations' },
      { name: 'Florida HSMV, Application for Certificate of Title, HSMV 82040 VS', url: 'https://www.flhsmv.gov/pdf/forms/82040-vs.pdf' },
      { name: 'Florida HSMV, sales tax and the $18,000 vessel cap (procedure TL-08)', url: 'https://www.flhsmv.gov/pdf/proc/tl/tl-08.pdf' },
      { name: 'Palm Beach County Tax Collector, Vessel Titles', url: 'https://www.pbctax.gov/vessel/titles/' },
    ],
  },
  {
    slug: 'wisconsin-boat-bill-of-sale',
    state: 'Wisconsin',
    title: 'Wisconsin Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Wisconsin: the title assignment, the DNR record of sale, the registration card, and paying sales or use tax at the DNR.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Wisconsin DNR',
    intro:
      'In Wisconsin, boats are titled and registered by the DNR. The buyer, not the seller, pays the sales tax, at the DNR when registering. Here is how a private boat sale closes in Wisconsin.',
    shortAnswer:
      'The seller completes the assignment section on the back of the title with the buyer’s name, address and the sale price, and hands over the signed title and the registration card. The buyer applies to the DNR for title and registration and pays the sales or use tax at that time.',
    numbers: [
      { label: 'Who pays sales tax in a private sale', value: 'The buyer, when registering or titling with the DNR' },
      { label: 'Bill of sale', value: 'Not required by the DNR, but may be needed for tax purposes' },
      { label: 'Low prices', value: 'The Wisconsin Department of Revenue investigates suspiciously low sale prices' },
    ],
    sellerSteps: [
      'Complete the assignment section on the back of the title with the buyer’s name, address and the sale price. Every owner on the title must sign.',
      'Give the buyer the signed original title and the registration card.',
      'Fill out a record of sale. The DNR publishes a Record of Sale for Private Party Boat Sales; both of you should keep a copy.',
      'If the title is lost, get a replacement title before the sale.',
    ],
    buyerSteps: [
      'Don’t pay for a titled boat unless the seller has the original title (not a photocopy) signed by all required owners.',
      'Check that the registration card matches the boat’s registration number, make and model, and that the HIN matches the title.',
      'Apply to the DNR for title and registration with the signed title.',
      'Pay the Wisconsin sales or use tax (plus any county or city tax) when you register.',
    ],
    notes: [
      {
        title: 'Write the real price',
        text: 'The Wisconsin Department of Revenue checks applications and investigates suspiciously low sale prices.',
      },
      {
        title: 'Trailers',
        text: 'The trailer is a separate item from the boat. List its price separately on the record of sale.',
      },
    ],
    faq: [
      {
        q: 'Do I need a bill of sale to sell a boat in Wisconsin?',
        a: 'The DNR doesn’t require one, but recommends it because it may be needed for tax purposes. The DNR publishes a Record of Sale for Private Party Boat Sales that both parties can sign and keep.',
      },
      {
        q: 'Who pays sales tax on a private boat sale in Wisconsin?',
        a: 'The buyer. A private seller doesn’t collect it; the buyer pays the Wisconsin state and any county or city sales or use tax when registering or titling the boat with the DNR.',
      },
      {
        q: 'What does the seller fill out on a Wisconsin boat title?',
        a: 'The assignment section on the back, with the buyer’s name and address and the sale price, signed by every owner on the title.',
      },
    ],
    sources: [
      { name: 'Wisconsin DNR, Buyer checklist for boat sales', url: 'https://dnr.wisconsin.gov/sites/default/files/topic/Permits/vehicleRegistrations/BuyerChecklistBoatSales.pdf' },
      { name: 'Wisconsin DNR, Seller checklist for boat sales', url: 'https://dnr.wisconsin.gov/sites/default/files/topic/Permits/vehicleRegistrations/SellerChecklistBoatSales.pdf' },
      { name: 'Wisconsin DNR, Record of Sale for Private Party Boat Sales', url: 'https://dnr.wisconsin.gov/sites/default/files/topic/Permits/vehicleRegistrations/SamplebillofSale.pdf' },
      { name: 'Wisconsin Department of Revenue, Publication 213 (used vehicles)', url: 'https://www.revenue.wi.gov/DOR%20Publications/2113usedvehicles.pdf' },
    ],
  },
  {
    slug: 'washington-boat-bill-of-sale',
    state: 'Washington',
    title: 'Washington Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Washington: the signed vessel title, bill of sale form TD-420-065, the seller’s 5-day Report of Sale, the buyer’s 15-day deadline and late fees.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Washington Department of Licensing',
    intro:
      'In Washington, boats are titled and registered by the Department of Licensing (DOL) at vehicle licensing offices. The clock is short: the seller has 5 business days and the buyer has 15 days. Here is how a private boat sale closes in Washington.',
    shortAnswer:
      'Every registered and legal owner signs the Vessel Certificate of Title and gives it to the buyer, along with a Vehicle/Vessel Bill of Sale (form TD-420-065). The seller mails a Vessel Report of Sale to DOL within 5 business days. Within 15 days, the buyer takes the signed title and a Vessel Title Application (TD-420-289) to a vehicle licensing office and pays the fees and taxes.',
    numbers: [
      { label: 'Seller’s Report of Sale', value: 'Within 5 business days of the sale' },
      { label: 'Buyer applies for title', value: 'Within 15 days, or a late fee applies' },
      { label: 'Late transfer fee', value: 'Starts at $50, up to $125' },
    ],
    sellerSteps: [
      'All registered and legal owners sign the Vessel Certificate of Title and give it to the buyer.',
      'Fill out a Vehicle/Vessel Bill of Sale (form TD-420-065) with the buyer.',
      'Mail a Vessel Report of Sale to the Department of Licensing, PO Box 9038, Olympia, WA 98507, within 5 business days. It releases your liability for the boat.',
      'If there is a loan on the boat, the legal owner (lender) must release its interest on the title.',
    ],
    buyerSteps: [
      'Check that the hull identification number (HIN) matches the title before you pay.',
      'Complete a Vessel Title Application (TD-420-289).',
      'Within 15 days, take or mail the signed title, the application and the bill of sale to a vehicle licensing office.',
      'Pay the title fees and the use tax, which is based on the sale price on the bill of sale.',
    ],
    notes: [
      {
        title: 'Late fees',
        text: 'If the buyer applies after 15 days, late transfer fees start at $50 and increase to a maximum of $125.',
      },
      {
        title: 'Trailers',
        text: 'A boat trailer is a separate vehicle with its own title. List its price separately on the bill of sale.',
      },
    ],
    faq: [
      {
        q: 'How long do I have to transfer a boat title in Washington?',
        a: 'The buyer must apply for a new title within 15 days of the purchase, or pay a late fee that starts at $50 and rises to $125. The seller must file a Vessel Report of Sale within 5 business days.',
      },
      {
        q: 'What is the Washington boat bill of sale form?',
        a: 'The Vehicle/Vessel Bill of Sale, form TD-420-065, from the Washington Department of Licensing.',
      },
      {
        q: 'Do I pay tax on a used boat from a private seller in Washington?',
        a: 'Yes. The buyer pays use tax when applying for the title, based on the sale price on the bill of sale.',
      },
    ],
    sources: [
      { name: 'Washington DOL, Vessel Report of Sale (TD-420-063)', url: 'https://dol.wa.gov/forms/view/420063' },
      { name: 'Washington DOL, Vehicle/Vessel Bill of Sale (TD-420-065)', url: 'https://dol.wa.gov/sites/default/files/2022-11/420065.pdf' },
      { name: 'Washington law, RCW 88.02.370 (vessel report of sale)', url: 'https://app.leg.wa.gov/RCW/default.aspx?cite=88.02.370' },
    ],
  },
  {
    slug: 'ohio-boat-bill-of-sale',
    state: 'Ohio',
    title: 'Ohio Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Ohio: which boats and outboard motors need a title, separate outboard titles, the 30-day deadline at the Clerk of Courts, and sales tax on a casual sale.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'your county Clerk of Courts title office',
    intro:
      'In Ohio, boat and outboard motor titles are handled by the county Clerk of Courts title office, the same place that titles cars. An outboard boat and its outboard motor have separate titles. Here is how a private boat sale closes in Ohio.',
    shortAnswer:
      'The seller signs the Ohio title(s) over to the buyer, one for the boat and one for an outboard motor of 10 horsepower or more, and assigns the Ohio watercraft registration card. Within 30 days, the buyer applies for new titles at any county Clerk of Courts title office and pays the sales tax there.',
    numbers: [
      { label: 'Title required', value: 'Watercraft 14 feet or longer, and outboard motors 10 horsepower or more' },
      { label: 'Buyer applies for title', value: 'Within 30 days of purchase' },
      { label: 'Late filing fee', value: '$5 after 30 days' },
      { label: 'Where', value: 'Any county Clerk of Courts title office in Ohio' },
    ],
    sellerSteps: [
      'Sign the Ohio certificate of title over to the buyer. An outboard boat and its outboard motor have separate titles; an inboard or inboard/outboard boat has one.',
      'Assign the Ohio watercraft registration card to the buyer.',
      'If the boat or motor was never titled in Ohio, establish an Ohio title in your name before the sale.',
      'If there is a loan, get the lien released before closing.',
    ],
    buyerSteps: [
      'Check that the boat’s 12-character hull identification number matches the title. Ohio requires a 12-digit HIN to title a watercraft.',
      'Within 30 days, take the signed title(s) and your ID to any county Clerk of Courts title office and apply for new titles.',
      'Pay the sales tax on the purchase price when you title. The clerk collects it.',
      'Transfer the registration with the assigned registration card.',
    ],
    notes: [
      {
        title: 'Outboard motors',
        text: 'Outboard motors of 10 horsepower or more need their own Ohio title. No registration is required for outboard motors.',
      },
      {
        title: 'Boats that aren’t titled',
        text: 'Canoes and kayaks are not titled in Ohio, and neither are watercraft under 14 feet.',
      },
      {
        title: 'Trailers',
        text: 'A boat trailer is handled separately from the boat, and whether it needs its own title depends on its weight; ask the Clerk of Courts. List its price separately on the bill of sale.',
      },
    ],
    faq: [
      {
        q: 'Which boats need a title in Ohio?',
        a: 'Watercraft 14 feet or longer and outboard motors of 10 horsepower or more. Canoes and kayaks are not titled.',
      },
      {
        q: 'How long do I have to title a boat in Ohio?',
        a: 'The application for title must be filed within 30 days after the purchase. A $5 late fee applies after that.',
      },
      {
        q: 'Do I pay sales tax on a used boat from a private seller in Ohio?',
        a: 'Yes. Ohio taxes casual sales of titled watercraft and outboard motors, and the Clerk of Courts collects the tax when you apply for the title.',
      },
    ],
    sources: [
      { name: 'Ohio Revised Code 1548.06, Application for certificate of title', url: 'https://codes.ohio.gov/ohio-revised-code/section-1548.06' },
      { name: 'Franklin County Clerk of Courts, Watercraft titles', url: 'https://stageclerk.franklincountyohio.gov/autoTitle/overviewWC' },
      { name: 'Summit County Clerk of Courts, Watercraft', url: 'https://clerkweb.summitoh.net/watercraft' },
    ],
  },
  {
    slug: 'south-carolina-boat-bill-of-sale',
    state: 'South Carolina',
    title: 'South Carolina Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in South Carolina: separate boat and outboard titles, the property tax receipt, the 5% casual excise tax capped at $500, and late fees after 30 days.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the South Carolina DNR',
    intro:
      'In South Carolina, boats and outboard motors are titled separately by the DNR, and the tax on a private sale is capped at just $500. One step catches buyers off guard: you need a paid property tax receipt first. Here is how a private boat sale closes in South Carolina.',
    shortAnswer:
      'The seller signs the original South Carolina title for the boat and a separate title for each outboard motor. The buyer submits those titles, a completed Watercraft/Outboard Motor Application, a paid property tax receipt from their county, and the fees, including the 5% casual excise tax capped at $500, to the SCDNR.',
    numbers: [
      { label: 'Casual excise tax (private sale)', value: '5% of the price, capped at $500' },
      { label: 'Boat title and registration', value: '$20' },
      { label: 'Outboard motor title', value: '$10' },
      { label: 'Late fees', value: '$15 after 30 days, $30 after 60 days' },
    ],
    sellerSteps: [
      'Sign the original title for the watercraft and a separate title for each outboard motor. South Carolina titles do not have to be notarized.',
      'Don’t scratch out or white out anything. An altered title is invalid, and you would then need to sign a notarized bill of sale on the SCDNR application.',
      'If the title is lost, sign and notarize the bill of sale section (Section H) of the Watercraft/Outboard Motor Application for the buyer.',
    ],
    buyerSteps: [
      'Check SC Boat Facts for unpaid personal property taxes or liens before you buy.',
      'Get a paid property tax receipt in your name for the coming year from your county of residence.',
      'Complete and sign the Watercraft/Outboard Motor Application. All buyers must be listed.',
      'Send the original titles, application, tax receipt and fees to SCDNR, Attn. Titling & Registration, P.O. Box 167, Columbia, SC 29202, within 30 days to avoid late fees. Keep photocopies.',
    ],
    notes: [
      {
        title: 'The $500 tax cap',
        text: 'A private (casual) sale of a boat, or a boat and motor bought together, carries a 5% casual excise tax with a $500 maximum. An outboard motor bought on its own is also 5% with a $500 maximum. Tax already paid in another state is credited.',
      },
      {
        title: 'Temporary operation',
        text: 'You can use the boat with the temporary certificate of number at the bottom right of the application and a copy of your bill of sale or titles while you wait.',
      },
      {
        title: 'Trailers',
        text: 'The trailer is separate from the boat and motor. List its price separately on the bill of sale.',
      },
    ],
    faq: [
      {
        q: 'How much tax do I pay on a used boat in South Carolina?',
        a: 'In a private sale, a 5% casual excise tax capped at $500 for the boat, or the boat and motor bought as a package. An outboard motor bought alone is also 5% with a $500 cap.',
      },
      {
        q: 'Does a South Carolina boat title need to be notarized?',
        a: 'No. Original South Carolina titles do not have to be notarized. A notarized bill of sale on the SCDNR application is needed only if the title was altered or lost.',
      },
      {
        q: 'Why do I need a property tax receipt to register a boat in South Carolina?',
        a: 'SCDNR requires a paid property tax receipt in the buyer’s name for the coming year, from the buyer’s county of residence, to transfer a boat or motor.',
      },
    ],
    sources: [
      { name: 'SCDNR, Buying from an SC owner with SC titles', url: 'https://dnr.sc.gov/boating/Titling_and_Registration/SC_Owner_with_SC_Titles.html' },
      { name: 'SCDNR, Casual Excise Tax', url: 'https://www.dnr.sc.gov/boating/Titling_and_Registration/Casual_Excise_Tax.html' },
      { name: 'SCDNR, Titling and Registration FAQ', url: 'https://dnr.sc.gov/boating/Titling_and_Registration/Frequently_Asked_Questions.html' },
      { name: 'SCDNR, Watercraft/Outboard Motor Application', url: 'https://dnr.sc.gov/boating/Titling_and_Registration/docs/WatercraftOutboardMotorApplication.pdf' },
    ],
  },
  {
    slug: 'illinois-boat-bill-of-sale',
    state: 'Illinois',
    title: 'Illinois Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Illinois: the signed DNR title, the RUT-75 watercraft use tax return, the 6.25% use tax due within 30 days, and the DNR transfer application.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Illinois DNR or the Illinois Department of Revenue',
    intro:
      'In Illinois, boats are titled and registered by the Department of Natural Resources (DNR), but the tax on a private sale goes to the Department of Revenue first, on form RUT-75. Unlike many states, Illinois taxes private boat sales. Here is how a private boat sale closes in Illinois.',
    shortAnswer:
      'The seller signs over the original Illinois watercraft title and gives the buyer a bill of sale. Within 30 days, the buyer files form RUT-75 with the Illinois Department of Revenue and pays the 6.25% watercraft use tax. Then the buyer sends the DNR a Watercraft Application (Transfer/Renewal), the signed title, the RUT-75, the bill of sale and the fee.',
    numbers: [
      { label: 'Watercraft use tax on a private sale', value: '6.25% of the purchase price' },
      { label: 'Tax form', value: 'RUT-75, Aircraft/Watercraft Use Tax Transaction Return' },
      { label: 'RUT-75 deadline', value: 'Within 30 days of acquiring the boat (or bringing it into Illinois)' },
    ],
    sellerSteps: [
      'Sign the original Illinois watercraft title over to the buyer.',
      'Give the buyer a bill of sale or purchase agreement with the price and date.',
      'If there is a loan on the boat, give the buyer a lien release letter.',
    ],
    buyerSteps: [
      'Check that the hull identification number (HIN) matches the title before you pay.',
      'Within 30 days, file form RUT-75 with the Illinois Department of Revenue and pay the 6.25% use tax. It can be filed online through MyTax Illinois; allow one business day for processing before you apply for registration.',
      'Send the DNR a completed Watercraft Application with the Transfer/Renewal box checked, the original signed title, any lien release letter, the RUT-75, the bill of sale and a check or money order payable to IDNR.',
    ],
    notes: [
      {
        title: 'No private-sale exemption',
        text: 'Illinois watercraft use tax applies to boats acquired from a person or business that isn’t a boat retailer. The buyer pays 6.25% on the purchase price with form RUT-75. Attach a copy of the purchase agreement or invoice.',
      },
      {
        title: 'Bought from a dealer',
        text: 'If you buy from an Illinois dealer, the dealer files form ST-556 instead. If you buy from an out-of-state dealer and bring the boat to Illinois, the tax is reported on form RUT-25.',
      },
      {
        title: 'Trailers',
        text: 'The trailer is separate from the boat. List its price separately, since the watercraft use tax is based on the boat’s price.',
      },
    ],
    faq: [
      {
        q: 'Do I pay tax on a used boat from a private seller in Illinois?',
        a: 'Yes. Illinois charges a 6.25% watercraft use tax on boats bought from someone who isn’t a boat retailer. You report and pay it on form RUT-75 with the Illinois Department of Revenue.',
      },
      {
        q: 'When is form RUT-75 due?',
        a: 'Within 30 days of acquiring the boat in Illinois, or within 30 days of bringing it into Illinois if you bought it elsewhere.',
      },
      {
        q: 'What do I send the Illinois DNR to transfer a boat?',
        a: 'A Watercraft Application with Transfer/Renewal checked, the original signed Illinois title, a lien release letter if needed, the RUT-75 tax form, the bill of sale or purchase agreement, and a check or money order payable to IDNR.',
      },
    ],
    sources: [
      { name: 'Illinois DNR, Illinois Registered Watercraft', url: 'https://dnr.illinois.gov/boating/illinoisregistered.html' },
      { name: 'Illinois DNR, Tax Requirement on Watercraft', url: 'https://dnr.illinois.gov/boating/taxrequirementonwatercraft.html' },
      { name: 'Illinois Department of Revenue, Watercraft tax requirements', url: 'https://tax.illinois.gov/individuals/watercraft.html' },
      { name: 'Illinois Department of Revenue, RUT-75 instructions', url: 'https://tax.illinois.gov/forms/sales/vehicleusetax/rut-75-instructions.html' },
    ],
  },
  {
    slug: 'georgia-boat-bill-of-sale',
    state: 'Georgia',
    title: 'Georgia Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Georgia: the detailed bill of sale, the seller’s 15-day report to DNR, Georgia eTitles and paper titles, and the buyer’s new three-year registration.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Georgia DNR',
    intro:
      'Georgia has been an eTitle state for boats since July 1, 2020, so most transfers happen in the DNR’s system instead of on paper. The detailed bill of sale and the seller’s report to DNR are what move the title. Here is how a private boat sale closes in Georgia.',
    shortAnswer:
      'The seller gives the buyer a signed, detailed bill of sale and the Georgia registration card, and reports the sale to DNR within 15 days. If a paper title was issued, the seller must sign it and give it to the buyer. The buyer then applies for a new registration with a signed Georgia Vessel Registration Application and the bill of sale.',
    numbers: [
      { label: 'Seller reports the sale to DNR', value: 'Within 15 days' },
      { label: 'Notary', value: 'Not required on the bill of sale' },
      { label: 'New owner’s registration', value: 'A new three-year registration; the previous owner’s can’t be used' },
      { label: 'Registration fee (by length)', value: '$35 under 16 ft, $70 to 26 ft, $140 to 40 ft, $210 for 40 ft and over' },
    ],
    sellerSteps: [
      'Give the buyer a signed, detailed bill of sale: the Georgia (or other state) registration number, HIN, make, model year, length, hull material, and both signatures. DNR’s Certified True Bill of Sale for Vessel works.',
      'Give the buyer the Georgia boat registration card.',
      'If a paper title was issued, you must sign it and give it to the buyer at the sale.',
      'Report the sale to DNR within 15 days: online at GoOutdoorsGeorgia.com, by phone at 1-800-366-2661, or in writing with the Certified True Bill of Sale. For an eTitled boat, the eTitle transfers to the buyer once you report the sale.',
    ],
    buyerSteps: [
      'Check that the HIN on the boat matches the bill of sale and registration before you pay.',
      'If the seller isn’t the owner of record, get a chain of bills of sale back to the owner of record.',
      'Submit a signed Georgia Vessel Registration Application with the bill of sale (and the signed paper title, if there is one) online, by email to documents@GaBoat.com, by fax or by mail.',
      'Apply right away. You can’t use the previous owner’s registration.',
    ],
    notes: [
      {
        title: 'eTitle, paper title or no title',
        text: 'A Georgia boat may be eTitled (the Boat Registration and Verification Record serves as the title), have a paper title the owner requested (which is then the controlling ownership document), or show no title if it hasn’t been renewed or re-registered since July 1, 2020.',
      },
      {
        title: 'Boats from another state',
        text: 'For a boat coming from another state, the buyer provides the original title from a title state, or a bill of sale from a non-title state, plus the original registration card if available.',
      },
      {
        title: 'Trailers',
        text: 'The trailer is separate from the boat. List its price separately on the bill of sale.',
      },
    ],
    faq: [
      {
        q: 'Does a Georgia boat bill of sale need to be notarized?',
        a: 'No. Georgia DNR says the bill of sale doesn’t have to be witnessed or notarized, though that is acceptable. It must identify the boat: registration number, HIN, make, model year, length, hull material and both signatures.',
      },
      {
        q: 'How long does a seller have to report a boat sale in Georgia?',
        a: '15 days. Report it online at GoOutdoorsGeorgia.com, by phone at 1-800-366-2661, or in writing with the Certified True Bill of Sale for Vessel.',
      },
      {
        q: 'How does a Georgia boat eTitle transfer?',
        a: 'The eTitle transfers to the new owner after the seller reports the sale to DNR and gives the buyer the detailed bill of sale.',
      },
    ],
    sources: [
      { name: 'Georgia DNR Wildlife Resources, Register/Renew a Boat', url: 'https://georgiawildlife.com/boating/registration' },
      { name: 'Georgia DNR, Certified True Bill of Sale for Vessel', url: 'https://gadnrle.org/sites/default/files/VESSEL%20BILL%20OF%20SALE%207-15-2022.pdf' },
      { name: 'Georgia DNR, Vessel Registration Application', url: 'https://gadnrle.org/sites/default/files/Vessel%20Registration%20Application%208-22-2022.pdf' },
    ],
  },
  {
    slug: 'louisiana-boat-bill-of-sale',
    state: 'Louisiana',
    title: 'Louisiana Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Louisiana: the required notarized bill of sale, transferring the LDWF registration, why a casual sale has no state sales tax, and trailers at the OMV.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Louisiana Department of Wildlife and Fisheries',
    intro:
      'In Louisiana, boats are registered and titled by the Department of Wildlife and Fisheries (LDWF), and the bill of sale must be notarized. A boat bought from an individual who used it personally owes no state sales tax. Here is how a private boat sale closes in Louisiana.',
    shortAnswer:
      'The seller signs a notarized bill of sale and hands over the title and registration. The buyer sends LDWF a Boat Registration/Boat and Motor Title Application with the current Louisiana registration number, the original notarized bill of sale, and the seller’s registration certificate so LDWF can verify the sale was a tax-exempt casual sale.',
    numbers: [
      { label: 'Bill of sale', value: 'Must be notarized' },
      { label: 'State sales tax on a casual sale from an individual', value: 'None' },
      { label: 'Registered by', value: 'Louisiana Department of Wildlife and Fisheries' },
      { label: 'Trailer registered by', value: 'Louisiana Office of Motor Vehicles' },
    ],
    sellerSteps: [
      'Sign a bill of sale in front of a notary. Include the registration number, hull identification number (HIN), make, model and year of the boat, and the signatures. LDWF publishes a Bill of Sale of Boat/Motor form.',
      'Give the buyer the title and the LDWF registration certificate.',
      'List the trailer as a separate item on the notarized bill of sale.',
    ],
    buyerSteps: [
      'Check that the HIN on the boat matches the title and registration before you pay.',
      'Complete a Boat Registration/Boat and Motor Title Application. A transfer must show the boat’s current Louisiana registration number.',
      'Send LDWF the application with the original notarized bill of sale and the seller’s registration certificate.',
      'Register the trailer separately at a Motor Vehicle Office with a notarized bill of sale.',
    ],
    notes: [
      {
        title: 'Why there is no state sales tax',
        text: 'A boat bought from an individual who used it personally is an isolated or casual sale and is exempt from state sales tax. LDWF still has to verify that before registering the boat, which is why the seller’s registration certificate and a notarized bill of sale are needed.',
      },
      {
        title: 'Boats from another state',
        text: 'For a boat bought from an individual in another state, provide a copy of the title and registration from that state and a notarized bill of sale signed by both parties.',
      },
      {
        title: 'Bought from a dealer',
        text: 'If you buy from a dealer, sales tax should be paid to the dealer, and the invoice showing the tax paid goes to LDWF.',
      },
    ],
    faq: [
      {
        q: 'Does a boat bill of sale have to be notarized in Louisiana?',
        a: 'Yes. LDWF requires an original notarized bill of sale for a transfer, showing the registration number, HIN, make, model, year and signatures.',
      },
      {
        q: 'Do I pay sales tax on a used boat from a private seller in Louisiana?',
        a: 'No state sales tax is due on an isolated or casual sale from an individual who used the boat personally. Present the seller’s registration certificate and a notarized bill of sale to LDWF so it can verify the exemption.',
      },
      {
        q: 'Where do I register the boat trailer in Louisiana?',
        a: 'At the Louisiana Office of Motor Vehicles, not LDWF. List the trailer as a separate item on the notarized bill of sale.',
      },
    ],
    sources: [
      { name: 'Louisiana Department of Revenue, Boat Registration', url: 'https://revenue.louisiana.gov/individuals/general-resources/boat-registration' },
      { name: 'Louisiana Department of Revenue, Why LDWF requires a sales tax clearance', url: 'https://revenue.la.gov/tax-education-and-faqs/faqs/collections/why-does-the-department-of-wildlife-and-fisheries-require-a-sales-tax-clearance-before-they-will-complete-my-boat-registration' },
      { name: 'LDWF, Bill of Sale of Boat/Motor', url: 'https://www.wlf.louisiana.gov/assets/Boating/Files/Title-and-Register-Your-Boat/bill_of_sale_of_boat-motor.pdf' },
    ],
  },
  {
    slug: 'missouri-boat-bill-of-sale',
    state: 'Missouri',
    title: 'Missouri Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Missouri: the assigned title or descriptive bill of sale, separate outboard titles, the 60-day deadline, the 4.225% state tax plus local tax, and penalties.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'the Missouri Department of Revenue',
    intro:
      'In Missouri, boats, vessels and outboard motors are titled by the Department of Revenue at license offices, and the outboard motor gets its own title. Buyers get 60 days, twice the time they get for a car. Here is how a private boat sale closes in Missouri.',
    shortAnswer:
      'The seller assigns the Missouri title (or gives a descriptive bill of sale) for the boat and a separate one for the outboard motor. Within 60 days, the buyer applies for title at a Missouri license office and pays the 4.225% state sales tax plus local tax where they live, along with the title fees.',
    numbers: [
      { label: 'Buyer’s deadline to title', value: '60 days from purchase' },
      { label: 'Late penalty', value: '$10 on day 61, plus $10 per 30 days, up to $30' },
      { label: 'Sales tax', value: '4.225% state, plus the local rate where you live' },
      { label: 'Title fees', value: '$7.50 boat, $5 outboard motor (plus $2 outboard registration)' },
    ],
    sellerSteps: [
      'Assign the Missouri certificate of title to the buyer. An outboard motor has its own title.',
      'If you use a bill of sale (form DOR-1957) instead of a title, include a complete description of the boat, the purchase price, the date of sale and the buyer’s name and address.',
      'If there is a loan on the boat, get the lien released before closing.',
    ],
    buyerSteps: [
      'Check that the hull identification number (HIN) on the boat matches the title before you pay.',
      'Within 60 days, take the assigned title or descriptive bill of sale and your application to a Missouri license office.',
      'Pay the state sales tax of 4.225% plus your local sales tax on the purchase price, less any trade-in. The local rate is where you live, not where you bought the boat.',
      'Pay the $7.50 boat title fee, the $5 outboard motor title fee, the $2 outboard registration fee and processing fees.',
    ],
    notes: [
      {
        title: 'Outboard motors',
        text: 'Missouri titles outboard motors separately from the boat, with their own title fee and registration fee.',
      },
      {
        title: 'Temporary permit',
        text: 'Missouri offers a temporary watercraft certificate of number so you can use the boat while you complete the title and registration.',
      },
      {
        title: 'Trailers',
        text: 'A boat trailer is titled separately, and trailers have a shorter 30-day deadline than boats. List the trailer price separately from the boat.',
      },
    ],
    faq: [
      {
        q: 'How long do I have to title a boat in Missouri?',
        a: '60 days from the purchase. A $10 penalty starts on the 61st day and increases $10 for every 30 days late, up to $30.',
      },
      {
        q: 'How much sales tax is due on a used boat in Missouri?',
        a: 'State sales tax of 4.225% plus the local sales tax where you live, on the purchase price less any trade-in, paid when you title the boat.',
      },
      {
        q: 'Does an outboard motor need its own title in Missouri?',
        a: 'Yes. Missouri titles outboard motors separately. The outboard title fee is $5, plus a $2 outboard registration fee.',
      },
    ],
    sources: [
      { name: 'Missouri Department of Revenue, Boat/Vessel/Outboard Motor Titling and Registration', url: 'https://dor.mo.gov/motorv/watercraft/' },
      { name: 'Missouri Department of Revenue, Application for Watercraft or Outboard Motor Title (Form 93)', url: 'https://dor.mo.gov/forms/93.pdf' },
      { name: 'Missouri Department of Revenue, Titling Manual', url: 'https://dor.mo.gov/forms/Missouri_Titling_Manual.pdf' },
    ],
  },
  {
    slug: 'alabama-boat-bill-of-sale',
    state: 'Alabama',
    title: 'Alabama Boat Bill of Sale and Title Transfer: A Private Sale Guide',
    description:
      'How to sell or buy a used boat privately in Alabama: the bill of sale and last registration, the new title rules for boats built after 2023, the 15-day transfer window and sales tax at the county.',
    checked: CHECKED,
    dateModified: ISO,
    agencyName: 'your county probate judge or license commissioner',
    intro:
      'Alabama only started titling boats in 2024, so for most used boats the bill of sale and the last registration are still the ownership documents. Transfers happen at your county probate or license office. Here is how a private boat sale closes in Alabama.',
    shortAnswer:
      'The seller gives the buyer a detailed bill of sale and the boat’s last registration certificate (or the signed title, for a boat built after 2023). Within 15 calendar days, the buyer takes them to the county probate judge or license commissioner with an Application for Boat Registration, Transfer and Replacement, and pays the $5 transfer fee and any sales tax.',
    numbers: [
      { label: 'Transfer a currently registered boat', value: 'Within 15 calendar days of purchase' },
      { label: 'Transfer fee', value: '$5, plus registration fee if expired' },
      { label: 'Title required', value: 'Boats built after December 31, 2023 (some exclusions)' },
      { label: 'Sales tax', value: 'Same local rates as vehicles, paid at registration in your county' },
    ],
    sellerSteps: [
      'Give the buyer a bill of sale with the hull number (HIN), year, make, model, length, Alabama registration number, motor make, horsepower and serial number, the price paid, the date, and both parties’ names, addresses and signatures.',
      'Give the buyer the boat’s last registration certificate.',
      'If the boat was built after 2023 and has an Alabama title, sign the title over too.',
      'Have your signature on the bill of sale notarized. Some county offices, such as Shelby County, require it.',
    ],
    buyerSteps: [
      'Check that the HIN on the boat matches the bill of sale and registration before you pay.',
      'Within 15 calendar days, go in person to your county probate judge or license commissioner.',
      'Bring the bill of sale, the last registration (or title), your ID and a completed Application for Boat Registration, Transfer and Replacement.',
      'Pay the $5 transfer fee (plus the registration fee if it has expired) and the sales and use tax, which is based on the purchase price at the same local rates as vehicles.',
    ],
    notes: [
      {
        title: 'Which boats need a title',
        text: 'Since January 1, 2024, Alabama titles boats built after December 31, 2023, with exclusions. Boats under 18 feet are titled only if powered by an engine of 75 horsepower or more. Boats 26 feet or longer can be titled voluntarily regardless of age. Outboard motors and boat trailers are not titled in Alabama.',
      },
      {
        title: 'Itemize any trade',
        text: 'If the bill of sale lists "other valuable considerations," each one must be itemized and given a value for sales tax purposes.',
      },
      {
        title: 'Buying from someone who isn’t the registered owner',
        text: 'You must provide the chain of ownership back to the registered owner.',
      },
    ],
    faq: [
      {
        q: 'Does Alabama title boats?',
        a: 'Only boats built after December 31, 2023 (with exclusions, such as boats under 18 feet with less than 75 horsepower). Owners of boats 26 feet or longer can apply for a title voluntarily. Outboard motors and trailers are not titled.',
      },
      {
        q: 'How long do I have to transfer a used boat in Alabama?',
        a: 'If the boat is currently registered in Alabama, apply for the transfer within 15 calendar days of the purchase.',
      },
      {
        q: 'Do I pay sales tax on a used boat in Alabama?',
        a: 'Sales and use tax applies to the purchase price of boats at the same local rates as vehicles. If you didn’t pay it at purchase, you pay it when you register in your home county.',
      },
    ],
    sources: [
      { name: 'Alabama Department of Revenue, Which vessels must be titled', url: 'https://www.revenue.alabama.gov/faqs/what-vessels-are-required-to-be-titled-in-alabama/' },
      { name: 'Alabama Department of Revenue, Vessel Titling Quick Reference Guide', url: 'https://www.revenue.alabama.gov/wp-content/uploads/2024/03/Vessel-Titling-Quick-Reference-Guide-2024.pdf' },
      { name: 'Shelby County, What do I need to register my boat?', url: 'https://shelbyal.com/620/To-Register-My-Boat' },
      { name: 'Houston County Probate, Boat Registration', url: 'https://houstoncountyal.gov/probate/boat/' },
    ],
  },
]

export const getStateGuide = (slug: string) => STATE_GUIDES.find((g) => g.slug === slug)
