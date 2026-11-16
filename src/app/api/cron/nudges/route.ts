import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

// Friendly "finish what you started" nudges, plus one "you closed!" note.
//
// The other reminder jobs cover invites, offers, deposits, due diligence,
// signatures and title deadlines. This one fills the gaps:
//
//   My Boat Closing, started but not paid    e1 (1 day)   e2 (4 days)
//   My Boat Closing, paid, sale details blank p1 (3 days)  p2 (8 days)
//   BoatClosers deal, no offer made yet       o1 (2 days)  o2 (6 days)
//   BoatClosers deal, price agreed, unpaid    u1 (2 days)  u2 (6 days)
//   BoatClosers deal, closed                  c1 (1 day after closing, once)
//
// House rules, so nobody gets annoyed:
//   - two nudges per thing at most, then we stop for good
//   - at least 3 days between nudges, and one email per person per run
//   - it runs once a day at 10 AM Eastern
//   - the moment they finish, the nudges stop (we re-check before every send)
//   - sendEmail adds the unsubscribe link and skips anyone who opted out
// Sent steps are recorded on the deal (progress.nudges / negotiate.nudges), so
// nothing goes out twice and the job is safe to run at any frequency.

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')
const DAY = 86400000
const MIN_GAP = 3 * DAY

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
const first = (name: any) => {
  const f = String(name || '').trim().split(/\s+/)[0] || ''
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : ''
}
const hi = (name: any) => (first(name) ? `Hi ${esc(first(name))},` : 'Hi there,')

function button(href: string, label: string) {
  return `<p style="margin:22px 0;"><a href="${href}" style="background:#b8863a;color:#08152e;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">${label}</a></p>`
}
const p = (t: string) => `<p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 14px;">${t}</p>`
const small = (t: string) => `<p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:18px 0 0;">${t}</p>`

function boatName(items: any, vessel?: any) {
  if (vessel) {
    const b = [vessel.year, vessel.make, vessel.model].map((x: any) => String(x ?? '').trim()).filter(Boolean).join(' ')
    if (b) return b
  }
  const it = items || {}
  const d = it.boat?.description || it.boat?.make || it.motor?.description || it.trailer?.description
  return String(d || '').trim() || 'your boat'
}

type Step = { key: string; afterDays: number }

