// ═══════════════════════════════════════════════════════════════════════════
// BOATCLOSERS — DOCUMENT CATALOG
// src/data/documents.js
//
// WHAT THIS FILE IS
//   The complete set of closing documents, as pure content. Each document is
//   plain text with {{merge fields}} that fill in from a deal. This file holds
//   NO app logic and touches nothing on screen — it is a catalog the app reads.
//
// HOW IT WORKS (three small pieces, at the bottom of this file)
//   1. CONTINGENCIES  — the standard clauses a buyer can switch on in Terms.
//   2. DOCUMENTS      — the 56 documents, grouped, with {{fields}} in the text.
//   3. fillDocument() — one function that fills any document from a deal object.
//
// ADDING A DOCUMENT LATER
//   Add one entry to the DOCUMENTS array. Nothing else changes. The same
//   fill function serves every document automatically.
//
// NOTE: Not legal advice. The core set should be reviewed by a licensed marine
//   attorney in the target state before launch.
// ═══════════════════════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────────────────────
// 1. CONTINGENCIES
//    The buyer selects these in Negotiate & Terms. Each selected clause is
//    assembled into Section 3 of the Purchase Agreement automatically.
//    `key`       — stored on the deal (deal.selectedContingencies = ["survey", ...])
//    `dateField` — which deal field holds this contingency's deadline
// ───────────────────────────────────────────────────────────────────────────
export const CONTINGENCIES = [
  {
    key: "survey",
    name: "Marine Survey",
    dateField: "surveyDeadline",
    clause: "This sale is contingent upon a marine survey satisfactory to Buyer, completed at Buyer\u2019s expense on or before {{surveyDeadline}}."
  },
  {
    key: "personalInspection",
    name: "Buyer\u2019s Personal Inspection",
    dateField: "inspectionDeadline",
    clause: "This sale is contingent upon Buyer\u2019s satisfactory in-person inspection of the Vessel, completed on or before {{inspectionDeadline}}. Buyer shall conduct this inspection diligently and in good faith; if Buyer does not complete the inspection by that date, this contingency is deemed waived and the Vessel accepted in the condition then existing, subject to the other terms of this Agreement."
  },
  {
    key: "seaTrial",
    name: "Sea Trial",
    dateField: "seaTrialDeadline",
    clause: "This sale is contingent upon a satisfactory on-water sea trial of the Vessel on or before {{seaTrialDeadline}}."
  },
  {
    key: "financing",
    name: "Marine Financing",
    dateField: "financingDeadline",
    clause: "This sale is contingent upon Buyer obtaining marine financing on terms acceptable to Buyer on or before {{financingDeadline}}. If financing is denied or not obtained by that date, Buyer may terminate this Agreement and the earnest money deposit shall be refunded in full."
  },
  {
    key: "insurance",
    name: "Insurance Binder",
    dateField: "closingDate",
    clause: "This sale is contingent upon Buyer obtaining a satisfactory insurance binder on the Vessel prior to Closing."
  },
  {
    key: "title",
    name: "Clear Title / Lien Payoff",
    dateField: "closingDate",
    clause: "This sale is contingent upon Seller delivering clear title to the Vessel, free of all liens and encumbrances, at or before Closing on {{closingDate}}."
  }
];


