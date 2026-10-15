import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// BC Express deal access, by the private token in the buyer's link.
//   GET  ?token=...                    -> the deal (confirms payment with Stripe if needed)
//   POST { token, action: 'pay' }      -> a Stripe checkout URL for the $29.99 fee
//   POST { token, action: 'ids', ids } -> save the HIN / VIN / motor serial
// The fee is a server constant. Only express_deals is ever touched here.

const FEE_CENTS = 2999 // $29.99
const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')
const FIELDS = 'id,buyer_name,buyer_email,seller_name,items,price_cents,state,status,stripe_session_id,paid_at,progress,created_at'

function validToken(t: unknown): t is string {
  return typeof t === 'string' && /^[a-f0-9]{48}$/.test(t)
}

async function loadDeal(token: string) {
  const { data } = await supabaseAdmin.from('express_deals').select(FIELDS).eq('access_token', token).maybeSingle()
  return data as any
}

// Ask Stripe whether the stored checkout session was paid. This is the payment
// confirmation for Express: it runs every time the deal page loads, so a buyer
// who closed the tab after paying is still marked paid the next time they open
// their link.
async function confirmPayment(deal: any) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || deal.status !== 'unpaid' || !deal.stripe_session_id) return deal
  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(deal.stripe_session_id)}`,
      { headers: { Authorization: `Bearer ${key}` } }
    )
    const s = await res.json()
    if (res.ok && s.payment_status === 'paid' && s.metadata?.expressDealId === deal.id) {
      const paidAt = new Date().toISOString()
      await supabaseAdmin
        .from('express_deals')
        .update({ status: 'paid', paid_at: paidAt, updated_at: paidAt })
        .eq('id', deal.id)
        .eq('status', 'unpaid')
      return { ...deal, status: 'paid', paid_at: paidAt }
    }
  } catch (e) {
    console.error('express payment check failed:', e)
  }
  return deal
}

function publicView(deal: any) {
  const { id, stripe_session_id, ...rest } = deal
  return rest
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!validToken(token)) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  let deal = await loadDeal(token)
  if (!deal) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  deal = await confirmPayment(deal)
  return NextResponse.json({ deal: publicView(deal) })
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const token = body?.token
  if (!validToken(token)) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })

  let deal = await loadDeal(token)
  if (!deal) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })

  if (body?.action === 'ids') {
    // Save identification numbers the buyer adds or corrects. Free, any time.
    const ID_FIELD: Record<string, string> = { boat: 'hin', trailer: 'vin', motor: 'serial' }
    const items = { ...(deal.items || {}) }
    for (const [key, field] of Object.entries(ID_FIELD)) {
      const v = body?.ids?.[key]
      if (items[key] && typeof v === 'string') {
        items[key] = { ...items[key], [field]: v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20) }
      }
    }
    const { error } = await supabaseAdmin
      .from('express_deals')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', deal.id)
    if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
    return NextResponse.json({ items })
  }

  if (body?.action !== 'pay') return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })

  deal = await confirmPayment(deal)
  if (deal.status === 'paid') return NextResponse.json({ alreadyPaid: true })
  if (deal.status !== 'unpaid') return NextResponse.json({ error: 'This purchase is closed.' }, { status: 409 })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })

  const names = Object.values(deal.items || {}).map((i: any) => i.description).join(' + ')
  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('customer_email', deal.buyer_email)
  params.append('line_items[0][price_data][currency]', 'usd')
  params.append('line_items[0][price_data][product_data][name]', 'BC Express buyer toolkit')
  params.append('line_items[0][price_data][product_data][description]', names.slice(0, 300) || 'Private boat purchase')
  params.append('line_items[0][price_data][unit_amount]', String(FEE_CENTS))
  params.append('line_items[0][quantity]', '1')
  params.append('success_url', `${SITE}/express/deal/${token}?paid=1`)
  params.append('cancel_url', `${SITE}/express/deal/${token}`)
  params.append('metadata[kind]', 'express')
  params.append('metadata[expressDealId]', deal.id)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const s = await res.json()
  if (!res.ok) {
    console.error('express checkout failed:', s?.error?.message)
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 400 })
  }

  await supabaseAdmin
    .from('express_deals')
    .update({ stripe_session_id: s.id, updated_at: new Date().toISOString() })
    .eq('id', deal.id)

  return NextResponse.json({ url: s.url })
}
