import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ── Stripe webhook: server-side payment confirmation ─────────────────────────
//
// The app already records payment via the browser redirect (…/?stripe=success).
// This webhook is the safety net for when that redirect never happens — the
// customer pays, then closes the tab / loses signal / hits back before landing
// back on the app. Stripe fires `checkout.session.completed` to THIS endpoint
// regardless, so the deal still locks and the customer is never charged for a
// deal that stays stuck on "unpaid".
//
// It reads dealId + who from the session metadata (set in the checkout route),
// then writes the same paid/locked state the redirect path writes — so both
// routes converge on one outcome and neither double-charges or double-locks.
//
// SECURITY: every request is verified against STRIPE_WEBHOOK_SECRET using
// Stripe's signature scheme, so only genuine Stripe events are honored. An
// unsigned or mismatched request is rejected before any deal is touched.

export const runtime = 'nodejs'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Verify Stripe's signature header (t=timestamp,v1=signature) without pulling in
// the full Stripe SDK. HMAC-SHA256 of "timestamp.rawBody" with the endpoint secret.
function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): boolean {
  if (!sigHeader || !secret) return false
  const parts: Record<string, string> = {}
  for (const kv of sigHeader.split(',')) {
    const i = kv.indexOf('=')
    if (i > 0) parts[kv.slice(0, i)] = kv.slice(i + 1)
  }
  const t = parts['t']
  const v1 = parts['v1']
  if (!t || !v1) return false

  const signedPayload = `${t}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')

  // Constant-time compare.
  const a = Buffer.from(expected)
  const b = Buffer.from(v1)
  if (a.length !== b.length) return false
  if (!crypto.timingSafeEqual(a, b)) return false

  // Reject events older than 5 minutes (replay protection).
  const age = Math.floor(Date.now() / 1000) - Number(t)
  if (!Number.isFinite(age) || age > 300 || age < -300) return false

  return true
}

export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || ''
    // Stripe signs the RAW body — must read it as text, unparsed.
    const rawBody = await req.text()
    const sig = req.headers.get('stripe-signature') || ''

    if (!secret) {
      // Not configured yet. Return 200 so Stripe doesn't retry-storm and disable
      // the endpoint again; we simply no-op until the secret is set.
      return NextResponse.json({ received: true, note: 'webhook secret not set' }, { status: 200 })
    }

    if (!verifyStripeSignature(rawBody, sig, secret)) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Only care about a completed checkout that's actually paid.
    if (event?.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true, ignored: event?.type || 'unknown' }, { status: 200 })
    }

    const session = event?.data?.object || {}
    if (session?.payment_status && session.payment_status !== 'paid') {
      return NextResponse.json({ received: true, note: 'not paid yet' }, { status: 200 })
    }

    const dealId = session?.metadata?.dealId || ''
    const who = session?.metadata?.who || 'initiator'
    if (!dealId) {
      return NextResponse.json({ received: true, note: 'no dealId in metadata' }, { status: 200 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Can't record without DB access — 200 anyway so Stripe stops retrying, but
      // log-worthy. The redirect path will still catch most real cases.
      return NextResponse.json({ received: true, note: 'no service role key' }, { status: 200 })
    }

    const sb = admin()
    const { data: deal, error } = await sb
      .from('deals')
      .select('id, negotiate')
      .eq('id', dealId)
      .single()

    if (error || !deal) {
      return NextResponse.json({ received: true, note: 'deal not found' }, { status: 200 })
    }

    const neg: any = deal.negotiate || {}
    const offers: any[] = Array.isArray(neg.offers) ? neg.offers : []

    // The app releases Due Diligence, Documents and Closing off an offer whose
    // status is 'accepted'. Marking paid/dealLocked alone is NOT enough — a deal
    // can otherwise take the money and stay visibly stuck on "Pay $249".
    const alreadyAccepted = offers.some((o: any) => o && o.status === 'accepted')
    if ((neg.dealLocked || neg.paid) && alreadyAccepted) {
      // Fully recorded by the redirect path — nothing to do. Common, healthy case.
      return NextResponse.json({ received: true, note: 'already recorded' }, { status: 200 })
    }

    // Same agreed-offer resolution the redirect path uses, so both converge.
    const agreed =
      offers.find((o: any) => o && (o.status === 'agreed' || o.status === 'accepted')) ||
      offers.find((o: any) => o && o.paBuyerSig && o.paSellerSig) ||
      [...offers].reverse().find((o: any) => o && o.status !== 'rejected' && o.status !== 'countered' && o.status !== 'expired')

    const plan = neg.payPlan || agreed?.feePayer || 'full'
    const paidInitiator = who === 'initiator' ? true : !!neg.paidInitiator
    const paidOther = who === 'other' ? true : !!neg.paidOther
    const complete = plan === 'split' ? (paidInitiator && paidOther) : plan === 'other' ? paidOther : paidInitiator
    const today = new Date().toISOString().split('T')[0]

    let updated: any = { ...neg, paidInitiator, paidOther, payPlan: plan }

    if (complete) {
      const lockedOffers = agreed
        ? offers.map((o: any) => o && o.id === agreed.id ? { ...o, status: 'accepted', paDate: o.paDate || today } : o)
        : offers
      updated = {
        ...updated,
        offers: lockedOffers,
        paid: true,
        dealLocked: true,
        dealStatus: 'locked',
        ...(agreed ? {
          agreedPrice: agreed.amount, escrowPct: agreed.escrowPct, escrowPath: agreed.escrowPath,
          deposit: agreed.deposit, selectedContingencies: agreed.contingencies || neg.selectedContingencies || [],
          dueDiligenceDays: agreed.ddDays || neg.dueDiligenceDays,
        } : {}),
      }
    }

    updated.paidVia = 'stripe_webhook'
    updated.paidAt = updated.paidAt || Date.now()

    const { error: upErr } = await sb.from('deals').update({ negotiate: updated }).eq('id', dealId)
    if (upErr) {
      // Still 200: Stripe shouldn't retry forever on our DB hiccup, and the
      // redirect path remains a backstop.
      return NextResponse.json({ received: true, note: 'update failed', detail: upErr.message }, { status: 200 })
    }

    return NextResponse.json({ received: true, locked: !!complete, accepted: !!agreed, dealId }, { status: 200 })
  } catch (e: any) {
    // Return 200 to avoid Stripe disabling the endpoint over a transient error;
    // the redirect path still covers the customer.
    return NextResponse.json({ received: true, error: e?.message || 'unknown' }, { status: 200 })
  }
}