// ───────────────────────────────────────────────────────────────────────────
// 2. DOCUMENTS
//    Two groups: the five closing instruments, and the three due-diligence
//    outcome documents. The Purchase Agreement contains the marker
//    {{CONTINGENCY_CLAUSES}}, which fillDocument() replaces with the assembled
//    clauses for whichever contingencies the buyer selected.
// ───────────────────────────────────────────────────────────────────────────
export const DOCUMENTS = [

  // ===== GROUP 1: CLOSING INSTRUMENTS =====
  {
    id: "psa",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Purchase Agreement",
    eyebrow: "Master Contract",
    title: "Vessel Purchase & Sale Agreement",
    useWhen: "Use once you and the other party agree on a price. This is the contract that binds the deal.",
    keywords: "purchase agreement contract offer accepted binding sale terms psa buy sell",
    body: `
<p class="lead recital">This Vessel Purchase &amp; Sale Agreement (the \u201cAgreement\u201d) is entered into on {{effectiveDate}} by and between {{sellerName}}, of {{sellerAddress}}{{SELLER_CITIZEN_PHRASE}} (the \u201cSeller\u201d), and {{buyerName}}, of {{buyerAddress}}{{BUYER_CITIZEN_PHRASE}} (the \u201cBuyer\u201d). Seller and Buyer may be referred to individually as a \u201cParty\u201d and collectively as the \u201cParties.\u201d</p>

<h3>1. The Vessel</h3>
<p>Seller agrees to sell, and Buyer agrees to purchase, the following vessel (the \u201cVessel\u201d):</p>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Length</span><span class="v">{{vesselLength}}</span></div>
<div class="field"><span class="k">Hull Identification Number</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">State Registration No.</span><span class="v">{{regNo}}</span></div>
<div class="field"><span class="k">USCG Documentation No.</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">Engine(s)</span><span class="v">{{engineDesc}}</span></div>
<p>The Vessel includes the engines, equipment, electronics, accessories, and other items the Parties identify as included. Where the Parties wish to itemize what conveys, they may complete and sign the <b>Inventory Schedule</b>, which forms part of this Agreement when signed by both Parties. Seller\u2019s personal property, and any item identified in writing as excluded, is not included in the sale.</p>

<h3>2. Purchase Price</h3>
<p>The total purchase price is {{salePrice}} ({{salePriceWords}} U.S. Dollars), payable as follows: {{depositAmount}} ({{depositPct}}) as an earnest money deposit and the remaining {{balanceDue}} in good funds at Closing.</p>
{{DEPOSIT_HOLDER}}

<h3>3. Buyer Contingencies</h3>
<p>Buyer shall have only the contingencies selected below. Any contingency not selected is waived.</p>
{{CONTINGENCY_CLAUSES}}

<h3>4. Exercise of Contingencies</h3>
<p>If a selected contingency is not satisfied by the applicable deadline, Buyer may (a) accept the Vessel and waive the contingency, (b) request a mutually agreed price adjustment or repair, or (c) terminate this Agreement by written notice.</p>
<p>If Buyer properly terminates this Agreement pursuant to a selected contingency and within the applicable deadline, the earnest money deposit shall be returned to Buyer in full. If Buyer does not timely exercise a selected contingency, that contingency shall be deemed waived, except as otherwise expressly provided in this Agreement.</p>
<p>Any amendment, extension, price adjustment, repair agreement, or other change to this Agreement must be agreed to in writing by Buyer and Seller.</p>

<h3>5. Condition of the Vessel</h3>
<p>Except for the express representations and warranties contained in this Agreement, the Vessel is being sold \u201cAS IS, WHERE IS,\u201d with all faults, in its present condition.</p>
<p>Buyer acknowledges that Buyer has been given the opportunity to inspect, survey, and sea-trial the Vessel and to obtain independent professional advice concerning its condition. Buyer is responsible for making Buyer\u2019s own determination regarding the Vessel\u2019s condition, value, seaworthiness, mechanical and electrical systems, engines, equipment, maintenance history, suitability for Buyer\u2019s intended use, and insurance eligibility.</p>
<p>Seller makes no representation regarding the Vessel\u2019s condition except for representations expressly stated in this Agreement. Nothing in this section limits Seller\u2019s express representations regarding ownership, authority to sell, title, or liens.</p>

<h3>6. Seller\u2019s Representations Regarding Title</h3>
<p>Seller represents and warrants that, as of Closing: Seller is the lawful owner of the Vessel or is otherwise legally authorized to sell it; Seller has full authority to enter into this Agreement and complete the sale; except as disclosed in writing to Buyer, the Vessel is free of all liens, mortgages, security interests, claims, and encumbrances \u2014 including, without limitation, maritime liens for crew wages, salvage, and necessaries (repairs, dockage, fuel, or supplies), and any preferred ship mortgage recorded with the U.S. Coast Guard; Seller has not previously sold, assigned, pledged, or transferred the Vessel or any ownership interest in it to another person; there is no undisclosed agreement giving another person a right to purchase or claim an ownership interest in the Vessel; and Seller will convey the Vessel to Buyer free and clear of all liens and encumbrances created by or attributable to Seller.</p>
<p>Seller shall be responsible for satisfying and releasing any lien or encumbrance that must be released in order to deliver the Vessel as required by this Agreement. This section survives Closing.</p>

<h3>7. Closing</h3>
<p>Closing shall occur on or before {{closingDate}}, unless the Parties agree otherwise in writing.</p>
<p>At Closing, Seller shall deliver: properly executed vessel title or other applicable ownership documentation; a properly executed bill of sale; registration documentation, if applicable; USCG documentation and transfer documents, if applicable; lien releases or other evidence reasonably necessary to establish clear title; keys and access devices; the Vessel and included equipment; and any other document specifically required by this Agreement.</p>
<p>At Closing, Buyer shall deliver the remaining Purchase Price in good funds and any document reasonably required from Buyer to complete the transfer.</p>
<p>Seller\u2019s obligation to deliver the Vessel and transfer ownership is conditioned upon Seller\u2019s receipt of the full Purchase Price. Buyer\u2019s obligation to pay the remaining Purchase Price is conditioned upon Seller\u2019s tender of the required closing documents and delivery obligations. The Parties intend that the exchange of payment, title documents, and possession occur substantially concurrently at Closing.</p>

<h3>8. Delivery and Possession</h3>
<p>The Vessel shall be delivered to Buyer at {{closingLocation}}.</p>
<p>Unless otherwise agreed in writing, Seller shall retain possession and control of the Vessel until Closing. Upon Closing and delivery, Buyer shall assume responsibility for the Vessel, including its operation, storage, insurance, maintenance, and other expenses arising after Closing.</p>

<h3>9. Risk of Loss</h3>
<p>Until Closing and delivery of the Vessel to Buyer, Seller shall bear the risk of loss, theft, destruction, or material damage to the Vessel.</p>
<p>If the Vessel is lost or suffers material damage before Closing, Buyer may (a) terminate this Agreement and receive a full return of the earnest money deposit, or (b) proceed with the transaction under terms mutually agreed upon in writing by Buyer and Seller.</p>

<h3>10. Taxes, Fees, and Transfer Costs</h3>
<p>Unless otherwise agreed in writing: Buyer shall be responsible for sales or use taxes imposed on Buyer\u2019s purchase of the Vessel, and for registration and titling fees associated with registering the Vessel in Buyer\u2019s name; Seller shall be responsible for satisfying liens and encumbrances attributable to Seller, and for any tax, fee, or charge attributable to Seller\u2019s ownership or operation of the Vessel before Closing. The Parties are responsible for obtaining their own tax advice.</p>

<h3>11. Buyer Default</h3>
<p>If all applicable Buyer contingencies have expired, been satisfied, or been waived; Seller is ready, willing, and able to complete the Closing; Seller has complied with Seller\u2019s obligations under this Agreement; and Buyer fails or refuses to complete the purchase without a termination right permitted by this Agreement \u2014 then Seller may retain the earnest money deposit as liquidated damages.</p>
<p>The Parties acknowledge that the actual damages that may result from Buyer\u2019s failure to close may be difficult to determine and that the earnest money amount is intended as a reasonable estimate of such anticipated damages and is not intended as a penalty.</p>
<p>Upon release of the earnest money to Seller as liquidated damages, neither Party shall have any further claim against the other arising solely from Buyer\u2019s failure to close, except for obligations that expressly survive termination.</p>

<h3>12. Seller Default</h3>
<p>If Buyer has satisfied or waived all applicable contingencies; Buyer is ready, willing, and able to complete the Closing; and Seller fails or refuses to complete the sale when required under this Agreement \u2014 the earnest money deposit shall be returned to Buyer in full.</p>
<p>Buyer shall retain any other right or remedy expressly provided by this Agreement or available under applicable law.</p>

<h3>13. Disputed Earnest Money</h3>
{{DISPUTED_DEPOSIT}}

<h3>14. BoatClosers Transaction Facilitation</h3>
<p>BoatClosers is not a party to the sale of the Vessel. BoatClosers provides transaction facilitation, documentation, communication, and workflow tools intended to assist Buyer and Seller in completing their transaction.</p>
<p>Unless separately agreed in writing, BoatClosers does not act as Buyer or Seller; a broker or dealer; an escrow agent; a surveyor; a mechanic; an insurer; a lender; a title company; an attorney; a maritime professional; a guarantor of the Vessel; or a guarantor of either Party\u2019s performance. Buyer and Seller acknowledge that they are entering into this Agreement directly with one another.</p>
<p>Buyer and Seller are solely responsible for the accuracy of information they provide; representations they make; decisions they make; inspections and surveys they obtain; financing; insurance; title and ownership information provided by them; the condition and value of the Vessel; and their respective obligations under this Agreement.</p>
<p>BoatClosers does not independently verify the Vessel\u2019s condition, value, ownership, title, liens, mechanical condition, seaworthiness, documentation, insurance eligibility, financing, or other characteristics of the Vessel unless a specific service is separately identified and agreed to in writing. Buyer and Seller are encouraged to obtain independent legal, tax, insurance, survey, mechanical, title, and other professional advice as appropriate.</p>
<p>Nothing in this Agreement makes BoatClosers responsible for the acts or omissions of Buyer, Seller, the escrow agent, a surveyor, mechanic, insurer, lender, title authority, or any other third party.</p>

<h3>15. BoatClosers\u2019 Role in the Transaction</h3>
<p>The Parties acknowledge that BoatClosers\u2019 role is intended to facilitate an organized transaction between Buyer and Seller. BoatClosers may provide forms, checklists, reminders, transaction status information, document organization, and communication tools. BoatClosers does not make the underlying transaction decisions for either Party. Buyer and Seller remain responsible for reviewing this Agreement and all transaction information before signing or taking action.</p>

<h3>16. Notices</h3>
<p>Any notice required or permitted under this Agreement shall be made in writing and may be delivered by email, an electronic signature platform, the BoatClosers transaction platform, or another method agreed upon by the Parties. A notice shall be effective when transmitted to the email address or electronic account designated by the receiving Party, unless the sender receives notice that the transmission was not delivered.</p>

<h3>17. Time Is of the Essence</h3>
<p>Time is of the essence with respect to the deadlines and Closing Date stated in this Agreement. Any deadline may be extended only by written agreement of Buyer and Seller.</p>

<h3>18. Dispute Resolution</h3>
<p>Buyer and Seller shall first attempt in good faith to resolve any dispute arising from this Agreement through direct communication. If the dispute cannot be resolved directly, the Parties shall attempt to resolve it through mediation before commencing arbitration or litigation, unless emergency or other circumstances make immediate legal action reasonably necessary.</p>
<p>If mediation does not resolve the dispute, the Parties may pursue any remedy available under applicable law or any arbitration requirement contained in a separate agreement signed by the Parties. Nothing in this section requires BoatClosers to participate in a dispute between Buyer and Seller merely because BoatClosers facilitated the transaction.</p>

<h3>19. Governing Law</h3>
<p>This Agreement shall be governed by the laws of the State of Florida, without regard to conflict-of-law principles, except to the extent applicable federal maritime law or another mandatory law governs a particular issue. If the Vessel is documented, titled, or registered in another jurisdiction, the Parties acknowledge that additional federal or state requirements may apply to the transfer.</p>

<h3>20. Electronic Signatures</h3>
<p>The Parties agree that electronic signatures, electronic records, and electronic delivery of this Agreement may be used and shall have the same force and effect as original signatures and paper documents to the extent permitted by applicable law. Each person signing represents that they have authority to enter into this Agreement.</p>

<h3>21. Entire Agreement, Amendments, and Severability</h3>
<p>This Agreement, together with any exhibit and written amendment signed by Buyer and Seller, constitutes the entire agreement between Buyer and Seller concerning the purchase and sale of the Vessel, and supersedes prior oral or written agreements, understandings, offers, negotiations, and representations concerning it, except for any separate written agreement expressly incorporated into this Agreement.</p>
<p>No amendment, modification, waiver, extension, price change, contingency change, or other modification shall be effective unless made in writing and accepted by both Buyer and Seller. If any provision is determined to be invalid or unenforceable, the remaining provisions shall remain in effect to the fullest extent permitted by law. A Party\u2019s failure to enforce any provision shall not constitute a waiver of that provision or of the Party\u2019s right to enforce it later.</p>

<h3>22. Survival</h3>
<p>Any provision that by its nature is intended to survive Closing or termination \u2014 including obligations relating to title, liens, confidentiality, indemnification, or unresolved claims \u2014 shall survive Closing or termination as applicable.</p>

<h3>23. Acknowledgment of the Parties</h3>
<p>Buyer and Seller acknowledge that they have read this Agreement; they understand its terms; they have had the opportunity to ask questions and obtain independent professional advice; they are voluntarily entering into this Agreement; they understand that BoatClosers is facilitating the transaction and is not a party to the sale; and they are responsible for determining whether the Vessel and transaction are suitable for their respective purposes.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "bos",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Bill of Sale (Notarized)",
    eyebrow: "Transfer of Ownership",
    title: "Vessel Bill of Sale (Notarized)",
    useWhen: "Use to actually transfer ownership when your state wants it notarized \u2014 most titled vessels.",
    keywords: "bill of sale notarized notary transfer ownership title deed proof of purchase",
    desc: "The Bill of Sale with a notary block \u2014 the standard choice for most sales, and the one to use when a buyer, lender, or county wants it notarized.",
    body: `
<p class="lead recital">For consideration of {{salePrice}} ({{salePriceWords}} U.S. Dollars), the receipt of which is acknowledged, {{sellerName}}, of {{sellerAddress}} (the \u201cSeller\u201d), hereby sells, transfers, and conveys to {{buyerName}}, of {{buyerAddress}} (the \u201cBuyer\u201d), all right, title, and interest in the following vessel:</p>

<h3>Vessel Described</h3>
<ol>
  <li>Year / Make / Model: {{vesselYear}} {{vesselMake}} {{vesselModel}}</li>
  <li>Length &amp; Hull: {{vesselLength}}, {{hullMaterial}}</li>
  <li>Hull Identification Number (HIN): {{hin}}</li>
  <li>U.S. Coast Guard Official Number: {{uscgOfficialNo}}</li>
  <li>Title No. / Registration: {{titleNo}} / {{regNo}}</li>
  <li>Propulsion: {{engineDesc}}</li>
</ol>

<h3>Warranties</h3>
<p>Seller warrants lawful ownership; that the Vessel is sold free of all liens except as disclosed in writing; and that Seller will defend the title against the lawful claims of all persons. The Vessel is otherwise sold \u201cAS-IS, WHERE-IS,\u201d without warranty of condition, merchantability, or fitness for a particular purpose.</p>

<p>Executed this {{effectiveDate}}.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment — Seller (the Seller signs this before a notary)</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>The foregoing instrument was acknowledged before me by means of \u2610 physical presence or \u2610 online notarization, this ______ day of __________, 20____, by {{sellerName}}, who is personally known to me or who produced ____________________ as identification.</p>
  <p style="margin-top:14px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
  <p class="recital" style="font-size:11.5px">Notarization is included for jurisdictions and lenders that require it; complete it where applicable.</p>
</div>`
  },


  {
    id: "bos_plain",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Bill of Sale (Simple)",
    eyebrow: "Transfer of Ownership",
    title: "Vessel Bill of Sale (Simple, No Notary)",
    useWhen: "Use for a quick sale where no notary is required. Check your state accepts it before relying on it.",
    keywords: "bill of sale simple no notary quick cash sale receipt proof of purchase",
    desc: "Quick-sale version \u2014 fill the price in the app or write it in by hand. No notary block.",
    body: `
<p class="lead recital">{{sellerName}}, of {{sellerAddress}} (the \u201cSeller\u201d), hereby sells, transfers, and conveys to {{buyerName}}, of {{buyerAddress}} (the \u201cBuyer\u201d), all right, title, and interest in the following vessel:</p>

<h3>Vessel Described</h3>
<ol>
  <li>Year / Make / Model: {{vesselYear}} {{vesselMake}} {{vesselModel}}</li>
  <li>Length &amp; Hull: {{vesselLength}}, {{hullMaterial}}</li>
  <li>Hull Identification Number (HIN): {{hin}}</li>
  <li>U.S. Coast Guard Official Number: {{uscgOfficialNo}}</li>
  <li>Title No. / Registration: {{titleNo}} / {{regNo}}</li>
  <li>Propulsion: {{engineDesc}}</li>
</ol>

<h3>Sale Price</h3>
<div class="field"><span class="k">Sale Price</span><span class="v">$________________</span></div>

<h3>Warranties</h3>
<p>Seller warrants lawful ownership; that the Vessel is sold free of all liens except as disclosed in writing; and that Seller will defend the title against the lawful claims of all persons. The Vessel is otherwise sold \u201cAS-IS, WHERE-IS.\u201d</p>

<p>Executed this {{effectiveDate}}.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer</small></div>
</div>`
  },

  {
    id: "fl_82050",
    signer: "seller",
    completion: "wet",
    group: "Closing Instruments",
    tab: "FL Official Bill of Sale (82050)",
    florida: true,
    eyebrow: "Florida Official Form",
    title: "Florida Bill of Sale — HSMV 82050",
    useWhen: "Use for a Florida transfer. The state's own bill of sale form, accepted at any tag office.",
    keywords: "florida state form 82050 hsmv bill of sale tag office dmv",
    desc: "Florida\u2019s own Bill of Sale. Open the state\u2019s fillable form and complete it directly \u2014 your deal details are listed underneath so you have everything to hand.",
    viewOnly: true,
    externalUrl: "https://www.flhsmv.gov/pdf/forms/82050.pdf",
    body: `
<p class="lead recital"><b>Start with the button above.</b> It opens Florida\u2019s own fillable form (HSMV 82050) \u2014 type straight into it, print, and sign. A notary is <b>not</b> required on the 82050 itself, though a few counties ask for one, so check with yours.</p>

<div class="note">Your deal details are listed below purely so you have them in one place while you fill the state\u2019s form in. Nothing here needs signing.</div>

<h3>Vessel / Motor Information</h3>
<div class="field"><span class="k">Year</span><span class="v">{{vesselYear}}</span></div>
<div class="field"><span class="k">Make</span><span class="v">{{vesselMake}}</span></div>
<div class="field"><span class="k">Model</span><span class="v">{{vesselModel}}</span></div>
<div class="field"><span class="k">Length</span><span class="v">{{vesselLength}}</span></div>
<div class="field"><span class="k">Hull material</span><span class="v">{{hullMaterial}}</span></div>
<div class="field"><span class="k">Hull ID Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Registration / Title No.</span><span class="v">{{regNo}} / {{titleNo}}</span></div>
<div class="field"><span class="k">USCG Official No.</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">Propulsion</span><span class="v">{{engineDesc}}</span></div>

<h3>Seller</h3>
<div class="field"><span class="k">Name</span><span class="v">{{sellerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{sellerAddress}}</span></div>

<h3>Buyer / Purchaser</h3>
<div class="field"><span class="k">Name</span><span class="v">{{buyerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{buyerAddress}}</span></div>

<h3>Sale</h3>
<div class="field"><span class="k">Sale Price</span><span class="v">{{salePrice}}</span></div>
<div class="field"><span class="k">Date of Sale</span><span class="v">{{effectiveDate}}</span></div>

<div class="note">After you complete the official 82050, you can come back and mark this item done (and optionally upload a copy). Also confirm whether your county wants the state form, our Vessel Bill of Sale, or both.</div>`
  },

  {
    id: "fl_82040vs",
    signer: "buyer",
    completion: "wet",
    group: "Closing Instruments",
    tab: "FL Vessel Title App (82040-VS)",
    eyebrow: "Florida Official Form",
    title: "Florida Vessel Title Application — HSMV 82040-VS",
    useWhen: "Use to put the Florida title into the buyer's name. Filed at the tag office after closing.",
    keywords: "florida title application 82040 hsmv register registration transfer title tag office dmv",
    desc: "The buyer files this with a Florida tax collector to title the vessel in their name. Required for most Florida vessel transfers. Your deal data is summarized below to copy onto the official PDF.",
    viewOnly: true,
    florida: true,
    externalUrl: "https://www.flhsmv.gov/pdf/forms/82040-vs.pdf",
    body: `
<p class="lead recital">This is Florida\u2019s official <b>Application for Vessel Certificate of Title (HSMV 82040-VS)</b>. The <b>buyer</b> files this with a Florida county tax collector to put the vessel in their name. Open the official form using the button above, then copy the details below onto it.</p>

<div class="note">BoatClosers can\u2019t type onto the state PDF, but here is your deal data in one place so the official form fills fast. Everything below is pulled from this deal.</div>

<h3>Applicant / New Owner (Buyer)</h3>
<div class="field"><span class="k">Name</span><span class="v">{{buyerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{buyerAddress}}</span></div>

<h3>Vessel</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Length</span><span class="v">{{vesselLength}}</span></div>
<div class="field"><span class="k">Hull material</span><span class="v">{{hullMaterial}}</span></div>
<div class="field"><span class="k">Hull ID Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Registration / Title No.</span><span class="v">{{regNo}} / {{titleNo}}</span></div>
<div class="field"><span class="k">USCG Official No.</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">Propulsion</span><span class="v">{{engineDesc}}</span></div>

<h3>Prior Owner (Seller)</h3>
<div class="field"><span class="k">Name</span><span class="v">{{sellerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{sellerAddress}}</span></div>

<h3>Sale</h3>
<div class="field"><span class="k">Purchase Price</span><span class="v">{{salePrice}}</span></div>
<div class="field"><span class="k">Date of Sale</span><span class="v">{{effectiveDate}}</span></div>

<div class="note">A HIN/vessel inspection and Florida sales tax may apply on the 82040-VS. Confirm your county tax collector\u2019s exact requirements. After filing, come back and mark this item done.</div>`
  },

  {
    id: "fl_82053",
    signer: "dynamic",
    completion: "wet",
    group: "Deal Structures",
    tab: "FL Power of Attorney (82053)",
    eyebrow: "Florida Official Form",
    title: "Florida Power of Attorney — HSMV 82053",
    useWhen: "Use when someone signs Florida title paperwork on another person's behalf.",
    keywords: "florida power of attorney 82053 hsmv signing for someone else agent authorize",
    desc: "Florida\u2019s official Power of Attorney for a vessel transfer \u2014 use if one party is signing on another\u2019s behalf. Official alternative to the BoatClosers POA.",
    viewOnly: true,
    florida: true,
    externalUrl: "https://www.flhsmv.gov/pdf/forms/82053.pdf",
    body: `
<p class="lead recital">This is Florida\u2019s official <b>Power of Attorney for a Motor Vehicle, Mobile Home or Vessel (HSMV 82053)</b>. Use it when one person authorizes another to sign the vessel transfer for them. Open the official form above and copy the details below onto it.</p>

<div class="note">Your deal data, ready to transcribe onto the official form.</div>

<h3>Vessel</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Hull ID Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>

<h3>Parties</h3>
<div class="field"><span class="k">Seller</span><span class="v">{{sellerName}}</span></div>
<div class="field"><span class="k">Buyer</span><span class="v">{{buyerName}}</span></div>

<div class="note">The 82053 must be completed per its own instructions (it may require notarization). Confirm your county\u2019s requirements.</div>`
  },

  {
    id: "fl_82101",
    signer: "dynamic",
    completion: "wet",
    group: "Title & Government",
    tab: "FL Duplicate Title (82101)",
    eyebrow: "Florida Official Form",
    title: "Florida Duplicate/Lost Title — HSMV 82101",
    useWhen: "Use when the Florida title is lost, destroyed, or never arrived, and you need a duplicate.",
    keywords: "florida lost title duplicate 82101 hsmv missing title replace title cant find title",
    desc: "Florida\u2019s official application for a duplicate or lost vessel title. Use if the seller\u2019s Florida title is lost. Official alternative to the BoatClosers lost-title affidavit.",
    viewOnly: true,
    florida: true,
    externalUrl: "https://www.flhsmv.gov/pdf/forms/82101.pdf",
    body: `
<p class="lead recital">This is Florida\u2019s official <b>Application for Duplicate or Lost Title (HSMV 82101)</b>. Use it when a Florida vessel title is lost, destroyed, or otherwise unavailable. Open the official form above and copy the details below onto it.</p>

<div class="note">Your deal data, ready to transcribe onto the official form.</div>

<h3>Owner (Seller)</h3>
<div class="field"><span class="k">Name</span><span class="v">{{sellerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{sellerAddress}}</span></div>

<h3>Vessel</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Hull ID Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>

<div class="note">The 82101 must be completed and filed per its own instructions. This is the actual form the seller submits to replace a lost Florida title.</div>`
  },

  {
    id: "cg_1340",
    signer: "seller",
    completion: "wet",
    group: "Closing Instruments",
    tab: "Coast Guard Bill of Sale (CG-1340)",
    eyebrow: "USCG Documented Vessel",
    title: "U.S. Coast Guard Bill of Sale — CG-1340",
    useWhen: "Use to transfer a Coast Guard documented vessel. The federal bill of sale.",
    keywords: "coast guard federal cg-1340 documented vessel uscg bill of sale documentation",
    desc: "The official Bill of Sale for a U.S. Coast Guard DOCUMENTED vessel. Must be notarized and list every owner on the Certificate of Documentation. Your deal data is summarized below to copy onto the official PDF.",
    viewOnly: true,
    documented: true,
    externalUrl: "https://www.dco.uscg.mil/Portals/9/DCO%20Documents/NVDC/Forms/CG-1340_Bill_of_Sale_11_30_2026_v2.pdf",
    body: `
<p class="lead recital">This is the <b>U.S. Coast Guard Bill of Sale (CG-1340)</b> \u2014 the form required to transfer ownership of a Coast Guard <b>documented</b> vessel. Open the official form using the button above, then copy the details below onto it.</p>

<div class="bc-notary-flag">\u2696 <strong>Must be notarized.</strong> The CG-1340 must be signed before a notary and must list <b>every</b> owner shown on the Certificate of Documentation. An unsigned or un-notarized bill of sale is not a valid transfer for a documented vessel.</div>

<div class="note">BoatClosers can\u2019t type onto the federal PDF, but here is your deal data in one place so filling the official form is quick. Everything below is pulled from this deal.</div>

<h3>Vessel</h3>
<div class="field"><span class="k">Documented / Vessel name</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">USCG Official Number</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">Hull ID Number (HIN)</span><span class="v">{{hin}}</span></div>

<h3>Seller(s) \u2014 all owners on the COD</h3>
<div class="field"><span class="k">Name</span><span class="v">{{sellerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{sellerAddress}}</span></div>

<h3>Buyer(s)</h3>
<div class="field"><span class="k">Name</span><span class="v">{{buyerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{buyerAddress}}</span></div>

<h3>Sale</h3>
<div class="field"><span class="k">Sale Price</span><span class="v">{{salePrice}}</span></div>
<div class="field"><span class="k">Date of Sale</span><span class="v">{{effectiveDate}}</span></div>

<div class="note">Alternative: instead of the CG-1340, the seller may complete and notarize the <b>back side of the CG-1270 Certificate of Documentation</b>. Either one is a valid transfer document. After completing, come back and mark this item done (and optionally upload the notarized copy).</div>`
  },

  {
    id: "cg_1258",
    signer: "buyer",
    completion: "wet",
    group: "Title & Government",
    tab: "USCG Documentation App (CG-1258)",
    eyebrow: "USCG Documented Vessel",
    title: "USCG Application for Documentation / Transfer — CG-1258",
    useWhen: "Use to document a vessel with the Coast Guard, or move existing documentation to the buyer.",
    keywords: "coast guard cg-1258 uscg documentation application transfer documented vessel",
    desc: "The new owner files this with the National Vessel Documentation Center to document the vessel in their name after the sale. Your deal data is summarized below for the official form.",
    viewOnly: true,
    documented: true,
    externalUrl: "https://www.dco.uscg.mil/Portals/9/DCO%20Documents/NVDC/Forms/CG-1258_11_30_2026.pdf",
    body: `
<p class="lead recital">This is the <b>USCG Application for Initial Issue / Exchange / Transfer of Documentation (CG-1258)</b>. The <b>buyer</b> (new owner) files this with the National Vessel Documentation Center (NVDC), together with the signed CG-1340 Bill of Sale and the original Certificate of Documentation, to document the vessel in their name.</p>

<div class="note">Your deal data, ready to transcribe onto the official form.</div>

<h3>Applicant / New Owner (Buyer)</h3>
<div class="field"><span class="k">Name</span><span class="v">{{buyerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{buyerAddress}}</span></div>

<h3>Vessel</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">USCG Official Number</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">Hull ID Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Length / Hull</span><span class="v">{{vesselLength}} / {{hullMaterial}}</span></div>
<div class="field"><span class="k">Propulsion</span><span class="v">{{engineDesc}}</span></div>

<h3>Prior Owner (Seller)</h3>
<div class="field"><span class="k">Name</span><span class="v">{{sellerName}}</span></div>

<div class="note">Submit the CG-1258 with: the signed/notarized CG-1340 (or notarized back of the CG-1270), the original Certificate of Documentation, and the required NVDC fees. If there is an outstanding mortgage, a Satisfaction of Mortgage is also required.</div>`
  },

  {
    id: "dep",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Deposit Receipt",
    eyebrow: "Earnest Money",
    title: "Earnest Money Deposit Receipt",
    useWhen: "Use when the buyer hands over earnest money. Proves who holds it and on what terms.",
    keywords: "deposit receipt earnest money down payment good faith escrow holding money",
    body: `
<p class="lead">This receipt confirms that {{buyerName}} (the \u201cBuyer\u201d) has paid an earnest money deposit toward the purchase of the Vessel below, under the Purchase &amp; Sale Agreement dated {{effectiveDate}}.</p>

<table class="stmt">
  <tr class="head"><td>Item</td><td class="r">Detail</td></tr>
  <tr><td>Buyer</td><td class="r">{{buyerName}}</td></tr>
  <tr><td>Seller</td><td class="r">{{sellerName}}</td></tr>
  <tr><td>Vessel</td><td class="r">{{vesselYear}} {{vesselMake}} {{vesselModel}}</td></tr>
  <tr><td>HIN</td><td class="r">{{hin}}</td></tr>
  <tr><td>Purchase Price</td><td class="r">{{salePrice}}</td></tr>
  <tr class="tot"><td>Earnest Money Received ({{depositPct}})</td><td class="r">{{depositAmount}}</td></tr>
  <tr><td>Balance Due at Closing</td><td class="r">{{balanceDue}}</td></tr>
  <tr><td>Date Received</td><td class="r">{{effectiveDate}}</td></tr>
</table>

<h3>Terms of the Deposit</h3>
<ol>
  <li>The deposit is applied toward the Purchase Price at Closing.</li>
  <li>If Buyer terminates within a contingency permitted by the Agreement, the deposit is refunded in full.</li>
  <li>If Buyer defaults without a permitted contingency, the deposit may be retained by Seller as liquidated damages.</li>
  <li>If Seller defaults, the deposit is refunded in full to Buyer.</li>
</ol>

<div class="note">Deposit method and escrow handling are recorded with the deal. Unlike a brokered sale, where the deposit is held in the broker\u2019s account, the BoatClosers deposit is held by a neutral escrow agent or by the method the Parties select \u2014 no broker holds your funds. A signed deposit receipt is suggested but not required to advance the transaction.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Received by \u2014 <b>{{sellerName}}</b> (Seller)<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Acknowledged \u2014 <b>{{buyerName}}</b> (Buyer)<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "asis",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "As-Is & Disclosure",
    eyebrow: "Condition & Defects",
    title: "As-Is Acknowledgment & Known Defects",
    useWhen: "Use on nearly every sale. Confirms the boat sells as it sits and lists the faults disclosed.",
    keywords: "as is acknowledgment disclosure known defects problems faults condition no warranty",
    body: `
<p class="lead recital">This Acknowledgment is part of the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d), concerning the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>1. Sale \u201cAs-Is\u201d</h3>
<p>Buyer agrees the Vessel is sold in its present condition, \u201cAS-IS, WHERE-IS,\u201d with all faults. Except for Seller\u2019s warranty of title, Seller makes no representation or warranty, express or implied, as to the condition, seaworthiness, merchantability, or fitness of the Vessel for any particular purpose.</p>

<h3>2. Buyer\u2019s Right to Inspect</h3>
<p>Buyer acknowledges the right to a marine survey and sea trial at Buyer\u2019s expense, per the contingencies selected in the Agreement, and to rely on Buyer\u2019s own inspection rather than informal statements of the Seller.</p>

<h3>3. Seller\u2019s Disclosure of Known Material Defects</h3>
<p>To the best of Seller\u2019s knowledge, Seller discloses the following (if none, state \u201cNone known\u201d):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>
<p>Seller affirms this disclosure is true and complete to the best of Seller\u2019s knowledge and that no material defect has been knowingly concealed.</p>

<div class="note">A written good-faith disclosure of known defects protects both Parties and reduces post-sale disputes, regardless of state.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "inventory",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Inventory Schedule",
    eyebrow: "What Conveys",
    title: "Inventory Schedule",
    useWhen: "Use to list exactly what gear stays with the boat \u2014 and what the seller is keeping.",
    keywords: "inventory schedule equipment gear included electronics safety what conveys extras",
    optional: true,
    body: `
<p class="lead recital">This Inventory Schedule is an optional attachment to the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d), concerning the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}. It itemizes the specific gear and accessories that convey with the Vessel at Closing.</p>

<h3>1. Items Included in the Sale</h3>
<p>The following equipment, gear, and accessories are included in the sale and convey with the Vessel (list each item; add "None" where a category does not apply):</p>

<p><b>Electronics &amp; Navigation</b> (chartplotter, radar, VHF, autopilot, fishfinder, stereo):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<p><b>Safety Equipment</b> (PFDs, flares, fire extinguishers, EPIRB, life raft):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<p><b>Ground Tackle &amp; Deck</b> (anchor, rode, windlass, fenders, lines, boat hook):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<p><b>Tender / Dinghy &amp; Outboard</b> (make, model, serial, and its motor, if included):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<p><b>Canvas, Sails &amp; Covers</b> (bimini, enclosure, sail inventory, covers):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<p><b>Other Gear &amp; Accessories</b> (galley equipment, tools, spare parts, water toys):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<h3>2. Items Excluded from the Sale</h3>
<p>The following items are the Seller\u2019s personal property and are <b>excluded</b> from the sale (Seller\u2019s personal effects are excluded whether or not listed):</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<div class="note">Itemizing what conveys is optional, but it is the single best way to prevent post-sale disputes about missing electronics, tenders, or gear. If completed and signed, this Schedule controls what is included; if left incomplete, the Vessel conveys with its engines, equipment, and gear as equipped, per the Agreement.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "wire_instructions",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Wire Instructions",
    eyebrow: "Payment Details",
    title: "Wire Transfer Instructions",
    useWhen: "Use when the balance is being wired. The seller fills it in, the buyer confirms it by phone, and both sign.",
    keywords: "wire instructions bank account routing aba swift transfer payment where to send money funds balance",
    body: `
<div class="note"><b>Read this before sending anything.</b> Wire fraud is the most common way money is stolen in a boat sale. Criminals intercept email, copy the wording, change the account number, and send it again from an address that looks almost right. <b>Confirm every figure below by telephone</b>, on a number you already had \u2014 never a number written in an email. BoatClosers never sends payment instructions and will never ask you to redirect funds.</div>

<h3>1. Sending To</h3>
<div class="field"><span class="k">Account holder (exact name on the account)</span><span class="v">________________________________</span></div>
<div class="field"><span class="k">Bank name</span><span class="v">________________________________</span></div>
<div class="field"><span class="k">Bank address</span><span class="v">________________________________</span></div>
<div class="field"><span class="k">ABA / routing number</span><span class="v">____________________</span></div>
<div class="field"><span class="k">Account number</span><span class="v">____________________</span></div>
<div class="field"><span class="k">SWIFT / BIC (international only)</span><span class="v">____________________</span></div>
<div class="field"><span class="k">Reference to include</span><span class="v">{{dealRef}} \u2014 {{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>

<h3>2. Amount</h3>
<div class="field"><span class="k">Balance due at closing</span><span class="v">{{balanceDue}}</span></div>
<div class="field"><span class="k">Purchase price</span><span class="v">{{salePrice}}</span></div>
<div class="field"><span class="k">Earnest money already paid</span><span class="v">{{depositAmount}}</span></div>
<p class="recital">Wire fees are the responsibility of the sending party unless the Parties have agreed otherwise in writing.</p>

<h3>3. Voice Confirmation</h3>
<p>Buyer confirms that the account details above were read back and agreed <b>by telephone</b> with the Seller, not by email or message.</p>
<div class="field"><span class="k">Confirmed by phone on (date)</span><span class="v">____________________</span></div>
<div class="field"><span class="k">Number called</span><span class="v">____________________</span></div>
<div class="field"><span class="k">Spoke with</span><span class="v">____________________</span></div>

<h3>4. If Anything Changes</h3>
<p>If either Party receives a message changing these details \u2014 from any address, however convincing, and however urgent it sounds \u2014 <b>stop and telephone the other Party</b> on the number recorded above before sending or accepting any funds. A genuine change will survive a phone call. A fraudulent one will not.</p>
<p class="recital">Seller confirms these are the details of an account they hold and control. Buyer confirms they have verified them by voice. BoatClosers does not hold, transfer, or verify funds, and is not a party to the payment.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller, account holder<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer, confirmed by voice<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "stmt",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Settlement Statement",
    eyebrow: "Final Tally",
    title: "Closing & Settlement Statement",
    useWhen: "Use at closing. The final figures showing who paid what and who owes what.",
    keywords: "closing statement settlement final numbers payoff figures money breakdown",
    body: `
<p class="lead">This statement summarizes funds and credits for the closing of the Vessel below, finalized on {{closingDate}}.</p>

<table class="stmt">
  <tr class="head"><td>Transaction</td><td class="r">Amount</td></tr>
  <tr><td>Vessel</td><td class="r">{{vesselYear}} {{vesselMake}} {{vesselModel}}</td></tr>
  <tr><td>HIN</td><td class="r">{{hin}}</td></tr>
  <tr><td class="sec" colspan="2">Buyer\u2019s Side</td></tr>
  <tr><td>Purchase Price</td><td class="r">{{salePrice}}</td></tr>
  <tr><td>Less: Earnest Money Deposit Paid</td><td class="r">\u2013 {{depositAmount}}</td></tr>
  <tr class="tot"><td>Balance Due From Buyer at Closing</td><td class="r">{{balanceDue}}</td></tr>
  <tr><td class="sec" colspan="2">Seller\u2019s Side</td></tr>
  <tr><td>Gross Sale Proceeds</td><td class="r">{{salePrice}}</td></tr>
  <tr><td>Less: Outstanding Lien Payoff (if any)</td><td class="r">\u2013 $ ______________</td></tr>
  <tr><td>Less: Other Seller Costs (if any)</td><td class="r">\u2013 $ ______________</td></tr>
  <tr class="tot"><td>Net Proceeds to Seller</td><td class="r">$ ______________</td></tr>
  <tr><td class="sec" colspan="2">Platform</td></tr>
  <tr><td>BoatClosers Flat Fee (paid at signup)</td><td class="r">{{brokerFee}}</td></tr>
</table>

<div class="note"><b>Seller\u2019s side:</b> enter any loan payoff and other seller costs, then the net proceeds \u2014 gross sale proceeds less those amounts. The payoff figure should come from the lender in writing, good through the closing date. BoatClosers does not calculate or verify these numbers.</div>

<div class="note">Title transfer and registration fees payable to the state are the responsibility of the Buyer and are paid directly to the state agency; they are not collected by BoatClosers.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  // ===== GROUP 2: DUE-DILIGENCE OUTCOMES =====
  {
    id: "accept",
    signer: "both",
    completion: "esign",
    group: "Due-Diligence Outcomes",
    tab: "Acceptance",
    eyebrow: "Contingencies Satisfied",
    title: "Contingency Removal & Vessel Acceptance",
    useWhen: "Use after the survey and sea trial to formally accept the boat and release contingencies.",
    keywords: "acceptance contingency removal survey passed sea trial approve accept the boat",
    body: `
<p class="lead recital">Reference: Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d) for the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>Buyer\u2019s Acceptance</h3>
<p>Buyer confirms that the following contingencies selected in the Agreement have been satisfied or are hereby removed: {{contList}}.</p>
<p>Having completed due diligence, Buyer accepts the Vessel in its present condition and confirms the Buyer\u2019s intent to proceed to Closing on or before {{closingDate}}. The earnest money deposit of {{depositAmount}} now becomes non-refundable except in the event of Seller default.</p>

<div class="note">In keeping with BoatClosers\u2019 buyer-led acceptance model, only the Buyer executes this acceptance; it removes the Buyer\u2019s remaining exit rights and locks the deal toward Closing.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "amend",
    signer: "both",
    completion: "esign",
    group: "Due-Diligence Outcomes",
    tab: "Renegotiation",
    eyebrow: "Post-Survey Adjustment",
    title: "Amendment & Renegotiation of Terms",
    useWhen: "Use to change price or terms after the agreement is signed \u2014 usually after a survey.",
    keywords: "amendment renegotiate change price adjust terms modify agreement after survey",
    body: `
<p class="lead recital">This Amendment modifies the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d) for the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}. All other terms of the Agreement remain in full force.</p>

<h3>1. Reason for Amendment</h3>
<p>Following the marine survey and/or sea trial, the Parties agree to adjust the terms as set forth below to account for the findings described here:</p>
<ol><li>____________________________________________________________</li></ol>

<h3>2. Revised Terms</h3>
<table class="stmt">
  <tr class="head"><td>Term</td><td class="r">Original \u2192 Revised</td></tr>
  <tr><td>Purchase Price</td><td class="r">{{salePrice}} \u2192 $ ______________</td></tr>
  <tr><td>Price Reduction</td><td class="r">$ ______________</td></tr>
  <tr><td>Repairs by Seller before Closing</td><td class="r">\u2610 None &nbsp; \u2610 As listed above</td></tr>
  <tr><td>Revised Closing Date</td><td class="r">{{closingDate}}</td></tr>
</table>
<p>Upon signature by both Parties, the revised terms replace the corresponding terms of the original Agreement. The earnest money deposit carries forward and applies to the revised Purchase Price.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "title_search_letter",
    signer: "seller",
    completion: "esign",
    group: "Title & Lien Check",
    tab: "Title Search Letter",
    eyebrow: "Recommended \u2014 Verify Clear Title",
    title: "Title & Lien Search Request Letter",
    useWhen: "Use before closing to ask the state or Coast Guard whether any liens are recorded.",
    keywords: "title search lien search check for liens encumbrance records request letter",
    body: `
<p class="recital">Before closing, BoatClosers recommends confirming the vessel carries a clean, lien-free title. Send this letter to the titling authority where the vessel is registered (your state\u2019s DMV or DNR titling office) and, for a federally documented vessel, to the U.S. Coast Guard National Vessel Documentation Center. Fill the bracketed lines and address it to the correct agency.</p>

<p>{{effectiveDate}}</p>
<p><b>From (Buyer):</b><br>{{buyerName}}<br>{{buyerAddress}}</p>
<p><b>To:</b> Titling / Records Office<br>[ State DMV / DNR titling office \u2014 or \u2014 USCG National Vessel Documentation Center, 792 T J Jackson Dr, Falling Waters, WV 25419 ]</p>

<h3>Re: Title and Lien Search Request</h3>
<p>I am the prospective buyer of the vessel described below and respectfully request a certified record of its current title status and any recorded liens or encumbrances:</p>
<table class="stmt">
  <tr><td>Vessel</td><td class="r">{{vesselYear}} {{vesselMake}} {{vesselModel}}</td></tr>
  <tr><td>Length</td><td class="r">{{vesselLength}}</td></tr>
  <tr><td>Hull Identification No. (HIN)</td><td class="r">{{hin}}</td></tr>
  <tr><td>State Registration No.</td><td class="r">{{regNo}}</td></tr>
  <tr><td>State Title No.</td><td class="r">{{titleNo}}</td></tr>
  <tr><td>USCG Official No. (if documented)</td><td class="r">{{uscgOfficialNo}}</td></tr>
  <tr><td>Titling State</td><td class="r">{{vesselState}}</td></tr>
  <tr><td>Seller / Owner of record</td><td class="r">{{sellerName}}</td></tr>
</table>

<p>Specifically, I request confirmation of: (1) the current titled owner of record; (2) any open liens, security interests, or encumbrances, and the lienholder of record; (3) any reported theft, salvage, or title brand; and (4) any outstanding registration or fees. I have enclosed any required search fee and a copy of my identification.</p>

<p>Please send the certified results to the address above. Thank you for your assistance.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Prospective Buyer<br>Date: ____________</small></div>
</div>

<div class="note">Template letter. The correct office, fees, and requirements vary by state and by whether the vessel is state-titled or U.S. Coast Guard documented. BoatClosers provides this for convenience only and does not perform the search or verify title.</div>`
  },

  {
    id: "term",
    signer: "both",
    completion: "esign",
    group: "Due-Diligence Outcomes",
    tab: "Termination",
    eyebrow: "Contingency Not Met",
    title: "Notice of Termination & Deposit Refund",
    useWhen: "Use to end the deal and return the deposit when a contingency isn't met.",
    keywords: "termination cancel walk away deposit refund back out end the deal",
    editRole: "buyer",
    checklist: [
      { label:"Marine survey disclosed material defects unacceptable to Buyer" },
      { label:"Sea trial was unsatisfactory" },
      { label:"Marine financing was denied or not obtained by the deadline" },
      { label:"Insurance binder could not be obtained" },
      { label:"Seller could not deliver clear title" },
    ],
    body: `
<p class="lead recital">Reference: Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d) for the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>1. Notice of Termination</h3>
<p>Buyer hereby gives written notice of termination of the Agreement pursuant to a contingency permitted therein. Buyer selected the following contingencies: {{contList}}. Termination is based on the contingency checked below not being satisfied:</p>
<!--CHECKLIST-->

<h3>2. Refund of Earnest Money</h3>
<p>Because termination is made under a permitted contingency, the earnest money deposit of {{depositAmount}} shall be refunded to Buyer in full, and neither Party shall have further obligation under the Agreement.</p>

<div class="note">This document exists only for contingencies the Buyer actually selected. Waived contingencies cannot be used as grounds for a refundable termination.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Acknowledged \u2014 <b>{{sellerName}}</b> (Seller)<br>Date: ____________</small></div>
</div>`
  },

  // ===== GROUP 3: TITLE & GOVERNMENT =====
  // `showIf(deal)` (optional) hides a document unless the deal calls for it.
  {
    id: "title_app",
    signer: "buyer",
    completion: "wet",
    group: "Title & Government",
    tab: "Title Application",
    eyebrow: "New Owner Registration",
    title: "Application for Certificate of Title",
    useWhen: "Use to title the boat in the buyer's name in states other than Florida.",
    keywords: "title application register registration transfer title dmv out of state",
    body: `
<p class="lead">Application is hereby made to the titling agency of the State of {{vesselState}} for a Certificate of Title to the vessel described below, recording {{buyerName}} as the new lawful owner following its purchase from {{sellerName}} on {{closingDate}}.</p>

<h3>Vessel</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Length &amp; Hull</span><span class="v">{{vesselLength}}, {{hullMaterial}}</span></div>
<div class="field"><span class="k">Hull Identification Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Prior Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>
<div class="field"><span class="k">U.S. Coast Guard Official No.</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">Propulsion</span><span class="v">{{engineDesc}}</span></div>

<h3>New Owner (Applicant)</h3>
<div class="field"><span class="k">Name</span><span class="v">{{buyerName}}</span></div>
<div class="field"><span class="k">Address</span><span class="v">{{buyerAddress}}</span></div>
<div class="field"><span class="k">Purchase Price</span><span class="v">{{salePrice}}</span></div>
<div class="field"><span class="k">Date of Sale</span><span class="v">{{closingDate}}</span></div>

<p style="margin-top:16px">The applicant certifies the information above is true and correct, that the vessel is free of undisclosed liens, and applies for a Certificate of Title and registration in the applicant's name.</p>

<div class="note">Each state files title and registration on its own form. This document collects every field those forms require so it transfers directly onto the state filing for {{vesselState}}.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Applicant / New Owner<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Agency Use Only<br>Title No. assigned: ____________</small></div>
</div>`
  },

  {
    id: "notice_sale",
    signer: "seller",
    completion: "esign",
    group: "Title & Government",
    tab: "Notice of Sale",
    eyebrow: "Seller Liability Release",
    title: "Notice of Sale & Transfer of Ownership",
    useWhen: "Use to tell the state the seller no longer owns the boat, so liability ends at the sale.",
    keywords: "notice of sale transfer of ownership release liability report the sale notify state",
    body: `
<p class="lead">{{sellerName}}, of {{sellerAddress}} (the \u201cSeller\u201d), gives notice to the titling and registration agency of the State of {{vesselState}} that the vessel described below was sold and transferred to {{buyerName}}, of {{buyerAddress}} (the \u201cBuyer\u201d), on {{closingDate}}.</p>

<h3>Vessel Sold</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>
<div class="field"><span class="k">Date of Sale</span><span class="v">{{closingDate}}</span></div>
<div class="field"><span class="k">Sale Price</span><span class="v">{{salePrice}}</span></div>

<p style="margin-top:16px">As of the date of sale, the Seller relinquishes all ownership of and responsibility for the vessel, including registration renewal, taxes, fees, and any liability arising from its use. The Seller requests that the agency update its records to reflect the Buyer as the new owner.</p>

<div class="note">Filing a notice of sale is what ends the seller's liability for the vessel. Many states have a short window to file it after the sale \u2014 submitting promptly protects the seller.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Acknowledged \u2014 <b>{{buyerName}}</b> (Buyer)<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "lien_release",
    signer: "seller",
    completion: "wet",
    group: "Title & Government",
    tab: "Lien Release",
    eyebrow: "Conditional \u2014 If Financed",
    title: "Lien Release & Satisfaction",
    useWhen: "Use when a loan has been paid off and you need written proof the lien is gone.",
    keywords: "lien release satisfaction paid off loan cleared bank release encumbrance removed",
    showIf: (deal) => !!(deal && deal.hasLien),
    body: `
<p class="lead recital">This Lien Release applies only where the vessel was subject to a recorded lien or loan. ________________________________ (the \u201cLienholder\u201d) confirms the following regarding the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>Lien Details</h3>
<div class="field"><span class="k">Lienholder</span><span class="v">{{lienholderName}}</span></div>
<div class="field"><span class="k">Loan / Account No.</span><span class="v">{{lienAcctNo}}</span></div>
<div class="field"><span class="k">Payoff Amount</span><span class="v">{{lienAmount}}</span></div>
<div class="field"><span class="k">Vessel Owner of Record</span><span class="v">{{sellerName}}</span></div>

<h3>Release</h3>
<p>The Lienholder certifies that the obligation secured by the above lien has been paid in full and that the Lienholder hereby releases and discharges all right, title, claim, and interest in the vessel. The Lienholder authorizes the titling agency to remove this lien from the vessel's record so that clear title may pass to the Buyer.</p>

<div class="note">This document appears only when the deal indicates the vessel had a loan. A clear, recorded lien release is what lets a clean title transfer to the buyer.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Authorized Officer \u2014 <b>________________________________</b><br>Title: ____________ \u00b7 Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Received \u2014 <b>{{sellerName}}</b> (Owner of Record)<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment (if required)</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the authorized officer of ________________________________, who is personally known to me or produced ____________________ as identification.</p>
  <p style="margin-top:12px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>`
  },

  {
    id: "uscg_transfer",
    signer: "seller",
    completion: "wet",
    group: "Title & Government",
    tab: "USCG Transfer",
    eyebrow: "Federal \u2014 Documented Vessels",
    title: "USCG Bill of Sale & Transfer / Deletion",
    useWhen: "Use to transfer or delete Coast Guard documentation as part of the sale.",
    keywords: "uscg transfer deletion coast guard documentation remove abstract federal",
    showIf: (deal) => !!(deal && deal.uscgOfficialNo && deal.uscgOfficialNo !== "N/A" && !String(deal.uscgOfficialNo).startsWith("[")),
    body: `
<p class="lead">For United States Coast Guard documented vessels, this instrument transfers a documented vessel and supports the application to re-document it in the Buyer's name or to delete it from documentation. It concerns the vessel <b>{{vesselModel}}</b>, U.S. Coast Guard Official Number {{uscgOfficialNo}}.</p>

<h3>Documented Vessel</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Official Number</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Length</span><span class="v">{{vesselLength}}</span></div>

<h3>Transfer</h3>
<p>For consideration of {{salePrice}}, {{sellerName}} (the \u201cSeller\u201d) sells, assigns, and transfers to {{buyerName}} (the \u201cBuyer\u201d) all right, title, and interest in the documented vessel above. The Seller warrants good and lawful title, free of undisclosed maritime liens, and agrees to deliver the Certificate of Documentation and to execute any further instruments the National Vessel Documentation Center requires.</p>

<p>The Buyer elects to: \u2610 apply for a new Certificate of Documentation in the Buyer's name; or \u2610 delete the vessel from documentation and title it under state law.</p>

<div class="note">This document is federal and works identically in every state. It appears only when the deal has a U.S. Coast Guard Official Number (documented vessels, generally those over five net tons). An Abstract of Title from the National Vessel Documentation Center confirms the vessel's lien history.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by {{sellerName}}, who is personally known to me or produced ____________________ as identification.</p>
  <p style="margin-top:12px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>`
  },

  {
    id: "hin_affidavit",
    signer: "seller",
    completion: "wet",
    group: "Title & Government",
    tab: "HIN Verification",
    eyebrow: "Hull Identity",
    title: "HIN Verification Affidavit",
    useWhen: "Use when the hull number is worn, missing, or doesn't match the paperwork.",
    keywords: "hin hull identification number worn missing mismatch doesnt match verification",
    body: `
<p class="lead recital">This affidavit confirms the Hull Identification Number of the vessel being titled, as some titling agencies require verification before issuing a new Certificate of Title.</p>

<h3>Vessel Identity</h3>
<div class="field"><span class="k">Hull Identification Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>
<div class="field"><span class="k">New Owner</span><span class="v">{{buyerName}}</span></div>

<h3>Verification</h3>
<p>The undersigned states that the HIN above was physically observed on the vessel's transom (or as otherwise affixed by the manufacturer), that it matches the number shown on the title and bill of sale, and that no evidence of alteration, removal, or tampering was observed. This affidavit is made in support of the application to title and register the vessel in the State of {{vesselState}}.</p>

<div class="note">A quick HIN check guards against a transposed digit or a mismatched record stopping the title at the agency counter \u2014 a common, avoidable delay.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Verified by \u2610 Buyer \u2610 Seller \u2610 Inspector<br>Name: ____________ \u00b7 Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Signature<br>____________________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment (if required)</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:12px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>`
  },

  // ===== GROUP 4: FINANCING & INSURANCE =====
  // One generated checklist + three upload slots (kind:"upload") for paperwork
  // the lender, insurer, and surveyor issue.
  {
    id: "fin_conditions",
    signer: "buyer",
    completion: "esign",
    group: "Financing & Insurance",
    tab: "Conditions Checklist",
    eyebrow: "Your Guide",
    title: "Financing & Insurance Conditions Checklist",
    useWhen: "Use when the buyer is borrowing. Lists what the lender and insurer still need.",
    keywords: "financing insurance conditions checklist lender requirements loan approval",
    checklist: [
      { section:"Insurance Conditions", label:"Proof of insurance / binder effective by closing", desc:"Coverage must be active on or before closing. Upload the binder to the slot in this pack." },
      { section:"Insurance Conditions", label:"Loss-payee endorsement (if financed)", desc:"If a lender is involved, the policy must name them as loss payee." },
      { section:"Insurance Conditions", label:"Marine survey on file", desc:"Most insurers require a survey for older or larger vessels, and that any safety findings are addressed." },
      { section:"Insurance Conditions", label:"Operator experience information (if requested)", desc:"Underwriters may ask the buyer's boating experience for larger vessels before binding." },
      { section:"Financing Conditions (if buyer is financing)", label:"Lender commitment letter received", desc:"The lender's written commitment to fund. Upload it to the slot in this pack." },
      { section:"Financing Conditions (if buyer is financing)", label:"Clear title confirmed / liens released", desc:"The lender requires clean title; pairs with the Lien Release in the Title & Government pack." },
      { section:"Financing Conditions (if buyer is financing)", label:"Survey acceptable to lender", desc:"Lenders typically require the same survey the insurer does." },
    ],
    body: `
<p class="lead">Before a lender will fund or an insurer will bind coverage on the {{vesselYear}} {{vesselMake}} {{vesselModel}} (HIN {{hin}}), the items below typically must be satisfied. Tap each one as you complete it. Use this as {{buyerName}}'s roadmap ahead of closing on {{closingDate}}.</p>
<!--CHECKLIST-->
<h3>Document Request \u2014 What They'll Ask For vs. What You Already Have</h3>
<p class="recital">Lenders and insurers request a stack of documents. Here is that stack \u2014 and how much of it is already done and saved in your BoatClosers deal, so you can send it in minutes instead of scrambling.</p>
{{DOC_REQUEST_STATUS}}

<div class="note">This is the real BoatClosers advantage: most of what a lender or insurer asks for is already generated, filled, and saved in your deal. You obtain only the survey, binder, and commitment letter from those providers \u2014 and the slots in this pack give each one a home.</div>

<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "commitment",
    signer: "buyer",
    completion: "esign",
    group: "Financing & Insurance",
    tab: "Commitment Letter",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Lender Commitment Letter",
    useWhen: "Use as proof the buyer's lender has actually approved the loan.",
    keywords: "lender commitment letter loan approved financing bank preapproval",
    issued: "Issued by the buyer's lender",
    icon: "\uD83C\uDFE6",
    accept: "PDF, JPG, PNG",
    showIf: (deal) => deal && deal.paymentType === "finance",
    guide: "Your <b>marine lender</b> issues this letter once your loan is approved \u2014 it confirms they will fund the purchase. BoatClosers can't generate it (only your bank can), so when you receive it, upload it here to attach it to your deal file. Lenders usually issue it after they've received your signed purchase agreement, the survey, and proof of insurance.",
    body: ""
  },

  {
    id: "binder",
    signer: "none",
    completion: "info",
    group: "Financing & Insurance",
    tab: "Insurance Binder",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Insurance Binder / Proof of Coverage",
    useWhen: "Use as proof the boat is insured from the day of closing.",
    keywords: "insurance binder proof of coverage policy insured marine insurance",
    issued: "Issued by the buyer's insurer",
    icon: "\uD83D\uDEE1\uFE0F",
    accept: "PDF, JPG, PNG",
    guide: "Your <b>marine insurer</b> issues this binder confirming coverage is in force, effective on or before closing. If you're financing, make sure it names your lender as <b>loss payee</b>. BoatClosers doesn't create it \u2014 your insurance company does \u2014 so upload it here when you have it. Send a copy to your lender too; most won't fund without it.",
    body: ""
  },

  {
    id: "survey_report",
    signer: "none",
    completion: "info",
    group: "Financing & Insurance",
    tab: "Survey Report",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Marine Survey Report",
    useWhen: "Use to attach the marine surveyor's report to the deal record.",
    keywords: "marine survey report surveyor inspection condition valuation findings",
    issued: "Issued by the marine surveyor",
    icon: "\uD83D\uDD0D",
    accept: "PDF, JPG, PNG",
    guide: "Your <b>marine surveyor</b> produces this report after inspecting the vessel. Both your lender and insurer usually require it, and it's the basis for addressing any findings before closing. Upload the surveyor's PDF here so it's attached to the deal and easy to share with your lender and insurer.",
    body: ""
  },

  // ===== GROUP 5: AUTHORITY & SIGNING =====
  // Optional instruments that establish who may legally sign a transfer.
  // Situational details (agent, entity, co-owner, name variant) are write-in
  // lines, since the app does not yet capture them in the Parties step.
  {
    id: "poa",
    signer: "dynamic",
    completion: "wet",
    group: "Authority & Signing",
    tab: "Power of Attorney",
    eyebrow: "Authority to Sign",
    title: "Limited Power of Attorney \u2014 Vessel Transfer",
    useWhen: "Use when someone signs the transfer paperwork on another person's behalf.",
    keywords: "power of attorney poa agent attorney in fact signing for someone else authorize",
    body: `
<p class="lead">{{sellerName}}, of {{sellerAddress}} (the \u201cPrincipal\u201d), appoints the Agent named below (attorney-in-fact) to act on the Principal's behalf solely for the transfer of the vessel described below.</p>

<h3>Vessel</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>

<h3>Agent (Attorney-in-Fact)</h3>
<div class="field"><span class="k">Agent name</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Agent address</span><span class="v">________________________</span></div>

<h3>Powers Granted</h3>
<p>The Agent is authorized to execute, on the Principal's behalf, the bill of sale, title assignment, notice of sale, and any titling or documentation forms required to transfer the vessel to {{buyerName}}, and to do all things reasonably necessary to complete that transfer.</p>
<p class="recital">This is a <b>limited</b> power of attorney. It is confined to the vessel above and expires upon completion of the transfer or one year from the date below, whichever is first.</p>

<div class="note">Used whenever someone signs for the owner \u2014 an out-of-state seller, a spouse, or an authorized representative. Most titling agencies require it to be notarized.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Principal<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Agent / Attorney-in-Fact<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by {{sellerName}}, who is personally known to me or produced ____________________ as identification.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "entity_auth",
    signer: "dynamic",
    completion: "wet",
    group: "Authority & Signing",
    tab: "Entity Authorization",
    eyebrow: "Business / Trust Owner",
    title: "Authorization & Resolution to Sell Vessel",
    useWhen: "Use when the seller is a company, LLC, or trust, to show the signer may sell it.",
    keywords: "company llc corporation trust business authorization resolution officer authority",
    body: `
<p class="lead">The undersigned certifies that the entity named below (the \u201cOwner\u201d) is the record owner of the vessel described and has authorized its sale and transfer to {{buyerName}}.</p>

<h3>Owner &amp; Vessel</h3>
<div class="field"><span class="k">Entity name</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Type / State</span><span class="v">______________ / ______________</span></div>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>

<h3>Resolution</h3>
<p>By this instrument, the Owner resolves that the sale of the vessel is approved, and that the authorized signer named below is authorized to execute the bill of sale, title assignment, and all transfer documents on the Owner's behalf. The undersigned warrants they hold the authority stated and that this authorization has not been revoked.</p>

<div class="note">Required whenever the boat is owned by an LLC, corporation, or trust rather than an individual. Titling agencies and the Coast Guard require proof that the person signing has authority to bind the entity.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Authorized signer \u2014 Name &amp; Title<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Witness / Second Officer (if required)<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the authorized signer named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "coowner",
    signer: "dynamic",
    completion: "wet",
    group: "Authority & Signing",
    tab: "Co-Owner Consent",
    eyebrow: "Joint Ownership",
    title: "Co-Owner Consent to Sale",
    useWhen: "Use when more than one name is on the title and one owner isn't signing in person.",
    keywords: "co-owner joint owner two names both owners spouse consent second signature",
    body: `
<p class="lead">The vessel below is owned jointly. All co-owners listed consent to its sale and transfer to {{buyerName}} and authorize the signing co-owner to execute the transfer documents.</p>

<h3>Vessel &amp; Owners</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Co-Owner 1</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Co-Owner 2</span><span class="v">________________________</span></div>

<h3>Consent</h3>
<p>Each co-owner below affirms they hold an ownership interest in the vessel, consents to the sale at the agreed terms, and authorizes the bill of sale and title assignment to be executed to complete the transfer. Where the title reads with \u201cand,\u201d all owners must sign; where it reads with \u201cor,\u201d any one may sign \u2014 this consent records the agreement of all.</p>

<div class="note">Prevents the most common joint-ownership snag: a title held by two people (\u201cand\u201d) where only one signs. Both must consent for clean transfer.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Co-Owner 1<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Co-Owner 2<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "same_person",
    signer: "dynamic",
    completion: "wet",
    group: "Authority & Signing",
    tab: "Name Affidavit",
    eyebrow: "Name Discrepancy",
    title: "Affidavit of One and the Same Person",
    useWhen: "Use when the name on the title doesn't match the seller's ID \u2014 marriage, nickname, typo.",
    keywords: "name mismatch wrong name same person maiden name married divorced nickname misspelled spelled wrong doesnt match different name on title id drivers license",
    body: `
<p class="lead recital">This affidavit resolves a difference in the name shown on the vessel's title and the name on the owner's identification, so the titling agency can process the transfer without a mismatch.</p>

<h3>The Discrepancy</h3>
<div class="field"><span class="k">Name on title / registration</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Name on identification</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>

<h3>Affirmation</h3>
<p>The affiant swears that the two names above refer to one and the same person, that the affiant is the lawful owner of the vessel described, and that this affidavit is made to correct the name of record for purposes of transferring the vessel to {{buyerName}}.</p>

<div class="note">Handles the everyday \u201cBob vs. Robert,\u201d maiden-vs-married name, or middle-initial mismatch that otherwise stalls a title at the counter.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Affiant signature<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>&nbsp;</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Sworn to and acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  // ===== GROUP 6: DEAL STRUCTURES =====
  // Trade-in, trailer, gift, and seller-financing instruments. The three
  // financing docs carry an attorney-review banner (lawBanner prepended to body).
  {
    id: "extension_addendum",
    signer: "both",
    completion: "esign",
    group: "Deal Structures",
    tab: "Extension Addendum",
    eyebrow: "Deadline Change",
    title: "Deadline Extension Addendum",
    useWhen: "Use to push back a survey, closing, or financing deadline both sides agree to move.",
    keywords: "extension addendum extend deadline more time delay push back date change",
    body: `
<p class="lead recital">This addendum to the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d), concerning the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}, records the Parties\u2019 mutual agreement to extend a deadline under the Agreement. All other terms of the Agreement remain unchanged and in full force.</p>

<h3>1. Deadline Being Extended</h3>
<div class="field"><span class="k">Deadline extended</span><span class="v">____________________________</span></div>
<div class="field"><span class="k">Original date</span><span class="v">____________________</span></div>
<div class="field"><span class="k">New agreed date</span><span class="v">____________________</span></div>

<h3>2. Reason for Extension</h3>
<p>Reason for the extension: ______________________________________________________________</p>

<h3>3. Effect on the Agreement</h3>
<p>The Parties agree the deadline identified above is extended to the new agreed date. This is the only change; the price, contingencies, deposit terms, and all other provisions of the Purchase &amp; Sale Agreement remain exactly as executed. Time remains of the essence as to the extended deadline.</p>

<div class="note">A written, signed extension protects both Parties: it prevents a missed-deadline dispute and keeps the deal enforceable on the new timeline. Both Parties should sign before the original deadline passes.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "repair_agreement",
    signer: "both",
    completion: "esign",
    group: "Deal Structures",
    tab: "Repair Agreement",
    eyebrow: "Seller Repairs",
    title: "Post-Survey Repair Agreement",
    useWhen: "Use when the survey finds problems and the seller agrees to fix them or credit the buyer.",
    keywords: "repair agreement survey issues fix credit allowance seller repairs after survey",
    body: `
<p class="lead recital">This addendum to the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d), concerning the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}, records repairs the Seller agrees to complete before Closing. All other terms of the Agreement remain unchanged.</p>

<h3>1. Repairs Seller Agrees to Complete</h3>
<p>Following the marine survey and/or inspection, Seller agrees to complete the following, at Seller\u2019s expense unless stated otherwise, on or before {{closingDate}}:</p>
<ol>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
  <li>____________________________________________________________</li>
</ol>

<h3>2. Who Pays</h3>
<div class="field"><span class="k">Cost borne by</span><span class="v">\u2610 Seller \u2003 \u2610 Buyer \u2003 \u2610 Split as noted above</span></div>
<div class="field"><span class="k">Not-to-exceed amount (optional)</span><span class="v">$______________</span></div>

<h3>3. Verification &amp; Re-Inspection</h3>
<p>Buyer may re-inspect the completed repairs before Closing. If a repair is not completed to Buyer\u2019s reasonable satisfaction by the date above, Buyer may, at Buyer\u2019s option: accept a price adjustment equal to the cost to complete, extend Closing by written agreement, or terminate under the Agreement\u2019s contingency terms.</p>

<div class="note">Post-survey repairs are one of the most common reasons a deal stalls. Putting exactly what, by when, and who pays in writing keeps the deal moving and prevents a dispute at the dock on closing day.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "contingency_waiver",
    signer: "both",
    completion: "esign",
    group: "Deal Structures",
    tab: "Contingency Waiver",
    eyebrow: "Waive a Condition",
    title: "Contingency Waiver",
    useWhen: "Use when the buyer chooses to give up a contingency and proceed anyway.",
    keywords: "waiver waive contingency skip survey proceed anyway give up condition",
    body: `
<p class="lead recital">This addendum to the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d), concerning the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}, records the Buyer\u2019s voluntary waiver of one or more contingencies. All other terms of the Agreement remain unchanged.</p>

<h3>1. Contingency / Contingencies Waived</h3>
<p>Buyer voluntarily waives the following contingency(ies) under the Agreement (check all that apply):</p>
<div class="field"><span class="k">\u2610 Marine Survey</span><span class="v">\u2610 Sea Trial \u2003 \u2610 Financing \u2003 \u2610 Insurance \u2003 \u2610 Personal Inspection \u2003 \u2610 Other: __________</span></div>

<h3>2. Buyer\u2019s Acknowledgment</h3>
<p>Buyer understands that by waiving the contingency above, Buyer gives up the corresponding right to inspect, test, finance, insure, or otherwise condition the purchase on that item, and gives up the related right to terminate the Agreement or recover the earnest-money deposit on that ground. Buyer makes this waiver knowingly and voluntarily. The Vessel remains sold \u201cAS-IS, WHERE-IS\u201d per the Agreement.</p>

<h3>3. Reason (optional)</h3>
<p>____________________________________________________________</p>

<div class="note">A signed waiver protects both Parties: it confirms the Buyer chose to give up a right rather than having it quietly lapse, which is exactly the kind of thing that gets disputed later if it isn\u2019t in writing.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller (acknowledged)<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "early_possession",
    signer: "both",
    completion: "esign",
    group: "Deal Structures",
    tab: "Early Possession",
    eyebrow: "Use Before Closing",
    title: "Early Possession / Use Before Closing Agreement",
    useWhen: "Use when the buyer takes the boat before closing. Sets who carries the risk meanwhile.",
    keywords: "early possession use before closing take the boat early risk insurance interim",
    body: `
<p class="lead recital">This addendum to the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d), concerning the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}, governs possession or use of the Vessel before Closing. All other terms of the Agreement remain unchanged.</p>

<h3>1. Who Takes Possession Before Closing</h3>
<div class="field"><span class="k">Possession granted to</span><span class="v">\u2610 Buyer (early use) \u2003 \u2610 Seller (continued use after deposit)</span></div>
<div class="field"><span class="k">From</span><span class="v">____________</span></div>
<div class="field"><span class="k">Until Closing on</span><span class="v">{{closingDate}}</span></div>

<h3>2. Risk, Insurance &amp; Responsibility</h3>
<p>The party in possession assumes all risk of loss or damage to the Vessel during the possession period and must carry insurance naming the other Party. The party in possession is responsible for safe operation, dockage, fuel, and routine care, and returns the Vessel in the same condition, ordinary wear excepted. If the sale does not close, the Vessel is returned immediately to the Seller and the deposit is handled per the Agreement.</p>

<h3>3. No Change of Ownership</h3>
<p>Possession or use before Closing does not transfer title, ownership, or the risk allocation of the Agreement except as stated here. Title passes only at Closing upon delivery of the Bill of Sale and payment of the balance.</p>

<div class="note">Using the boat before closing is risk-heavy \u2014 if something happens on the water before title transfers, this document decides who is responsible. Do not skip the insurance line.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "trade_in",
    signer: "both",
    completion: "esign",
    group: "Deal Structures",
    tab: "Trade-In Addendum",
    eyebrow: "Partial Payment",
    title: "Trade-In Addendum",
    useWhen: "Use when the buyer is trading another boat in as part of the price.",
    keywords: "trade in trade-in swap another boat part exchange credit toward",
    editRole: "buyer",
    body: `
<p class="lead">This addendum to the Purchase &amp; Sale Agreement records property the Buyer, {{buyerName}}, is trading to the Seller, {{sellerName}}, as partial payment toward the {{vesselYear}} {{vesselMake}} {{vesselModel}}.</p>

<h3>Trade-In Property</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">________________________</span></div>
<div class="field"><span class="k">HIN / Serial</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Agreed trade value</span><span class="v">$______________</span></div>

<h3>Adjusted Balance</h3>
<div class="field"><span class="k">Purchase price</span><span class="v">{{salePrice}}</span></div>
<div class="field"><span class="k">Less trade-in value</span><span class="v">($______________)</span></div>
<div class="field"><span class="k">Net cash due from Buyer</span><span class="v">$______________</span></div>

<p style="margin-top:14px">The Buyer warrants good title to the trade-in property, free of undisclosed liens, and will deliver its title and a signed bill of sale at closing. The Seller accepts the trade-in at the agreed value above as partial payment.</p>

<div class="note">Used when a buyer offers another boat (or property) as part of the price. The trade-in itself needs its own bill of sale and title transfer \u2014 the same way any boat sale does.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "fl_bos_itemized",
    signer: "both",
    completion: "esign",
    group: "Closing Instruments",
    tab: "Itemized Bill of Sale (FL)",
    florida: true,
    eyebrow: "Florida \u00b7 Hull and Motors Priced Separately",
    title: "Itemized Bill of Sale \u2014 Hull & Outboard Motors (Florida)",
    useWhen: "Use for an outboard-powered boat in Florida when you want the hull, motors, and trailer priced separately.",
    keywords: "itemized itemised separate hull motors outboard sales tax allocation florida split price engines",
    desc: "For an outboard-powered boat in Florida. Prices the hull, each outboard, and any trailer separately, because Florida titles outboard motors apart from the vessel.",
    body: `
<p class="lead recital">{{sellerName}}, of {{sellerAddress}} (the \u201cSeller\u201d), sells and transfers to {{buyerName}}, of {{buyerAddress}} (the \u201cBuyer\u201d), the vessel, outboard motor(s), and trailer described below, each priced separately as set out in Section 2.</p>

<div class="note"><b>Use this version only if the boat is outboard-powered.</b> Florida titles an outboard motor separately from the hull, so hull and motors may be priced separately on the bill of sale. Inboard and sterndrive engines are part of the vessel itself and <b>cannot</b> be separated this way \u2014 for those boats use the standard Bill of Sale. Prices below must reflect genuine value. Confirm the treatment with your county tax collector; BoatClosers does not give tax advice.</div>

<h3>1. Property Being Sold</h3>
<p><b>Hull / Vessel</b></p>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Hull Identification Number (HIN)</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Length</span><span class="v">{{vesselLength}}</span></div>
<div class="field"><span class="k">FL Registration / Title No.</span><span class="v">{{regNo}} / {{titleNo}}</span></div>

<p><b>Outboard Motor #1</b></p>
<div class="field"><span class="k">Make / Model</span><span class="v">{{engineDesc}}</span></div>
<div class="field"><span class="k">Horsepower</span><span class="v">____________</span></div>
<div class="field"><span class="k">Serial number</span><span class="v">{{engineSerial}}</span></div>
<div class="field"><span class="k">Year</span><span class="v">____________</span></div>

<p><b>Outboard Motor #2</b> <span style="font-weight:400">(leave blank if single engine)</span></p>
<div class="field"><span class="k">Make / Model</span><span class="v">________________________________</span></div>
<div class="field"><span class="k">Horsepower</span><span class="v">____________</span></div>
<div class="field"><span class="k">Serial number</span><span class="v">________________________________</span></div>
<div class="field"><span class="k">Year</span><span class="v">____________</span></div>

<p><b>Trailer</b> <span style="font-weight:400">(leave blank if not included)</span></p>
<div class="field"><span class="k">Year / Make</span><span class="v">________________________________</span></div>
<div class="field"><span class="k">VIN</span><span class="v">{{trailerVin}}</span></div>

<h3>2. Allocation of Purchase Price</h3>
<p>The total purchase price of {{salePrice}} is allocated by the Parties as follows. Each figure represents the Parties\u2019 good-faith view of the fair value of that item.</p>
<div class="field"><span class="k">Hull / vessel</span><span class="v">$ ____________________</span></div>
<div class="field"><span class="k">Outboard motor #1</span><span class="v">$ ____________________</span></div>
<div class="field"><span class="k">Outboard motor #2</span><span class="v">$ ____________________</span></div>
<div class="field"><span class="k">Trailer</span><span class="v">$ ____________________</span></div>
<div class="field"><span class="k"><b>Total \u2014 must equal the purchase price</b></span><span class="v"><b>$ ____________________</b></span></div>

<h3>3. Title and Warranties</h3>
<p>Seller warrants lawful ownership of the vessel, motor(s), and trailer described above; that each is sold free of all liens except as disclosed in writing; and that Seller will defend the title against the lawful claims of all persons. Each item is otherwise sold \u201cAS-IS, WHERE-IS\u201d with no warranty of condition, express or implied.</p>

<h3>4. Acknowledgment</h3>
<p>The Parties acknowledge that the allocation in Section 2 reflects their genuine agreement as to value, that it was not made for the purpose of misstating tax due, and that each Party is responsible for their own tax reporting and any tax, title, and registration fees arising from this sale.</p>

<p class="recital">Executed this {{effectiveDate}}.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>

<div class="notary">
  <h3>Notary Acknowledgment</h3>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Sworn to and subscribed before me this ______ day of __________, 20____, by the persons named above, who produced __________________ as identification.</p>
  <p>Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>`
  },

  {
    id: "trailer_bos",
    signer: "both",
    completion: "esign",
    group: "Deal Structures",
    tab: "Trailer Bill of Sale",
    eyebrow: "Separate Title",
    title: "Trailer Bill of Sale",
    useWhen: "Use when a trailer goes with the boat. It transfers separately, with its own title.",
    keywords: "trailer bill of sale trailer title vin transfer trailer included",
    editRole: "seller",
    body: `
<p class="lead">A boat trailer is titled and registered separately from the vessel. This bill of sale transfers the trailer below from {{sellerName}} to {{buyerName}}.</p>

<h3>Trailer</h3>
<div class="field"><span class="k">Year / Make</span><span class="v">________________________</span></div>
<div class="field"><span class="k">VIN</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Sale value</span><span class="v">$______________</span></div>
<div class="field"><span class="k">Sold with vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>

<h3>Transfer</h3>
<p>For the value stated, the Seller sells and transfers the trailer to the Buyer, warrants good title free of undisclosed liens, and will deliver the trailer's title and any registration documents at closing. The trailer is sold in its present condition.</p>

<div class="note">Easy to forget: the trailer has its own title and registration in most states. Transferring the boat does not transfer the trailer \u2014 this handles it.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "gift_transfer",
    signer: "seller",
    completion: "esign",
    group: "Deal Structures",
    tab: "Gift / Family",
    eyebrow: "No / Nominal Money",
    title: "Gift & Family Transfer Affidavit",
    useWhen: "Use when the boat is a gift or family transfer rather than a sale for money.",
    keywords: "gift family transfer no money father son daughter inherited while alive donate",
    body: `
<p class="lead recital">This affidavit records that the vessel below is being transferred as a gift, or for nominal consideration, rather than an arm's-length sale \u2014 which affects how the transfer and any tax are treated.</p>

<h3>Vessel &amp; Parties</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">From (Donor)</span><span class="v">{{sellerName}}</span></div>
<div class="field"><span class="k">To (Recipient)</span><span class="v">{{buyerName}}</span></div>
<div class="field"><span class="k">Relationship</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Consideration</span><span class="v">Gift / $______ nominal</span></div>

<h3>Affirmation</h3>
<p>The Donor affirms they are the lawful owner of the vessel, that it is transferred to the Recipient as a gift (or for the nominal amount stated), that no other consideration has been exchanged, and that the vessel is free of undisclosed liens. The parties will report the transfer to the titling agency accordingly.</p>

<div class="note">For family or gift transfers. Many states tax gifts differently than sales, and the titling agency needs the transfer characterized honestly \u2014 this documents it. Confirm tax treatment with your state.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Donor<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Recipient<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the Donor named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "promissory_note",
    signer: "buyer",
    completion: "esign",
    group: "Deal Structures",
    tab: "Promissory Note \u26A0",
    eyebrow: "Seller Financing",
    title: "Promissory Note",
    useWhen: "Use when the seller is financing the buyer. The buyer's written promise to pay.",
    keywords: "promissory note seller financing owner financing payments over time installment loan",
    body: `
<div class="note"><b>Seller financing.</b> This creates a binding debt. Interest limits vary by state and there are caps on what you can charge, so it is worth having a lawyer look at it before you sign.</div>
<p class="lead">For value received, {{buyerName}} (the \u201cBorrower\u201d), of {{buyerAddress}}, promises to pay {{sellerName}} (the \u201cHolder\u201d), of {{sellerAddress}}, the principal sum below for the purchase of the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>Terms</h3>
<div class="field"><span class="k">Purchase price</span><span class="v">{{salePrice}}</span></div>
<div class="field"><span class="k">Down payment</span><span class="v">$______________</span></div>
<div class="field"><span class="k">Principal financed</span><span class="v">$______________</span></div>
<div class="field"><span class="k">Interest rate (per annum)</span><span class="v">______ %</span></div>
<div class="field"><span class="k">Term</span><span class="v">______ months</span></div>
<div class="field"><span class="k">Monthly payment</span><span class="v">$______________</span></div>
<div class="field"><span class="k">First payment due</span><span class="v">________________</span></div>

<h3>Promise to Pay</h3>
<ol>
  <li>The Borrower will pay the principal and interest in equal monthly installments, beginning on the first payment date and continuing on the same day each month until paid in full.</li>
  <li>The Borrower may prepay in whole or in part at any time without penalty.</li>
  <li>If a payment is more than ____ days late, the Holder may declare the entire unpaid balance due, and the Borrower agrees to pay reasonable costs of collection.</li>
  <li>This Note is secured by a Security Agreement of even date covering the vessel above.</li>
</ol>

<div class="note">The buyer's written promise to repay the seller over time. Paired with the Security Agreement, which lets the seller repossess if the buyer defaults. Interest rates may be capped by state usury law.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Borrower<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Accepted \u2014 <b>{{sellerName}}</b> (Holder)<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "security_agreement",
    signer: "buyer",
    completion: "esign",
    group: "Deal Structures",
    tab: "Security Agreement \u26A0",
    eyebrow: "Seller Financing",
    title: "Security Agreement",
    useWhen: "Use alongside seller financing so the seller can reclaim the boat if payments stop.",
    keywords: "security agreement collateral lien seller financing repossess secure the note",
    body: `
<div class="note"><b>Seller financing.</b> This puts a lien on the vessel so you can recover it if the buyer stops paying. The filing steps differ by state \u2014 a lien that is never properly recorded protects nobody, so it is worth having a lawyer set it up.</div>
<p class="lead">{{buyerName}} (the \u201cDebtor\u201d) grants {{sellerName}} (the \u201cSecured Party\u201d) a security interest in the vessel below to secure payment of the Promissory Note of even date.</p>

<h3>Collateral</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>
<div class="field"><span class="k">Secured amount</span><span class="v">$______________</span></div>

<h3>Terms</h3>
<ol>
  <li>The security interest secures the Note and all amounts owed under it.</li>
  <li>Until paid in full, the Debtor will keep the vessel insured, free of other liens, and will not sell or transfer it without the Secured Party's written consent.</li>
  <li>On default, the Secured Party may exercise all remedies of a secured party under the Uniform Commercial Code, including repossession and sale of the vessel.</li>
  <li>The Secured Party may file a UCC-1 financing statement and note its lien on the vessel's title to perfect this interest.</li>
</ol>

<div class="note"><b>Perfecting the lien:</b> a security agreement alone is not enough \u2014 to protect the seller's interest against other creditors, file a <b>UCC-1 financing statement</b> with the state (and record the lien on the vessel title). Without it, the seller's claim can be defeated by others. Confirm the exact steps with your state.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Debtor<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Secured Party<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "payoff",
    signer: "seller",
    completion: "esign",
    group: "Deal Structures",
    tab: "Payoff Authorization",
    eyebrow: "Existing Loan Payoff",
    title: "Lender Payoff Authorization",
    useWhen: "Use so the seller's lender may share the payoff figure with the buyer or closing agent.",
    keywords: "payoff demand authorization loan balance bank payoff quote still owe money",
    body: `
<div class="note"><b>How this works.</b> Lenders issue payoff figures on their own letter, through their own channel \u2014 the seller requests it by phone or through their online account. What most lenders will not do is discuss the loan with anyone but the borrower. This is the seller\u2019s written permission for them to share the figures with the buyer or closing agent, and to release the lien when they are paid.</div>
<div class="note">Ask for the payoff in writing, good through your closing date \u2014 a verbal figure changes with interest. Confirm the lender has released the lien before the final payment changes hands.</div>
<p class="lead">The Seller, {{sellerName}}, authorizes the lienholder below to provide a payoff figure and to release its lien on the vessel upon receipt of payment at closing, so clear title can pass to {{buyerName}}.</p>

<h3>Existing Loan</h3>
<div class="field"><span class="k">Lienholder</span><span class="v">{{lienholderName}}</span></div>
<div class="field"><span class="k">Loan / Account No.</span><span class="v">{{lienAcctNo}}</span></div>
<div class="field"><span class="k">Estimated payoff</span><span class="v">{{lienAmount}}</span></div>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}</span></div>

<h3>Authorization</h3>
<p>The Seller authorizes the lienholder to release the payoff amount and loan details to the parties and the closing agent, and directs that the payoff be remitted from closing funds. Upon payment, the lienholder is to release its lien and deliver a Lien Release so the title transfers free and clear.</p>

<div class="note">Used when the seller still owes money on the boat. Pairs with the Lien Release in your Title &amp; Government pack \u2014 this authorizes the payoff; that records the release. The buyer should confirm the lien is cleared before final payment.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller / Borrower<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Closing Agent (if any)<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  // ===== GROUP 7: ESTATE & INHERITANCE =====
  // A "Start Here" orienting guide + three estate affidavits (estate-law banner)
  // + a death-certificate upload slot. Framed as a guide that includes forms.
  {
    id: "estate_guide",
    signer: "none",
    completion: "info",
    group: "Estate & Inheritance",
    tab: "Start Here",
    eyebrow: "Inherited a Boat?",
    title: "Inherited a Boat? Start Here",
    useWhen: "Read first if the owner has passed away. Tells you which affidavit below is yours.",
    keywords: "inherited estate died passed away deceased dead owner death start here guide probate",
    body: `
<div class="estbanner"><b>\u2696 This is a guide, not legal advice.</b> Estate and probate law varies significantly by state. Use this to understand your options \u2014 but for anything beyond a simple, uncontested transfer, talk to a probate attorney in your state.</div>
<p class="lead">When a boat's owner has died, the vessel can still be sold or transferred \u2014 but who signs, and what paperwork the state needs, depends on the estate. Here is how to find your path.</p>

<h3>Which Situation Fits?</h3>
<ol>
  <li><b>No probate is being opened</b> (small or simple estate, clear heirs) \u2014 use the <b>Affidavit of Heirship</b> in this group. The lawful heir(s) attest to their right to the vessel; most agencies accept this with a certified death certificate.</li>
  <li><b>A probate estate is open</b> (a court appointed an executor/administrator) \u2014 use the <b>Executor / Administrator Authorization</b>. The personal representative signs for the estate, with the court's Letters attached.</li>
  <li><b>The estate is small</b> (under your state's dollar threshold) \u2014 your state may allow a <b>Small Estate Affidavit</b>, a faster path that skips full probate.</li>
</ol>

<h3>What Every Path Needs</h3>
<p>A <b>certified death certificate</b> (upload slot in this group), the vessel's title and registration, and the heir's or representative's identification. The vessel concerned: {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>When to Get an Attorney</h3>
<p>Talk to a probate attorney if the will is contested, heirs disagree, the estate is large or complex, there are debts against the estate, or you're unsure whether probate is required in {{vesselState}}. The cost of an hour of advice is small next to a transfer that has to be undone.</p>

<div class="note">BoatClosers provides these documents to help you move forward \u2014 it is not a law firm and does not give legal advice. The forms here cover common, uncontested transfers; your state's exact requirements govern.</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "heirship",
    signer: "dynamic",
    completion: "wet",
    group: "Estate & Inheritance",
    tab: "Affidavit of Heirship",
    eyebrow: "No Probate",
    title: "Affidavit of Heirship \u2014 Vessel",
    useWhen: "Use when there was no will and no probate, and the boat passes to family directly.",
    keywords: "heirship heir no will intestate family inherited died passed away next of kin",
    body: `
<div class="estbanner"><b>\u2696 Estate law varies by state.</b> Probate, heirship, and small-estate rules differ significantly between states. Have this reviewed against your state's process by a licensed attorney before use.</div>
<p class="lead recital">This affidavit is used where the owner of a vessel has died and no formal probate administration is being opened, to identify the lawful heir(s) entitled to transfer the vessel.</p>

<h3>Deceased Owner</h3>
<div class="field"><span class="k">Name</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Date of death</span><span class="v">________________</span></div>
<div class="field"><span class="k">Last address</span><span class="v">________________________</span></div>

<h3>Vessel</h3>
<div class="field"><span class="k">Year / Make / Model</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Title No. / Registration</span><span class="v">{{titleNo}} / {{regNo}}</span></div>

<h3>Heir(s)</h3>
<div class="field"><span class="k">Heir name</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Relationship to deceased</span><span class="v">________________</span></div>

<p style="margin-top:14px">The affiant swears that the deceased died owning the vessel above, that the person(s) named are the lawful heir(s) entitled to it under the laws of {{vesselState}}, that to the affiant's knowledge no probate is pending or required, and that the heir(s) have authority to transfer the vessel to {{buyerName}}. The affiant agrees to indemnify the titling agency against competing claims.</p>

<div class="note">Where no probate is opened, most titling agencies accept an affidavit of heirship signed by the heir(s) and notarized, together with a certified death certificate. Requirements vary by state and by estate value.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Affiant / Heir<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Disinterested Witness (if required)<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Sworn to and acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "executor_auth",
    signer: "dynamic",
    completion: "wet",
    group: "Estate & Inheritance",
    tab: "Executor Authorization",
    eyebrow: "Probate Opened",
    title: "Executor / Administrator Authorization to Sell",
    useWhen: "Use when a court appointed someone to handle the estate. Bring their letters too.",
    keywords: "executor administrator personal representative probate court letters estate died will",
    body: `
<div class="estbanner"><b>\u2696 Estate law varies by state.</b> Have this reviewed against your state's probate process by a licensed attorney before use, and attach the court's Letters.</div>
<p class="lead">Where a probate estate has been opened, the court-appointed personal representative has authority to transfer estate property. This document records that authority for the sale of the vessel below.</p>

<h3>Estate</h3>
<div class="field"><span class="k">Deceased</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Date of death</span><span class="v">________________</span></div>
<div class="field"><span class="k">Probate court / case no.</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Personal representative</span><span class="v">________________________</span></div>

<h3>Vessel &amp; Authority</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}</span></div>
<p style="margin-top:12px">The personal representative certifies they have been duly appointed by the court named above (Letters Testamentary / of Administration attached), that the appointment remains in effect, and that they are authorized to sell and transfer the vessel to {{buyerName}} on behalf of the estate, executing the bill of sale, title assignment, and all transfer documents.</p>

<div class="note">Used when probate is open. The personal representative signs for the estate; titling agencies require the court's Letters (attached) showing the appointment. Pairs with a certified death certificate.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Personal Representative<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Acknowledged \u2014 <b>{{buyerName}}</b> (Buyer)<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the personal representative of the estate named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "small_estate",
    signer: "dynamic",
    completion: "wet",
    group: "Estate & Inheritance",
    tab: "Small Estate Affidavit",
    eyebrow: "Simplified Transfer",
    title: "Small Estate Affidavit \u2014 Vessel",
    useWhen: "Use for a small estate that qualifies to skip full probate under your state's limit.",
    keywords: "small estate affidavit skip probate simplified summary administration died",
    body: `
<div class="estbanner"><b>\u2696 Estate law varies by state.</b> The dollar threshold, waiting period, and exact form are set by each state. Confirm your state's small-estate rules with a licensed attorney before relying on this.</div>
<p class="lead recital">Many states allow estates under a dollar threshold to transfer property by a small-estate affidavit, without full probate. This affidavit supports transfer of the vessel under that simplified process.</p>

<h3>Deceased &amp; Claimant</h3>
<div class="field"><span class="k">Deceased</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Date of death</span><span class="v">________________</span></div>
<div class="field"><span class="k">Claimant / Successor</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Relationship</span><span class="v">________________</span></div>

<h3>Vessel &amp; Affirmation</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}</span></div>
<p style="margin-top:12px">The claimant swears that the value of the entire estate qualifies under {{vesselState}}'s small-estate limit, that the statutory waiting period has passed, that no application for appointment of a personal representative is pending or granted, and that the claimant is entitled to the vessel and authorized to transfer it to {{buyerName}}.</p>

<div class="note">A faster path than full probate for modest estates \u2014 but the dollar threshold, waiting period, and exact form are set by each state. Confirm your state's small-estate rules before relying on this.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Claimant / Successor<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Witness (if required)<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Sworn to and acknowledged before me this ______ day of __________, 20____, by the claimant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "death_cert",
    signer: "none",
    completion: "info",
    group: "Estate & Inheritance",
    tab: "Death Certificate",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Certified Death Certificate",
    useWhen: "Use to attach the certified death certificate the state or Coast Guard will ask for.",
    keywords: "death certificate certified copy proof of death died passed away vital records",
    issued: "Issued by the state vital-records office",
    icon: "\uD83D\uDCD1",
    accept: "PDF, JPG, PNG",
    guide: "A <b>certified copy</b> of the owner's death certificate is required by every titling agency to transfer a deceased owner's vessel. BoatClosers can't generate it \u2014 it's issued by the state's vital-records office (often the county or state health department). Order a certified copy, then upload it here so it's attached to the deal alongside the affidavit or letters.",
    body: ""
  },

  // ===== GROUP 8: TITLE PROBLEMS =====
  // Affidavits across the three systems a boat lives in: state title, USCG
  // documentation, and state registration. Each body opens with a system badge.
  {
    id: "lost_title",
    signer: "seller",
    completion: "wet",
    group: "Title Problems",
    tab: "Lost Title",
    eyebrow: "State Title Missing",
    title: "Lost / Missing Title Affidavit",
    useWhen: "Use when the title exists but has been lost or destroyed and you need a duplicate.",
    keywords: "lost title missing title cant find title destroyed duplicate replacement",
    body: `
<div class="sysbadge sys-state">State-Titled</div>
<p class="lead recital">Used where a state-titled vessel's Certificate of Title has been lost, destroyed, or never received, to support a duplicate title or the bonded-title process so the vessel can transfer.</p>

<h3>Vessel &amp; Owner</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Title No. (if known)</span><span class="v">{{titleNo}}</span></div>
<div class="field"><span class="k">Registration</span><span class="v">{{regNo}}</span></div>
<div class="field"><span class="k">Owner of record</span><span class="v">{{sellerName}}</span></div>

<h3>Affirmation</h3>
<p>The affiant swears they are the lawful owner of the vessel above, that the Certificate of Title has been lost, destroyed, or never received, that it has not been sold, pledged, or assigned to any other person, and that this affidavit is made to obtain a duplicate title or bonded title so the vessel may be transferred to {{buyerName}} in {{vesselState}}.</p>

<div class="note">Most states issue a <b>duplicate title</b> to the owner of record, or require a <b>surety bond</b> (bonded title) when ownership can't be fully proven. Check which path {{vesselState}} uses \u2014 this affidavit supports both.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Owner / Affiant<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>&nbsp;</small></div>
</div>
<div class="notary"><div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Sworn to and acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p></div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "bos_only",
    signer: "seller",
    completion: "wet",
    group: "Title Problems",
    tab: "Bill-of-Sale Only",
    eyebrow: "No Title Exists",
    title: "Bill-of-Sale-Only Transfer Affidavit",
    useWhen: "Use when the seller never had a title \u2014 only a bill of sale \u2014 and you must build a record.",
    keywords: "no title never had title bill of sale only untitled no paperwork",
    body: `
<div class="sysbadge sys-state">State-Titled</div>
<p class="lead recital">Used for vessels with no title on record \u2014 older boats, or boats from states that did not title at the time \u2014 where ownership transfers by bill of sale and registration history.</p>

<h3>Vessel</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Registration (if any)</span><span class="v">{{regNo}}</span></div>

<h3>Affirmation</h3>
<p>The affiant swears that the vessel above has no Certificate of Title on record, that the affiant is its lawful owner by purchase or registration, that it is free of undisclosed liens, and that ownership is transferred to {{buyerName}} by bill of sale. The affiant will provide all available registration and purchase records to support titling in the buyer's name.</p>

<div class="note">Some states never titled certain vessels (often older or under a length threshold). The state then transfers on the strength of the bill of sale plus registration history \u2014 this affidavit documents that chain.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller / Affiant<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>
<div class="notary"><div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p></div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "chain_title",
    signer: "seller",
    completion: "wet",
    group: "Title Problems",
    tab: "Chain of Title",
    eyebrow: "Ownership Gap",
    title: "Chain-of-Title Affidavit",
    useWhen: "Use when there's a gap in ownership history \u2014 bought from someone who never titled it.",
    keywords: "chain of title gap in ownership history previous owner never titled missing link",
    body: `
<div class="sysbadge sys-state">State-Titled</div>
<p class="lead recital">Used where there is a gap in the ownership record \u2014 for example, the seller bought the vessel but never titled it in their name before reselling \u2014 to establish the chain so clean title can issue to the buyer.</p>

<h3>Vessel</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}</span></div>

<h3>Ownership Chain</h3>
<div class="field"><span class="k">Prior titled owner</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Current seller</span><span class="v">{{sellerName}}</span></div>
<div class="field"><span class="k">Acquired by seller on</span><span class="v">________________</span></div>
<div class="field"><span class="k">New buyer</span><span class="v">{{buyerName}}</span></div>

<h3>Affirmation</h3>
<p>The affiant swears that the ownership history stated above is true and complete to the best of their knowledge, that each transfer was a lawful sale or gift, that no other party holds an ownership claim, and that this affidavit is made to establish the chain of title so the vessel may be titled in the buyer's name. The affiant agrees to indemnify the titling agency against competing claims.</p>

<div class="note">The \u201cI bought it from a guy who never put it in his name\u201d problem. Attach every bill of sale you have; this affidavit bridges the documented gaps so the state can issue clean title.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Affiant<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Witness (if required)<br>Date: ____________</small></div>
</div>
<div class="notary"><div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Sworn to and acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p></div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "lost_cod",
    signer: "seller",
    completion: "wet",
    group: "Title Problems",
    tab: "Lost COD",
    eyebrow: "Documentation Missing",
    title: "Lost Certificate of Documentation Affidavit",
    useWhen: "Use when a Coast Guard Certificate of Documentation is lost or destroyed.",
    keywords: "lost certificate of documentation cod coast guard missing uscg replace",
    body: `
<div class="sysbadge sys-uscg">USCG Documented</div>
<p class="lead recital">For U.S. Coast Guard documented vessels whose Certificate of Documentation (COD) has been lost or destroyed, to support reissue or transfer through the National Vessel Documentation Center (NVDC).</p>

<h3>Documented Vessel</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Official Number</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Owner of record</span><span class="v">{{sellerName}}</span></div>

<h3>Affirmation</h3>
<p>The affiant swears they are the owner of record of the documented vessel above, that the Certificate of Documentation has been lost or destroyed, that it has not been surrendered or pledged, and that this affidavit is made to obtain a replacement COD or to support transfer of documentation to {{buyerName}} through the NVDC.</p>

<div class="note">Documentation is <b>federal</b> \u2014 this goes to the NVDC, not the state. A lost COD is reissued by the Coast Guard; this affidavit supports that request and keeps a documented-vessel sale moving.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Owner / Affiant<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>&nbsp;</small></div>
</div>
<div class="notary"><div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p></div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "mortgage_release",
    signer: "seller",
    completion: "wet",
    group: "Title Problems",
    tab: "Mortgage Release",
    eyebrow: "Clear the Abstract",
    title: "Satisfaction / Release of Preferred Ship's Mortgage",
    useWhen: "Use to clear a preferred ship's mortgage recorded against a documented vessel.",
    keywords: "preferred ship mortgage satisfaction release coast guard lien documented vessel",
    body: `
<div class="sysbadge sys-uscg">USCG Documented</div>
<p class="lead">For documented vessels, a preferred ship's mortgage recorded with the NVDC stays on the abstract of title until formally released. This satisfaction clears that recorded mortgage so clean documentation can pass.</p>

<h3>Recorded Mortgage</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">Official Number</span><span class="v">{{uscgOfficialNo}}</span></div>
<div class="field"><span class="k">Mortgagee (lender)</span><span class="v">________________________</span></div>
<div class="field"><span class="k">Original amount</span><span class="v">$______________</span></div>

<h3>Release</h3>
<p>The mortgagee certifies that the preferred ship's mortgage on the vessel above is paid in full and satisfied, and releases all right, title, and interest under it. The mortgagee authorizes the NVDC to record this satisfaction and remove the mortgage from the vessel's abstract of title.</p>

<div class="note">The documented-vessel cousin of a lien release \u2014 but it clears through the <b>Coast Guard (NVDC)</b>, not the state. An old, unsatisfied mortgage on the abstract will block a clean transfer until released. (See also the Lien Release in the Title &amp; Government pack.)</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Authorized Officer \u2014 Mortgagee<br>Title: ________ \u00b7 Date: ________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Received \u2014 <b>{{sellerName}}</b><br>Date: ____________</small></div>
</div>
<div class="notary"><div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the authorized officer of the mortgagee.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p></div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "lost_reg",
    signer: "seller",
    completion: "wet",
    group: "Title Problems",
    tab: "Lost Registration",
    eyebrow: "Registration Only",
    title: "Registration-Only / Lost Registration Affidavit",
    useWhen: "Use when the boat is registered but not titled, and the registration is lost or lapsed.",
    keywords: "registration only lost registration lapsed expired not titled decal numbers",
    body: `
<div class="sysbadge sys-reg">State-Registered</div>
<p class="lead recital">For vessels that were only registered (numbered) and never titled, where the registration is lost or expired and is blocking transfer to the buyer.</p>

<h3>Vessel</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Registration No. (if known)</span><span class="v">{{regNo}}</span></div>
<div class="field"><span class="k">Owner of record</span><span class="v">{{sellerName}}</span></div>

<h3>Affirmation</h3>
<p>The affiant swears they are the lawful owner of the vessel above, that it was registered (numbered) rather than titled, that the registration has been lost or has expired, and that this affidavit is made to obtain a duplicate registration and transfer the vessel to {{buyerName}}. The affiant affirms the vessel is free of undisclosed liens.</p>

<div class="note">Many smaller boats are registered, not titled. When that registration is lost or lapsed, the state issues a duplicate to the owner of record \u2014 this affidavit supports that, separate from the title process.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Owner / Affiant<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>
<div class="notary"><div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the affiant named above.</p>
  <p style="margin-top:10px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p></div>
<div class="footer-flag">BoatClosers</div>`
  },

  // ===== GROUP 9: CLOSING-DAY =====
  // Handoff-day documents. Delivery receipt and disclosure use interactive
  // checklists (checklist array + <!--CHECKLIST--> marker in body).
  {
    id: "delivery_receipt",
    signer: "both",
    completion: "esign",
    group: "Closing-Day",
    tab: "Delivery Receipt",
    eyebrow: "Possession Handoff",
    title: "Delivery & Possession Receipt",
    useWhen: "Use on handover day to record that the buyer took the boat, and in what condition.",
    keywords: "delivery receipt possession handover keys handed over took the boat pickup day",
    checklist: [
      { label:"Keys & access", desc:"All keys, fobs, and security codes" },
      { label:"Documents", desc:"Title/registration, manuals, service records" },
      { label:"Equipment & gear", desc:"Electronics, safety equipment, dinghy/tender, and personal property included in the sale" },
    ],
    body: `
<p class="lead">This receipt confirms that possession of the vessel below passed from {{sellerName}} (Seller) to {{buyerName}} (Buyer) on {{closingDate}}.</p>

<h3>Vessel &amp; Handoff</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}</span></div>
<div class="field"><span class="k">HIN</span><span class="v">{{hin}}</span></div>
<div class="field"><span class="k">Date of delivery</span><span class="v">{{closingDate}}</span></div>
<div class="field"><span class="k">Location</span><span class="v">{{closingLocation}}</span></div>

<h3>Items Delivered</h3>
<!--CHECKLIST-->
<p style="margin-top:14px">The Buyer acknowledges taking possession of the vessel and the items above in their present condition. From the time of delivery, risk of loss and responsibility for the vessel pass to the Buyer.</p>

<div class="note">The clean line between \u201cSeller's boat\u201d and \u201cBuyer's boat.\u201d After signing, risk of loss shifts to the buyer \u2014 which is exactly why the buyer should confirm insurance is active before taking possession.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller (delivered)<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer (received)<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "defect_disclosure",
    signer: "seller",
    completion: "esign",
    group: "Closing-Day",
    tab: "Defect Disclosure",
    eyebrow: "Seller's Disclosure",
    title: "Seller's Disclosure of Known Defects",
    useWhen: "Use when the seller wants known faults recorded separately and in writing.",
    keywords: "sellers disclosure known defects problems faults issues condition report honest",
    editRole: "seller",
    checklist: [
      { label:"Hull damage, blistering, or prior structural repair" },
      { label:"Engine, transmission, or drive issues" },
      { label:"Electrical, plumbing, or systems problems" },
      { label:"Prior accident, sinking, fire, or insurance claim" },
      { label:"Water intrusion / leaks" },
      { label:"Other (describe in the details line below)" },
    ],
    body: `
<p class="lead">{{sellerName}} (Seller) provides this disclosure of known material defects in the vessel below to {{buyerName}} (Buyer), to the best of the Seller's knowledge as of {{closingDate}}.</p>

<h3>Vessel</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}</span></div>

<h3>Known Conditions \u2014 tap all that apply</h3>
<!--CHECKLIST-->
<h3>Details</h3>
<p>________________________________________________________________<br>________________________________________________________________</p>

<p>The Seller affirms the above is accurate to the best of their knowledge. This disclosure does not replace the Buyer's own inspection or survey, and the vessel is otherwise sold as-is per the Purchase Agreement.</p>

<div class="note">Even in an as-is sale, a seller disclosing known defects sharply reduces the risk of a later \u201cyou hid this from me\u201d dispute. Honesty here protects the seller as much as the buyer.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer (acknowledged)<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  },

  {
    id: "engine_hours",
    signer: "seller",
    completion: "esign",
    group: "Closing-Day",
    tab: "Engine Hours",
    eyebrow: "Hours / Condition",
    title: "Engine Hours & Operating Statement",
    useWhen: "Use to record engine hours and running condition at the moment of sale.",
    keywords: "engine hours operating statement meter reading running condition motor hours",
    body: `
<p class="lead">{{sellerName}} states the engine hours and operating condition of the vessel below as of {{closingDate}}, for the Buyer's records and for insurance and resale purposes.</p>

<h3>Vessel &amp; Engines</h3>
<div class="field"><span class="k">Vessel</span><span class="v">{{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}</span></div>
<div class="field"><span class="k">Engine(s)</span><span class="v">{{engineDesc}}</span></div>
<div class="field"><span class="k">Port / single engine hours</span><span class="v">____________</span></div>
<div class="field"><span class="k">Starboard engine hours</span><span class="v">____________</span></div>
<div class="field"><span class="k">Generator hours (if any)</span><span class="v">____________</span></div>

<h3>Statement</h3>
<p>The Seller states the hour readings above are taken from the vessel's meters and are accurate to the best of the Seller's knowledge, that the meters have not, to the Seller's knowledge, been altered or replaced except as noted, and that the engines are in the operating condition described in any survey or the Purchase Agreement.</p>

<div class="note">Engine hours are the boat's odometer \u2014 they drive value and insurability. A signed hours statement protects the buyer against a rolled-back or mis-stated meter, and gives the seller a clean record.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer (acknowledged)<br>Date: ____________</small></div>
</div>
<div class="footer-flag">BoatClosers</div>`
  }
];


