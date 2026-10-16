import { NextResponse } from 'next/server'
import { lookupVessel } from '@/lib/uscgData'

// Always read live data: never let Next.js cache database or upstream fetches here.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// The Coast Guard PSIX service is slow and often retries; give it room.
export const maxDuration = 45

// GET /api/hin/vessel?hin=... -> Coast Guard vessel records and cases for that HIN.
export async function GET(req: Request) {
  const hin = (new URL(req.url).searchParams.get('hin') || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (hin.length < 10 || hin.length > 14) return NextResponse.json({ error: 'Invalid HIN.' }, { status: 400 })
  try {
    const vessels = await lookupVessel(hin)
    return NextResponse.json({ vessels }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })
  } catch {
    return NextResponse.json({ error: 'The Coast Guard vessel database did not respond.' }, { status: 502 })
  }
}
