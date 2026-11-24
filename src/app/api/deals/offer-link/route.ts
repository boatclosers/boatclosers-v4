import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { callerId } from '@/lib/dealAuth'

export const dynamic = 'force-dynamic'

// Seller asks for a public "make an offer" link for their boat.
// Only the seller who started the deal can create it. One active link per deal:
// asking again returns the same link.

function makeCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(7)
  let s = ''
  for (let i = 0; i < 7; i++) s += chars[bytes[i] % chars.length]
  return s
}

export async function POST(req: Request) {
  const userId = await callerId(req)
  if (!userId) return NextResponse.json({ error: 'Please sign in again, then try.' }, { status: 401 })

  const { dealId } = await req.json().catch(() => ({}))
  if (!dealId) return NextResponse.json({ error: 'Missing deal.' }, { status: 400 })

  const { data: deal } = await supabaseAdmin
    .from('deals')
    .select('id, initiator_id, party_a_user_id, initiator_role, vessel')
    .eq('id', dealId)
    .maybeSingle()
  if (!deal) return NextResponse.json({ error: 'Deal not found.' }, { status: 404 })

  const initiatorId = deal.initiator_id || deal.party_a_user_id
  if (initiatorId !== userId || deal.initiator_role !== 'seller') {
    return NextResponse.json({ error: 'Only the seller who started this deal can create an offer link.' }, { status: 403 })
  }
  const v: any = deal.vessel || {}
  if (!v.year || !v.make || !v.model) {
    return NextResponse.json({ error: 'Add the boat’s year, make and model first.' }, { status: 400 })
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com'

  const { data: existing } = await supabaseAdmin
    .from('offer_links')
    .select('code')
    .eq('source_deal_id', deal.id)
    .eq('active', true)
    .maybeSingle()
  if (existing?.code) return NextResponse.json({ url: `${base}/offer/${existing.code}`, code: existing.code })

  for (let tries = 0; tries < 3; tries++) {
    const code = makeCode()
    const { error } = await supabaseAdmin
      .from('offer_links')
      .insert({ code, source_deal_id: deal.id, seller_id: userId })
    if (!error) return NextResponse.json({ url: `${base}/offer/${code}`, code })
    if (error.code !== '23505') {
      console.error('offer-link insert failed:', error)
      return NextResponse.json({ error: 'Could not create the link. Please try again.' }, { status: 500 })
    }
  }
  return NextResponse.json({ error: 'Could not create the link. Please try again.' }, { status: 500 })
}
