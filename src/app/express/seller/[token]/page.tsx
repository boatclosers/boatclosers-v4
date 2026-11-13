import type { Metadata } from 'next'
import SellerPapers from './SellerPapers'

export const metadata: Metadata = {
  title: 'Your sale papers | BoatClosers',
  robots: { index: false, follow: false },
}

export default function Page({ params }: { params: { token: string } }) {
  return (
    <div style={{ background: '#e9efec', minHeight: '100vh', color: '#13233a', fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#e9efec}'}</style>
      <header style={{ padding: '20px 16px', borderBottom: '1px solid rgba(19,35,58,0.12)' }}>
        <div style={{ color: '#13233a', fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 700 }}>My Boat Closing</div>
      </header>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 64px' }}>
        <SellerPapers stoken={params.token} />
      </main>
    </div>
  )
}
