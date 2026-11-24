'use client'

import { useState } from 'react'

const navy = '#0f1b2d'
const gold = '#c9962e'

const input = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '13px 14px',
  fontSize: 16,
  borderRadius: 4,
  border: '1px solid #c9b78f',
  background: '#fff',
  color: navy,
  marginBottom: 12,
}

export default function OfferForm({ code }: { code: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [emailed, setEmailed] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/offer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, email, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      try {
        ;(window as any).gtag?.('event', 'offer_link_started')
        ;(window as any).fbq?.('track', 'Lead', { content_name: 'offer_link' })
      } catch {}
      if (data.emailed) {
        setEmailed(true)
        setBusy(false)
        return
      }
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  if (emailed) {
    return (
      <div style={{ fontSize: 15.5, lineHeight: 1.6, fontWeight: 600 }}>
        You&apos;ve already started an offer on this boat. We just emailed you a link back to it.
      </div>
    )
  }

  return (
    <form onSubmit={submit}>
      <input style={input} required placeholder="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <input
        style={input}
        required
        type="email"
        placeholder="Your email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* Hidden spam trap: people never see or fill this. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
      />
      <button
        type="submit"
        disabled={busy}
        style={{
          width: '100%',
          background: gold,
          color: navy,
          border: 'none',
          padding: '15px 20px',
          borderRadius: 4,
          fontWeight: 700,
          fontSize: 17,
          cursor: 'pointer',
        }}
      >
        {busy ? 'Opening your deal room…' : 'Make an offer'}
      </button>
      {error && <div style={{ color: '#b42318', fontSize: 14, marginTop: 10 }}>{error}</div>}
      <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 10 }}>
        We&apos;ll email you a link back to your offer. The seller sees your name and email.
      </div>
    </form>
  )
}
