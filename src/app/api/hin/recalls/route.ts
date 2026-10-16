import { NextResponse } from 'next/server'
import { lookupRecalls } from '@/lib/uscgData'

// Always read live data: never let Next.js cache database or upstream fetches here.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// GET /api/hin/recalls?mic=ABC -> USCG safety recalls on file for that builder code.
export async function GET(req: Request) {
  const mic = (new URL(req.url).searchParams.get('mic') || '').toUpperCase()
  if (!/^[A-Z0-9]{3}$/.test(mic)) return NextResponse.json({ error: 'Invalid builder code.' }, { status: 400 })
  try {
    const recalls = await lookupRecalls(mic)
    return NextResponse.json({ recalls }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })
  } catch {
    return NextResponse.json({ error: 'The Coast Guard recall database did not respond.' }, { status: 502 })
  }
}
