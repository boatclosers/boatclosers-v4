'use client'

import { useEffect, useState } from 'react'
import { DocRow, boxStyle, eyebrow, muted, gold, cream } from '../../deal/[token]/parts'

export default function SellerPapers({ stoken }: { stoken: string }) {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch(`/api/express/seller?stoken=${encodeURIComponent(stoken)}`, { cache: 'no-store' })
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || 'Link not valid.')
        setD(j)
      })
      .catch((e) => setErr(e?.message || 'Link not valid.'))
  }, [stoken])

  if (err) return <p style={{ color: muted, lineHeight: 1.6 }}>This link isn’t working. Ask the buyer to send your copies again.</p>
  if (!d) return <p style={{ color: muted }}>Loading your papers...</p>

  const due = d.noticeDue ? new Date(`${d.noticeDue}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ color: gold, fontWeight: 700, fontSize: 14 }}>Seller’s copies</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, lineHeight: 1.2, margin: '6px 0' }}>Hi {String(d.sellerName).split(' ')[0]}, here are your papers</h1>
        <p style={{ margin: 0, color: muted, lineHeight: 1.6 }}>
          From your sale of {d.items.join(', ')} to {d.buyerName}. You don’t need an account.
        </p>
      </div>
      <div style={{ ...boxStyle, border: `1px solid ${gold}`, background: 'rgba(201,150,46,0.08)' }}>
        <div style={eyebrow}>ONE THING LEFT FOR YOU</div>
        <p style={{ margin: 0, color: cream, lineHeight: 1.6 }}>
          Sign your notice of sale (page 2 of Florida form HSMV 82050) and file it with any county tax collector
          {due ? <> by <b>{due}</b></> : ' within 30 days'}. That takes the boat out of your name, so you’re not responsible for what happens with it after the sale.
        </p>
      </div>
      <div style={boxStyle}>
        <div style={eyebrow}>YOUR PAPERS</div>
        {d.docs.map((x: any) => (
          <DocRow key={x.key} token={stoken} param="stoken" doc={x.key} name={x.title} />
        ))}
      </div>
    </div>
  )
}
