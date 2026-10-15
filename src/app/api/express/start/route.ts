import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

// BC Express: create a new one-party buyer deal (no account needed).
// The buyer's email gets a private link back into the deal. Payment happens
// next, through /api/express/deal (action "pay"), so there is one checkout path.
// Express deals live in their own table, never in public.deals, so the $249
// flow and its Stripe routes never see them.

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')

function clean(v: unknown, max = 120): string {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

function cleanId(v: unknown, max = 20): string {
  return typeof v === 'string' ? v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, max) : ''
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Spam trap: real people never fill the hidden "website" field.
  if (body?.website) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const buyerName = clean(body?.buyerName, 80)
  const buyerEmail = clean(body?.buyerEmail, 254).toLowerCase()
  const sellerName = clean(body?.sellerName, 120)
  const priceDollars = Number(String(body?.price ?? '').replace(/[^0-9.]/g, ''))
  const picked = body?.items || {}

  const items: Record<string, Record<string, string>> = {}
  if (picked.boat) {
    items.boat = { description: clean(picked.boat.description), hin: cleanId(picked.boat.hin, 16) }
    if (!items.boat.description) return NextResponse.json({ error: "Add the boat's year, make, and model." }, { status: 400 })
  }
  if (picked.trailer) {
    items.trailer = { description: clean(picked.trailer.description), vin: cleanId(picked.trailer.vin, 17) }
    if (!items.trailer.description) return NextResponse.json({ error: "Add the trailer's year and make." }, { status: 400 })
  }
  if (picked.motor) {
    items.motor = { description: clean(picked.motor.description), serial: cleanId(picked.motor.serial, 20) }
    if (!items.motor.description) return NextResponse.json({ error: "Add the motor's make, horsepower, and year." }, { status: 400 })
  }

  if (!Object.keys(items).length) return NextResponse.json({ error: 'Pick at least one item.' }, { status: 400 })
  if (!buyerName) return NextResponse.json({ error: 'Add your full name.' }, { status: 400 })
  if (!/^\S+@\S+\.\S+$/.test(buyerEmail)) return NextResponse.json({ error: 'Add a valid email address.' }, { status: 400 })
  if (!sellerName) return NextResponse.json({ error: "Add the seller's name." }, { status: 400 })
  if (!Number.isFinite(priceDollars) || priceDollars < 1 || priceDollars > 1000000) {
    return NextResponse.json({ error: 'Add the agreed price.' }, { status: 400 })
  }

  // Abuse limit: no more than 5 new deals per email address per hour.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('express_deals')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_email', buyerEmail)
    .gte('created_at', hourAgo)
  if ((count || 0) >= 5) {
    return NextResponse.json({ error: 'Too many new deals for this email. Check your inbox for your link.' }, { status: 429 })
  }

  const accessToken = crypto.randomBytes(24).toString('hex')

  const { error } = await supabaseAdmin.from('express_deals').insert({
    access_token: accessToken,
    buyer_email: buyerEmail,
    buyer_name: buyerName,
    seller_name: sellerName,
    items,
    price_cents: Math.round(priceDollars * 100),
    state: 'FL',
  })
  if (error) {
    console.error('express start insert failed:', error)
    return NextResponse.json({ error: 'Could not start your deal. Please try again.' }, { status: 500 })
  }

  // The private link back into the deal. Sent now, so the buyer can always get
  // back in, even if they close the tab during checkout.
  const link = `${SITE}/express/deal/${accessToken}`
  const list = Object.values(items).map((i) => `<li>${escapeHtml(i.description)}</li>`).join('')
  await sendEmail({
    to: buyerEmail,
    subject: 'Your BC Express purchase link',
    html: emailLayout(`
      <p style="font-size:15px;color:#08152e;">Hi ${escapeHtml(buyerName.split(' ')[0])},</p>
      <p style="font-size:15px;color:#08152e;line-height:1.6;">Here is your private link to your BC Express purchase:</p>
      <ul style="font-size:15px;color:#08152e;line-height:1.6;">${list}</ul>
      <p style="text-align:center;margin:28px 0;">
        <a href="${link}" style="background:#c9962e;color:#0f1b2d;padding:14px 28px;border-radius:4px;font-weight:700;text-decoration:none;display:inline-block;">Open my purchase</a>
      </p>
      <p style="font-size:13px;color:#64748b;line-height:1.6;">Keep this email. Anyone with this link can open your purchase, so don't forward it. If you haven't finished checkout yet, you can do it from the link.</p>
    `),
  })

  return NextResponse.json({ token: accessToken })
}
