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
export const h2 = { fontFamily: 'Georgia, serif', fontSize: 20, color: cream, lineHeight: 1.3, margin: 0 }

export function money(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export const goldButton = {
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
export const outlineButton = {
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
  { id: 'f-finance', label: 'I’m financing through a lender', why: 'Most lenders want a signed purchase agreement and a closing they can pay into. My Boat Closing doesn’t create either.' },
  { id: 'f-agreement', label: 'We both want a signed purchase agreement', why: 'My Boat Closing is buyer-only. Full BoatClosers brings the seller in, and both of you sign the agreement and the closing papers.' },
]

export function FullSuggest({ deal, checks, onToggle, moveHref = '/' }: { deal: any; checks: Record<string, boolean>; onToggle: (id: string, v: boolean) => void; moveHref?: string }) {
  const hits = FULL_REASONS.filter((r) => checks[r.id])
  const big = deal.price_cents > 2500000
  const lienOpen = deal.progress?.handoff?.lien === 'open'
  return (
    <div style={{ ...boxStyle, ...(hits.length || lienOpen ? { border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)' } : {}) }}>
      <div style={eyebrow}>IS EXPRESS RIGHT FOR THIS DEAL?</div>
      <h2 style={h2}>My Boat Closing is for a simple sale. Does yours need any of these?</h2>
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
            {' '}Everything you entered here moves over with you.
            {deal.status === 'paid' ? ' The $29.99 you paid here comes off the $249.' : ' If you’ve paid for My Boat Closing, that $29.99 comes off the $249.'}
          </p>
          <a href={moveHref} style={{ ...goldButton, alignSelf: 'flex-start', textDecoration: 'none' }}>
            Move this purchase to BoatClosers
          </a>
        </div>
      )}
      {!hits.length && !lienOpen && !big && (
        <p style={{ margin: 0, color: muted, fontSize: 13 }}>None of these? My Boat Closing is the right tool. Keep going.</p>
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
  const [sEmail, setSEmail] = useState<string>(contacts.sellerEmail || deal.progress?.handoff?.sellerEmail || '')
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
        body: JSON.stringify({ token, action: 'ask-seller', email: sEmail }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not send.')
      onSent(d.progress)
      setSendMsg('Sent. Replies go straight to you.')
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
      <Field id="sq-email" label="Seller’s email" type="email" value={sEmail} onChange={setSEmail} />
      <button type="button" onClick={send} disabled={sending || askedCount >= 3} style={{ ...goldButton, opacity: sending || askedCount >= 3 ? 0.6 : 1 }}>
        {sending ? 'Sending...' : askedCount ? 'Send the questions again' : 'Send the questions'}
      </button>
      {sendMsg && <p style={{ margin: 0, color: gold, fontSize: 14, lineHeight: 1.5 }}>{sendMsg}</p>}
      <p style={{ margin: 0, color: muted, fontSize: 13, lineHeight: 1.5 }}>
        We email it from BoatClosers with your name on it. Answers come back to you, and the seller can opt out any time. Only have their number, or prefer
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

export function Field({
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

export function Select({
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

export function Choice<T extends string>({
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

export const LIEN_OPTIONS = [
  { key: 'none' as const, label: 'No lienholder on the title' },
  { key: 'released' as const, label: 'A lienholder is listed, and I have the signed lien release' },
  { key: 'open' as const, label: 'A lienholder is listed, and there’s no release yet' },
]
