import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'
function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Robustly pull session_id from the request URL (new URL() can throw on some
// Vercel runtimes, so fall back to a regex).
function getSessionId(reqUrl: string): string | null {
  try {
    return new URL(reqUrl).searchParams.get('session_id')
  } catch {
    const m = reqUrl.match(/[?&]session_id=([^&]+)/)
    return m ? decodeURIComponent(m[1]) : null
  }
}

export async function GET(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return NextResponse.json({ paid: false, dbg: 'no-stripe-key' })

  const sessionId = getSessionId(req.url)
  if (!sessionId) return NextResponse.json({ paid: false, dbg: 'no-session-id' })

  // 1. Confirm the payment with Stripe.
  let paid = false, dealId: string | null = null, who = 'initiator'
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { 'Authorization': `Bearer ${key}` }
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ paid: false, dbg: 'stripe-not-ok: ' + (data?.error?.message || res.status) })
    paid = data.payment_status === 'paid'
    dealId = data?.metadata?.dealId || null
    who = data?.metadata?.who || 'initiator'
  } catch (e: any) {
    return NextResponse.json({ paid: false, dbg: 'stripe-fetch-threw: ' + (e?.message || String(e)) })
  }

  let dbg = `paid=${paid} dealId=${dealId ? 'yes' : 'MISSING'} who=${who}`

  // 2. On a confirmed payment, lock the deal so the app releases to BOTH parties.
  if (paid && dealId) {
    try {
      const sb = admin()
      const { data: row, error: readErr } = await sb.from('deals').select('negotiate').eq('id', dealId).maybeSingle()
      if (readErr) return NextResponse.json({ paid, dealId, who, dbg: dbg + ' readErr=' + readErr.message })
      const neg: any = row?.negotiate || {}
      const offers: any[] = Array.isArray(neg.offers) ? neg.offers : []
      const agreed =
        offers.find((o: any) => o && (o.status === 'agreed' || o.status === 'accepted')) ||
        offers.find((o: any) => o && o.paBuyerSig && o.paSellerSig) ||
        [...offers].reverse().find((o: any) => o && o.status !== 'rejected' && o.status !== 'countered' && o.status !== 'expired')

      const plan = neg.payPlan || agreed?.feePayer || 'full'
      const paidInitiator = who === 'initiator' ? true : !!neg.paidInitiator
      const paidOther = who === 'other' ? true : !!neg.paidOther
      const complete = plan === 'split' ? (paidInitiator && paidOther) : plan === 'other' ? paidOther : paidInitiator
      const today = new Date().toISOString().split('T')[0]

      dbg += ` offers=${offers.length} agreed=${agreed ? 'yes' : 'NONE'} plan=${plan} complete=${complete} wasLocked=${!!neg.dealLocked}`

      let newNeg: any = { ...neg, paidInitiator, paidOther, payPlan: plan }
      if (complete && !neg.dealLocked) {
        const lockedOffers = agreed
          ? offers.map((o: any) => o && o.id === agreed.id ? { ...o, status: 'accepted', paDate: o.paDate || today } : o)
          : offers
        newNeg = {
          ...newNeg,
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
        dbg += ' => LOCKED'
      } else {
        dbg += complete ? ' => already-locked' : ' => half-paid'
      }

      const { error: upErr } = await sb.from('deals').update({ negotiate: newNeg }).eq('id', dealId)
      if (upErr) dbg += ' updateErr=' + upErr.message
    } catch (e: any) {
      dbg += ' lock-threw: ' + (e?.message || String(e))
    }
  }

  return NextResponse.json({ paid, dealId, who, dbg })
}
