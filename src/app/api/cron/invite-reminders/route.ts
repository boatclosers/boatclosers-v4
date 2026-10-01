import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Invite reminders: the other party was invited but never joined.
//
// This is where deals die quietly. The initiator does everything right, sends the
// invite, and the other side simply never opens it. This job nudges them twice,
// then stops, and tells the initiator so they can follow up personally.
//
//   i1 (24h)  -> invited person: friendly nudge with the boat and price
//   i2 (72h)  -> invited person: final nudge
//   n1 (72h)  -> initiator: "they haven't joined yet, here's your link to resend"
//
// Every step is recorded in negotiate.inviteNudges, so nothing is ever sent twice
// and the job is safe to run at any frequency.

export const dynamic = 'force-dynamic'

const STEPS = [
  { key: 'i1', afterHours: 24, to: 'invitee' as const },
  { key: 'i2', afterHours: 72, to: 'invitee' as const },
  { key: 'n1', afterHours: 72, to: 'initiator' as const },
]

// Names and boat details are typed by users, so escape them before putting them in HTML.
const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

export async function GET(req: Request) {
  // Same protection as the deposit reminders: only Vercel's scheduler can run this.
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization') || ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const sb = admin()
  const now = Date.now()
  const results: any[] = []
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.boatclosers.com'

  try {
    const { data: deals, error } = await sb
      .from('deals')
      .select('id, created_at, initiator_id, initiator_role, invite_role, invite_email, invite_token, invite_sent_at, other_party_id, vessel, parties, negotiate')
      .is('other_party_id', null)

    if (error) {
      return NextResponse.json({ error: 'Could not read deals: ' + error.message }, { status: 500 })
    }

    for (const deal of deals || []) {
      try {
        const neg: any = deal?.negotiate || {}
        if (neg.canceled || neg.dealFinalized) continue
        if (!deal.invite_token) continue

        // The clock starts when the invite went out (or when the deal was created,
        // for share-link invites that never recorded a send time).
        const startedAt = Date.parse(String(deal.invite_sent_at || deal.created_at || '')) || 0
        if (!startedAt) continue
        const hoursWaiting = (now - startedAt) / 3600000

        const sent: any = neg.inviteNudges || {}
        const initiatorRole = deal.initiator_role === 'seller' ? 'seller' : 'buyer'
        const inviteRole = initiatorRole === 'seller' ? 'buyer' : 'seller'

        // Initiator details
        let initiatorName = String(deal?.parties?.[initiatorRole]?.name || '').trim()
        let initiatorEmail = String(deal?.parties?.[initiatorRole]?.email || '').trim()
        if ((!initiatorName || !initiatorEmail) && deal.initiator_id) {
          const { data: prof } = await sb
            .from('profiles')
            .select('full_name, email')
            .eq('id', deal.initiator_id)
            .maybeSingle()
          if (!initiatorName) initiatorName = String(prof?.full_name || '').trim()
          if (!initiatorEmail) initiatorEmail = String(prof?.email || '').trim()
        }
        const firstName = cap(initiatorName.split(/\s+/)[0] || '')

        // Invited person's email (only exists if the invite was emailed, not a shared link)
        const inviteeEmail = String(deal.invite_email || deal?.parties?.[inviteRole]?.email || '').trim()

        // Boat details for the email
        const v: any = deal?.vessel || {}
        const boat = [v.year, v.make, v.model].map((x: any) => String(x ?? '').trim()).filter(Boolean).join(' ') || 'the boat'
        const priceNum = Number(String(v.askingPrice ?? '').replace(/[^0-9.]/g, ''))
        const price = Number.isFinite(priceNum) && priceNum > 0
          ? priceNum.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
          : ''
        const inviteLink = `${base}/invite/${encodeURIComponent(String(deal.invite_token))}`
        const dealLink = `${base}/?dealId=${encodeURIComponent(String(deal.id))}&step=2`

        const newlySent: Record<string, number> = {}

        for (const step of STEPS) {
          if (sent[step.key]) continue
          if (hoursWaiting < step.afterHours) continue

          if (step.to === 'invitee') {
            // Only fire the most recent invitee step, so a deal that has been waiting
            // a long time gets one email, not a burst of two at once.
            if (step.key === 'i1' && hoursWaiting >= 72) { newlySent.i1 = now; continue }
            if (!inviteeEmail) { newlySent[step.key] = now; continue }

            const final = step.key === 'i2'
            const who = firstName || `The ${initiatorRole}`
            await sendEmail({
              to: inviteeEmail,
              subject: final
                ? `${boat} — ${who} is still waiting on you`
                : `${boat} — ${who} invited you to close the deal`,
              html: emailLayout(`
                <h2 style="margin:0 0 12px;color:#08152e;font-size:19px;">${final ? 'Your boat deal is still waiting' : 'You have a boat deal waiting'}</h2>
                <p style="color:#475569;font-size:14px;line-height:1.6;"><strong>${esc(who)}</strong> invited you to close the deal on <strong>${esc(boat)}</strong>${price ? ` (asking <strong>${esc(price)}</strong>)` : ''} as the ${inviteRole} on BoatClosers.</p>
                <p style="color:#475569;font-size:14px;line-height:1.6;">It's free for you. Create your account to see the full deal, respond to offers, and handle the paperwork, escrow and title transfer in one place.</p>
                <p style="margin:18px 0;"><a href="${inviteLink}" style="background:#b8863a;color:#08152e;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">Open the deal</a></p>
                <p style="color:#94a3b8;font-size:12px;line-height:1.6;">${final
                  ? 'This is the last reminder we will send. If this deal is not happening, you can ignore this email.'
                  : 'Not expecting this? You can ignore this email.'}</p>
              `),
            }).catch(() => {})
            newlySent[step.key] = now
            results.push({ deal: deal.id, inviteNudge: step.key })
          }

          if (step.to === 'initiator') {
            if (!initiatorEmail) { newlySent[step.key] = now; continue }
            await sendEmail({
              to: initiatorEmail,
              subject: `${boat} — the ${inviteRole} hasn't joined yet`,
              html: emailLayout(`
                <h2 style="margin:0 0 12px;color:#08152e;font-size:19px;">The ${inviteRole} hasn't joined your deal yet</h2>
                <p style="color:#475569;font-size:14px;line-height:1.6;">${firstName ? `Hi ${esc(firstName)}, it` : 'It'} has been a few days since you invited the ${inviteRole} to your deal on <strong>${esc(boat)}</strong>, and they haven't joined yet.${inviteeEmail ? ' We have sent them two reminders.' : ''}</p>
                <p style="color:#475569;font-size:14px;line-height:1.6;">A quick text or call usually does it. You can send them this link directly:</p>
                <p style="background:#f1f5f9;border-radius:6px;padding:10px 12px;font-size:13px;word-break:break-all;color:#08152e;">${esc(inviteLink)}</p>
                <p style="margin:18px 0;"><a href="${dealLink}" style="background:#08152e;color:#fff;text-decoration:none;padding:11px 22px;border-radius:6px;font-size:14px;font-weight:700;display:inline-block;">Open your deal</a></p>
              `),
            }).catch(() => {})
            newlySent[step.key] = now
            results.push({ deal: deal.id, initiatorNudge: step.key })
          }
        }

        if (Object.keys(newlySent).length) {
          const nn = { ...neg, inviteNudges: { ...sent, ...newlySent } }
          await sb.from('deals').update({ negotiate: nn }).eq('id', deal.id)
        }
      } catch { /* one bad deal must never stop reminders for the rest */ }
    }

    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), sent: results })
  } catch (e: any) {
    return NextResponse.json({ error: 'CRON ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
