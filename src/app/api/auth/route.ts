import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

export async function POST(req: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!key) return NextResponse.json({ error: 'DIAGNOSTIC: Service role key missing from Vercel.' }, { status: 500 })

  const supabaseAdmin = createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { action, email, password, fullName, role } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })

    if (action === 'signup') {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: fullName || '', role: role || 'buyer' }
      })
      if (createErr) return NextResponse.json({ error: 'SIGNUP FAILED: ' + createErr.message }, { status: 400 })
      const { data: session, error: signErr } = await supabaseAdmin.auth.signInWithPassword({ email, password })
      if (signErr || !session?.session) return NextResponse.json({ error: 'SIGNIN AFTER SIGNUP FAILED: ' + (signErr?.message || 'no session') }, { status: 400 })
      return NextResponse.json({
        user: { id: created.user.id, email: created.user.email, fullName: fullName || '', role: role || 'buyer' },
        token: session.session.access_token
      })
    }

    if (action === 'signin') {
      const { data: session, error: signErr } = await supabaseAdmin.auth.signInWithPassword({ email, password })
      if (signErr || !session?.session) return NextResponse.json({ error: 'SIGNIN FAILED: ' + (signErr?.message || 'no session') }, { status: 401 })
      const u = session.user
      return NextResponse.json({
        user: { id: u.id, email: u.email, fullName: u.user_metadata?.full_name || '', role: u.user_metadata?.role || 'buyer' },
        token: session.session.access_token
      })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
