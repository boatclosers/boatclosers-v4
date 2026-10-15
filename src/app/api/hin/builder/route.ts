import { NextResponse } from 'next/server'
import { lookupBuilder } from '@/lib/micLookup'

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
