'use client'

// One question at a time, the same way BoatClosers' guided mode asks. It is only
// a different way of asking: every answer is written into the same Express data
// the full form uses, so the papers and everything else are unchanged.

import { useEffect, useRef, useState, type ReactNode } from 'react'
// @ts-ignore: shared plain-JS hook from the BoatClosers app
import { useVoice, spokenToNumber } from '@/components/useVoice'

const K = {
  navy: '#08152e',
  brass: '#b8863a',
  brassText: '#8a6224',
  paper: '#fffdf9',
  mist: '#ddd5c6',
  line: '#eee7da',
  slate: '#44586d',
  cream: '#f3ecdf',
  sel: '#fbf5ea',
  white: '#ffffff',
  red: '#9b2c2c',
}

export type Question =
  | {
      id: string
      kind: 'text' | 'money' | 'date' | 'textarea'
      title: string
      help?: string
      placeholder?: string
      value: string
      onChange: (v: string) => void
      required?: boolean
      valid?: () => boolean
      error?: string
      skipLabel?: string
      mono?: boolean
      inputMode?: 'text' | 'numeric' | 'email' | 'decimal'
      chips?: string[]
      why?: string
      extra?: ReactNode
    }
  | {
      id: string
      kind: 'choice'
      title: string
      help?: string
      options: [string, string, string?][]
      value: string | undefined
      onChange: (v: string) => void
      required?: boolean
      error?: string
      why?: string
      skipLabel?: string
    }
  | {
      id: string
      kind: 'review'
      title: string
      help?: string
      rows: [string, string, string?][]
      finishLabel: string
      onFinish: () => void
      note?: string
    }

const moneyText = (v: string) => {
  const d = String(v ?? '').replace(/[^0-9]/g, '')
  return d ? Number(d).toLocaleString('en-US') : ''
}

const inputStyle = (money?: boolean, mono?: boolean) => ({
  width: '100%',
  boxSizing: 'border-box' as const,
  minHeight: 60,
  padding: money ? '14px 16px 14px 34px' : '14px 16px',
  fontSize: 21,
  borderRadius: 14,
  border: `1.5px solid ${K.mist}`,
  background: K.white,
  color: K.navy,
  outline: 'none',
  fontFamily: mono ? 'ui-monospace, Menlo, monospace' : 'inherit',
  letterSpacing: mono ? 1 : undefined,
})

const optionStyle = (on: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  width: '100%',
  minHeight: 58,
  padding: '14px 16px',
  borderRadius: 14,
  border: `1.5px solid ${on ? K.brass : K.mist}`,
  background: on ? K.sel : K.white,
  color: K.navy,
  fontSize: 16.5,
  fontWeight: 600,
  textAlign: 'left' as const,
  cursor: 'pointer',
  fontFamily: 'inherit',
})

function Dot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        border: `2px solid ${on ? K.brass : K.mist}`,
        background: on ? K.brass : 'transparent',
        boxShadow: on ? `inset 0 0 0 3px ${K.white}` : 'none',
      }}
    />
  )
}