// The latest step that's due and not yet sent. A deal that has waited a long
// time gets one email, not a burst of every step it missed.
function dueStep(steps: Step[], sent: Record<string, number>, ageMs: number, now: number): Step | null {
  const lastSent = Math.max(0, ...Object.values(sent || {}).map(Number).filter(Number.isFinite))
  if (lastSent && now - lastSent < MIN_GAP) return null
  const due = steps.filter((s) => !sent?.[s.key] && ageMs >= s.afterDays * DAY)
  if (!due.length) return null
  const latest = due[due.length - 1]
  // Already past the last step's window by a lot? Let it go quietly.
  if (ageMs > (steps[steps.length - 1].afterDays + 10) * DAY) return null
  return latest
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ?dry=1 lists who would get what, without sending or recording anything.
  const dry = new URL(req.url).searchParams.get('dry') === '1'
  const now = Date.now()
  const emailedThisRun = new Set<string>()
  const results: { kind: string; id: string; step: string; ok: boolean }[] = []
  const canEmail = (to: string) => {
    const k = to.trim().toLowerCase()
    if (!k || emailedThisRun.has(k)) return false
    emailedThisRun.add(k)
    return true
  }

  // ---------------- My Boat Closing ----------------
  const since = new Date(now - 30 * DAY).toISOString()
  const { data: express } = await supabaseAdmin
    .from('express_deals')
    .select('id,access_token,buyer_name,buyer_email,items,status,paid_at,created_at,progress')
    .gte('created_at', since)

  for (const d of express || []) {
    const prog: any = d.progress || {}
    const sent: Record<string, number> = prog.nudges || {}
    const to = String(d.buyer_email || '')
    const link = `${SITE}/express/deal/${d.access_token}`
    const boat = boatName(d.items)
    let step: Step | null = null
    let subject = ''
    let body = ''

    if (d.status !== 'paid') {
      step = dueStep([{ key: 'e1', afterDays: 1 }, { key: 'e2', afterDays: 4 }], sent, now - Date.parse(d.created_at), now)
      if (step?.key === 'e1') {
        subject = `Your ${boat} paperwork is right where you left it`
        body =
          p(hi(d.buyer_name)) +
          p(`You started closing the deal on <strong>${esc(boat)}</strong> and got most of the way there. Your details are saved, so picking it back up takes about two minutes.`) +
          p(`Once you're in, the bill of sale and your state's title paperwork fill themselves in, and you both sign on your phones. No printer, no fax machine, no pen that only works upside down.`) +
          button(link, 'Pick up where I left off') +
          small(`Changed your mind about the boat? No hard feelings. You can ignore this.`)
      } else if (step?.key === 'e2') {
        subject = `Still buying ${boat}? (We won't ask again)`
        body =
          p(hi(d.buyer_name)) +
          p(`Quick check-in on <strong>${esc(boat)}</strong>. Your closing is saved and ready whenever you are.`) +
          p(`If the deal is still on, it's worth finishing before the money changes hands. That's when a proper bill of sale and a clean title check protect you most.`) +
          button(link, 'Finish my closing') +
          small(`This is the last reminder we'll send about this boat. Fair winds either way.`)
      }
    } else {
      const h: any = prog.handoff || {}
      if (!h.saleDate && d.paid_at) {
        step = dueStep([{ key: 'p1', afterDays: 3 }, { key: 'p2', afterDays: 8 }], sent, now - Date.parse(d.paid_at), now)
        if (step?.key === 'p1') {
          subject = `${boat}: one form away from done`
          body =
            p(hi(d.buyer_name)) +
            p(`Your paperwork for <strong>${esc(boat)}</strong> is unlocked and waiting. Add the sale date and a few details, and your bill of sale and title forms fill in for you.`) +
            p(`Meeting the seller soon? Do it before you go, so you're signing at the dock instead of typing at the dock.`) +
            button(link, 'Finish my paperwork') +
            small(`Already handled it some other way? You can ignore this.`)
        } else if (step?.key === 'p2') {
          subject = `Your ${boat} paperwork misses you`
          body =
            p(hi(d.buyer_name)) +
            p(`Your closing for <strong>${esc(boat)}</strong> still needs the sale details. It takes a few minutes, and it's the part that gets the title moving into your name.`) +
            button(link, 'Add the sale details') +
            small(`Last reminder from us on this one. Your link keeps working whenever you need it.`)
        }
      }
    }

    if (!step || !body || !to || !canEmail(to)) continue
    // Re-check right before sending, in case they finished a moment ago.
    const { data: fresh } = await supabaseAdmin.from('express_deals').select('status,progress').eq('id', d.id).maybeSingle()
    if (!fresh) continue
    if (step.key.startsWith('e') && fresh.status === 'paid') continue
    if (step.key.startsWith('p') && (fresh.progress as any)?.handoff?.saleDate) continue

    if (dry) { results.push({ kind: 'express', id: d.id, step: step.key, ok: true }); continue }
    const r = await sendEmail({ to, subject, html: emailLayout(body), context: `nudge:${step.key}` }).catch(() => ({ success: false }))
    const progress = { ...((fresh.progress as any) || {}), nudges: { ...(((fresh.progress as any) || {}).nudges || {}), [step.key]: now } }
    await supabaseAdmin.from('express_deals').update({ progress }).eq('id', d.id)
    results.push({ kind: 'express', id: d.id, step: step.key, ok: !!(r as any).success })
  }

  // ---------------- BoatClosers deals ----------------
  const { data: deals } = await supabaseAdmin
    .from('deals')
    .select('id,created_at,updated_at,initiator_id,initiator_role,paid,finalized_at,vessel,parties,negotiate')
    .gte('created_at', new Date(now - 120 * DAY).toISOString())

  for (const deal of deals || []) {
    const neg: any = deal.negotiate || {}
    if (neg.canceled) continue
    const sent: Record<string, number> = neg.nudges || {}
    const boat = boatName(null, deal.vessel)
    const dealLink = `${SITE}/?dealId=${encodeURIComponent(deal.id)}`
    const role = deal.initiator_role === 'seller' ? 'seller' : 'buyer'
    const other = role === 'seller' ? 'buyer' : 'seller'
    const parties: any = deal.parties || {}

    let initiatorEmail = String(parties?.[role]?.email || '').trim()
    let initiatorName = String(parties?.[role]?.name || '').trim()
    if ((!initiatorEmail || !initiatorName) && deal.initiator_id) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('full_name,email').eq('id', deal.initiator_id).maybeSingle()
      initiatorEmail = initiatorEmail || String(prof?.email || '')
      initiatorName = initiatorName || String(prof?.full_name || '')
    }

    const closed = !!(deal.finalized_at || neg.dealFinalized)
    const offers = Array.isArray(neg.offers) ? neg.offers : []
    const agreed = !!(neg.priceAgreed || neg.agreedPrice || neg.agreedOfferId)

    // Closed: one congratulations note to each side, the day after.
    if (closed) {
      if (sent.c1) continue
      const closedAt = Date.parse(String(deal.finalized_at || '')) || 0
      if (!closedAt || now - closedAt < DAY || now - closedAt > 21 * DAY) continue
      const people = [
        { email: String(parties?.buyer?.email || ''), name: parties?.buyer?.name, isBuyer: true },
        { email: String(parties?.seller?.email || ''), name: parties?.seller?.name, isBuyer: false },
      ].filter((x) => x.email)
      let any = false
      if (dry) { results.push({ kind: 'deal', id: deal.id, step: 'c1', ok: true }); continue }
      for (const who of people) {
        if (!canEmail(who.email)) continue
        const body = who.isBuyer
          ? p(hi(who.name)) +
            p(`Congratulations, <strong>${esc(boat)}</strong> is yours. No broker, no 10% commission, and a closing file you can actually find later. Not bad for a day's work.`) +
            p(`One tip from the dock: the next owner will pay more for a boat with a service history. <a href="https://myboatlogs.com" style="color:#08152e;font-weight:600;">My Boat Logs</a> keeps every oil change, receipt and repair in one place, starting now. Free for 14 days.`) +
            button('https://myboatlogs.com', 'Start my boat’s log') +
            p(`And if anything about the closing could have been smoother, just reply to this email. A real person reads every one.`) +
            small(`Your deal file stays in your BoatClosers account: <a href="${dealLink}" style="color:#94a3b8;">open it here</a>.`)
          : p(hi(who.name)) +
            p(`Congratulations on selling <strong>${esc(boat)}</strong>, and on keeping the commission in your pocket where it belongs.`) +
            p(`Your signed documents and the full deal file stay in your account in case you ever need them.`) +
            button(dealLink, 'Open my deal file') +
            p(`Got a minute? Reply and tell us how it went. A real person reads every one, and it helps us make the next closing even easier.`) +
            small(`Buying your next one? We'll be here.`)
        const r = await sendEmail({
          to: who.email,
          subject: who.isBuyer ? `You did it. ${boat} is officially yours` : `Sold! Congrats on closing ${boat}`,
          html: emailLayout(body),
          context: 'nudge:c1',
        }).catch(() => ({ success: false }))
        any = any || !!(r as any).success
      }
      await saveDealNudge(deal.id, 'c1', now)
      results.push({ kind: 'deal', id: deal.id, step: 'c1', ok: any })
      continue
    }

    if (!initiatorEmail) continue
    let step: Step | null = null
    let subject = ''
    let body = ''

    if (!offers.length && !agreed) {
      step = dueStep([{ key: 'o1', afterDays: 2 }, { key: 'o2', afterDays: 6 }], sent, now - Date.parse(deal.created_at), now)
      if (step?.key === 'o1') {
        subject = `${boat}: your deal room is ready when you are`
        body =
          p(hi(initiatorName)) +
          p(`You set up a deal room for <strong>${esc(boat)}</strong>. The next step is the fun one: ${role === 'buyer' ? 'make your offer' : 'set your price and terms'}.`) +
          p(`Price, deposit, survey and sea trial, all in one offer the ${other} can accept or counter. It takes about five minutes, and you can't break anything.`) +
          button(dealLink, role === 'buyer' ? 'Make my offer' : 'Set my terms') +
          small(`Deal fell through? Happens to the best of us. You can ignore this.`)
      } else if (step?.key === 'o2') {
        subject = `Is ${boat} still on the menu?`
        body =
          p(hi(initiatorName)) +
          p(`Your deal room for <strong>${esc(boat)}</strong> is still waiting for its first offer. Everything you entered is saved.`) +
          p(`Good boats don't sit forever. If you're still in, now's a good time to put your terms on paper.`) +
          button(dealLink, 'Open my deal room') +
          small(`This is the last nudge we'll send about this deal.`)
      }
    } else if (agreed && !deal.paid) {
      const agreedAge = now - (Date.parse(String(deal.updated_at || deal.created_at)) || now)
      step = dueStep([{ key: 'u1', afterDays: 2 }, { key: 'u2', afterDays: 6 }], sent, agreedAge, now)
      if (step?.key === 'u1') {
        subject = `${boat}: you agreed on a price. Nice!`
        body =
          p(hi(initiatorName)) +
          p(`You and the ${other} agreed on a price for <strong>${esc(boat)}</strong>. That's the hard part, honestly.`) +
          p(`Next up: lock it in. One flat $249 unlocks the deposit, due diligence and every closing document for both of you. No percentage, no surprises.`) +
          button(dealLink, 'Lock in my deal') +
          small(`Questions first? Just reply to this email.`)
      } else if (step?.key === 'u2') {
        subject = `${boat}: don't leave your deal on the dock`
        body =
          p(hi(initiatorName)) +
          p(`Your agreed deal on <strong>${esc(boat)}</strong> is still waiting to be locked in. Until it is, there's no deposit holding the boat for you.`) +
          button(dealLink, 'Lock in my deal') +
          small(`Last reminder from us on this one.`)
      }
    }

    if (!step || !body || !canEmail(initiatorEmail)) continue
    const { data: fresh } = await supabaseAdmin.from('deals').select('paid,finalized_at,negotiate').eq('id', deal.id).maybeSingle()
    if (!fresh || fresh.finalized_at || (fresh.negotiate as any)?.canceled) continue
    const fn: any = fresh.negotiate || {}
    if (step.key.startsWith('o') && ((fn.offers || []).length || fn.priceAgreed)) continue
    if (step.key.startsWith('u') && fresh.paid) continue

    if (dry) { results.push({ kind: 'deal', id: deal.id, step: step.key, ok: true }); continue }
    const r = await sendEmail({ to: initiatorEmail, subject, html: emailLayout(body), context: `nudge:${step.key}` }).catch(() => ({ success: false }))
    await saveDealNudge(deal.id, step.key, now)
    results.push({ kind: 'deal', id: deal.id, step: step.key, ok: !!(r as any).success })
  }

  return NextResponse.json({ ok: true, dry, count: results.length, results })
}

async function saveDealNudge(id: string, key: string, at: number) {
  const { data } = await supabaseAdmin.from('deals').select('negotiate').eq('id', id).maybeSingle()
  const neg: any = data?.negotiate || {}
  await supabaseAdmin.from('deals').update({ negotiate: { ...neg, nudges: { ...(neg.nudges || {}), [key]: at } } }).eq('id', id)
}
