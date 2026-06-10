import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, email, password, fullName, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    if (action === 'signup') {
      // Create the user with email already confirmed so they can use the app immediately.
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || '', role: role || 'buyer' }
      })

      if (createErr) {
        const msg = /already/i.test(createErr.message)
          ? 'An account with this email already exists. Try signing in.'
          : createErr.message
        return NextResponse.json({ error: msg }, { status: 400 })
      }

      // Immediately sign them in to get a session token.
      const { data: session, error: signErr } = await supabaseAdmin.auth.signInWithPassword({ email, password })
      if (signErr || !session?.session) {
        return NextResponse.json({ error: 'Account created. Please sign in.' }, { status: 200 })
      }

      return NextResponse.json({
        user: {
          id: created.user.id,
          email: created.user.email,
          fullName: fullName || '',
          role: role || 'buyer'
        },
        token: session.session.access_token
      })
    }

    if (action === 'signin') {
      const { data: session, error: signErr } = await supabaseAdmin.auth.signInWithPassword({ email, password })
      if (signErr || !session?.session) {
        return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 })
      }
      const u = session.user
      return NextResponse.json({
        user: {
          id: u.id,
          email: u.email,
          fullName: u.user_metadata?.full_name || '',
          role: u.user_metadata?.role || 'buyer'
        },
        token: session.session.access_token
      })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