export default function ExpressGuided({
  label,
  questions,
  onShowForm,
}: {
  label: string
  questions: Question[]
  onShowForm: () => void
}) {
  const [i, setI] = useState(0)
  const [err, setErr] = useState('')
  const [why, setWhy] = useState(false)
  const voice = useVoice()
  const idx = Math.min(i, questions.length - 1)
  const q = questions[idx]
  const isLast = idx === questions.length - 1
  const answered = questions.filter((x) => x.kind !== 'review').length
  const pos = q.kind === 'review' ? answered : idx + 1
  const topRef = useRef<HTMLDivElement>(null)

  const firstRun = useRef(true)
  useEffect(() => {
    setWhy(false)
    setErr('')
    voice.clear()
    // Keep the page where it is on first load, so the helper above stays in view.
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    try {
      topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    } catch {}
  }, [idx]) // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (id?: string) => {
    const n = questions.findIndex((x) => x.id === id)
    if (n >= 0) setI(n)
  }
  const next = () => {
    if (q.kind === 'review') return q.onFinish()
    if (q.kind === 'choice') {
      if (q.required && !q.value) return setErr(q.error || 'Pick one to continue.')
    } else if (q.required && (q.valid ? !q.valid() : !String(q.value || '').trim())) {
      return setErr(q.error || 'Please answer this to continue.')
    }
    setI(Math.min(idx + 1, questions.length - 1))
  }
  const back = () => setI(Math.max(0, idx - 1))
  const skip = () => setI(Math.min(idx + 1, questions.length - 1))

  const onVoice = () => {
    if (q.kind === 'choice' || q.kind === 'review') return
    if (voice.listening) return voice.stop()
    voice.start((t: string) => {
      if (q.kind === 'money' || q.inputMode === 'numeric') q.onChange(spokenToNumber(t))
      else if (q.inputMode === 'email') q.onChange(t.toLowerCase().replace(/\s+at\s+/g, '@').replace(/\s+dot\s+/g, '.').replace(/\s+/g, ''))
      else q.onChange(t)
    })
  }

  return (
    <div ref={topRef} style={{ scrollMarginTop: 20, color: K.navy }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 13, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, color: '#8a6224', letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: '#4e5d6c' }}>
          {pos} of {answered}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: 'rgba(19,35,58,0.125)', overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ height: 6, borderRadius: 6, background: K.brass, width: `${Math.round((pos / answered) * 100)}%`, transition: 'width .3s' }} />
      </div>

      <div style={{ background: K.paper, borderRadius: 22, padding: '26px 22px 22px', border: '1px solid rgba(19,35,58,0.1)', boxShadow: '0 14px 30px -22px rgba(19,35,58,0.45)' }}>
        <h2 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: 28, lineHeight: 1.18 }}>{q.title}</h2>
        {q.help && <p style={{ margin: '10px 0 0', fontSize: 16, lineHeight: 1.5, color: K.slate }}>{q.help}</p>}

        {(q.kind === 'text' || q.kind === 'money' || q.kind === 'date') && (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                {q.kind === 'money' && (
                  <span aria-hidden="true" style={{ position: 'absolute', left: 15, fontSize: 21, color: K.slate }}>
                    $
                  </span>
                )}
                <input
                  aria-label={q.title}
                  autoFocus
                  type={q.kind === 'date' ? 'date' : 'text'}
                  inputMode={q.kind === 'money' ? 'numeric' : q.inputMode || 'text'}
                  autoComplete="off"
                  value={q.kind === 'money' ? moneyText(q.value) : q.value}
                  placeholder={q.placeholder}
                  onChange={(e) => {
                    setErr('')
                    q.onChange(q.kind === 'money' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') next()
                  }}
                  style={inputStyle(q.kind === 'money', q.mono)}
                />
              </div>
              {voice.supported && q.kind !== 'date' && (
                <button
                  type="button"
                  onClick={onVoice}
                  aria-label={voice.listening ? 'Stop listening' : 'Answer by voice'}
                  style={{
                    flexShrink: 0,
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    border: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: voice.listening ? K.brass : K.navy,
                    color: voice.listening ? K.navy : K.paper,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </button>
              )}
            </div>
            {voice.listening && <div style={{ marginTop: 10, fontSize: 14, color: K.brassText, fontWeight: 600 }}>Listening… say your answer</div>}
            {voice.note && <div style={{ marginTop: 10, fontSize: 14, color: K.slate }}>{voice.note}</div>}
            {q.chips && !q.value && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {q.chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => q.onChange(c)}
                    style={{ border: `1px solid ${K.mist}`, background: K.white, borderRadius: 999, padding: '10px 14px', fontSize: 14, color: K.navy, cursor: 'pointer' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {q.extra && <div style={{ marginTop: 12 }}>{q.extra}</div>}
          </div>
        )}

        {q.kind === 'textarea' && (
          <div style={{ marginTop: 22 }}>
            <textarea
              aria-label={q.title}
              autoFocus
              rows={4}
              value={q.value}
              placeholder={q.placeholder}
              onChange={(e) => {
                setErr('')
                q.onChange(e.target.value)
              }}
              style={{ ...inputStyle(), fontSize: 17, minHeight: 120, resize: 'vertical' }}
            />
            {voice.supported && (
              <button type="button" onClick={onVoice} style={{ marginTop: 10, border: `1px solid ${K.mist}`, background: K.white, borderRadius: 12, padding: '10px 14px', fontSize: 14, fontWeight: 600, color: K.navy, cursor: 'pointer' }}>
                {voice.listening ? 'Listening… tap to stop' : 'Say it instead'}
              </button>
            )}
          </div>
        )}

        {q.kind === 'choice' && (
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map(([val, label, sub]) => {
              const on = q.value === val
              return (
                <button
                  key={val}
                  type="button"
                  aria-pressed={on}
                  style={optionStyle(on)}
                  onClick={() => {
                    setErr('')
                    q.onChange(val)
                    if (!isLast) setTimeout(() => setI((cur) => (cur === idx ? Math.min(idx + 1, questions.length - 1) : cur)), 260)
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    {label}
                    {sub ? <span style={{ display: 'block', fontSize: 13.5, fontWeight: 400, color: K.slate, marginTop: 3, lineHeight: 1.4 }}>{sub}</span> : null}
                  </span>
                  <Dot on={on} />
                </button>
              )
            })}
          </div>
        )}

        {q.kind === 'review' && (
          <div style={{ marginTop: 18 }}>
            <div style={{ border: `1px solid ${K.mist}`, borderRadius: 16, background: K.white, overflow: 'hidden' }}>
              {q.rows.map(([label, value, target], n) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: n ? `1px solid ${K.line}` : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: K.slate }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, overflowWrap: 'anywhere' }}>{value || '—'}</div>
                  </div>
                  {target && (
                    <button
                      type="button"
                      onClick={() => goTo(target)}
                      style={{ border: 0, background: 'transparent', fontSize: 14, fontWeight: 600, color: K.navy, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
            {q.note && <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.5, color: K.slate }}>{q.note}</p>}
          </div>
        )}

        {'why' in q && q.why && (
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={() => setWhy(!why)}
              style={{ border: 0, background: 'transparent', padding: '8px 0', fontSize: 14, fontWeight: 600, color: K.brassText, cursor: 'pointer' }}
            >
              {why ? 'Hide' : 'Why are we asking?'}
            </button>
            {why && <div style={{ padding: '12px 14px', borderRadius: 12, background: K.cream, fontSize: 14, lineHeight: 1.55 }}>{q.why}</div>}
          </div>
        )}

        {err && (
          <div role="alert" style={{ marginTop: 14, fontSize: 14.5, color: K.red, fontWeight: 600 }}>
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {idx > 0 && (
            <button
              type="button"
              onClick={back}
              aria-label="Back"
              style={{ width: 56, minHeight: 56, borderRadius: 14, border: `1px solid ${K.mist}`, background: K.white, color: K.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={next}
            style={{ flex: 1, minHeight: 56, borderRadius: 14, border: 0, background: K.navy, color: K.paper, fontSize: 17, fontWeight: 600, cursor: 'pointer' }}
          >
            {q.kind === 'review' ? q.finishLabel : 'Continue'}
          </button>
        </div>
        {'skipLabel' in q && q.skipLabel && (
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <button type="button" onClick={skip} style={{ border: 0, background: 'transparent', padding: 10, fontSize: 15, fontWeight: 500, color: K.slate, cursor: 'pointer' }}>
              {q.skipLabel}
            </button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button type="button" onClick={onShowForm} style={{ border: 0, background: 'transparent', padding: 10, fontSize: 14, color: '#4e5d6c', textDecoration: 'underline', cursor: 'pointer' }}>
          See all fields on one page instead
        </button>
      </div>
    </div>
  )
}
