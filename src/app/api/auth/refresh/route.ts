import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Session refresh ──────────────────────────────────────────────────────────
//
// Supabase access tokens expire after ~1 hour. The app stores the long-lived
// refresh token at login and calls this route to trade it for a fresh access
// token — silently, when a save comes back 401 — so a customer who leaves a deal
// open for hours is never kicked out mid-transaction.
//
// This uses the ANON key (not the service-role key): refreshing a session is a
// normal client operation, and the refresh token itself is the credential.

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json().catch(() => ({}))
    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: 'No refresh token.' }, { status: 400 })
    }

    const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    if (!anon) {
      return NextResponse.json({ ok: false, error: 'Server not configured for refresh.' }, { status: 500 })
    }

    const sb = createClient(SUPABASE_URL, anon, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await sb.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data?.session) {
      // Refresh token itself is expired/invalid — the client should fall back to
      // a full sign-in. Signalled with 401 so the client can tell the difference.
      return NextResponse.json({ ok: false, error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Refresh failed: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
