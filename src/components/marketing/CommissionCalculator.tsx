'use client'

import { useEffect, useRef, useState } from 'react'

// Broker commission vs BoatClosers, shown honestly:
// - "potential difference", never "you saved" (nothing is saved until the boat sells)
// - Escrow.com's fee is counted on the BoatClosers side when the seller uses it
// - survey, haul-out, registration and tax are paid either way, so they don't
//   change the difference, and the page says so.

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

// The BoatClosers flat fee. Keep in step with the price in the app.
const BOATCLOSERS_FEE = 249

const PRESETS = [50000, 150000, 500000]

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '')

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '14px 16px',
  fontSize: 20,
  borderRadius: 4,
  border: '1px solid rgba(201,150,46,0.6)',
  background: 'rgba(245,241,232,0.06)',
  color: cream,
}
const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, opacity: 0.9 }

export default function CommissionCalculator({ defaultPrice = 500000 }: { defaultPrice?: number }) {
  const [price, setPrice] = useState(String(defaultPrice))
  const [rate, setRate] = useState('10')
  const [escrow, setEscrow] = useState('')
  const tracked = useRef(false)

  const p = Number(digitsOnly(price)) || 0
  const r = Math.min(Math.max(Number(rate) || 0, 0), 30)
  const e = Number(digitsOnly(escrow)) || 0

  const commission = Math.round((p * r) / 100)
  const ours = BOATCLOSERS_FEE + e
  const diff = commission - ours

  // One analytics event per visit, the first time someone changes a number.
  const touched = useRef(false)
  useEffect(() => {
    if (!touched.current) {
      touched.current = true
      return
    }
    if (tracked.current) return
    tracked.current = true
    try {
      window.gtag?.('event', 'commission_calculator_used')
    } catch {}
  }, [price, rate, escrow])

  return (
    <div
      style={{
        border: `1px solid ${gold}`,
        borderRadius: 6,
        padding: '28px 28px 24px',
        background: 'rgba(201,150,46,0.07)',
      }}
    >
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label htmlFor="cc-price" style={labelStyle}>
            Boat sale price
          </label>
          <input
            id="cc-price"
            inputMode="numeric"
            value={p ? p.toLocaleString('en-US') : ''}
            onChange={(ev) => setPrice(digitsOnly(ev.target.value).slice(0, 9))}
            placeholder="500,000"
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setPrice(String(v))}
                style={{
                  background: p === v ? gold : 'transparent',
                  color: p === v ? navy : cream,
                  border: `1px solid ${gold}`,
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {money(v)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="cc-rate" style={labelStyle}>
            Broker commission (%)
          </label>
          <input
            id="cc-rate"
            inputMode="decimal"
            value={rate}
            onChange={(ev) => setRate(ev.target.value.replace(/[^0-9.]/g, '').slice(0, 5))}
            style={inputStyle}
          />
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 10 }}>Commonly around 10%. Change it to match your quote.</div>
        </div>
        <div>
          <label htmlFor="cc-escrow" style={labelStyle}>
            Escrow fee, if you use one ($)
          </label>
          <input
            id="cc-escrow"
            inputMode="numeric"
            value={e ? e.toLocaleString('en-US') : ''}
            onChange={(ev) => setEscrow(digitsOnly(ev.target.value).slice(0, 7))}
            placeholder="0"
            style={inputStyle}
          />
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 10 }}>
            Escrow.com sets its own fee. Check{' '}
            <a href="https://www.escrow.com/" target="_blank" rel="noopener noreferrer" style={{ color: gold }}>
              escrow.com
            </a>{' '}
            for the current rate.
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        <div style={{ padding: 18, borderRadius: 4, background: 'rgba(245,241,232,0.05)' }}>
          <div style={{ fontSize: 13, opacity: 0.75 }}>Broker commission at {r}%</div>
          <div style={{ fontSize: 28, fontFamily: 'Georgia, serif', marginTop: 4 }}>{money(commission)}</div>
        </div>
        <div style={{ padding: 18, borderRadius: 4, background: 'rgba(245,241,232,0.05)' }}>
          <div style={{ fontSize: 13, opacity: 0.75 }}>BoatClosers{e ? ' + escrow fee' : ''}</div>
          <div style={{ fontSize: 28, fontFamily: 'Georgia, serif', marginTop: 4 }}>{money(ours)}</div>
        </div>
        <div style={{ padding: 18, borderRadius: 4, background: gold, color: navy }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Potential difference</div>
          <div style={{ fontSize: 28, fontFamily: 'Georgia, serif', fontWeight: 700, marginTop: 4 }}>
            {money(Math.max(diff, 0))}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.75, margin: '20px 0 0' }}>
        Survey, haul-out, sea trial, registration and sales tax are paid with or without a broker, so they don&apos;t
        change this number. A broker also markets the boat and finds the buyer. If you&apos;ve already found one, this is
        roughly what that service would cost you. An estimate, not a quote.
      </p>
    </div>
  )
}
