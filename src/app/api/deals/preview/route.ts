import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// READ-ONLY preview for someone holding an invite link.
// Returns ONLY: inviter first name, roles, boat year/make/model/length, asking price.
// Never returns emails, phones, addresses, HIN, registration, or any other party details.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = (searchParams.get('token') || '').trim()
    if (!token || token.length < 20) {
      return NextResponse.json({ error: 'Invalid invite link.' }, { status: 400 })
    }

    const sb = admin()
    const { data: deal, error } = await sb
      .from('deals')
      .select('initiator_id, initiator_role, invite_role, other_party_id, vessel, parties')
      .eq('invite_token', token)
      .maybeSingle()

    if (error || !deal) {
      return NextResponse.json({ error: 'Invite not found.' }, { status: 404 })
    }

    const vessel = (deal.vessel || {}) as Record<string, any>
    const parties = (deal.parties || {}) as Record<string, any>

    const initiatorRole = deal.initiator_role === 'seller' ? 'seller' : 'buyer'
    const inviteRole =
      deal.invite_role === 'seller' || deal.invite_role === 'buyer'
        ? deal.invite_role
        : (initiatorRole === 'buyer' ? 'seller' : 'buyer')

    // Inviter name: from the deal's party info first, then their profile as backup.
    let fullName = String(parties?.[initiatorRole]?.name || '').trim()
    if (!fullName && deal.initiator_id) {
      const { data: prof } = await sb
        .from('profiles')
        .select('full_name')
        .eq('id', deal.initiator_id)
        .maybeSingle()
      fullName = String(prof?.full_name || '').trim()
    }
    const inviterFirstName = fullName.split(/\s+/)[0] || ''

    const clean = (v: any) => String(v ?? '').trim()
    const boatTitle = [clean(vessel.year), clean(vessel.make), clean(vessel.model)]
      .filter(Boolean)
      .join(' ')
    const lengthFt = clean(vessel.loa).replace(/[^0-9.]/g, '')
    const priceNum = Number(String(vessel.askingPrice ?? '').replace(/[^0-9.]/g, ''))
    const askingPrice = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : null

    return NextResponse.json(
      {
        inviterFirstName,
        initiatorRole,
        inviteRole,
        boatTitle,
        lengthFt,
        askingPrice,
        alreadyJoined: !!deal.other_party_id
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    return NextResponse.json({ error: 'Could not load invite.' }, { status: 500 })
  }
}
