'use client'

import { useState } from 'react'
import DocViewer, { docUrl, type TokenParam } from './DocViewer'
import {
  type CheckItem,
  type Handoff,
  type ItemKey,
  PAYMENT_METHODS,
  HULLS,
  PROPULSION,
  FUELS,
  TITLED_OPTIONS,
  titleSigningGuide,
  handoffProblems,
  whatToBring,
  salesTaxEstimate,
  addDays,
  NEW_OWNER,
  type InspectItem,
  type InspectionProgress,
  type InspectionPreview,
  type InspectStatus,
  type Photo,
  PHOTO_SHOTS,
  MAX_PHOTOS,
} from '@/lib/express/content'

export const navy = '#0f1b2d'
export const card = '#18283f'
export const gold = '#c9962e'
export const cream = '#f5f1e8'
export const muted = '#bdb6a8'
export const line = 'rgba(201,150,46,0.35)'

export const boxStyle = {
  background: card,
  border: `1px solid ${line}`,
  borderRadius: 8,
  padding: '18px 18px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
}
export const eyebrow = { fontSize: 11, letterSpacing: 2, color: gold, fontWeight: 700 }
const h2 = { fontFamily: 'Georgia, serif', fontSize: 20, color: cream, lineHeight: 1.3, margin: 0 }

