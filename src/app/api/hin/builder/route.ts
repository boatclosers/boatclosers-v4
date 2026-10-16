import { NextResponse } from 'next/server'
import { lookupBuilder } from '@/lib/micLookup'

// Always read live data: never let Next.js cache database or upstream fetches here.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// GET /api/hin/builder?mic=ABC -> the boat builder registered to that USCG
// Manufacturer Identification Code, or { builder: null } if none is found.
export async function GET(req: Request) {
  const mic = (new URL(req.url).searchParams.get('mic') || '').toUpperCase()
  if (!/^[A-Z0-9]{3}$/.test(mic)) return NextResponse.json({ error: 'Invalid builder code.' }, { status: 400 })
  const builder = await lookupBuilder(mic)
  return NextResponse.json(
    { builder },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  )
}
