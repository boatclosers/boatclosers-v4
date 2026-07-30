import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Create an Escrow.com transaction for a deal ──────────────────────────────
//
// This lets the buyer create the real Escrow.com transaction straight from the
// app (Option 1 / Option 3 of the deposit flow) instead of setting it up by hand
// on escrow.com. It uses the same proven integration as the admin dashboard: HTTP
// Basic auth, POST /2017-09-01/transaction. On success it saves the returned
// transaction ID onto the deal (negotiate.escrowTxId) so the status route can then
// track it and auto-verify when funded.
//
// SAFETY: in sandbox it will only ever hit the sandbox API. Going live is purely a
// matter of the ESCROW_API_* env vars pointing at the live endpoint — no code change.

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(req: Request) {
  try {
    const base = process.env.ESCROW_API_BASE || 'https://api.escrow-sandbox.com'
    const email = process.env.ESCROW_API_EMAIL || ''
    const key = process.env.ESCROW_API_KEY || ''

    const body = await req.json().catch(() => ({}))
    const dealId = String(body?.dealId || '').trim()
    if (!dealId) {
      return NextResponse.json({ ok: false, error: 'Missing dealId.' }, { status: 400 })
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: 'Server not configured (Supabase).' }, { status: 500 })
    }
    if (!email || !key) {
      return NextResponse.json({ ok: false, configured: false, error: 'Escrow.com is not switched on yet.' }, { status: 200 })
    }

    const sb = admin()
    const { data: deal, error } = await sb
      .from('deals')
      .select('id, negotiate, parties')
      .eq('id', dealId)
      .single()

    if (error || !deal) {
      return NextResponse.json({ ok: false, error: 'Deal not found.' }, { status: 404 })
    }

    const neg = deal.negotiate || {}
    const parties = deal.parties || {}

    // Already has a transaction — don't create a duplicate; just return it.
    if (neg.escrowTxId) {
      return NextResponse.json({ ok: true, alreadyExists: true, transactionId: String(neg.escrowTxId) })
    }

    if (neg.escrowPath !== 'escrow_com') {
      return NextResponse.json({ ok: false, error: 'This deal is not set to use Escrow.com.' }, { status: 400 })
    }

    const depositAmount = Number(neg.deposit || 0)
    if (!depositAmount || depositAmount < 1) {
      return NextResponse.json({ ok: false, error: 'No deposit amount set on this deal.' }, { status: 400 })
    }

    const buyerEmail = parties?.buyer?.email || ''
    const sellerEmail = parties?.seller?.email || ''
    const vesselTitle = (deal as any)?.vessel?.title || 'Vessel earnest-money deposit'

    const auth = 'Basic ' + Buffer.from(`${email}:${key}`).toString('base64')
    const payload = {
      parties: [
        { role: 'buyer', customer: buyerEmail || 'me' },
        { role: 'seller', customer: sellerEmail || 'seller@test.escrow.com' },
      ],
      currency: 'usd',
      description: `BoatClosers earnest-money deposit — ${vesselTitle}`,
      items: [{
        title: 'Earnest money deposit',
        description: `Deposit for the purchase of ${vesselTitle}`,
        type: 'general_merchandise',
        inspection_period: 259200,
        quantity: 1,
        schedule: [{
          amount: depositAmount,
          payer_customer: buyerEmail || 'me',
          beneficiary_customer: sellerEmail || 'seller@test.escrow.com',
        }],
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
      return NextResponse.json({
        ok: false,
        error: `Escrow.com couldn't create the transaction (${r.status}).`,
        detail: (j ? JSON.stringify(j) : '').slice(0, 400),
      }, { status: 200 })
    }

    const newId = j?.id ? String(j.id) : ''
    if (!newId) {
      return NextResponse.json({ ok: false, error: 'Escrow.com accepted the request but returned no transaction ID.' }, { status: 200 })
    }

    // Save the transaction ID onto the deal so the status route can track it.
    const updatedNeg = { ...neg, escrowTxId: newId, escrowCreatedAt: Date.now() }
    await sb.from('deals').update({ negotiate: updatedNeg }).eq('id', dealId)

    const env = base.includes('sandbox') ? 'sandbox' : 'live'
    return NextResponse.json({ ok: true, created: true, transactionId: newId, env })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Could not reach Escrow.com: ' + (e?.message || 'unknown') }, { status: 200 })
  }
}
