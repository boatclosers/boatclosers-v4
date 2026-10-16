import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { buildDocument, docsFor, SELLER_DOCS, type DocKey } from '@/lib/express/documents'
import { handoffProblems, type Handoff } from '@/lib/express/content'

// Always read live data: never let Next.js cache database or upstream fetches here.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// GET /api/express/document?token=...&doc=vessel-bill-of-sale
// Builds the PDF from the buyer's deal. Paid deals with complete sale details only.

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const stoken = url.searchParams.get('stoken') || ''
  const doc = url.searchParams.get('doc') as DocKey
  // The buyer opens papers with their private link; the seller, with the
  // separate link they were sent, and only the papers that are theirs.
  if (!/^[a-f0-9]{48}$/.test(token) && !/^[a-f0-9]{48}$/.test(stoken)) return new Response('Link not valid.', { status: 404 })
  if (stoken && !SELLER_DOCS.includes(doc)) return new Response('Not available from this link.', { status: 403 })

  const q = supabaseAdmin.from('express_deals').select('buyer_name,buyer_email,seller_name,items,price_cents,status,paid_at,progress')
  const { data: deal } = await (stoken ? q.eq('progress->>sellerToken', stoken) : q.eq('access_token', token)).maybeSingle()
  if (!deal) return new Response('Link not valid.', { status: 404 })
  if (deal.status !== 'paid') return new Response('Unlock the paperwork first.', { status: 402 })

  const h: Handoff = (deal.progress as any)?.handoff || {}
  const has = { boat: !!(deal.items as any)?.boat, trailer: !!(deal.items as any)?.trailer, motor: !!(deal.items as any)?.motor }
  if (!docsFor(deal.items as any, h).includes(doc)) return new Response('Not a document for this purchase.', { status: 404 })
  // The condition report comes from the inspection, before the sale details exist.
  if (doc !== 'condition-report') {
    if (h.lien === 'open') return new Response('A lien on the title has to be released before the sale.', { status: 409 })
    const problems = handoffProblems(h, has)
    if (problems.length) return new Response(problems[0], { status: 409 })
  }

  const bytes = await buildDocument(doc, deal as any)
  const download = url.searchParams.get('download') === '1'
  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${doc}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