// ───────────────────────────────────────────────────────────────────────────
// 3. FILL HELPERS
//    The whole engine: assemble the buyer's contingencies, then fill any
//    document from a deal. One function serves all documents.
//
//    A `deal` object provides the merge values, e.g.:
//      {
//        buyerName: "John A. Smith",
//        salePrice: "$85,000.00",
//        selectedContingencies: ["survey", "seaTrial", "financing", "title"],
//        ...
//      }
// ───────────────────────────────────────────────────────────────────────────

// Replace every {{field}} in a string with deal[field] (blank if missing).
// SECURITY: every {{field}} here carries something a person typed — names,
// addresses, the boat's model, an engine serial. The result is rendered into the
// page as HTML, so an unescaped value is a script running in the OTHER party's
// browser, in their session, the moment they open the document. Escape it.
//
// The four app-built HTML blocks (deposit terms, contingency clauses, the document
// request status and the contingency list) are substituted in fillDocument BEFORE
// this runs, so their markup is untouched by this.
function escapeHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Values that came from the deal are wrapped so a customer can tell at a glance
// what the app filled in versus the standard wording — and spot a wrong name or
// hull number in prose, where a field row would otherwise carry it invisibly.
// Field rows already right-align and bold their values, so those are left alone.
const NO_EMPHASIS = new Set(["effectiveDate", "brokerFee", "docStatus"]);

