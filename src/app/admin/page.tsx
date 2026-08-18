'use client'

import { useState, useEffect } from 'react'

// Owner dashboard.
//
// The password never lives in this file — it's typed here, sent to /api/admin,
// and checked on the server against ADMIN_PASSWORD. Nothing renders until the
// server hands back data, so there is no client-side gate to bypass.
//
// It's organised around ONE question: which deals are stuck, and on whom? A list
// of all deals sorted by date is nearly useless at 11pm when someone emails you
// saying "it's not working" — knowing that their seller hasn't verified a deposit
// for three days answers it immediately.
//
// Opens on Live, because that's the working set. Closed deals are kept forever
// but filed under their own tab — finished business shouldn't compete for
// attention with deals still in flight. The control buttons on each row are the
// few named repairs that came up in real testing; there is no free-form editor.

const NAVY = '#08152e'
const BRASS = '#b8863a'
const SLATE = '#475569'
const MIST = '#e2e8f0'
const ctlBtn: any = { fontSize: 11.5, fontWeight: 700, color: '#08152e', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontFamily: 'sans-serif' }

const money = (n: number) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const urgencyColor = (u: number) =>
  u >= 5 ? '#b91c1c' : u >= 4 ? '#b45309' : u >= 2 ? '#1d4ed8' : '#64748b'

