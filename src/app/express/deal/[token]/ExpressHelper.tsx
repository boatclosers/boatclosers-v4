'use client'

// The helper: one line that always says what to do next and takes you there,
// plus an "Ask" drawer that answers questions about this purchase (typed or by voice).

import { useEffect, useRef, useState } from 'react'
// @ts-ignore: shared plain-JS hook from the BoatClosers app
import { useVoice } from '@/components/useVoice'
import { navy, gold, cream, muted, line, goldText } from './parts'

export type Next = { text: string; to: number; cta: string; tip?: { text: string; href: string; label: string } }

const Compass = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </svg>
)

const SUGGEST: Record<number, string[]> = {
  0: ['Where do I find the HIN?', 'How do I tell if the boat is documented?'],
  1: ['What if two people are on the title?', 'Does the seller need an account?'],
  2: ['How much deposit is normal?', 'Is Zelle safe for a deposit?'],
  3: ['How do I check for a lien?', 'What should I look at on the walk-around?'],
  4: ['What do I get for $29.99?', 'Where do we sign the title?'],
  5: ['What do I bring to the tax collector?', 'How long do I have to title it?'],
}

export default function ExpressHelper({ token, step, next, onGo }: { token: string; step: number; next: Next | null; onGo: (n: number) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, border: `1px solid ${line}`, background: 'rgba(201,150,46,0.07)', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Compass />
          <div style={{ flex: '1 1 200px', minWidth: 0, fontSize: 15, lineHeight: 1.45, color: cream }}>
            <b style={{ color: goldText, fontWeight: 700 }}>Next:</b> {next ? next.text : 'You’re all set. Ask if anything comes up.'}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {next && next.to !== step && (
              <button type="button" onClick={() => onGo(next.to)} style={{ border: 0, background: gold, color: navy, borderRadius: 9, padding: '9px 14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {next.cta}
              </button>
            )}
            <button type="button" onClick={() => setOpen(true)} style={{ border: `1px solid ${gold}`, background: 'transparent', color: cream, borderRadius: 9, padding: '9px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Ask
            </button>
          </div>
        </div>
        {next?.tip && (
          <div style={{ fontSize: 13.5, color: muted, lineHeight: 1.5, paddingLeft: 30 }}>
            {next.tip.text}{' '}
            <a href={next.tip.href} target={next.tip.href.startsWith('http') ? '_blank' : undefined} rel="noopener" style={{ color: goldText, fontWeight: 600 }}>
              {next.tip.label}
            </a>
          </div>
        )}
      </div>
      {open && <AskDrawer token={token} step={step} onClose={() => setOpen(false)} />}
    </>
  )
}

type Msg = { role: 'user' | 'assistant'; content: string }

function AskDrawer({ token, step, onClose }: { token: string; step: number; onClose: () => void }) {
  const KEY = `bcx_ask_${token.slice(0, 12)}`
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  })
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const voice = useVoice()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-20)))
    } catch {}
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, busy, KEY])

  async function send(q: string) {
    const question = q.trim()
    if (!question || busy) return
    const list: Msg[] = [...msgs, { role: 'user', content: question }]
    setMsgs(list)
    setText('')
    setErr('')
    setBusy(true)
    try {
      const r = await fetch('/api/express/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, step, messages: list }) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'The helper didn’t answer. Try again.')
      setMsgs([...list, { role: 'assistant', content: d.reply }])
    } catch (e: any) {
      setErr(e?.message || 'The helper didn’t answer. Try again.')
    }
    setBusy(false)
  }

  const onVoice = () => {
    if (voice.listening) return voice.stop()
    voice.start((t: string) => send(t))
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Ask a question" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,9,18,0.6)', display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(440px, 100%)', height: '100%', background: '#f6f8f7', borderLeft: `1px solid ${line}`, display: 'flex', flexDirection: 'column', color: cream }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${line}` }}>
          <Compass />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Ask about your purchase</div>
            <div style={{ fontSize: 12.5, color: muted }}>An AI helper that knows this sale. Not legal advice.</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: `1px solid ${line}`, background: 'transparent', color: cream, borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 14 }}>
            Close
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {msgs.length === 0 && (
            <>
              <p style={{ margin: 0, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>Stuck on a step, or not sure what comes next? Ask in your own words, or tap the mic and say it.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(SUGGEST[step] || SUGGEST[0]).map((q) => (
                  <button key={q} type="button" onClick={() => send(q)} style={{ textAlign: 'left', border: `1px solid ${line}`, background: 'rgba(19,35,58,0.048)', color: cream, borderRadius: 10, padding: '10px 12px', fontSize: 14.5, cursor: 'pointer' }}>
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: m.role === 'user' ? navy : '#ffffff',
                color: m.role === 'user' ? '#ffffff' : cream,
                border: m.role === 'user' ? 'none' : `1px solid ${line}`,
                borderRadius: 12,
                padding: '10px 13px',
                fontSize: 15,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          ))}
          {busy && <div style={{ color: muted, fontSize: 14 }}>Thinking…</div>}
          {err && (
            <div role="alert" style={{ color: goldText, fontSize: 14 }}>
              {err}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(text)
          }}
          style={{ display: 'flex', gap: 8, padding: 12, borderTop: `1px solid ${line}` }}
        >
          <input
            aria-label="Your question"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={voice.listening ? 'Listening…' : 'Type a question'}
            style={{ flex: 1, minWidth: 0, background: '#ffffff', color: navy, border: 0, borderRadius: 10, padding: '12px 14px', fontSize: 16 }}
          />
          {voice.supported && (
            <button
              type="button"
              onClick={onVoice}
              aria-label={voice.listening ? 'Stop listening' : 'Ask by voice'}
              style={{ width: 48, border: 0, borderRadius: 10, cursor: 'pointer', background: voice.listening ? gold : 'rgba(19,35,58,0.104)', color: voice.listening ? navy : cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
          )}
          <button type="submit" disabled={busy || !text.trim()} style={{ border: 0, borderRadius: 10, padding: '0 16px', background: gold, color: navy, fontWeight: 700, cursor: 'pointer', opacity: busy || !text.trim() ? 0.6 : 1 }}>
            Send
          </button>
        </form>
        {voice.note && <div style={{ padding: '0 12px 10px', fontSize: 13, color: muted }}>{voice.note}</div>}
      </div>
    </div>
  )
}
