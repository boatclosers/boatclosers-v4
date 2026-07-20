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
<p>Seller warrants lawful ownership of the Vessel, that it is free of all liens and encumbrances \u2014 including, without limitation, maritime liens for crew wages, salvage, necessaries (repairs, dockage, fuel, or supplies), and any preferred ship mortgage recorded with the U.S. Coast Guard \u2014 except those disclosed in writing and released at or before Closing, and that Seller has full authority to sell and transfer it. Seller shall indemnify and hold Buyer harmless from any lien, claim, or encumbrance arising from events occurring before Closing, and this warranty survives Closing.</p>

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
  <div class="nt">Notary Acknowledgment — Seller (the Seller signs this before a notary)</div>
  <p>State of __________________ \u00b7 County of __________________</p>
  <p>The foregoing instrument was acknowledged before me by means of \u2610 physical presence or \u2610 online notarization, this ______ day of __________, 20____, by {{sellerName}}, who is personally known to me or who produced ____________________ as identification.</p>
  <p style="margin-top:14px">Notary Public: ____________________________ &nbsp; My commission expires: __________</p>
  <p class="recital" style="font-size:11.5px">Notarization is included for jurisdictions and lenders that require it; complete it where applicable.</p>
</div>`
  },

  {
    id: "bos_plain",
    group: "Closing Instruments",
    tab: "Bill of Sale (Quick)",
    eyebrow: "Transfer of Ownership",
    title: "Vessel Bill of Sale",
    desc: "Quick-sale version \u2014 fill the price in the app or write it in by hand. No notary block.",
    viewOnly: true,
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
    id: "title_search_letter",
    group: "Title & Lien Check",
    tab: "Title Search Letter",
    eyebrow: "Recommended \u2014 Verify Clear Title",
    title: "Title & Lien Search Request Letter",
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
    group: "Due-Diligence Outcomes",
    tab: "Termination",
    eyebrow: "Contingency Not Met",
    title: "Notice of Termination & Deposit Refund",
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
  },

  // ===== GROUP 4: FINANCING & INSURANCE =====
  // One generated checklist + three upload slots (kind:"upload") for paperwork
  // the lender, insurer, and surveyor issue.
  {
    id: "fin_conditions",
    group: "Financing & Insurance",
    tab: "Conditions Checklist",
    eyebrow: "Your Guide",
    title: "Financing & Insurance Conditions Checklist",
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
    group: "Financing & Insurance",
    tab: "Commitment Letter",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Lender Commitment Letter",
    issued: "Issued by the buyer's lender",
    icon: "\uD83C\uDFE6",
    accept: "PDF, JPG, PNG",
    showIf: (deal) => deal && deal.paymentType === "finance",
    guide: "Your <b>marine lender</b> issues this letter once your loan is approved \u2014 it confirms they will fund the purchase. BoatClosers can't generate it (only your bank can), so when you receive it, upload it here to attach it to your deal file. Lenders usually issue it after they've received your signed purchase agreement, the survey, and proof of insurance.",
    body: ""
  },

  {
    id: "binder",
    group: "Financing & Insurance",
    tab: "Insurance Binder",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Insurance Binder / Proof of Coverage",
    issued: "Issued by the buyer's insurer",
    icon: "\uD83D\uDEE1\uFE0F",
    accept: "PDF, JPG, PNG",
    guide: "Your <b>marine insurer</b> issues this binder confirming coverage is in force, effective on or before closing. If you're financing, make sure it names your lender as <b>loss payee</b>. BoatClosers doesn't create it \u2014 your insurance company does \u2014 so upload it here when you have it. Send a copy to your lender too; most won't fund without it.",
    body: ""
  },

  {
    id: "survey_report",
    group: "Financing & Insurance",
    tab: "Survey Report",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Marine Survey Report",
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
    group: "Authority & Signing",
    tab: "Power of Attorney",
    eyebrow: "Authority to Sign",
    title: "Limited Power of Attorney \u2014 Vessel Transfer",
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
    group: "Authority & Signing",
    tab: "Entity Authorization",
    eyebrow: "Business / Trust Owner",
    title: "Authorization & Resolution to Sell Vessel",
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
    group: "Authority & Signing",
    tab: "Co-Owner Consent",
    eyebrow: "Joint Ownership",
    title: "Co-Owner Consent to Sale",
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
    group: "Authority & Signing",
    tab: "Name Affidavit",
    eyebrow: "Name Discrepancy",
    title: "Affidavit of One and the Same Person",
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
    id: "trade_in",
    group: "Deal Structures",
    tab: "Trade-In Addendum",
    eyebrow: "Partial Payment",
    title: "Trade-In Addendum",
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
    id: "trailer_bos",
    group: "Deal Structures",
    tab: "Trailer Bill of Sale",
    eyebrow: "Separate Title",
    title: "Trailer Bill of Sale",
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
    group: "Deal Structures",
    tab: "Gift / Family",
    eyebrow: "No / Nominal Money",
    title: "Gift & Family Transfer Affidavit",
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
    group: "Deal Structures",
    tab: "Promissory Note \u26A0",
    eyebrow: "Seller Financing",
    title: "Promissory Note",
    body: `
