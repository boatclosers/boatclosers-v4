'use client'

import { useState } from 'react'
import { decodeHin, type HinResult } from '@/lib/hin'
import LienCheck from '@/components/LienCheck'
import { useBuilder, BuilderDetails, builderName, RecallsSection, VesselSection } from '@/components/HinBuilder'

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'
const muted = '#bdb6a8'

const inputStyle = {
  padding: '14px 16px',
  fontSize: 17,
  borderRadius: 4,
  border: '1px solid rgba(201,150,46,0.5)',
  background: cream,
  color: navy,
  width: '100%',
  boxSizing: 'border-box' as const,
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '10px 0',
        borderBottom: '1px solid rgba(245,241,232,0.1)',
        fontSize: 16,
      }}
    >
      <span style={{ color: muted }}>{label}</span>
      <span style={{ textAlign: 'right', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

export default function HinChecker() {
  const [hin, setHin] = useState('')
  const [year, setYear] = useState('')
  const [result, setResult] = useState<HinResult | null>(null)
  const [listing, setListing] = useState('')
  const { builder, loading, done } = useBuilder(result?.mic ?? null)

  function handleCheck() {
    // The listing field takes "2015 Carolina Skiff" or just "2015".
    const m = /\b(19|20)\d{2}\b/.exec(year)
    setListing(year.trim())
    setResult(decodeHin(hin, m ? Number(m[0]) : undefined))
  }

  const headline =
    result?.status === 'valid' && builder
      ? `${result.modelYear} ${builderName(builder)}`
      : result?.status === 'valid'
      ? 'The format checks out'
      : result?.status === 'older'
        ? 'Older HIN format'
        : 'Something looks off'

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ flex: '2 1 260px' }}>
          <label
            htmlFor="hin"
            style={{ display: 'block', fontWeight: 700, fontSize: 15, marginBottom: 8 }}
          >
            Hull Identification Number (HIN)
          </label>
          <input
            id="hin"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="e.g. ABC12345D515"
            value={hin}
            onChange={(e) => setHin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCheck()
            }}
            style={{ ...inputStyle, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 1 }}
          />
        </div>
        <div style={{ flex: '1 1 220px' }}>
          <label
            htmlFor="year"
            style={{ display: 'block', fontWeight: 700, fontSize: 15, marginBottom: 8 }}
          >
            Year &amp; make on the listing <span style={{ fontWeight: 400, color: muted }}>(optional)</span>
          </label>
          <input
            id="year"
            type="text"
            placeholder="e.g. 2015 Boston Whaler"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCheck()
            }}
            style={inputStyle}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleCheck}
        style={{
          marginTop: 16,
          background: gold,
          color: navy,
          padding: '14px 36px',
          borderRadius: 4,
          border: 'none',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Check HIN
      </button>

      <div aria-live="polite">
        {result && (
          <div
            style={{
              marginTop: 28,
              border: `1px solid ${result.status === 'valid' ? gold : 'rgba(245,241,232,0.35)'}`,
              borderRadius: 6,
              padding: '24px 26px',
              background: 'rgba(201,150,46,0.06)',
            }}
          >
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, margin: '0 0 6px', color: gold }}>
              {headline}
            </h2>
            {result.mic && (
              <div
                style={{
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: 18,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                {result.countryCode ? `${result.countryCode}-` : ''}
                {result.hin}
              </div>
            )}

            {result.mic && (
              <div style={{ margin: '4px 0 14px' }}>
                <BuilderDetails
                  mic={result.mic}
                  builder={builder}
                  loading={loading}
                  done={done}
                  typedMake={listing || undefined}
                />
              </div>
            )}

            {result.mic && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, margin: '14px 0' }}>
                <RecallsSection mic={result.mic} builderLabel={builder ? builderName(builder) : undefined} />
                <VesselSection hin={result.hin} />
              </div>
            )}

            {result.problems.length > 0 && (
              <ul style={{ margin: '0 0 12px', paddingLeft: 20, lineHeight: 1.6 }}>
                {result.problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}

            {result.mic && (
              <div>
                <Row
                  label="Builder code (MIC)"
                  value={
                    <a
                      href="https://uscgboating.org/content/manufacturers-identification.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: gold }}
                    >
                      {result.mic} · Coast Guard record
                    </a>
                  }
                />
                <Row label="Serial number" value={result.serial} />
                {result.productionMonth && (
                  <Row
                    label="Built"
                    value={
                      result.productionYear
                        ? `${result.productionMonth} ${result.productionYear}`
                        : result.productionMonth
                    }
                  />
                )}
                {result.modelYear && <Row label="Model year" value={result.modelYear} />}
              </div>
            )}

            {result.notes.length > 0 && (
              <ul style={{ margin: '14px 0 0', paddingLeft: 20, lineHeight: 1.6, color: cream }}>
                {result.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}

            <p style={{ margin: '18px 0 0', fontSize: 14, lineHeight: 1.6, color: muted }}>
              A correct format does not mean the boat is free of liens, theft, or damage. See the
              next steps below before you pay.
            </p>
          </div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: 20, borderRadius: 6, padding: '22px 22px 24px', background: gold, color: navy }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Buying this boat?</div>
          <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 16 }}>Two next steps: look it over properly, then close it right.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {[
              {
                label: '1 · INSPECT',
                title: 'My Boat Inspector',
                text: 'A guided walk-through of the boat before you make an offer, with a written report of what you find. It doesn’t replace a professional marine survey; it helps you decide whether one is worth ordering.',
                href: 'https://myboatinspector.com',
                cta: 'Inspect with My Boat Inspector →',
                external: true,
              },
              {
                label: '2 · CLOSE',
                title: 'My Boat Closing',
                text: 'A title photo check before you pay, your state’s bill of sale, and every paper in one Boat File. Any state. Free to start, $29.99 when you’re ready for the paperwork. The seller doesn’t need to sign up.',
                href: '/express/start',
                cta: 'Start My Boat Closing →',
                external: false,
              },
            ].map((c) => (
              <div
                key={c.title}
                style={{ flex: '1 1 250px', background: cream, borderRadius: 6, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: '#8a6516' }}>{c.label}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 700 }}>{c.title}</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55, flex: 1 }}>{c.text}</div>
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener' } : {})}
                  style={{
                    marginTop: 4,
                    background: navy,
                    color: cream,
                    padding: '12px 16px',
                    borderRadius: 5,
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  {c.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            border: '1px solid rgba(201,150,46,0.35)',
            borderRadius: 6,
            padding: '24px 26px',
            background: 'rgba(201,150,46,0.04)',
          }}
        >
          <LienCheck />
        </div>
      )}
    </div>
  )
}