function mergeFields(text, deal) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!deal || deal[key] == null) return "";
    const safe = escapeHtml(deal[key]);
    if (NO_EMPHASIS.has(key) || !String(safe).trim()) return safe;
    return '<span class="bc-val">' + safe + '</span>';
  });
}

// Comma-separated names of the contingencies the buyer selected.
export function contingencyList(deal) {
  const selected = (deal && deal.selectedContingencies) || [];
  return CONTINGENCIES
    .filter(c => selected.includes(c.key))
    .map(c => c.name)
    .join(", ");
}

// Build Section 3's clauses from the selected contingencies.
export function assembleContingencyClauses(deal) {
  const selected = (deal && deal.selectedContingencies) || [];
  const chosen = CONTINGENCIES.filter(c => selected.includes(c.key));
  const waived = CONTINGENCIES.filter(c => !selected.includes(c.key)).map(c => c.name);

  let html = "<ol>";
  chosen.forEach(c => { html += `<li>${c.clause}</li>`; });
  html += "</ol>";

  if (!chosen.length) {
    html = `<p class="recital">Buyer has selected no contingencies. This is a cash purchase with no survey, sea trial, financing, insurance, or title contingency, and Buyer has no contingency-based right to terminate under Section 4.</p>`;
  }
  if (waived.length) {
    html += `<p class="recital">Buyer has waived the following contingencies: ${waived.join(", ")}.</p>`;
  }
  html += `<p>If any selected contingency is not satisfied by its deadline, Buyer may, on or before that date, (a) accept the Vessel and remove the contingency, (b) request a price adjustment or repair by Seller, or (c) terminate this Agreement by written notice and receive a full refund of the earnest money deposit.</p>`;
  return html;
}

