import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'
import { isSpamTrap } from '@/lib/spamTrap'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// A buyer on /offer/[code] enters their name and email to make an offer.
// We give them their OWN new deal with the seller: the boat and the seller's
// details are copied from the seller's deal, the buyer is invited by their real
// email, and they land on the normal invite page (/invite/<token>), which opens
// the deal for them without a password.
//
// Limits: a buyer who comes back with the same email gets the same deal again
// (no duplicates), and one link can start at most MAX_PER_DAY new deals a day.

const MAX_PER_DAY = 25

function shortCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(6)
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[bytes[i] % chars.length]
  return 'BOAT-' + s
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const BASE = () => process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com'

function boatName(vessel: any) {
  const v = vessel || {}
  return [v.year, v.make, v.model].filter(Boolean).join(' ') || 'the boat'
}

// The buyer's own link back to their offer. Sent every time, so a returning
// buyer can always get back in from their inbox.
async function emailBuyer(email: string, boat: string, token: string) {
  const url = `${BASE()}/invite/${token}`
  const r = await sendEmail({
    to: email,
    subject: `Your offer on the ${boat}`,
    smsText: `BoatClosers: your offer on the ${boat}: ${url}`,
    context: boat,
    html: emailLayout(`
      <h2 style="color:#08152e; font-size:19px; margin:0 0 8px;">Your deal room is ready</h2>
      <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
        You started an offer on the <strong>${esc(boat)}</strong>. Use the button below any time to get back to it:
        make your offer, message the seller, and see every counter in one place.
      </p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="${url}" style="background:#b8863a; color:#08152e; padding:13px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">Open your offer &rarr;</a>
      </p>
      <p style="color:#94a3b8; font-size:12px; line-height:1.5;">Didn't start an offer? You can ignore this email.</p>
    `),
  })
  if (!r.success) console.error('offer start: buyer email not sent', r.error)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  if (isSpamTrap(body.website)) return NextResponse.json({ error: 'Please try again.' }, { status: 400 }) // spam trap

  const code = String(body.code || '').trim().toUpperCase()
  const name = String(body.name || '').trim().slice(0, 120)
  const email = String(body.email || '').trim().toLowerCase()
  if (!/^[A-Z0-9]{5,12}$/.test(code)) return NextResponse.json({ error: 'This offer link is not valid.' }, { status: 400 })
  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  }

  const { data: link } = await supabaseAdmin
    .from('offer_links')
    .select('code, source_deal_id, seller_id, active')
    .eq('code', code)
    .maybeSingle()
  if (!link || !link.active) return NextResponse.json({ error: 'This boat is no longer taking offers through this link.' }, { status: 404 })

  // Same buyer again: never hand the existing deal to whoever typed the email.
  // Email the link to that address instead, so only its owner can get back in.
  const { data: prior } = await supabaseAdmin
    .from('offer_link_starts')
    .select('deal_id')
    .eq('code', code)
    .ilike('buyer_email', email)
    .maybeSingle()
  if (prior?.deal_id) {
    const { data: d } = await supabaseAdmin.from('deals').select('invite_token, vessel').eq('id', prior.deal_id).maybeSingle()
    if (d?.invite_token) {
      await emailBuyer(email, boatName(d.vessel), d.invite_token)
      return NextResponse.json({ emailed: true })
    }
  }

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('offer_link_starts')
    .select('id', { count: 'exact', head: true })
    .eq('code', code)
    .gte('created_at', since)
  if ((count || 0) >= MAX_PER_DAY) {
    return NextResponse.json({ error: 'This boat has had a lot of offers today. Please try again tomorrow.' }, { status: 429 })
  }

  const { data: src } = await supabaseAdmin
    .from('deals')
    .select('id, initiator_id, initiator_role, vessel, parties, status')
    .eq('id', link.source_deal_id)
    .maybeSingle()
  if (!src || src.initiator_role !== 'seller' || src.initiator_id !== link.seller_id) {
    return NextResponse.json({ error: 'This boat is no longer taking offers through this link.' }, { status: 404 })
  }

  const seller = (src.parties as any)?.seller || {}
  if (String(seller.email || '').toLowerCase() === email) {
    return NextResponse.json({ error: 'That’s the seller’s email. Use your own email to make an offer.' }, { status: 400 })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const now = new Date().toISOString()
  const { data: created, error: insErr } = await supabaseAdmin
    .from('deals')
    .insert({
      vessel: src.vessel,
      parties: { seller, buyer: { name, email } },
      negotiate: {},
      dd_data: {},
      docs_data: {},
      step: 1,
      max_step: 1,
      initiator_id: src.initiator_id,
      party_a_user_id: src.initiator_id,
      initiator_role: 'seller',
      status: 'active',
      paid: false,
      invite_token: token,
      invite_short_code: shortCode(),
      invite_email: email,
      invite_role: 'buyer',
      invite_status: 'pending',
      invite_sent_at: now,
    })
    .select('id')
    .single()
  if (insErr || !created) {
    console.error('offer start: deal insert failed', insErr)
    return NextResponse.json({ error: 'Could not start your offer. Please try again.' }, { status: 500 })
  }

  const { error: logErr } = await supabaseAdmin
    .from('offer_link_starts')
    .insert({ code, deal_id: created.id, buyer_email: email })
  if (logErr) console.error('offer start: log insert failed', logErr)

  // Tell the seller a buyer started an offer.
  const boat = boatName(src.vessel)
  await emailBuyer(email, boat, token)
  let sellerEmail = String(seller.email || '').trim()
  if (!sellerEmail) {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(src.initiator_id)
    sellerEmail = u?.user?.email || ''
  }
  if (sellerEmail) {
    const base = BASE()
    const r = await sendEmail({
      to: sellerEmail,
      subject: `${name} wants to make an offer on your ${boat}`,
      smsText: `BoatClosers: ${name} started an offer on your ${boat} from your offer link. Open BoatClosers to see it: ${base}`,
      context: boat,
      html: emailLayout(`
        <h2 style="color:#08152e; font-size:19px; margin:0 0 8px;">A buyer started an offer</h2>
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
          <strong>${esc(name)}</strong> (${esc(email)}) used your offer link to start a deal on your
          <strong>${esc(boat)}</strong>. They have their own deal room with you, with your boat details already filled in.
        </p>
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
          When they send their offer, you'll get another email. You'll find it under <strong>My deals</strong>.
        </p>
        <p style="text-align:center; margin: 24px 0;">
          <a href="${base}" style="background:#b8863a; color:#08152e; padding:13px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">Open BoatClosers &rarr;</a>
        </p>
      `),
    })
    if (!r.success) console.error('offer start: seller email not sent', r.error)
  }

  return NextResponse.json({ url: `/invite/${token}` })
}
