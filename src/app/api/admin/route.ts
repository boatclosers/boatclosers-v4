import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Owner-only view of every deal on the platform.
//
// AUTH: the password is checked HERE, on the server, against ADMIN_PASSWORD in
// Vercel. It is never sent to the browser and there is no client-side check to
// bypass — the page renders nothing until this route hands back data. Compared
// with timingSafeEqual so the response time can't be used to guess it.
//
// READ-ONLY on purpose. This route cannot modify a deal. A dashboard that can
// edit live deals is a dashboard that can break one at 11pm; seeing everything
// is most of the value, and actions can be added deliberately later.

function passwordOk(given: string) {
  const expected = process.env.ADMIN_PASSWORD || ''
  if (!expected || !given) return false
  const a = Buffer.from(String(given))
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  try { return crypto.timingSafeEqual(a, b) } catch { return false }
}

const days = (ts: any) => {
  const t = typeof ts === 'number' ? ts : Date.parse(ts || '')
  if (!t || isNaN(t)) return null
  return Math.floor((Date.now() - t) / 86400000)
}

// Works out what a deal is actually waiting on. This is the whole point of the
// dashboard: not "here are your deals" but "here is who owes what, and for how
// long" — the question behind almost every support email.
function assess(d: any) {
  const neg = d?.negotiate || {}
  const dd = d?.dd_data || {}
  const offers: any[] = Array.isArray(neg.offers) ? neg.offers : []
  const agreed = offers.find(o => o.status === 'agreed')
  const accepted = offers.find(o => o.status === 'accepted')
  const paid = !!(neg.paid || neg.dealLocked || accepted)
  const depositDue = Number(neg.deposit) > 0
  const instr = !!(neg.depositInstructions && neg.depositInstructions.details)
  const proof = !!(neg.depositProof && neg.depositProof.sig)
  const verif = neg.depositVerification || null
  const verified = verif?.status === 'confirmed'
  const disputed = verif?.status === 'disputed'
  // Both-confirm / escrow model: a party is "confirmed" via their flag OR a signed receipt.
  const buyerConfirmed = !!neg.depositBuyerConfirmed || !!(neg.depositProof && neg.depositProof.sig)
  const sellerConfirmed = !!neg.depositSellerConfirmed || (verif?.status === 'confirmed' && !!verif?.sig)
  const escrowVerified = verif?.status === 'confirmed'
  const joined = !!d.other_party_id

  let state = 'unknown', waitingOn = '—', urgency = 0, note = ''

  if (neg.canceled)              { state = 'Cancelled';            waitingOn = '—'; urgency = 0; note = 'Deal was cancelled.' }
  else if (neg.depositEnded)     { state = 'Ended — no deposit';   waitingOn = '—'; urgency = 1; note = 'Deposit never funded; deal closed.' }
  else if (dd.outcome === 'reject') { state = 'Vessel rejected';   waitingOn = '—'; urgency = 1; note = 'Buyer rejected the vessel.' }
  else if (!joined)              { state = 'Awaiting join';        waitingOn = 'Invited party'; urgency = 2; note = 'Invite sent, other party has not created an account yet.' }
  else if (disputed)             { state = 'Deposit disputed';     waitingOn = 'Both'; urgency = 5; note = 'Seller says the deposit has not arrived. Nothing moves until resolved.' }
  else if (!agreed && !accepted) { state = 'Negotiating';          waitingOn = offers.length ? 'Other party' : 'Buyer'; urgency = 1; note = offers.length ? `${offers.length} offer(s) exchanged, no agreement yet.` : 'No offers made yet.' }
  else if (agreed && !(agreed.paBuyerSig && agreed.paSellerSig)) {
    const who = agreed.paBuyerSig ? 'Seller' : agreed.paSellerSig ? 'Buyer' : 'Both'
    state = 'Awaiting PA signature'; waitingOn = who; urgency = 3; note = 'Price agreed, Purchase Agreement not fully signed.'
  }
  else if (!paid)                { state = 'Awaiting payment';     waitingOn = 'Initiator'; urgency = 4; note = 'Both signed the PA. The $249 has not been paid, so everything is locked.' }
  else if (depositDue && neg.escrowPath === 'escrow_com' && !escrowVerified) { state = 'Awaiting Escrow.com funding'; waitingOn = 'Buyer'; urgency = 3; note = 'Escrow.com deposit not funded/verified yet.' }
  else if (depositDue && !buyerConfirmed) { state = 'Awaiting deposit'; waitingOn = 'Buyer'; urgency = 3; note = 'Buyer has not sent the deposit / signed the receipt yet.' }
  else if (depositDue && !sellerConfirmed) { state = 'Awaiting deposit confirmation'; waitingOn = 'Seller'; urgency = 4; note = 'Buyer confirmed sending; seller has not confirmed receipt.' }
  else if (dd.outcome === 'accept' || (d.max_step || 0) >= 4) { state = 'Documents / closing'; waitingOn = 'Both'; urgency = 1; note = 'Past due diligence.' }
  else                           { state = 'Due diligence';        waitingOn = 'Buyer'; urgency = 1; note = 'Deposit secured, survey and sea trial underway.' }

  const v = d?.vessel || {}
  return {
    id: d.id,
    boat: [v.year, v.make, v.model].filter(Boolean).join(' ') || v.name || '—',
    hin: v.hin || '',
    price: Number(agreed?.amount || accepted?.amount || v.askingPrice || 0),
    deposit: Number(neg.deposit || 0),
    buyer: { name: d?.parties?.buyer?.name || '', email: d?.parties?.buyer?.email || '' },
    seller: { name: d?.parties?.seller?.name || '', email: d?.parties?.seller?.email || '' },
    initiatorRole: d.initiator_role || '',
    inviteEmail: d.invite_email || '',
    inviteStatus: d.invite_status || '',
    joined,
    paid,
    state, waitingOn, urgency, note,
    offers: offers.length,
    escrow: neg.escrowPath || '',
    createdDays: days(d.created_at),
    idleDays: days(d.updated_at),
    depositDeadline: neg.depositDeadline || null,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { password } = body
    if (!passwordOk(password)) {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
    }

    // ── Escrow.com check, behind the same admin password ──────────────────────
    // Read-only: given a transaction ID (or "1" to just test the connection),
    // asks Escrow.com whether it's funded. Cannot move money. Lets the owner
    // confirm a real deposit without relying on the seller's word.
    if (body.action === 'escrowCheck') {
      const base = process.env.ESCROW_API_BASE || 'https://api.escrow-sandbox.com'
      const email = process.env.ESCROW_API_EMAIL || ''
      const key = process.env.ESCROW_API_KEY || ''
      if (!email || !key) {
        return NextResponse.json({ escrow: { ok: false, configured: false, message: 'Escrow.com keys are not set on the server yet (ESCROW_API_EMAIL / ESCROW_API_KEY).' } })
      }
      const txId = String(body.transactionId || '1').trim()
      if (!/^\d+$/.test(txId)) {
        return NextResponse.json({ escrow: { ok: false, message: 'Transaction ID must be numbers only.' } })
      }
      try {
        const auth = 'Basic ' + Buffer.from(`${email}:${key}`).toString('base64')
        const r = await fetch(`${base}/2017-09-01/transaction/${txId}`, {
          method: 'GET', headers: { Authorization: auth, Accept: 'application/json' }, cache: 'no-store',
        })
        const envLabel = base.includes('sandbox') ? 'sandbox' : 'LIVE'
        if (r.status === 401 || r.status === 403) {
          return NextResponse.json({ escrow: { ok: false, connected: true, env: envLabel, message: `Reached Escrow.com (${envLabel}), but it rejected the credentials. Check the API email and key.` } })
        }
        if (r.status === 404) {
          return NextResponse.json({ escrow: { ok: true, connected: true, env: envLabel, funded: false, message: `✓ Connected to Escrow.com (${envLabel}). No transaction #${txId} exists yet — that's expected until you create one.` } })
        }
        if (!r.ok) {
          const t = await r.text().catch(() => '')
          return NextResponse.json({ escrow: { ok: false, connected: true, env: envLabel, message: `Escrow.com (${envLabel}) returned ${r.status}.`, detail: t.slice(0, 200) } })
        }
        const tx = await r.json().catch(() => null)
        const status = String(tx?.status?.transaction || tx?.status?.state || '').toLowerCase()
        const funded = ['secured','in_dispute','dispute','closed','completed','shipped','received','accepted','in_progress'].some(s => status.includes(s))
        return NextResponse.json({ escrow: {
          ok: true, connected: true, env: envLabel, funded, state: status || 'unknown',
          // The raw status + party states, so we can confirm the funded-mapping against
          // a real funded transaction the first time one appears. Safe to show — it's
          // status metadata, not money-moving controls.
          raw: { status: tx?.status ?? null, parties: Array.isArray(tx?.parties) ? tx.parties.map((p: any) => ({ role: p?.role, status: p?.status ?? null })) : null },
          message: funded
            ? `✓ Transaction #${txId} on Escrow.com (${envLabel}) is FUNDED — the deposit is really in escrow.`
            : `Transaction #${txId} exists on Escrow.com (${envLabel}) but is NOT funded yet (state: ${status || 'unknown'}).`,
        } })
      } catch (e: any) {
        return NextResponse.json({ escrow: { ok: false, message: 'Could not reach Escrow.com: ' + (e?.message || 'unknown') } })
      }
    }

    // ── Create a SANDBOX test transaction ────────────────────────────────────
    // So the owner can prove the funded-flip without curl or the command line.
    // Hard-stops if the base URL isn't sandbox — this must never run against live.
    if (body.action === 'escrowCreateTest') {
      const base = process.env.ESCROW_API_BASE || 'https://api.escrow-sandbox.com'
      const email = process.env.ESCROW_API_EMAIL || ''
      const key = process.env.ESCROW_API_KEY || ''
      if (!base.includes('sandbox')) {
        return NextResponse.json({ escrow: { ok: false, message: 'Refusing to create a test transaction against a LIVE environment. This is sandbox-only.' } })
      }
      if (!email || !key) {
        return NextResponse.json({ escrow: { ok: false, configured: false, message: 'Escrow.com keys are not set on the server yet.' } })
      }
      try {
        const auth = 'Basic ' + Buffer.from(`${email}:${key}`).toString('base64')
        const payload = {
          parties: [
            { role: 'buyer', customer: 'me' },
            { role: 'seller', customer: 'seller@test.escrow.com' },
          ],
          currency: 'usd',
          description: 'BoatClosers sandbox test — safe to ignore',
          items: [{
            title: 'Test boat deposit',
            description: 'Sandbox deposit test',
            type: 'general_merchandise',
            inspection_period: 259200,
            quantity: 1,
            schedule: [{ amount: 500, payer_customer: 'me', beneficiary_customer: 'seller@test.escrow.com' }],
          }],
        }
        const r = await fetch(`${base}/2017-09-01/transaction`, {
          method: 'POST',
          headers: { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        })
        const j = await r.json().catch(() => null)
        if (!r.ok) {
          return NextResponse.json({ escrow: { ok: false, message: `Escrow.com refused to create the test transaction (${r.status}).`, detail: JSON.stringify(j).slice(0, 400) } })
        }
        const newId = j?.id ? String(j.id) : ''
        return NextResponse.json({ escrow: {
          ok: true, created: true, transactionId: newId,
          message: newId
            ? `✓ Created sandbox transaction #${newId}. Put that number in the box above and click Check — it should say NOT funded. Then fund it on escrow-sandbox.com and check again.`
            : 'Escrow.com accepted the request but returned no transaction ID.',
        } })
      } catch (e: any) {
        return NextResponse.json({ escrow: { ok: false, message: 'Could not reach Escrow.com: ' + (e?.message || 'unknown') } })
      }
    }
    // ── CONTROL ACTIONS ───────────────────────────────────────────────────────
    // Deliberate, single-purpose actions — never a free-form field editor. Each
    // requires the admin password (already checked above), targets one deal by id,
    // records what was done into negotiate.adminLog, and returns the updated deal.
    // These exist so the owner can fix the exact problems that came up in testing
    // (stuck role, stuck deposit, bad auto-join) without opening Supabase.
    if (body.action && String(body.action).startsWith('admin')) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 })
      }
      const sb2 = admin()
      const dealId = String(body.dealId || '').trim()

      // Delete a deal (test/spam cleanup). Hard delete — confirmed on the client.
      if (body.action === 'adminDeleteDeal') {
        if (!dealId) return NextResponse.json({ error: 'Missing dealId.' }, { status: 400 })
        const { error } = await sb2.from('deals').delete().eq('id', dealId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true, deleted: dealId })
      }

      // For every other action we read the deal first, patch, and write back.
      if (!dealId) return NextResponse.json({ error: 'Missing dealId.' }, { status: 400 })
      const { data: row, error: readErr } = await sb2.from('deals').select('*').eq('id', dealId).single()
      if (readErr || !row) return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })
      const neg = row.negotiate || {}
      const log = Array.isArray(neg.adminLog) ? neg.adminLog : []
      const stamp = (what: string) => ([...log, { what, at: Date.now() }])
      let patch: any = {}
      let negPatch: any = {}
      let done = ''

      if (body.action === 'adminAddNote') {
        const text = String(body.note || '').trim()
        if (!text) return NextResponse.json({ error: 'Empty note.' }, { status: 400 })
        const notes = Array.isArray(neg.adminNotes) ? neg.adminNotes : []
        negPatch.adminNotes = [...notes, { text, at: Date.now() }]
        done = 'Note added'
      }
      else if (body.action === 'adminResetRole') {
        // Fix an inverted buyer/seller — set initiator_role explicitly.
        const role = body.role === 'seller' ? 'seller' : 'buyer'
        patch.initiator_role = role
        patch.invite_role = role === 'buyer' ? 'seller' : 'buyer'
        done = `Initiator role set to ${role}`
      }
      else if (body.action === 'adminResetDeposit') {
        // Clear a stuck deposit so both parties can re-confirm cleanly.
        delete neg.depositBuyerConfirmed; delete neg.depositSellerConfirmed
        delete neg.depositProof; delete neg.depositVerification
        negPatch = { ...neg, depositEnded: false, depositTimerWaived: false }
        done = 'Deposit confirmations reset'
      }
      else if (body.action === 'adminReopenDeal') {
        // Undo a finalize / cancel so the deal can move again.
        delete neg.dealFinalized; delete neg.canceled; delete neg.depositEnded
        negPatch = { ...neg }
        done = 'Deal reopened'
      }
      else if (body.action === 'adminClearJoin') {
        // Undo a bad auto-join (the party_b bug). Frees the invite slot.
        patch.other_party_id = null
        patch.invite_status = 'pending'
        done = 'Second party detached — invite slot reopened'
      }
      else if (body.action === 'adminResendInvite') {
        // Re-arm the invite so the notice can be re-sent from the app.
        patch.invite_status = 'pending'
        patch.invite_sent_at = new Date().toISOString()
        done = 'Invite re-armed (pending)'
      }
      else {
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
      }

      // Always append to the admin log so there's a record of every change.
      const finalNeg = Object.keys(negPatch).length ? negPatch : neg
      finalNeg.adminLog = stamp(done)
      patch.negotiate = finalNeg

      const { error: upErr } = await sb2.from('deals').update(patch).eq('id', dealId)
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
      return NextResponse.json({ ok: true, done, dealId })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 })
    }

    const sb = admin()
    // Note: invite_token is deliberately NOT selected — it would let anyone with
    // this page hijack a pending invite.
    const { data, error } = await sb
      .from('deals')
      .select('id, created_at, updated_at, vessel, parties, negotiate, dd_data, initiator_id, other_party_id, initiator_role, invite_role, invite_email, invite_status, max_step')
      .order('updated_at', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json({ error: 'Could not read deals: ' + error.message }, { status: 500 })
    }

    const rows = (data || []).map(assess)
    const live = rows.filter(r => !['Cancelled', 'Ended — no deposit', 'Vessel rejected'].includes(r.state))

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      totals: {
        all: rows.length,
        live: live.length,
        paid: rows.filter(r => r.paid).length,
        revenue: rows.filter(r => r.paid).length * 249,
        needsAttention: rows.filter(r => r.urgency >= 4).length,
        stale: live.filter(r => (r.idleDays ?? 0) >= 7).length,
      },
      deals: rows,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
