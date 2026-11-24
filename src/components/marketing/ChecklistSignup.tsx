'use client'

import { useState } from 'react'

const gold = '#c9962e'
const cream = '#f5f1e8'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export default function ChecklistSignup() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/checklist-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setState('done')
      try {
        window.gtag?.('event', 'checklist_signup')
        window.fbq?.('track', 'Lead', { content_name: 'boat_deal_checklist' })
      } catch {}
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (state === 'done') {
    return (
      <div className="no-print" style={{ padding: '18px 22px', border: `1px solid ${gold}`, borderRadius: 6, marginTop: 20 }}>
        Done. Check your inbox for the checklist link.
      </div>
    )
  }

  return (
    <form className="no-print" onSubmit={submit} style={{ marginTop: 20 }}>
      <label htmlFor="cl-email" style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
        Or get it by email
      </label>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          id="cl-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '14px 16px',
            fontSize: 17,
            borderRadius: 4,
            border: '1px solid rgba(201,150,46,0.6)',
            background: 'rgba(245,241,232,0.06)',
            color: cream,
          }}
        />
        {/* Hidden spam trap: people never see or fill this. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          style={{
            background: 'transparent',
            color: cream,
            border: `1px solid ${gold}`,
            padding: '13px 26px',
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          {state === 'sending' ? 'Sending…' : 'Email it to me'}
        </button>
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8, color: state === 'error' ? '#f4a3a3' : cream }}>
        {state === 'error' ? message : 'We’ll send the checklist link and the occasional boat-deal tip. Unsubscribe anytime.'}
      </div>
    </form>
  )
}
