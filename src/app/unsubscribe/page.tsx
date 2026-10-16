import type { Metadata } from 'next'
import Link from 'next/link'
import Unsubscribe from './Unsubscribe'

export const metadata: Metadata = {
  title: 'Email and text preferences | BoatClosers',
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <div style={{ background: '#0f1b2d', minHeight: '100vh', color: '#f5f1e8', fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#0f1b2d}'}</style>
      <header style={{ padding: '24px 24px', borderBottom: '2px dashed #c9962e' }}>
        <Link href="/" style={{ color: '#c9962e', fontFamily: 'Georgia, serif', fontSize: 24, letterSpacing: 2, fontWeight: 700, textDecoration: 'none' }}>
          BOATCLOSERS
        </Link>
      </header>
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 16px 80px' }}>
        <Unsubscribe />
      </main>
    </div>
  )
}
