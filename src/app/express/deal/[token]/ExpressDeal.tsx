'use client'

import { useEffect, useRef, useState } from 'react'
import { decodeHin } from '@/lib/hin'
import LienCheck from '@/components/LienCheck'
import { useBuilder, BuilderDetails, builderName, RecallsSection, VesselSection } from '@/components/HinBuilder'
import { SELLER_QUESTIONS, PAYMENT_TIPS, type ItemKey, type InspectItem, type InspectionProgress, type InspectionPreview } from '@/lib/express/content'
import { navy, gold, cream, muted, line, boxStyle, eyebrow, money, forItems, HandoffStep, AfterStep, SellerQuestions, FullSuggest, InspectionLocked, InspectionStep, ContactPrefs } from './parts'

const ID_LABEL: Record<string, [string, string]> = {
  boat: ['hin', 'HIN'],
  trailer: ['vin', 'VIN'],
  motor: ['serial', 'Serial'],
}

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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | null>(null)
  const [inspList, setInspList] = useState<InspectItem[] | null>(null)
  const [inspPreview, setInspPreview] = useState<InspectionPreview | null>(null)
  const [contact, setContact] = useState<any>(null)
  const pendingInsp = useRef<any>({})
  const inspTimer = useRef<any>(null)
  const [saveError, setSaveError] = useState(false)
  const pending = useRef<Record<string, boolean>>({})
  const timer = useRef<any>(null)
  const pendingAnswers = useRef<Record<string, string>>({})
  const answerTimer = useRef<any>(null)

  useEffect(() => {
    const back = new URLSearchParams(window.location.search).get('paid') === '1'
    setJustPaid(back)
    let tries = 0
    async function load() {
      try {
        const res = await fetch(`/api/express/deal?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Link not valid.')
        setDeal(d.deal)
        setInspList(d.inspection?.list || null)
        setInspPreview(d.inspection?.preview || null)
        setContact(d.contact || null)
        const p = d.deal.progress || {}
        setStep((s) => s ?? (d.deal.status === 'paid' ? (p.handoff?.saleDate ? 4 : Object.keys(p.inspection?.items || {}).length ? 3 : 2) : 1))
        // Coming back from Stripe: payment can take a moment to show as paid.
        if (d.deal.status === 'unpaid' && back && tries < 4) {
          tries++
          setTimeout(load, 2000)
        } else if (d.deal.status === 'paid' && back) setStep(2)
      } catch (e: any) {
        setError(e?.message || 'Could not load your purchase.')
      }
    }
    load()
  }, [token])

  // Checklist ticks save in small batches so tapping quickly doesn't flood the server.
  function toggle(id: string, v: boolean) {
    setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), checks: { ...(d.progress?.checks || {}), [id]: v } } }))
    pending.current[id] = v
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const checks = pending.current
      pending.current = {}
      try {
        const res = await fetch('/api/express/deal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'checks', checks }),
        })
        setSaveError(!res.ok)
      } catch {
        setSaveError(true)
      }
    }, 600)
  }

  // Inspection marks and notes save a moment after the buyer stops tapping or typing.
  function inspect(patch: { items?: InspectionProgress['items']; hours?: string; notes?: string }) {
    setDeal((d: any) => {
      const cur: InspectionProgress = d.progress?.inspection || { items: {} }
      const next = { ...cur, ...patch, items: { ...(cur.items || {}), ...(patch.items || {}) } }
      return { ...d, progress: { ...(d.progress || {}), inspection: next } }
    })
    const q = pendingInsp.current
    pendingInsp.current = { ...q, ...patch, items: { ...(q.items || {}), ...(patch.items || {}) } }
    clearTimeout(inspTimer.current)
    inspTimer.current = setTimeout(async () => {
      const inspection = pendingInsp.current
      pendingInsp.current = {}
      try {
        const res = await fetch('/api/express/deal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'inspection', inspection }),
        })
        setSaveError(!res.ok)
      } catch {
        setSaveError(true)
      }
    }, 800)
  }

  // Seller's answers save a moment after the buyer stops typing.
  function answer(id: string, text: string) {
    setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), answers: { ...(d.progress?.answers || {}), [id]: text } } }))
    pendingAnswers.current[id] = text
    clearTimeout(answerTimer.current)
    answerTimer.current = setTimeout(async () => {
      const answers = pendingAnswers.current
      pendingAnswers.current = {}
      try {
        const res = await fetch('/api/express/deal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'answers', answers }),
        })
        setSaveError(!res.ok)
      } catch {
        setSaveError(true)
      }
    }, 900)
  }

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
          Check that you opened the full link from your BoatClosers Express email. If it still won&apos;t open, email
          support@boatclosers.com.
        </p>
      </div>
    )
  }

  if (!deal || !step) return <p style={{ color: muted }}>Loading your purchase...</p>

  const paid = deal.status === 'paid'
  const items = Object.entries(deal.items || {}) as [string, any][]
  const firstName = String(deal.buyer_name).split(' ')[0]
  const has: Record<ItemKey, boolean> = { boat: !!deal.items?.boat, trailer: !!deal.items?.trailer, motor: !!deal.items?.motor }
  const checks: Record<string, boolean> = deal.progress?.checks || {}

  const steps = [
    { n: 1 as const, title: 'Check it out', note: 'HIN check, lien check, seller questions, is Express right?', tag: 'FREE' },
    { n: 2 as const, title: 'Inspect it', note: 'Guided inspection and condition report', tag: paid ? 'UNLOCKED' : '$29.99' },
    { n: 3 as const, title: 'At the handoff', note: 'Bill of sale, state forms, title signing guide, seller’s copy', tag: paid ? 'UNLOCKED' : 'INCLUDED' },
    { n: 4 as const, title: "After it's yours", note: 'Title application, what to bring, deadline reminders', tag: paid ? 'UNLOCKED' : 'INCLUDED' },
  ]

  const paywall = (
    <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>Serious about this one?</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: gold, fontWeight: 700 }}>$29.99</span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 20, color: cream, fontSize: 15, lineHeight: 1.7 }}>
        <li>
          <b>Guided {inspPreview ? `${inspPreview.count}-point ` : ''}inspection</b> on your phone, with a condition report to negotiate with
        </li>
        {has.boat && <li>Florida vessel bill of sale that doubles as your 30-day temporary registration</li>}
        {has.trailer && <li>Trailer bill of sale</li>}
        {has.motor && !has.boat && <li>Outboard motor bill of sale</li>}
        {(has.boat || has.trailer) && <li>Florida’s official form HSMV 82050, filled in, with the seller’s notice of sale</li>}
        <li>Payment receipt, signed by the seller</li>
        <li>Title signing guide built for how your boat is titled</li>
        {has.boat && <li>Florida title application (HSMV 82040 VS), pre-filled</li>}
        <li>What to bring to the tax collector, and email reminders before your 30-day deadline</li>
        <li>Handoff photos and one closing packet with every paper, ready to print</li>
        <li>The seller’s copy, emailed with their notice-of-sale reminder</li>
      </ul>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>One price for everything in this sale. View or download every paper any time.</p>
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
        {paying ? 'Opening secure checkout...' : 'Unlock inspection and paperwork · $29.99'}
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ color: gold, fontWeight: 700, fontSize: 14 }}>{paid ? 'Paperwork unlocked' : 'Free to start'}</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 6vw, 34px)', lineHeight: 1.2, margin: 0 }}>
          {paid ? `You're all set, ${firstName}` : `Welcome aboard, ${firstName}`}
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted }}>
          {paid && justPaid
            ? 'Payment received. Fill in the sale details below and your papers are ready.'
            : 'Your progress saves as you go. Your private link brings you back from any device.'}
        </p>
      </div>

      <nav aria-label="Purchase steps" style={{ ...boxStyle, gap: 0, padding: '6px 10px' }}>
        {steps.map((s, i) => {
          const on = step === s.n
          return (
            <button
              key={s.n}
              type="button"
              aria-current={on ? 'step' : undefined}
              onClick={() => setStep(s.n)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 8px',
                background: on ? 'rgba(201,150,46,0.12)' : 'transparent',
                border: 'none',
                borderTop: i ? '1px solid rgba(245,241,232,0.08)' : 'none',
                borderRadius: 6,
                color: cream,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  border: `2px solid ${on ? gold : 'rgba(245,241,232,0.3)'}`,
                  background: on ? gold : 'transparent',
                  color: on ? navy : cream,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{s.title}</span>
                <span style={{ fontSize: 13, color: muted, lineHeight: 1.4 }}>{s.note}</span>
              </span>
              <span style={{ fontSize: 11, letterSpacing: 1, fontWeight: 700, color: s.tag === '$29.99' ? gold : muted }}>{s.tag}</span>
            </button>
          )
        })}
      </nav>

      {saveError && (
        <p role="alert" style={{ margin: 0, color: gold, fontSize: 14 }}>
          Your last change didn&apos;t save. Check your connection; it will save with your next one.
        </p>
      )}

      {step === 1 && (
        <>
          {has.boat && <HinCard token={token} boat={deal.items.boat} onSaved={(items) => setDeal({ ...deal, items })} />}
          <div style={boxStyle}>
            <LienCheck sellerName={deal.seller_name} inExpress saved={checks} onToggle={toggle} />
          </div>
          <SellerQuestions
            token={token}
            onSent={(progress) => setDeal((d: any) => ({ ...d, progress }))}
            deal={deal}
            items={forItems(SELLER_QUESTIONS, has)}
            checks={checks}
            answers={deal.progress?.answers || {}}
            onToggle={toggle}
            onAnswer={answer}
          />
          <FullSuggest deal={deal} checks={checks} onToggle={toggle} />
          {!paid && <InspectionLocked preview={inspPreview} />}
          <div style={boxStyle}>
            <div style={eyebrow}>PAYING SAFELY</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: cream, margin: 0 }}>How not to get scammed</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: cream, fontSize: 15, lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PAYMENT_TIPS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          {paid ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{ background: gold, color: navy, fontWeight: 700, fontSize: 16, padding: '14px 20px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
            >
              Start the inspection
            </button>
          ) : (
            paywall
          )}
        </>
      )}

      {step === 2 &&
        (paid && inspList ? (
          <InspectionStep
            token={token}
            list={inspList}
            inspection={deal.progress?.inspection || { items: {} }}
            onChange={inspect}
            photos={deal.progress?.photos || []}
            has={has}
            onPhotos={(progress) => setDeal((d: any) => ({ ...d, progress: { ...(d.progress || {}), photos: progress.photos } }))}
            onNext={() => {
              setStep(3)
              window.scrollTo(0, 0)
            }}
          />
        ) : (
          <>
            <InspectionLocked preview={inspPreview} />
            {paywall}
          </>
        ))}

      {step === 3 &&
        (paid ? (
          <HandoffStep
            token={token}
            deal={deal}
            has={has}
            checks={checks}
            onToggle={toggle}
            onSaved={(progress) => setDeal({ ...deal, progress })}
          />
        ) : (
          paywall
        ))}

      {step === 4 && (paid ? <AfterStep token={token} deal={deal} has={has} checks={checks} onToggle={toggle} /> : paywall)}

      {contact && <ContactPrefs token={token} contact={contact} onSaved={setContact} />}

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
