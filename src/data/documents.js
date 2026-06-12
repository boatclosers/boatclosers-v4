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
//   2. DOCUMENTS      — the 8 documents, grouped, with {{fields}} in the text.
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
    group: "Closing Instruments",
    tab: "Purchase Agreement",
    eyebrow: "Master Contract",
    title: "Vessel Purchase & Sale Agreement",
    body: `
<p class="lead recital">This Vessel Purchase &amp; Sale Agreement (the \u201cAgreement\u201d) is made on {{effectiveDate}}, by and between {{sellerName}}, of {{sellerAddress}}, a citizen of {{sellerCitizen}} (the \u201cSeller\u201d), and {{buyerName}}, of {{buyerAddress}}, a citizen of {{buyerCitizen}} (the \u201cBuyer\u201d). The Parties may reside in different states or countries; their places of residence do not change the governing law set out in this Agreement.</p>

<h3>1. The Vessel</h3>
<p>Seller agrees to sell and Buyer agrees to purchase the following vessel together with its engines, equipment, and the gear and accessories listed in the Inventory Schedule attached to this Agreement (collectively, the \u201cVessel\u201d): a {{vesselYear}} {{vesselMake}} {{vesselModel}}, {{vesselLength}} in length, {{hullMaterial}} hull, Hull Identification Number {{hin}}, U.S. Coast Guard Official Number {{uscgOfficialNo}}, Title No. {{titleNo}}, Registration {{regNo}}, powered by {{engineDesc}}. Items not listed on the Inventory Schedule, and any personal effects of Seller, are excluded from the sale.</p>

<h3>2. Purchase Price</h3>
<p>The total purchase price is {{salePrice}} ({{salePriceWords}} U.S. Dollars), payable as: an earnest money deposit of {{depositAmount}} ({{depositPct}}) upon execution, and the balance of {{balanceDue}} in good funds at Closing.</p>

<h3>3. Contingencies</h3>
{{CONTINGENCY_CLAUSES}}
<p class="recital">It is the Buyer\u2019s responsibility to obtain any assurances the Buyer requires regarding the availability of satisfactory financing and insurance before accepting the Vessel, except to the extent a financing or insurance contingency has been selected above.</p>

<h3>4. Closing</h3>
<p>Closing shall occur on or before {{closingDate}} at {{closingLocation}}. At Closing, Seller shall deliver an executed Bill of Sale, the original Certificate of Title properly endorsed, the Vessel\u2019s registration and any U.S. Coast Guard documentation transfer materials, and keys and possession. Buyer shall deliver the balance of the Purchase Price in good funds.</p>

<h3>5. Condition, Risk of Loss &amp; Damage Before Closing</h3>
<p>Except as expressly stated in writing, the Vessel is sold \u201cAS-IS, WHERE-IS,\u201d as described in the As-Is Acknowledgment executed with this Agreement. Risk of loss remains with Seller until possession and title pass to Buyer at Closing. If the Vessel sustains damage after Buyer\u2019s acceptance but before Closing, Seller shall repair the damage at Seller\u2019s expense prior to Closing, subject to Buyer\u2019s approval of the repair. If the damage is substantial and cannot be repaired to Buyer\u2019s reasonable satisfaction before Closing, Buyer may either accept an appropriate adjustment to the Purchase Price or terminate this Agreement and receive a full refund of the earnest money deposit.</p>

<h3>6. Seller\u2019s Warranties of Title</h3>
<p>Seller warrants lawful ownership of the Vessel, that it is free of all liens and encumbrances except those released at or before Closing, and that Seller has full authority to sell and transfer it.</p>

<h3>7. Default &amp; Remedies</h3>
<p>If Buyer defaults without a permitted contingency, Seller may retain the deposit as liquidated damages. If Seller defaults, Buyer shall receive a full refund of the deposit and any remedy available at law or equity.</p>

<h3>8. Time Is of the Essence</h3>
<p>Time is of the essence in this Agreement. Each Party shall meet the deadlines stated for contingencies, acceptance, and Closing. Any deadline may be extended only by written agreement of both Parties.</p>

<h3>9. Dispute Resolution</h3>
<p>The Parties shall first attempt in good faith to resolve any dispute arising out of this Agreement through direct negotiation, and then through mediation. Any dispute not resolved by mediation shall be settled by binding arbitration administered under the rules of the American Arbitration Association, with the arbitration seated in the State of {{vesselState}} (where the Vessel is located) regardless of where the Parties reside. Judgment on the award may be entered in any court of competent jurisdiction. Each Party bears its own costs unless the arbitrator directs otherwise.</p>

<h3>10. Governing Law</h3>
<p>This Agreement is governed by the laws of the State of {{vesselState}}, where the Vessel is located, and by applicable United States maritime law, without regard to the state or country in which either Party resides. Where a Party is located outside the United States, that Party remains bound by this choice of law and is responsible for complying with the export, import, tax, and registration requirements of their own jurisdiction. This Agreement constitutes the entire agreement between the Parties and supersedes all prior understandings.</p>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "bos",
    group: "Closing Instruments",
    tab: "Bill of Sale",
    eyebrow: "Transfer of Ownership",
    title: "Vessel Bill of Sale",
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
  <div class="nt">Notary Acknowledgment</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>The foregoing instrument was acknowledged before me by means of \u2610 physical presence or \u2610 online notarization, this ______ day of __________, 20____, by {{sellerName}}, who is personally known to me or who produced ____________________ as identification.</p>
  <p style="margin-top:14px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
  <p class="recital" style="font-size:11.5px">Notarization is included for jurisdictions and lenders that require it; complete it where applicable.</p>
</div>`
  },

  {
    id: "dep",
    group: "Closing Instruments",
    tab: "Deposit Receipt",
    eyebrow: "Earnest Money",
    title: "Earnest Money Deposit Receipt",
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
    group: "Closing Instruments",
    tab: "As-Is & Disclosure",
    eyebrow: "Condition & Defects",
    title: "As-Is Acknowledgment & Disclosure of Known Defects",
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
    id: "stmt",
    group: "Closing Instruments",
    tab: "Settlement Statement",
    eyebrow: "Final Tally",
    title: "Closing & Settlement Statement",
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
  <tr><td>Less: Outstanding Lien Payoff (if any)</td><td class="r">\u2013 $0.00</td></tr>
  <tr class="tot"><td>Net Proceeds to Seller</td><td class="r">{{salePrice}}</td></tr>
  <tr><td class="sec" colspan="2">Platform</td></tr>
  <tr><td>BoatClosers Flat Fee (paid at signup)</td><td class="r">{{brokerFee}}</td></tr>
</table>

<div class="note">Title transfer and registration fees payable to the state are the responsibility of the Buyer and are paid directly to the state agency; they are not collected by BoatClosers.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{sellerName}}</b> \u2014 Seller<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
</div>`
  },

  // ===== GROUP 2: DUE-DILIGENCE OUTCOMES =====
  {
    id: "accept",
    group: "Due-Diligence Outcomes",
    tab: "Acceptance",
    eyebrow: "Contingencies Satisfied",
    title: "Contingency Removal & Vessel Acceptance",
    body: `
