// Server-only: how BoatClosers reaches people. Email (Resend) and text
// (Twilio), each person's channel choice, and opt-outs.
//
//   comm_prefs   email -> { phone, channels: ['email' | 'sms'] }
//   comm_optouts (address, channel): an email or E.164 phone that asked to stop
//   sms_log      every text sent, so a reply can be forwarded to the right person
//
// Texting turns on when these Vercel environment variables are set:
//   TWILIO_ACCOUNT_SID   (AC...)
//   TWILIO_AUTH_TOKEN    (needed to verify incoming texts; also used to send)
//   TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET   (optional: send with an API key instead)
//   TWILIO_MESSAGING_SERVICE_SID (MG...)  or  TWILIO_FROM (+15615551234)
// Until then, anyone who chose text gets email instead.

import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type Channel = 'email' | 'sms'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')

export function normalizeEmail(e: string | undefined | null) {
  return String(e || '').trim().toLowerCase()
}

// US numbers: "(561) 555-1234" -> "+15615551234". Returns '' if not usable.
export function normalizePhone(p: string | undefined | null): string {
  const raw = String(p || '').trim()
  const d = raw.replace(/\D/g, '')
  if (raw.startsWith('+') && d.length >= 10 && d.length <= 15) return `+${d}`
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return ''
}

export function cleanChannels(v: unknown): Channel[] {
  const arr = Array.isArray(v) ? v : []
  const out = (['email', 'sms'] as Channel[]).filter((c) => arr.includes(c))
  return out.length ? out : ['email']
}

export function smsConfigured() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const auth = process.env.TWILIO_AUTH_TOKEN || (process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET)
  const from = process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_FROM
  return !!(sid && auth && from)
}

// ---------- preferences ----------

export async function getPrefs(email: string): Promise<{ phone?: string; channels: Channel[] } | null> {
  const e = normalizeEmail(email)
  if (!e) return null
  try {
    const { data } = await supabaseAdmin.from('comm_prefs').select('phone,channels').eq('email', e).maybeSingle()
    if (!data) return null
    return { phone: data.phone || undefined, channels: cleanChannels(data.channels) }
  } catch {
    return null
  }
}

// setBy 'self' always wins. Someone else (the person who started a deal) can set
// how they want their invite delivered, but never overrides a choice the
// recipient made for themselves.
export async function setPrefs(email: string, phone: string | undefined, channels: Channel[], setBy: 'self' | 'initiator' = 'self') {
  const e = normalizeEmail(email)
  if (!e) return { ok: false }
  const p = normalizePhone(phone)
  const ch = cleanChannels(channels).filter((c) => c !== 'sms' || p)
  if (setBy !== 'self') {
    const { data: cur } = await supabaseAdmin.from('comm_prefs').select('set_by').eq('email', e).maybeSingle()
    if (cur?.set_by === 'self') return { ok: true, kept: true }
  }
  const { error } = await supabaseAdmin.from('comm_prefs').upsert({
    email: e,
    phone: p || null,
    channels: ch.length ? ch : ['email'],
    set_by: setBy,
    updated_at: new Date().toISOString(),
  })
  return { ok: !error }
}

// ---------- opt-outs ----------

export async function isOptedOut(address: string, channel: Channel) {
  const a = channel === 'email' ? normalizeEmail(address) : normalizePhone(address)
  if (!a) return false
  try {
    const { data } = await supabaseAdmin.from('comm_optouts').select('address').eq('address', a).eq('channel', channel).maybeSingle()
    return !!data
  } catch {
    return false
  }
}

export async function optOut(address: string, channel: Channel, source: string) {
  const a = channel === 'email' ? normalizeEmail(address) : normalizePhone(address)
  if (!a) return
  await supabaseAdmin.from('comm_optouts').upsert({ address: a, channel, source })
}

export async function optIn(address: string, channel: Channel) {
  const a = channel === 'email' ? normalizeEmail(address) : normalizePhone(address)
  if (!a) return
  await supabaseAdmin.from('comm_optouts').delete().eq('address', a).eq('channel', channel)
}

function secret() {
  return process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'boatclosers'
}

export function unsubscribeSig(email: string) {
  return crypto.createHmac('sha256', secret()).update(`unsub:${normalizeEmail(email)}`).digest('base64url').slice(0, 32)
}

export function verifyUnsubscribe(email: string, sig: string) {
  const want = unsubscribeSig(email)
  return sig.length === want.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))
}

export function unsubscribeUrl(email: string) {
  return `${SITE}/unsubscribe?e=${encodeURIComponent(normalizeEmail(email))}&s=${unsubscribeSig(email)}`
}

// ---------- texting ----------

export async function sendSms({ to, body, forwardTo, context }: { to: string; body: string; forwardTo?: string; context?: string }) {
  const phone = normalizePhone(to)
  if (!phone) return { success: false, error: 'No valid phone number.' }
  if (!smsConfigured()) return { success: false, error: 'Texting is not set up yet.', notConfigured: true }
  if (await isOptedOut(phone, 'sms')) return { success: false, error: 'This number has opted out of texts.', optedOut: true }

  const sid = process.env.TWILIO_ACCOUNT_SID!
  const user = process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET ? process.env.TWILIO_API_KEY_SID : sid
  const pass = process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET ? process.env.TWILIO_API_KEY_SECRET! : process.env.TWILIO_AUTH_TOKEN!
  const text = `${body.trim()}\n\nReply STOP to opt out.`.slice(0, 1500)

  const params = new URLSearchParams({ To: phone, Body: text })
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) params.set('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID)
  else params.set('From', process.env.TWILIO_FROM!)
  params.set('StatusCallback', `${SITE}/api/sms/status`)

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const j: any = await res.json().catch(() => ({}))
    await supabaseAdmin.from('sms_log').insert({
      to_phone: phone,
      body: text,
      forward_to: forwardTo ? normalizeEmail(forwardTo) : null,
      context: context || null,
      twilio_sid: j?.sid || null,
      status: res.ok ? j?.status || 'queued' : `error ${j?.code || res.status}`,
    })
    if (!res.ok) {
      console.error('Twilio send failed:', j?.code, j?.message)
      // 21610: the person replied STOP to this number at the carrier level.
      if (j?.code === 21610) await optOut(phone, 'sms', 'carrier-stop')
      return { success: false, error: j?.message || 'Text failed.' }
    }
    return { success: true }
  } catch (e: any) {
    console.error('sendSms error:', e?.message)
    return { success: false, error: e?.message || 'Text failed.' }
  }
}

// Twilio signs each webhook with the auth token: HMAC-SHA1 over the full URL
// followed by every POST parameter (sorted by name, name then value).
export function validTwilioSignature(url: string, params: Record<string, string>, signature: string) {
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!token || !signature) return false
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join('')
  const want = crypto.createHmac('sha1', token).update(Buffer.from(data, 'utf-8')).digest('base64')
  return want.length === signature.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(signature))
}

// A short text version of an email: the subject plus the first action link.
export function smsFromEmail(subject: string, html: string) {
  const links = Array.from(html.matchAll(/href="(https?:\/\/[^"]+)"/g)).map((m) => m[1].replace(/&amp;/g, '&'))
  const link = links.find((l) => !l.includes('/unsubscribe'))
  return `BoatClosers: ${subject}${link ? `\n${link}` : ''}`
}
