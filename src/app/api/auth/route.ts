import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Account creation and sign-in for BoatClosers.
// The client (AuthScreen) POSTs { action: 'signup' | 'signin', email, password,
// fullName, role } and expects back { user: { id, email, fullName, role }, token }.
// New accounts are created with email_confirm: true so the person can use the app
// immediately without a separate email-verification step, then we sign them in to
// obtain a real access token that the deals API verifies on every request.
export async function POST(req: Request) {
  const sb = admin()
  try {
    const { action, email, password, fullName, role } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const signIn = async () => {
      const { data: session, error: signErr } = await sb.auth.signInWithPassword({ email, password })
      if (signErr || !session?.session) return null
      return session
    }

    // ── SIGN IN ──
    if (action === 'signin' || action === 'login') {
      const session = await signIn()
      if (!session) {
        return NextResponse.json({ error: 'Sign in failed. Check your email and password.' }, { status: 401 })
      }
      return NextResponse.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || '',
          role: session.user.user_metadata?.role || role || 'buyer'
        },
        token: session.session.access_token
      })
    }

    // ── SIGN UP ──
    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '', role: role || 'buyer' }
    })

    if (createErr) {
      const msg = (createErr.message || '').toLowerCase()
      if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
        // Be explicit so the user knows to sign in rather than getting a vague failure.
        return NextResponse.json({
          error: 'An account already exists for this email. Please switch to Sign In, or use a different email.'
        }, { status: 409 })
      }
      return NextResponse.json({ error: 'Could not create account: ' + createErr.message }, { status: 400 })
    }

    // Created — now sign in to get a usable session token.
    const session = await signIn()
    if (!session) {
      return NextResponse.json({ error: 'Account created, but sign in failed. Please try signing in.' }, { status: 400 })
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
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
