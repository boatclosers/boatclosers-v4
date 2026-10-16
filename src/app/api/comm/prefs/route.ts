import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getPrefs, setPrefs, isOptedOut, optIn, cleanChannels, normalizePhone, smsConfigured } from '@/lib/comm'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// The signed-in person's own choice of how BoatClosers reaches them.
//   GET  -> { channels, phone, smsReady, emailOptedOut }
//   POST { channels: ['email'|'sms'], phone } -> saves it

async function userEmail(req: Request): Promise<string | null> {
  const h = req.headers.get('authorization') || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return null
  try {
    const { data } = await supabaseAdmin.auth.getUser(token)
    return data?.user?.email || null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const email = await userEmail(req)
  if (!email) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const p = await getPrefs(email)
  return NextResponse.json({
    channels: p?.channels || ['email'],
    phone: p?.phone || '',
    smsReady: smsConfigured(),
    emailOptedOut: await isOptedOut(email, 'email'),
  })
}

export async function POST(req: Request) {
  const email = await userEmail(req)
  if (!email) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const channels = cleanChannels(body?.channels)
  const phone = normalizePhone(body?.phone)
  if (channels.includes('sms') && !phone) return NextResponse.json({ error: 'Enter a mobile number for texts.' }, { status: 400 })
  // Choosing a channel here is an explicit opt back in to it.
  if (channels.includes('email')) await optIn(email, 'email')
  if (channels.includes('sms') && phone) await optIn(phone, 'sms')
  const r = await setPrefs(email, phone, channels, 'self')
  if (!r.ok) return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
  return NextResponse.json({ ok: true, channels, phone })
}
