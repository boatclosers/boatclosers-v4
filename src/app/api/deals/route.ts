import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailLayout } from '@/lib/sendEmail'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function getUserId(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try {
    const { data, error } = await admin().auth.getUser(token)
    if (error || !data?.user) return null
    return data.user.id
  } catch {
    return null
  }
}

function fmtMoney(n: number) {
  if (typeof n !== 'number') return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// Build a clean PDF of the signed Purchase Agreement from the deal record so it
// can ride along as an attachment on the confirmation emails. Pure-JS (pdf-lib),
// no native binaries — safe to run inside the serverless email path. Returns a
// base64 string, or null if there's nothing signed yet to render.
async function buildPaPdfBase64(updated: any): Promise<string | null> {
  try {
    const offers = updated?.negotiate?.offers || []
    const o = offers.find((x: any) => x?.status === 'accepted') || offers.find((x: any) => x?.status === 'agreed')
    if (!o) return null
    const v = updated?.vessel || {}
    const p = updated?.parties || {}
    const buyer = p?.buyer || {}
    const seller = p?.seller || {}
    const vesselName = v?.name || v?.makeModel || [v?.year, v?.make, v?.model].filter(Boolean).join(' ') || 'Vessel'
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const pdf = await PDFDocument.create()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const navy = rgb(0.031, 0.082, 0.18)
    const brass = rgb(0.722, 0.525, 0.227)
    const body = rgb(0.13, 0.16, 0.22)
    const W = 612, H = 792, M = 56, MAXW = W - M * 2
    let page = pdf.addPage([W, H])
    let y = H - M

    const ensure = (need = 60) => { if (y < M + need) { page = pdf.addPage([W, H]); y = H - M } }
    const text = (s: string, opts: { size?: number; f?: any; color?: any; gap?: number; indent?: number } = {}) => {
      const size = opts.size ?? 10.5, f = opts.f ?? font, color = opts.color ?? body, gap = opts.gap ?? 5, indent = opts.indent ?? 0
      const words = String(s ?? '').split(/\s+/)
      let cur = ''
      const flush = () => { ensure(size + gap + 8); page.drawText(cur, { x: M + indent, y, size, font: f, color }); y -= size + gap; cur = '' }
      for (const w of words) {
        const t = cur ? cur + ' ' + w : w
        if (f.widthOfTextAtSize(t, size) > MAXW - indent) { flush(); cur = w } else cur = t
      }
      if (cur) flush()
    }
    const gapY = (n: number) => { y -= n }
    const rule = () => { ensure(14); page.drawRectangle({ x: M, y, width: MAXW, height: 0.8, color: rgb(0.85, 0.87, 0.9) }); y -= 12 }

    // Header
    text('BOATCLOSERS.COM', { size: 9, f: bold, color: brass, gap: 3 })
    text('PURCHASE & SALE AGREEMENT', { size: 17, f: bold, color: navy, gap: 4 })
    text(`Executed ${today}`, { size: 9, color: rgb(0.45, 0.5, 0.58), gap: 8 })
    rule()

    // ── Values from the deal ──
    const sAddr = [seller?.address, seller?.city, seller?.stateZip].filter(Boolean).join(', ') || '—'
    const bAddr = [buyer?.address, buyer?.city, buyer?.stateZip].filter(Boolean).join(', ') || '—'
    const price = Number(o?.amount) || 0
    const dep = Number(o?.deposit) || 0
    const bal = Math.max(0, price - dep)
    const depPct = (o?.escrowPct != null && o?.escrowPct !== '') ? `${o.escrowPct}%` : '—'
    const vState = v?.regState || v?.location || 'the State where the Vessel is located'
    const closeLoc = v?.location || 'the location where the Vessel is moored'
    const vLen = v?.loa ? `${v.loa} ft` : (v?.length || '—')
    const hull = v?.hullType || '—'
    const uscg = v?.uscgNumber || 'N/A'
    const titleNo = v?.regNumber || '—'
    const engine = [v?.engineCount, v?.engineMake, v?.engineModel].filter(Boolean).join(' ') || '—'
    const CONT_LABELS: any = { survey: 'Marine Survey', seaTrial: 'Sea Trial', financing: 'Financing Approval', insurance: 'Insurance Binding', title: 'Clear Title & Lien Search' }
    let contList: any[] = []
    const cRaw = o?.contingencies
    if (Array.isArray(cRaw)) contList = cRaw.map((k: any) => CONT_LABELS[k] || k)
    else if (cRaw && typeof cRaw === 'object') contList = Object.keys(cRaw).filter((k: any) => cRaw[k]).map((k: any) => CONT_LABELS[k] || k)
    const contStr = contList.length ? contList.join(', ') : 'the contingencies selected by the Buyer in the app'

    text(`This Vessel Purchase & Sale Agreement (the "Agreement") is made on ${today}, by and between ${seller?.name || '—'}, of ${sAddr} (the "Seller"), and ${buyer?.name || '—'}, of ${bAddr} (the "Buyer"). The Parties may reside in different states or countries; their places of residence do not change the governing law set out in this Agreement.`, { gap: 10 })

    text('1. The Vessel', { size: 11, f: bold, color: navy, gap: 5 })
    text(`Seller agrees to sell and Buyer agrees to purchase the following vessel together with its engines, equipment, and accessories: a ${[v?.year, v?.make, v?.model].filter(Boolean).join(' ') || vesselName}, ${vLen} in length, ${hull} hull, Hull Identification Number ${v?.hin || '—'}, U.S. Coast Guard Official Number ${uscg}, Title No. ${titleNo}, Registration ${titleNo}, powered by ${engine}. Items not listed and any personal effects of Seller are excluded from the sale.`, { gap: 9 })

    text('2. Purchase Price', { size: 11, f: bold, color: navy, gap: 5 })
    text(`The total purchase price is ${fmtMoney(price) || '—'} U.S. Dollars, payable as: an earnest money deposit of ${fmtMoney(dep) || '—'} (${depPct}) upon execution, and the balance of ${fmtMoney(bal) || '—'} in good funds at Closing.`, { gap: 9 })

    text('3. Contingencies', { size: 11, f: bold, color: navy, gap: 5 })
    text(`This Agreement is contingent upon the Buyer's satisfactory completion of the following during the Due Diligence period${o?.ddDays ? ` of ${o.ddDays} days` : ''}: ${contStr}. It is the Buyer's responsibility to obtain any assurances the Buyer requires regarding financing and insurance before accepting the Vessel, except to the extent a financing or insurance contingency is selected above.`, { gap: 9 })

    text('4. Closing', { size: 11, f: bold, color: navy, gap: 5 })
    text(`Closing shall occur on or before ${o?.closingDate || '____________'} at ${closeLoc}. At Closing, Seller shall deliver an executed Bill of Sale, the original Certificate of Title properly endorsed, the Vessel's registration and any U.S. Coast Guard documentation transfer materials, and keys and possession. Buyer shall deliver the balance of the Purchase Price in good funds.`, { gap: 9 })

    text('5. Condition, Risk of Loss & Damage Before Closing', { size: 11, f: bold, color: navy, gap: 5 })
    text(`Except as expressly stated in writing, the Vessel is sold "AS-IS, WHERE-IS," as described in the As-Is Acknowledgment executed with this Agreement. Risk of loss remains with Seller until possession and title pass to Buyer at Closing. If the Vessel sustains damage after Buyer's acceptance but before Closing, Seller shall repair it at Seller's expense prior to Closing, subject to Buyer's approval. If the damage is substantial and cannot be repaired to Buyer's reasonable satisfaction, Buyer may either accept a price adjustment or terminate this Agreement and receive a full refund of the earnest money deposit.`, { gap: 9 })

    text("6. Seller's Warranties of Title", { size: 11, f: bold, color: navy, gap: 5 })
    text(`Seller warrants lawful ownership of the Vessel, that it is free of all liens and encumbrances except those released at or before Closing, and that Seller has full authority to sell and transfer it.`, { gap: 9 })

    text('7. Default & Remedies', { size: 11, f: bold, color: navy, gap: 5 })
    text(`If Buyer defaults without a permitted contingency, Seller may retain the deposit as liquidated damages. If Seller defaults, Buyer shall receive a full refund of the deposit and any remedy available at law or equity.`, { gap: 9 })

    text('8. Time Is of the Essence', { size: 11, f: bold, color: navy, gap: 5 })
    text(`Time is of the essence in this Agreement. Each Party shall meet the deadlines stated for contingencies, acceptance, and Closing. Any deadline may be extended only by written agreement of both Parties.`, { gap: 9 })

    text('9. Dispute Resolution', { size: 11, f: bold, color: navy, gap: 5 })
    text(`The Parties shall first attempt in good faith to resolve any dispute through direct negotiation, then mediation. Any dispute not resolved by mediation shall be settled by binding arbitration under the rules of the American Arbitration Association, seated in the State of ${vState}, regardless of where the Parties reside. Judgment on the award may be entered in any court of competent jurisdiction.`, { gap: 9 })

    text('10. Governing Law', { size: 11, f: bold, color: navy, gap: 5 })
    text(`This Agreement is governed by the laws of the State of ${vState}, and by applicable United States maritime law, without regard to the state or country in which either Party resides. This Agreement constitutes the entire agreement between the Parties and supersedes all prior understandings. BoatClosers.com is a document facilitation platform only — not a broker, escrow agent, attorney, or party to this Agreement.`, { size: 10, gap: 8 })
    rule()

    text('SIGNATURES', { size: 11, f: bold, color: navy, gap: 8 })
    text(`Buyer:  ${o?.paBuyerSig || '________________________'}`, { f: bold })
    text(`Signed ${o?.paBuyerSig ? (o?.paBuyerDate || o?.paDate || today) : '(pending)'}`, { size: 9, color: rgb(0.45, 0.5, 0.58), gap: 10 })
    text(`Seller: ${o?.paSellerSig || '________________________'}`, { f: bold })
    text(`Signed ${o?.paSellerSig ? (o?.paSellerDate || o?.paDate || today) : '(pending)'}`, { size: 9, color: rgb(0.45, 0.5, 0.58), gap: 10 })

    gapY(6)
    text(`This copy was generated by BoatClosers.com on ${today} and reflects the agreement as signed in the app.`, { size: 8.5, color: rgb(0.55, 0.59, 0.65) })

    const bytes = await pdf.save()
    return Buffer.from(bytes).toString('base64')
  } catch (e) {
    console.error('buildPaPdfBase64 failed:', e)
    return null
  }
}


async function notifyOnDealChange(previous: any, updated: any) {
  try {
    // Only notify about offer/counter/reject changes once BOTH parties have
    // joined (party_b has an account). Before that there's no real account to
    // sign in as, so a "Review the Offer" link would dead-end. The invite email
    // (sent from the invite route) is what brings the second party in first.
    if (!updated?.party_b_user_id) return

    const buyerEmail = updated?.parties?.buyer?.email
    const sellerEmail = updated?.parties?.seller?.email
    const vesselName = updated?.vessel?.name || updated?.vessel?.makeModel || 'the vessel'

    // Build a deep-link that opens THIS deal on the page for the task, tied to
    // the RECIPIENT so the app makes them sign in as the right account instead
    // of showing the deal as whoever happens to be logged in on that browser.
    // step: 2 = Negotiate, 3 = Due Diligence, 4 = Documents, 5 = Closing.
    const base = process.env.NEXT_PUBLIC_APP_URL || ''
    const dealLink = (step: number, to?: string) => `${base}/?dealId=${updated?.id}&step=${step}${to ? `&to=${encodeURIComponent(to)}` : ''}`

    const prevOffers = previous?.negotiate?.offers || []
    const newOffers = updated?.negotiate?.offers || []

    if (newOffers.length > prevOffers.length) {
      const latest = newOffers[newOffers.length - 1]
      const recipientEmail = latest?.from === 'buyer' ? sellerEmail : buyerEmail
      const verb = latest?.from === 'buyer' ? 'sent an offer' : 'sent a counter-offer'

      if (recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: `New offer on your BoatClosers deal`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">You have a new offer</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              The other party has ${verb} of <strong>${fmtMoney(latest?.amount)}</strong> on
              <strong>${vesselName}</strong>.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(2, recipientEmail)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                Review the Offer
              </a>
            </p>
          `)
        })
      }
    }

    // Detect an offer that just changed to REJECTED or AGREED (status change, not a new offer).
    const statusById: any = {}
    for (const o of prevOffers) { if (o && o.id != null) statusById[o.id] = o.status }
    for (const o of newOffers) {
      if (!o || o.id == null) continue
      const before = statusById[o.id]
      if (before === o.status) continue
      // Notify the party who did NOT make this offer of the status change.
      const recipientEmail = o.from === 'buyer' ? buyerEmail : sellerEmail
      // (the maker hears the outcome of their own offer)
      if (o.status === 'rejected' && recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: `Your offer was rejected — BoatClosers`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Your offer was declined</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              The other party rejected the <strong>${fmtMoney(o.amount)}</strong> offer on
              <strong>${vesselName}</strong>. You can send a new offer to keep the deal alive.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(2, recipientEmail)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                Open the Deal Room
              </a>
            </p>
          `)
        })
      }
      if (o.status === 'agreed') {
        // The initiator needs to pay to lock — notify both, with the action link.
        const recips = [buyerEmail, sellerEmail].filter(Boolean)
        for (const email of recips) {
          await sendEmail({
            to: email,
            subject: `Price agreed — time to lock your BoatClosers deal`,
            html: emailLayout(`
              <h2 style="color:#08152e; font-size:18px;">Price agreed: ${fmtMoney(o.amount)}</h2>
              <p style="color:#475569; font-size:14px; line-height:1.5;">
                Both sides have agreed on the price for <strong>${vesselName}</strong>. The party who
                started the deal completes the one-time fee to unlock and sign the Purchase Agreement.
              </p>
              <p style="text-align:center; margin: 24px 0;">
                <a href="${dealLink(2, email)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                  Open the Deal Room
                </a>
              </p>
            `)
          })
        }
      }
    }

    const prevSigned = previous?.docs_data?.signedDocs || {}
    const newSigned = updated?.docs_data?.signedDocs || {}
    const prevSignedIds = Object.keys(prevSigned)
    const newSignedIds = Object.keys(newSigned)

    // Purchase Agreement gets its own immediate email the first time it's signed,
    // because the PA is what makes the deal real and binding.
    const paJustSigned = !prevSigned['purchase_agreement'] && !!newSigned['purchase_agreement']
    if (paJustSigned) {
      const recipients = [buyerEmail, sellerEmail].filter(Boolean)
      const paPdf = await buildPaPdfBase64(updated)
      const attachments = paPdf ? [{ filename: 'Purchase-Agreement.pdf', content: paPdf }] : undefined
      for (const email of recipients) {
        await sendEmail({
          to: email,
          subject: `Purchase Agreement signed — BoatClosers`,
          attachments,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Purchase Agreement Signed</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              The Purchase &amp; Sale Agreement for <strong>${vesselName}</strong> has been signed.
              This is the binding contract for the deal.${paPdf ? ' A signed copy is attached to this email as a PDF.' : ''}
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(4, email)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                View the Agreement
              </a>
            </p>
          `)
        })
      }
    }

    // Any other documents getting signed → one batched email noting progress,
    // sent at this save point (which is when the Documents step is completed).
    const otherNewlySigned = newSignedIds.filter(id => id !== 'purchase_agreement' && !prevSignedIds.includes(id))
    if (otherNewlySigned.length > 0) {
      const recipients = [buyerEmail, sellerEmail].filter(Boolean)
      const count = otherNewlySigned.length
      for (const email of recipients) {
        await sendEmail({
          to: email,
          subject: `Documents signed on your BoatClosers deal`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Documents Signed</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              ${count} document${count > 1 ? 's have' : ' has'} been signed on your deal for
              <strong>${vesselName}</strong>. Check your deal for the latest status.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(4, email)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                View Documents
              </a>
            </p>
          `)
        })
      }
    }

    const justLocked = updated?.negotiate?.dealLocked && !previous?.negotiate?.dealLocked
    if (justLocked) {
      const recipients = [buyerEmail, sellerEmail].filter(Boolean)
      const paPdf = await buildPaPdfBase64(updated)
      const attachments = paPdf ? [{ filename: 'Purchase-Agreement.pdf', content: paPdf }] : undefined
      for (const email of recipients) {
        await sendEmail({
          to: email,
          subject: `Your BoatClosers deal is locked`,
          attachments,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Deal Locked</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              Both parties have signed the Purchase Agreement for <strong>${vesselName}</strong>
              and the deal is now binding. Your closing documents are unlocked — open the deal to review and sign them.${paPdf ? ' A signed copy of the Purchase Agreement is attached as a PDF.' : ''}
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(4, email)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                Go to Your Deal
              </a>
            </p>
          `)
        })
      }
    }

    // ── DUE DILIGENCE OUTCOME ── the buyer's vessel decision. Notify the seller
    // whenever the outcome changes (accept as-is, reject, or propose new price).
    const prevOutcome = previous?.dd_data?.outcome || null
    const newOutcome = updated?.dd_data?.outcome || null
    const prevProposed = previous?.dd_data?.proposedNewPrice || null
    const newProposed = updated?.dd_data?.proposedNewPrice || null
    const outcomeChanged = newOutcome && newOutcome !== prevOutcome
    const proposedChanged = newOutcome === 'propose_price' && newProposed && newProposed !== prevProposed

    if (sellerEmail && (outcomeChanged || proposedChanged)) {
      if (newOutcome === 'accept') {
        await sendEmail({
          to: sellerEmail,
          subject: `Buyer accepted the vessel — BoatClosers`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Buyer Accepted the Vessel</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              The buyer has completed due diligence and <strong>accepted ${vesselName} as-is</strong>.
              The deal proceeds to closing on the agreed terms.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(3, sellerEmail)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                View the Deal
              </a>
            </p>
          `)
        })
      } else if (newOutcome === 'reject') {
        await sendEmail({
          to: sellerEmail,
          subject: `Buyer rejected the vessel — BoatClosers`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Buyer Rejected the Vessel</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              After due diligence, the buyer has <strong>rejected ${vesselName}</strong>.
              The earnest money is to be returned per your deposit terms, and the reason is
              recorded in the Rejection Notice.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(3, sellerEmail)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                View the Deal
              </a>
            </p>
          `)
        })
      } else if (newOutcome === 'propose_price') {
        const reason = updated?.dd_data?.proposedNewPriceReason || ''
        await sendEmail({
          to: sellerEmail,
          subject: `Action needed: buyer proposed a price addendum — BoatClosers`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Buyer Proposed a Price Addendum</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              Following due diligence on <strong>${vesselName}</strong>, the buyer has proposed a
              <strong>new final price of ${fmtMoney(newProposed)}</strong> as an addendum to the
              signed Purchase Agreement. The original agreement stays intact${reason ? `. Reason given: "${String(reason).replace(/</g,'&lt;')}"` : ''}.
            </p>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              Open the deal to <strong>accept or decline</strong> this addendum.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(3, sellerEmail)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                Review &amp; Respond
              </a>
            </p>
          `)
        })
      }
    }

    // ── ADDENDUM RESOLUTION ── seller accepts or declines the buyer's price addendum.
    const prevAdd = previous?.dd_data?.addendumStatus || null
    const newAdd = updated?.dd_data?.addendumStatus || null
    if (buyerEmail && newAdd && newAdd !== prevAdd && (newAdd === 'accepted' || newAdd === 'declined')) {
      const accepted = newAdd === 'accepted'
      await sendEmail({
        to: buyerEmail,
        subject: `Seller ${accepted ? 'accepted' : 'declined'} your price addendum — BoatClosers`,
        html: emailLayout(`
          <h2 style="color:#08152e; font-size:18px;">Addendum ${accepted ? 'Accepted' : 'Declined'}</h2>
          <p style="color:#475569; font-size:14px; line-height:1.5;">
            The seller has <strong>${accepted ? 'accepted' : 'declined'}</strong> your proposed price
            addendum on <strong>${vesselName}</strong>.
            ${accepted
              ? 'The amended price now applies and the deal proceeds to closing on the updated terms.'
              : 'The original agreed price stands. You can accept the vessel as-is, or proceed per your due-diligence options.'}
          </p>
          <p style="text-align:center; margin: 24px 0;">
            <a href="${dealLink(3, buyerEmail)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
              View the Deal
            </a>
          </p>
        `)
      })
    }
    // ── VESSEL REJECTED ── buyer formally rejected after due diligence → notify
    // BOTH parties with reasons / notes / proposed path, plus refund guidance.
    const newRej = updated?.negotiate?.vesselRejection
    const prevRej = previous?.negotiate?.vesselRejection
    if (newRej && !prevRej) {
      const REJECTION_LABELS: any = {
        survey_failed: 'Survey revealed unacceptable defects',
        engine_failed: 'Engine or mechanical failure',
        title_issue: 'Title or lien issue discovered',
        sea_trial_failed: 'Sea trial failed',
        price_disagreement: 'Could not agree on price adjustment',
        insurance_denied: 'Insurance could not be obtained',
        other: 'Other — see notes',
      }
      const reasonList = (newRej.reasons || []).map((id: string) => REJECTION_LABELS[id] || id)
      const reasonsHtml = reasonList.length
        ? `<ul style="margin:8px 0;padding-left:20px;color:#334155;font-size:13px;">${reasonList.map((r: string) => `<li>${r}</li>`).join('')}</ul>`
        : ''
      const rejRecips = [buyerEmail, sellerEmail].filter(Boolean)
      for (const email of rejRecips) {
        await sendEmail({
          to: email,
          subject: `Deal ended — vessel rejected (${vesselName})`,
          html: emailLayout(`
            <h2 style="color:#7a1c1c; font-size:18px;">Vessel Rejected — Deal Ended</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              The buyer has formally rejected <strong>${vesselName}</strong> after due diligence. This ends the deal.
            </p>
            ${reasonsHtml ? `<p style="color:#334155;font-size:13px;margin-bottom:0;"><strong>Reasons given:</strong></p>${reasonsHtml}` : ''}
            ${newRej.notes ? `<p style="background:#f8fafc;border-left:3px solid #b8863a;padding:12px 14px;margin:12px 0;color:#334155;font-size:13px;"><strong>Notes:</strong> ${String(newRej.notes).replace(/</g, '&lt;')}</p>` : ''}
            ${newRej.solution ? `<p style="background:#eef4fb;border-left:3px solid #08152e;padding:12px 14px;margin:12px 0;color:#334155;font-size:13px;"><strong>Buyer's proposed path forward:</strong> ${String(newRej.solution).replace(/</g, '&lt;')}</p>` : ''}
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              If an earnest-money deposit was paid, it should be returned to the buyer. BoatClosers never holds or moves funds — please arrange the return directly (through your escrow provider, attorney, or the original payment method) and keep written confirmation. Open the deal for step-by-step guidance.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(5, email)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">View the Rejection Notice</a>
            </p>
          `)
        })
      }
    }
    // ── GET READY TO FINALIZE ── due diligence cleared (vessel accepted, or the
    // price addendum accepted) → nudge BOTH parties to complete the closing docs.
    const ddCleared = (newOutcome === 'accept' && newOutcome !== prevOutcome)
      || (newAdd === 'accepted' && newAdd !== prevAdd)
    if (ddCleared) {
      const recips = [buyerEmail, sellerEmail].filter(Boolean)
      for (const email of recips) {
        await sendEmail({
          to: email,
          subject: `Due diligence cleared — time to finalize your BoatClosers deal`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Get Ready to Finalize</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              Due diligence on <strong>${vesselName}</strong> is complete and the vessel has been
              accepted${newAdd === 'accepted' ? ' on the amended terms' : ''}. The next step is to complete and sign the closing documents.
            </p>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              Open your deal to review what's left, finish the remaining documents, and finalize the sale.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(4, email)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                Finalize the Deal
              </a>
            </p>
          `)
        })
      }
    }
  } catch (e) {
    console.error('notifyOnDealChange failed:', e)
  }
}

