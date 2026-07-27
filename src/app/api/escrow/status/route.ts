import { NextResponse } from 'next/server'

// ── Escrow.com transaction status check ──────────────────────────────────────
//
// This route does ONE thing: given an Escrow.com transaction ID, it asks
// Escrow.com whether that transaction is funded, and reports back. It cannot
// create, fund, release, or cancel anything — there is no code path here that
// moves money. That keeps the surface area small on the one integration in the
// whole app that touches real funds.
//
// SECURITY:
//   • The API key lives only in ESCROW_API_KEY (a Vercel env var) and is read
//     here, on the server. It is never sent to the browser and never appears in
//     BoatClosersApp.jsx. Escrow.com uses HTTP Basic auth: account email as the
//     username, API key as the password.
//   • Whether this hits sandbox or live is decided entirely by ESCROW_API_BASE
//     and which key is set. Nothing in the code hard-codes the environment, so
//     going live later is a change of env vars, not a change of code.
//
// The response is deliberately plain: a small, known shape the app can trust,
// rather than passing Escrow.com's raw payload through to the client.

const BASE = process.env.ESCROW_API_BASE || 'https://api.escrow-sandbox.com'
const EMAIL = process.env.ESCROW_API_EMAIL || ''
const KEY = process.env.ESCROW_API_KEY || ''

// Escrow.com marks a transaction's money state on the transaction and its parties.
// We translate their vocabulary into a single clear answer for the app: is the
// deposit actually in escrow yet, or not?
function readFundingState(tx: any): { funded: boolean; state: string; detail: string } {
  // Escrow.com transactions carry a status object and per-party statuses. Funding
  // shows up as the transaction moving out of the initial/agreement phases into a
  // "secured"/"in_dispute"/"closed" style state, and/or a party marked as having
  // paid. We check the broad signals rather than any single brittle field.
  const status = tx?.status || {}
  const txState = String(status?.transaction || status?.state || '').toLowerCase()

  const fundedStates = ['secured', 'in_dispute', 'dispute', 'closed', 'completed', 'shipped', 'received', 'accepted', 'in_progress']
  const anyFundedFlag =
    fundedStates.some(s => txState.includes(s)) ||
    !!tx?.is_funded ||
    (Array.isArray(tx?.parties) && tx.parties.some((p: any) => {
      const ps = String(p?.status?.state || p?.agreed || '').toLowerCase()
      return ps.includes('paid') || ps.includes('funded') || ps.includes('secured')
    }))

  if (anyFundedFlag) {
    return { funded: true, state: txState || 'secured', detail: 'Escrow.com reports the funds are in escrow.' }
  }
  return { funded: false, state: txState || 'awaiting_funds', detail: 'Escrow.com has not yet recorded the deposit as funded.' }
}

export async function POST(req: Request) {
  try {
    if (!EMAIL || !KEY) {
      // Not configured yet — say so plainly rather than pretending to check.
      return NextResponse.json(
        { ok: false, configured: false, error: 'Escrow.com API is not configured on the server yet.' },
        { status: 200 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const txId = String(body?.transactionId || '').trim()
    if (!txId || !/^\d+$/.test(txId)) {
      return NextResponse.json(
        { ok: false, error: 'Enter a valid Escrow.com transaction ID (numbers only).' },
        { status: 400 }
      )
    }

    // HTTP Basic auth: email:key, base64-encoded.
    const auth = 'Basic ' + Buffer.from(`${EMAIL}:${KEY}`).toString('base64')

    const res = await fetch(`${BASE}/2017-09-01/transaction/${txId}`, {
      method: 'GET',
      headers: { 'Authorization': auth, 'Accept': 'application/json' },
      // Never cache a money-status check.
      cache: 'no-store',
    })

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json(
        { ok: false, error: 'Escrow.com rejected the credentials. Check the API email and key in the server settings.' },
        { status: 200 }
      )
    }
    if (res.status === 404) {
      return NextResponse.json(
        { ok: false, error: `No Escrow.com transaction found with ID ${txId}. Double-check the number.` },
        { status: 200 }
      )
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { ok: false, error: `Escrow.com returned an error (${res.status}).`, detail: text.slice(0, 300) },
        { status: 200 }
      )
    }

    const tx = await res.json().catch(() => null)
    if (!tx) {
      return NextResponse.json({ ok: false, error: 'Escrow.com returned an unreadable response.' }, { status: 200 })
    }

    const funding = readFundingState(tx)

    // A small, trusted shape — not Escrow.com's raw payload.
    return NextResponse.json({
      ok: true,
      configured: true,
      transactionId: txId,
      funded: funding.funded,
      state: funding.state,
      detail: funding.detail,
      // Best-effort amount + currency for display; absent on some responses, which is fine.
      amount: tx?.items?.[0]?.schedule?.[0]?.amount ?? null,
      currency: tx?.currency ?? null,
      // Whether this was sandbox or live, so the UI can label test checks clearly.
      environment: BASE.includes('sandbox') ? 'sandbox' : 'live',
      checkedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Could not reach Escrow.com: ' + (e?.message || 'unknown error') },
      { status: 200 }
    )
  }
}
