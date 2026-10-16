'use client'

import { useState } from 'react'

// Guided lien check for a private boat purchase. No single database covers
// every lien, so this walks the buyer through each place a lien can be:
// the title, the state, the Coast Guard (documented boats), the UCC registry,
// and unrecorded liens (marina, storage, repair) that only paperwork covers.

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'
const muted = '#bdb6a8'
const line = 'rgba(201,150,46,0.35)'

type TitleType = 'florida' | 'documented' | 'other' | 'unsure'

const TITLE_OPTIONS: { key: TitleType; label: string }[] = [
  { key: 'florida', label: 'Florida title' },
  { key: 'documented', label: 'Coast Guard documented' },
  { key: 'other', label: 'Another state' },
  { key: 'unsure', label: 'Not sure' },
]

const link = { color: gold }

function ext(href: string, label: string) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={link}>
      {label}
    </a>
  )
}

export default function LienCheck({
  sellerName,
  inExpress = false,
  saved,
  onToggle,
}: {
  sellerName?: string
  inExpress?: boolean
  // Optional saved progress (keys are prefixed "l-") and a save callback.
  saved?: Record<string, boolean>
  onToggle?: (id: string, value: boolean) => void
}) {
  const [title, setTitle] = useState<TitleType>('unsure')
  const [localDone, setLocalDone] = useState<Record<string, boolean>>({})
  const done: Record<string, boolean> = saved
    ? Object.fromEntries(Object.entries(saved).filter(([k]) => k.startsWith('l-')).map(([k, v]) => [k.slice(2), v]))
    : localDone
  const setDone = (next: Record<string, boolean>) => {
    if (onToggle) {
      for (const [k, v] of Object.entries(next)) if (!!done[k] !== v) onToggle(`l-${k}`, v)
    } else setLocalDone(next)
  }

  const steps: { id: string; title: string; body: React.ReactNode }[] = [
    {
      id: 'face',
      title: 'Read the front of the title',
      body: (
        <>
          If it names a lienholder, stop. The seller needs a lien release (satisfaction) from that lender before you pay,
          or you pay the lender directly at closing so the release comes to you.
        </>
      ),
    },
  ]

  if (title === 'florida' || title === 'unsure') {
    steps.push({
      id: 'state',
      title: 'Confirm with the State of Florida',
      body: (
        <>
          Enter the title number in FLHSMV&apos;s free {ext('https://services.flhsmv.gov/MVCheckWeb/', 'title check')}. If the
          boat doesn&apos;t come up, any county tax collector&apos;s office can confirm whether a lien is recorded on that title
          number.
        </>
      ),
    })
  }

  if (title === 'documented' || title === 'unsure') {
    steps.push({
      id: 'abstract',
      title: 'Order the Coast Guard abstract of title',
      body: (
        <>
          Documented boats carry mortgages and claims of lien on their federal record. Request the abstract of title from the
          Coast Guard&apos;s {ext('https://www.dco.uscg.mil/nvdc/', 'Vessel Documentation Center')} using{' '}
          {ext(
            'https://www.dco.uscg.mil/Portals/9/DCO%20Documents/NVDC/CG-7043_Abstract_of_Title_or_Certified_Copy_of_COD_Request_Form.pdf',
            'form CG-7043'
          )}{' '}
          (small Coast Guard fee). Any open mortgage must be paid off and a satisfaction filed.
        </>
      ),
    })
  }

  if (title === 'other') {
    steps.push({
      id: 'otherstate',
      title: "Confirm with the other state's titling agency",
      body: (
        <>
          Call the agency that issued the title and ask whether a lien is recorded. You&apos;ll surrender that title when you
          title the boat in Florida, so it must be clean.
        </>
      ),
    })
  }

  steps.push({
    id: 'ucc',
    title: 'Search the Florida UCC registry',
    body: (
      <>
        Some lenders, especially on business-owned boats, file against the owner instead of the title. Search the free{' '}
        {ext('https://www.floridaucc.com/', 'Florida Secured Transaction Registry')} by the owner&apos;s exact legal name
        {sellerName ? (
          <>
            : <b style={{ color: cream }}>{sellerName}</b>
          </>
        ) : null}
        . Spelling must be exact, so try it the way it appears on the title.
      </>
    ),
  })

  steps.push({
    id: 'loan',
    title: 'Ask about any loan, and get a payoff letter',
    body: (
      <>
        If the seller still owes money on the boat, get a written payoff letter from the lender and pay the lender directly
        at closing. Never pay the seller and trust them to pay off the loan.
      </>
    ),
  })

  steps.push({
    id: 'unrecorded',
    title: 'Cover the liens no database shows',
    body: (
      <>
        Marina, storage, and repair bills can become liens without being filed anywhere. Ask where the boat has been kept
        and serviced, and whether anything is owed.{' '}
        {inExpress
          ? 'Your BC Express bill of sale includes the seller’s statement that the boat, trailer, and motor are free of all liens.'
          : 'Make sure your bill of sale has the seller state in writing that the boat, trailer, and motor are free of all liens.'}
      </>
    ),
  })

  const count = steps.filter((s) => done[s.id]).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: gold, fontWeight: 700 }}>LIEN CHECK · FREE</div>
        <div style={{ fontSize: 13, color: muted }}>
          {count} of {steps.length} done
        </div>
      </div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: cream, lineHeight: 1.3 }}>
        Make sure nobody else has a claim on this boat
      </div>
      <p style={{ margin: 0, color: muted, fontSize: 15, lineHeight: 1.6 }}>
        No single database shows every lien, so check each place one can live. How is the boat titled?
      </p>

      <div role="radiogroup" aria-label="How is the boat titled?" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TITLE_OPTIONS.map((o) => {
          const on = title === o.key
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setTitle(o.key)}
              style={{
                padding: '10px 14px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${on ? gold : 'rgba(245,241,232,0.3)'}`,
                background: on ? gold : 'transparent',
                color: on ? navy : cream,
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>

      <div>
        {steps.map((s, i) => (
          <label
            key={s.id}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '12px 0',
              borderTop: i ? `1px solid ${line}` : 'none',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={!!done[s.id]}
              onChange={(e) => setDone({ ...done, [s.id]: e.target.checked })}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: gold, flexShrink: 0 }}
            />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: cream, opacity: done[s.id] ? 0.6 : 1 }}>{s.title}</span>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{s.body}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
