import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { validTwilioSignature, optOut, optIn, normalizePhone } from '@/lib/comm'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Twilio calls this when someone texts the BoatClosers number.
// Set it in Twilio: Phone Numbers > your number > Messaging > "A message comes in"
//   https://www.boatclosers.com/api/sms/inbound   (HTTP POST)
//
// STOP / START keywords update opt-outs (Twilio also blocks texts to anyone who
// replied STOP). Any other reply is forwarded by email to the person whose
// message they're answering, such as a buyer who texted a seller questions.

const STOP = ['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit', 'revoke', 'optout']
const START = ['start', 'unstop']
const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
const twiml = () => new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { headers: { 'Content-Type': 'text/xml' } })

export async function POST(req: Request) {
  const form = await req.formData()
  const params: Record<string, string> = {}
  form.forEach((v, k) => (params[k] = String(v)))
  const sig = req.headers.get('x-twilio-signature') || ''
  const urls = [`${SITE}/api/sms/inbound`, req.url]
  if (!urls.some((u) => validTwilioSignature(u, params, sig))) return new Response('Forbidden', { status: 403 })

  const from = normalizePhone(params.From)
  const text = (params.Body || '').trim()
  const word = text.toLowerCase().replace(/[^a-z]/g, '')
  if (!from) return twiml()

  if (STOP.includes(word)) {
    await optOut(from, 'sms', 'reply-stop')
    return twiml()
  }
  if (START.includes(word)) {
    await optIn(from, 'sms')
    return twiml()
  }

  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: last } = await supabaseAdmin
    .from('sms_log')
    .select('forward_to,context')
    .eq('to_phone', from)
    .not('forward_to', 'is', null)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (last?.forward_to) {
    const shown = from.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3')
    await sendEmail({
      essential: true,
      to: last.forward_to,
      subject: `Text reply from ${shown}${last.context ? ` about ${last.context}` : ''}`,
      html: emailLayout(`
        <p style="font-size:15px;color:#08152e;line-height:1.6;">You got a text reply from <b>${esc(shown)}</b>${last.context ? ` about <b>${esc(last.context)}</b>` : ''}:</p>
        <div style="margin:14px 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:15px;color:#111;line-height:1.6;white-space:pre-wrap">${esc(text.slice(0, 1500))}</div>
        <p style="font-size:13px;color:#64748b;line-height:1.6;">To answer, text or call them at ${esc(shown)}.</p>
      `),
    })
  }
  return twiml()
}
