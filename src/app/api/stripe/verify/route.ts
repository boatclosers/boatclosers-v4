import { NextResponse } from 'next/server'

// After Stripe redirects back, the app calls this with the session id. We ask
// Stripe whether the session was actually paid — so nobody can fake the success
// URL to unlock a deal without paying. Returns the deal id + which side paid.
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
    return NextResponse.json({
      paid,
      dealId: data?.metadata?.dealId || null,
      who: data?.metadata?.who || 'initiator'
    })
  } catch (e) {
    return NextResponse.json({ paid: false })
  }
}
