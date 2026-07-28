import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Per-deal Escrow.com status ───────────────────────────────────────────────
//
// Given a dealId, this looks up the deal's stored Escrow.com transaction ID
// (negotiate.escrowTxId, captured when the buyer signed the receipt) and asks
// Escrow.com whether that transaction is funded. It returns a small status the
// deposit step renders for the customer in real time.
//
// READ-ONLY toward Escrow.com — it never creates, funds, or releases anything.
// It does NOT itself advance the deal; auto-verification is Piece 3, kept
// separate so a display refresh can never accidentally move money.

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Escrow.com's 5-step lifecycle → a plain label + which step we're on, so the
// app can draw the same progress the customer would see on escrow.com.
// agreement → payment(funded) → delivery → inspection → closed
function mapProgress(tx: any): { step: number; label: string; funded: boolean; state: string } {
  const raw = String(tx?.status?.transaction || tx?.status?.state || '').toLowerCase()

  // Funded = money is actually in escrow. Escrow.com signals this once the
  // transaction leaves the agreement/payment-pending phase.
  const fundedStates = ['secured', 'in_dispute', 'dispute', 'closed', 'completed', 'shipped', 'received', 'accepted', 'in_progress', 'ship', 'inspection']
  const funded = fundedStates.some(s => raw.includes(s))

  let step = 1, label = 'Waiting for both parties to agree'
  if (raw.includes('closed') || raw.includes('completed')) { step = 5; label = 'Closed — funds released' }
  else if (raw.includes('inspection') || raw.includes('received') || raw.includes('accepted')) { step = 4; label = 'In inspection / due diligence' }
  else if (raw.includes('ship') || raw.includes('delivery') || raw.includes('in_progress')) { step = 3; label = 'Funds secured — in progress' }
  else if (funded || raw.includes('secured')) { step = 2, label = 'Deposit funded and held in escrow' }
  else if (raw.includes('agreement') || raw.includes('pending') || raw === '') { step = 1; label = 'Waiting for both parties to agree' }

  return { step, label, funded, state: raw || 'unknown' }
}

export async function POST(req: Request) {
  try {
    const base = process.env.ESCROW_API_BASE || 'https://api.escrow-sandbox.com'
    const email = process.env.ESCROW_API_EMAIL || ''
    const key = process.env.ESCROW_API_KEY || ''

    const body = await req.json().catch(() => ({}))
    const dealId = String(body?.dealId || '').trim()
    if (!dealId) {
      return NextResponse.json({ ok: false, error: 'Missing dealId.' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: 'Server not configured (Supabase).' }, { status: 500 })
    }

    const sb = admin()
    const { data: deal, error } = await sb
      .from('deals')
      .select('id, negotiate')
      .eq('id', dealId)
      .single()

    if (error || !deal) {
      return NextResponse.json({ ok: false, error: 'Deal not found.' }, { status: 404 })
    }

    const neg = deal.negotiate || {}
    const txId = String(neg.escrowTxId || '').trim()
    const isEscrowCom = neg.escrowPath === 'escrow_com'

    // Not an Escrow.com deal, or no transaction ID captured yet — nothing to check.
    if (!isEscrowCom) {
      return NextResponse.json({ ok: true, applicable: false, reason: 'not_escrow_com' })
    }
    if (!txId) {
      return NextResponse.json({ ok: true, applicable: true, hasTxId: false })
    }
    if (!email || !key) {
      return NextResponse.json({ ok: true, applicable: true, hasTxId: true, configured: false, message: 'Escrow.com checking is not switched on yet.' })
    }

    const auth = 'Basic ' + Buffer.from(`${email}:${key}`).toString('base64')
    const r = await fetch(`${base}/2017-09-01/transaction/${txId}`, {
      method: 'GET',
      headers: { Authorization: auth, Accept: 'application/json' },
      cache: 'no-store',
    })

    const env = base.includes('sandbox') ? 'sandbox' : 'live'

    if (r.status === 404) {
      return NextResponse.json({ ok: true, applicable: true, hasTxId: true, found: false, env, message: `No Escrow.com transaction #${txId} found. Check the ID entered on the receipt.` })
    }
    if (r.status === 401 || r.status === 403) {
      return NextResponse.json({ ok: false, error: 'Escrow.com rejected the credentials.', env }, { status: 200 })
    }
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: `Escrow.com returned ${r.status}.`, env }, { status: 200 })
    }

    const tx = await r.json().catch(() => null)
    if (!tx) {
      return NextResponse.json({ ok: false, error: 'Unreadable response from Escrow.com.', env }, { status: 200 })
    }

    const prog = mapProgress(tx)
    return NextResponse.json({
      ok: true,
      applicable: true,
      hasTxId: true,
      found: true,
      env,
      transactionId: txId,
      funded: prog.funded,
      step: prog.step,
      label: prog.label,
      state: prog.state,
      checkedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Could not reach Escrow.com: ' + (e?.message || 'unknown') }, { status: 200 })
  }
}
