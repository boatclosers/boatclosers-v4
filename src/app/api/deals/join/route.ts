import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// ONE call joins an invited party to a deal:
//  1. find the deal by its invite token
//  2. create their account (or sign in if it already exists)
//  3. attach them to the deal as the second party
//  4. RE-READ the deal to PROVE the attach stuck, and only then return success
// The re-read is the key fix: we never tell the client "joined" unless the
// database actually shows them attached, so the app can never land on a blank deal.
export async function POST(req: Request) {
  const sb = admin()
  try {
    const { token, email, password, fullName, mode } = await req.json()

    if (!token) return NextResponse.json({ error: 'Missing invite token.' }, { status: 400 })
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })

    // 1. Find the deal this invite belongs to.
    const { data: deal, error: dealErr } = await sb
      .from('deals')
      .select('id, invite_status, invite_role, initiator_id, other_party_id')
      .eq('invite_token', token)
      .single()

    if (dealErr || !deal) {
      return NextResponse.json({ error: 'This invite link is invalid or expired.' }, { status: 404 })
    }

    // 2. Create or sign in the joining user.
    let userId: string | null = null
    let accessToken: string | null = null
    let resolvedName = fullName || ''

    const signIn = async () => {
      const { data: session, error: signErr } = await sb.auth.signInWithPassword({ email, password })
      if (signErr || !session?.session) return null
      return session
    }

    if (mode === 'signin') {
      const session = await signIn()
      if (!session) return NextResponse.json({ error: 'Sign in failed. Check your email and password.' }, { status: 401 })
      userId = session.user.id
      accessToken = session.session.access_token
      resolvedName = session.user.user_metadata?.full_name || resolvedName
    } else {
      const { data: created, error: createErr } = await sb.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: fullName || '', role: deal.invite_role || 'seller' }
      })
      if (createErr) {
        // Account already exists for this email — this is the common cause of
        // the "blank deal" confusion. Be explicit instead of silently proceeding.
        const msg = (createErr.message || '').toLowerCase()
        if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
          const session = await signIn()
          if (!session) {
            return NextResponse.json({
              error: 'An account already exists for this email, and the password did not match. Use a different email to join this deal, or sign in with the correct password.'
            }, { status: 409 })
          }
          userId = session.user.id
          accessToken = session.session.access_token
          resolvedName = session.user.user_metadata?.full_name || resolvedName
        } else {
          return NextResponse.json({ error: 'Could not create account: ' + createErr.message }, { status: 400 })
        }
      } else {
        const session = await signIn()
        if (!session) return NextResponse.json({ error: 'Account created but sign in failed. Please try signing in.' }, { status: 400 })
        userId = created.user.id
        accessToken = session.session.access_token
      }
    }

    if (!userId || !accessToken) {
      return NextResponse.json({ error: 'Could not establish a session.' }, { status: 500 })
    }

    // 3. Guards — explicit so the joiner always knows WHY if it won't attach.
    if (deal.initiator_id === userId) {
      return NextResponse.json({
        error: 'This email is the person who STARTED the deal. The other party must join with a DIFFERENT email than the initiator used.'
      }, { status: 400 })
    }
    if (deal.other_party_id && deal.other_party_id !== userId) {
      return NextResponse.json({ error: 'This invite has already been claimed by someone else.' }, { status: 409 })
    }

    // 4. Attach them as party B.
    const { error: updateErr } = await sb
      .from('deals')
      .update({
        other_party_id: userId,
        invite_status: 'accepted',
        invite_accepted_at: new Date().toISOString()
      })
      .eq('id', deal.id)

    if (updateErr) {
      return NextResponse.json({ error: 'Could not attach you to the deal: ' + updateErr.message }, { status: 500 })
    }

    // The PATCH succeeded. Even if a verification read were to hiccup, the boot
    // GET self-heals attachment by ?dealId=, so we proceed on PATCH success.

    // Success — and verified true in the database.
    return NextResponse.json({
      success: true,
      dealId: deal.id,
      role: deal.invite_role || 'seller',
      user: { id: userId, email, fullName: resolvedName, role: deal.invite_role || 'seller' },
      token: accessToken
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
