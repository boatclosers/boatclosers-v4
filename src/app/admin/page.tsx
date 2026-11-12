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

const testBadge: any = { marginLeft: 8, fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#7a5500', background: '#fff4dd', border: '1px solid #f0d9a8', borderRadius: 4, padding: '1px 6px', verticalAlign: 'middle' }

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
  const [view, setView] = useState<'full' | 'express' | 'mbi' | 'stats' | 'mbl'>('full')
  const [exFilter, setExFilter] = useState('paid')
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
      adminExpressDelete: 'Permanently DELETE this Express purchase? This cannot be undone.',
      adminTestUnlock: 'Unlock every step of this deal for free, as a TEST? It will be marked Test and never count as revenue.',
      adminExpressTestUnlock: 'Unlock this Express purchase for free, as a TEST? It will be marked Test and never count as revenue.',
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
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {([['full', 'BoatClosers · $249'], ['stats', 'Funnel & AI use'], ['express', `My Boat Closing · $29.99 (${t.expressAll ?? 0})`], ['mbi', 'My Boat Inspector'], ['mbl', 'My Boat Logs']] as const).map(([k, l]) => (
            <button key={k} onClick={() => { setView(k); setOpen(null) }}
              style={{ padding: '10px 16px', fontSize: 13.5, fontWeight: 800, borderRadius: 8, cursor: 'pointer',
                border: `2px solid ${view === k ? BRASS : MIST}`, background: view === k ? '#fff' : '#f8fafc', color: NAVY }}>
              {l}
            </button>
          ))}
        </div>

        {view === 'mbi' && <MbiPanel pw={pw} Stat={Stat} />}
        {view === 'stats' && <StatsPanel pw={pw} Stat={Stat} />}
        {view === 'mbl' && <MblPanel pw={pw} Stat={Stat} />}

        {view === 'express' && <ExpressPanel data={data} exFilter={exFilter} setExFilter={setExFilter} open={open} setOpen={setOpen} runAction={runAction} actionBusy={actionBusy} actionMsg={actionMsg} q={q} setQ={setQ} Stat={Stat} />}

        {view === 'full' && <>
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
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{d.boat}{d.price ? ` · ${money(d.price)}` : ''}{d.test && <span style={testBadge}>TEST</span>}</div>
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
                    <div><b>Fee paid:</b> {d.test ? 'test unlock (free)' : d.paid ? 'yes' : 'no'}</div>
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
                    {!d.paid && <button style={{ ...ctlBtn, color: '#fff', background: NAVY, borderColor: NAVY }} disabled={!!actionBusy} onClick={() => runAction('adminTestUnlock', d.id)}>Unlock as test deal</button>}
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
        </>}
      </div>
    </div>
  )
}

// ---------- My Boat Closing purchases ----------

