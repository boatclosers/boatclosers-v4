'use client'

import { useState } from 'react'

const navy = '#0f1b2d'
const card = '#18283f'
const gold = '#c9962e'
const cream = '#f5f1e8'
const muted = '#bdb6a8'
const line = 'rgba(201,150,46,0.35)'

type ItemKey = 'boat' | 'trailer' | 'motor'

const ITEMS: {
  key: ItemKey
  label: string
  descLabel: string
  descPh: string
  idKey: 'hin' | 'vin' | 'serial'
  idLabel: string
  idHint: string
  idPh: string
}[] = [
  {
    key: 'boat',
    label: 'Boat',
    descLabel: 'Year, make & model',
    descPh: '2015 Carolina Skiff 17',
    idKey: 'hin',
    idLabel: 'HIN',
    idHint: '12 characters, on the transom',
    idPh: 'e.g. CKS12345D515',
  },
  {
    key: 'trailer',
    label: 'Trailer',
    descLabel: 'Year & make',
    descPh: '2015 Magic Tilt',
    idKey: 'vin',
    idLabel: 'VIN',
    idHint: '17 characters, on the tongue',
    idPh: 'On the trailer tongue or frame',
  },
  {
    key: 'motor',
    label: 'Motor',
    descLabel: 'Make, horsepower & year',
    descPh: 'Yamaha 90 HP 2016',
    idKey: 'serial',
    idLabel: 'Serial number',
    idHint: 'plate on the mounting bracket',
    idPh: "As shown on the motor's ID plate",
  },
]

const inputStyle = {
  padding: '13px 14px',
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
  placeholder,
  mono,
  type = 'text',
  inputMode,
  autoComplete,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  type?: string
  inputMode?: 'text' | 'decimal' | 'email'
  autoComplete?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14, fontWeight: 600 }}>
        {label} {hint && <span style={{ fontWeight: 400, color: muted }}>· {hint}</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete || 'off'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={mono ? { ...inputStyle, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 1 } : inputStyle}
      />
    </div>
  )
}

export default function ExpressStart() {
  const [picked, setPicked] = useState<Record<ItemKey, boolean>>({ boat: true, trailer: false, motor: false })
  const [desc, setDesc] = useState<Record<ItemKey, string>>({ boat: '', trailer: '', motor: '' })
  const [ids, setIds] = useState<Record<ItemKey, string>>({ boat: '', trailer: '', motor: '' })
  const [price, setPrice] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [website, setWebsite] = useState('') // hidden spam trap
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const chosen = ITEMS.filter((i) => picked[i.key])
  const summary =
    chosen.length === 0
      ? 'nothing yet'
      : chosen.length === 3
        ? 'boat, trailer, and motor'
        : chosen.map((i) => i.label.toLowerCase()).join(' and ')

  async function handleContinue() {
    setError('')
    if (!chosen.length) return setError('Pick at least one item.')
    for (const i of chosen) {
      if (!desc[i.key].trim()) return setError(`Add the ${i.label.toLowerCase()}'s ${i.descLabel.toLowerCase()}.`)
    }
    if (!price.replace(/[^0-9.]/g, '')) return setError('Add the total agreed price.')
    if (!sellerName.trim()) return setError("Add the seller's name.")
    if (!buyerName.trim()) return setError('Add your full name.')
    if (!/^\S+@\S+\.\S+$/.test(buyerEmail.trim())) return setError('Add a valid email address.')

    setSending(true)
    try {
      const items: Record<string, Record<string, string>> = {}
      for (const i of chosen) items[i.key] = { description: desc[i.key], [i.idKey]: ids[i.key] }

      const start = await fetch('/api/express/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, price, sellerName, buyerName, buyerEmail, website }),
      })
      const s = await start.json()
      if (!start.ok || !s.token) throw new Error(s.error || 'Could not start your deal.')

      const pay = await fetch('/api/express/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: s.token, action: 'pay' }),
      })
      const p = await pay.json()
      if (pay.ok && p.url) {
        window.location.href = p.url
        return
      }
      // Deal exists but checkout didn't open: send them to their deal page,
      // which has its own "Finish payment" button.
      window.location.href = `/express/deal/${s.token}`
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.')
      setSending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 6vw, 36px)', lineHeight: 1.2, margin: 0 }}>
          What are you buying?
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted }}>
          Pick everything in this sale. The seller never has to create an account.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {ITEMS.map((i) => {
          const on = picked[i.key]
          return (
            <button
              key={i.key}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked({ ...picked, [i.key]: !on })}
              style={{
                minHeight: 76,
                borderRadius: 8,
                border: `2px solid ${on ? gold : 'rgba(245,241,232,0.3)'}`,
                background: on ? gold : 'transparent',
                color: on ? navy : cream,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700 }}>{i.label}</span>
              <span style={{ fontSize: 11, letterSpacing: 1 }}>{on ? 'ADDED' : 'TAP TO ADD'}</span>
            </button>
          )
        })}
      </div>

      {chosen.map((i) => (
        <div
          key={i.key}
          style={{
            background: card,
            border: `1px solid ${line}`,
            borderRadius: 8,
            padding: '18px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 2, color: gold, fontWeight: 700 }}>{i.label.toUpperCase()}</div>
          <Field
            id={`${i.key}-desc`}
            label={i.descLabel}
            placeholder={i.descPh}
            value={desc[i.key]}
            onChange={(v) => setDesc({ ...desc, [i.key]: v })}
          />
          <Field
            id={`${i.key}-id`}
            label={i.idLabel}
            hint={`${i.idHint} (you can add it later)`}
            placeholder={i.idPh}
            value={ids[i.key]}
            onChange={(v) => setIds({ ...ids, [i.key]: v.toUpperCase() })}
            mono
          />
        </div>
      ))}

      <Field
        id="price"
        label="Total agreed price"
        placeholder="$0"
        inputMode="decimal"
        value={price}
        onChange={setPrice}
      />
      <Field
        id="seller"
        label="Seller's name"
        hint="as it appears on the title"
        value={sellerName}
        onChange={setSellerName}
      />
      <Field
        id="buyer"
        label="Your full name"
        hint="for the paperwork"
        autoComplete="name"
        value={buyerName}
        onChange={setBuyerName}
      />
      <Field
        id="email"
        label="Your email"
        hint="we send your private link here"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={buyerEmail}
        onChange={setBuyerEmail}
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

      <div
        style={{
          background: card,
          border: `1px solid ${line}`,
          borderRadius: 8,
          padding: '18px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>BC Express</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: gold, fontWeight: 700 }}>$29.99</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>
          Covers this sale: {summary}. One price, no matter what&apos;s included. Florida purchases only for now.
        </div>
      </div>

      {error && (
        <p role="alert" style={{ margin: 0, color: gold, fontSize: 15 }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={sending}
        style={{
          background: gold,
          color: navy,
          fontWeight: 700,
          fontSize: 17,
          padding: '16px 20px',
          borderRadius: 6,
          border: 'none',
          cursor: sending ? 'default' : 'pointer',
          opacity: sending ? 0.6 : 1,
        }}
      >
        {sending ? 'Opening secure checkout...' : 'Continue to payment · $29.99'}
      </button>
    </div>
  )
}
