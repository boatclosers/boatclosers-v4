'use client'

import { useState } from 'react'

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function ExpressSignup() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // hidden spam trap
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleJoin() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setStatus('error')
      setErrorMsg('Enter a valid email address, like you@example.com.')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/express-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), website }),
      })
      if (!res.ok) throw new Error('bad response')
      setStatus('done')
    } catch {
      setStatus('error')
      setErrorMsg('Your email did not go through. Check your connection and try again.')
    }
  }

  if (status === 'done') {
    return (
      <div
        role="status"
        style={{
          border: `1px solid ${gold}`,
          borderRadius: 6,
          background: 'rgba(201,150,46,0.1)',
          padding: '20px 24px',
          fontSize: 17,
          lineHeight: 1.6,
        }}
      >
        You are on the list. We will email you the day BC Express opens.
      </div>
    )
  }

  return (
    <div>
      <label
        htmlFor="express-email"
        style={{ display: 'block', fontSize: 16, fontWeight: 700, marginBottom: 10 }}
      >
        Get notified when BC Express opens
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 560 }}>
        <input
          id="express-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleJoin()
          }}
          style={{
            flex: '1 1 260px',
            padding: '14px 16px',
            fontSize: 16,
            borderRadius: 4,
            border: '1px solid rgba(201,150,46,0.5)',
            background: cream,
            color: navy,
          }}
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={handleJoin}
          disabled={status === 'sending'}
          style={{
            background: gold,
            color: navy,
            padding: '14px 32px',
            borderRadius: 4,
            border: 'none',
            fontWeight: 700,
            fontSize: 16,
            cursor: status === 'sending' ? 'default' : 'pointer',
            opacity: status === 'sending' ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? 'Joining...' : 'Join the List'}
        </button>
      </div>
      {status === 'error' && (
        <p role="alert" style={{ color: gold, fontSize: 15, marginTop: 12 }}>
          {errorMsg}
        </p>
      )}
    </div>
  )
}
