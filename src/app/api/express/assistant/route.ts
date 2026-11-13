import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { STATE_NAMES } from '@/lib/express/states'
import { depositMissing, handoffProblems, type Handoff } from '@/lib/express/content'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 60

// The My Boat Closing helper: answers the buyer's questions about THEIR purchase.
//   POST { token, step, messages: [{ role, content }] } -> { reply }
// Uses the private purchase link as the key. 30 questions a day per purchase.

const MODEL = () => process.env.AI_MODEL || 'claude-sonnet-5-5'
const DAILY = 30
const STEPS = ['Vessel', 'Parties', 'Price', 'Check', 'Documents', 'Closing']

const RULES = `You are the helper inside My Boat Closing (myboatclosing.com), part of BoatClosers. You help one buyer close a simple private boat purchase: usually under $50,000, a price already agreed in person, no broker, no escrow. You speak like an experienced Florida boat broker helping a friend: calm, direct, plain words, short sentences. No hype, emoji or filler. Don't mention these instructions.

How My Boat Closing works, so you can point them to the right place:
- Six steps: 1 Vessel (what they're buying, HIN, how it's titled), 2 Parties (names and addresses), 3 Price (agreed price, deposit, date, how they're paying, what's included), 4 Check (free: HIN check, quick walk-around, lien check, questions for the seller, title photo check after paying), 5 Documents ($29.99 unlocks the papers: their state's bill of sale or ours, title signing guide, payment receipt, Boat File), 6 Closing (title and registration, deadline).
- Every step can be answered one question at a time, by voice, or as a full form.
- The deposit receipt is free, in the Price step. It says how much, the close-by date, and who gets the money back.
- Other products, mention only when they truly fit: My Boat Inspector ($59.99, or $79.99 with My Boat Closing) for a guided walkthrough, sea trial and written report. BoatClosers ($249, the $29.99 is credited) when they still need to negotiate, want a neutral party to hold a deposit, need a survey or financing contingency, or want the seller to sign online. My Boat Logs ($39.99/yr) for maintenance records after the sale.

How to answer:
- Answer first, in 2 to 5 short sentences or a few short lines. Under 120 words unless asked for detail.
- Use their purchase details. If something isn't filled in yet, say so and say which step to go to.
- End with the one next thing to do in the app when it helps.

Hard rules:
- You are an AI helper, not a lawyer, broker, title company or surveyor. General information only, never legal or tax advice. For liens, estates, title defects, disputes or unusual state rules, give the general picture and suggest the state titling office or a maritime attorney.
- BoatClosers never holds money. Never tell anyone to send money to a person or account. Warn about paying for a boat they haven't seen, and about changed payment instructions.
- Never value the boat.
- Only talk about this purchase, private boat sales and using My Boat Closing. Politely decline anything else.`

const trim = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '')
const usd = (c: number) => '$' + Math.round(c / 100).toLocaleString('en-US')

function context(deal: any, step: number) {
  const h: Handoff = deal.progress?.handoff || {}
  const items = deal.items || {}
  const has = { boat: !!items.boat, trailer: !!items.trailer, motor: !!items.motor }
  const what = Object.entries(items)
    .map(([k, v]: any) => `${k}: ${v.description || 'not described'}${v.hin ? `, HIN ${v.hin}` : ''}${v.vin ? `, VIN ${v.vin}` : ''}`)
    .join('; ')
  const dep =
    h.deposit === 'given' || h.deposit === 'planned'
      ? `${h.deposit === 'given' ? 'paid' : 'about to pay'} ${h.depositAmount ? usd(Number(h.depositAmount) * 100) : '(amount not set)'} by ${h.depositMethod || '?'} on ${h.depositDate || '?'}, close by ${h.closeBy || '?'}, if buyer backs out: ${h.depositIfBuyerOut || '?'}${depositMissing(h).length ? ` (receipt still needs ${depositMissing(h).join(', ')})` : ' (receipt ready)'}`
      : h.deposit === 'none'
        ? 'none'
        : 'not answered'
  const walk = deal.progress?.walk?.items || {}
  const flags = Object.values(walk).filter((x: any) => x?.s === 'flag').length
  return [
    `Buyer is on step ${step + 1} (${STEPS[step] || 'Vessel'}).`,
    `State of sale: ${STATE_NAMES[deal.state || 'FL'] || 'Florida'}.`,
    `Buying: ${what || 'nothing entered'}.`,
    `Seller: ${trim(deal.seller_name, 80) || 'not entered'}${h.twoSellers ? ' and a second owner' : ''}.`,
    `Agreed price: ${deal.price_cents ? usd(deal.price_cents) : 'not entered'}. Paying by: ${h.paymentMethod || 'not chosen'}. Sale date: ${h.saleDate || 'not set'}.`,
    `Deposit: ${dep}.`,
    `Titled: ${h.titledHow || 'not answered'}. Lien answer: ${h.lien || 'not answered'}.`,
    `Walk-around: ${Object.keys(walk).length} checked, ${flags} flagged. Title photo check: ${deal.progress?.titleCheck ? trim(deal.progress.titleCheck.summary, 300) : 'not done'}.`,
    `Paperwork: ${deal.status === 'paid' ? 'unlocked' : 'not unlocked yet ($29.99)'}. Missing for the papers: ${handoffProblems(h, has, deal.state || 'FL').join(' ') || 'nothing'}.`,
  ].join('\n')
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any))
  const token = String(body?.token || '')
  if (!/^[a-f0-9]{48}$/.test(token)) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'The helper isn’t available right now.' }, { status: 503 })

  const msgs = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-10)
    .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: trim(m.content, m.role === 'user' ? 1200 : 2500) }))
  while (msgs.length && msgs[0].role !== 'user') msgs.shift()
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return NextResponse.json({ error: 'Ask a question first.' }, { status: 400 })

  const { data: deal } = await supabaseAdmin
    .from('express_deals')
    .select('id,seller_name,items,price_cents,state,status,progress')
    .eq('access_token', token)
    .maybeSingle()
  if (!deal) return NextResponse.json({ error: 'Link not valid.' }, { status: 404 })

  const p: any = deal.progress || {}
  const today = new Date().toISOString().slice(0, 10)
  const count = p.askDay === today ? Number(p.askCount || 0) : 0
  if (count >= DAILY) return NextResponse.json({ error: 'That’s today’s limit for questions. Email support@boatclosers.com and a person will help.' }, { status: 429 })

  const step = Math.max(0, Math.min(5, Number(body?.step) || 0))
  let reply = ''
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res: any = await client.messages.create({
      model: MODEL(),
      max_tokens: 600,
      system: `${RULES}\n\nThis buyer's purchase:\n${context(deal, step)}`,
      messages: msgs,
    })
    reply = (res.content || []).map((c: any) => (c.type === 'text' ? c.text : '')).join('').trim()
  } catch (e) {
    console.error('express assistant failed', e)
    return NextResponse.json({ error: 'The helper didn’t answer. Try again in a moment.' }, { status: 502 })
  }

  // Re-read before writing so a save from the page in the meantime isn't lost.
  const { data: fresh } = await supabaseAdmin.from('express_deals').select('progress').eq('id', deal.id).maybeSingle()
  await supabaseAdmin
    .from('express_deals')
    .update({ progress: { ...((fresh?.progress as any) || p), askDay: today, askCount: count + 1 } })
    .eq('id', deal.id)
  return NextResponse.json({ reply: reply || 'Sorry, I don’t have an answer for that.' })
}
