import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Creates a Stripe Checkout Session for the BoatClosers deal fee and returns the
// hosted-checkout URL. Card details never touch our app — Stripe collects them on
// their own page.
//
// SECURITY: the price is decided HERE, not by the browser. This route previously
// accepted `amountCents` from the caller and used it verbatim, with no sign-in
// required. Anyone could open a session for fifty cents against any deal id, pay
// it, and the verify route would then mark that deal paid. The fee is now a
// server constant, and the caller must be signed in and a party to the deal.
const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'
const FEE_FULL_CENTS = 24900   // $249.00
const FEE_HALF_CENTS = 12450   // $124.50 — each side of a split

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

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })
  }

  const userId = await getUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  }

  try {
    const { dealId, who, appUrl } = await req.json()
    if (!dealId) {
      return NextResponse.json({ error: 'No deal to pay for.' }, { status: 400 })
    }

    // The caller must actually be part of this deal.
    const { data: row } = await admin()
      .from('deals').select('id,status,paid,negotiate,initiator_id,other_party_id,party_a_user_id,party_b_user_id')
      .eq('id', dealId).maybeSingle()
    if (!row) {
      return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })
    }
    const isMember =
      row.initiator_id === userId || row.party_a_user_id === userId ||
      row.other_party_id === userId || row.party_b_user_id === userId
    if (!isMember) {
      return NextResponse.json({ error: 'Not your deal.' }, { status: 403 })
    }

    // Nothing to pay on a deal that is already paid, finalized or cancelled.
    const neg: any = row.negotiate || {}
    if (row.paid || neg.paid) {
      return NextResponse.json({ error: 'This deal is already paid.' }, { status: 409 })
    }
    if (row.status === 'finalized' || row.status === 'canceled' || neg.dealFinalized) {
      return NextResponse.json({ error: 'This deal is closed.' }, { status: 409 })
    }

    // The fee is ours to set. A split is only honoured when the deal itself says so.
    const split = neg.payPlan === 'split'
    const amount = split ? FEE_HALF_CENTS : FEE_FULL_CENTS
    const isHalf = amount < FEE_FULL_CENTS
    const payerRole = who === 'other' ? 'other' : 'initiator'

    const base = (appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://boatclosers.com').replace(/\/$/, '')

    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('line_items[0][price_data][currency]', 'usd')
    params.append('line_items[0][price_data][product_data][name]', isHalf ? 'BoatClosers deal fee (your half)' : 'BoatClosers deal fee')
    params.append('line_items[0][price_data][product_data][description]', 'One-time fee to lock your boat deal and unlock documents & closing.')
    params.append('line_items[0][price_data][unit_amount]', String(amount))
    params.append('line_items[0][quantity]', '1')
    params.append('success_url', `${base}/?stripe=success&session_id={CHECKOUT_SESSION_ID}`)
    params.append('cancel_url', `${base}/?stripe=cancel`)
    params.append('metadata[dealId]', String(dealId))
    params.append('metadata[who]', payerRole)
    params.append('metadata[userId]', userId)

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || 'Could not start checkout.' }, { status: 400 })
    }
    return NextResponse.json({ url: data.url })
  } catch (e) {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 })
  }
}
