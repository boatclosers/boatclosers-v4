'use client'

import { useEffect, useState } from 'react'
import { makeMatches, type Builder, type Recall, type VesselRecord } from '@/lib/hin'

const gold = '#c9962e'
const cream = '#f5f1e8'
const muted = '#bdb6a8'

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\b(Llc|Inc|Usa)\b/g, (w) => w.toUpperCase())
}

function year(d: string | null): string | null {
  const m = d ? /(\d{4})$/.exec(d) : null
  return m ? m[1] : null
}

// Looks up the builder for a 3-character USCG builder code (MIC).
export function useBuilder(mic: string | null) {
  const [builder, setBuilder] = useState<Builder | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setBuilder(null)
    setDone(false)
    if (!mic || !/^[A-Z0-9]{3}$/.test(mic)) return
    let alive = true
    setLoading(true)
    fetch(`/api/hin/builder?mic=${mic}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setBuilder(d.builder || null)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) {
          setLoading(false)
          setDone(true)
        }
      })
    return () => {
      alive = false
    }
  }, [mic])

  return { builder, loading, done }
}

export function builderName(b: Builder): string {
  return titleCase(b.company)
}

// Builder details shown under a HIN check. Pass `typedMake` (what the buyer
// typed for the boat) to flag a builder that doesn't appear to match.
export function BuilderDetails({
  mic,
  builder,
  loading,
  done,
  typedMake,
}: {
  mic: string
  builder: Builder | null
  loading: boolean
  done: boolean
  typedMake?: string
}) {
  if (loading) return <div style={{ color: muted }}>Looking up the builder with the Coast Guard...</div>
  if (!done) return null

  if (!builder) {
    return (
      <div style={{ color: gold, lineHeight: 1.6 }}>
        No builder is registered with the Coast Guard under code {mic}. That can mean a typo in the HIN, a very old or
        foreign-built boat, or a HIN that isn&apos;t genuine. Compare it with the hull and the title.
      </div>
    )
  }

  const opened = year(builder.inBusiness)
  const closed = year(builder.outOfBusiness)
  const place = [builder.city, builder.state].filter(Boolean).join(', ')
  const mismatch = typedMake && /[a-z]/i.test(typedMake.replace(/\b(19|20)\d{2}\b/, '')) && !makeMatches(typedMake, builder)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.6 }}>
      <div style={{ fontSize: 17, color: cream }}>
        Built by <b>{builderName(builder)}</b>
        {place ? ` · ${place}` : ''}
      </div>
      {builder.dba && <div style={{ color: muted }}>Also does business as {titleCase(builder.dba)}</div>}
      {closed ? (
        <div style={{ color: gold }}>
          Out of business since {closed}
          {opened ? ` (opened ${opened})` : ''}. Parts and warranty support may be limited.
        </div>
      ) : opened ? (
        <div style={{ color: muted }}>In business since {opened}</div>
      ) : null}
      {builder.types.length > 0 && <div style={{ color: muted }}>Registered to build: {builder.types.join(', ')}</div>}
      {mismatch && (
        <div style={{ color: gold }}>
          ✕ You entered &quot;{typedMake}&quot;, but this HIN&apos;s builder code belongs to {builderName(builder)}. Some
          brands are built under a parent company&apos;s name, so ask the seller to explain before you go further.
        </div>
      )}
    </div>
  )
}


// ---------- Shared fetch hook ----------

function useJson<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  useEffect(() => {
    setData(null)
    if (!url) return setState('idle')
    let alive = true
    setState('loading')
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((d) => {
        if (alive) {
          setData(d)
          setState('done')
        }
      })
      .catch(() => alive && setState('error'))
    return () => {
      alive = false
    }
  }, [url])
  return { data, state }
}

const sectionTitle = { fontSize: 11, letterSpacing: 2, color: gold, fontWeight: 700, marginBottom: 6 }
const rowStyle = { padding: '8px 0', borderBottom: '1px solid rgba(245,241,232,0.1)', lineHeight: 1.5 }

function monthYear(d: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(d)
  if (!m) return d
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// ---------- Recalls ----------

export function RecallsSection({ mic, builderLabel }: { mic: string | null; builderLabel?: string }) {
  const { data, state } = useJson<{ recalls: Recall[] }>(mic ? `/api/hin/recalls?mic=${mic}` : null)
  const [all, setAll] = useState(false)
  if (!mic || state === 'idle') return null

  return (
    <div>
      <div style={sectionTitle}>SAFETY RECALLS</div>
      {state === 'loading' && <div style={{ color: muted }}>Checking the Coast Guard recall database...</div>}
      {state === 'error' && <div style={{ color: muted }}>The Coast Guard recall database didn&apos;t respond. Try again in a minute.</div>}
      {state === 'done' && data && data.recalls.length === 0 && (
        <div style={{ color: cream }}>✓ No safety recalls on file for {builderLabel || 'this builder'}.</div>
      )}
      {state === 'done' && data && data.recalls.length > 0 && (
        <div>
          <div style={{ color: gold, marginBottom: 4 }}>
            {data.recalls.length} recall{data.recalls.length === 1 ? '' : 's'} on file for {builderLabel || 'this builder'}.
            Check whether any match this boat&apos;s model.
          </div>
          {(all ? data.recalls : data.recalls.slice(0, 5)).map((r) => (
            <div key={r.id} style={rowStyle}>
              <a
                href={`https://uscgboating.org/content/recalls-details.php?id=${r.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: cream }}
              >
                {r.model || 'Model not listed'}
              </a>
              <span style={{ color: muted }}> · opened {r.date ? monthYear(r.date) : 'date unknown'}</span>
            </div>
          ))}
          {data.recalls.length > 5 && (
            <button
              type="button"
              onClick={() => setAll(!all)}
              style={{ marginTop: 8, background: 'none', border: 'none', color: gold, cursor: 'pointer', padding: 0, fontSize: 15 }}
            >
              {all ? 'Show fewer' : `Show all ${data.recalls.length}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- Coast Guard vessel records ----------

const SERIOUS = /incident|casualty|pollution|investigat|violation|enforcement|search|rescue|marine event/i

export function VesselSection({ hin }: { hin: string | null }) {
  const valid = hin && /^[A-Z0-9]{12}$/.test(hin)
  const { data, state } = useJson<{ vessels: VesselRecord[] }>(valid ? `/api/hin/vessel?hin=${hin}` : null)
  if (!valid || state === 'idle') return null

  return (
    <div>
      <div style={sectionTitle}>COAST GUARD RECORDS</div>
      {state === 'loading' && (
        <div style={{ color: muted }}>Searching Coast Guard vessel records. This one can take up to 30 seconds...</div>
      )}
      {state === 'error' && (
        <div style={{ color: muted }}>The Coast Guard vessel database didn&apos;t respond. It goes down often, so try again later.</div>
      )}
      {state === 'done' && data && data.vessels.length === 0 && (
        <div style={{ color: muted, lineHeight: 1.6 }}>
          No Coast Guard record for this HIN. That&apos;s normal for most state-registered boats: this database mainly
          covers federally documented vessels. Check the Florida title for ownership and liens.
        </div>
      )}
      {state === 'done' &&
        data &&
        data.vessels.map((v) => {
          const flagged = v.cases.filter((c) => SERIOUS.test(c.type))
          return (
            <div key={v.number || v.name} style={{ ...rowStyle, borderBottom: 'none', marginBottom: 6 }}>
              <div style={{ fontSize: 16, color: cream }}>
                <b>{v.name || 'Unnamed vessel'}</b>
                {v.status ? ` · ${v.status}` : ''}
              </div>
              <div style={{ color: muted }}>
                {v.numberType}: {v.number}
                {v.service ? ` · ${v.service}` : ''}
                {v.built ? ` · built ${v.built}` : ''}
              </div>
              {v.numberType === 'Coast Guard official number' && (
                <div style={{ color: gold }}>
                  Federally documented. Title transfers through the Coast Guard&apos;s Vessel Documentation Center, not
                  the state, and recorded mortgages show on its abstract of title.
                </div>
              )}
              {v.cases.length > 0 ? (
                <div style={{ marginTop: 6 }}>
                  <div style={{ color: flagged.length ? gold : muted }}>
                    {v.cases.length} Coast Guard case{v.cases.length === 1 ? '' : 's'} on file
                    {flagged.length ? `, ${flagged.length} incident-related` : ''}:
                  </div>
                  {v.cases.slice(0, 8).map((c, i) => (
                    <div key={i} style={{ color: SERIOUS.test(c.type) ? gold : cream, fontSize: 14, paddingLeft: 10 }}>
                      {monthYear(c.date)} · {c.type}
                      {c.result ? ` (${c.result})` : ''}
                      {c.port ? ` · ${c.port}` : ''}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: muted }}>No Coast Guard boardings, inspections, or incident cases on file.</div>
              )}
            </div>
          )
        })}
    </div>
  )
}