// MAIN: fill one document from a deal. Returns ready-to-render HTML.
// The deposit paragraph of the Purchase Agreement: where the money sits, who holds
// it, and what happens to it. Referenced as {{DEPOSIT_TERMS}} but never built, so
// every agreement was generated without its deposit clause.
// Who holds the earnest money, written to match what the Parties actually chose
// in Price & Terms. Five paths are possible and they are genuinely different:
// a regulated online escrow, an attorney, a licensed broker, a named third party,
// or the Seller holding it directly. A single "escrow agent identified below"
// block was wrong for most of them.
export function assembleDepositHolder(deal) {
  const d = deal || {};
  const path = d.escrowPath || "";
  const noDeposit = !d.depositAmount || /^\$?0(\.00)?$/.test(String(d.depositAmount).replace(/[,\s]/g, ""));

  // The Purchase Agreement is signed in the Deal Room, not through the fill-in
  // engine — there is no way to type into it. So this carries NO blanks. Where the
  // Parties have chosen a holder the clause names it; where they have not, the
  // wording binds them to designate one in writing and covers every arrangement
  // they might pick.
  const neutralDuty =
    `<p>Whoever holds the earnest money holds it in accordance with the terms of this Agreement and applicable law, and is not responsible for determining which Party is entitled to it in the event of a dispute. The Parties shall confirm the identity of the Deposit Holder and its payment instructions in writing before the deposit is paid, and neither Party shall rely on payment instructions received by any other means.</p>`;

  if (noDeposit) {
    return `<p>The Parties have agreed that <b>no earnest money deposit</b> is payable under this Agreement. References in this Agreement to the earnest money deposit have no effect unless the Parties later agree to a deposit in writing.</p>`;
  }

  if (path === "escrow_com") {
    return `<p>The earnest money deposit shall be delivered to and held by <b>Escrow.com</b>, a licensed online escrow service (the \u201cDeposit Holder\u201d), under that service\u2019s own escrow terms, and shall be applied toward the Purchase Price at Closing. Each Party shall complete the steps that service requires to fund and release the deposit.</p>` + neutralDuty;
  }
  if (path === "attorney") {
    return `<p>The earnest money deposit shall be delivered to and held in the trust account of the <b>attorney the Parties have designated in writing</b> (the \u201cDeposit Holder\u201d), and shall be applied toward the Purchase Price at Closing.</p>` + neutralDuty;
  }
  if (path === "brokerage") {
    return `<p>The earnest money deposit shall be delivered to and held in the escrow or trust account of the <b>licensed broker the Parties have designated in writing</b> (the \u201cDeposit Holder\u201d), and shall be applied toward the Purchase Price at Closing.</p>` + neutralDuty;
  }
  if (path === "direct") {
    return `<p>The Parties have agreed that <b>no third-party escrow will be used</b>. The earnest money deposit shall be paid directly to Seller, who shall hold it as the Deposit Holder, and it shall be applied toward the Purchase Price at Closing.</p>` +
      `<p>Buyer acknowledges that a deposit paid directly to Seller is not held by a neutral party, and that recovering it if the sale does not complete may require Buyer to pursue Seller directly. Seller shall return the deposit to Buyer where this Agreement requires it to be returned, and shall not treat a disputed deposit as Seller\u2019s own funds while the dispute is unresolved.</p>` + neutralDuty;
  }
  return `<p>The earnest money deposit shall be delivered to and held by the person or entity the Parties designate in writing (the \u201cDeposit Holder\u201d), and shall be applied toward the Purchase Price at Closing. The Deposit Holder may be a licensed online escrow service, an attorney\u2019s trust account, a licensed broker\u2019s escrow or trust account, a title or closing agent, or \u2014 only if the Parties expressly agree in writing \u2014 the Seller. Where the Deposit Holder is the Seller, Buyer acknowledges the deposit is not held by a neutral party.</p>` + neutralDuty;
}

