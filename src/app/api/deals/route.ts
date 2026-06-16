import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function getUserId(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try {
    const { data, error } = await admin().auth.getUser(token)
    if (error || !data?.user) return null
    return data.user.id
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ deal: null })
  try {
    const { data } = await admin()
      .from('deals')
      .select('*')
      .or(`initiator_id.eq.${userId},party_b_user_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
    return NextResponse.json({ deal: data && data.length ? data[0] : null })
  } catch {
    return NextResponse.json({ deal: null })
  }
}

export async function POST(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Could not verify your session.' }, { status: 401 })

  try {
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
      const { data, error } = await admin()
        .from('deals').update(payload).eq('id', dealId)
        .or(`initiator_id.eq.${userId},party_b_user_id.eq.${userId}`)
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ deal: data })
    }

    const { data: existing } = await admin()
      .from('deals').select('id')
      .or(`initiator_id.eq.${userId},party_b_user_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false }).limit(1)

    if (existing && existing.length) {
      const { data, error } = await admin()
        .from('deals').update(payload).eq('id', existing[0].id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ deal: data })
    }

    const role = (parties && parties.seller && parties.seller.name) ? 'seller' : 'buyer'
    const { data, error } = await admin()
      .from('deals')
      .insert({ initiator_id: userId, party_a_user_id: userId, initiator_role: role, status: 'active', paid: false, ...payload })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ deal: data })
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
