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
  else if (depositDue && !instr) { state = 'Awaiting deposit info'; waitingOn = 'Seller'; urgency = 4; note = 'Paid, but the seller has not posted where to send the deposit.' }
  else if (depositDue && !proof) { state = 'Awaiting deposit';     waitingOn = 'Buyer'; urgency = 3; note = 'Instructions posted, buyer has not funded and signed the receipt.' }
  else if (depositDue && !verified) { state = 'Awaiting verification'; waitingOn = 'Seller'; urgency = 4; note = 'Buyer signed the receipt. Seller has not confirmed the funds arrived.' }
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
          message: funded
            ? `✓ Transaction #${txId} on Escrow.com (${envLabel}) is FUNDED — the deposit is really in escrow.`
            : `Transaction #${txId} exists on Escrow.com (${envLabel}) but is NOT funded yet (state: ${status || 'unknown'}).`,
        } })
      } catch (e: any) {
        return NextResponse.json({ escrow: { ok: false, message: 'Could not reach Escrow.com: ' + (e?.message || 'unknown') } })
      }
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
