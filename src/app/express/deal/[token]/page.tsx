import type { Metadata } from 'next'
import Link from 'next/link'
import ExpressDeal from './ExpressDeal'

// Private page: reached only through the buyer's emailed link. Never indexed.
export const metadata: Metadata = {
  title: 'Your BC Express purchase',
  robots: { index: false, follow: false },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

export default function Page({ params }: { params: { token: string } }) {
  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#0f1b2d}'}</style>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 24px',
          borderBottom: `2px dashed ${gold}`,
        }}
      >
        <Link href="/express" style={{ textDecoration: 'none' }}>
          <div style={{ color: gold, fontFamily: 'Georgia, serif', fontSize: 22, letterSpacing: 2, fontWeight: 700 }}>
            BOATCLOSERS
          </div>
          <div style={{ color: cream, fontSize: 10, letterSpacing: 3, opacity: 0.75 }}>
            EXPRESS · BUYER TOOLKIT
          </div>
        </Link>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>
        <ExpressDeal token={params.token} />
      </main>
    </div>
  )
}
