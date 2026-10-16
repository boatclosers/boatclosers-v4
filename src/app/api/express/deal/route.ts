import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'
import { handoffProblems, type Handoff } from '@/lib/express/content'
import { buildDocument, docsFor, DOC_TITLES, type DocKey } from '@/lib/express/documents'
import { buildHsmv82050 } from '@/lib/express/hsmv82050'
import { inspectionFor, inspectionPreview, cleanInspection } from '@/lib/express/inspection'
import { SELLER_QUESTIONS } from '@/lib/express/content'
import { setPrefs, getPrefs, sendSms, normalizePhone, cleanChannels, smsConfigured, optIn, type Channel } from '@/lib/comm'
import crypto from 'crypto'

// Always read live data: never let Next.js cache database or upstream fetches here.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// BC Express deal access, by the private token in the buyer's link.
//   GET  ?token=...                    -> the deal (confirms payment with Stripe if needed)
//   POST { token, action: 'pay' }      -> a Stripe checkout URL for the $29.99 fee
//   POST { token, action: 'ids', ids } -> save the HIN / VIN / motor serial
//   POST { token, action: 'checks', checks } -> save checklist progress (free)
//   POST { token, action: 'answers', answers } -> save the seller's answers (free)
//   POST { token, action: 'inspection', inspection } -> save the walk-around inspection (paid only)
//   POST { token, action: 'handoff', handoff } -> save sale details (paid only)
//   POST { token, action: 'email-seller', channels, phone } -> send the seller their copies (paid only)
//   POST { token, action: 'ask-seller', email, phone, channels } -> send the seller the questions (free, 3 max)
//   POST { token, action: 'prefs', channels, phone } -> how the buyer wants reminders
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
    sellerPhone: normalizePhone(b?.sellerPhone) || undefined,
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
            <p style="font-size:15px;color:#08152e;line-height:1.6;">Payment received. Your guided inspection is unlocked: take it with you when you see the boat, and it builds a condition report as you go. When you're ready to buy, add the sale details and your bill of sale, state forms, and title application are filled in for you.</p>
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
  // The full inspection is part of what the buyer pays for; unpaid deals get a preview.
  const has = hasItems(deal)
  const inspection = deal.status === 'paid' ? { list: inspectionFor(has) } : { preview: inspectionPreview(has) }
  const p = await getPrefs(deal.buyer_email)
  const contact = { channels: p?.channels || ['email'], phone: p?.phone || '', smsReady: smsConfigured() }
  return NextResponse.json({ deal: publicView(deal), inspection, contact })
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

  if (body?.action === 'answers') {
    // The seller's answers to the buyer's questions: { [questionId]: text }. Free.
    const incoming = body?.answers && typeof body.answers === 'object' ? body.answers : {}
    const answers: Record<string, string> = { ...(deal.progress?.answers || {}) }
    for (const [k, v] of Object.entries(incoming)) {
      if (/^q-[a-z0-9-]{1,30}$/.test(k) && typeof v === 'string') answers[k] = v.slice(0, 1000)
    }
    if (Object.keys(answers).length > 30) return NextResponse.json({ error: 'Too many answers.' }, { status: 400 })
    const progress = { ...(deal.progress || {}), answers }
    const { error } = await supabaseAdmin
      .from('express_deals')
      .update({ progress, updated_at: new Date().toISOString() })
      .eq('id', deal.id)
    if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
    return NextResponse.json({ progress })
  }

  if (body?.action === 'prefs') {
    const channels = cleanChannels(body?.channels)
    const phone = normalizePhone(body?.phone)
    if (channels.includes('sms') && !phone) return NextResponse.json({ error: 'Enter your mobile number for texts.' }, { status: 400 })
    if (channels.includes('email')) await optIn(deal.buyer_email, 'email')
    if (phone && channels.includes('sms')) await optIn(phone, 'sms')
    const r = await setPrefs(deal.buyer_email, phone, channels, 'self')
    if (!r.ok) return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
    return NextResponse.json({ contact: { channels, phone, smsReady: smsConfigured() } })
  }

  if (body?.action === 'ask-seller') {
    // Send the seller questions for the buyer. Replies by email go straight to the
    // buyer; replies by text are forwarded to the buyer by email.
    const asked: string[] = Array.isArray(deal.progress?.asked) ? deal.progress.asked : []
    if (asked.length >= 3) return NextResponse.json({ error: 'Sent 3 times already. Follow up with the seller directly.' }, { status: 429 })
    const channels = cleanChannels(body?.channels)
    const email = /^\S+@\S+\.\S+$/.test(body?.email || '') ? String(body.email).trim().toLowerCase().slice(0, 254) : ''
    const phone = normalizePhone(body?.phone)
    if (channels.includes('email') && !email) return NextResponse.json({ error: "Enter the seller's email." }, { status: 400 })
    if (channels.includes('sms') && !phone) return NextResponse.json({ error: "Enter the seller's mobile number." }, { status: 400 })
    if (email && email === String(deal.buyer_email).toLowerCase()) return NextResponse.json({ error: "That's your own email. Enter the seller's." }, { status: 400 })

    const has = hasItems(deal)
    const qs = SELLER_QUESTIONS.filter((q) => !q.only || has[q.only])
    const first = Object.values(deal.items || {})[0] as any
    const boat = first?.description || 'boat'
    const buyerFirst = String(deal.buyer_name).split(' ')[0]
    const sellerFirst = String(deal.seller_name).split(' ')[0]
    const smsText =
      `BoatClosers: Hi ${sellerFirst}, ${buyerFirst} is interested in your ${boat} and has a few questions before coming to see it. ` +
      `Just reply to this text and we'll pass your answers to ${buyerFirst}.\n` +
      qs.map((q, i) => `${i + 1}. ${q.label}`).join('\n')

    let emailOk = false
    let textOk = false
    let textErr = ''
    if (email) {
      await setPrefs(email, phone, channels, 'initiator')
      const r: any = await sendEmail({
        to: email,
        replyTo: deal.buyer_email,
        subject: `${buyerFirst} has questions about your ${boat}`.slice(0, 150),
        smsText,
        smsForwardTo: deal.buyer_email,
        context: boat,
        html: emailLayout(`
          <p style="font-size:15px;color:#08152e;">Hi ${esc(sellerFirst)},</p>
          <p style="font-size:15px;color:#08152e;line-height:1.6;">${esc(deal.buyer_name)} is interested in your <b>${esc(boat)}</b> and would like to ask a few questions before coming to see it:</p>
          <ol style="font-size:15px;color:#08152e;line-height:1.7;padding-left:22px;">${qs.map((q) => `<li>${esc(q.label)}</li>`).join('')}</ol>
          <p style="font-size:15px;color:#08152e;line-height:1.6;"><b>Just reply to this email</b> and your answers go straight to ${esc(buyerFirst)}.</p>
          <p style="font-size:13px;color:#64748b;line-height:1.6;">${esc(buyerFirst)} is using BC Express by BoatClosers to buy carefully and do the paperwork right. You don’t need an account.</p>
        `),
      })
      emailOk = !!r.success && (channels.includes('email') || !r.sentSms)
      textOk = !!r.sentSms
      if (r.optedOut) return NextResponse.json({ error: 'The seller has opted out of BoatClosers messages. Contact them directly.' }, { status: 409 })
      if (channels.includes('email') && !r.success) return NextResponse.json({ error: 'The message did not send. Try again in a minute.' }, { status: 502 })
      if (channels.includes('sms') && !textOk) textErr = r.smsError || 'Texting isn’t set up yet, so we emailed them.'
    } else if (phone) {
      const r: any = await sendSms({ to: phone, body: smsText, forwardTo: deal.buyer_email, context: boat })
      textOk = r.success
      if (!r.success) return NextResponse.json({ error: r.optedOut ? 'The seller has opted out of texts.' : r.notConfigured ? 'Texting isn’t switched on yet. Send by email for now.' : r.error || 'The text did not send.' }, { status: r.optedOut ? 409 : 502 })
    }
    const progress = { ...(deal.progress || {}), asked: [...asked, new Date().toISOString()], contacts: { sellerEmail: email || undefined, sellerPhone: phone || undefined } }
    await supabaseAdmin.from('express_deals').update({ progress, updated_at: new Date().toISOString() }).eq('id', deal.id)
    return NextResponse.json({ progress, emailSent: emailOk && channels.includes('email'), textSent: textOk, textError: textErr || undefined })
  }

  if (body?.action === 'inspection') {
    deal = await confirmPayment(deal)
    if (deal.status !== 'paid') return NextResponse.json({ error: 'Unlock the inspection first.' }, { status: 402 })
    const inspection = cleanInspection(deal.progress?.inspection, body?.inspection)
    const progress = { ...(deal.progress || {}), inspection }
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
    const channels = cleanChannels(body?.channels || ['email'])
    const sellerPhone = normalizePhone(body?.phone) || h.sellerPhone || ''
    if (channels.includes('email') && !h.sellerEmail) return NextResponse.json({ error: "Add the seller's email first." }, { status: 400 })
    if (channels.includes('sms') && !sellerPhone) return NextResponse.json({ error: "Add the seller's mobile number first." }, { status: 400 })
    // A private link where the seller can view their papers, for texts (which can't carry attachments).
    const sellerToken: string = deal.progress?.sellerToken || crypto.randomBytes(24).toString('hex')
    const sellerLink = `${SITE}/express/seller/${sellerToken}`
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
    const smsText = `BoatClosers: ${deal.buyer_name} sent your copies of the paperwork for ${Object.values(deal.items || {}).map((i: any) => i.description).join(', ')}. View or download them here, then sign and file your notice of sale within 30 days: ${sellerLink}`
    if (!h.sellerEmail) {
      const t: any = await sendSms({ to: sellerPhone, body: smsText, forwardTo: deal.buyer_email, context: 'the sale paperwork' })
      if (!t.success) return NextResponse.json({ error: t.optedOut ? 'The seller has opted out of texts.' : t.notConfigured ? 'Texting isn’t switched on yet. Add the seller’s email instead.' : t.error || 'The text did not send.' }, { status: 502 })
      const progress = { ...(deal.progress || {}), sellerToken, sellerEmailed: [...sent, new Date().toISOString()] }
      await supabaseAdmin.from('express_deals').update({ progress }).eq('id', deal.id)
      return NextResponse.json({ progress, textSent: true })
    }
    await setPrefs(h.sellerEmail, sellerPhone, channels, 'initiator')
    const r: any = await sendEmail({
      to: h.sellerEmail,
      replyTo: deal.buyer_email,
      smsText,
      smsForwardTo: deal.buyer_email,
      context: 'the sale paperwork',
      subject: `Your copy of the bill of sale: ${Object.values(deal.items || {}).map((i: any) => i.description).join(', ')}`.slice(0, 150),
      html: emailLayout(`
        <p style="font-size:15px;color:#08152e;">Hello ${esc(String(deal.seller_name).split(' ')[0])},</p>
        <p style="font-size:15px;color:#08152e;line-height:1.6;">${esc(deal.buyer_name)} sent you your copies of the paperwork for the sale of: ${what}. They're attached.</p>
        <p style="font-size:15px;color:#08152e;line-height:1.6;"><b>One thing left for you:</b> ${hasNotice ? 'your notice of sale (Florida form HSMV 82050) is attached, already filled in. Sign it and' : 'complete the notice of sale on the back of the Florida title or on form HSMV 82050, then'} file it with any county tax collector within 30 days. That takes the boat out of your name.</p>
        <p style="font-size:15px;color:#08152e;line-height:1.6;">You can also <a href="${sellerLink}" style="color:#b8863a;font-weight:700;">view or download your papers here</a> any time.</p>
        <p style="font-size:13px;color:#64748b;line-height:1.6;">You don't need an account or anything else from BoatClosers. Reply to this email to reach the buyer.</p>
      `),
      attachments,
    })
    if (r.optedOut) return NextResponse.json({ error: 'The seller has opted out of BoatClosers messages. Give them their copies in person.' }, { status: 409 })
    if (!r.success) return NextResponse.json({ error: 'The email did not send. Try again in a minute.' }, { status: 502 })
    const progress = { ...(deal.progress || {}), sellerToken, sellerEmailed: [...sent, new Date().toISOString()] }
    await supabaseAdmin.from('express_deals').update({ progress }).eq('id', deal.id)
    return NextResponse.json({ progress, textSent: !!r.sentSms, textError: channels.includes('sms') && !r.sentSms ? r.smsError || 'Texting isn’t set up yet, so we emailed them.' : undefined })
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
