import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { callerId } from '@/lib/dealAuth'
import { connectorUrl, hashToken, newToken } from '@/lib/aiLink'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// The signed-in person's private "connect your own AI" link.
//   GET    -> { on, lastUsed }
//   POST   -> { url }  (shown once; any older link stops working)
//   DELETE -> turns AI access off

const turnOff = (uid: string) =>
  supabaseAdmin.from('ai_links').update({ revoked_at: new Date().toISOString() }).eq('user_id', uid).is('revoked_at', null)

export async function GET(req: Request) {
  const uid = await callerId(req)
  if (!uid) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const { data, error } = await supabaseAdmin.from('ai_links').select('created_at, last_used_at').eq('user_id', uid).is('revoked_at', null).maybeSingle()
  if (error) return NextResponse.json({ on: false, lastUsed: null, unavailable: true })
  return NextResponse.json({ on: !!data, lastUsed: data?.last_used_at || null })
}

export async function POST(req: Request) {
  const uid = await callerId(req)
  if (!uid) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  await turnOff(uid)
  const token = newToken()
  const { error } = await supabaseAdmin.from('ai_links').insert({ user_id: uid, token_hash: hashToken(token) })
  if (error) return NextResponse.json({ error: "We couldn't make a link just now. Try again later." }, { status: 500 })
  return NextResponse.json({ url: connectorUrl(token) })
}

export async function DELETE(req: Request) {
  const uid = await callerId(req)
  if (!uid) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const { error } = await turnOff(uid)
  if (error) return NextResponse.json({ error: "That didn't work. Try again." }, { status: 500 })
  return NextResponse.json({ ok: true })
}
