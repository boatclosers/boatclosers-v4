'use client'

import { useEffect, useState, type CSSProperties } from 'react'

// "Watch how it works" button: opens the app's walkthrough video in a pop-up
// player on the same page (YouTube's privacy-friendly player, which loads
// only after the visitor taps). Close with the ✕, the Esc key or a tap outside.
// Video ids live in VIDEOS so every page uses the same, current upload.

export const VIDEOS = {
  boatclosers: { id: '6_fRiIer7sw', title: 'How BoatClosers works', length: '5 min' },
  myBoatClosing: { id: 'V1MD6aj_QZY', title: 'How My Boat Closing works', length: '5 min' },
  myBoatInspector: { id: '0gyNXWDfNeo', title: 'How My Boat Inspector works', length: '4 min' },
  myBoatListing: { id: '-G0SDxIkMkk', title: 'How My Boat Listing works', length: '3 min' },
  myBoatLogs: { id: 'YSX2fJs-RQc', title: 'How My Boat Logs works', length: '3 min' },
} as const

export const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLakBAlm07cqc'

type Props = {
  video: keyof typeof VIDEOS
  label?: string
  style?: CSSProperties
  className?: string
}

export default function WatchVideo({ video, label, style, className }: Props) {
  const v = VIDEOS[video]
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={className ? style : { ...defaultBtn, ...style }}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true" style={{ marginRight: 8 }}>▶</span>
        {label || `Watch how it works (${v.length})`}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={v.title}
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(3,10,22,0.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(960px, 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', marginBottom: 10, gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>{v.title}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close video"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 8, minWidth: 44, minHeight: 44, fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1`}
                title={v.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
            <p style={{ color: '#c9d4e2', fontSize: 14, marginTop: 10 }}>
              More walkthroughs: <a href={PLAYLIST_URL} target="_blank" rel="noopener" style={{ color: '#e0b56a' }}>all BoatClosers family videos on YouTube</a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}

const defaultBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 10,
  border: '1.5px solid currentColor',
  background: 'transparent',
  color: 'inherit',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
}