// Section 13 has to match. Where the Seller holds the money there is no agent to
// keep holding it, so telling the Parties one will is simply untrue.
export function assembleDisputedDeposit(deal) {
  const path = (deal || {}).escrowPath || "";
  const third = path === "escrow_com" || path === "attorney" || path === "brokerage" || (!path);
  if (third) {
    return `<p>If Buyer and Seller dispute entitlement to the earnest money deposit, the holder of the deposit may continue to hold it until Buyer and Seller provide joint written instructions for its release, the Parties reach a written settlement concerning the deposit, or the holder receives other legally sufficient authority directing its release.</p>` +
      `<p>The holder shall not be required to determine which Party is legally entitled to the deposit. Nothing in this section prevents either Party from pursuing a lawful remedy concerning the deposit.</p>`;
  }
  return `<p>If Buyer and Seller dispute entitlement to the earnest money deposit, and the deposit is held by Seller rather than by a neutral third party, the Parties shall attempt in good faith to resolve the dispute under Section 18 before either Party pursues another remedy. Seller shall not treat a disputed deposit as Seller\u2019s own funds while the dispute is unresolved.</p>` +
    `<p>Nothing in this section prevents either Party from pursuing a lawful remedy concerning the deposit.</p>`;
}

export function assembleDepositTerms(deal) {
  const d = deal || {};
  const escrowed = d.escrowPath === "escrow" || !!d.escrowAgent;
  const holder = escrowed
    ? `the escrow agent identified in this Agreement`
    : `Seller`;

  const stalemate = escrowed
    ? `<p>If the escrow agent is unable or unwilling to release the earnest money without joint written instructions from the parties or other legally sufficient authority, the escrow agent may continue to hold the deposit until such instructions or authority are provided. Nothing in this section shall limit either party\u2019s rights or remedies arising from the other party\u2019s breach of this Agreement.</p>`
    : `<p>If the parties do not agree in writing as to the disposition of the earnest money, the party holding it may continue to hold the deposit until joint written instructions or other legally sufficient authority are provided. Nothing in this section shall limit either party\u2019s rights or remedies arising from the other party\u2019s breach of this Agreement.</p>`;

  return `<p>The earnest money deposit shall be delivered to and held by ${holder} and shall be applied toward the Purchase Price at Closing.</p>` +
    `<p>If Buyer terminates this Agreement pursuant to a contingency or other termination right expressly provided in Section 3, and such termination is made within the applicable time period, the earnest money deposit shall be returned to Buyer in full.</p>` +
    `<p>If Buyer fails or refuses to close after all applicable contingencies and termination rights have expired or been satisfied, and such failure is not caused by Seller\u2019s default or by another circumstance for which this Agreement provides Buyer a right to terminate, the parties agree that the earnest money deposit shall be released to Seller as liquidated damages. The parties acknowledge that the actual damages Seller would suffer from Buyer\u2019s failure to close may be difficult to determine and that the earnest money amount is intended as a reasonable estimate of such damages and not as a penalty.</p>` +
    `<p>If Seller fails or refuses to close when required under this Agreement, and such failure is not caused by Buyer\u2019s default, the earnest money deposit shall be returned to Buyer in full.</p>` +
    stalemate;
}

