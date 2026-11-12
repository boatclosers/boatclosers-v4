import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { STATE_NAMES } from '@/lib/express/states'
import type { TitleCheck } from '@/lib/express/documents'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 60

// Title pre-check: the buyer photographs the front and back of the seller's
// title and the AI reads it for the problems that get titles rejected or cost
// buyers their money. The photos are read once and never stored. Part of the
// paid paperwork; 3 checks per purchase.
//   POST { token, images: [dataUrl, dataUrl?] } -> { titleCheck }

const MODEL = () => process.env.AI_MODEL || 'claude-sonnet-5-5'
const MAX_CHECKS = 3

const SYSTEM = `You check photos of a boat (vessel) certificate of title for a buyer in a private sale, before they pay. You are careful and plain-spoken. You never claim the title is valid; you point out what to check.

Return ONLY a JSON object with these keys:
- "readable": true or false. False if you can't make out the document or it isn't a vessel title.
- "titleState": the state or agency that issued it, or "".
- "owners": owner names exactly as printed, or "".
- "ownersJoin": "and", "or", "single", or "unclear" (how two or more owners are joined).
- "hinOnTitle": the hull identification number as printed, or "".
- "lienholder": the lienholder named on the title, or "" if none is printed.
- "flags": an array of {"level": "stop"|"check"|"ok", "text": "..."}, 3 to 8 items, most serious first. Each text is one short plain sentence a beginner understands.
- "summary": one or two sentences overall.

What to look for:
- Owner names vs. the seller's name you are given. A mismatch is "stop": only the owner on the title can sell.
- Two owners joined by "and": both must sign ("check"). Joined by "or": either can sign.
- HIN on the title vs. the HIN you are given. Different or missing is "stop".
- A lienholder printed with no release stamp or signature: "stop" (the lender has a claim until released).
- Words like salvage, rebuilt, flood, junk, duplicate, or "not for registration": "check", and say what it means.
- The transfer/assignment section on the back: already signed by someone else, a different buyer filled in, white-out, cross-outs, or erasures: "stop" or "check".
- A photocopy or obviously altered document: "stop".
- Year/make on the title vs. the description you are given: "check" if they differ.
Add "ok" items for things that match. If a photo is blurry or cut off, say what you couldn't read.`

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const token = String(body?.token || '')
  if (!/^[a-f0-9]{48}$/.test(token)) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  const images: string[] = Array.isArray(body?.images) ? body.images.slice(0, 2) : []
  const parsed = images
    .map((d) => /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(d)))
    .filter(Boolean) as RegExpExecArray[]
  if (!parsed.length) return NextResponse.json({ error: 'Add a photo of the title.' }, { status: 400 })
  if (parsed.some((m) => m[2].length > 7_000_000)) return NextResponse.json({ error: 'That photo is too large. Try again.' }, { status: 413 })

  const { data: deal } = await supabaseAdmin
    .from('express_deals')
    .select('id,seller_name,items,state,status,progress')
    .eq('access_token', token)
    .maybeSingle()
  if (!deal) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  if (deal.status !== 'paid') return NextResponse.json({ error: 'The title check comes with your paperwork. Unlock it first.' }, { status: 402 })
  const p: any = deal.progress || {}
  const used = Number(p.titleChecks || 0)
  if (used >= MAX_CHECKS) return NextResponse.json({ error: 'You’ve used all 3 title checks for this purchase.' }, { status: 429 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'The title check isn’t available right now.' }, { status: 503 })

  const h = p.handoff || {}
  const items: any = deal.items || {}
  const facts = [
    `Seller name(s) given: ${deal.seller_name}${h.twoSellers && h.secondSeller ? ` and ${h.secondSeller}` : ''}`,
    `Boat: ${items.boat?.description || items.motor?.description || items.trailer?.description || 'not given'}`,
    `HIN given: ${items.boat?.hin || 'not given'}`,
    `State of sale: ${STATE_NAMES[deal.state || 'FL'] || 'Florida'}`,
    `Photos: ${parsed.length === 2 ? 'front, then back' : 'one side'}`,
  ].join('\n')

  let out: any
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res: any = await client.messages.create({
      model: MODEL(),
      max_tokens: 1200,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            ...parsed.map((m) => ({ type: 'image' as const, source: { type: 'base64' as const, media_type: m[1] as 'image/jpeg' | 'image/png' | 'image/webp', data: m[2] } })),
            { type: 'text' as const, text: `${facts}\n\nCheck this title. JSON only.` },
          ],
        },
      ],
    })
    const text = (res.content || []).map((c: any) => (c.type === 'text' ? c.text : '')).join('')
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    out = JSON.parse(json)
  } catch (e) {
    console.error('title check failed', e)
    return NextResponse.json({ error: 'We couldn’t read that. Try a sharper photo in good light, with the whole title in frame.' }, { status: 502 })
  }

  const clean = (v: unknown, n = 200) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '')
  if (out?.readable === false) {
    return NextResponse.json({ error: clean(out.summary, 300) || 'That doesn’t look like a readable boat title. Try again with the whole title in frame.' }, { status: 422 })
  }
  const titleCheck: TitleCheck = {
    at: new Date().toISOString(),
    summary: clean(out.summary, 400) || 'Checked.',
    owners: clean(out.owners),
    ownersJoin: ['and', 'or', 'single', 'unclear'].includes(out.ownersJoin) ? out.ownersJoin : undefined,
    lienholder: clean(out.lienholder),
    titleState: clean(out.titleState, 60),
    hinOnTitle: clean(out.hinOnTitle, 20),
    flags: (Array.isArray(out.flags) ? out.flags : [])
      .slice(0, 10)
      .map((f: any) => ({ level: ['stop', 'check', 'ok'].includes(f?.level) ? f.level : 'check', text: clean(f?.text, 240) }))
      .filter((f: any) => f.text),
  }
  const progress = { ...p, titleCheck, titleChecks: used + 1 }
  await supabaseAdmin.from('express_deals').update({ progress, updated_at: new Date().toISOString() }).eq('id', deal.id)
  return NextResponse.json({ titleCheck, left: MAX_CHECKS - used - 1 })
}