function ExpressPanel({ data, exFilter, setExFilter, open, setOpen, runAction, actionBusy, actionMsg, q, setQ, Stat }: any) {
  const ex: any[] = data?.express || []
  const t = data?.totals || {}
  const dueSoon = ex.filter(e => e.paid && typeof e.titleDaysLeft === 'number' && e.titleDaysLeft <= 9)
  const list = ex.filter(e => {
    if (exFilter === 'paid' && !e.paid) return false
    if (exFilter === 'unpaid' && e.paid) return false
    if (exFilter === 'due' && !dueSoon.includes(e)) return false
    if (!q.trim()) return true
    const hay = `${e.id} ${e.buyer.name} ${e.buyer.email} ${e.seller} ${e.items.join(' ')}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })
  const tone = (e: any) => (!e.paid ? '#64748b' : e.titleDaysLeft !== null && e.titleDaysLeft !== undefined && e.titleDaysLeft <= 2 ? '#b91c1c' : e.stage === 'Titled' ? '#0f6e56' : '#1d4ed8')
  const Tab = ({ id, label, n }: any) => (
    <button onClick={() => setExFilter(id)}
      style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 7, cursor: 'pointer',
        border: `1px solid ${exFilter === id ? NAVY : MIST}`, background: exFilter === id ? NAVY : '#fff', color: exFilter === id ? '#fff' : SLATE }}>
      {label}{typeof n === 'number' ? ` (${n})` : ''}
    </button>
  )
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="Paid purchases" value={t.expressPaid ?? 0} />
        <Stat label="Express revenue" value={'$' + Number(t.expressRevenue || 0).toFixed(2)} tone="#0f6e56" />
        <Stat label="Started, not paid" value={(t.expressAll ?? 0) - (t.expressPaid ?? 0)} />
        <Stat label="Title due in 9 days" value={dueSoon.length} tone={dueSoon.length ? '#b45309' : undefined} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <Tab id="paid" label="Paid" n={ex.filter(e => e.paid).length} />
        <Tab id="due" label="Title due soon" n={dueSoon.length} />
        <Tab id="unpaid" label="Not paid" n={ex.filter(e => !e.paid).length} />
        <Tab id="all" label="All" n={ex.length} />
        <input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Search buyer, email, boat"
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', fontSize: 13, borderRadius: 7, border: `1px solid ${MIST}` }} />
      </div>
      {list.length === 0 && (
        <div style={{ background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, padding: '2rem', textAlign: 'center', color: SLATE, fontSize: 13.5 }}>
          {exFilter === 'paid' ? 'No paid Express purchases yet.' : 'Nothing here.'}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(e => (
          <div key={e.id} style={{ background: '#fff', border: `1px solid ${MIST}`, borderLeft: `4px solid ${tone(e)}`, borderRadius: 8, overflow: 'hidden' }}>
            <div onClick={() => setOpen(open === e.id ? null : e.id)} style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{e.items.map((i: string) => i.split(': ')[1]).join(' + ') || '—'}{e.price ? ` · ${money(e.price)}` : ''}{e.test && <span style={testBadge}>TEST</span>}</div>
                <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{e.buyer.name} · {e.buyer.email}</div>
              </div>
              <div style={{ background: '#f8fafc', color: tone(e), borderRadius: 20, padding: '5px 12px', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>{e.stage}</div>
              <div style={{ fontSize: 11.5, color: SLATE, minWidth: 128, textAlign: 'right' }}>
                {e.titleDue && e.titleDaysLeft !== null
                  ? <>title due <b style={{ color: e.titleDaysLeft <= 2 ? '#b91c1c' : NAVY }}>{e.titleDaysLeft < 0 ? `${-e.titleDaysLeft}d late` : `in ${e.titleDaysLeft}d`}</b></>
                  : <>started {e.createdDays ?? '—'}d ago</>}
              </div>
            </div>
            {open === e.id && (
              <div style={{ borderTop: `1px solid ${MIST}`, background: '#f8fafc', padding: '13px 15px', fontSize: 12.5, lineHeight: 1.8, color: SLATE }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '2px 20px' }}>
                  <div><b>Buyer:</b> {e.buyer.name} · {e.buyer.email}</div>
                  <div><b>Seller:</b> {e.seller || '—'}</div>
                  <div><b>Buying:</b> {e.items.join(' · ')}</div>
                  <div><b>Paid:</b> {e.test ? 'test unlock (free)' : e.paid ? (e.paidAt ? new Date(e.paidAt).toLocaleDateString() : 'yes') : 'no'}</div>
                  <div><b>Inspection:</b> {e.inspected} items · {e.photos} photos</div>
                  <div><b>Questions sent to seller:</b> {e.asked}</div>
                  <div><b>Seller sent papers:</b> {e.sellerSent ? `${e.sellerSent}x` : 'no'}</div>
                  <div><b>Sale date:</b> {e.saleDate || '—'}</div>
                  <div><b>Title due:</b> {e.titleDue || '—'}</div>
                  <div><b>Reminders sent:</b> {e.reminders.length ? e.reminders.join(', ') : 'none'}</div>
                  <div><b>$29.99 credit used on $249:</b> {e.creditUsed ? 'yes' : 'no'}</div>
                  <div><b>Quiet:</b> {e.idleDays ?? '—'}d</div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${MIST}`, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {!e.paid && <button style={{ ...ctlBtn, color: '#fff', background: NAVY, borderColor: NAVY }} disabled={!!actionBusy} onClick={() => runAction('adminExpressTestUnlock', '', { expressId: e.id })}>Unlock as test</button>}
                  <a href={`/express/deal/${e.token}`} target="_blank" rel="noopener noreferrer" style={{ ...ctlBtn, textDecoration: 'none' }}>Open buyer&apos;s page</a>
                  <button style={ctlBtn} onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/express/deal/${e.token}`)}>Copy buyer&apos;s link</button>
                  <button style={{ ...ctlBtn, color: '#b91c1c', borderColor: '#f5b5b5' }} disabled={!!actionBusy} onClick={() => runAction('adminExpressDelete', '', { expressId: e.id })}>Delete</button>
                </div>
                {actionMsg && <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700, color: actionMsg.ok ? '#0f6e56' : '#b91c1c' }}>{actionMsg.text}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 11, color: SLATE, textAlign: 'center', lineHeight: 1.7 }}>
        The buyer&apos;s link opens their purchase exactly as they see it. Anything you change there changes it for them.
      </div>
    </>
  )
}

// ---------- My Boat Inspector (separate app) ----------

function MbiPanel({ pw, Stat }: any) {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<any>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [f, setF] = useState('all')
  const call = async (action: string, boatId = '') => {
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sessionStorage.getItem('bc_admin') || pw, action, boatId }) })
    return r.json().catch(() => ({ error: 'Bad response' }))
  }
  const load = async () => {
    setBusy('load'); setErr('')
    const j = await call('mbiList')
    if (j.ok) setD(j); else setErr(j.error || 'Could not load My Boat Inspector.')
    setBusy('')
  }
  useEffect(() => { load() }, [])
  const act = async (action: string, id: string, confirmText: string) => {
    if (!window.confirm(confirmText)) return
    setBusy(action + id); setMsg(null)
    const j = await call(action, id)
    setMsg(j.ok ? { ok: true, text: j.done || 'Done' } : { ok: false, text: j.error || 'Failed' })
    setBusy(''); if (j.ok) load()
  }
  const t = d?.totals || {}
  const rows: any[] = (d?.inspections || []).filter((r: any) => f === 'paid' ? r.paid : f === 'unpaid' ? !r.unlocked : f === 'test' ? r.test : true)
  const tone = (r: any) => r.report ? '#0f6e56' : r.unlocked ? '#1d4ed8' : '#64748b'
  const Tab = ({ id, label }: any) => (
    <button onClick={() => setF(id)} style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 7, cursor: 'pointer',
      border: `1px solid ${f === id ? NAVY : MIST}`, background: f === id ? NAVY : '#fff', color: f === id ? '#fff' : SLATE }}>{label}</button>
  )
  return (
    <>
      {d?.paywallOff && (
        <div style={{ background: '#fff8e6', border: '1px solid #f0d9a8', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, color: '#7a5500', marginBottom: 12 }}>
          My Boat Inspector&apos;s paywall is currently <b>off for testing</b> (PAYWALL_OFF=true), so every inspection is open. Turn it off before launch.
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="Inspections started" value={t.all ?? 0} />
        <Stat label="Paid" value={t.paid ?? 0} />
        <Stat label="Revenue" value={'$' + Number(t.revenue || 0).toFixed(2)} tone="#0f6e56" />
        <Stat label="Reports finished" value={t.reports ?? 0} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <Tab id="all" label={`All (${t.all ?? 0})`} />
        <Tab id="paid" label={`Paid (${t.paid ?? 0})`} />
        <Tab id="unpaid" label="Not paid" />
        <Tab id="test" label={`Test (${t.tests ?? 0})`} />
        <button onClick={load} style={{ ...ctlBtn, marginLeft: 'auto' }} disabled={!!busy}>{busy === 'load' ? 'Loading…' : 'Reload'}</button>
      </div>
      {err && <div style={{ background: '#fdecec', border: '1px solid #f5b5b5', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#b91c1c', marginBottom: 12 }}>{err}</div>}
      {d && rows.length === 0 && <div style={{ background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, padding: '2rem', textAlign: 'center', color: SLATE, fontSize: 13.5 }}>Nothing here.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r: any) => (
          <div key={r.id} style={{ background: '#fff', border: `1px solid ${MIST}`, borderLeft: `4px solid ${tone(r)}`, borderRadius: 8, overflow: 'hidden' }}>
            <div onClick={() => setOpen(open === r.id ? null : r.id)} style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.boat}{r.test && <span style={testBadge}>TEST</span>}</div>
                <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{r.role}{r.email ? ` · ${r.email}` : ' · guest'}{r.hin ? ` · HIN ${r.hin}` : ''}</div>
              </div>
              <div style={{ background: '#f8fafc', color: tone(r), borderRadius: 20, padding: '5px 12px', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>{r.stage}</div>
              <div style={{ fontSize: 11.5, color: SLATE, minWidth: 110, textAlign: 'right' }}>started {r.createdDays ?? '—'}d ago<div>quiet {r.idleDays ?? '—'}d</div></div>
            </div>
            {open === r.id && (
              <div style={{ borderTop: `1px solid ${MIST}`, background: '#f8fafc', padding: '13px 15px', fontSize: 12.5, lineHeight: 1.8, color: SLATE }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '2px 20px' }}>
                  <div><b>Who:</b> {r.role}</div>
                  <div><b>Asking / price:</b> {r.price || '—'}</div>
                  <div><b>Paid:</b> {r.test ? 'test unlock (free)' : r.paid ? 'yes' : 'no'}</div>
                  <div><b>Areas checked:</b> {r.areas}</div>
                  <div><b>Report:</b> {r.report ? 'finished' : 'not yet'}</div>
                  <div><b>Comparable boats:</b> {r.comps ? 'found' : '—'}</div>
                </div>
                <div style={{ marginTop: 9, fontSize: 11.5 }}><b>ID:</b> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4 }}>{r.id}</code></div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${MIST}`, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {!r.unlocked && <button style={{ ...ctlBtn, color: '#fff', background: NAVY, borderColor: NAVY }} disabled={!!busy}
                    onClick={() => act('mbiTestUnlock', r.id, 'Unlock this inspection for free, as a TEST? It will be marked Test and never count as revenue.')}>Unlock as test</button>}
                  <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ ...ctlBtn, textDecoration: 'none' }}>Open inspection</a>
                  <button style={{ ...ctlBtn, color: '#b91c1c', borderColor: '#f5b5b5' }} disabled={!!busy}
                    onClick={() => act('mbiDelete', r.id, 'Permanently DELETE this inspection, its photos and answers? This cannot be undone.')}>Delete</button>
                </div>
                <div style={{ marginTop: 6, fontSize: 11 }}>Inspections are tied to the device that started them, so &ldquo;Open inspection&rdquo; works on that device.</div>
                {msg && <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700, color: msg.ok ? '#0f6e56' : '#b91c1c' }}>{msg.text}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

