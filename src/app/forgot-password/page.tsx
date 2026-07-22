'use client'

import { useState } from 'react'

// Standalone password recovery for BoatClosers.
// Step 1: enter your email -> a 6-digit code is emailed.
// Step 2: enter the code + a new password -> password is updated.
// Both steps talk to /api/auth (actions: reset_request, reset_confirm).

const NAVY = '#08152e'
const BRASS = '#b8863a'
const SLATE = '#475569'

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState<'email' | 'code' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const post = async (body: any) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, data }
  }

  const sendCode = async () => {
    setError(''); setNotice('')
    if (!email.trim()) { setError('Enter the email address on your account.'); return }
    setBusy(true)
    const { ok, data } = await post({ action: 'reset_request', email: email.trim() })
    setBusy(false)
    if (!ok) { setError(data?.error || 'Something went wrong. Please try again.'); return }
    setNotice('If an account exists for that email, a 6-digit code is on its way. It expires in 15 minutes.')
    setStage('code')
  }

  const confirmCode = async () => {
    setError(''); setNotice('')
    if (!code.trim()) { setError('Enter the 6-digit code from your email.'); return }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return }
    setBusy(true)
    const { ok, data } = await post({
      action: 'reset_confirm',
      email: email.trim(),
      code: code.trim(),
      newPassword
    })
    setBusy(false)
    if (!ok) { setError(data?.error || 'Something went wrong. Please try again.'); return }
    setStage('done')
  }

  const wrap: React.CSSProperties = {
    minHeight: '100vh', background: NAVY, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '1.25rem', fontFamily: 'sans-serif'
  }
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: '2rem 1.75rem',
    width: '100%', maxWidth: 420, boxShadow: '0 18px 50px rgba(0,0,0,.35)'
  }
  const input: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 8,
    border: '1px solid #cbd5e1', marginTop: 6, boxSizing: 'border-box'
  }
  const label: React.CSSProperties = {
    fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginTop: 16
  }
  const button: React.CSSProperties = {
    width: '100%', marginTop: 20, padding: '13px 16px', fontSize: 15, fontWeight: 800,
    color: NAVY, background: BRASS, border: 'none', borderRadius: 8,
    cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={{ fontSize: 21, color: NAVY, margin: '0 0 6px' }}>
          {stage === 'done' ? 'Password updated' : 'Reset your password'}
        </h1>

        {stage === 'email' && (
          <>
            <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.6, margin: '0 0 4px' }}>
              Enter the email address on your BoatClosers account and we&apos;ll send you a
              6-digit code to set a new password.
            </p>
            <label style={label}>Email address</label>
            <input
              style={input}
              type="email"
              value={email}
              autoComplete="email"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendCode() }}
              placeholder="you@example.com"
            />
            <button style={button} disabled={busy} onClick={sendCode}>
              {busy ? 'Sending…' : 'Send my code'}
            </button>
          </>
        )}

        {stage === 'code' && (
          <>
            <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.6, margin: '0 0 4px' }}>
              Enter the 6-digit code we sent to <b>{email}</b>, then choose a new password.
            </p>
            <label style={label}>6-digit code</label>
            <input
              style={{ ...input, letterSpacing: 6, fontSize: 20, fontWeight: 800, textAlign: 'center' }}
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
            />
            <label style={label}>New password</label>
            <input
              style={input}
              type="password"
              value={newPassword}
              autoComplete="new-password"
              onChange={e => setNewPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmCode() }}
              placeholder="At least 6 characters"
            />
            <button style={button} disabled={busy} onClick={confirmCode}>
              {busy ? 'Updating…' : 'Set new password'}
            </button>
            <button
              onClick={() => { setStage('email'); setCode(''); setNewPassword(''); setError(''); setNotice('') }}
              style={{ width: '100%', marginTop: 10, padding: '10px', fontSize: 13, fontWeight: 700,
                       color: SLATE, background: 'transparent', border: '1px solid #cbd5e1',
                       borderRadius: 8, cursor: 'pointer' }}
            >
              Use a different email
            </button>
          </>
        )}

        {stage === 'done' && (
          <>
            <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.6, margin: '0 0 4px' }}>
              Your password has been changed. You can now sign in with your new password
              and pick your deal up right where you left off.
            </p>
            <button style={button} onClick={() => { window.location.href = '/' }}>
              Go to sign in
            </button>
          </>
        )}

        {notice && stage !== 'done' && (
          <div style={{ marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: 8, padding: '10px 12px', fontSize: 12.5,
                        color: '#1e40af', lineHeight: 1.6 }}>
            {notice}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, background: '#fdecec', border: '1px solid #f5b5b5',
                        borderRadius: 8, padding: '10px 12px', fontSize: 12.5,
                        color: '#b91c1c', lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: 22, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          <a href="/" style={{ color: '#94a3b8' }}>← Back to BoatClosers</a>
        </p>
      </div>
    </div>
  )
}
