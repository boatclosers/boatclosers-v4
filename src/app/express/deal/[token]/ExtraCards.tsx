'use client'

// The quick walk-around (free) and the title photo pre-check (with the paperwork).

import { useRef, useState } from 'react'
import { walkItems, type ItemKey, type WalkProgress } from '@/lib/express/content'
import { navy, gold, cream, muted, line, boxStyle, eyebrow, h2, goldButton, outlineButton, DocRow, goldText } from './parts'

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
                      style={{ background: '#ffffff', color: navy, border: 0, borderRadius: 6, padding: '10px 12px', fontSize: 15, maxWidth: 220 }}
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
                          border: `1.5px solid ${r.s === v ? (v === 'ok' ? '#2e7a55' : gold) : 'rgba(19,35,58,0.195)'}`,
                          background: r.s === v ? (v === 'ok' ? 'rgba(46,122,85,0.12)' : 'rgba(201,150,46,0.18)') : 'transparent',
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
                      style={{ background: '#ffffff', color: navy, border: 0, borderRadius: 6, padding: '10px 12px', fontSize: 15 }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
          {paid && <DocRow token={token} doc="walk-around" name="Walk-around record" note="Your checks and notes as a dated page." />}
        </>
      )}
      {flags > 0 && (
        <div style={{ border: `1px solid ${gold}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontWeight: 700 }}>You flagged {flags} thing{flags > 1 ? 's' : ''}. Want to dive deeper?</div>
          <div style={{ color: muted, fontSize: 14, lineHeight: 1.55 }}>
            My Boat Inspector takes you through the hull, engine, systems and a sea trial step by step, with photos and a written report you can negotiate with, or use to decide on a professional survey.
          </div>
          <a href="https://myboatinspector.com" target="_blank" rel="noopener" style={{ ...goldButton, alignSelf: 'flex-start', textDecoration: 'none' }}>
            Inspect with My Boat Inspector
          </a>
        </div>
      )}
      <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.55 }}>
        A quick look, not an inspection. For a full guided walkthrough, sea trial and written report, use{' '}
        <a href="https://myboatinspector.com" target="_blank" rel="noopener" style={{ color: goldText }}>
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
                  <span style={{ fontWeight: 800, minWidth: 52, color: f.level === 'stop' ? '#b3261e' : f.level === 'check' ? gold : '#2e7a55' }}>
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
        <p role="alert" style={{ margin: 0, color: goldText, fontSize: 14 }}>
          {err}
        </p>
      )}
      <p style={{ margin: 0, color: muted, fontSize: 12.5, lineHeight: 1.5 }}>An automated reading to help you spot problems, not a title search. The agency that issues titles has the final word.</p>
    </div>
  )
}

// The deposit receipt: free, because it's needed at the handshake, before anything else.
export function DepositCard({ token, missing, saving, inspection, secureHref }: { token: string; missing: string[]; saving?: boolean; inspection?: boolean; secureHref?: string }) {
  return (
    <div style={{ ...boxStyle, border: `1px solid ${gold}` }}>
      <div style={eyebrow}>DEPOSIT RECEIPT · FREE</div>
      <h2 style={h2}>Get the deposit in writing</h2>
      <p style={{ margin: 0, color: muted, fontSize: 14.5, lineHeight: 1.6 }}>
        One page you both sign when the money changes hands: how much, the day you’ll close, and who gets it back if the sale doesn’t happen. It comes off the price on your final receipt.
      </p>
      {missing.length || saving ? (
        <p style={{ margin: 0, fontSize: 14.5, color: cream }}>
          {missing.length ? `Answer the questions above to make it. Still needed: ${missing.join(', ')}.` : 'Saving…'}
        </p>
      ) : (
        <>
          <DocRow token={token} doc="deposit-receipt" name="Deposit receipt" note="One page. Both of you sign a printed copy when the money changes hands." primary />
          <PrintHelp token={token} doc="deposit-receipt" what="the deposit receipt" compact />
        </>
      )}
      {inspection && (
        <div style={{ borderTop: `1px solid ${line}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontWeight: 700 }}>Your deposit depends on an inspection</div>
          <div style={{ color: muted, fontSize: 14, lineHeight: 1.55 }}>
            Do it before the close-by date, and keep it in writing. My Boat Inspector walks you through the hull, engine, systems and a sea trial, and gives you a dated report to show the seller if something’s wrong.
          </div>
          <a href="https://myboatinspector.com" target="_blank" rel="noopener" style={{ ...outlineButton, alignSelf: 'flex-start', textDecoration: 'none' }}>
            Inspect with My Boat Inspector
          </a>
        </div>
      )}
      {secureHref && (
        <div style={{ borderTop: `1px solid ${line}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontWeight: 700, color: goldText }}>Over $1,000? Have it held by a neutral party</div>
          <div style={{ color: muted, fontSize: 14, lineHeight: 1.55 }}>
            With this receipt the seller holds your money. BoatClosers has a neutral party hold it until the sale, with a signed agreement on when it comes back.
          </div>
          <a href={secureHref} style={{ ...goldButton, alignSelf: 'flex-start', textDecoration: 'none' }}>
            Secure the deposit with BoatClosers
          </a>
        </div>
      )}
      <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.55 }}>
        Paying by Zelle or Venmo? Put “boat deposit” in the memo, and take a screenshot. Never send a deposit for a boat you haven’t seen in person.
      </p>
    </div>
  )
}

// Printing: every paper gets signed in ink, so make printing feel easy wherever
// the buyer is. One button prints straight from the phone (the share sheet has
// Print on iPhone; elsewhere it opens the PDF, where Print is in the menu).
export function PrintHelp({ token, doc, what = 'your papers', compact }: { token: string; doc: string; what?: string; compact?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(!compact)
  async function printNow() {
    setBusy(true)
    setNote('')
    const url = `/api/express/document?token=${token}&doc=${doc}`
    try {
      const r = await fetch(url, { cache: 'no-store' })
      if (!r.ok) throw new Error(await r.text())
      const blob = await r.blob()
      const file = new File([blob], `${doc}.pdf`, { type: 'application/pdf' })
      const nav: any = navigator
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: 'My Boat Closing papers' })
        setNote('Pick Print (or your printer’s app) from the list. Print 2 copies: one for each of you.')
      } else {
        window.open(URL.createObjectURL(blob), '_blank')
        setNote('Your papers opened in a new tab. Use Print from the browser menu. Print 2 copies: one for each of you.')
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') setNote(e?.message && e.message.length < 160 ? e.message : 'That didn’t open. Try Download instead.')
    }
    setBusy(false)
  }
  const ways: [string, string][] = [
    ['At home or work', 'Print two copies tonight, one for each of you. It’s the easiest way, and you walk up ready.'],
    ['On the seller’s printer', 'Your phone prints straight to most Wi-Fi printers. Join their Wi-Fi and tap Print from this phone.'],
    ['In town, in about 10 minutes', 'Any UPS Store, FedEx Office, Staples or Office Depot prints from your phone at the counter for a dollar or two. Many UPS Stores have a notary too.'],
    ['At the marina or library', 'Marina offices and public libraries will usually print a few pages if you ask.'],
  ]
  return (
    <div style={{ border: `1px solid ${line}`, borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f6f8f7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ fontWeight: 700 }}>Print {what}, then sign in ink</div>
          <div style={{ fontSize: 13.5, color: muted, lineHeight: 1.5 }}>Two copies, a few pages each. No printer handy? You have options.</div>
        </div>
        <button type="button" onClick={printNow} disabled={busy} style={{ ...goldButton, padding: '10px 16px', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Opening…' : 'Print from this phone'}
        </button>
      </div>
      {note && <div style={{ fontSize: 14, color: cream, lineHeight: 1.5 }}>{note}</div>}
      {compact && !open ? (
        <button type="button" onClick={() => setOpen(true)} style={{ alignSelf: 'flex-start', border: 0, background: 'none', padding: 0, color: navy, fontWeight: 600, fontSize: 14, textDecoration: 'underline', cursor: 'pointer' }}>
          No printer? Here’s where to print
        </button>
      ) : (
        <>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ways.map(([t, d]) => (
              <li key={t} style={{ fontSize: 14, lineHeight: 1.5 }}>
                <b style={{ fontWeight: 700 }}>{t}.</b> <span style={{ color: muted }}>{d}</span>
              </li>
            ))}
          </ul>
          <a href="https://www.google.com/maps/search/print+shop+near+me" target="_blank" rel="noopener" style={{ ...outlineButton, alignSelf: 'flex-start', padding: '9px 14px', fontSize: 14 }}>
            Find a print shop near me
          </a>
          <div style={{ fontSize: 13.5, color: muted, lineHeight: 1.55, borderTop: `1px solid ${line}`, paddingTop: 10 }}>
            <b style={{ color: cream }}>Can’t print today?</b> No problem. Do the free checks now, agree on the day you’ll close, and if you put down a deposit, send it by Zelle with “boat deposit” in the memo. You’ll both sign the printed papers when you meet again.
          </div>
        </>
      )}
    </div>
  )
}
