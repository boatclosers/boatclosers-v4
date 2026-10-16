import { NextResponse } from 'next/server'
import { verifyUnsubscribe, optOut, optIn, setPrefs, getPrefs, normalizeEmail, normalizePhone, type Channel } from '@/lib/comm'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// POST /api/unsubscribe?e=<email>&s=<signature>
//   One-click from Gmail / Apple Mail (form body "List-Unsubscribe=One-Click"): stop emails.
//   JSON { action } from the /unsubscribe page:
//     'stop-email'   no more emails
//     'stop-all'     no more emails or texts
//     'texts'        texts instead of emails, to { phone }
//     'resume'       start emails again
// The signature in every email link proves the request came from that inbox.

export async function POST(req: Request) {
  const url = new URL(req.url)
  const email = normalizeEmail(url.searchParams.get('e'))
  const sig = url.searchParams.get('s') || ''
  if (!email || !verifyUnsubscribe(email, sig)) return NextResponse.json({ error: 'This link is not valid.' }, { status: 403 })

  const type = req.headers.get('content-type') || ''
  if (!type.includes('application/json')) {
    await optOut(email, 'email', 'one-click')
    return NextResponse.json({ ok: true })
  }

  const body = await req.json().catch(() => ({}))
  const prefs = await getPrefs(email)
  switch (body?.action) {
    case 'stop-email':
      await optOut(email, 'email', 'unsubscribe-page')
      break
    case 'stop-all':
      await optOut(email, 'email', 'unsubscribe-page')
      if (prefs?.phone) await optOut(prefs.phone, 'sms', 'unsubscribe-page')
      await setPrefs(email, prefs?.phone, ['email'], 'self')
      break
    case 'texts': {
      const phone = normalizePhone(body?.phone) || prefs?.phone || ''
      if (!phone) return NextResponse.json({ error: 'Enter a mobile number.' }, { status: 400 })
      await optIn(phone, 'sms')
      await setPrefs(email, phone, ['sms'] as Channel[], 'self')
      break
    }
    case 'resume':
      await optIn(email, 'email')
      await setPrefs(email, prefs?.phone, (prefs?.channels?.includes('sms') ? ['email', 'sms'] : ['email']) as Channel[], 'self')
      break
    default:
      return NextResponse.json({ error: 'Unknown choice.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
