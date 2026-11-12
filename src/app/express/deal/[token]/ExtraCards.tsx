'use client'

// The quick walk-around (free) and the title photo pre-check (with the paperwork).

import { useRef, useState } from 'react'
import { walkItems, type ItemKey, type WalkProgress } from '@/lib/express/content'
import { navy, gold, cream, muted, line, boxStyle, eyebrow, h2, goldButton, outlineButton, DocRow } from './parts'

export function WalkAround({
  token,
  has,
  walk,
  paid,
  onSaved,
}: {
  token: string
  has: Record<ItemKey, boolean>
  walk: WalkProgress | undefined
  paid: boolean
  onSaved: (w: WalkProgress) => void
}) {
  const [w, setW] = useState<WalkProgress>(walk || { items: {} })
  const [open, setOpen] = useState(false)
  const timer = useRef<any>(null)
  const pending = useRef<any>({ items: {} })
  const list = walkItems(has)
  const done = list.filter((i) => w.items[i.id]?.s).length
  const flags = list.filter((i) => w.items[i.id]?.s === 'flag').length

  function save(patch: { items?: Record<string, any>; hours?: string }) {
    pending.current = { items: { ...pending.current.items, ...(patch.items || {}) }, ...(patch.hours !== undefined ? { hours: patch.hours } : { hours: pending.current.hours }) }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const body = pending.current
      pending.current = { items: {} }
      try {
        const r = await fetch('/api/express/deal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'walk', walk: body }) })
        const d = await r.json()
        if (r.ok && d.progress?.walk) onSaved(d.progress.walk)
      } catch {}
    }, 700)
  }
  function set(id: string, patch: { s?: 'ok' | 'flag' | null; note?: string }) {
    setW((cur) => ({ ...cur, items: { ...cur.items, [id]: { ...(cur.items[id] || {}), ...(patch as any) } } }))
    save({ items: { [id]: patch } })
  }

  return (
    <div style={boxStyle}>
      <div style={eyebrow}>QUICK WALK-AROUND · FREE</div>
      <h2 style={h2}>Check for deal-breakers at the boat</h2>
      <p style={{ margin: 0, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>
        {list.length} quick checks anyone can do in ten minutes. Mark each one OK or flag it; it’s saved as a dated record in your Boat File.
      </p>
      {done > 0 && (
        <div style={{ fontSize: 14, color: flags ? gold : cream }}>
          {done} of {list.length} checked{flags ? ` · ${flags} flagged` : ''}
        </div>
      )}
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} style={{ ...goldButton, alignSelf: 'flex-start' }}>
          {done ? 'Continue the walk-around' : 'Start the walk-around'}
        </button>
      ) : (
        <>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((i) => {
              const r = w.items[i.id] || {}
              return (
                <li key={i.id} style={{ borderTop: `1px solid ${line}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 600, lineHeight: 1.45 }}>{i.label}</div>
                  {i.detail && <div style={{ color: muted, fontSize: 13.5, lineHeight: 1.5 }}>{i.detail}</div>}
                  {i.id === 'w-hours' && (
                    <input
                      aria-label="Engine hours"
                      inputMode="decimal"
                      placeholder="Hours on the meter"
                      value={w.hours || ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.,]/g, '')
                        setW((cur) => ({ ...cur, hours: v }))
                        save({ hours: v })
                      }}
                      style={{ background: cream, color: navy, border: 0, borderRadius: 6, padding: '10px 12px', fontSize: 15, maxWidth: 220 }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['ok', 'flag'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={r.s === v}
                        onClick={() => set(i.id, { s: r.s === v ? null : v })}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          border: `1.5px solid ${r.s === v ? (v === 'ok' ? '#5aa469' : gold) : 'rgba(245,241,232,0.25)'}`,
                          background: r.s === v ? (v === 'ok' ? 'rgba(90,164,105,0.18)' : 'rgba(201,150,46,0.18)') : 'transparent',
                          color: cream,
                        }}
                      >
                        {v === 'ok' ? '✓ Looks OK' : '⚑ Flag it'}
                      </button>
                    ))}
                  </div>
                  {r.s === 'flag' && (
                    <input
                      aria-label="What did you see?"
                      placeholder="What did you see?"
                      defaultValue={r.note || ''}
                      onBlur={(e) => set(i.id, { note: e.target.value })}
                      style={{ background: cream, color: navy, border: 0, borderRadius: 6, padding: '10px 12px', fontSize: 15 }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
          {paid && <DocRow token={token} doc="walk-around" name="Walk-around record" note="Your checks and notes as a dated page." />}
        </>
      )}
      <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.55 }}>
        A quick look, not an inspection. For a full guided walkthrough, sea trial and written report, use{' '}
        <a href="https://myboatinspector.com" target="_blank" rel="noopener" style={{ color: gold }}>
          My Boat Inspector
        </a>
        .
      </p>
    </div>
  )
}

// Shrink a phone photo so two of them fit comfortably in one request.
async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const scale = Math.min(1, 1800 / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = Math.round(img.width * scale)
    c.height = Math.round(img.height * scale)
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function TitleCheckCard({
  token,
  paid,
  result,
  used,
  onDone,
  onUnlock,
}: {
  token: string
  paid: boolean
  result: any
  used: number
  onDone: (titleCheck: any, used: number) => void
  onUnlock: () => void
}) {
  const [front, setFront] = useState<string>('')
  const [back, setBack] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const left = Math.max(0, 3 - used)

  async function pick(e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const d = await shrink(f)
      side === 'front' ? setFront(d) : setBack(d)
    } catch {
      setErr('That photo couldn’t be opened. Try another.')
    }
  }
  async function run() {
    setBusy(true)
    setErr('')
    try {
      const r = await fetch('/api/express/title-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, images: [front, back].filter(Boolean) }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'The check didn’t work. Try again.')
      onDone(d.titleCheck, 3 - (d.left ?? 0))
      setFront('')
      setBack('')
    } catch (e: any) {
      setErr(e?.message || 'The check didn’t work.')
    }
    setBusy(false)
  }

  const photoBtn = (side: 'front' | 'back', val: string) => (
    <label style={{ ...outlineButton, flex: 1, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
      {val ? <img src={val} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 4 }} /> : null}
      {val ? `Retake the ${side}` : `Photo of the ${side}`}
      <input type="file" accept="image/*" capture="environment" onChange={(e) => pick(e, side)} style={{ display: 'none' }} />
    </label>
  )

  return (
    <div style={boxStyle}>
      <div style={eyebrow}>TITLE PRE-CHECK{paid ? '' : ' · WITH YOUR PAPERWORK'}</div>
      <h2 style={h2}>Check the title before you pay</h2>
      <p style={{ margin: 0, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>
        Photograph the front and back of the seller’s title. We read it for the problems that sink private sales: the wrong name, a missing co-owner, a lien that isn’t released, a HIN that doesn’t
        match, or a transfer section that’s already been filled in. The photos aren’t saved.
      </p>
      {!paid ? (
        <button type="button" onClick={onUnlock} style={{ ...outlineButton, alignSelf: 'flex-start' }}>
          Included with your paperwork · $29.99
        </button>
      ) : (
        <>
          {result && (
            <div style={{ border: `1px solid ${line}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontWeight: 600, lineHeight: 1.5 }}>{result.summary}</div>
              {result.flags?.map((f: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14.5, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 800, minWidth: 52, color: f.level === 'stop' ? '#ff8a7a' : f.level === 'check' ? gold : '#7cc48a' }}>
                    {f.level === 'stop' ? 'STOP' : f.level === 'check' ? 'CHECK' : 'OK'}
                  </span>
                  <span>{f.text}</span>
                </div>
              ))}
              <DocRow token={token} doc="title-check" name="Title pre-check" note="Saved to your Boat File." />
            </div>
          )}
          {left > 0 ? (
            <>
              <div style={{ display: 'flex', gap: 10 }}>
                {photoBtn('front', front)}
                {photoBtn('back', back)}
              </div>
              <button type="button" onClick={run} disabled={busy || !front} style={{ ...goldButton, opacity: busy || !front ? 0.6 : 1 }}>
                {busy ? 'Reading the title…' : result ? 'Check again' : 'Check the title'}
              </button>
              <div style={{ color: muted, fontSize: 13 }}>{left} of 3 checks left for this purchase.</div>
            </>
          ) : (
            <div style={{ color: muted, fontSize: 14 }}>You’ve used all 3 checks for this purchase.</div>
          )}
        </>
      )}
      {err && (
        <p role="alert" style={{ margin: 0, color: gold, fontSize: 14 }}>
          {err}
        </p>
      )}
      <p style={{ margin: 0, color: muted, fontSize: 12.5, lineHeight: 1.5 }}>An automated reading to help you spot problems, not a title search. The agency that issues titles has the final word.</p>
    </div>
  )
}
