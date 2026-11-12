import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Homepage "more states coming" signup: saves the email + the state someone
// wants BoatClosers in, so the owner can see which states to add next.
// Server-only table (RLS on, no policies); a hidden field catches bots.
export const dynamic = 'force-dynamic'

const STATES = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR VI'.split(' '))

export async function POST(request: Request) {
  let body: { email?: string; state?: string; website?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  if (body.website) return NextResponse.json({ ok: true })

  const email = (body.email || '').trim().toLowerCase()
  const state = (body.state || '').trim().toUpperCase()
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  if (!STATES.has(state)) return NextResponse.json({ error: 'Please pick a state.' }, { status: 400 })

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { error } = await sb.from('state_interest').insert({ email, state })
  if (error && error.code !== '23505') {
    console.error('state-interest insert failed:', error)
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
