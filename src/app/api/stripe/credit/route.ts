import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { findExpressCredit, EXPRESS_CREDIT_CENTS } from '@/lib/expressCredit'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// GET -> { creditCents }: whether the signed-in person has an unused BC Express
// credit, so the pay screen can show the lower price before checkout.
export async function GET(req: Request) {
  const h = req.headers.get('authorization') || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return NextResponse.json({ creditCents: 0 })
  try {
    const { data } = await supabaseAdmin.auth.getUser(token)
    const id = await findExpressCredit(data?.user?.email)
    return NextResponse.json({ creditCents: id ? EXPRESS_CREDIT_CENTS : 0 })
  } catch {
    return NextResponse.json({ creditCents: 0 })
  }
}
