import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { decodeHandoff, handoffAppName } from '@/lib/handoff'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Coming over from My Boat Inspector or My Boat Listing: starts a deal for the signed-in customer with the
// boat's details filled in (buyer or seller, as they were in the inspector).
//   POST { handoff } with the BoatClosers sign-in token -> { dealId }
// The same inspected boat opens the same deal if it's sent twice.
// Inspection findings are never copied in: the other party can see the vessel details, and a
// buyer's report stays private. A seller's report link comes over only if they shared it.

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

async function signedInUser(req: Request) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  const sb = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await sb.auth.getUser(token)
  return data?.user || null
}

const blankParty = { name: '', email: '', phone: '', address: '', city: '', stateZip: '' }

export async function POST(req: Request) {
  const user = await signedInUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })
  const body = await req.json().catch(() => ({} as any))
  const h = decodeHandoff(String(body?.handoff || ''))
  if (!h) return NextResponse.json({ error: 'That link from our other app isn’t valid.' }, { status: 400 })

  if (h.bid) {
    const { data: existing } = await supabaseAdmin
      .from('deals')
      .select('id')
      .eq('initiator_id', user.id)
      .eq('vessel->>fromInspector', h.bid)
      .limit(1)
      .maybeSingle()
    if (existing) return NextResponse.json({ dealId: existing.id })
  }

  const role = h.role === 'sell' ? 'seller' : 'buyer'
  const notes = [
    h.engine && `Engine: ${h.engine}`,
    role === 'seller' && h.report && `Inspection report (made by the owner with My Boat Inspector): ${h.report}`,
  ]
    .filter(Boolean)
    .join('\n')

  const vessel: any = {
    name: '', year: h.year, make: h.make, model: h.model, hin: h.hin,
    hullType: '', loa: h.length, beam: '',
    engineCount: '1', engineMake: '', engineModel: '', engineHours: h.hours, engineSerial: '',
    fuelType: 'Gasoline', regNumber: '', regState: '', uscgNumber: '',
    trailerIncluded: h.trailer === true ? 'yes' : 'no', trailerVin: '', trailerState: '',
    askingPrice: h.price ? String(Math.round(Number(h.price))) : '',
    location: '', description: notes,
    fromInspector: h.bid || h.src,
    fromApp: handoffAppName(h),
  }
  const me = { ...blankParty, name: String((user.user_metadata as any)?.name || ''), email: user.email || '' }
  const parties = role === 'seller' ? { seller: me, buyer: { ...blankParty } } : { buyer: me, seller: { ...blankParty } }

  const { data: deal, error } = await supabaseAdmin
    .from('deals')
    .insert({ vessel, parties, negotiate: {}, dd_data: {}, docs_data: {}, step: 1, max_step: 1, initiator_id: user.id, initiator_role: role, status: 'active', paid: false })
    .select('id')
    .single()
  if (error || !deal) return NextResponse.json({ error: 'Could not start your BoatClosers deal. Try again.' }, { status: 500 })
  return NextResponse.json({ dealId: deal.id })
}
