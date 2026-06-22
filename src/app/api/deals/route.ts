import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

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

async function notifyOnDealChange(previous: any, updated: any) {
  try {
    const buyerEmail = updated?.parties?.buyer?.email
    const sellerEmail = updated?.parties?.seller?.email
    const vesselName = updated?.vessel?.name || updated?.vessel?.makeModel || 'the vessel'

    // Build a deep-link that opens THIS deal on the page for the task.
    // step: 2 = Negotiate, 3 = Due Diligence, 4 = Documents, 5 = Closing.
    const base = process.env.NEXT_PUBLIC_APP_URL || ''
    const dealLink = (step: number) => `${base}/?dealId=${updated?.id}&step=${step}`

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
              <a href="${dealLink(2)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                Review the Offer
              </a>
            </p>
          `)
        })
      }
    }

    // Document signing — compare which docs were signed before vs now.
    const prevSigned = previous?.docs_data?.signedDocs || {}
    const newSigned = updated?.docs_data?.signedDocs || {}
    const prevSignedIds = Object.keys(prevSigned)
    const newSignedIds = Object.keys(newSigned)

    // Purchase Agreement gets its own immediate email the first time it's signed,
    // because the PA is what makes the deal real and binding.
    const paJustSigned = !prevSigned['purchase_agreement'] && !!newSigned['purchase_agreement']
    if (paJustSigned) {
      const recipients = [buyerEmail, sellerEmail].filter(Boolean)
      for (const email of recipients) {
        await sendEmail({
          to: email,
          subject: `Purchase Agreement signed — BoatClosers`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Purchase Agreement Signed</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              The Purchase &amp; Sale Agreement for <strong>${vesselName}</strong> has been signed.
              This is the binding contract for the deal.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(4)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
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
              <a href="${dealLink(4)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                View Documents
              </a>
            </p>
          `)
        })
      }
    }

    const justLocked = updated?.dealLocked && !previous?.dealLocked
    if (justLocked) {
      const recipients = [buyerEmail, sellerEmail].filter(Boolean)
      for (const email of recipients) {
        await sendEmail({
          to: email,
          subject: `Your BoatClosers deal is locked`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:18px;">Deal Locked</h2>
            <p style="color:#475569; font-size:14px; line-height:1.5;">
              Both parties have signed the Purchase Agreement for <strong>${vesselName}</strong>
              and the deal is now binding. You can now proceed with the remaining closing documents.
            </p>
            <p style="text-align:center; margin: 24px 0;">
              <a href="${dealLink(4)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
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
              <a href="${dealLink(3)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
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
              <a href="${dealLink(3)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
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
              <a href="${dealLink(3)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
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
            <a href="${dealLink(3)}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
              View the Deal
            </a>
          </p>
        `)
      })
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
        // Slot is filled by someone else and this user isn't a member.
        // They were invited to THIS deal (they have its dealId in session) but
        // the party_b slot is taken — surface the deal read-only rather than
        // dumping them on a blank app, and let the UI explain.
        return NextResponse.json({ deal: row, notAMember: true })
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

      // Update by id ALONE — authorization already checked. The old .or() filter
      // on the update was failing to match for the joined party, so their saves
      // silently wrote nothing. This is the fix for "joiner's data doesn't save."
      const { data, error } = await admin()
        .from('deals').update(mergedPayload).eq('id', dealId)
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      notifyOnDealChange(existingRow, data)
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

      notifyOnDealChange(existingRow, data)
      return NextResponse.json({ deal: data })
    }

    const role = (parties && parties.seller && parties.seller.name) ? 'seller' : 'buyer'
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
