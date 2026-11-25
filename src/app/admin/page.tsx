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
  const [view, setView] = useState<'today' | 'full' | 'express' | 'mbi' | 'stats' | 'mbl' | 'mls' | 'pay' | 'tools'>('today')
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
            Every app, every customer, and what needs you today.
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
    const hay = `${d.id} ${d.ref || ''} ${d.boat} ${d.hin} ${d.buyer.email} ${d.seller.email} ${d.buyer.name} ${d.seller.name} ${d.inviteEmail}`.toLowerCase()
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
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {([['today', 'Today'], ['full', `BoatClosers · $249${t.needsAttention ? ` (${t.needsAttention} need you)` : ''}`], ['stats', 'Funnel & AI use'], ['express', `My Boat Closing · $29.99 (${t.expressAll ?? 0})`], ['mbi', 'My Boat Inspector'], ['mbl', 'My Boat Logs'], ['mls', 'My Boat Listing'], ['pay', 'Payments & refunds'], ['tools', 'Tools & links']] as const).map(([k, l]) => (
            <button key={k} onClick={() => { setView(k); setOpen(null) }}
              style={{ padding: '10px 16px', fontSize: 13.5, fontWeight: 800, borderRadius: 8, cursor: 'pointer',
                border: `2px solid ${view === k ? BRASS : MIST}`, background: view === k ? '#fff' : '#f8fafc', color: NAVY }}>
              {l}
            </button>
          ))}
        </div>

        {view === 'today' && <TodayPanel pw={pw} data={data} Stat={Stat} go={(v: any) => { setView(v); setOpen(null) }} />}
        {view === 'tools' && <>
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
          <QuickLinks />
          <EmailLog pw={pw} />
        </>}
        {view === 'mbi' && <MbiPanel pw={pw} Stat={Stat} />}
        {view === 'stats' && <StatsPanel pw={pw} Stat={Stat} />}
        {view === 'mbl' && <MblPanel pw={pw} Stat={Stat} />}
        {view === 'mls' && <ListingPanel pw={pw} Stat={Stat} />}
        {view === 'pay' && <PaymentsPanel pw={pw} Stat={Stat} />}

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
                    {d.ref ? `${d.ref} · ` : ''}{d.buyer.email || d.inviteEmail || '—'} ↔ {d.seller.email || '—'}
                  </div>
                  {Array.isArray(d.flags) && d.flags.length > 0 && (
                    <ul style={{ margin: '7px 0 0', padding: '7px 10px 7px 26px', background: '#fdecec', border: '1px solid #f5b5b5', borderRadius: 6, color: '#991b1b', fontSize: 12, lineHeight: 1.55 }}>
                      {d.flags.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
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

// ---------- Today: the whole suite on one screen ----------
// What needs you, who's new, what came in, and one search box across every app.
// Uses the deals and My Boat Closing purchases already loaded, plus the other apps'
// existing read-only summaries and Stripe. Nothing here changes anything.
const APP_TONE: Record<string, string> = {
  'BoatClosers': '#08152e', 'My Boat Closing': '#1d4ed8', 'My Boat Inspector': '#0f6e56', 'My Boat Logs': '#7c3aed', 'My Boat Listing': '#b8863a', 'Stripe': '#b91c1c',
}
const APP_TAB: Record<string, string> = {
  'BoatClosers': 'full', 'My Boat Closing': 'express', 'My Boat Inspector': 'mbi', 'My Boat Logs': 'mbl', 'My Boat Listing': 'mls', 'Stripe': 'pay',
}
function AppTag({ app }: { app: string }) {
  return <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fff', background: APP_TONE[app] || SLATE, borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>{app}</span>
}
function TodayPanel({ pw, data, Stat, go }: any) {
  const [mbi, setMbi] = useState<any>(null)
  const [mbl, setMbl] = useState<any>(null)
  const [lst, setLst] = useState<any>(null)
  const [pays, setPays] = useState<any[] | null>(null)
  const [errs, setErrs] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')
  const load = async () => {
    setBusy(true)
    const [a, b, c, d] = await Promise.all([adminCall(pw, 'mbiList'), adminCall(pw, 'mblOverview'), adminCall(pw, 'listingOverview'), adminCall(pw, 'payments')])
    const e: string[] = []
    if (a.ok) setMbi(a); else e.push('My Boat Inspector: ' + (a.error || 'could not load'))
    if (b.ok) setMbl(b); else e.push('My Boat Logs: ' + (b.error || 'could not load'))
    if (c.ok) setLst(c); else e.push('My Boat Listing: ' + (c.error || 'could not load'))
    if (d.ok) setPays((d.payments || []).filter((x: any) => x.livemode)); else e.push('Stripe: ' + (d.error || 'could not load'))
    setErrs(e); setBusy(false)
  }
  useEffect(() => { load() }, [])

  const deals: any[] = data?.deals || []
  const express: any[] = data?.express || []
  const insp: any[] = mbi?.inspections || []
  const boats: any[] = mbl?.boats || []
  const listings: any[] = lst?.listings || []
  const daysSince = (iso?: string | null) => iso ? Math.floor((Date.now() - Date.parse(iso)) / 86400000) : null

  // 1. Needs you
  type Item = { app: string; who: string; what: string; why: string; red?: boolean }
  const need: Item[] = []
  for (const d of deals) if (!d.test && d.urgency >= 4) need.push({ app: 'BoatClosers', who: [d.buyer?.email, d.seller?.email].filter(Boolean).join(' / ') || d.inviteEmail || 'no email', what: d.boat, why: [`${d.state}${d.waitingOn && d.waitingOn !== '—' ? ` (waiting on ${d.waitingOn.toLowerCase()})` : ''}`, ...(d.flags || [])].join(' · '), red: d.urgency >= 5 })
  for (const e of express) {
    if (!e.paid || e.test) continue
    if (typeof e.titleDaysLeft === 'number' && e.titleDaysLeft <= 5) need.push({ app: 'My Boat Closing', who: e.buyer?.email || 'no email', what: (e.items || [])[0] || 'Purchase', why: e.titleDaysLeft < 0 ? `Title application ${-e.titleDaysLeft} days OVERDUE` : `Title application due in ${e.titleDaysLeft} days`, red: e.titleDaysLeft <= 2 })
    else if (e.stage === 'Paid, not started' && (e.idleDays ?? 0) >= 3) need.push({ app: 'My Boat Closing', who: e.buyer?.email || 'no email', what: (e.items || [])[0] || 'Purchase', why: `Paid, hasn't started (quiet ${e.idleDays} days)` })
  }
  for (const r of insp) {
    if (r.test) continue
    if (String(r.stage || '').startsWith('REFUND REQUESTED')) need.push({ app: 'My Boat Inspector', who: r.email || 'guest', what: r.boat, why: r.stage, red: true })
    else if (r.paid && r.stage === 'Unlocked, not started' && (r.idleDays ?? 0) >= 3) need.push({ app: 'My Boat Inspector', who: r.email || 'guest', what: r.boat, why: `Paid, hasn't started (quiet ${r.idleDays} days)` })
  }
  for (const b of boats) {
    if (b.plan === 'past_due') need.push({ app: 'My Boat Logs', who: b.email || 'no email', what: b.name || [b.year, b.make, b.model].filter(Boolean).join(' '), why: 'Payment issue on their yearly plan', red: true })
    else if (b.plan === 'trialing' && b.trialEndsAt) {
      const left = Math.ceil((Date.parse(b.trialEndsAt) - Date.now()) / 86400000)
      if (left <= 3) need.push({ app: 'My Boat Logs', who: b.email || 'no email', what: b.name || 'Boat', why: `Free trial ends in ${Math.max(left, 0)} day${left === 1 ? '' : 's'}` })
    }
  }
  for (const p of pays || []) if (p.disputed) need.push({ app: 'Stripe', who: p.email || 'unknown', what: `${p.product} · $${(p.amount / 100).toFixed(2)}`, why: 'Payment DISPUTED (chargeback). Respond in Stripe.', red: true })
  need.sort((a, b) => Number(!!b.red) - Number(!!a.red))

  // 2. New customers, last 7 days
  type New = { app: string; who: string; what: string; days: number }
  const fresh: New[] = []
  for (const d of deals) if (!d.test && (d.createdDays ?? 99) <= 7) fresh.push({ app: 'BoatClosers', who: d[d.initiatorRole]?.email || d.buyer?.email || d.seller?.email || 'no email', what: `Started a deal: ${d.boat}`, days: d.createdDays })
  for (const e of express) if (!e.test && (e.createdDays ?? 99) <= 7) fresh.push({ app: 'My Boat Closing', who: e.buyer?.email || 'no email', what: e.paid ? 'Paid for a closing' : 'Started (free tools)', days: e.createdDays })
  for (const r of insp) if (!r.test && (r.createdDays ?? 99) <= 7) fresh.push({ app: 'My Boat Inspector', who: r.email || 'guest', what: `${r.role === 'Seller' ? 'Seller' : 'Buyer'} inspection: ${r.boat}`, days: r.createdDays })
  for (const b of boats) { const n = daysSince(b.createdAt); if (n !== null && n <= 7) fresh.push({ app: 'My Boat Logs', who: b.email || 'no email', what: `Added a boat: ${b.name || [b.year, b.make, b.model].filter(Boolean).join(' ')}`, days: n }) }
  for (const x of listings) { const n = daysSince(x.createdAt); if (n !== null && n <= 7) fresh.push({ app: 'My Boat Listing', who: x.email || 'no email yet', what: `Started a listing${x.boat ? `: ${x.boat}` : ''}`, days: n }) }
  fresh.sort((a, b) => a.days - b.days)
  const newToday = fresh.filter(f => f.days === 0).length

  // 3. Money in (Stripe, live, after refunds)
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0)
  const net = (since: number) => (pays || []).filter((p: any) => p.created >= since).reduce((s: number, p: any) => s + p.amount - (p.refunded || 0), 0) / 100
  const byProduct: Record<string, number> = {}
  for (const p of pays || []) if (p.created >= Date.now() - 30 * 86400000) byProduct[p.product] = (byProduct[p.product] || 0) + (p.amount - (p.refunded || 0)) / 100
  const $ = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // 4. One search across every app
  type Hit = { app: string; title: string; sub: string }
  const hits: Hit[] = []
  const term = q.trim().toLowerCase()
  if (term.length >= 2) {
    const has = (...xs: any[]) => xs.filter(Boolean).join(' ').toLowerCase().includes(term)
    for (const d of deals) if (has(d.id, d.ref, d.boat, d.hin, d.buyer?.email, d.seller?.email, d.buyer?.name, d.seller?.name, d.inviteEmail)) hits.push({ app: 'BoatClosers', title: d.boat, sub: `${d.state} · ${[d.buyer?.email, d.seller?.email].filter(Boolean).join(' / ')}${d.ref ? ` · ${d.ref}` : ''}` })
    for (const e of express) if (has(e.id, e.buyer?.email, e.buyer?.name, e.seller, ...(e.items || []))) hits.push({ app: 'My Boat Closing', title: (e.items || [])[0] || 'Purchase', sub: `${e.stage} · ${e.buyer?.email || ''}` })
    for (const r of insp) if (has(r.id, r.email, r.boat, r.hin)) hits.push({ app: 'My Boat Inspector', title: r.boat, sub: `${r.stage} · ${r.email || 'guest'}` })
    for (const b of boats) if (has(b.id, b.email, b.name, b.hin, b.make, b.model)) hits.push({ app: 'My Boat Logs', title: b.name || [b.year, b.make, b.model].filter(Boolean).join(' '), sub: `${b.plan} · ${b.email || ''}` })
    for (const x of listings) if (has(x.id, x.email, x.boat)) hits.push({ app: 'My Boat Listing', title: x.boat || 'Listing', sub: `step ${(x.step || 0) + 1} · ${x.email || 'no email'}` })
    for (const p of pays || []) if (has(p.id, p.email, p.name)) hits.push({ app: 'Stripe', title: `${p.product} · $${(p.amount / 100).toFixed(2)}${p.refunded ? ` (refunded $${(p.refunded / 100).toFixed(2)})` : ''}`, sub: `${p.email} · ${new Date(p.created).toLocaleDateString()}` })
  }

  const row: any = { background: '#fff', border: `1px solid ${MIST}`, borderRadius: 8, padding: '10px 13px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <Stat label="Needs you" value={need.length} tone={need.some(n => n.red) ? '#b91c1c' : need.length ? '#b45309' : '#0f6e56'} />
        <Stat label="New customers today / 7 days" value={`${newToday} / ${fresh.length}`} />
        <Stat label="Money in today" value={pays ? $(net(midnight.getTime())) : '…'} tone="#0f6e56" />
        <Stat label="Last 7 days" value={pays ? $(net(Date.now() - 7 * 86400000)) : '…'} tone="#0f6e56" />
        <Stat label="Last 30 days" value={pays ? $(net(Date.now() - 30 * 86400000)) : '…'} tone="#0f6e56" />
      </div>
      {errs.length > 0 && <div style={{ background: '#fff8e6', border: '1px solid #f0d9a8', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#7a5500', marginBottom: 12 }}>Some apps didn&apos;t load, so this view may be missing items: {errs.join(' · ')}</div>}

      <div style={card}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ ...h3, margin: 0 }}>Find a customer</div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Email, name, boat, HIN or deal ref, across every app" style={{ flex: 1, minWidth: 240, padding: '9px 12px', fontSize: 13, borderRadius: 7, border: `1px solid ${MIST}` }} />
          <button onClick={load} style={ctlBtn} disabled={busy}>{busy ? 'Loading…' : 'Reload'}</button>
        </div>
        {term.length >= 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {hits.length === 0 && <div style={{ fontSize: 12.5, color: SLATE }}>No matches in any app.</div>}
            {hits.slice(0, 40).map((h, i) => (
              <div key={i} style={{ ...row, background: '#f8fafc' }}>
                <AppTag app={h.app} />
                <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{h.title}</div><div style={{ fontSize: 12, color: SLATE }}>{h.sub}</div></div>
                <button style={ctlBtn} onClick={() => go(APP_TAB[h.app])}>Open {h.app}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={card}>
        <div style={h3}>Needs you ({need.length})</div>
        <div style={{ fontSize: 12, color: SLATE, marginBottom: 8 }}>Stuck deals, paid customers who haven&apos;t started, deadlines, refund requests, payment problems and chargebacks, from every app.</div>
        {need.length === 0 && <div style={{ fontSize: 13, color: '#0f6e56', fontWeight: 700 }}>Nothing needs you right now.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {need.map((n, i) => (
            <div key={i} style={{ ...row, borderLeft: `4px solid ${n.red ? '#b91c1c' : '#b45309'}` }}>
              <AppTag app={n.app} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{n.what} <span style={{ fontWeight: 400, color: SLATE }}>· {n.who}</span></div>
                <div style={{ fontSize: 12, color: n.red ? '#b91c1c' : SLATE }}>{n.why}</div>
              </div>
              <button style={ctlBtn} onClick={() => go(APP_TAB[n.app])}>Open</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ ...card, flex: '2 1 420px' }}>
          <div style={h3}>New customers, last 7 days ({fresh.length})</div>
          {fresh.length === 0 && <div style={{ fontSize: 12.5, color: SLATE }}>No one new this week.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {fresh.slice(0, 60).map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12.5, borderTop: i ? `1px solid ${MIST}` : 'none', paddingTop: i ? 6 : 0 }}>
                <AppTag app={f.app} />
                <div style={{ flex: 1, minWidth: 200, color: NAVY }}><b>{f.who}</b> <span style={{ color: SLATE }}>· {f.what}</span></div>
                <div style={{ color: SLATE, fontSize: 11.5 }}>{f.days === 0 ? 'today' : f.days === 1 ? 'yesterday' : `${f.days} days ago`}</div>
                {APP_TAB[f.app] && <button style={ctlBtn} onClick={() => go(APP_TAB[f.app])}>Open</button>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...card, flex: '1 1 260px' }}>
          <div style={h3}>Money in by app, last 30 days</div>
          {!pays && <div style={{ fontSize: 12.5, color: SLATE }}>Loading…</div>}
          {pays && Object.keys(byProduct).length === 0 && <div style={{ fontSize: 12.5, color: SLATE }}>No live payments in the last 30 days.</div>}
          {Object.entries(byProduct).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderTop: `1px solid ${MIST}` }}><span>{k}</span><b style={{ color: NAVY }}>{$(v)}</b></div>
          ))}
          <div style={{ fontSize: 11, color: SLATE, marginTop: 6 }}>From Stripe, live payments only, after refunds. Test unlocks never count.</div>
        </div>
      </div>
    </>
  )
}

// ---------- Tools & links ----------
const LINKS: [string, [string, string][]][] = [
  ['Your sites', [
    ['BoatClosers', 'https://www.boatclosers.com'], ['My Boat Closing', 'https://www.myboatclosing.com'], ['My Boat Inspector', 'https://www.myboatinspector.com'],
    ['My Boat Logs', 'https://www.myboatlogs.com'], ['My Boat Listing', 'https://www.myboatlisting.com'], ['Hub page', 'https://www.boatclosers.com/hub'],
  ]],
  ['Money', [
    ['Stripe dashboard', 'https://dashboard.stripe.com'], ['Stripe payments', 'https://dashboard.stripe.com/payments'], ['Stripe disputes', 'https://dashboard.stripe.com/disputes'], ['Escrow.com', 'https://www.escrow.com'],
  ]],
  ['Running the apps', [
    ['Vercel (sites and deploys)', 'https://vercel.com/dashboard'], ['GitHub (code and pull requests)', 'https://github.com/boatclosers'],
    ['Supabase: BoatClosers', 'https://supabase.com/dashboard/project/xoihnmkgncuocxiknvgs'], ['Supabase: My Boat Logs + Listing', 'https://supabase.com/dashboard/project/dnjdqndllwjyccrrraap'], ['Supabase: all projects', 'https://supabase.com/dashboard/projects'],
    ['Resend (emails sent)', 'https://resend.com/emails'],
  ]],
  ['Getting found', [
    ['Google Analytics', 'https://analytics.google.com'], ['Google Search Console', 'https://search.google.com/search-console'], ['Bing Webmaster Tools', 'https://www.bing.com/webmasters'],
  ]],
]
function QuickLinks() {
  return (
    <div style={card}>
      <div style={h3}>Quick links</div>
      <div style={{ fontSize: 12, color: SLATE, marginBottom: 10 }}>Everything you use to run the business, in one place. Opens in a new tab.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {LINKS.map(([group, items]) => (
          <div key={group}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: BRASS, textTransform: 'uppercase', marginBottom: 6 }}>{group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {items.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{label}</a>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmailLog({ pw }: any) {
  const [rows, setRows] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')
  const load = async () => {
    setBusy(true); setErr('')
    const j = await adminCall(pw, 'emailLog')
    if (j.ok) setRows(j.emails || []); else setErr(j.error || 'Could not load emails.')
    setBusy(false)
  }
  const bad = /bounce|complain|fail|suppress|delay/i
  const list = (rows || []).filter(e => !q.trim() || `${e.to} ${e.subject}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div style={card}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ ...h3, margin: 0 }}>Did they get our email?</div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email address or subject" style={{ flex: 1, minWidth: 200, padding: '8px 12px', fontSize: 12.5, borderRadius: 7, border: `1px solid ${MIST}` }} />
        <button onClick={load} style={ctlBtn} disabled={busy}>{busy ? 'Loading…' : rows ? 'Reload' : 'Show recent emails'}</button>
      </div>
      <div style={{ fontSize: 12, color: SLATE, marginTop: 6 }}>The last 100 emails sent from BoatClosers and My Boat Closing, with what happened to each (delivered, opened, bounced). Handy when a customer says &ldquo;I never got it.&rdquo;</div>
      {err && <div style={{ background: '#fdecec', border: '1px solid #f5b5b5', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#b91c1c', marginTop: 10 }}>{err}</div>}
      {rows && (
        <div style={{ overflowX: 'auto', marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead><tr style={{ textAlign: 'left', color: SLATE }}><th style={{ padding: '6px 8px' }}>When</th><th style={{ padding: '6px 8px' }}>To</th><th style={{ padding: '6px 8px' }}>Subject</th><th style={{ padding: '6px 8px' }}>Status</th></tr></thead>
            <tbody>
              {list.map(e => (
                <tr key={e.id} style={{ borderTop: `1px solid ${MIST}` }}>
                  <td style={{ padding: '6px 8px', whiteSpace: 'nowrap', color: SLATE }}>{e.at ? new Date(e.at).toLocaleString() : ''}</td>
                  <td style={{ padding: '6px 8px', color: NAVY }}>{e.to}</td>
                  <td style={{ padding: '6px 8px' }}>{e.subject}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, color: bad.test(e.status) ? '#b91c1c' : e.status ? '#0f6e56' : SLATE }}>{e.status || '—'}</td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={4} style={{ padding: '10px 8px', color: SLATE }}>No emails match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
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


// ---------- My Boat Listing (separate app) ----------
// Listings are saved in the My Boat Logs database; listing_overview() returns a summary.
// Revenue comes from Stripe (charges tagged product "My Boat Listing").
// One listing's answers, shown as plain label/value lines (empty answers left out).
function ListingAnswers({ data }: { data: Record<string, any> }) {
  const label = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
  const show = (v: any): string => {
    if (v === true) return 'Yes'
    if (v === false || v == null) return ''
    if (Array.isArray(v)) return v.map(show).filter(Boolean).join(' · ')
    if (typeof v === 'object') return Object.entries(v).map(([k, x]) => { const s = show(x); return s ? `${label(k)}: ${s}` : '' }).filter(Boolean).join(' · ')
    return String(v).trim()
  }
  const rows = Object.entries(data).map(([k, v]) => [label(k), show(v)] as const).filter(([, v]) => v)
  return (
    <div style={{ marginTop: 10, background: '#fff', border: `1px solid ${MIST}`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Their answers</div>
      {rows.length === 0 ? <div>Nothing filled in yet.</div> : rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 10, borderTop: `1px solid ${MIST}`, padding: '4px 0' }}>
          <div style={{ minWidth: 150, fontWeight: 600 }}>{k}</div>
          <div style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: NAVY }}>{v}</div>
        </div>
      ))}
    </div>
  )
}
// Builder steps since the November 2026 rebuild (older listings used 6 steps: HIN, boat, story, records, direct, listings).
const LISTING_STEPS = ['HIN', 'The boat', 'Power', 'Photos', 'Equipment', 'Your story', 'Records & disclosures', 'Write it', 'Publish & share']
const OLD_STEP = [0, 1, 5, 6, 7, 8]
const stepOf = (x: any) => Math.min(x.v === '2' ? (x.step || 0) : OLD_STEP[Math.min(x.step || 0, 5)], LISTING_STEPS.length - 1)
function ListingPanel({ pw, Stat }: any) {
  const [d, setD] = useState<any>(null)
  const [pays, setPays] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [detail, setDetail] = useState<Record<string, any>>({})
  const [help, setHelp] = useState<Record<string, string>>({})
  const [act, setAct] = useState('')
  const [msg, setMsg] = useState('')
  const view = async (id: string) => {
    if (detail[id]) { setDetail(({ [id]: _, ...rest }) => rest); return }
    setAct('view:' + id); setMsg('')
    const j = await adminCall(pw, 'listingGet', { listingId: id })
    if (j.ok) setDetail(v => ({ ...v, [id]: j.listing })); else setMsg(j.error || 'Could not open that listing.')
    setAct('')
  }
  const makeHelp = async (id: string) => {
    if (help[id] && !window.confirm('Make a NEW help link? The old help link will stop working. The seller\'s own link keeps working.')) return
    setAct('help:' + id); setMsg('')
    const j = await adminCall(pw, 'listingHelp', { listingId: id })
    if (j.ok) setHelp(v => ({ ...v, [id]: j.link })); else setMsg(j.error || 'Could not make a help link.')
    setAct('')
  }
  const del = async (x: any) => {
    if (!window.confirm(`Permanently DELETE this listing${x.boat ? ` (${x.boat})` : ''}${x.email ? ` for ${x.email}` : ''}? The seller's edit link will stop working. This cannot be undone.`)) return
    setAct('del:' + x.id); setMsg('')
    const j = await adminCall(pw, 'listingDelete', { listingId: x.id })
    if (j.ok) { setD((v: any) => v ? { ...v, listings: (v.listings || []).filter((y: any) => y.id !== x.id) } : v); setOpen(null); setMsg(j.done || 'Deleted.') }
    else setMsg(j.error || 'Could not delete.')
    setAct('')
  }
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); setMsg('Link copied.') } catch { setMsg('Copy did not work. Select the link and copy it.') } }
  const load = async () => {
    setBusy(true); setErr('')
    const [j, p] = await Promise.all([adminCall(pw, 'listingOverview'), adminCall(pw, 'payments')])
    if (j.ok) setD(j); else setErr(j.error || 'Could not load My Boat Listing.')
    if (p.ok) setPays((p.payments || []).filter((x: any) => x.product === 'My Boat Listing' && x.livemode))
    setBusy(false)
  }
  useEffect(() => { load() }, [])
  const t = d?.totals || {}
  const all: any[] = d?.listings || []
  const done = (x: any) => !!x.published || (x.v !== '2' && (x.step || 0) >= 5)
  const paidEmails = new Set((pays || []).map((x: any) => String(x.email || '').toLowerCase()).filter(Boolean))
  const isPaid = (x: any) => x.paid || (x.email && paidEmails.has(String(x.email).toLowerCase()))
  const revenue = (pays || []).reduce((s: number, x: any) => s + (x.amount - (x.refunded || 0)), 0) / 100
  const byPlan: Record<string, number> = {}
  for (const x of pays || []) { const k = x.meta?.plan || 'Other'; byPlan[k] = (byPlan[k] || 0) + 1 }
  const rows = all
    .filter((x: any) => f === 'all' || (f === 'done' && done(x)) || (f === 'progress' && !done(x)) || (f === 'paid' && isPaid(x)) || (f === 'noemail' && !x.email))
    .filter((x: any) => !q.trim() || `${x.boat || ''} ${x.email || ''} ${x.plan || ''}`.toLowerCase().includes(q.trim().toLowerCase()))
  const Tab = ({ id, label }: any) => (
    <button onClick={() => setF(id)} style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 7, cursor: 'pointer',
      border: `1px solid ${f === id ? NAVY : MIST}`, background: f === id ? NAVY : '#fff', color: f === id ? '#fff' : SLATE }}>{label}</button>
  )
  return (
    <>
      {err && <div style={{ background: '#fdecec', border: '1px solid #f5b5b5', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#b91c1c', marginBottom: 12 }}>{err}</div>}
      {msg && <div style={{ background: '#eef6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: NAVY, marginBottom: 12 }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <Stat label="Listings started" value={t.all ?? 0} />
        <Stat label="New this week" value={t.new7 ?? 0} />
        <Stat label="Published pages" value={t.published ?? t.finished ?? 0} />
        <Stat label="Page views" value={t.views ?? 0} />
        <Stat label="Payments" value={pays ? pays.length : '…'} tone="#0f6e56" />
        <Stat label="Revenue (after refunds)" value={pays ? '$' + revenue.toFixed(2) : '…'} tone="#0f6e56" />
      </div>
      <div style={card}>
        <div style={h3}>Where sellers are</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px 18px', fontSize: 12.5, color: SLATE, marginTop: 8 }}>
          {LISTING_STEPS.map((s, i) => (
            <div key={s}>{i + 1}. {s}: <b style={{ color: NAVY }}>{all.filter((x: any) => stepOf(x) === i).length}</b></div>
          ))}
          <div>No email yet: <b style={{ color: NAVY }}>{all.filter((x: any) => !x.email).length}</b></div>
          {Object.keys(byPlan).length > 0 && <div>Paid by plan: <b style={{ color: NAVY }}>{Object.entries(byPlan).map(([k, v]) => `${k} ${v}`).join(' · ')}</b></div>}
        </div>
        {all.length >= 300 && <div style={{ fontSize: 11.5, color: SLATE, marginTop: 8 }}>Showing the newest 300 listings.</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <Tab id="all" label={`All (${all.length})`} />
        <Tab id="progress" label="In progress" />
        <Tab id="done" label="Published" />
        <Tab id="paid" label="Paid" />
        <Tab id="noemail" label="No email" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search boat, email, plan" style={{ padding: '8px 12px', fontSize: 12.5, borderRadius: 7, border: `1px solid ${MIST}`, minWidth: 180 }} />
        <button onClick={load} style={{ ...ctlBtn, marginLeft: 'auto' }} disabled={busy}>{busy ? 'Loading…' : 'Reload'}</button>
      </div>
      {d && rows.length === 0 && <div style={{ background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, padding: '2rem', textAlign: 'center', color: SLATE, fontSize: 13.5 }}>Nothing here.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((x: any) => {
          const st = stepOf(x)
          const paid = isPaid(x)
          const [label, tone] = paid ? ['Paid', '#0f6e56'] : x.published ? ['Published', '#1d4ed8'] : done(x) ? ['Finished', '#1d4ed8'] : ['In progress', '#64748b']
          return (
            <div key={x.id} style={{ background: '#fff', border: `1px solid ${MIST}`, borderLeft: `4px solid ${tone}`, borderRadius: 8, overflow: 'hidden' }}>
              <div onClick={() => setOpen(open === x.id ? null : x.id)} style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{x.boat || 'Boat not entered yet'}{x.plan ? <span style={{ fontWeight: 400, color: SLATE }}> · {x.plan} plan</span> : null}</div>
                  <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{x.email || 'no email yet'} · step {st + 1} of {LISTING_STEPS.length}: {LISTING_STEPS[st]}</div>
                </div>
                <div style={{ background: '#f8fafc', color: tone, borderRadius: 20, padding: '5px 12px', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</div>
                <div style={{ fontSize: 11.5, color: SLATE, minWidth: 110, textAlign: 'right' }}>started {ago(x.createdAt)}<div>last saved {ago(x.updatedAt)}</div></div>
              </div>
              {open === x.id && (
                <div style={{ borderTop: `1px solid ${MIST}`, background: '#f8fafc', padding: '13px 15px', fontSize: 12.5, lineHeight: 1.8, color: SLATE }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '2px 20px' }}>
                    <div><b>Boat:</b> {x.boat || '—'}</div>
                    <div><b>Plan:</b> {x.plan || '—'}</div>
                    <div><b>Photos:</b> {x.photos ?? 0}</div>
                    <div><b>Page:</b> {x.published && x.slug ? <a href={`https://www.myboatlisting.com/b/${x.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: NAVY, fontWeight: 700 }}>open listing page</a> : 'not published'}{x.views ? ` · ${x.views} views` : ''}</div>
                    <div><b>Step:</b> {st + 1} of {LISTING_STEPS.length} ({LISTING_STEPS[st]})</div>
                    <div><b>Email:</b> {x.email || '—'}</div>
                    <div><b>Started:</b> {x.createdAt ? new Date(x.createdAt).toLocaleString() : '—'}</div>
                    <div><b>Last saved:</b> {x.updatedAt ? new Date(x.updatedAt).toLocaleString() : '—'}</div>
                  </div>
                  <div style={{ marginTop: 9, fontSize: 11.5 }}><b>ID:</b> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4 }}>{x.id}</code></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    <button style={ctlBtn} disabled={!!act} onClick={() => view(x.id)}>{act === 'view:' + x.id ? 'Opening…' : detail[x.id] ? 'Hide answers' : 'See their answers'}</button>
                    <button style={ctlBtn} disabled={!!act} onClick={() => makeHelp(x.id)}>{act === 'help:' + x.id ? 'Making link…' : help[x.id] ? 'New help link' : 'Make a help link'}</button>
                    <button style={{ ...ctlBtn, color: '#b91c1c', borderColor: '#f5b5b5' }} disabled={!!act} onClick={() => del(x)}>{act === 'del:' + x.id ? 'Deleting…' : 'Delete'}</button>
                  </div>
                  {help[x.id] && (
                    <div style={{ marginTop: 10, background: '#fff', border: `1px solid ${MIST}`, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, color: NAVY }}>Help link</div>
                      <div style={{ fontSize: 12, marginTop: 2 }}>Opens this listing so you can fix it, or send it to the seller if they lost their link. Their own link keeps working. Open it in a private window so it doesn&apos;t replace a listing you&apos;re building in this browser.</div>
                      <code style={{ display: 'block', wordBreak: 'break-all', background: '#f8fafc', padding: '6px 8px', borderRadius: 6, marginTop: 6, fontSize: 11.5 }}>{help[x.id]}</code>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        <button style={ctlBtn} onClick={() => copy(help[x.id])}>Copy link</button>
                        <a style={{ ...ctlBtn, textDecoration: 'none' }} href={help[x.id]} target="_blank" rel="noopener noreferrer">Open listing</a>
                        {x.email && <a style={{ ...ctlBtn, textDecoration: 'none' }} href={`mailto:${encodeURIComponent(x.email)}?subject=${encodeURIComponent('Your boat listing link')}&body=${encodeURIComponent(`Here's a link back to your listing${x.boat ? ` for the ${x.boat}` : ''}: ${help[x.id]}`)}`}>Write the seller an email</a>}
                      </div>
                    </div>
                  )}
                  {detail[x.id] && <ListingAnswers data={detail[x.id].data || {}} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 11.5, color: SLATE, marginTop: 12 }}>See answers, make a help link or delete from inside each listing. Payments and revenue come from Stripe (live charges for My Boat Listing). A listing shows as Paid when its email matches a payment. Refunds are in the Payments &amp; refunds tab. Listings are only saved here once the seller&apos;s browser reaches the database, so a few may exist only on the seller&apos;s device.</div>
    </>
  )
}

// Payments & refunds: every product pays into one Stripe account, so one list
// covers them all. A refund always asks for the amount and a confirmation.
function PaymentsPanel({ pw, Stat }: any) {
  const [d, setD] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')
  const [prod, setProd] = useState('all')
  const [refunding, setRefunding] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState<any>(null)
  const load = async () => {
    setBusy(true); setErr('')
    const j = await adminCall(pw, 'payments')
    if (j.ok) setD(j.payments); else setErr(j.error || 'Could not load payments.')
    setBusy(false)
  }
  useEffect(() => { load() }, [])
  const usd = (c: number) => '$' + (c / 100).toFixed(2)
  const rows = (d || [])
    .filter((p) => prod === 'all' || p.product === prod)
    .filter((p) => !q.trim() || `${p.email} ${p.name} ${p.product}`.toLowerCase().includes(q.trim().toLowerCase()))
  const products = Array.from(new Set((d || []).map((p) => p.product)))
  const total = (d || []).reduce((a, p) => a + p.amount, 0)
  const refundedTotal = (d || []).reduce((a, p) => a + p.refunded, 0)

  const startRefund = (p: any) => { setRefunding(p); setAmount(((p.amount - p.refunded) / 100).toFixed(2)); setReason(''); setMsg(null) }
  const doRefund = async () => {
    const cents = Math.round(parseFloat(amount || '0') * 100)
    const left = refunding.amount - refunding.refunded
    if (!cents || cents <= 0) { setMsg({ ok: false, text: 'Enter an amount above $0.' }); return }
    if (cents > left) { setMsg({ ok: false, text: `Only ${usd(left)} is left to refund.` }); return }
    if (!window.confirm(`Refund ${usd(cents)} to ${refunding.email || 'this customer'} for ${refunding.product}? This can't be undone.`)) return
    setBusy(true)
    const j = await adminCall(pw, 'refund', { chargeId: refunding.id, amountCents: cents, reason })
    setBusy(false)
    if (j.ok) { setMsg({ ok: true, text: j.done }); setRefunding(null); load() }
    else setMsg({ ok: false, text: j.error || 'Refund failed.' })
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 14 }}>
        <Stat label="Payments shown" value={(d || []).length} />
        <Stat label="Collected" value={usd(total)} />
        <Stat label="Refunded" value={usd(refundedTotal)} tone={refundedTotal ? '#b45309' : undefined} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <select value={prod} onChange={(e) => setProd(e.target.value)} style={{ padding: '8px 10px', borderRadius: 7, border: `1px solid ${MIST}`, fontSize: 13 }}>
          <option value="all">All products</option>
          {products.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or name" style={{ flex: 1, minWidth: 180, padding: '8px 10px', borderRadius: 7, border: `1px solid ${MIST}`, fontSize: 13 }} />
        <button onClick={load} disabled={busy} style={{ padding: '8px 14px', borderRadius: 7, border: `1px solid ${MIST}`, background: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>{busy ? 'Loading…' : 'Refresh'}</button>
      </div>
      {err && <div style={{ padding: 12, borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 13, marginBottom: 12 }}>{err}</div>}
      {msg && <div style={{ padding: 12, borderRadius: 8, background: msg.ok ? '#ecfdf5' : '#fef2f2', color: msg.ok ? '#0f6e56' : '#b91c1c', fontSize: 13, marginBottom: 12 }}>{msg.text}</div>}

      {refunding && (
        <div style={{ border: `2px solid ${BRASS}`, borderRadius: 10, padding: 16, marginBottom: 14, background: '#fffdf7' }}>
          <div style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}>Refund {refunding.email || 'this customer'}</div>
          <div style={{ fontSize: 13, color: SLATE, marginTop: 4 }}>{refunding.product} · paid {usd(refunding.amount)} on {new Date(refunding.created).toLocaleDateString()}{refunding.refunded ? ` · already refunded ${usd(refunding.refunded)}` : ''}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY }}>Amount ($)
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" style={{ display: 'block', marginTop: 4, padding: '8px 10px', borderRadius: 7, border: `1px solid ${MIST}`, width: 120, fontSize: 14 }} />
            </label>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, flex: 1, minWidth: 200 }}>Note (for your records)
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. didn't start the inspection" style={{ display: 'block', marginTop: 4, padding: '8px 10px', borderRadius: 7, border: `1px solid ${MIST}`, width: '100%', boxSizing: 'border-box', fontSize: 14 }} />
            </label>
          </div>
          {refunding.product === 'My Boat Inspector' && <div style={{ fontSize: 12, color: SLATE, marginTop: 8 }}>Your policy: full refund if not started; 7-day refund if no report; no refund once a report is made unless challenged. A full refund locks the inspection again.</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={doRefund} disabled={busy} style={{ padding: '9px 16px', borderRadius: 7, border: 0, background: '#b91c1c', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Refund {amount ? '$' + amount : ''}</button>
            <button onClick={() => setRefunding(null)} style={{ padding: '9px 16px', borderRadius: 7, border: `1px solid ${MIST}`, background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: `1px solid ${MIST}`, borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: SLATE, borderBottom: `1px solid ${MIST}` }}>
              {['Date', 'Customer', 'Product', 'Paid', 'Refunded', ''].map((h) => <th key={h} style={{ padding: '10px 12px', fontWeight: 700 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const left = p.amount - p.refunded
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${MIST}` }}>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{new Date(p.created).toLocaleDateString()}{!p.livemode && <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 800, color: '#b45309' }}>TEST</span>}</td>
                  <td style={{ padding: '10px 12px' }}>{p.name && <div style={{ fontWeight: 700, color: NAVY }}>{p.name}</div>}<div style={{ color: SLATE }}>{p.email || '—'}</div></td>
                  <td style={{ padding: '10px 12px' }}>{p.product}{p.disputed && <span style={{ marginLeft: 6, color: '#b91c1c', fontWeight: 800 }}>Disputed</span>}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{usd(p.amount)}</td>
                  <td style={{ padding: '10px 12px', color: p.refunded ? '#b45309' : SLATE }}>{p.refunded ? usd(p.refunded) : '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {left > 0 ? <button onClick={() => startRefund(p)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${MIST}`, background: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}>Refund…</button> : <span style={{ fontSize: 12, color: SLATE }}>Fully refunded</span>}
                  </td>
                </tr>
              )
            })}
            {d && !rows.length && <tr><td colSpan={6} style={{ padding: 18, color: SLATE, textAlign: 'center' }}>No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: SLATE, marginTop: 10 }}>Shows the 100 most recent payments in your Stripe account, from every product. Refunds go back to the customer’s card, usually within 5 to 10 business days.</div>
    </div>
  )
}
