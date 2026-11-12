import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Moving up from BoatClosers Express to full BoatClosers. Creates a full deal
// for the signed-in buyer with everything they entered in Express filled in.
// The $29.99 they paid comes off the $249 at checkout (lib/expressCredit), by email.
//   POST { token } with the BoatClosers sign-in token -> { dealId }
// Only the Express buyer (same email) can move their purchase, and only once.

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

async function signedInUser(req: Request) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  const sb = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await sb.auth.getUser(token)
  return data?.user || null
}

// "2015 Carolina Skiff 17" -> year 2015, make "Carolina", model "Skiff 17".
function splitBoat(desc: string) {
  const m = /^\s*((?:19|20)\d{2})\s+(.*)$/.exec(desc || '')
  const year = m ? m[1] : ''
  const rest = (m ? m[2] : desc || '').trim()
  const words = rest.split(/\s+/).filter(Boolean)
  return { year, make: words[0] || '', model: words.slice(1).join(' ') }
}

function splitAddress(a?: string) {
  // "123 Main St, Lake Worth, FL 33460" -> street, city, state + ZIP
  const parts = String(a || '').split(',').map((x) => x.trim()).filter(Boolean)
  if (parts.length >= 3) return { address: parts[0], city: parts[1], stateZip: parts.slice(2).join(', ') }
  if (parts.length === 2) return { address: parts[0], city: '', stateZip: parts[1] }
  return { address: parts[0] || '', city: '', stateZip: '' }
}

export async function POST(req: Request) {
  const user = await signedInUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })
  const body = await req.json().catch(() => ({} as any))
  const token = String(body?.token || '')
  if (!/^[a-f0-9]{48}$/.test(token)) return NextResponse.json({ error: 'That Express link isn’t valid.' }, { status: 400 })

  const { data: ex } = await supabaseAdmin
    .from('express_deals')
    .select('id,buyer_name,buyer_email,seller_name,items,price_cents,progress')
    .eq('access_token', token)
    .maybeSingle()
  if (!ex) return NextResponse.json({ error: 'That Express purchase wasn’t found.' }, { status: 404 })
  if (String(user.email || '').toLowerCase() !== String(ex.buyer_email || '').toLowerCase()) {
    return NextResponse.json({ error: `Sign in with ${ex.buyer_email}, the email you used for Express.`, needEmail: ex.buyer_email }, { status: 403 })
  }
  const p: any = ex.progress || {}
  if (p.movedToDeal) return NextResponse.json({ dealId: p.movedToDeal })

  const h: any = p.handoff || {}
  const boat = ex.items?.boat
  const b = boat ? splitBoat(boat.description) : { year: '', make: '', model: '' }
  const notes = [
    ex.items?.motor && `Motor: ${ex.items.motor.description}${ex.items.motor.serial ? ` (serial ${ex.items.motor.serial})` : ''}`,
    ex.items?.trailer && `Trailer: ${ex.items.trailer.description}${ex.items.trailer.vin ? ` (VIN ${ex.items.trailer.vin})` : ''}`,
    h.inventory && `Included: ${h.inventory}`,
  ].filter(Boolean).join('\n')

  const vessel: any = {
    name: '', year: b.year, make: b.make, model: b.model, hin: boat?.hin || '',
    loa: h.lengthFt || '', hullType: h.hull || '', fuelType: h.fuel === 'Diesel' ? 'Diesel' : 'Gasoline',
    regNumber: h.titleNumber || h.registrationNumber || '', regState: 'FL', uscgNumber: h.officialNumber || '',
    isDocumented: h.titledHow === 'documented' ? 'yes' : h.titledHow ? 'no' : '',
    trailerIncluded: ex.items?.trailer ? 'yes' : 'no', trailerVin: ex.items?.trailer?.vin || '',
    askingPrice: String(Math.round((ex.price_cents || 0) / 100)),
    description: notes, fromExpress: ex.id,
  }
  const parties = {
    buyer: { name: ex.buyer_name, email: ex.buyer_email, phone: '', ...splitAddress(h.buyerAddress) },
    seller: { name: ex.seller_name, email: h.sellerEmail || '', phone: h.sellerPhone || '', ...splitAddress(h.sellerAddress) },
  }

  const { data: deal, error } = await supabaseAdmin
    .from('deals')
    .insert({ vessel, parties, negotiate: {}, dd_data: {}, docs_data: {}, step: 1, max_step: 1, initiator_id: user.id, initiator_role: 'buyer', status: 'active', paid: false })
    .select('id')
    .single()
  if (error || !deal) return NextResponse.json({ error: 'Could not create your BoatClosers deal. Try again.' }, { status: 500 })

  await supabaseAdmin
    .from('express_deals')
    .update({ progress: { ...p, movedToDeal: deal.id, movedAt: new Date().toISOString() } })
    .eq('id', ex.id)
  return NextResponse.json({ dealId: deal.id })
}