export function fillDocument(doc, deal) {
  let body = doc.body || "";
  // Citizenship is only stated where it means something — a documented vessel may
  // only be owned by a US citizen. On a state-titled boat the phrase is dropped
  // rather than left as a blank line nobody was asked to fill.
  const _doc = String((deal && (deal.uscgOfficialNo || deal.uscgNumber)) || "").trim();
  const _isDoc = !!_doc && !/^n\/?a$/i.test(_doc);
  body = body.replace("{{SELLER_CITIZEN_PHRASE}}",
    _isDoc && deal?.sellerCitizen ? `, a citizen of ${deal.sellerCitizen}` : "");
  body = body.replace("{{BUYER_CITIZEN_PHRASE}}",
    _isDoc && deal?.buyerCitizen ? `, a citizen of ${deal.buyerCitizen}` : "");
  body = body.replace("{{DEPOSIT_HOLDER}}", assembleDepositHolder(deal));
  body = body.replace(/\{\{DISPUTED_DEPOSIT\}\}/g, assembleDisputedDeposit(deal));
  body = body.replace("{{DEPOSIT_TERMS}}", assembleDepositTerms(deal));
  body = body.replace("{{CONTINGENCY_CLAUSES}}", assembleContingencyClauses(deal));
  body = body.replace("{{DOC_REQUEST_STATUS}}", buildDocRequestStatus(deal));
  body = body.replace(/\{\{contList\}\}/g, contingencyList(deal));
  body = mergeFields(body, deal);
  return body;
}

