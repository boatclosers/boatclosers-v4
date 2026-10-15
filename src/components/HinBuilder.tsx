'use client'

import { useEffect, useState } from 'react'
import { makeMatches, type Builder } from '@/lib/hin'

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