<div class="lawbanner"><b>\u26A0 Attorney review required.</b> This instrument creates a legally binding debt. Have it reviewed by a licensed attorney, and confirm interest limits (state usury caps) before use on a real deal.</div>
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
    group: "Deal Structures",
    tab: "Security Agreement \u26A0",
    eyebrow: "Seller Financing",
    title: "Security Agreement",
    body: `
<div class="lawbanner"><b>\u26A0 Attorney review required.</b> This instrument creates a lien on the vessel. Have it reviewed by a licensed attorney, and confirm the UCC-1 filing and title-lien steps for your state, before use on a real deal.</div>
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
    group: "Deal Structures",
    tab: "Payoff Authorization \u26A0",
    eyebrow: "Existing Loan Payoff",
    title: "Payoff Demand & Authorization",
    body: `
<div class="lawbanner"><b>\u26A0 Attorney review recommended.</b> This authorizes release of loan and payoff information and directs payment from closing funds. Confirm the lien is released before final payment.</div>
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
    group: "Estate & Inheritance",
    tab: "Start Here",
    eyebrow: "Inherited a Boat?",
    title: "Inherited a Boat? Start Here",
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
    group: "Estate & Inheritance",
    tab: "Affidavit of Heirship",
    eyebrow: "No Probate",
    title: "Affidavit of Heirship \u2014 Vessel",
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
    group: "Estate & Inheritance",
    tab: "Executor Authorization",
    eyebrow: "Probate Opened",
    title: "Executor / Administrator Authorization to Sell",
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
    group: "Estate & Inheritance",
    tab: "Small Estate Affidavit",
    eyebrow: "Simplified Transfer",
    title: "Small Estate Affidavit \u2014 Vessel",
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
    group: "Estate & Inheritance",
    tab: "Death Certificate",
    kind: "upload",
    eyebrow: "Upload Slot",
    title: "Certified Death Certificate",
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
    group: "Title Problems",
    tab: "Lost Title",
    eyebrow: "State Title Missing",
    title: "Lost / Missing Title Affidavit",
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
    group: "Title Problems",
    tab: "Bill-of-Sale Only",
    eyebrow: "No Title Exists",
    title: "Bill-of-Sale-Only Transfer Affidavit",
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
    group: "Title Problems",
    tab: "Chain of Title",
    eyebrow: "Ownership Gap",
    title: "Chain-of-Title Affidavit",
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
    group: "Title Problems",
    tab: "Lost COD",
    eyebrow: "Documentation Missing",
    title: "Lost Certificate of Documentation Affidavit",
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
    group: "Title Problems",
    tab: "Mortgage Release",
    eyebrow: "Clear the Abstract",
    title: "Satisfaction / Release of Preferred Ship's Mortgage",
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
    group: "Title Problems",
    tab: "Lost Registration",
    eyebrow: "Registration Only",
    title: "Registration-Only / Lost Registration Affidavit",
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
    group: "Closing-Day",
    tab: "Delivery Receipt",
    eyebrow: "Possession Handoff",
    title: "Delivery & Possession Receipt",
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
    group: "Closing-Day",
    tab: "Defect Disclosure",
    eyebrow: "Seller's Disclosure",
    title: "Seller's Disclosure of Known Defects",
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
    group: "Closing-Day",
    tab: "Engine Hours",
    eyebrow: "Hours / Condition",
    title: "Engine Hours & Operating Statement",
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
  let body = doc.body || "";
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
