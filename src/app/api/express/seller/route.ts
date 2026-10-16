import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { docsFor, SELLER_DOCS, DOC_TITLES } from '@/lib/express/documents'
import { addDays, type Handoff } from '@/lib/express/content'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// GET /api/express/seller?stoken=... -> what the seller's page shows: their papers
// for this sale and the notice-of-sale deadline. Nothing private about the buyer
// beyond their name.
export async function GET(req: Request) {
  const stoken = new URL(req.url).searchParams.get('stoken') || ''
  if (!/^[a-f0-9]{48}$/.test(stoken)) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  const { data: deal } = await supabaseAdmin
    .from('express_deals')
    .select('buyer_name,seller_name,items,progress,status')
    .eq('progress->>sellerToken', stoken)
    .maybeSingle()
  if (!deal || deal.status !== 'paid') return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  const h: Handoff = (deal.progress as any)?.handoff || {}
  const docs = docsFor(deal.items as any, h)
    .filter((k) => SELLER_DOCS.includes(k))
    .map((k) => ({ key: k, title: DOC_TITLES[k] }))
  const due = h.saleDate ? addDays(h.saleDate, 30) : null
  return NextResponse.json({
    sellerName: deal.seller_name,
    buyerName: deal.buyer_name,
    items: Object.values(deal.items || {}).map((i: any) => i.description),
    saleDate: h.saleDate || null,
    noticeDue: due ? due.toISOString().slice(0, 10) : null,
    docs,
  })
}
