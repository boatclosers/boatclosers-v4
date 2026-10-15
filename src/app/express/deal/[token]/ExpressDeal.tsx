'use client'

import { useEffect, useState } from 'react'

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

const STAGES = ['Before you pay', 'At the handoff', "After it's yours"]

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ color: gold, fontWeight: 700, fontSize: 14 }}>{paid ? 'Paid · You’re all set' : 'Almost there'}</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 6vw, 34px)', lineHeight: 1.2, margin: 0 }}>
          {paid
            ? `Welcome aboard, ${String(deal.buyer_name).split(' ')[0]}`
            : 'Finish checkout to unlock your toolkit'}
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted }}>
          {paid
            ? justPaid
              ? 'Payment received. We also emailed you a private link, so you can come back to this purchase from any device.'
              : 'Use the link in your email to come back here any time, from any device.'
            : 'Your purchase is saved. Pay the one-time $29.99 fee to unlock your checklists and paperwork.'}
        </p>
      </div>

      {!paid && (
        <>
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
              fontSize: 17,
              padding: '16px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: paying ? 'default' : 'pointer',
              opacity: paying ? 0.6 : 1,
            }}
          >
            {paying ? 'Opening secure checkout...' : 'Finish payment · $29.99'}
          </button>
        </>
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

      <div style={boxStyle}>
        <div style={eyebrow}>YOUR STEPS</div>
        {STAGES.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 40 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                border: `2px solid ${paid && i === 0 ? gold : 'rgba(245,241,232,0.3)'}`,
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
            <span style={{ fontSize: 16, opacity: paid && i === 0 ? 1 : 0.6 }}>{s}</span>
          </div>
        ))}
        {paid && (
          <p style={{ margin: '4px 0 0', fontSize: 14, color: muted, lineHeight: 1.6 }}>
            Step 1 opens here next. We&apos;ll email you the moment it&apos;s ready.
          </p>
        )}
      </div>
    </div>
  )
}
