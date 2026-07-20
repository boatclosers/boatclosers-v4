import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'
function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// After Stripe redirects back, the app calls this with the session id. We ask
// Stripe whether the session was actually paid — so nobody can fake the success
// URL to unlock a deal without paying. On a confirmed payment we ALSO lock the
// deal server-side, so the app always loads a locked deal on return regardless
// of any client-side timing/race. Returns the deal id + which side paid.
export async function GET(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return NextResponse.json({ paid: false })
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('session_id')
    if (!sessionId) return NextResponse.json({ paid: false })

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { 'Authorization': `Bearer ${key}` }
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ paid: false })

    const paid = data.payment_status === 'paid'
    const dealId = data?.metadata?.dealId || null
    const who = data?.metadata?.who || 'initiator'

    // ── Server-side lock: make the payment authoritative ──
    if (paid && dealId) {
      try {
        const sb = admin()
        const { data: row } = await sb.from('deals').select('negotiate').eq('id', dealId).maybeSingle()
        const neg: any = row?.negotiate || {}
        const offers: any[] = Array.isArray(neg.offers) ? neg.offers : []
        const agreed = offers.find((o: any) => o && o.status === 'agreed') || offers.find((o: any) => o && o.status === 'accepted')
        const plan = neg.payPlan || agreed?.feePayer || 'full'
        const paidInitiator = who === 'initiator' ? true : !!neg.paidInitiator
        const paidOther = who === 'other' ? true : !!neg.paidOther
        const complete = plan === 'full' ? paidInitiator : plan === 'other' ? paidOther : (paidInitiator && paidOther)
        const today = new Date().toISOString().split('T')[0]

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
        }
        await sb.from('deals').update({ negotiate: newNeg }).eq('id', dealId)
      } catch (e) {
        // Non-fatal: if the server lock fails, the client still attempts its own lock.
      }
    }

    return NextResponse.json({ paid, dealId, who })
  } catch (e) {
    return NextResponse.json({ paid: false })
  }
}
