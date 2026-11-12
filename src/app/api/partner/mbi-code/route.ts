import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Server to server, called only by My Boat Inspector. Redeems the walkthrough
// code a buyer got with the BoatClosers Express + My Boat Inspector bundle.
// Protected by the same shared key the owner dashboard already uses
// (MBI_ADMIN_KEY, set in both Vercel projects).
//   POST { code, boatId, redeem } -> { ok: true } when the code is valid (and,
//   with redeem: true, marks it used so it works only once).

function authorised(req: Request) {
  const expected = process.env.MBI_ADMIN_KEY || ''
  const given = req.headers.get('x-admin-key') || ''
  if (!expected || given.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i)
  return diff === 0
}

export async function POST(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  const body = await req.json().catch(() => ({} as any))
  const code = String(body?.code || '').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  if (!/^MBI-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) return NextResponse.json({ error: 'That code doesn’t look right.' }, { status: 400 })

  const { data: rows } = await supabaseAdmin
    .from('express_deals')
    .select('id,progress,status')
    .eq('status', 'paid')
    .filter('progress->>mbiCode', 'eq', code)
    .limit(1)
  const deal = rows?.[0]
  if (!deal) return NextResponse.json({ error: 'We couldn’t find that code.' }, { status: 404 })
  const p = deal.progress || {}
  if (p.mbiCodeUsed && p.mbiCodeBoat !== String(body?.boatId || '')) {
    return NextResponse.json({ error: 'That code has already been used.' }, { status: 409 })
  }
  if (body?.redeem === true && !p.mbiCodeUsed) {
    const progress = { ...p, mbiCodeUsed: true, mbiCodeBoat: String(body?.boatId || '').slice(0, 64), mbiCodeUsedAt: new Date().toISOString() }
    const { error } = await supabaseAdmin.from('express_deals').update({ progress }).eq('id', deal.id)
    if (error) return NextResponse.json({ error: 'Could not redeem the code. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
