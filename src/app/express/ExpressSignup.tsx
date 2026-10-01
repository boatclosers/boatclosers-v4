'use client'

import { useState } from 'react'

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
      <p role="status" className="rounded-lg bg-white/10 px-5 py-4 text-white">
        You are on the list. We will email you the day BC Express opens.
      </p>
    )
  }

  return (
    <div>
      <label htmlFor="express-email" className="block font-medium text-white">
        Get notified when BC Express opens
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
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
          className="w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-[#1B2430] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleJoin}
          disabled={status === 'sending'}
          className="whitespace-nowrap rounded-lg bg-[#C9A227] px-6 py-3 font-semibold text-[#0E2A47] hover:bg-[#d8b33a] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {status === 'sending' ? 'Joining...' : 'Join the list'}
        </button>
      </div>
      {status === 'error' && (
        <p role="alert" className="mt-3 text-sm text-[#F3D27A]">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