async function adminCall(pw: string, action: string, extra: any = {}) {
  const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: sessionStorage.getItem('bc_admin') || pw, action, ...extra }) })
  return r.json().catch(() => ({ error: 'Bad response' }))
}
const ago = (iso?: string | null) => {
  if (!iso) return '—'
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 48) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
const STEP_NAME: Record<string, string> = { vessel: 'Boat', parties: 'People', negotiate: 'Deal Room', diligence: 'Due diligence', documents: 'Documents', closing: 'Closing' }
const card: any = { background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }
const h3: any = { fontSize: 14, fontWeight: 800, color: NAVY, margin: '0 0 4px' }
const sub: any = { fontSize: 11.5, color: SLATE, marginBottom: 12, lineHeight: 1.55 }

function StatsPanel({ pw, Stat }: any) {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [win, setWin] = useState<'d7' | 'd30' | 'all'>('d30')
  const [openQ, setOpenQ] = useState<number | null>(null)
  const load = async () => {
    setBusy(true); setErr('')
    const j = await adminCall(pw, 'stats')
    if (j.ok) setD(j); else setErr(j.error || 'Could not load.')
    setBusy(false)
  }
  useEffect(() => { load() }, [])
  const f: any[] = d?.funnel?.[win] || []
  const top = f[0]?.count || 0
  const ai = d?.ai || {}
  const at = ai.totals || {}
  return (
    <>
      {err && <div style={{ background: '#fdecec', border: '1px solid #f5b5b5', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#b91c1c', marginBottom: 12 }}>{err}</div>}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={h3}>Where new deals drop off</div>
            <div style={sub}>How many deals reached each step, by when they were started. Test deals are left out. Compare a couple of weeks against earlier ones to see what guided mode changed.</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {([['d7', 'Last 7 days'], ['d30', 'Last 30 days'], ['all', 'All time']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setWin(k)} style={{ ...ctlBtn, background: win === k ? NAVY : '#fff', color: win === k ? '#fff' : NAVY, borderColor: win === k ? NAVY : MIST }}>{l}</button>
            ))}
            <button onClick={load} style={ctlBtn} disabled={busy}>{busy ? 'Loading…' : 'Reload'}</button>
          </div>
        </div>
        {d && top === 0 && <div style={{ fontSize: 13, color: SLATE, padding: '8px 0' }}>No deals started in this period.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {f.map((row: any, i: number) => {
            const pct = top ? Math.round((row.count / top) * 100) : 0
            const prev = i ? f[i - 1].count : row.count
            const lost = prev - row.count
            return (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 190px) 1fr 120px', gap: 10, alignItems: 'center', fontSize: 12.5 }}>
                <div style={{ fontWeight: 700, color: NAVY }}>{row.label}</div>
                <div style={{ background: '#eef2f7', borderRadius: 6, height: 22, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(pct, row.count ? 2 : 0)}%`, height: '100%', background: i === f.length - 1 ? '#0f6e56' : NAVY, borderRadius: 6 }} />
                </div>
                <div style={{ color: SLATE, textAlign: 'right' }}><b style={{ color: NAVY }}>{row.count}</b> · {pct}%{i > 0 && lost > 0 ? <span style={{ color: '#b45309' }}> · −{lost}</span> : null}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={card}>
        <div style={h3}>Virtual Broker use</div>
        <div style={sub}>
          Questions customers asked the AI. {ai.keySet === false ? <b style={{ color: '#b91c1c' }}>The AI key is not set, so it can&apos;t answer. </b> : null}
          Model: {ai.model || '—'} · limit {ai.dailyLimit || 40} questions per person per day.
          {ai.available === false ? ' The question log table is missing.' : ''}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <Stat label="Questions today" value={at.today ?? 0} />
          <Stat label="Last 7 days" value={at.week ?? 0} />
          <Stat label="Last 30 days" value={at.month ?? 0} />
          <Stat label="People who asked" value={at.people ?? 0} />
          <Stat label="Hit the limit today" value={at.atLimitToday ?? 0} tone={(at.atLimitToday ?? 0) > 0 ? '#b45309' : undefined} />
        </div>
        {ai.byStep && Object.keys(ai.byStep).length > 0 && (
          <div style={{ fontSize: 12, color: SLATE, marginBottom: 12 }}>
            <b style={{ color: NAVY }}>Where they ask:</b>{' '}
            {Object.entries(ai.byStep).sort((a: any, b: any) => b[1] - a[1]).map(([k, v]: any) => `${STEP_NAME[k] || k} ${v}`).join(' · ')}
          </div>
        )}
        <div style={{ fontSize: 12.5, fontWeight: 800, color: NAVY, margin: '6px 0 6px' }}>Per customer</div>
        {(ai.users || []).length === 0 && <div style={{ fontSize: 12.5, color: SLATE }}>Nobody has asked yet.</div>}
        {(ai.users || []).length > 0 && (
          <div style={{ overflowX: 'auto', border: `1px solid ${MIST}`, borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr style={{ background: '#f8fafc', color: SLATE, textAlign: 'left' }}>
                {['Customer', 'Today', '7 days', '30 days', 'All', 'Deals', 'Last asked', 'Last question'].map(h => <th key={h} style={{ padding: '8px 10px', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {ai.users.map((u: any) => (
                  <tr key={u.userId} style={{ borderTop: `1px solid ${MIST}` }}>
                    <td style={{ padding: '8px 10px', color: NAVY, fontWeight: 600, whiteSpace: 'nowrap' }}>{u.email || u.userId.slice(0, 8)}<div style={{ fontWeight: 400, color: SLATE, fontSize: 11 }}>{u.role}</div></td>
                    <td style={{ padding: '8px 10px', color: u.today >= (ai.dailyLimit || 40) ? '#b45309' : NAVY, fontWeight: 700 }}>{u.today}</td>
                    <td style={{ padding: '8px 10px' }}>{u.week}</td>
                    <td style={{ padding: '8px 10px' }}>{u.month}</td>
                    <td style={{ padding: '8px 10px' }}>{u.total}</td>
                    <td style={{ padding: '8px 10px' }}>{u.deals}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: SLATE }}>{ago(u.lastAt)}</td>
                    <td style={{ padding: '8px 10px', color: SLATE, minWidth: 220 }}>{String(u.lastQuestion || '').slice(0, 90)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(ai.recent || []).length > 0 && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: NAVY, margin: '16px 0 6px' }}>Latest questions and answers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ai.recent.map((m: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${MIST}`, borderRadius: 8, background: '#f8fafc' }}>
                  <div onClick={() => setOpenQ(openQ === i ? null : i)} style={{ padding: '9px 12px', cursor: 'pointer', fontSize: 12.5, display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                    <span style={{ color: NAVY }}><b>{m.question}</b></span>
                    <span style={{ color: SLATE, whiteSpace: 'nowrap', fontSize: 11.5 }}>{STEP_NAME[m.step] || m.step} · {m.email || '—'} · {ago(m.at)}</span>
                  </div>
                  {openQ === i && <div style={{ padding: '0 12px 10px', fontSize: 12.5, color: SLATE, whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.answer}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function MblPanel({ pw, Stat }: any) {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const load = async () => {
    setBusy(true); setErr('')
    const j = await adminCall(pw, 'mblOverview')
    if (j.ok) setD(j); else setErr(j.error || 'Could not load My Boat Logs.')
    setBusy(false)
  }
  useEffect(() => { load() }, [])
  const t = d?.totals || {}
  const PRICE = 39.99
  const PLAN: Record<string, [string, string]> = {
    setup: ['Not started', '#64748b'], trialing: ['Free trial', '#1d4ed8'], active: ['Paying', '#0f6e56'], past_due: ['Payment issue', '#b45309'], lapsed: ['Locked', '#b91c1c'],
  }
  const mb = (n: number) => n >= 1e9 ? (n / 1e9).toFixed(1) + ' GB' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : n >= 1e3 ? Math.round(n / 1e3) + ' KB' : (n || 0) + ' B'
  const rows: any[] = (d?.boats || []).filter((b: any) => (f === 'all' || b.plan === f || (f === 'ending' && b.plan === 'trialing' && b.trialEndsAt && Date.parse(b.trialEndsAt) - Date.now() < 7 * 86400000)))
    .filter((b: any) => !q.trim() || `${b.name} ${b.make} ${b.model} ${b.hin} ${b.email}`.toLowerCase().includes(q.trim().toLowerCase()))
  const Tab = ({ id, label }: any) => (
    <button onClick={() => setF(id)} style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 7, cursor: 'pointer',
      border: `1px solid ${f === id ? NAVY : MIST}`, background: f === id ? NAVY : '#fff', color: f === id ? '#fff' : SLATE }}>{label}</button>
  )
  return (
    <>
      {err && <div style={{ background: '#fdecec', border: '1px solid #f5b5b5', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#b91c1c', marginBottom: 12 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <Stat label="Owners" value={t.owners ?? 0} />
        <Stat label="New owners (7d / 30d)" value={`${t.ownersNew7 ?? 0} / ${t.ownersNew30 ?? 0}`} />
        <Stat label="Boats" value={t.boats ?? 0} />
        <Stat label="Paying boats" value={t.active ?? 0} tone="#0f6e56" />
        <Stat label="Yearly revenue (paying × $39.99)" value={'$' + ((t.active || 0) * PRICE).toFixed(2)} tone="#0f6e56" />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <Stat label="On free trial" value={t.trialing ?? 0} />
        <Stat label="Trials ending in 7 days" value={t.trialsEnding7 ?? 0} tone={(t.trialsEnding7 ?? 0) > 0 ? '#b45309' : undefined} />
        <Stat label="Not started (no card)" value={t.setup ?? 0} />
        <Stat label="Payment issue" value={t.pastDue ?? 0} tone={(t.pastDue ?? 0) > 0 ? '#b45309' : undefined} />
        <Stat label="Locked (lapsed)" value={t.lapsed ?? 0} tone={(t.lapsed ?? 0) > 0 ? '#b91c1c' : undefined} />
      </div>
      <div style={card}>
        <div style={h3}>What owners are logging</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px 18px', fontSize: 12.5, color: SLATE, marginTop: 8 }}>
          <div>Maintenance entries: <b style={{ color: NAVY }}>{t.logs ?? 0}</b></div>
          <div>Documents: <b style={{ color: NAVY }}>{t.documents ?? 0}</b> ({mb(t.docBytes || 0)})</div>
          <div>Reminders open: <b style={{ color: NAVY }}>{t.remindersOpen ?? 0}</b>{(t.remindersOverdue ?? 0) > 0 ? <span style={{ color: '#b45309' }}> · {t.remindersOverdue} overdue</span> : null}</div>
          <div>Trips: <b style={{ color: NAVY }}>{t.trips ?? 0}</b></div>
          <div>Expenses: <b style={{ color: NAVY }}>{t.expenses ?? 0}</b></div>
          <div>History report links: <b style={{ color: NAVY }}>{t.shares ?? 0}</b> · {t.shareViews ?? 0} views</div>
          <div>Transfers: <b style={{ color: NAVY }}>{t.transfersPending ?? 0}</b> pending · {t.transfersAccepted ?? 0} done</div>
          <div>Boats active this week: <b style={{ color: NAVY }}>{t.activeBoats7 ?? 0}</b></div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <Tab id="all" label={`All (${t.boats ?? 0})`} />
        <Tab id="active" label="Paying" />
        <Tab id="trialing" label="Trial" />
        <Tab id="ending" label="Trial ending soon" />
        <Tab id="setup" label="Not started" />
        <Tab id="past_due" label="Payment issue" />
        <Tab id="lapsed" label="Locked" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search boat, HIN, email" style={{ padding: '8px 12px', fontSize: 12.5, borderRadius: 7, border: `1px solid ${MIST}`, minWidth: 180 }} />
        <button onClick={load} style={{ ...ctlBtn, marginLeft: 'auto' }} disabled={busy}>{busy ? 'Loading…' : 'Reload'}</button>
      </div>
      {d && rows.length === 0 && <div style={{ background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, padding: '2rem', textAlign: 'center', color: SLATE, fontSize: 13.5 }}>Nothing here.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((b: any) => {
          const [label, tone] = PLAN[b.plan] || [b.plan, SLATE]
          const trialLeft = b.trialEndsAt ? Math.ceil((Date.parse(b.trialEndsAt) - Date.now()) / 86400000) : null
          const entries = (b.logs || 0) + (b.docs || 0) + (b.trips || 0) + (b.expenses || 0) + (b.remindersOpen || 0)
          return (
            <div key={b.id} style={{ background: '#fff', border: `1px solid ${MIST}`, borderLeft: `4px solid ${tone}`, borderRadius: 8, overflow: 'hidden' }}>
              <div onClick={() => setOpen(open === b.id ? null : b.id)} style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{b.name}{[b.year, b.make, b.model].filter(Boolean).length ? <span style={{ fontWeight: 400, color: SLATE }}> · {[b.year, b.make, b.model].filter(Boolean).join(' ')}</span> : null}</div>
                  <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{b.email || 'no email'}{b.hin ? ` · HIN ${b.hin}` : ''} · {entries} entries</div>
                </div>
                <div style={{ background: '#f8fafc', color: tone, borderRadius: 20, padding: '5px 12px', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {label}{b.plan === 'trialing' && trialLeft != null ? ` · ${Math.max(trialLeft, 0)}d left` : ''}
                </div>
                <div style={{ fontSize: 11.5, color: SLATE, minWidth: 110, textAlign: 'right' }}>added {ago(b.createdAt)}<div>last entry {ago(b.lastEntryAt)}</div></div>
              </div>
              {open === b.id && (
                <div style={{ borderTop: `1px solid ${MIST}`, background: '#f8fafc', padding: '13px 15px', fontSize: 12.5, lineHeight: 1.8, color: SLATE }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '2px 20px' }}>
                    <div><b>Maintenance entries:</b> {b.logs}</div>
                    <div><b>Documents:</b> {b.docs} ({mb(b.docBytes || 0)})</div>
                    <div><b>Reminders open:</b> {b.remindersOpen}{b.remindersOverdue ? ` (${b.remindersOverdue} overdue)` : ''}</div>
                    <div><b>Trips:</b> {b.trips}</div>
                    <div><b>Expenses:</b> {b.expenses}</div>
                    <div><b>Costs logged:</b> ${Number(b.costTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    <div><b>Report links:</b> {b.shares} · {b.shareViews} views</div>
                    <div><b>Engine hours:</b> {b.engineHours ?? '—'}</div>
                    <div><b>Trial ends:</b> {b.trialEndsAt ? new Date(b.trialEndsAt).toLocaleDateString() : '—'}</div>
                    <div><b>Renews:</b> {b.renewsAt ? new Date(b.renewsAt).toLocaleDateString() : '—'}</div>
                    {b.lapsedAt && <div><b>Locked since:</b> {new Date(b.lapsedAt).toLocaleDateString()}</div>}
                  </div>
                  <div style={{ marginTop: 9, fontSize: 11.5 }}><b>ID:</b> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4 }}>{b.id}</code></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 11.5, color: SLATE, marginTop: 12 }}>Read-only view. Billing isn&apos;t connected to Stripe yet, so &ldquo;Paying&rdquo; and revenue come from each boat&apos;s plan status.</div>
    </>
  )
}
