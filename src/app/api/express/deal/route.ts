import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'
import { handoffProblems, type Handoff } from '@/lib/express/content'
import { buildDocument, docsFor, DOC_TITLES, type DocKey } from '@/lib/express/documents'
import { buildHsmv82050 } from '@/lib/express/hsmv82050'

// Always read live data: never let Next.js cache database or upstream fetches here.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// BC Express deal access, by the private token in the buyer's link.
//   GET  ?token=...                    -> the deal (confirms payment with Stripe if needed)
//   POST { token, action: 'pay' }      -> a Stripe checkout URL for the $29.99 fee
//   POST { token, action: 'ids', ids } -> save the HIN / VIN / motor serial
//   POST { token, action: 'checks', checks } -> save checklist progress (free)
//   POST { token, action: 'handoff', handoff } -> save sale details (paid only)
//   POST { token, action: 'email-seller' } -> email the seller their copies (paid only)
// The fee is a server constant. Only express_deals is ever touched here.

const FEE_CENTS = 2999 // $29.99
const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')
const FIELDS = 'id,access_token,buyer_name,buyer_email,seller_name,items,price_cents,state,status,stripe_session_id,paid_at,progress,created_at'

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.replace(/\s+/g, ' ').trim().slice(0, max)
  return t || undefined
}

function pick<T extends string>(v: unknown, allowed: readonly T[]): T | undefined {
  return allowed.includes(v as T) ? (v as T) : undefined
}

function cleanHandoff(b: any): Handoff {
  return {
    saleDate: /^\d{4}-\d{2}-\d{2}$/.test(b?.saleDate || '') ? b.saleDate : undefined,
    county: str(b?.county, 40),
    buyerAddress: str(b?.buyerAddress, 200),
    sellerAddress: str(b?.sellerAddress, 200),
    sellerEmail: /^\S+@\S+\.\S+$/.test(b?.sellerEmail || '') ? str(b.sellerEmail, 254)?.toLowerCase() : undefined,
    paymentMethod: str(b?.paymentMethod, 40),
    inventory: str(b?.inventory, 600),
    titledHow: pick(b?.titledHow, ['florida', 'documented', 'other-title', 'other-no-title'] as const),
    titleNumber: str(b?.titleNumber, 30),
    registrationNumber: str(b?.registrationNumber, 30),
    officialNumber: str(b?.officialNumber, 30),
    twoSellers: b?.twoSellers === true,
    secondSeller: str(b?.secondSeller, 120),
    lien: pick(b?.lien, ['none', 'released', 'open'] as const),
    lengthFt: str(b?.lengthFt, 10),
    hull: str(b?.hull, 30),
    propulsion: str(b?.propulsion, 40),
    fuel: str(b?.fuel, 20),
  }
}

function hasItems(deal: any) {
  return { boat: !!deal.items?.boat, trailer: !!deal.items?.trailer, motor: !!deal.items?.motor }
}

// Papers can be produced only when the deal is paid, the sale details are
// complete, and no unreleased lien is on the title.
function docsReady(deal: any): { ok: boolean; reason?: string } {
  if (deal.status !== 'paid') return { ok: false, reason: 'Unlock the paperwork first.' }
  const h: Handoff = deal.progress?.handoff || {}
  if (h.lien === 'open') return { ok: false, reason: 'A lien on the title has to be released before the sale.' }
  const p = handoffProblems(h, hasItems(deal))
  if (p.length) return { ok: false, reason: p[0] }
  return { ok: true }
}

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
      const { data: flipped } = await supabaseAdmin
        .from('express_deals')
        .update({ status: 'paid', paid_at: paidAt, updated_at: paidAt })
        .eq('id', deal.id)
        .eq('status', 'unpaid')
        .select('id')
      // Only the request that actually flipped the deal to paid sends the email.
      if (flipped && flipped.length) {
        await sendEmail({
          to: deal.buyer_email,
          subject: 'Your BC Express paperwork is unlocked',
          html: emailLayout(`
            <p style="font-size:15px;color:#08152e;">Hi ${esc(String(deal.buyer_name).split(' ')[0])},</p>
            <p style="font-size:15px;color:#08152e;line-height:1.6;">Payment received. Your bill of sale, title signing guide, and title worksheet are ready. Add the sale details and your papers are filled in for you.</p>
            <p style="text-align:center;margin:28px 0;"><a href="${SITE}/express/deal/${deal.access_token}" style="background:#c9962e;color:#0f1b2d;padding:14px 28px;border-radius:4px;font-weight:700;text-decoration:none;display:inline-block;">Open my purchase</a></p>
          `),
        })
      }
      return { ...deal, status: 'paid', paid_at: paidAt }
    }
  } catch (e) {
    console.error('express payment check failed:', e)
  }
  return deal
}