export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ deal: null })
  try {
    // If a specific dealId is requested (invited guest arriving from the join
    // flow), load THAT deal directly and make sure this user is attached to it.
    const url = new URL(req.url)
    const dealId = url.searchParams.get('dealId')
    if (dealId) {
      const { data: row } = await admin()
        .from('deals').select('*').eq('id', dealId).single()
      if (row) {
        const isInitiator = row.initiator_id === userId || row.party_a_user_id === userId
        const isPartyB = row.party_b_user_id === userId
        // Open second slot + not the initiator → attach this user as party B now.
        if (!isInitiator && !isPartyB && !row.party_b_user_id) {
          const { data: attached } = await admin()
            .from('deals')
            .update({ party_b_user_id: userId, invite_status: 'accepted', invite_accepted_at: new Date().toISOString() })
            .eq('id', dealId).select().single()
          return NextResponse.json({ deal: attached || row })
        }
        // Already a member (initiator or party B) → return the deal.
        if (isInitiator || isPartyB) {
          return NextResponse.json({ deal: row })
        }
        // Slot is filled by someone else and this user isn't a member → do NOT
        // expose the deal. Returning the row here would let any logged-in user
        // read someone else's deal by guessing its id. Send nothing sensitive;
        // the app treats a null deal as "no access".
        return NextResponse.json({ deal: null, notAMember: true })
      }
      // dealId was requested but no such row — fall through to the member lookup
      // below rather than returning a confusing blank.
    }

    const { data } = await admin()
      .from('deals')
      .select('*')
      .or(`initiator_id.eq.${userId},party_b_user_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
    return NextResponse.json({ deal: data && data.length ? data[0] : null })
  } catch {
    return NextResponse.json({ deal: null })
  }
}

export async function POST(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Could not verify your session.' }, { status: 401 })

  try {
    const body = await req.json()
    const { dealId, vessel, parties, negotiate, dd_data, docs_data, step, max_step } = body

    const payload: any = {
      vessel: vessel || {},
      parties: parties || {},
      negotiate: negotiate || {},
      dd_data: dd_data || {},
      docs_data: docs_data || {},
      step: typeof step === 'number' ? step : 0,
      max_step: typeof max_step === 'number' ? max_step : 0
    }

    if (dealId) {
      // Load the current row first so we can confirm this user belongs on the
      // deal and merge instead of blindly overwriting the other side.
      const { data: existingRow } = await admin()
        .from('deals').select('*').eq('id', dealId).single()

      if (!existingRow) {
        return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })
      }

      const isInitiator = existingRow.initiator_id === userId || existingRow.party_a_user_id === userId
      const isPartyBmember = existingRow.party_b_user_id === userId
      const isMember = isInitiator || isPartyBmember
      if (!isMember) {
        return NextResponse.json({ error: 'You are not a party on this deal.' }, { status: 403 })
      }

      // Determine which side this user owns. initiator_role tells us party A's
      // side; the other side belongs to party B.
      const initiatorRole = existingRow.initiator_role || 'buyer'
      const otherRole = initiatorRole === 'buyer' ? 'seller' : 'buyer'
      const mySide = isInitiator ? initiatorRole : otherRole
      const theirSide = mySide === 'buyer' ? 'seller' : 'buyer'

      // Once the second party has joined, each side may only write its OWN
      // contact sub-object — the other side is preserved untouched. Before the
      // second party joins, the initiator may still pre-fill both sides.
      const bothPresent = !!existingRow.party_b_user_id
      const existingParties = existingRow.parties || {}
      const incomingParties = parties || {}
      let mergedParties
      if (bothPresent) {
        mergedParties = {
          ...existingParties,
          [mySide]: { ...(existingParties[mySide] || {}), ...(incomingParties[mySide] || {}) },
          [theirSide]: { ...(existingParties[theirSide] || {}) } // locked: keep as-is
        }
      } else {
        // Pre-join: initiator can fill either side.
        mergedParties = {
          ...existingParties,
          ...incomingParties,
          buyer: { ...(existingParties.buyer || {}), ...(incomingParties.buyer || {}) },
          seller: { ...(existingParties.seller || {}), ...(incomingParties.seller || {}) }
        }
      }
      const mergedPayload = { ...payload, parties: mergedParties }

      // Protect the negotiation offers the same way we protect parties: a save
      // coming from one side must never wipe offers the other side already made.
      // Offers only ever GROW during a negotiation, so keep whichever side has
      // the most complete list and never let an incoming save shrink it.
      const existingNeg = existingRow.negotiate || {}
      const incomingNeg = negotiate || {}
      const existingOffers = Array.isArray(existingNeg.offers) ? existingNeg.offers : []
      const incomingOffers = Array.isArray(incomingNeg.offers) ? incomingNeg.offers : []
      // Build a union of offers by id so neither side loses one, newest status wins.
      const offerById: any = {}
      for (const o of existingOffers) { if (o && o.id != null) offerById[o.id] = o }
      for (const o of incomingOffers) {
        if (o && o.id != null) {
          // Incoming wins for an existing id (captures status changes like accept/counter),
          // but we never drop an id that only exists on the server side.
          const ex = offerById[o.id] || {}
          const merged: any = { ...ex, ...o }
          // PA signatures are sticky: once a party has signed their own line, a
          // later save from the OTHER party (whose copy may not have that
          // signature yet) must never erase it.
          for (const k of ['paBuyerSig','paBuyerDisc','paBuyerDate','paSellerSig','paSellerDisc','paSellerDate']) {
            if (!merged[k] && ex[k]) merged[k] = ex[k]
          }
          // Status only advances (pending → agreed → accepted). A stale save from
          // the other party must never knock an offer back from accepted to agreed.
          const rank: any = { pending: 1, rejected: 1, agreed: 2, accepted: 3 }
          if ((rank[ex.status] || 0) > (rank[merged.status] || 0)) merged.status = ex.status
          offerById[o.id] = merged
        }
      }
      const mergedOffers = Object.values(offerById).sort((a: any, b: any) => Number(a.id) - Number(b.id))
      // Same protection for the message thread.
      const existingMsgs = Array.isArray(existingNeg.messages) ? existingNeg.messages : []
      const incomingMsgs = Array.isArray(incomingNeg.messages) ? incomingNeg.messages : []
      const mergedMsgs = incomingMsgs.length >= existingMsgs.length ? incomingMsgs : existingMsgs
      mergedPayload.negotiate = {
        ...existingNeg,
        ...incomingNeg,
        offers: mergedOffers,
        messages: mergedMsgs
      }
      // Deposit proof and the "ended" flag are sticky once set, and the deadline
      // only ever moves later (a seller extension), so one party's stale save
      // can't undo the other's deposit action.
      if (!mergedPayload.negotiate.depositProof && existingNeg.depositProof) mergedPayload.negotiate.depositProof = existingNeg.depositProof
      if (!mergedPayload.negotiate.depositEnded && existingNeg.depositEnded) mergedPayload.negotiate.depositEnded = existingNeg.depositEnded
      if (!mergedPayload.negotiate.vesselAcceptance && existingNeg.vesselAcceptance) mergedPayload.negotiate.vesselAcceptance = existingNeg.vesselAcceptance
      if (!mergedPayload.negotiate.vesselRejection && existingNeg.vesselRejection) mergedPayload.negotiate.vesselRejection = existingNeg.vesselRejection
      mergedPayload.negotiate.uploads = { ...(existingNeg.uploads || {}), ...(mergedPayload.negotiate.uploads || {}) }
      if (!mergedPayload.negotiate.addendum && existingNeg.addendum) mergedPayload.negotiate.addendum = existingNeg.addendum
      if (mergedPayload.negotiate.addendum && existingNeg.addendum && existingNeg.addendum.status && !mergedPayload.negotiate.addendum.status) {
        mergedPayload.negotiate.addendum.status = existingNeg.addendum.status
      }
      // Once a price addendum is accepted, the bound offer's price IS the amended
      // price — enforce it server-side so a stale save can't revert to the old number.
      if (mergedPayload.negotiate.addendum?.status === 'accepted' && Number(mergedPayload.negotiate.addendum?.newPrice) && Array.isArray(mergedPayload.negotiate.offers)) {
        const amt = Number(mergedPayload.negotiate.addendum.newPrice)
        mergedPayload.negotiate.offers = mergedPayload.negotiate.offers.map((o: any) =>
          (o && (o.status === 'accepted' || o.status === 'agreed')) ? { ...o, origAmount: (o.origAmount ?? o.amount), amount: amt } : o)
      }
      if (!mergedPayload.negotiate.dealLocked && existingNeg.dealLocked) mergedPayload.negotiate.dealLocked = existingNeg.dealLocked
      if (!mergedPayload.negotiate.paid && existingNeg.paid) mergedPayload.negotiate.paid = existingNeg.paid
      if ((Number(existingNeg.depositDeadline)||0) > (Number(mergedPayload.negotiate.depositDeadline)||0)) mergedPayload.negotiate.depositDeadline = existingNeg.depositDeadline

      // Update by id ALONE — authorization already checked. The old .or() filter
      // on the update was failing to match for the joined party, so their saves
      // silently wrote nothing. This is the fix for "joiner's data doesn't save."
      const { data, error } = await admin()
        .from('deals').update(mergedPayload).eq('id', dealId)
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await notifyOnDealChange(existingRow, data)
      return NextResponse.json({ deal: data })
    }

    const { data: existing } = await admin()
      .from('deals').select('id')
      .or(`initiator_id.eq.${userId},party_b_user_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false }).limit(1)

    if (existing && existing.length) {
      const { data: existingRow } = await admin()
        .from('deals').select('*').eq('id', existing[0].id).single()

      const { data, error } = await admin()
        .from('deals').update(payload).eq('id', existing[0].id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      await notifyOnDealChange(existingRow, data)
      return NextResponse.json({ deal: data })
    }

    // Use the initiator's OWN chosen role (from signup), not a guess based on
    // which name field happens to be filled. Guessing produced inverted roles.
    const role = (body.role === 'seller' || body.role === 'buyer')
      ? body.role
      : ((parties && parties.seller && parties.seller.name && !(parties.buyer && parties.buyer.name)) ? 'seller' : 'buyer')
    const { data, error } = await admin()
      .from('deals')
      .insert({ initiator_id: userId, party_a_user_id: userId, initiator_role: role, status: 'active', paid: false, ...payload })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ deal: data })
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
