import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import OfferForm from './OfferForm'

// Public "make an offer" page a seller posts in their ad.
// Shows only the boat basics (no seller contact details), then a short form:
// each buyer gets their own private deal room with the seller.

export const dynamic = 'force-dynamic'

const navy = '#0f1b2d'
const gold = '#c9962e'
const cream = '#f5f1e8'

type Boat = { title: string; facts: string[]; price: number | null }

async function getBoat(code: string): Promise<Boat | null> {
  if (!/^[A-Za-z0-9]{5,12}$/.test(code)) return null
  try {
    const { data: link } = await supabaseAdmin
      .from('offer_links')
      .select('source_deal_id, active')
      .eq('code', code.toUpperCase())
      .maybeSingle()
    if (!link?.active) return null
    const { data: deal } = await supabaseAdmin.from('deals').select('vessel').eq('id', link.source_deal_id).maybeSingle()
    const v: any = deal?.vessel || {}
    const title = [v.year, v.make, v.model].filter(Boolean).join(' ')
    if (!title) return null
    const facts = [
      v.loa ? `${v.loa} ft` : '',
      [v.engineMake, v.engineModel].filter(Boolean).join(' '),
      v.location || v.regState || '',
      String(v.trailerIncluded || '').toLowerCase() === 'yes' ? 'Trailer included' : '',
    ].filter(Boolean)
    const price = Number(v.askingPrice) > 0 ? Number(v.askingPrice) : null
    return { title, facts, price }
  } catch {
    return null
  }
}

export async function generateMetadata(props: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await props.params
  const boat = await getBoat(code)
  const title = boat ? `Make an offer on this ${boat.title}` : 'Make an offer on a boat'
  const description = 'Make a written offer in a private deal room with the seller. Deposit held in escrow, paperwork handled. Free for buyers to join.'
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, images: ['/og-image.png'] },
  }
}

export default async function Page(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params
  const boat = await getBoat(code)

  return (
    <div style={{ background: navy, minHeight: '100vh', color: cream, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{'body{margin:0;background:#0f1b2d}'}</style>
      <header style={{ padding: '22px 28px', borderBottom: `2px dashed ${gold}` }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ color: gold, fontFamily: 'Georgia, serif', fontSize: 24, letterSpacing: 2, fontWeight: 700 }}>BOATCLOSERS</div>
          <div style={{ color: cream, fontSize: 10, letterSpacing: 3, opacity: 0.75 }}>PRIVATE VESSEL TRANSACTIONS</div>
        </Link>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 22px 72px' }}>
        {!boat ? (
          <>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 34, lineHeight: 1.2 }}>This offer link isn&apos;t active</h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, opacity: 0.85 }}>
              The seller may have sold the boat or turned the link off. Ask them for a new one.
            </p>
            <Link href="/" style={{ color: gold }}>
              Buying a boat? See how BoatClosers works
            </Link>
          </>
        ) : (
          <>
            <div style={{ color: gold, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Make an offer</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(30px, 6vw, 42px)', lineHeight: 1.15, margin: '0 0 12px' }}>
              {boat.title}
            </h1>
            {(boat.facts.length > 0 || boat.price) && (
              <div style={{ fontSize: 16, opacity: 0.85, marginBottom: 28 }}>
                {boat.price ? (
                  <span style={{ color: gold, fontWeight: 700 }}>
                    Asking {boat.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </span>
                ) : null}
                {boat.price && boat.facts.length ? ' · ' : ''}
                {boat.facts.join(' · ')}
              </div>
            )}

            <div style={{ background: cream, color: navy, borderRadius: 8, padding: '26px 24px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
                Serious about this boat?
              </div>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, margin: '0 0 18px' }}>
                The seller handles offers through BoatClosers. Enter your name and email to open your own private deal
                room with them.
              </p>
              <OfferForm code={code.toUpperCase()} />
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'grid', gap: 12, fontSize: 15.5, lineHeight: 1.55 }}>
              {[
                'Free to join and make your offer.',
                'Make a written offer with price, deposit and contingencies. Every counter is recorded.',
                'Your deposit goes to a neutral escrow company, not to the seller. We never hold your money.',
                'Survey and sea trial on a set clock, with the right to renegotiate or walk away.',
              ].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: gold, fontWeight: 700 }} aria-hidden="true">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13, opacity: 0.6, marginTop: 28, lineHeight: 1.6 }}>
              BoatClosers is an online closing tool for private boat sales. Not a brokerage. Check the boat yourself before
              you commit: run the <Link href="/hin-check" style={{ color: gold }}>free HIN check</Link>.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