<p class="lead recital">Reference: Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d) for the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>Buyer\u2019s Acceptance</h3>
<p>Buyer confirms that the following contingencies selected in the Agreement have been satisfied or are hereby removed: {{contList}}.</p>
<p>Having completed due diligence, Buyer accepts the Vessel in its present condition and confirms the Buyer\u2019s intent to proceed to Closing on or before {{closingDate}}. The earnest money deposit of {{depositAmount}} now becomes non-refundable except in the event of Seller default.</p>

<div class="note">In keeping with BoatClosers\u2019 buyer-led acceptance model, only the Buyer executes this acceptance; it removes the Buyer\u2019s remaining exit rights and locks the deal toward Closing.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small><b>{{buyerName}}</b> \u2014 Buyer<br>Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Acknowledged \u2014 <b>{{sellerName}}</b> (Seller)<br>Date: ____________</small></div>
</div>`
  },

  {
    id: "amend",
    group: "Due-Diligence Outcomes",
    tab: "Renegotiation",
    eyebrow: "Post-Survey Adjustment",
    title: "Amendment & Renegotiation of Terms",
    body: `
<p class="lead recital">This Amendment modifies the Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d) for the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}. All other terms of the Agreement remain in full force.</p>

<h3>1. Reason for Amendment</h3>
<p>Following the marine survey and/or sea trial, the Parties agree to adjust the terms as set forth below to account for the findings described here:</p>
<ol><li>____________________________________________________________</li></ol>

