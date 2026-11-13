import type { Metadata } from 'next'
import Link from 'next/link'
import ExpressStart from './ExpressStart'

// Not linked from anywhere until launch. noindex keeps Google off it meanwhile.
export const metadata: Metadata = {
  title: 'Start your purchase | My Boat Closing',
  robots: { index: false, follow: false },
}

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

export default function Page() {
  return (
    <div style={{ background: '#e9efec', minHeight: '100vh', color: '#13233a', fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#e9efec}'}</style>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 24px',
          borderBottom: '1px solid rgba(19,35,58,0.12)',
        }}
      >
        <Link href="/express" style={{ textDecoration: 'none' }}>
          <div style={{ color: '#13233a', fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 700 }}>My Boat Closing</div>
          <div style={{ color: '#4e5d6c', fontSize: 12.5, marginTop: 2 }}>from BoatClosers · all 50 states</div>
        </Link>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>
        <ExpressStart />
      </main>
    </div>
  )
}
