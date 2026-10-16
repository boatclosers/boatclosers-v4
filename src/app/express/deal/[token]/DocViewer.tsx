'use client'

import { useEffect, useRef, useState } from 'react'

// In-page PDF viewer. Phones (Android especially) download a PDF instead of
// showing it, so we draw each page ourselves with pdf.js, loaded on demand.
const PDFJS = '/pdfjs/pdf.min.js' // pdfjs-dist 3.11.174, self-hosted in public/pdfjs
const WORKER = '/pdfjs/pdf.worker.min.js'

let loading: Promise<any> | null = null
function loadPdfJs(): Promise<any> {
  const w = window as any
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib)
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = PDFJS
      s.async = true
      s.onload = () => {
        w.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER
        resolve(w.pdfjsLib)
      }
      s.onerror = () => {
        loading = null
        reject(new Error('viewer'))
      }
      document.head.appendChild(s)
    })
  }
  return loading
}

export type TokenParam = 'token' | 'stoken'

export function docUrl(token: string, doc: string, download = false, param: TokenParam = 'token') {
  return `/api/express/document?${param}=${token}&doc=${doc}${download ? '&download=1' : ''}`
}

export default function DocViewer({ token, doc, title, onClose, param = 'token' }: { token: string; doc: string; title: string; onClose: () => void; param?: TokenParam }) {
  const pagesRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [msg, setMsg] = useState('')
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    let cancelled = false
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    ;(async () => {
      try {
        const res = await fetch(docUrl(token, doc, false, param), { cache: 'no-store' })
        if (!res.ok) {
          setMsg(await res.text())
          setStatus('error')
          return
        }
        const data = new Uint8Array(await res.arrayBuffer())
        const lib = await loadPdfJs()
        const pdf = await lib.getDocument({ data }).promise
        const box = pagesRef.current
        if (!box || cancelled) return
        box.innerHTML = ''
        const width = Math.min(box.clientWidth || 360, 900)
        const ratio = window.devicePixelRatio || 1
        for (let n = 1; n <= pdf.numPages; n++) {
          if (cancelled) return
          const page = await pdf.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const vp = page.getViewport({ scale: (width / base.width) * ratio })
          const canvas = document.createElement('canvas')
          canvas.width = vp.width
          canvas.height = vp.height
          canvas.style.width = `${width}px`
          canvas.style.height = `${vp.height / ratio}px`
          canvas.style.background = '#fff'
          canvas.style.display = 'block'
          canvas.style.margin = '0 auto 12px'
          canvas.style.boxShadow = '0 2px 10px rgba(0,0,0,0.35)'
          canvas.setAttribute('aria-label', `${title}, page ${n} of ${pdf.numPages}`)
          box.appendChild(canvas)
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp, annotationMode: 2 }).promise
          if (n === 1) setStatus('ready')
        }
      } catch {
        if (!cancelled) {
          setMsg('This document couldn’t be shown here. Use Download to open it.')
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [token, doc, title, param])

  const btn = {
    background: '#c9962e',
    color: '#0f1b2d',
    fontWeight: 700,
    fontSize: 14,
    padding: '10px 14px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#080e1a', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(201,150,46,0.35)' }}>
        <div style={{ flex: 1, color: '#f5f1e8', fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <a href={docUrl(token, doc, true, param)} style={btn}>
          Download
        </a>
        <button type="button" onClick={onClose} style={{ ...btn, background: 'transparent', color: '#f5f1e8', border: '1px solid #c9962e' }}>
          Close
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {status === 'loading' && <p style={{ color: '#bdb6a8', textAlign: 'center' }}>Opening {title}...</p>}
        {status === 'error' && <p style={{ color: '#c9962e', textAlign: 'center', lineHeight: 1.6 }}>{msg}</p>}
        <div ref={pagesRef} style={{ maxWidth: 900, margin: '0 auto' }} />
      </div>
    </div>
  )
}
