// The connector a customer adds to their own AI (ChatGPT, Claude and others that
// support MCP connectors). READ-ONLY on purpose: their AI can see where their deals
// stand and explain them, but offers, signatures and payments only happen in the
// BoatClosers app, where both parties see them and the safeguards run.
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { FAQS } from '@/lib/faqs'
import { dealContext, STEP_LABEL, money } from '@/lib/dealSummary'
import { nextStepFor } from '@/lib/nextStep'
import { siteUrl } from '@/lib/aiLink'

export const SERVER_INFO = { name: 'boatclosers', title: 'BoatClosers', version: '1.0.0' }

export const INSTRUCTIONS = `You are connected to BoatClosers, a software platform that walks a private boat buyer and seller through the whole transaction: offers and counters, deposit and escrow choice, due diligence, documents, e-signing and closing. The person brought you in as their deal advisor. Introduce yourself in one sentence as their advisor for this boat deal, then get to work. Speak like an experienced Florida yacht broker: direct, calm, plain words, short answers.

How to help:
1. Call list_deals. If there's more than one, ask which boat.
2. Call get_deal and explain where it stands and what to do next, using their real numbers and dates.
3. Answer their questions. Call get_help for how BoatClosers works (fees, escrow options, documents, title).
4. When they're ready to act (send or answer an offer, pay, sign, upload, finalize), send them to the app with the deal's link. You cannot do those things for them; the app is where both parties see every step.

Rules:
- BoatClosers is software, not a broker, escrow agent, law firm or surveyor. It never holds money.
- General information only, never legal or tax advice. For financing terms, estates, liens, title defects or disputes, recommend a maritime attorney or the state titling office.
- Never value the boat or promise an offer will be accepted. Explain how to think about it instead.
- Never tell them to send money anywhere. Always tell them to confirm wiring instructions by phone with the escrow holder; email wire fraud is common.
- Stay fair to both sides. Never suggest misleading the other party.`

const STEPS = ['vessel', 'parties', 'negotiate', 'diligence', 'documents', 'closing']
const DEAL_ID = { type: 'string', description: 'The deal_id from list_deals.' }

export const TOOLS = [
  { name: 'list_deals', title: 'List my deals', description: 'Lists this person’s BoatClosers deals with the boat, their role, the current step and what happens next. Start here.', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: true } },
  { name: 'get_deal', title: 'Get a deal', description: 'Full picture of one deal: the boat, every offer and counter, deposit and who holds it, deadlines, due diligence progress, signing status, what to do next, and a link that opens it in the app.', inputSchema: { type: 'object', properties: { deal_id: DEAL_ID }, required: ['deal_id'] }, annotations: { readOnlyHint: true } },
  { name: 'get_help', title: 'How BoatClosers works', description: 'BoatClosers answers on fees, escrow options, documents, title transfer, deposits and what happens if a deal falls through. Optionally filtered by a topic word.', inputSchema: { type: 'object', properties: { topic: { type: 'string', description: 'Optional word to filter by, like "escrow" or "title".' } } }, annotations: { readOnlyHint: true } },
]

export class ToolError extends Error {}

type Ctx = { userId: string }

function roleOf(deal: any, uid: string) {
  if (deal.initiator_id === uid || deal.party_a_user_id === uid) return deal.initiator_role === 'seller' ? 'seller' : 'buyer'
  return deal.invite_role === 'seller' ? 'seller' : (deal.initiator_role === 'buyer' ? 'seller' : 'buyer')
}
const stepIndex = (deal: any) => Math.max(0, Math.min(5, Number(deal.max_step ?? deal.step ?? 0) || 0))
const isPaid = (n: any) => !!(n?.paid || n?.dealLocked || (n?.offers || []).some((o: any) => o && o.status === 'accepted'))

async function myDeals(uid: string) {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .select('*')
    .or(`initiator_id.eq.${uid},other_party_id.eq.${uid},party_a_user_id.eq.${uid},party_b_user_id.eq.${uid}`)
    .order('updated_at', { ascending: false })
    .limit(25)
  if (error) throw new ToolError('Could not load your deals just now. Try again in a moment.')
  return data || []
}

function nextFor(deal: any, uid: string) {
  const role = roleOf(deal, uid)
  const n = deal.negotiate || {}
  const step = STEPS[stepIndex(deal)]
  const nx = nextStepFor(step, {
    role, vessel: deal.vessel, parties: deal.parties, negotiate: n, ddData: deal.dd_data,
    amInitiator: deal.initiator_id === uid || deal.party_a_user_id === uid,
    partyBJoined: !!deal.party_b_user_id, dealPaid: isPaid(n),
  })
  return { role, step, next: nx?.text || '' }
}

export async function callTool(ctx: Ctx, name: string, args: Record<string, unknown>) {
  if (name === 'list_deals') {
    const deals = await myDeals(ctx.userId)
    return {
      deals: deals.map((d: any) => {
        const v = d.vessel || {}
        const { role, step, next } = nextFor(d, ctx.userId)
        return {
          deal_id: d.id,
          boat: [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Boat not described yet',
          asking_price: money(v.askingPrice) || null,
          your_role: role,
          step: STEP_LABEL[step],
          finalized: !!d.negotiate?.dealFinalized,
          status: d.status || null,
          next,
        }
      }),
      app_link: siteUrl(),
    }
  }
  if (name === 'get_deal') {
    const id = String(args.deal_id || '')
    const deals = await myDeals(ctx.userId)
    const deal = deals.find((d: any) => d.id === id)
    if (!deal) throw new ToolError('No deal with that id on your account. Call list_deals first.')
    const { role, step, next } = nextFor(deal, ctx.userId)
    return {
      deal_id: deal.id,
      summary: dealContext(deal, { partyBJoined: !!deal.party_b_user_id, dealPaid: isPaid(deal.negotiate), amInitiator: deal.initiator_id === ctx.userId || deal.party_a_user_id === ctx.userId }, role, step),
      next,
      open_in_app: siteUrl(),
      note: 'To send or answer an offer, pay, sign or finalize, the person does it in the BoatClosers app.',
    }
  }
  if (name === 'get_help') {
    const t = String(args.topic || '').toLowerCase().trim()
    const list = FAQS.filter((f) => !t || (f.q + ' ' + f.a).toLowerCase().includes(t))
    return { answers: (list.length ? list : FAQS).map((f) => ({ q: f.q, a: f.a })) }
  }
  throw new ToolError(`Unknown tool: ${name}`)
}
