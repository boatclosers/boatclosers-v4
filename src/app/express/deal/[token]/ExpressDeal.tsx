'use client'

import { useEffect, useState } from 'react'
import { decodeHin } from '@/lib/hin'
import LienCheck from '@/components/LienCheck'
import { useBuilder, BuilderDetails, builderName, RecallsSection, VesselSection } from '@/components/HinBuilder'

const navy = '#0f1b2d'
const card = '#18283f'
const gold = '#c9962e'
const cream = '#f5f1e8'
const muted = '#bdb6a8'
const line = 'rgba(201,150,46,0.35)'

const ID_LABEL: Record<string, [string, string]> = {
  boat: ['hin', 'HIN'],
  trailer: ['vin', 'VIN'],
  motor: ['serial', 'Serial'],
}

function money(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const boxStyle = {
  background: card,
  border: `1px solid ${line}`,
  borderRadius: 8,
  padding: '18px 18px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
}

const eyebrow = { fontSize: 11, letterSpacing: 2, color: gold, fontWeight: 700 }

// Step 1 tool: decode the boat's HIN and compare it with the year the buyer entered.
function HinCard({ token, boat, onSaved }: { token: string; boat: any; onSaved: (items: any) => void }) {
  const [hin, setHin] = useState<string>(boat.hin || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const yearMatch = /\b(19|20)\d{2}\b/.exec(boat.description || '')
  const expectedYear = yearMatch ? Number(yearMatch[0]) : undefined
  const saved = boat.hin || ''
  const r = saved ? decodeHin(saved, expectedYear) : null
  const { builder, loading, done } = useBuilder(r?.mic ?? null)

  async function save() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/express/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'ids', ids: { boat: hin } }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not save.')
      onSaved(d.items)
    } catch (e: any) {
      setMsg(e?.message || 'Could not save.')
    }
    setSaving(false)
  }

  const headline = !r
    ? 'Add the HIN to check it'
    : r.status === 'valid' && builder
      ? `${r.modelYear} ${builderName(builder)}`
      : r.status === 'valid'
      ? 'The HIN format checks out'
      : r.status === 'older'
        ? 'Older HIN format'
        : 'Something looks off'

  return (
    <div style={boxStyle}>
      <div style={eyebrow}>HIN CHECK · FREE</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: r && r.status !== 'valid' ? gold : cream }}>
        {headline}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <label htmlFor="express-hin" style={{ position: 'absolute', left: -9999 }}>
          Boat HIN
        </label>
        <input
          id="express-hin"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="12 characters, on the transom"
          value={hin}
          onChange={(e) => setHin(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
          }}
          style={{
            flex: '1 1 200px',
            padding: '12px 14px',
            fontSize: 16,
            borderRadius: 6,
            border: `1px solid ${line}`,
            background: cream,
            color: navy,
            fontFamily: 'ui-monospace, Menlo, monospace',
            letterSpacing: 1,
          }}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || hin === saved}
          style={{
            background: gold,
            color: navy,
            fontWeight: 700,
            fontSize: 15,
            padding: '12px 20px',
            borderRadius: 6,
            border: 'none',
            cursor: saving || hin === saved ? 'default' : 'pointer',
            opacity: saving || hin === saved ? 0.6 : 1,
          }}
        >
          {saving ? 'Checking...' : 'Check HIN'}
        </button>
      </div>
      {msg && <p style={{ margin: 0, color: gold, fontSize: 14 }}>{msg}</p>}

      {r && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, lineHeight: 1.5 }}>
          {r.problems.map((p) => (
            <div key={p} style={{ color: gold }}>
              ✕ {p}
            </div>
          ))}
          {r.mic && (
            <BuilderDetails
              mic={r.mic}
              builder={builder}
              loading={loading}
              done={done}
              typedMake={boat.description}
            />
          )}

          {r.mic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, margin: '14px 0' }}>
              <RecallsSection mic={r.mic} builderLabel={builder ? builderName(builder) : undefined} />
              <VesselSection hin={r.hin} />
            </div>
          )}
          {r.productionMonth && (
            <div>
              Built {r.productionMonth}
              {r.productionYear ? ` ${r.productionYear}` : ''} · Model year {r.modelYear}
            </div>
          )}
          {r.status === 'valid' && expectedYear && <div>✓ Model year matches the {expectedYear} you entered</div>}
          {r.notes.map((n) => (
            <div key={n} style={{ color: muted }}>
              {n}
            </div>
          ))}
          <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
            Next: when you see the boat, make sure the HIN on the transom matches this one and the title exactly. A
            valid format does not rule out liens, theft, or damage.
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExpressDeal({ token }: { token: string }) {
  const [deal, setDeal] = useState<any>(null)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [justPaid, setJustPaid] = useState(false)

  useEffect(() => {
    setJustPaid(new URLSearchParams(window.location.search).get('paid') === '1')
    let tries = 0
    async function load() {
      try {
        const res = await fetch(`/api/express/deal?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Link not valid.')
        setDeal(d.deal)
        // Coming back from Stripe: payment can take a moment to show as paid.
        if (d.deal.status === 'unpaid' && new URLSearchParams(window.location.search).get('paid') === '1' && tries < 4) {
          tries++
          setTimeout(load, 2000)
        }
      } catch (e: any) {
        setError(e?.message || 'Could not load your purchase.')
      }
    }
    load()
  }, [token])

  async function handlePay() {
    setPaying(true)
    try {
      const res = await fetch('/api/express/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'pay' }),
      })
      const d = await res.json()
      if (d.alreadyPaid) return window.location.reload()
      if (!res.ok || !d.url) throw new Error(d.error || 'Could not open checkout.')
      window.location.href = d.url
    } catch (e: any) {
      setError(e?.message || 'Could not open checkout.')
      setPaying(false)
    }
  }

  if (error && !deal) {
    return (
      <div style={boxStyle}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, margin: 0 }}>This link isn&apos;t working</h1>
        <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
          Check that you opened the full link from your BC Express email. If it still won&apos;t open, email
          support@boatclosers.com.
        </p>
      </div>
    )
  }

  if (!deal) return <p style={{ color: muted }}>Loading your purchase...</p>

  const paid = deal.status === 'paid'
  const items = Object.entries(deal.items || {}) as [string, any][]
  const firstName = String(deal.buyer_name).split(' ')[0]

  const steps = [
    { title: 'Before you pay', note: 'HIN check, walk-around checklist, seller questions', tag: 'FREE', open: true },
    { title: 'At the handoff', note: 'Bill of sale, title signing guide, red-flag checks', tag: paid ? 'UNLOCKED' : '$29.99', open: paid },
    { title: "After it's yours", note: 'Title application, what to bring, document vault', tag: paid ? 'UNLOCKED' : 'INCLUDED', open: paid },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ color: gold, fontWeight: 700, fontSize: 14 }}>
          {paid ? 'Paperwork unlocked' : 'Free to start'}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 6vw, 34px)', lineHeight: 1.2, margin: 0 }}>
          {paid ? `You're all set, ${firstName}` : `Welcome aboard, ${firstName}`}
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted }}>
          {paid && justPaid
            ? 'Payment received. Your paperwork steps are unlocked.'
            : 'We emailed you a private link, so you can come back to this purchase from any device.'}
        </p>
      </div>

      <div style={boxStyle}>
        <div style={eyebrow}>YOUR STEPS</div>
        {steps.map((s, i) => (
          <div
            key={s.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: i < steps.length - 1 ? '1px solid rgba(245,241,232,0.08)' : 'none',
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                border: `2px solid ${s.open ? gold : 'rgba(245,241,232,0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, opacity: s.open ? 1 : 0.7 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{s.title}</span>
              <span style={{ fontSize: 13, color: muted, lineHeight: 1.4 }}>{s.note}</span>
            </div>
            <span style={{ fontSize: 11, letterSpacing: 1, fontWeight: 700, color: s.open ? gold : muted }}>{s.tag}</span>
          </div>
        ))}
        <p style={{ margin: '4px 0 0', fontSize: 14, color: muted, lineHeight: 1.6 }}>
          Your HIN check and lien check are ready below. The walk-around checklist and seller questions are coming next.
        </p>
      </div>

      {deal.items?.boat && (
        <HinCard
          token={token}
          boat={deal.items.boat}
          onSaved={(items) => setDeal({ ...deal, items })}
        />
      )}

      <div style={boxStyle}>
        <LienCheck sellerName={deal.seller_name} inExpress />
      </div>

      {!paid && (
        <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>Ready for the paperwork?</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: gold, fontWeight: 700 }}>$29.99</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>
            Unlock steps 2 and 3 when you&apos;ve checked the boat and you&apos;re ready to buy. One price for
            everything in this sale.
          </p>
          {error && (
            <p role="alert" style={{ margin: 0, color: gold }}>
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handlePay}
            disabled={paying}
            style={{
              background: gold,
              color: navy,
              fontWeight: 700,
              fontSize: 16,
              padding: '14px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: paying ? 'default' : 'pointer',
              opacity: paying ? 0.6 : 1,
            }}
          >
            {paying ? 'Opening secure checkout...' : 'Unlock paperwork · $29.99'}
          </button>
        </div>
      )}

      <div style={boxStyle}>
        <div style={eyebrow}>YOUR PURCHASE</div>
        {items.map(([key, item]) => {
          const [idKey, idLabel] = ID_LABEL[key] || ['', '']
          return (
            <div
              key={key}
              style={{ padding: '8px 0', borderBottom: '1px solid rgba(245,241,232,0.08)', display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <span style={{ fontSize: 12, color: muted, letterSpacing: 1 }}>{key.toUpperCase()}</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{item.description}</span>
              <span style={{ fontSize: 14, color: muted, fontFamily: 'ui-monospace, Menlo, monospace' }}>
                {idLabel}: {item[idKey] || 'add later'}
              </span>
            </div>
          )
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, paddingTop: 4 }}>
          <span style={{ color: muted }}>Agreed price</span>
          <span style={{ fontWeight: 700 }}>{money(deal.price_cents)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
          <span style={{ color: muted }}>Seller</span>
          <span style={{ fontWeight: 600 }}>{deal.seller_name}</span>
        </div>
      </div>
    </div>
  )
}
