'use client'

// Live HIN check shown under the HIN box on the deal's Vessel step.
// Reuses the same decoder and Coast Guard lookups as the free /hin-check
// tool and BoatClosers Express, styled for the app's light form.

import { useEffect, useState } from 'react'
import { decodeHin, makeMatches } from '@/lib/hin'
import { useBuilder, builderName, titleCase, RecallsSection, VesselSection } from '@/components/HinBuilder'

const navy = '#08152e'
const green = '#2e7d4f'
const greenBg = '#e6f3ea'
const amber = '#8a5a00'
const amberBg = '#fff4dd'
const slate = '#3d5166'
const sans = 'sans-serif'

const line = { fontSize: 12, fontFamily: sans, lineHeight: 1.5, marginTop: 4 }

export default function HinInlineCheck({
  hin,
  year,
  make,
  onFillYear,
}: {
  hin: string
  year?: string
  make?: string
  onFillYear?: (y: string) => void
}) {
  // Wait for the typing to settle before checking.
  const [value, setValue] = useState(hin)
  useEffect(() => {
    const t = setTimeout(() => setValue(hin), 500)
    return () => clearTimeout(t)
  }, [hin])

  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [value])

  const clean = (value || '').toUpperCase().replace(/[\s-]/g, '')
  const typedYear = /^\d{4}$/.test(String(year || '')) ? Number(year) : undefined
  const result = clean.length >= 12 || /[^A-Z0-9]/.test(clean) ? decodeHin(value, typedYear) : null
  const { builder, loading, done } = useBuilder(result?.mic ?? null)

  if (!clean) return null

  if (!result) {
    if (clean.length < 4) return null
    return <div style={{ ...line, color: slate }}>Keep going: a HIN has 12 characters ({clean.length}/12).</div>
  }

  const yearMismatch = result.problems.some((p) => p.startsWith('The HIN says model year'))
  const otherProblems = result.problems.filter((p) => !p.startsWith('The HIN says model year'))
  const formatOk = result.status === 'valid' || result.status === 'older' || (yearMismatch && otherProblems.length === 0)
  const typedMake = (make || '').trim()
  const makeMismatch = !!(builder && typedMake && !makeMatches(typedMake, builder))
  const place = builder ? [builder.city ? titleCase(builder.city) : null, builder.state].filter(Boolean).join(', ') : ''

  return (
    <div style={{ marginTop: 6 }} aria-live="polite">
      {formatOk ? (
        <div style={{ ...line, color: green, background: greenBg, borderRadius: 6, padding: '6px 9px' }}>
          ✓ Valid HIN
          {result.modelYear ? ` · model year ${result.modelYear}` : ''}
          {result.productionMonth && result.productionYear ? ` · built ${result.productionMonth} ${result.productionYear}` : ''}
        </div>
      ) : (
        <div style={{ ...line, color: amber, background: amberBg, borderRadius: 6, padding: '6px 9px' }}>
          {otherProblems.map((p) => (
            <div key={p}>⚠ {p}</div>
          ))}
        </div>
      )}

      {formatOk && yearMismatch && (
        <div style={{ ...line, color: amber }}>
          ⚠ This HIN says model year {result.modelYear}, but the Year box says {typedYear}. Check the title.
        </div>
      )}

      {formatOk && !typedYear && result.modelYear && onFillYear && (
        <button
          type="button"
          onClick={() => onFillYear(String(result.modelYear))}
          style={{ ...line, background: 'none', border: 'none', padding: 0, color: navy, textDecoration: 'underline', cursor: 'pointer' }}
        >
          Fill in year {result.modelYear}
        </button>
      )}

      {formatOk && result.mic && (
        <div style={{ ...line, color: slate }}>
          {loading && 'Looking up the builder with the Coast Guard…'}
          {!loading && done && builder && (
            <>
              Built by <b style={{ color: navy }}>{builderName(builder)}</b>
              {place ? ` · ${place}` : ''}
              {builder.dba ? ` (also ${titleCase(builder.dba)})` : ''}
            </>
          )}
          {!loading && done && !builder && (
            <span style={{ color: amber }}>
              ⚠ No builder is registered with the Coast Guard under code {result.mic}. Compare the HIN with the hull and the title.
            </span>
          )}
        </div>
      )}

      {makeMismatch && builder && (
        <div style={{ ...line, color: amber }}>
          ⚠ The make says &quot;{typedMake}&quot;, but this HIN&apos;s builder code belongs to {builderName(builder)}. Some brands
          are built under a parent company&apos;s name, so confirm before you continue.
        </div>
      )}

      {result.notes.map((n) => (
        <div key={n} style={{ ...line, color: slate }}>
          {n}
        </div>
      ))}

      {formatOk && result.mic && (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{ ...line, marginTop: 6, background: 'none', border: 'none', padding: 0, color: navy, fontWeight: 700, cursor: 'pointer' }}
          >
            {open ? 'Hide recalls & Coast Guard records ▴' : 'Check recalls & Coast Guard records ▾'}
          </button>
          {open && (
            <div
              style={{
                marginTop: 8,
                background: '#0f1b2d',
                color: '#f5f1e8',
                borderRadius: 8,
                padding: '14px 16px',
                fontSize: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <RecallsSection mic={result.mic} builderLabel={builder ? builderName(builder) : undefined} />
              <VesselSection hin={result.hin} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