function publicView(deal: any) {
  const { id, stripe_session_id, access_token, ...rest } = deal
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

  if (body?.action === 'checks') {
    // Checklist progress: { [checkId]: boolean }. Free, any time.
    const incoming = body?.checks && typeof body.checks === 'object' ? body.checks : {}
    const checks: Record<string, boolean> = { ...(deal.progress?.checks || {}) }
    for (const [k, v] of Object.entries(incoming)) {
      if (/^[a-z0-9-]{1,40}$/.test(k) && typeof v === 'boolean') checks[k] = v
    }
    if (Object.keys(checks).length > 200) return NextResponse.json({ error: 'Too many items.' }, { status: 400 })
    const progress = { ...(deal.progress || {}), checks }
    const { error } = await supabaseAdmin
      .from('express_deals')
      .update({ progress, updated_at: new Date().toISOString() })
      .eq('id', deal.id)
    if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
    return NextResponse.json({ progress })
  }

  if (body?.action === 'handoff') {
    deal = await confirmPayment(deal)
    if (deal.status !== 'paid') return NextResponse.json({ error: 'Unlock the paperwork first.' }, { status: 402 })
    const progress = { ...(deal.progress || {}), handoff: cleanHandoff(body?.handoff) }
    const { error } = await supabaseAdmin
      .from('express_deals')
      .update({ progress, updated_at: new Date().toISOString() })
      .eq('id', deal.id)
    if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
    return NextResponse.json({ progress })
  }

  if (body?.action === 'email-seller') {
    deal = await confirmPayment(deal)
    const ready = docsReady(deal)
    if (!ready.ok) return NextResponse.json({ error: ready.reason }, { status: 409 })
    const h: Handoff = deal.progress?.handoff || {}
    if (!h.sellerEmail) return NextResponse.json({ error: "Add the seller's email first." }, { status: 400 })
    const sent: string[] = Array.isArray(deal.progress?.sellerEmailed) ? deal.progress.sellerEmailed : []
    if (sent.length >= 3) return NextResponse.json({ error: 'Already sent 3 times. Forward your own copy instead.' }, { status: 429 })

    const keys = docsFor(deal.items).filter((k) => k.endsWith('bill-of-sale') || k === 'payment-receipt') as DocKey[]
    const attachments = await Promise.all(
      keys.map(async (k) => ({
        filename: `${k}.pdf`,
        content: Buffer.from(await buildDocument(k, deal)).toString('base64'),
      }))
    )
    // The seller's notice of sale on the official state form, already filled in.
    for (const item of ['boat', 'trailer'] as const) {
      if (!deal.items?.[item]) continue
      try {
        const bytes = await buildHsmv82050(deal, item, ['notice'])
        attachments.push({ filename: `notice-of-sale-hsmv-82050-${item}.pdf`, content: Buffer.from(bytes).toString('base64') })
      } catch (e) {
        console.error('HSMV 82050 fill failed:', e)
      }
    }
    const hasNotice = attachments.some((a) => a.filename.startsWith('notice-of-sale'))
    const what = Object.values(deal.items || {}).map((i: any) => esc(i.description)).join(', ')
    const r = await sendEmail({
      to: h.sellerEmail,
      replyTo: deal.buyer_email,
      subject: `Your copy of the bill of sale: ${Object.values(deal.items || {}).map((i: any) => i.description).join(', ')}`.slice(0, 150),
      html: emailLayout(`
        <p style="font-size:15px;color:#08152e;">Hello ${esc(String(deal.seller_name).split(' ')[0])},</p>
        <p style="font-size:15px;color:#08152e;line-height:1.6;">${esc(deal.buyer_name)} sent you your copies of the paperwork for the sale of: ${what}. They're attached.</p>
        <p style="font-size:15px;color:#08152e;line-height:1.6;"><b>One thing left for you:</b> ${hasNotice ? 'your notice of sale (Florida form HSMV 82050) is attached, already filled in. Sign it and' : 'complete the notice of sale on the back of the Florida title or on form HSMV 82050, then'} file it with any county tax collector within 30 days. That takes the boat out of your name.</p>
        <p style="font-size:13px;color:#64748b;line-height:1.6;">You don't need an account or anything else from BoatClosers. Reply to this email to reach the buyer.</p>
      `),
      attachments,
    })
    if (!r.success) return NextResponse.json({ error: 'The email did not send. Try again in a minute.' }, { status: 502 })
    const progress = { ...(deal.progress || {}), sellerEmailed: [...sent, new Date().toISOString()] }
    await supabaseAdmin.from('express_deals').update({ progress }).eq('id', deal.id)
    return NextResponse.json({ progress })
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
