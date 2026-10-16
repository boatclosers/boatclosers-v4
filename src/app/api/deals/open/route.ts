import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

function anon() {
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

const isPlaceholder = (e: any) => /^link-share-/i.test(String(e || ''))
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

async function findUserByEmail(sb: any, email: string) {
  const target = email.trim().toLowerCase()
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !data?.users?.length) return null
    const hit = data.users.find((u: any) => (u.email || '').toLowerCase() === target)
    if (hit) return hit
    if (data.users.length < 1000) return null
  }
  return null
}

// Mint a real Supabase session for a user WITHOUT a password: generate a one-time
// login token server-side and redeem it immediately. Nothing is emailed, so mail
// scanners can't burn it — the invite page only calls this on a button click.
async function sessionFor(sb: any, email: string) {
  const { data, error } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const hashed = data?.properties?.hashed_token
  if (error || !hashed) return null
  const client = anon()
  for (const type of ['magiclink', 'email'] as const) {
    const { data: v } = await client.auth.verifyOtp({ token_hash: hashed, type })
    if (v?.session) return v
  }
  return null
}

// ONE-TAP OPEN for the invited party. No password, no sign-up form.
//
// Rules that keep this safe:
//  - Only reached by a POST from a button on the invite page (link crawlers and
//    mail scanners only do GETs, so they can never claim a deal).
//  - If the invite was sent to a real email, THAT email is used — never a typed one.
//  - We never log into an account that has a password. Those people get
//    { needsSignIn: true } and use the normal sign-in.
//  - A returning guest (passwordless account created here) can reopen their deal
//    with the same link until they set a password.
export async function POST(req: Request) {
  const sb = admin()
  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body.token || '').trim()
    const typedName = String(body.fullName || '').trim()
    const typedEmail = String(body.email || '').trim().toLowerCase()

    if (!token || token.length < 20) {
      return NextResponse.json({ error: 'This invite link is invalid.' }, { status: 400 })
    }

    const { data: deal, error: dealErr } = await sb
      .from('deals')
      .select('id, invite_email, invite_role, initiator_id, other_party_id, parties')
      .eq('invite_token', token)
      .maybeSingle()

    if (dealErr || !deal) {
      return NextResponse.json({ error: 'This invite link is invalid or expired.' }, { status: 404 })
    }

    const role = deal.invite_role || 'seller'
    let user: any = null

    if (deal.other_party_id) {
      // Already joined: reopen only for a passwordless guest.
      const { data: got } = await sb.auth.admin.getUserById(deal.other_party_id)
      user = got?.user || null
      if (!user || !user.app_metadata?.passwordless_guest) {
        return NextResponse.json({ needsSignIn: true, reason: 'joined' })
      }
    } else {
      const invitedEmail = isPlaceholder(deal.invite_email) ? '' : String(deal.invite_email || '').trim().toLowerCase()
      const email = invitedEmail || typedEmail
      if (!email || !validEmail(email)) {
        return NextResponse.json({ error: 'Please enter your email so we can send you the deal paperwork.', needsEmail: true }, { status: 400 })
      }
      if (!typedName) {
        return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
      }

      const existing = await findUserByEmail(sb, email)
      if (existing) {
        if (existing.id === deal.initiator_id) {
          return NextResponse.json({
            error: 'This email belongs to the person who started the deal. Please use your own email.'
          }, { status: 400 })
        }
        if (!existing.app_metadata?.passwordless_guest) {
          // Has a real account — make them sign in rather than walking in.
          return NextResponse.json({ needsSignIn: true, reason: 'account' })
        }
        if (!invitedEmail) {
          // A typed email (share-link invite) proves nothing about who's typing it.
          // Never hand out a session for an existing account, even a guest one,
          // or anyone with a share link could open someone else's other deals.
          return NextResponse.json({ needsSignIn: true, reason: 'account' })
        }
        user = existing
      } else {
        const { data: created, error: createErr } = await sb.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: typedName, role },
          app_metadata: { passwordless_guest: true }
        })
        if (createErr || !created?.user) {
          return NextResponse.json({ error: 'Could not open the deal: ' + (createErr?.message || 'unknown') }, { status: 400 })
        }
        user = created.user
      }

      // Attach as the second party. The .is() guard stops two people racing for one link.
      const { data: attached, error: updErr } = await sb
        .from('deals')
        .update({
          other_party_id: user.id,
          invite_status: 'accepted',
          invite_accepted_at: new Date().toISOString()
        })
        .eq('id', deal.id)
        .is('other_party_id', null)
        .select('id')
      if (updErr) {
        return NextResponse.json({ error: 'Could not attach you to the deal: ' + updErr.message }, { status: 500 })
      }
      if (!attached?.length) {
        return NextResponse.json({ error: 'This invite has already been claimed by someone else.' }, { status: 409 })
      }

      // Save their name on the deal's party record if it's blank, so the other side sees it.
      const parties: any = deal.parties || {}
      if (!String(parties?.[role]?.name || '').trim()) {
        await sb.from('deals')
          .update({ parties: { ...parties, [role]: { ...(parties[role] || {}), name: typedName, email: parties?.[role]?.email || email } } })
          .eq('id', deal.id)
      }
    }

    const session = await sessionFor(sb, user.email)
    if (!session?.session) {
      return NextResponse.json({ error: 'Could not open the deal right now. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      dealId: deal.id,
      role,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || typedName,
        role
      },
      token: session.session.access_token,
      refreshToken: session.session.refresh_token
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