<h3>2. Revised Terms</h3>
<table class="stmt">
  <tr class="head"><td>Term</td><td class="r">Original \u2192 Revised</td></tr>
  <tr><td>Purchase Price</td><td class="r">{{salePrice}} \u2192 {{reducedPrice}}</td></tr>
  <tr><td>Price Reduction</td><td class="r">{{reduction}}</td></tr>
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
    id: "term",
    group: "Due-Diligence Outcomes",
    tab: "Termination",
    eyebrow: "Contingency Not Met",
    title: "Notice of Termination & Deposit Refund",
    body: `
<p class="lead recital">Reference: Purchase &amp; Sale Agreement dated {{effectiveDate}} between {{sellerName}} (\u201cSeller\u201d) and {{buyerName}} (\u201cBuyer\u201d) for the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>1. Notice of Termination</h3>
<p>Buyer hereby gives written notice of termination of the Agreement pursuant to a contingency permitted therein. Buyer selected the following contingencies: {{contList}}. Termination is based on the contingency checked below not being satisfied:</p>
<ol>
  <li>\u2610 Marine survey disclosed material defects unacceptable to Buyer</li>
  <li>\u2610 Sea trial was unsatisfactory</li>
  <li>\u2610 Marine financing was denied or not obtained by the deadline</li>
  <li>\u2610 Insurance binder could not be obtained</li>
  <li>\u2610 Seller could not deliver clear title</li>
</ol>

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
    group: "Title & Government",
    tab: "Title Application",
    eyebrow: "New Owner Registration",
    title: "Application for Certificate of Title",
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
    group: "Title & Government",
    tab: "Notice of Sale",
    eyebrow: "Seller Liability Release",
    title: "Notice of Sale & Transfer of Ownership",
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
    group: "Title & Government",
    tab: "Lien Release",
    eyebrow: "Conditional \u2014 If Financed",
    title: "Lien Release & Satisfaction",
    showIf: (deal) => !!(deal && deal.hasLien),
    body: `
<p class="lead recital">This Lien Release applies only where the vessel was subject to a recorded lien or loan. {{lienholderName}} (the \u201cLienholder\u201d) confirms the following regarding the {{vesselYear}} {{vesselMake}} {{vesselModel}}, HIN {{hin}}.</p>

<h3>Lien Details</h3>
<div class="field"><span class="k">Lienholder</span><span class="v">{{lienholderName}}</span></div>
<div class="field"><span class="k">Loan / Account No.</span><span class="v">{{lienAcctNo}}</span></div>
<div class="field"><span class="k">Payoff Amount</span><span class="v">{{lienAmount}}</span></div>
<div class="field"><span class="k">Vessel Owner of Record</span><span class="v">{{sellerName}}</span></div>

<h3>Release</h3>
<p>The Lienholder certifies that the obligation secured by the above lien has been paid in full and that the Lienholder hereby releases and discharges all right, title, claim, and interest in the vessel. The Lienholder authorizes the titling agency to remove this lien from the vessel's record so that clear title may pass to the Buyer.</p>

<div class="note">This document appears only when the deal indicates the vessel had a loan. A clear, recorded lien release is what lets a clean title transfer to the buyer.</div>

<div class="sig">
  <div class="sigbox"><div class="ln"></div><small>Authorized Officer \u2014 <b>{{lienholderName}}</b><br>Title: ____________ \u00b7 Date: ____________</small></div>
  <div class="sigbox"><div class="ln"></div><small>Received \u2014 <b>{{sellerName}}</b> (Owner of Record)<br>Date: ____________</small></div>
</div>

<div class="notary">
  <div class="nt">Notary Acknowledgment (if required)</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>Acknowledged before me this ______ day of __________, 20____, by the authorized officer of {{lienholderName}}, who is personally known to me or produced ____________________ as identification.</p>
  <p style="margin-top:12px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
</div>`
  },

  {
    id: "uscg_transfer",
    group: "Title & Government",
    tab: "USCG Transfer",
    eyebrow: "Federal \u2014 Documented Vessels",
    title: "USCG Bill of Sale & Transfer / Deletion",
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
    group: "Title & Government",
    tab: "HIN Verification",
    eyebrow: "Hull Identity",
    title: "HIN Verification Affidavit",
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
function mergeFields(text, deal) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    deal && deal[key] != null ? deal[key] : ""
  );
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

  if (waived.length) {
    html += `<p class="recital">Buyer has waived the following contingencies: ${waived.join(", ")}.</p>`;
  }
  html += `<p>If any selected contingency is not satisfied by its deadline, Buyer may, on or before that date, (a) accept the Vessel and remove the contingency, (b) request a price adjustment or repair by Seller, or (c) terminate this Agreement by written notice and receive a full refund of the earnest money deposit.</p>`;
  return html;
}

// MAIN: fill one document from a deal. Returns ready-to-render HTML.
export function fillDocument(doc, deal) {
  let body = doc.body;
  body = body.replace("{{CONTINGENCY_CLAUSES}}", assembleContingencyClauses(deal));
  body = body.replace(/\{\{contList\}\}/g, contingencyList(deal));
  body = mergeFields(body, deal);
  return body;
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
