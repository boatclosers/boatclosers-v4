import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// One call does everything for a joining (invited) party:
// 1. validate the invite token -> find the deal
// 2. create their account (or sign them in if it already exists)
// 3. attach them to the deal as party B
// 4. return a session token + their role, so the client is ready immediately
// This removes the multi-page/sessionStorage handoff that kept desyncing.
export async function POST(req: Request) {
  const sb = admin()
  try {
    const { token, email, password, fullName, mode } = await req.json()

    if (!token) return NextResponse.json({ error: 'Missing invite token.' }, { status: 400 })
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })

    // 1. Find the deal this invite belongs to.
    const { data: deal, error: dealErr } = await sb
      .from('deals')
      .select('id, invite_status, invite_role, party_a_user_id, party_b_user_id')
      .eq('invite_token', token)
      .single()

    if (dealErr || !deal) {
      return NextResponse.json({ error: 'This invite link is invalid or expired.' }, { status: 404 })
    }

    // 2. Create or sign in the joining user.
    let userId: string | null = null
    let accessToken: string | null = null
    let resolvedName = fullName || ''

    if (mode === 'signin') {
      const { data: session, error: signErr } = await sb.auth.signInWithPassword({ email, password })
      if (signErr || !session?.session) {
        return NextResponse.json({ error: 'Sign in failed. Check your email and password.' }, { status: 401 })
      }
      userId = session.user.id
      accessToken = session.session.access_token
      resolvedName = session.user.user_metadata?.full_name || resolvedName
    } else {
      const { data: created, error: createErr } = await sb.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: fullName || '', role: deal.invite_role || 'seller' }
      })
      if (createErr) {
        // If the account already exists, fall back to signing them in.
        if ((createErr.message || '').toLowerCase().includes('already')) {
          const { data: session, error: signErr } = await sb.auth.signInWithPassword({ email, password })
          if (signErr || !session?.session) {
            return NextResponse.json({ error: 'An account with this email exists. Please sign in instead.' }, { status: 409 })
          }
          userId = session.user.id
          accessToken = session.session.access_token
          resolvedName = session.user.user_metadata?.full_name || resolvedName
        } else {
          return NextResponse.json({ error: 'Could not create account: ' + createErr.message }, { status: 400 })
        }
      } else {
        const { data: session, error: signErr } = await sb.auth.signInWithPassword({ email, password })
        if (signErr || !session?.session) {
          return NextResponse.json({ error: 'Account created but sign in failed. Try signing in.' }, { status: 400 })
        }
        userId = created.user.id
        accessToken = session.session.access_token
      }
    }

    if (!userId || !accessToken) {
      return NextResponse.json({ error: 'Could not establish a session.' }, { status: 500 })
    }

    // 3. Guard: the initiator cannot join their own deal as the second party.
    if (deal.party_a_user_id === userId) {
      return NextResponse.json({ error: 'This is your own deal — you are already the initiator.' }, { status: 400 })
    }
    // Guard: already claimed by someone else.
    if (deal.party_b_user_id && deal.party_b_user_id !== userId) {
      return NextResponse.json({ error: 'This invite has already been claimed by someone else.' }, { status: 409 })
    }

    // 4. Attach them to the deal as party B.
    const { error: updateErr } = await sb
      .from('deals')
      .update({
        party_b_user_id: userId,
        invite_status: 'accepted',
        invite_accepted_at: new Date().toISOString()
      })
      .eq('id', deal.id)

    if (updateErr) {
      return NextResponse.json({ error: 'Could not attach you to the deal: ' + updateErr.message }, { status: 500 })
    }

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
