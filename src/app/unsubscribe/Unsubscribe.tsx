'use client'

import { useEffect, useState } from 'react'

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'
const muted = '#bdb6a8'

type Action = 'stop-email' | 'stop-all' | 'texts' | 'resume'

export default function Unsubscribe() {
  const [e, setE] = useState('')
  const [s, setS] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Action | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    setE(q.get('e') || '')
    setS(q.get('s') || '')
  }, [])

  async function go(action: Action) {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(`/api/unsubscribe?e=${encodeURIComponent(e)}&s=${encodeURIComponent(s)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, phone }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'That didn’t work.')
      setDone(action)
    } catch (x: any) {
      setErr(x?.message || 'That didn’t work.')
    }
    setBusy(false)
  }

  const btn = (primary: boolean) => ({
    background: primary ? gold : 'transparent',
    color: primary ? navy : cream,
    border: `1px solid ${gold}`,
    borderRadius: 6,
    padding: '13px 18px',
    fontSize: 15,
    fontWeight: 700,
    cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.6 : 1,
    textAlign: 'left' as const,
  })

  if (!e || !s) {
    return <p style={{ color: muted, lineHeight: 1.6 }}>Open this page from the link at the bottom of a BoatClosers email.</p>
  }

  if (done) {
    const msg = {
      'stop-email': 'Done. We won’t email you anymore.',
      'stop-all': 'Done. We won’t email or text you anymore.',
      texts: 'Done. You’ll get texts instead of emails. Reply STOP to any text to stop those too.',
      resume: 'Done. Emails are back on.',
    }[done]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, margin: 0 }}>{msg}</h1>
        {done !== 'resume' && (
          <button type="button" onClick={() => go('resume')} style={{ ...btn(false), alignSelf: 'flex-start' }}>
            Changed your mind? Turn emails back on
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 30, margin: 0 }}>How should we reach you?</h1>
      <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
        For <b style={{ color: cream }}>{e}</b>. If you’re in the middle of a deal, these messages carry offers, signatures, and
        deadlines, so stopping them means checking your deal yourself.
      </p>
      <button type="button" disabled={busy} onClick={() => go('stop-email')} style={btn(true)}>
        Stop emails
      </button>
      <div style={{ border: '1px solid rgba(201,150,46,0.35)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label htmlFor="u-phone" style={{ fontWeight: 600 }}>
          Text me instead
        </label>
        <input
          id="u-phone"
          type="tel"
          autoComplete="tel"
          placeholder="Mobile number"
          value={phone}
          onChange={(x) => setPhone(x.target.value)}
          style={{ padding: '12px 14px', fontSize: 16, borderRadius: 6, border: '1px solid rgba(201,150,46,0.35)', background: cream, color: navy }}
        />
        <button type="button" disabled={busy} onClick={() => go('texts')} style={btn(false)}>
          Switch to texts
        </button>
        <span style={{ fontSize: 12, color: muted, lineHeight: 1.5 }}>Message and data rates may apply. Reply STOP to any text to stop.</span>
      </div>
      <button type="button" disabled={busy} onClick={() => go('stop-all')} style={btn(false)}>
        Stop all emails and texts
      </button>
      {err && (
        <p role="alert" style={{ margin: 0, color: gold }}>
          {err}
        </p>
      )}
    </div>
  )
}
