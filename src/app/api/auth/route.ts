import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Verify the bearer token and return the authenticated user id, or null.
async function getUserId(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user.id
}

// GET — load this user's active deal (most recent).
export async function GET(req: Request) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('*')
      .eq('initiator_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) return NextResponse.json({ deal: null })
    return NextResponse.json({ deal: data && data.length ? data[0] : null })
  } catch (e) {
    return NextResponse.json({ deal: null })
  }
}

// POST — create or update this user's deal.
export async function POST(req: Request) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

    const body = await req.json()
    const { dealId, vessel, parties, negotiate, dd_data, docs_data, step, max_step } = body

    const payload: any = {
      vessel: vessel || {},
      parties: parties || {},
      negotiate: negotiate || {},
      dd_data: dd_data || {},
      docs_data: docs_data || {},
      step: typeof step === 'number' ? step : 0,
      max_step: typeof max_step === 'number' ? max_step : 0
    }

    if (dealId) {
      // Update existing deal (only if it belongs to this user).
      const { data, error } = await supabaseAdmin
        .from('deals')
        .update(payload)
        .eq('id', dealId)
        .eq('initiator_id', userId)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ deal: data })
    } else {
      // Look for an existing active deal first to avoid duplicates.
      const { data: existing } = await supabaseAdmin
        .from('deals')
        .select('id')
        .eq('initiator_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (existing && existing.length) {
        const { data, error } = await supabaseAdmin
          .from('deals')
          .update(payload)
          .eq('id', existing[0].id)
          .select()
          .single()
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ deal: data })
      }

      // Create a new deal.
      const role = (parties && parties.seller && parties.seller.name) ? 'seller' : 'buyer'
      const { data, error } = await supabaseAdmin
        .from('deals')
        .insert({
          initiator_id: userId,
          initiator_role: role,
          status: 'active',
          paid: false,
          ...payload
        })
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ deal: data })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
