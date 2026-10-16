import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

// Offer deadlines, hourly. When someone sends an offer with a 24/48/72-hour
// deadline:
//   soon    -> the person who has to answer: "this offer expires in about N hours"
//              (sent once, when 6 hours or less remain)
//   expired -> the person who sent it: "your offer expired, send a new one"
// Each email is recorded in public.offer_nudges, so nothing is sent twice.
// The server already refuses to accept an expired offer (deals route merge).

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SOON_HOURS = 6
const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com').replace(/\/$/, '')
  const now = Date.now()
  const since = new Date(now - 30 * 86400000).toISOString()

  const { data: deals, error } = await supabaseAdmin
    .from('deals')
    .select('id, vessel, parties, negotiate, paid, updated_at')
    .gte('updated_at', since)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const sent: any[] = []
  for (const deal of deals || []) {
    const neg: any = deal.negotiate || {}
    if (deal.paid || neg.paid || neg.dealLocked || neg.canceled || neg.dealFinalized) continue
    const offers: any[] = Array.isArray(neg.offers) ? neg.offers : []
    // Only the newest live offer matters; older ones were superseded by counters.
    const latest = [...offers].reverse().find((o) => o && (o.status === 'pending' || o.status === 'expired'))
    if (!latest?.expiresAt) continue
    const exp = Number(latest.expiresAt)
    const msLeft = exp - now
    let kind: 'soon' | 'expired' | null = null
    if (latest.status === 'pending' && msLeft > 0 && msLeft <= SOON_HOURS * 3600000) kind = 'soon'
    else if (msLeft <= 0 && now - exp < 7 * 86400000) kind = 'expired'
    if (!kind) continue

    const fromRole = latest.from === 'seller' ? 'seller' : 'buyer'
    const otherRole = fromRole === 'seller' ? 'buyer' : 'seller'
    const toRole = kind === 'soon' ? otherRole : fromRole
    const to = deal.parties?.[toRole]?.email
    if (!to || /^link-share-/i.test(to)) continue

    // Claim the nudge first; a duplicate key means it already went out.
    const { error: claimErr } = await supabaseAdmin
      .from('offer_nudges')
      .insert({ deal_id: deal.id, offer_id: String(latest.id), kind })
    if (claimErr) continue

    const v: any = deal.vessel || {}
    const boat = [v.year, v.make, v.model].filter(Boolean).join(' ') || v.name || 'the boat'
    const amount = Number(latest.amount) ? money(Number(latest.amount)) : 'the offer'
    const other = deal.parties?.[fromRole]?.name || `The ${fromRole}`
    const link = `${base}/?dealId=${encodeURIComponent(String(deal.id))}&step=2`
    const hours = Math.max(1, Math.round(msLeft / 3600000))

    const subject =
      kind === 'soon'
        ? `The ${amount} offer on the ${boat} expires in about ${hours} hour${hours === 1 ? '' : 's'}`
        : `Your ${amount} offer on the ${boat} expired`
    const body =
      kind === 'soon'
        ? `<p style="font-size:15px;color:#08152e;line-height:1.6;"><b>${esc(other)}</b> offered <b>${esc(amount)}</b> for the <b>${esc(boat)}</b>. The offer expires in about ${hours} hour${hours === 1 ? '' : 's'}. After that it can't be accepted.</p>
           <p style="font-size:15px;color:#08152e;line-height:1.6;">Accept it, counter, or let them know where you stand.</p>`
        : `<p style="font-size:15px;color:#08152e;line-height:1.6;">Your offer of <b>${esc(amount)}</b> for the <b>${esc(boat)}</b> expired without an answer, so it can no longer be accepted.</p>
           <p style="font-size:15px;color:#08152e;line-height:1.6;">If you're still interested, send a new offer. A quick message in the Deal Room often gets things moving again.</p>`
    const r = await sendEmail({
      to,
      subject,
      context: boat,
      html: emailLayout(`${body}
        <p style="text-align:center;margin:26px 0;"><a href="${link}" style="background:#b8863a;color:#08152e;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Open the Deal Room</a></p>`),
    })
    if (!r.success) {
      // Let the next run try again.
      await supabaseAdmin.from('offer_nudges').delete().eq('deal_id', deal.id).eq('offer_id', String(latest.id)).eq('kind', kind)
    }
    sent.push({ deal: deal.id, kind, ok: !!r.success })
  }
  return NextResponse.json({ checked: deals?.length || 0, sent })
}