export function money(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const goldButton = {
  background: gold,
  color: navy,
  fontWeight: 700,
  fontSize: 15,
  padding: '13px 18px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
}
const outlineButton = {
  ...goldButton,
  background: 'transparent',
  color: cream,
  border: `1px solid ${gold}`,
}

// ---------- Checklist ----------

export function Checklist({
  title,
  label,
  items,
  checks,
  onToggle,
}: {
  title: string
  label: string
  items: CheckItem[]
  checks: Record<string, boolean>
  onToggle: (id: string, v: boolean) => void
}) {
  if (!items.length) return null
  const count = items.filter((i) => checks[i.id]).length
  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div style={eyebrow}>{label}</div>
        <div style={{ fontSize: 13, color: muted }}>
          {count} of {items.length}
        </div>
      </div>
      <h2 style={h2}>{title}</h2>
      <div>
        {items.map((it, i) => (
          <label
            key={it.id}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '11px 0',
              borderTop: i ? `1px solid ${line}` : 'none',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={!!checks[it.id]}
              onChange={(e) => onToggle(it.id, e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: gold, flexShrink: 0 }}
            />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: cream, opacity: checks[it.id] ? 0.6 : 1 }}>{it.label}</span>
              {it.detail && <span style={{ fontSize: 14, lineHeight: 1.55, color: muted }}>{it.detail}</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function forItems(list: CheckItem[], has: Record<ItemKey, boolean>) {
  return list.filter((i) => !i.only || has[i.only])
}

// ---------- A paper: view it here, or download it ----------

export function DocRow({ token, doc, name, note, primary, param = 'token' }: { token: string; doc: string; name: string; note?: string; primary?: boolean; param?: TokenParam }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${line}`, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 200px' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: cream }}>{name}</div>
        {note && <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>{note}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setOpen(true)} style={{ ...(primary ? goldButton : outlineButton), padding: '10px 16px' }}>
          View
        </button>
        <a href={docUrl(token, doc, true, param)} style={{ ...outlineButton, padding: '10px 16px' }}>
          Download
        </a>
      </div>
      {open && <DocViewer token={token} doc={doc} title={name} param={param} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ---------- Email / text / both ----------

export type ChannelChoice = 'email' | 'sms' | 'both'
export const toChannels = (c: ChannelChoice) => (c === 'both' ? ['email', 'sms'] : c === 'sms' ? ['sms'] : ['email'])

export function ChannelPicker({ value, onChange, label }: { value: ChannelChoice; onChange: (c: ChannelChoice) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: 8 }}>
      {(
        [
          ['email', 'Email'],
          ['sms', 'Text'],
          ['both', 'Both'],
        ] as [ChannelChoice, string][]
      ).map(([k, l]) => {
        const on = value === k
        return (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(k)}
            style={{
              flex: 1,
              padding: '9px 10px',
              borderRadius: 18,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${on ? gold : 'rgba(245,241,232,0.3)'}`,
              background: on ? 'rgba(201,150,46,0.2)' : 'transparent',
              color: cream,
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

// The buyer's own choice of how reminders reach them.
export function ContactPrefs({ token, contact, onSaved }: { token: string; contact: any; onSaved: (c: any) => void }) {
  const init: ChannelChoice = contact?.channels?.includes('sms') ? (contact.channels.includes('email') ? 'both' : 'sms') : 'email'
  const [choice, setChoice] = useState<ChannelChoice>(init)
  const [phone, setPhone] = useState<string>(contact?.phone || '')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  async function save(c: ChannelChoice = choice) {
    setMsg('')
    if (c !== 'email' && phone.replace(/\D/g, '').length < 10) {
      setMsg('Add your mobile number, then save.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/express/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'prefs', channels: toChannels(c), phone }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not save.')
      onSaved(d.contact)
      setMsg(c !== 'email' && !d.contact?.smsReady ? 'Saved. Texts start soon; until then we’ll email you.' : 'Saved.')
    } catch (e: any) {
      setMsg(e?.message || 'Could not save.')
    }
    setSaving(false)
  }
  return (
    <div style={boxStyle}>
      <div style={eyebrow}>HOW WE REACH YOU</div>
      <h2 style={h2}>Reminders and updates by</h2>
      <ChannelPicker
        label="Send my reminders by"
        value={choice}
        onChange={(c) => {
          setChoice(c)
          if (c === 'email') save(c)
        }}
      />
      {choice !== 'email' && (
        <>
          <Field id="cp-phone" label="Your mobile number" type="tel" value={phone} onChange={setPhone} />
          <button type="button" onClick={() => save()} disabled={saving} style={{ ...goldButton, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      )}
      <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.5 }}>
        {msg || (
          <>
            By choosing Text you agree to get texts from BoatClosers about this purchase, like deadline reminders. Msg frequency
            varies. Msg &amp; data rates may apply. Reply STOP to stop, HELP for help.{' '}
            <a href="/sms-terms" style={{ color: gold }}>Terms</a> · <a href="/privacy" style={{ color: gold }}>Privacy</a>
          </>
        )}
      </p>
    </div>
  )
}

// ---------- Full BoatClosers: when Express isn't the right tool ----------

const FULL_REASONS = [
  { id: 'f-negotiate', label: 'We still need to agree on the price', why: 'Full BoatClosers runs offers and counteroffers in one place, with every round on record.' },
  { id: 'f-deposit', label: 'I’m putting down a deposit before the boat is mine', why: 'A deposit needs written terms for when you get it back. Full BoatClosers writes those terms and has a neutral third party hold the money.' },
  { id: 'f-survey', label: 'The sale should depend on a survey or sea trial', why: 'Full BoatClosers adds contingencies to a signed purchase agreement, so you can walk away or renegotiate if the survey finds problems.' },
  { id: 'f-finance', label: 'I’m financing through a lender', why: 'Most lenders want a signed purchase agreement and a closing they can pay into. Express doesn’t create either.' },
  { id: 'f-agreement', label: 'We both want a signed purchase agreement', why: 'Express is buyer-only. Full BoatClosers brings the seller in, and both of you sign the agreement and the closing papers.' },
]

export function FullSuggest({ deal, checks, onToggle }: { deal: any; checks: Record<string, boolean>; onToggle: (id: string, v: boolean) => void }) {
  const hits = FULL_REASONS.filter((r) => checks[r.id])
  const big = deal.price_cents > 2500000
  const lienOpen = deal.progress?.handoff?.lien === 'open'
  return (
    <div style={{ ...boxStyle, ...(hits.length || lienOpen ? { border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)' } : {}) }}>
      <div style={eyebrow}>IS EXPRESS RIGHT FOR THIS DEAL?</div>
      <h2 style={h2}>Express is for a simple sale. Does yours need any of these?</h2>
      <div>
        {FULL_REASONS.map((r, i) => (
          <label key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 0', borderTop: i ? `1px solid ${line}` : 'none', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!checks[r.id]}
              onChange={(e) => onToggle(r.id, e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: gold, flexShrink: 0 }}
            />
            <span style={{ fontSize: 15, color: cream, lineHeight: 1.5 }}>{r.label}</span>
          </label>
        ))}
      </div>
      {big && !hits.length && (
        <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
          At {money(deal.price_cents)}, think about a deposit held by a neutral party and a professional survey before you pay in full. If you want either, full BoatClosers is built for it.
        </p>
      )}
      {(hits.length > 0 || lienOpen) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: gold }}>Full BoatClosers is the better fit</div>
          <ul style={{ margin: 0, paddingLeft: 20, color: cream, fontSize: 14, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lienOpen && <li>There’s an open lien. Full BoatClosers can hold the money with a neutral party until the lender releases it.</li>}
            {hits.map((r) => (
              <li key={r.id}>{r.why}</li>
            ))}
          </ul>
          <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.6 }}>
            Full BoatClosers is $249, paid once both of you agree and sign. The seller joins the deal, and it handles negotiation, deposits, contingencies, and closing.
            {deal.status === 'paid' ? ` Start it with ${deal.buyer_email} and the $29.99 you paid here comes off the $249.` : ' If you pay for Express first, that $29.99 comes off the $249 later.'}
          </p>
          <a href="/" style={{ ...goldButton, alignSelf: 'flex-start' }}>
            See full BoatClosers
          </a>
        </div>
      )}
      {!hits.length && !lienOpen && !big && (
        <p style={{ margin: 0, color: muted, fontSize: 13 }}>None of these? Express is the right tool. Keep going.</p>
      )}
    </div>
  )
}

// ---------- Handoff photos ----------

// Shrink a phone photo to at most 1600px on the long side, as a JPEG data URL.
async function resizePhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('That file isn’t a photo we can read.'))
      i.src = url
    })
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.8)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function PhotosCard({ token, photos, has, onSaved }: { token: string; photos: Photo[]; has: Record<ItemKey, boolean>; onSaved: (progress: any) => void }) {
  const shots = PHOTO_SHOTS.filter((s) => !s.only || has[s.only])
  const [label, setLabel] = useState(shots[0]?.label || 'Photo')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  async function add(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setMsg('')
    try {
      for (const f of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
        const image = await resizePhoto(f)
        const res = await fetch('/api/express/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, label, image }),
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Could not save the photo.')
        onSaved(d.progress)
        photos = d.progress.photos
      }
    } catch (e: any) {
      setMsg(e?.message || 'Could not save the photo.')
    }
    setBusy(false)
  }

  async function remove(id: string) {
    const res = await fetch('/api/express/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'delete', id }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok) onSaved(d.progress)
    setOpen(null)
  }

  const src = (id: string) => `/api/express/photo?token=${token}&id=${id}`
  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div style={eyebrow}>PHOTOS</div>
        <div style={{ fontSize: 13, color: muted }}>
          {photos.length} of {MAX_PHOTOS}
        </div>
      </div>
      <h2 style={h2}>Take photos as you go</h2>
      <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
        A dated record of the boat’s condition and the papers at the handoff. They go into your condition report. Don’t
        photograph anyone’s driver’s license.
      </p>
      <label htmlFor="ph-label" style={{ fontSize: 14, fontWeight: 600, color: cream }}>
        What’s in the photo
      </label>
      <select id="ph-label" value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle}>
        {shots.map((s) => (
          <option key={s.label} value={s.label}>
            {s.label}
          </option>
        ))}
      </select>
      <label style={{ ...goldButton, opacity: busy || photos.length >= MAX_PHOTOS ? 0.6 : 1, cursor: busy ? 'default' : 'pointer' }}>
        {busy ? 'Saving...' : 'Take or add a photo'}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          disabled={busy || photos.length >= MAX_PHOTOS}
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
          style={{ display: 'none' }}
        />
      </label>
      {msg && <p style={{ margin: 0, color: gold, fontSize: 14 }}>{msg}</p>}
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
          {photos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpen(p.id)}
              style={{ padding: 0, border: `1px solid ${line}`, borderRadius: 6, overflow: 'hidden', background: navy, cursor: 'pointer', textAlign: 'left' }}
            >
              <img src={src(p.id)} alt={p.label} loading="lazy" style={{ width: '100%', height: 84, objectFit: 'cover', display: 'block' }} />
              <span style={{ display: 'block', fontSize: 11, color: muted, padding: '4px 6px', lineHeight: 1.3 }}>{p.label}</span>
            </button>
          ))}
        </div>
      )}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#080e1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 }}
        >
          <img src={src(open)} alt="" style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 10 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => remove(open)} style={outlineButton}>
              Delete photo
            </button>
            <button type="button" onClick={() => setOpen(null)} style={goldButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Step 2: the paid inspection ----------

const STATUS_OPTS: { key: InspectStatus; label: string }[] = [
  { key: 'ok', label: 'Looks good' },
  { key: 'issue', label: 'Problem' },
  { key: 'skip', label: 'Skip' },
]

export function InspectionLocked({ preview }: { preview: InspectionPreview | null }) {
  if (!preview) return null
  return (
    <div style={{ ...boxStyle, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div style={eyebrow}>GUIDED INSPECTION</div>
        <div style={{ fontSize: 11, letterSpacing: 1, fontWeight: 700, color: gold }}>🔒 $29.99</div>
      </div>
      <h2 style={h2}>A {preview.count}-point inspection to take with you</h2>
      <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
        {preview.sections.join(' · ')}. Mark each item Looks good or Problem on your phone, add notes, and get a condition report to
        negotiate with. {preview.redFlags} red-flag checks tell you when to walk away.
      </p>
      <ul style={{ margin: 0, paddingLeft: 20, color: cream, fontSize: 15, lineHeight: 1.7 }}>
        {preview.sample.map((t) => (
          <li key={t}>{t}</li>
        ))}
        <li style={{ color: muted, listStyle: 'none', marginLeft: -20 }}>+ {preview.count - preview.sample.length} more, unlocked with the paperwork</li>
      </ul>
    </div>
  )
}

export function InspectionStep({
  token,
  list,
  inspection,
  onChange,
  onNext,
  photos,
  has,
  onPhotos,
}: {
  photos: Photo[]
  has: Record<ItemKey, boolean>
  onPhotos: (progress: any) => void
  token: string
  list: InspectItem[]
  inspection: InspectionProgress
  onChange: (patch: { items?: InspectionProgress['items']; hours?: string; notes?: string }) => void
  onNext: () => void
}) {
  const [openNote, setOpenNote] = useState<Record<string, boolean>>({})
  const items = inspection.items || {}
  const sections = Array.from(new Set(list.map((i) => i.section)))
  const done = list.filter((i) => items[i.id]?.s).length
  const problems = list.filter((i) => items[i.id]?.s === 'issue')
  const redHits = problems.filter((i) => i.redFlag)

  function setStatus(id: string, s: InspectStatus) {
    const cur = items[id] || {}
    const next = cur.s === s ? { ...cur, s: undefined } : { ...cur, s }
    onChange({ items: { [id]: next } })
    if (s === 'issue' && cur.s !== 'issue') setOpenNote((o) => ({ ...o, [id]: true }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={boxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <div style={eyebrow}>GUIDED INSPECTION</div>
          <div style={{ fontSize: 13, color: muted }}>
            {done} of {list.length} checked
          </div>
        </div>
        <h2 style={h2}>Inspect it before you hand over a dollar</h2>
        <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
          Open this on your phone at the boat. Bring a flashlight, a rag, and someone to help on the sea trial. Items marked 🚩 are
          red flags: a problem there is a reason to walk away. Everything saves as you go.
        </p>
        <div style={{ height: 6, background: 'rgba(245,241,232,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${list.length ? (done / list.length) * 100 : 0}%`, height: '100%', background: gold }} />
        </div>
      </div>

      {sections.map((section) => (
        <div key={section} style={boxStyle}>
          <div style={eyebrow}>{section.toUpperCase()}</div>
          {list
            .filter((i) => i.section === section)
            .map((it, idx) => {
              const r = items[it.id] || {}
              const noteOpen = openNote[it.id] || !!r.note
              return (
                <div key={it.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: idx ? `1px solid ${line}` : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: cream }}>
                      {it.redFlag && <span aria-label="Red flag">🚩 </span>}
                      {it.label}
                    </span>
                    {it.detail && <span style={{ fontSize: 14, lineHeight: 1.55, color: muted }}>{it.detail}</span>}
                  </div>
                  <div role="radiogroup" aria-label={it.label} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {STATUS_OPTS.map((o) => {
                      const on = r.s === o.key
                      const bad = o.key === 'issue'
                      return (
                        <button
                          key={o.key}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setStatus(it.id, o.key)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 18,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: `1px solid ${on ? (bad ? '#e07a5f' : gold) : 'rgba(245,241,232,0.3)'}`,
                            background: on ? (bad ? 'rgba(224,122,95,0.2)' : 'rgba(201,150,46,0.2)') : 'transparent',
                            color: on && bad ? '#f2b8a6' : cream,
                          }}
                        >
                          {on && o.key === 'ok' ? '✓ ' : ''}
                          {o.label}
                        </button>
                      )
                    })}
                    {!noteOpen && (
                      <button
                        type="button"
                        onClick={() => setOpenNote((o) => ({ ...o, [it.id]: true }))}
                        style={{ padding: '8px 10px', fontSize: 13, background: 'transparent', border: 'none', color: muted, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Add a note
                      </button>
                    )}
                  </div>
                  {noteOpen && (
                    <textarea
                      aria-label={`Note: ${it.label}`}
                      placeholder={r.s === 'issue' ? 'What did you find? e.g. soft spot left of the console, about the size of a hand' : 'Note'}
                      value={r.note || ''}
                      maxLength={400}
                      onChange={(e) => onChange({ items: { [it.id]: { ...r, note: e.target.value } } })}
                      rows={2}
                      style={inputStyle}
                    />
                  )}
                  {r.s === 'issue' && it.redFlag && (
                    <p style={{ margin: 0, color: '#f2b8a6', fontSize: 14, lineHeight: 1.5 }}>
                      Red flag. Don’t pay until this is explained, fixed, or you’ve decided to walk away.
                    </p>
                  )}
                </div>
              )
            })}
        </div>
      ))}

      <PhotosCard token={token} photos={photos} has={has} onSaved={onPhotos} />

      <div style={boxStyle}>
        <div style={eyebrow}>YOUR NOTES</div>
        <Field id="i-hours" label="Engine hours you saw" hint="optional" placeholder="412" value={inspection.hours || ''} onChange={(v) => onChange({ hours: v.replace(/[^0-9.,]/g, '') })} />
        <Field
          id="i-notes"
          label="Anything else"
          hint="optional"
          placeholder="Seller agreed to replace the trailer tires before pickup"
          textarea
          value={inspection.notes || ''}
          onChange={(v) => onChange({ notes: v })}
        />
      </div>

      <div style={{ ...boxStyle, ...(problems.length ? { border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)' } : {}) }}>
        <div style={eyebrow}>CONDITION REPORT</div>
        <h2 style={h2}>
          {problems.length
            ? `${problems.length} problem${problems.length > 1 ? 's' : ''} found${redHits.length ? `, ${redHits.length} red flag${redHits.length > 1 ? 's' : ''}` : ''}`
            : done
              ? 'No problems marked so far'
              : 'Your report builds as you inspect'}
        </h2>
        {problems.length > 0 && (
          <>
            <ul style={{ margin: 0, paddingLeft: 20, color: cream, fontSize: 15, lineHeight: 1.6 }}>
              {problems.map((i) => (
                <li key={i.id}>
                  {i.label}
                  {items[i.id]?.note ? <span style={{ color: muted }}> · {items[i.id].note}</span> : null}
                </li>
              ))}
            </ul>
            <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
              Show the seller the report and ask them to fix these, lower the price, or both. Get any agreement in writing. If the price
              changes, ask for the new price on the bill of sale and the title.
            </p>
          </>
        )}
        <DocRow token={token} doc="condition-report" name="Condition report" note="Every item, your notes, and the problems up top. Share it with a mechanic or the seller." primary />
        <p style={{ margin: 0, color: muted, fontSize: 12, lineHeight: 1.5 }}>
          This records what you saw. It isn’t a marine survey. For a bigger purchase, hire an accredited surveyor and a marine mechanic.
        </p>
      </div>

      <button type="button" onClick={onNext} style={goldButton}>
        Go to the handoff
      </button>
    </div>
  )
}

// ---------- Seller questions: send in writing, note the answers ----------

export function SellerQuestions({
  token,
  deal,
  items,
  checks,
  answers,
  onToggle,
  onAnswer,
  onSent,
}: {
  token: string
  onSent: (progress: any) => void
  deal: any
  items: CheckItem[]
  checks: Record<string, boolean>
  answers: Record<string, string>
  onToggle: (id: string, v: boolean) => void
  onAnswer: (id: string, text: string) => void
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const contacts = deal.progress?.contacts || {}
  const [via, setVia] = useState<ChannelChoice>(contacts.sellerPhone && !contacts.sellerEmail ? 'sms' : 'email')
  const [sEmail, setSEmail] = useState<string>(contacts.sellerEmail || deal.progress?.handoff?.sellerEmail || '')
  const [sPhone, setSPhone] = useState<string>(contacts.sellerPhone || '')
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')
  const askedCount = Array.isArray(deal.progress?.asked) ? deal.progress.asked.length : 0
  async function send() {
    setSending(true)
    setSendMsg('')
    try {
      const res = await fetch('/api/express/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'ask-seller', channels: toChannels(via), email: via !== 'sms' ? sEmail : '', phone: via !== 'email' ? sPhone : '' }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not send.')
      onSent(d.progress)
      const parts = [d.emailSent && 'emailed', d.textSent && 'texted'].filter(Boolean).join(' and ')
      setSendMsg(
        `Sent${parts ? `: ${parts}` : ''}. ${d.textSent ? 'Text replies come to your email. ' : ''}${d.emailSent ? 'Email replies go straight to you.' : ''}${d.textError ? ` ${d.textError}` : ''}`
      )
    } catch (e: any) {
      setSendMsg(e?.message || 'Could not send.')
    }
    setSending(false)
  }
  const what = Object.values(deal.items || {})
    .map((i: any) => `${i.description}${i.hin ? ` (HIN ${i.hin})` : i.vin ? ` (VIN ${i.vin})` : ''}`)
    .join(', ')
  const sellerFirst = String(deal.seller_name || '').split(' ')[0]
  const buyerFirst = String(deal.buyer_name || '').split(' ')[0]
  const message =
    `Hi ${sellerFirst},\n\nI'm interested in your ${what}. Before I come take a look, could you answer these questions? ` +
    `In writing is great, so we both have a record.\n\n` +
    items.map((q, i) => `${i + 1}. ${q.label}`).join('\n') +
    `\n\nThanks,\n${buyerFirst}`
  const sellerEmail = deal.progress?.handoff?.sellerEmail || ''
  const subject = `Questions about your ${Object.values(deal.items || {}).map((i: any) => i.description)[0] || 'boat'}`
  const mailto = `mailto:${encodeURIComponent(sellerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
  const sms = `sms:?&body=${encodeURIComponent(message)}`
  const count = items.filter((i) => checks[i.id] || (answers[i.id] || '').trim()).length

  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div style={eyebrow}>QUESTIONS FOR THE SELLER</div>
        <div style={{ fontSize: 13, color: muted }}>
          {count} of {items.length} answered
        </div>
      </div>
      <h2 style={h2}>Ask these before you go look</h2>
      <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
        Send them in writing. A written answer is a record if something turns out not to be true, and sellers tend to be
        more careful with buyers who ask this way.
      </p>
      <ChannelPicker label="Send the questions by" value={via} onChange={setVia} />
      {via !== 'sms' && <Field id="sq-email" label="Seller’s email" type="email" value={sEmail} onChange={setSEmail} />}
      {via !== 'email' && <Field id="sq-phone" label="Seller’s mobile number" type="tel" value={sPhone} onChange={setSPhone} />}
      <button type="button" onClick={send} disabled={sending || askedCount >= 3} style={{ ...goldButton, opacity: sending || askedCount >= 3 ? 0.6 : 1 }}>
        {sending ? 'Sending...' : askedCount ? 'Send the questions again' : 'Send the questions'}
      </button>
      {sendMsg && <p style={{ margin: 0, color: gold, fontSize: 14, lineHeight: 1.5 }}>{sendMsg}</p>}
      <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.5 }}>
        We send it from BoatClosers with your name on it. Answers come back to you, and the seller can opt out any time. Prefer
        your own? <a href={mailto} style={{ color: gold }}>Use my email</a> or <a href={sms} style={{ color: gold }}>my texts</a>. Note the
        answers below; they save with your purchase.
      </p>
      <div>
        {items.map((q, i) => {
          const a = answers[q.id] || ''
          const show = open[q.id] || !!a
          return (
            <div key={q.id} style={{ padding: '11px 0', borderTop: i ? `1px solid ${line}` : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!checks[q.id]}
                  onChange={(e) => onToggle(q.id, e.target.checked)}
                  style={{ width: 20, height: 20, marginTop: 2, accentColor: gold, flexShrink: 0 }}
                />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: cream }}>{q.label}</span>
                  {q.detail && <span style={{ fontSize: 14, lineHeight: 1.55, color: muted }}>{q.detail}</span>}
                </span>
              </label>
              {show ? (
                <div style={{ paddingLeft: 32 }}>
                  <label htmlFor={`ans-${q.id}`} style={{ position: 'absolute', left: -9999 }}>
                    Seller’s answer
                  </label>
                  <textarea
                    id={`ans-${q.id}`}
                    rows={2}
                    value={a}
                    placeholder="What the seller said"
                    onChange={(e) => onAnswer(q.id, e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen({ ...open, [q.id]: true })}
                  style={{ marginLeft: 32, alignSelf: 'flex-start', background: 'none', border: 'none', color: gold, fontSize: 14, cursor: 'pointer', padding: 0 }}
                >
                  + Note the seller’s answer
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Form bits ----------

const inputStyle = {
  padding: '12px 14px',
  fontSize: 16,
  borderRadius: 6,
  border: `1px solid ${line}`,
  background: cream,
  color: navy,
  width: '100%',
  boxSizing: 'border-box' as const,
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  type = 'text',
  placeholder,
  textarea,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  textarea?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14, fontWeight: 600, color: cream }}>
        {label} {hint && <span style={{ fontWeight: 400, color: muted }}>· {hint}</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
        />
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  )
}

function Select({
  id,
  label,
  hint,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14, fontWeight: 600, color: cream }}>
        {label} {hint && <span style={{ fontWeight: 400, color: muted }}>· {hint}</span>}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">Choose...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | undefined
  options: { key: T; label: string; hint?: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: cream }}>{label}</div>
      <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((o) => {
          const on = value === o.key
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.key)}
              style={{
                textAlign: 'left',
                padding: '11px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                border: `1px solid ${on ? gold : 'rgba(245,241,232,0.3)'}`,
                background: on ? 'rgba(201,150,46,0.15)' : 'transparent',
                color: cream,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>{o.label}</span>
              {o.hint && <span style={{ fontSize: 13, color: muted }}>{o.hint}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const LIEN_OPTIONS = [
  { key: 'none' as const, label: 'No lienholder on the title' },
  { key: 'released' as const, label: 'A lienholder is listed, and I have the signed lien release' },
  { key: 'open' as const, label: 'A lienholder is listed, and there’s no release yet' },
]

// ---------- Step 3: at the handoff ----------

export function HandoffStep({
  token,
  deal,
  has,
  checks,
  onToggle,
  onSaved,
}: {
  token: string
  deal: any
  has: Record<ItemKey, boolean>
  checks: Record<string, boolean>
  onToggle: (id: string, v: boolean) => void
  onSaved: (progress: any) => void
}) {
  const saved: Handoff = deal.progress?.handoff || {}
  const [h, setH] = useState<Handoff>({ saleDate: new Date().toISOString().slice(0, 10), ...saved })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [emailing, setEmailing] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [via, setVia] = useState<ChannelChoice>(saved.sellerPhone ? (saved.sellerEmail ? 'both' : 'sms') : 'email')
  const set = (patch: Partial<Handoff>) => setH({ ...h, ...patch })

  const savedProblems = handoffProblems(saved, has)
  const ready = savedProblems.length === 0 && saved.lien !== 'open'
  const dirty = JSON.stringify(h) !== JSON.stringify(saved)

  async function save() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/express/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'handoff', handoff: h }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not save.')
      onSaved(d.progress)
      const p = handoffProblems(d.progress.handoff, has)
      setMsg(p.length ? `Saved. Still needed: ${p[0]}` : 'Saved. Your papers are filled in below.')
    } catch (e: any) {
      setMsg(e?.message || 'Could not save.')
    }
    setSaving(false)
  }

  async function emailSeller() {
    setEmailing(true)
    setEmailMsg('')
    try {
      const res = await fetch('/api/express/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'email-seller', channels: toChannels(via), phone: saved.sellerPhone }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not send.')
      onSaved(d.progress)
      const to = [via !== 'sms' && saved.sellerEmail, d.textSent && saved.sellerPhone].filter(Boolean).join(' and ')
      setEmailMsg(`Sent to ${to}.${d.textError ? ` ${d.textError}` : ''}`)
    } catch (e: any) {
      setEmailMsg(e?.message || 'Could not send.')
    }
    setEmailing(false)
  }

  const docs = [
    has.boat && ['vessel-bill-of-sale', 'Vessel bill of sale', 'Both of you sign. Keep it aboard: it’s your temporary registration for 30 days.'],
    has.motor && !has.boat && ['motor-bill-of-sale', 'Motor bill of sale', 'Both of you sign.'],
    has.trailer && ['trailer-bill-of-sale', 'Trailer bill of sale', 'Both of you sign. The trailer is titled separately.'],
    has.boat && ['hsmv-82050-boat', 'Florida form HSMV 82050, boat', 'The state’s own bill of sale, filled in. Page 1 is yours. Page 2 is the seller’s notice of sale to sign and file.'],
    has.trailer && ['hsmv-82050-trailer', 'Florida form HSMV 82050, trailer', 'Same state form for the trailer. Page 2 is the seller’s notice of sale.'],
    ['payment-receipt', 'Payment receipt', 'The seller signs this when you pay.'],
  ].filter(Boolean) as [string, string, string][]

  const smsBody = encodeURIComponent(
    `Hi ${String(deal.seller_name).split(' ')[0]}, thanks again. One thing for you: within 30 days, fill out the notice of sale on the back of the title or form HSMV 82050 and file it with the tax collector, so the boat's out of your name.`
  )
  const sentCount = Array.isArray(deal.progress?.sellerEmailed) ? deal.progress.sellerEmailed.length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={boxStyle}>
        <div style={eyebrow}>SALE DETAILS</div>
        <h2 style={h2}>Fill these in once. Every paper is filled in for you.</h2>
        <Field id="h-date" label="Date of sale" type="date" value={h.saleDate || ''} onChange={(v) => set({ saleDate: v })} />
        <Field id="h-county" label="Florida county where you’re buying" placeholder="Palm Beach" value={h.county || ''} onChange={(v) => set({ county: v })} />
        <Field id="h-baddr" label="Your address" hint="street, city, state, ZIP" value={h.buyerAddress || ''} onChange={(v) => set({ buyerAddress: v })} />
        <Field id="h-saddr" label="Seller’s address" value={h.sellerAddress || ''} onChange={(v) => set({ sellerAddress: v })} />
        <Field
          id="h-semail"
          label="Seller’s email"
          hint="optional, to send them their copy"
          type="email"
          value={h.sellerEmail || ''}
          onChange={(v) => set({ sellerEmail: v })}
        />
        <Field
          id="h-sphone"
          label="Seller’s mobile number"
          hint="optional, to text them their copy"
          type="tel"
          value={h.sellerPhone || ''}
          onChange={(v) => set({ sellerPhone: v })}
        />
        <Select id="h-pay" label="How you’re paying" value={h.paymentMethod || ''} options={PAYMENT_METHODS} onChange={(v) => set({ paymentMethod: v })} />
        <Field
          id="h-inv"
          label="What’s included besides the items above"
          hint="optional"
          placeholder="Garmin fishfinder, bimini top, 4 life jackets, spare prop, 2 keys"
          textarea
          value={h.inventory || ''}
          onChange={(v) => set({ inventory: v })}
        />

        {has.boat && (
          <>
            <div style={{ ...eyebrow, marginTop: 8 }}>THE BOAT</div>
            <Field id="h-len" label="Length in feet" hint="required on a Florida bill of sale" placeholder="17" value={h.lengthFt || ''} onChange={(v) => set({ lengthFt: v.replace(/[^0-9.' ]/g, '') })} />
            <Select id="h-prop" label="Propulsion" hint="required" value={h.propulsion || ''} options={PROPULSION} onChange={(v) => set({ propulsion: v })} />
            <Select id="h-hull" label="Hull material" hint="for the title application" value={h.hull || ''} options={HULLS} onChange={(v) => set({ hull: v })} />
            <Select id="h-fuel" label="Fuel" hint="for the title application" value={h.fuel || ''} options={FUELS} onChange={(v) => set({ fuel: v })} />
          </>
        )}

        <div style={{ ...eyebrow, marginTop: 8 }}>THE TITLE</div>
        <Choice label={has.boat ? 'How is the boat titled?' : 'How is it titled or registered?'} value={h.titledHow} options={TITLED_OPTIONS} onChange={(v) => set({ titledHow: v })} />
        {h.titledHow === 'florida' && (
          <Field id="h-tnum" label="Florida title number" hint="optional, on the front of the title" value={h.titleNumber || ''} onChange={(v) => set({ titleNumber: v })} />
        )}
        {(h.titledHow === 'florida' || h.titledHow === 'other-title' || h.titledHow === 'other-no-title') && has.boat && (
          <Field id="h-reg" label="Registration number" hint="optional, the FL 1234 AB number on the bow" value={h.registrationNumber || ''} onChange={(v) => set({ registrationNumber: v })} />
        )}
        {h.titledHow === 'documented' && (
          <Field id="h-on" label="Coast Guard official number" hint="on the Certificate of Documentation" value={h.officialNumber || ''} onChange={(v) => set({ officialNumber: v })} />
        )}
        <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', color: cream, fontSize: 15 }}>
          <input
            type="checkbox"
            checked={!!h.twoSellers}
            onChange={(e) => set({ twoSellers: e.target.checked })}
            style={{ width: 20, height: 20, accentColor: gold }}
          />
          There are two owners on the title
        </label>
        {h.twoSellers && <Field id="h-s2" label="Second owner’s full name" value={h.secondSeller || ''} onChange={(v) => set({ secondSeller: v })} />}
        <Choice label="Does the title show a lienholder?" value={h.lien} options={LIEN_OPTIONS} onChange={(v) => set({ lien: v })} />

        {msg && <p style={{ margin: 0, color: gold, fontSize: 15 }}>{msg}</p>}
        <button type="button" onClick={save} disabled={saving || !dirty} style={{ ...goldButton, opacity: saving || !dirty ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save and fill in my papers'}
        </button>
      </div>

      {saved.lien === 'open' && (
        <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.1)' }}>
          <div style={eyebrow}>STOP BEFORE YOU PAY</div>
          <h2 style={h2}>There’s an open lien on this title</h2>
          <p style={{ margin: 0, color: cream, lineHeight: 1.6 }}>
            Until that lender releases the lien, it has a claim on the boat, even after you pay the seller. Don’t hand over
            money yet. Your options:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, color: cream, lineHeight: 1.7 }}>
            <li>The seller pays off the loan first and gives you the signed lien release.</li>
            <li>You pay the lender directly, using a written payoff letter, and the release comes to you.</li>
            <li>
              Use full BoatClosers with escrow, so no money is released until the lien is cleared.{' '}
              <a href="/" style={{ color: gold }}>
                See full BoatClosers
              </a>
            </li>
          </ul>
          <p style={{ margin: 0, color: muted, fontSize: 14 }}>Once you have the release, change your answer above and your papers unlock.</p>
        </div>
      )}

      {ready && (
        <div style={boxStyle}>
          <div style={eyebrow}>YOUR PAPERS</div>
          <h2 style={h2}>Print these, or open them on your phone, for the handoff</h2>
          <DocRow
            token={token}
            doc="closing-packet"
            name="Everything in one file"
            note="Every paper below plus your title application, worksheet, and condition report, in the order you’ll use them. Easiest to print."
            primary
          />
          {docs.map(([key, name, note]) => (
            <DocRow key={key} token={token} doc={key} name={name} note={note} />
          ))}
          {saved.titledHow === 'other-no-title' && (
            <p style={{ margin: 0, color: gold, fontSize: 14, lineHeight: 1.6 }}>
              Because the boat comes from a state that doesn’t title boats, the seller must sign the bill of sale in front of a
              notary. The notary section is on the last page.
            </p>
          )}
          {saved.titledHow === 'documented' && (
            <p style={{ margin: 0, color: gold, fontSize: 14, lineHeight: 1.6 }}>
              Documented boat: also have the seller sign the Coast Guard bill of sale,{' '}
              <a href="https://www.dco.uscg.mil/nvdc/" target="_blank" rel="noopener noreferrer" style={{ color: gold }}>
                form CG-1340 from the Vessel Documentation Center
              </a>
              .
            </p>
          )}
        </div>
      )}

      {ready && (
        <Checklist
          label="TITLE SIGNING GUIDE"
          title="Check each of these before you hand over payment"
          items={titleSigningGuide(saved)}
          checks={checks}
          onToggle={onToggle}
        />
      )}

      {ready && (
        <div style={boxStyle}>
          <div style={eyebrow}>THE SELLER’S COPY</div>
          <h2 style={h2}>Send the seller their papers</h2>
          <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>
            We send them their copies plus their notice of sale on the state form, already filled in, so all they do is sign
            and file it. A text carries a private link to view and download them. They don’t need an account.
          </p>
          <ChannelPicker label="Send the seller’s copy by" value={via} onChange={setVia} />
          {(via !== 'sms' && !saved.sellerEmail) || (via !== 'email' && !saved.sellerPhone) ? (
            <p style={{ margin: 0, color: cream, fontSize: 14 }}>
              Add the seller’s {via !== 'sms' && !saved.sellerEmail ? 'email' : 'mobile number'} in the sale details above, then save.
            </p>
          ) : (
            <button type="button" onClick={emailSeller} disabled={emailing || sentCount >= 3} style={{ ...goldButton, opacity: emailing || sentCount >= 3 ? 0.6 : 1 }}>
              {emailing ? 'Sending...' : `${sentCount ? 'Send again' : 'Send the seller their papers'}`}
            </button>
          )}
          {emailMsg && <p style={{ margin: 0, color: gold, fontSize: 14 }}>{emailMsg}</p>}
          <a href={`sms:?&body=${smsBody}`} style={{ color: muted, fontSize: 13 }}>
            Or text the reminder from your own phone
          </a>
        </div>
      )}
    </div>
  )
}

// ---------- Step 4: after it's yours ----------

export function AfterStep({
  token,
  deal,
  has,
  checks,
  onToggle,
}: {
  token: string
  deal: any
  has: Record<ItemKey, boolean>
  checks: Record<string, boolean>
  onToggle: (id: string, v: boolean) => void
}) {
  const h: Handoff = deal.progress?.handoff || {}
  const ready = handoffProblems(h, has).length === 0 && h.lien !== 'open'
  const due = h.saleDate ? addDays(h.saleDate, 30) : null
  const tax = salesTaxEstimate(deal.price_cents)
  const bring = whatToBring(h, has)

  if (!ready) {
    return (
      <div style={boxStyle}>
        <div style={eyebrow}>AFTER IT’S YOURS</div>
        <h2 style={h2}>Fill in the sale details in step 3 first</h2>
        <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>Your title worksheet, deadline, and checklist are built from them.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)' }}>
        <div style={eyebrow}>YOUR DEADLINE</div>
        <h2 style={{ ...h2, fontSize: 24 }}>
          Title and register by {due ? due.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '30 days after the sale'}
        </h2>
        <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
          Any Florida county tax collector’s office can do it. Florida charges a late penalty after 30 days, and your bill of
          sale stops working as temporary registration.
        </p>
      </div>

      <div style={boxStyle}>
        <div style={eyebrow}>WHAT TO BRING</div>
        <h2 style={h2}>Take all of this to the tax collector</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: cream, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bring.map((b) => (
            <li key={b.label}>
              {b.href ? (
                <a href={b.href} target="_blank" rel="noopener noreferrer" style={{ color: cream }}>
                  {b.label}
                </a>
              ) : (
                b.label
              )}
              {b.detail && <div style={{ color: muted, fontSize: 14 }}>{b.detail}</div>}
            </li>
          ))}
        </ul>
        {has.boat && h.titledHow !== 'documented' && (
          <DocRow
            token={token}
            doc="hsmv-82040-vs"
            name="Title application, HSMV 82040 VS"
            note="Florida’s official form, pre-filled with your sale. Add your driver license number, date of birth, vessel type, and county, then sign. You can type into it or print it."
            primary
          />
        )}
        <DocRow token={token} doc="title-worksheet" name="Title worksheet" note="Every value from your sale, plus this list to check off at the counter." />
      </div>

      <div style={boxStyle}>
        <div style={eyebrow}>WHAT IT WILL COST</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: cream, fontSize: 15 }}>
          <span>Florida sales tax (6%)</span>
          <b>about {money(Math.round(tax.state * 100))}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: cream, fontSize: 15 }}>
          <span>County surtax, first $5,000 only</span>
          <b>up to {money(Math.round(tax.surtaxMax * 100))}</b>
        </div>
        <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.5 }}>
          Plus title and registration fees. In a private sale you pay the sales tax when you title the boat. The tax
          collector calculates the exact amount.
        </p>
      </div>

      <Checklist
        label="NEW OWNER CHECKLIST"
        title="Get on the water the right way"
        items={forItems(NEW_OWNER, has)}
        checks={checks}
        onToggle={onToggle}
      />

      <div style={boxStyle}>
        <div style={eyebrow}>DOCUMENTS</div>
        <h2 style={h2}>Everything from this sale, any time</h2>
        {[
          has.boat && ['vessel-bill-of-sale', 'Vessel bill of sale'],
          has.motor && !has.boat && ['motor-bill-of-sale', 'Motor bill of sale'],
          has.trailer && ['trailer-bill-of-sale', 'Trailer bill of sale'],
          has.boat && ['hsmv-82050-boat', 'Florida form HSMV 82050, boat'],
          has.trailer && ['hsmv-82050-trailer', 'Florida form HSMV 82050, trailer'],
          ['payment-receipt', 'Payment receipt'],
          ['closing-summary', 'Closing summary'],
          ['title-worksheet', 'Title & registration worksheet'],
          has.boat && h.titledHow !== 'documented' && ['hsmv-82040-vs', 'Title application, HSMV 82040 VS'],
          ['condition-report', 'Condition report'],
          ['closing-packet', 'Closing packet (everything in one file)'],
        ]
          .filter(Boolean)
          .map((d) => {
            const [key, name] = d as [string, string]
            return <DocRow key={key} token={token} doc={key} name={name} />
          })}
        <p style={{ margin: 0, color: muted, fontSize: 13 }}>Keep these with your boat records. Your private link brings you back here from any device.</p>
      </div>
    </div>
  )
}
