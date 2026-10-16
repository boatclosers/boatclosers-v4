import type { Metadata } from 'next'
import SellerPapers from './SellerPapers'

export const metadata: Metadata = {
  title: 'Your sale papers | BoatClosers',
  robots: { index: false, follow: false },
}

export default function Page({ params }: { params: { token: string } }) {
  return (
    <div style={{ background: '#0f1b2d', minHeight: '100vh', color: '#f5f1e8', fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#0f1b2d}'}</style>
      <header style={{ padding: '20px 16px', borderBottom: '2px dashed #c9962e' }}>
        <div style={{ color: '#c9962e', fontFamily: 'Georgia, serif', fontSize: 22, letterSpacing: 2, fontWeight: 700 }}>BOATCLOSERS</div>
      </header>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 64px' }}>
        <SellerPapers stoken={params.token} />
      </main>
    </div>
  )
}
