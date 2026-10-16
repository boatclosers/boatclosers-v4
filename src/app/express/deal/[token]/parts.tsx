'use client'

import { useState } from 'react'
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

// ---------- Step 2: at the handoff ----------

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
        body: JSON.stringify({ token, action: 'email-seller' }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not send.')
      onSaved(d.progress)
      setEmailMsg(`Sent to ${saved.sellerEmail}.`)
    } catch (e: any) {
      setEmailMsg(e?.message || 'Could not send.')
    }
    setEmailing(false)
  }

  const docs = [
    has.boat && ['vessel-bill-of-sale', 'Vessel bill of sale', 'Both of you sign. Keep it aboard: it’s your temporary registration for 30 days.'],
    has.motor && !has.boat && ['motor-bill-of-sale', 'Motor bill of sale', 'Both of you sign.'],
    has.trailer && ['trailer-bill-of-sale', 'Trailer bill of sale', 'Both of you sign. The trailer is titled separately.'],
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
          {docs.map(([key, name, note]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: `1px solid ${line}`, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: cream }}>{name}</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>{note}</div>
              </div>
              <a href={`/api/express/document?token=${token}&doc=${key}`} target="_blank" rel="noopener noreferrer" style={outlineButton}>
                Open PDF
              </a>
            </div>
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
            We email them their copies with a reminder to file a notice of sale, so the boat is out of their name. They
            don’t need an account.
          </p>
          {saved.sellerEmail ? (
            <button type="button" onClick={emailSeller} disabled={emailing || sentCount >= 3} style={{ ...goldButton, opacity: emailing || sentCount >= 3 ? 0.6 : 1 }}>
              {emailing ? 'Sending...' : sentCount ? `Email ${saved.sellerEmail} again` : `Email the seller at ${saved.sellerEmail}`}
            </button>
          ) : (
            <p style={{ margin: 0, color: cream, fontSize: 14 }}>Add the seller’s email in the sale details above to send their copy.</p>
          )}
          {emailMsg && <p style={{ margin: 0, color: gold, fontSize: 14 }}>{emailMsg}</p>}
          <a href={`sms:?&body=${smsBody}`} style={outlineButton}>
            Text the seller the notice-of-sale reminder
          </a>
        </div>
      )}
    </div>
  )
}

// ---------- Step 3: after it's yours ----------

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
        <h2 style={h2}>Fill in the sale details in step 2 first</h2>
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
        <a href={`/api/express/document?token=${token}&doc=title-worksheet`} target="_blank" rel="noopener noreferrer" style={goldButton}>
          Open my title worksheet
        </a>
        <p style={{ margin: 0, color: muted, fontSize: 13 }}>Every value to copy onto the title application, plus this list to check off.</p>
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
          ['payment-receipt', 'Payment receipt'],
          ['closing-summary', 'Closing summary'],
          ['title-worksheet', 'Title & registration worksheet'],
        ]
          .filter(Boolean)
          .map((d) => {
            const [key, name] = d as [string, string]
            return (
              <a
                key={key}
                href={`/api/express/document?token=${token}&doc=${key}&download=1`}
                style={{ color: cream, padding: '10px 0', borderTop: `1px solid ${line}`, display: 'flex', justifyContent: 'space-between', textDecoration: 'none' }}
              >
                <span>{name}</span>
                <span style={{ color: gold, fontWeight: 600 }}>Download</span>
              </a>
            )
          })}
        <p style={{ margin: 0, color: muted, fontSize: 13 }}>Keep these with your boat records. Your private link brings you back here from any device.</p>
      </div>
    </div>
  )
}
