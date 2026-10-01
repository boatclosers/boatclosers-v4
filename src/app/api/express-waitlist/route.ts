import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  let body: { email?: string; website?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Spam trap: real people never fill the hidden "website" field.
  if (body.website) {
    return NextResponse.json({ ok: true })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { error } = await supabase
    .from('express_waitlist')
    .insert({ email, source: 'express_page' })

  // 23505 = already on the list. Treat it as success.
  if (error && error.code !== '23505') {
    console.error('express-waitlist insert failed:', error)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
