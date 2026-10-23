import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'
import { handoffProblems, whatToBring, addDays, type Handoff } from '@/lib/express/content'

// BoatClosers Express title deadline reminders.
//
// Florida gives a buyer 30 days from the sale to title and register the boat,
// and the bill of sale only works as temporary registration for those 30 days.
// Paid Express deals with sale details get two emails:
//   d21 -> 9 days left
//   d28 -> 2 days left
// Sent steps are recorded in progress.reminders, so nothing goes out twice and
// the job is safe to run at any frequency. A buyer who ticks "Title and register
// it" on the new owner checklist gets no more reminders.

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

// Today's date in Florida, as days since the epoch, to compare with the sale date.
function dayNumber(y: number, m: number, d: number) {
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000)
}
function todayInFlorida() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const [y, m, d] = parts.split('-').map(Number)
  return dayNumber(y, m, d)
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = new Date(Date.now() - 75 * 86400000).toISOString()
  const { data: deals, error } = await supabaseAdmin
    .from('express_deals')
    .select('id,access_token,buyer_name,buyer_email,items,progress')
    .eq('status', 'paid')
    .gte('paid_at', since)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = todayInFlorida()
  const results: { id: string; step: string; ok: boolean }[] = []

  for (const deal of deals || []) {
    const p: any = deal.progress || {}
    const h: Handoff = p.handoff || {}
    const has = { boat: !!(deal.items as any)?.boat, trailer: !!(deal.items as any)?.trailer, motor: !!(deal.items as any)?.motor }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(h.saleDate || '')
    if (!m || handoffProblems(h, has).length || h.lien === 'open') continue
    if (p.checks?.['n-title']) continue

    const days = today - dayNumber(Number(m[1]), Number(m[2]), Number(m[3]))
    const sent: string[] = Array.isArray(p.reminders) ? p.reminders : []
    let step: 'd21' | 'd28' | null = null
    if (days >= 28 && days <= 31 && !sent.includes('d28')) step = 'd28'
    else if (days >= 21 && days < 28 && !sent.includes('d21')) step = 'd21'
    if (!step) continue

    const due = addDays(h.saleDate!, 30)!
    const dueText = due.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    const left = Math.max(0, 30 - days)
    const what = Object.values(deal.items || {}).map((i: any) => i.description).join(', ')
    const link = `${SITE}/express/deal/${deal.access_token}`
    const bring = whatToBring(h, has)
      .map((b) => `<li style="margin-bottom:6px;">${esc(b.label)}</li>`)
      .join('')

    const r = await sendEmail({
      to: deal.buyer_email,
      context: what,
      smsText: `BoatClosers: ${left} day${left === 1 ? '' : 's'} left to title and register ${what}. Due ${dueText} at any Florida tax collector. Your filled-in forms and what to bring: ${link}`,
      subject:
        step === 'd28'
          ? `${left} day${left === 1 ? '' : 's'} left to title your ${has.boat ? 'boat' : 'purchase'}`
          : `Reminder: title your ${has.boat ? 'boat' : 'purchase'} by ${dueText}`,
      html: emailLayout(`
        <p style="font-size:15px;color:#08152e;">Hi ${esc(String(deal.buyer_name).split(' ')[0])},</p>
        <p style="font-size:15px;color:#08152e;line-height:1.6;">${
          step === 'd28'
            ? `Your 30-day window to title and register <b>${esc(what)}</b> ends <b>${esc(dueText)}</b>. After that, Florida charges a late penalty and your bill of sale stops working as temporary registration.`
            : `You have until <b>${esc(dueText)}</b> to title and register <b>${esc(what)}</b> at any Florida county tax collector’s office.`
        }</p>
        <p style="font-size:15px;color:#08152e;line-height:1.6;margin-bottom:6px;"><b>Bring:</b></p>
        <ul style="font-size:14px;color:#08152e;line-height:1.5;padding-left:20px;">${bring}</ul>
        <p style="font-size:15px;color:#08152e;line-height:1.6;">${has.boat && h.titledHow !== 'documented' ? 'Your title application is already filled in. ' : ''}Open your purchase to view or print everything.</p>
        <p style="text-align:center;margin:28px 0;"><a href="${link}" style="background:#c9962e;color:#0f1b2d;padding:14px 28px;border-radius:4px;font-weight:700;text-decoration:none;display:inline-block;">Open my purchase</a></p>
        <p style="font-size:13px;color:#64748b;line-height:1.6;">Already done? Tick “Title and register it” in step 4 and we’ll stop reminding you.</p>
      `),
    })

    if (r.success) {
      const reminders = step === 'd28' ? Array.from(new Set([...sent, 'd21', 'd28'])) : [...sent, 'd21']
      await supabaseAdmin
        .from('express_deals')
        .update({ progress: { ...p, reminders } })
        .eq('id', deal.id)
    }
    results.push({ id: deal.id, step, ok: !!r.success })
  }

  return NextResponse.json({ checked: deals?.length || 0, sent: results })
}
