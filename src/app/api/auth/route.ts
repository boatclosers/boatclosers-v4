import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailLayout } from '@/lib/sendEmail'
import crypto from 'crypto'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Account creation, sign-in, and password recovery for BoatClosers.
// The client (AuthScreen) POSTs { action, email, password, fullName, role } and
// expects back { user: { id, email, fullName, role }, token }.
//
// PASSWORD RECOVERY uses a 6-digit code emailed through Resend rather than
// Supabase's emailed magic link. Reset links are single-use, and corporate mail
// scanners often click them before the customer does, which burns the link and
// shows a real person "invalid or expired". A typed code has no such failure mode
// and keeps every Supabase call server-side, matching the rest of this app.
// The code is stored HASHED in app_metadata (admin-only, users can't edit it),
// expires in 15 minutes, and locks out after 5 wrong attempts.

const CODE_TTL_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

function hashCode(code: string) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

async function findUserByEmail(sb: any, email: string) {
  const target = String(email).trim().toLowerCase()
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !data?.users?.length) return null
    const hit = data.users.find((u: any) => (u.email || '').toLowerCase() === target)
    if (hit) return hit
    if (data.users.length < 1000) return null
  }
  return null
}

export async function POST(req: Request) {
  const sb = admin()
  try {
    const { action, email, password, fullName, role, code, newPassword } = await req.json()

    // ── FORGOT PASSWORD: send a code ──
    // Always returns success, even if no account exists, so this can't be used
    // to discover which email addresses have accounts.
    if (action === 'reset_request') {
      if (!email) {
        return NextResponse.json({ error: 'Enter the email address on your account.' }, { status: 400 })
      }
      const user = await findUserByEmail(sb, email)
      if (user) {
        const plainCode = String(crypto.randomInt(100000, 1000000))
        await sb.auth.admin.updateUserById(user.id, {
          app_metadata: {
            reset_code_hash: hashCode(plainCode),
            reset_expires_at: Date.now() + CODE_TTL_MS,
            reset_attempts: 0
          }
        })
        const emailResult = await sendEmail({
          to: user.email,
          subject: `Your BoatClosers reset code: ${plainCode}`,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:19px; margin:0 0 4px;">Reset your password</h2>
            <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
              Enter this code in BoatClosers to set a new password:
            </p>
            <p style="text-align:center; margin:24px 0;">
              <span style="display:inline-block; background:#08152e; color:#ffffff; font-size:30px; font-weight:800; letter-spacing:7px; padding:14px 26px; border-radius:8px;">${plainCode}</span>
            </p>
            <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
              This code expires in 15 minutes and can only be used once.
            </p>
            <p style="color:#94a3b8; font-size:12px; line-height:1.5;">
              Didn't ask to reset your password? You can ignore this email &mdash; your
              password stays exactly as it is, and nothing on your deal changes.
            </p>
          `)
        })
        if (!emailResult.success) {
          console.error('Reset code email failed to send:', emailResult.error)
        }
      }
      return NextResponse.json({
        ok: true,
        message: 'If an account exists for that email, a reset code is on its way.'
      })
    }

    // ── FORGOT PASSWORD: confirm the code and set a new password ──
    if (action === 'reset_confirm') {
      if (!email || !code || !newPassword) {
        return NextResponse.json({ error: 'Enter your email, the code, and a new password.' }, { status: 400 })
      }
      if (String(newPassword).length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 })
      }

      const user = await findUserByEmail(sb, email)
      const meta = user?.app_metadata || {}
      const badCode = { error: 'That code is not right, or it has expired. Request a new one.' }

      if (!user || !meta.reset_code_hash || !meta.reset_expires_at) {
        return NextResponse.json(badCode, { status: 400 })
      }
      if (Date.now() > Number(meta.reset_expires_at)) {
        return NextResponse.json({ error: 'That code has expired. Request a new one.' }, { status: 400 })
      }
      if (Number(meta.reset_attempts || 0) >= MAX_ATTEMPTS) {
        return NextResponse.json({
          error: 'Too many incorrect attempts. Request a new code to try again.'
        }, { status: 429 })
      }
      if (hashCode(String(code).trim()) !== meta.reset_code_hash) {
        await sb.auth.admin.updateUserById(user.id, {
          app_metadata: { ...meta, reset_attempts: Number(meta.reset_attempts || 0) + 1 }
        })
        return NextResponse.json(badCode, { status: 400 })
      }

      // Code is good. Set the new password and burn the code so it can't be reused.
      const { error: pwErr } = await sb.auth.admin.updateUserById(user.id, {
        password: String(newPassword),
        app_metadata: { reset_code_hash: null, reset_expires_at: null, reset_attempts: null }
      })
      if (pwErr) {
        return NextResponse.json({ error: 'Could not update your password: ' + pwErr.message }, { status: 400 })
      }

      // Sign them straight in so they land back in their deal, not on a login screen.
      const { data: session } = await sb.auth.signInWithPassword({
        email: user.email,
        password: String(newPassword)
      })
      if (!session?.session) {
        return NextResponse.json({ ok: true, signedIn: false })
      }
      return NextResponse.json({
        ok: true,
        signedIn: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || '',
          role: session.user.user_metadata?.role || 'buyer'
        },
        token: session.session.access_token
      })
    }

    // ── Everything below needs an email AND a password ──
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
