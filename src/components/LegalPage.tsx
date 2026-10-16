import Link from 'next/link'
import type { ReactNode } from 'react'

// Shared shell for the plain-English policy pages.
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{ background: '#0f1b2d', minHeight: '100vh', color: '#f5f1e8', fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#0f1b2d} .legal h2{font-family:Georgia,serif;color:#c9962e;font-size:21px;margin:32px 0 10px} .legal p,.legal li{font-size:16px;line-height:1.7;opacity:.92} .legal a{color:#c9962e}'}</style>
      <header style={{ padding: '22px 16px', borderBottom: '2px dashed #c9962e' }}>
        <Link href="/" style={{ color: '#c9962e', fontFamily: 'Georgia, serif', fontSize: 24, letterSpacing: 2, fontWeight: 700, textDecoration: 'none' }}>
          BOATCLOSERS
        </Link>
      </header>
      <main className="legal" style={{ maxWidth: 760, margin: '0 auto', padding: '40px 16px 80px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 6vw, 38px)', margin: '0 0 6px' }}>{title}</h1>
        <p style={{ color: '#bdb6a8', margin: '0 0 24px' }}>Last updated {updated}</p>
        {children}
        <p style={{ marginTop: 40, color: '#bdb6a8', fontSize: 14 }}>
          <Link href="/privacy">Privacy policy</Link> · <Link href="/sms-terms">Text message terms</Link> · <Link href="/">BoatClosers</Link>
        </p>
      </main>
    </div>
  )
}
