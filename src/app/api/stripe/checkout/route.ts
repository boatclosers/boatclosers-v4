import { NextResponse } from 'next/server'

// Creates a Stripe Checkout Session for the BoatClosers deal fee (full $249 or a
// $124.50 split half) and returns the hosted-checkout URL. Card details never
// touch our app — Stripe collects them on their own secure page.
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })
  }
  try {
    const { dealId, amountCents, who, appUrl } = await req.json()

    const amount = Math.round(Number(amountCents) || 0)
    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 })
    }

    const base = (appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://boatclosers.com').replace(/\/$/, '')
    const isHalf = amount < 24900

    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('line_items[0][price_data][currency]', 'usd')
    params.append('line_items[0][price_data][product_data][name]', isHalf ? 'BoatClosers deal fee (your half)' : 'BoatClosers deal fee')
    params.append('line_items[0][price_data][product_data][description]', 'One-time fee to lock your boat deal and unlock documents & closing.')
    params.append('line_items[0][price_data][unit_amount]', String(amount))
    params.append('line_items[0][quantity]', '1')
    params.append('success_url', `${base}/?stripe=success&session_id={CHECKOUT_SESSION_ID}`)
    params.append('cancel_url', `${base}/?stripe=cancel`)
    params.append('metadata[dealId]', String(dealId || ''))
    params.append('metadata[who]', String(who || 'initiator'))

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
