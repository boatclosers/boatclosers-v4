import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'
function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// After Stripe redirects back, the app calls this with the session id. We ask
// Stripe whether the session was actually paid, then lock the deal server-side
// so it's authoritative regardless of client timing. Returns debug fields so we
// can see exactly what happened if a lock ever doesn't fire.
export async function GET(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return NextResponse.json({ paid: false, dbg: 'no-stripe-key' })
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('session_id')
    if (!sessionId) return NextResponse.json({ paid: false, dbg: 'no-session-id' })

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { 'Authorization': `Bearer ${key}` }
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ paid: false, dbg: 'stripe-fetch-failed' })

    const paid = data.payment_status === 'paid'
    const dealId = data?.metadata?.dealId || null
    const who = data?.metadata?.who || 'initiator'
    let dbg = `paid=${paid} dealId=${dealId ? 'yes' : 'MISSING'} who=${who}`

    if (paid && dealId) {
      try {
        const sb = admin()
        const { data: row } = await sb.from('deals').select('negotiate').eq('id', dealId).maybeSingle()
        const neg: any = row?.negotiate || {}
        const offers: any[] = Array.isArray(neg.offers) ? neg.offers : []
        // Find the offer to lock — try agreed/accepted, then a both-signed offer,
        // then the most recent active offer. Robust to status naming drift.
        const agreed =
          offers.find((o: any) => o && (o.status === 'agreed' || o.status === 'accepted')) ||
          offers.find((o: any) => o && o.paBuyerSig && o.paSellerSig) ||
          [...offers].reverse().find((o: any) => o && o.status !== 'rejected' && o.status !== 'countered' && o.status !== 'expired')

        const plan = neg.payPlan || agreed?.feePayer || 'full'
        const paidInitiator = who === 'initiator' ? true : !!neg.paidInitiator
        const paidOther = who === 'other' ? true : !!neg.paidOther
        const complete = plan === 'full' ? paidInitiator : plan === 'other' ? paidOther : (paidInitiator && paidOther)
        const today = new Date().toISOString().split('T')[0]

        dbg += ` offers=${offers.length} agreed=${agreed ? 'yes' : 'NONE'} plan=${plan} complete=${complete} wasLocked=${!!neg.dealLocked}`

        let newNeg: any = { ...neg, paidInitiator, paidOther, payPlan: plan }
        if (complete && agreed && !neg.dealLocked) {
          const lockedOffers = offers.map((o: any) => o && o.id === agreed.id ? { ...o, status: 'accepted', paDate: o.paDate || today } : o)
          newNeg = {
            ...newNeg,
            offers: lockedOffers,
            paid: true,
            dealLocked: true,
            dealStatus: 'locked',
            agreedPrice: agreed.amount,
            escrowPct: agreed.escrowPct,
            escrowPath: agreed.escrowPath,
            deposit: agreed.deposit,
            selectedContingencies: agreed.contingencies || neg.selectedContingencies || [],
            dueDiligenceDays: agreed.ddDays || neg.dueDiligenceDays,
          }
          dbg += ' => LOCKED'
        } else {
          dbg += ' => not-locked'
        }
        const { error: upErr } = await sb.from('deals').update({ negotiate: newNeg }).eq('id', dealId)
        if (upErr) dbg += ` updateErr=${upErr.message}`
      } catch (e: any) {
        dbg += ` exception=${e?.message || 'unknown'}`
      }
    }

    return NextResponse.json({ paid, dealId, who, dbg })
  } catch (e) {
    return NextResponse.json({ paid: false, dbg: 'outer-exception' })
  }
}
