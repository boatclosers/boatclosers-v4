import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { validTwilioSignature } from '@/lib/comm'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Twilio delivery updates for each text (queued, sent, delivered, failed, undelivered).
const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')

export async function POST(req: Request) {
  const form = await req.formData()
  const params: Record<string, string> = {}
  form.forEach((v, k) => (params[k] = String(v)))
  const sig = req.headers.get('x-twilio-signature') || ''
  if (![`${SITE}/api/sms/status`, req.url].some((u) => validTwilioSignature(u, params, sig))) return new Response('Forbidden', { status: 403 })
  if (params.MessageSid) {
    const status = params.ErrorCode ? `${params.MessageStatus} ${params.ErrorCode}` : params.MessageStatus
    await supabaseAdmin.from('sms_log').update({ status }).eq('twilio_sid', params.MessageSid)
  }
  return new Response(null, { status: 204 })
}
