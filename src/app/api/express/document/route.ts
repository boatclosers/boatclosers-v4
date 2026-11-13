import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { buildDocument, docsFor, SELLER_DOCS, FREE_DOCS, type DocKey } from '@/lib/express/documents'
import { handoffProblems, type Handoff } from '@/lib/express/content'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

const PREVIEW_DOCS: DocKey[] = ['vessel-bill-of-sale', 'motor-bill-of-sale', 'trailer-bill-of-sale']

async function watermark(bytes: Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes)
  const font = await pdf.embedFont(StandardFonts.HelveticaBold)
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize()
    for (const [y, size] of [[height * 0.2, 30], [height * 0.5, 30], [height * 0.8, 30]] as [number, number][]) {
      const t = 'PREVIEW · UNLOCK TO PRINT'
      const w = font.widthOfTextAtSize(t, size)
      page.drawText(t, { x: width / 2 - (w / 2) * 0.82, y: y - (w / 2) * 0.57, size, font, color: rgb(0.72, 0.53, 0.23), opacity: 0.34, rotate: degrees(35) })
    }
  }
  return pdf.save()
}

// Always read live data: never let Next.js cache database or upstream fetches here.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 60

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

  const q = supabaseAdmin.from('express_deals').select('id,buyer_name,buyer_email,seller_name,items,price_cents,state,status,paid_at,progress')
  const { data: deal } = await (stoken ? q.eq('progress->>sellerToken', stoken) : q.eq('access_token', token)).maybeSingle()
  if (!deal) return new Response('Link not valid.', { status: 404 })
  // A watermarked preview of the bill of sale, so the buyer sees their own
  // paper filled in before paying. Stamped on every page; can't be printed clean.
  const preview = !stoken && url.searchParams.get('preview') === '1' && PREVIEW_DOCS.includes(doc)
  if (deal.status !== 'paid' && !FREE_DOCS.includes(doc) && !preview) return new Response('Unlock the paperwork first.', { status: 402 })

  const h: Handoff = (deal.progress as any)?.handoff || {}
  const has = { boat: !!(deal.items as any)?.boat, trailer: !!(deal.items as any)?.trailer, motor: !!(deal.items as any)?.motor }
  if (!docsFor(deal.items as any, h, (deal as any).state, deal.progress).includes(doc)) return new Response('Not a document for this purchase.', { status: 404 })
  // Records and checks don't wait on the sale details.
  if (!preview && ![...FREE_DOCS, 'handoff-record', 'walk-around', 'title-check', 'vessel-history', 'state-guide'].includes(doc)) {
    if (h.lien === 'open') return new Response('A lien on the title has to be released before the sale.', { status: 409 })
    const problems = handoffProblems(h, has, (deal as any).state)
    if (problems.length) return new Response(problems[0], { status: 409 })
  }

  const bytes = preview ? await watermark(await buildDocument(doc, deal as any)) : await buildDocument(doc, deal as any)
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
