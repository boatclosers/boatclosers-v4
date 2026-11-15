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
]

export const getStateGuide = (slug: string) => STATE_GUIDES.find((g) => g.slug === slug)