// Live "what lenders/insurers request" vs. "what you already have" list.
// Reads deal.docStatus (a map of docId -> truthy when signed/uploaded).
export function buildDocRequestStatus(deal) {
  const st = (deal && deal.docStatus) || {};
  const items = [
    { label:"Signed Purchase & Sale Agreement",            id:"purchase_agreement", kind:"gen" },
    { label:"Bill of Sale",                                id:"bill_of_sale",       kind:"gen" },
    { label:"Earnest Money Deposit Receipt",               id:"deposit_receipt",    kind:"gen" },
    { label:"Closing / Settlement Statement",              id:"closing_statement",  kind:"gen" },
    { label:"Title application / proof of clear title",    id:"title_app",          kind:"gen" },
    { label:"Marine survey report",                        id:"survey_report",      kind:"up", from:"your surveyor" },
    { label:"Proof of insurance (binder; loss-payee if financed)", id:"binder",      kind:"up", from:"your insurer" },
    { label:"Lender commitment letter",                    id:"commitment",         kind:"up", from:"your lender" },
  ];
  let html = '<div class="reqlist">';
  items.forEach(it => {
    const done = !!st[it.id];
    let mark, cls, status;
    if (it.kind === "gen") {
      if (done) { mark = "\u2713"; cls = "done";  status = "Saved in your BoatClosers file"; }
      else      { mark = "\u25D0"; cls = "ready"; status = "Ready in your deal \u2014 sign to finalize"; }
    } else {
      if (done) { mark = "\u2713"; cls = "done";  status = "Uploaded to your deal"; }
      else      { mark = "\u25CB"; cls = "todo";  status = "Get from " + it.from + " and upload here"; }
    }
    html += `<div class="req ${cls}"><span class="rmark">${mark}</span><span class="rlabel">${it.label}</span><span class="rstatus">${status}</span></div>`;
  });
  html += '</div>';
  const have = items.filter(it => st[it.id]).length;
  html += `<p class="reqtally"><b>${have} of ${items.length}</b> already in your BoatClosers file or uploaded \u2014 the rest you obtain and attach here.</p>`;
  return html;
}

// Convenience: the deal fields these documents expect (for reference/validation).
export const DOCUMENT_FIELDS = [
  "dealRef", "effectiveDate",
  "sellerName", "sellerAddress", "sellerCitizen",
  "buyerName", "buyerAddress", "buyerCitizen",
  "vesselYear", "vesselMake", "vesselModel", "vesselLength", "hullMaterial",
  "hin", "uscgOfficialNo", "titleNo", "regNo", "vesselState", "engineDesc",
  "salePrice", "salePriceWords", "depositAmount", "depositPct", "balanceDue",
  "reducedPrice", "reduction",
  "closingDate", "closingLocation",
  "surveyDeadline", "seaTrialDeadline", "financingDeadline",
  "brokerFee"
];
