import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { buildDocument, docsFor, type DocKey } from '@/lib/express/documents'
import { handoffProblems, type Handoff } from '@/lib/express/content'

// GET /api/express/document?token=...&doc=vessel-bill-of-sale
// Builds the PDF from the buyer's deal. Paid deals with complete sale details only.

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const doc = url.searchParams.get('doc') as DocKey
  if (!/^[a-f0-9]{48}$/.test(token)) return new Response('Link not valid.', { status: 404 })

  const { data: deal } = await supabaseAdmin
    .from('express_deals')
    .select('buyer_name,buyer_email,seller_name,items,price_cents,status,paid_at,progress')
    .eq('access_token', token)
    .maybeSingle()
  if (!deal) return new Response('Link not valid.', { status: 404 })
  if (deal.status !== 'paid') return new Response('Unlock the paperwork first.', { status: 402 })

  const h: Handoff = (deal.progress as any)?.handoff || {}
  const has = { boat: !!(deal.items as any)?.boat, trailer: !!(deal.items as any)?.trailer, motor: !!(deal.items as any)?.motor }
  if (h.lien === 'open') return new Response('A lien on the title has to be released before the sale.', { status: 409 })
  const problems = handoffProblems(h, has)
  if (problems.length) return new Response(problems[0], { status: 409 })
  if (!docsFor(deal.items as any).includes(doc)) return new Response('Not a document for this purchase.', { status: 404 })

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
