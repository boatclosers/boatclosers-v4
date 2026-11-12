'use client'

import { useState } from 'react'
import { decodeHin } from '@/lib/hin'
import { useBuilder, BuilderDetails, builderName, RecallsSection, VesselSection } from '@/components/HinBuilder'
import { navy, gold, cream, muted, line, boxStyle, eyebrow } from './parts'

// Step 1 tool: decode the boat's HIN and compare it with the year the buyer entered.
export default function HinCard({ token, boat, onSaved }: { token: string; boat: any; onSaved: (items: any) => void }) {
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