const urgencyTint = (u: number) =>
  u >= 5 ? '#fdecec' : u >= 4 ? '#fff8e6' : u >= 2 ? '#eff6ff' : '#f8fafc'

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [filter, setFilter] = useState('live')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [escTx, setEscTx] = useState('1')
  const [escResult, setEscResult] = useState<any>(null)
  const [escBusy, setEscBusy] = useState(false)
  const [actionBusy, setActionBusy] = useState('')
  const [actionMsg, setActionMsg] = useState<any>(null)
  const runAction = async (action: string, dealId: string, extra: any = {}) => {
    const confirmText: any = {
      adminDeleteDeal: 'Permanently DELETE this deal? This cannot be undone.',
      adminResetDeposit: 'Reset both deposit confirmations so the parties can re-confirm?',
      adminReopenDeal: 'Reopen this deal (undo finalize/cancel)?',
      adminClearJoin: 'Detach the second party and reopen the invite slot?',
      adminResetRole: `Set the initiator role to ${extra.role}? (fixes an inverted buyer/seller)`,
      adminResendInvite: 'Re-arm the invite as pending?',
    }
    if (confirmText[action] && !window.confirm(confirmText[action])) return
    setActionBusy(action + dealId); setActionMsg(null)
    try {
      const r = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: sessionStorage.getItem('bc_admin') || '', action, dealId, ...extra }),
      })
      const j = await r.json()
      if (j.ok) { setActionMsg({ ok: true, text: j.done || 'Done' }); load(sessionStorage.getItem('bc_admin') || '') }
      else setActionMsg({ ok: false, text: j.error || 'Failed' })
    } catch { setActionMsg({ ok: false, text: 'Network error' }) }
    setActionBusy('')
  }

  const runEscrowCheck = async () => {
    setEscBusy(true); setEscResult(null)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action: 'escrowCheck', transactionId: escTx || '1' })
      })
      const j = await res.json().catch(() => ({}))
      setEscResult(j?.escrow || { ok: false, message: 'No response.' })
    } catch {
      setEscResult({ ok: false, message: 'Network error.' })
    }
    setEscBusy(false)
  }

  const load = async (password: string) => {
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const j = await res.json()
      if (!res.ok) { setError(j.error || 'Failed.'); setBusy(false); return }
      setData(j); setAuthed(true)
      sessionStorage.setItem('bc_admin', password)
    } catch (e: any) {
      setError('Network error: ' + (e?.message || 'unknown'))
    }
    setBusy(false)
  }

  // Kept in sessionStorage only, so it's gone when the tab closes.
  useEffect(() => {
    const saved = sessionStorage.getItem('bc_admin')
    if (saved) { setPw(saved); load(saved) }
  }, [])

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 380 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: BRASS, fontWeight: 700, marginBottom: 6 }}>BOATCLOSERS</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 4 }}>Owner dashboard</div>
          <div style={{ fontSize: 12.5, color: SLATE, marginBottom: 18, lineHeight: 1.6 }}>
            Every deal on the platform, and what each one is waiting on.
          </div>
          <input
            type="password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(pw)}
            placeholder="Admin password" autoFocus
            style={{ width: '100%', padding: '11px 13px', fontSize: 14, borderRadius: 8, border: `1px solid ${MIST}`, marginBottom: 10, boxSizing: 'border-box' }}
          />
          {error && <div style={{ color: '#b91c1c', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
          <button
            onClick={() => load(pw)} disabled={busy || !pw}
            style={{ width: '100%', padding: '11px', fontSize: 14, fontWeight: 700, color: NAVY, background: BRASS, border: 'none', borderRadius: 8, cursor: busy ? 'default' : 'pointer', opacity: busy || !pw ? 0.6 : 1 }}>
            {busy ? 'Checking…' : 'Sign in'}
          </button>
        </div>
      </div>
    )
  }

  const deals: any[] = data?.deals || []
  const t = data?.totals || {}

  // Finished business. Kept in the table forever, but out of the working view —
  // the dashboard exists to show what still needs doing.
  const DONE = ['Closed', 'Cancelled', 'Ended — no deposit', 'Vessel rejected']

  const filtered = deals.filter(d => {
    if (filter === 'attention' && d.urgency < 4) return false
    if (filter === 'live' && DONE.includes(d.state)) return false
    if (filter === 'stale' && ((d.idleDays ?? 0) < 7 || DONE.includes(d.state))) return false
    if (filter === 'closed' && d.state !== 'Closed') return false
    if (!q.trim()) return true
    const hay = `${d.id} ${d.boat} ${d.hin} ${d.buyer.email} ${d.seller.email} ${d.buyer.name} ${d.seller.name} ${d.inviteEmail}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  const Stat = ({ label, value, tone }: any) => (
    <div style={{ background: '#fff', borderRadius: 10, padding: '13px 15px', flex: 1, minWidth: 120, border: `1px solid ${MIST}` }}>
      <div style={{ fontSize: 11, color: SLATE, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: tone || NAVY }}>{value}</div>
    </div>
  )

  const Tab = ({ id, label, n }: any) => (
    <button onClick={() => setFilter(id)}
      style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 7, cursor: 'pointer',
        border: `1px solid ${filter === id ? NAVY : MIST}`, background: filter === id ? NAVY : '#fff', color: filter === id ? '#fff' : SLATE }}>
      {label}{typeof n === 'number' ? ` (${n})` : ''}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <div style={{ background: NAVY, padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: BRASS, fontWeight: 700 }}>BOATCLOSERS</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Owner dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => load(pw)} disabled={busy}
              style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 700, color: NAVY, background: BRASS, border: 'none', borderRadius: 7, cursor: 'pointer' }}>
              {busy ? 'Loading…' : 'Refresh'}
            </button>
            <button onClick={() => { sessionStorage.removeItem('bc_admin'); setAuthed(false); setData(null); setPw('') }}
              style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 700, color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 7, cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 3 }}>Escrow.com connection test</div>
          <div style={{ fontSize: 11.5, color: SLATE, marginBottom: 10, lineHeight: 1.6 }}>
            Read-only check. Enter an Escrow.com transaction ID to see whether it&rsquo;s funded, or leave it as 1 just to confirm the connection works.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={escTx} onChange={e => setEscTx(e.target.value)} placeholder="Transaction ID"
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 7, border: `1px solid ${MIST}`, width: 160 }} />
            <button onClick={runEscrowCheck} disabled={escBusy}
              style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 700, color: NAVY, background: BRASS, border: 'none', borderRadius: 7, cursor: escBusy ? 'default' : 'pointer', opacity: escBusy ? 0.6 : 1 }}>
              {escBusy ? 'Checking…' : 'Check Escrow.com'}
            </button>
          </div>
          {escResult && (
            <div style={{ marginTop: 10, padding: '10px 13px', borderRadius: 7, fontSize: 12.5, lineHeight: 1.6,
              background: escResult.funded ? '#eafaf1' : escResult.ok ? '#eff6ff' : '#fdecec',
              border: `1px solid ${escResult.funded ? '#a8d8b8' : escResult.ok ? '#bfdbfe' : '#f5b5b5'}`,
              color: escResult.funded ? '#0f6e56' : escResult.ok ? '#1d4ed8' : '#b91c1c' }}>
              {escResult.message}
              {escResult.env === 'LIVE' && <div style={{ marginTop: 4, fontWeight: 800 }}>⚠️ This is the LIVE environment — real money.</div>}
              {escResult.raw && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer', fontSize: 11, color: SLATE }}>show raw status from Escrow.com</summary>
                  <pre style={{ marginTop: 6, background: '#fff', border: `1px solid ${MIST}`, borderRadius: 6, padding: '8px 10px', fontSize: 10.5, color: NAVY, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{JSON.stringify(escResult.raw, null, 2)}</pre>
                </details>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <Stat label="Needs attention" value={t.needsAttention ?? 0} tone={(t.needsAttention ?? 0) > 0 ? '#b45309' : undefined} />
          <Stat label="Live deals" value={t.live ?? 0} />
          <Stat label="Paid" value={t.paid ?? 0} />
          <Stat label="Revenue" value={money(t.revenue ?? 0)} tone="#0f6e56" />
          <Stat label="Idle 7+ days" value={t.stale ?? 0} />
          <Stat label="Closed" value={t.closed ?? 0} tone={(t.closed ?? 0) > 0 ? '#0f6e56' : undefined} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
          <Tab id="live" label="Live" n={deals.filter(d => !DONE.includes(d.state)).length} />
          <Tab id="attention" label="Needs attention" n={deals.filter(d => d.urgency >= 4).length} />
          <Tab id="stale" label="Gone quiet" />
          <Tab id="closed" label="Closed" n={deals.filter(d => d.state === 'Closed').length} />
          <Tab id="all" label="All" n={deals.length} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search email, boat, HIN, deal ID"
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', fontSize: 13, borderRadius: 7, border: `1px solid ${MIST}` }} />
        </div>

        {error && <div style={{ background: '#fdecec', border: '1px solid #f5b5b5', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#b91c1c', marginBottom: 12 }}>{error}</div>}

        {filtered.length === 0 && (
          <div style={{ background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, padding: '2rem', textAlign: 'center', color: SLATE, fontSize: 13.5 }}>
            {filter === 'attention' ? 'Nothing needs your attention. Every deal is moving.'
              : filter === 'closed' ? 'No closed deals yet. Finished deals are archived here.'
              : filter === 'live' ? 'No live deals right now.'
              : filter === 'stale' ? 'Nothing has gone quiet.'
              : 'No deals match.'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(d => (
            <div key={d.id} style={{ background: '#fff', border: `1px solid ${MIST}`, borderLeft: `4px solid ${urgencyColor(d.urgency)}`, borderRadius: 8, overflow: 'hidden' }}>
              <div onClick={() => setOpen(open === d.id ? null : d.id)} style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{d.boat}{d.price ? ` · ${money(d.price)}` : ''}</div>
                  <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>
                    {d.buyer.email || d.inviteEmail || '—'} ↔ {d.seller.email || '—'}
                  </div>
                </div>
                <div style={{ background: urgencyTint(d.urgency), color: urgencyColor(d.urgency), borderRadius: 20, padding: '5px 12px', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {d.state}
                </div>
                <div style={{ fontSize: 11.5, color: SLATE, minWidth: 128, textAlign: 'right' }}>
                  {d.state === 'Closed'
                    ? <><b style={{ color: '#0f6e56' }}>closed</b>
                        {typeof d.closedDays === 'number' && <div>{d.closedDays}d ago</div>}</>
                    : <>waiting on <b style={{ color: NAVY }}>{d.waitingOn}</b>
                        {typeof d.idleDays === 'number' && <div style={{ color: d.idleDays >= 7 ? '#b45309' : SLATE }}>quiet {d.idleDays}d</div>}</>}
                </div>
              </div>

              {open === d.id && (
                <div style={{ borderTop: `1px solid ${MIST}`, background: '#f8fafc', padding: '13px 15px', fontSize: 12.5, lineHeight: 1.8, color: SLATE }}>
                  <div style={{ color: NAVY, marginBottom: 8 }}>{d.note}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '2px 20px' }}>
                    <div><b>Buyer:</b> {d.buyer.name || '—'} · {d.buyer.email || '—'}</div>
                    <div><b>Seller:</b> {d.seller.name || '—'} · {d.seller.email || '—'}</div>
                    <div><b>Started by:</b> {d.initiatorRole || '—'}</div>
                    <div><b>Other party joined:</b> {d.joined ? 'yes' : 'no'}</div>
                    <div><b>Fee paid:</b> {d.paid ? 'yes' : 'no'}</div>
                    <div><b>Deposit:</b> {d.deposit ? money(d.deposit) : 'none'}</div>
                    <div><b>Escrow:</b> {d.escrow || '—'}</div>
                    <div><b>Offers exchanged:</b> {d.offers}</div>
                    <div><b>HIN:</b> {d.hin || '—'}</div>
                    <div><b>Age:</b> {d.createdDays ?? '—'}d · quiet {d.idleDays ?? '—'}d</div>
                    {d.depositDeadline && <div><b>Deposit due:</b> {new Date(d.depositDeadline).toLocaleString()}</div>}
                    {d.closedAt && <div><b>Closed on:</b> {new Date(d.closedAt).toLocaleDateString()}</div>}
                  </div>
                  <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${MIST}`, fontSize: 11.5 }}>
                    <b>Deal ID:</b> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4 }}>{d.id}</code>
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${MIST}`, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    <button style={ctlBtn} disabled={!!actionBusy} onClick={() => { const n = window.prompt('Note to attach to this deal:'); if (n) runAction('adminAddNote', d.id, { note: n }) }}>Add note</button>
                    <button style={ctlBtn} disabled={!!actionBusy} onClick={() => runAction('adminResendInvite', d.id)}>Re-arm invite</button>
                    <button style={ctlBtn} disabled={!!actionBusy} onClick={() => runAction('adminClearJoin', d.id)}>Detach 2nd party</button>
                    <button style={ctlBtn} disabled={!!actionBusy} onClick={() => runAction('adminResetDeposit', d.id)}>Reset deposit</button>
                    <button style={ctlBtn} disabled={!!actionBusy} onClick={() => runAction('adminResetRole', d.id, { role: 'buyer' })}>Initiator = buyer</button>
                    <button style={ctlBtn} disabled={!!actionBusy} onClick={() => runAction('adminResetRole', d.id, { role: 'seller' })}>Initiator = seller</button>
                    {DONE.includes(d.state) && <button style={ctlBtn} disabled={!!actionBusy} onClick={() => runAction('adminReopenDeal', d.id)}>Reopen deal</button>}
                    <button style={{ ...ctlBtn, color: '#b91c1c', borderColor: '#f5b5b5' }} disabled={!!actionBusy} onClick={() => runAction('adminDeleteDeal', d.id)}>Delete</button>
                  </div>
                  {actionMsg && (
                    <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700, color: actionMsg.ok ? '#0f6e56' : '#b91c1c' }}>{actionMsg.text}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, fontSize: 11, color: SLATE, textAlign: 'center', lineHeight: 1.7 }}>
          Loaded {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}.<br />
          Showing up to 500 deals, most recently active first.
        </div>
      </div>
    </div>
  )
}
