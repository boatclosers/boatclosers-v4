import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

function admin() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Escalating earnest-money deposit reminders.
//
// Vercel calls this on a schedule (see vercel.json). It looks for deals where a
// deposit is owed, the clock is running, and no proof has been submitted yet —
// then emails BOTH sides with a message that gets more urgent as time runs out.
//
// Every reminder is sent AT MOST ONCE. Each deal records which thresholds it has
// already fired in negotiate.remindersSent, so this route is safe to run at any
// frequency (hourly on Vercel Pro, daily on Hobby) and safe to run twice by
// accident — nobody gets the same reminder twice.

export const dynamic = 'force-dynamic'

// Ordered most-urgent first so we only fire the single most relevant reminder
// per run, rather than a burst of stale ones if the job hasn't run in a while.
const THRESHOLDS = [
  { key: 'h1',  hours: 1,  label: '1 hour' },
  { key: 'h3',  hours: 3,  label: '3 hours' },
  { key: 'h6',  hours: 6,  label: '6 hours' },
  { key: 'h12', hours: 12, label: '12 hours' },
  { key: 'h24', hours: 24, label: '24 hours' },
  { key: 'h48', hours: 48, label: '48 hours' }
]

export async function GET(req: Request) {
  // Vercel provisions CRON_SECRET automatically and sends it as a bearer token.
  // Without this check anyone who found the URL could spam your customers.
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

  try {
    const { data: deals, error } = await sb
      .from('deals')
      .select('id, vessel, parties, negotiate, invite_role, invite_email, other_party_id')

    if (error) {
      return NextResponse.json({ error: 'Could not read deals: ' + error.message }, { status: 500 })
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || ''

    for (const deal of deals || []) {
      const neg = deal?.negotiate || {}

      // Skip anything that isn't an open, funded-pending deposit.
      if (!neg.depositDeadline) continue
      if (!(Number(neg.deposit) > 0)) continue
      if (neg.depositProof && neg.depositProof.ref) continue
      if (neg.canceled) continue
      if (!deal.other_party_id) continue

      const deadline = Number(neg.depositDeadline)
      const msLeft = deadline - now
      const sent: string[] = Array.isArray(neg.remindersSent) ? neg.remindersSent : []

      // Which reminder is due? Overdue wins; otherwise the tightest threshold
      // the clock has fallen under that hasn't been sent yet.
      let due: { key: string; label: string } | null = null
      if (msLeft <= 0) {
        if (!sent.includes('overdue')) due = { key: 'overdue', label: 'overdue' }
      } else {
        for (const t of THRESHOLDS) {
          if (msLeft <= t.hours * 3600 * 1000 && !sent.includes(t.key)) {
            due = { key: t.key, label: t.label }
            break
          }
        }
      }
      if (!due) continue

      // Recipients — same invite_email fallback the deals route uses, so a party
      // who hasn't re-typed their address into Parties still gets reminded.
      let buyerEmail = deal?.parties?.buyer?.email
      let sellerEmail = deal?.parties?.seller?.email
      if (deal.invite_role === 'buyer' && !buyerEmail) buyerEmail = deal.invite_email
      if (deal.invite_role === 'seller' && !sellerEmail) sellerEmail = deal.invite_email

      const v = deal?.vessel || {}
      const boat = [v.year, v.make, v.model].filter(Boolean).join(' ') || v.name || v.makeModel || 'Your boat'
      const amount = Number(neg.deposit).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      const dealUrl = `${base}/?dealId=${deal.id}&step=3`
      const overdue = due.key === 'overdue'
      const urgent = ['h1', 'h3', 'h6'].includes(due.key)

      const deadlineText = new Date(deadline).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
      })

      // ── Buyer: you're about to lose this boat ──
      if (buyerEmail) {
        const subject = overdue
          ? `${boat} — 🚨 Your deposit is overdue, the seller can release the boat`
          : urgent
          ? `${boat} — 🚨 ${due.label.toUpperCase()} LEFT to fund your deposit`
          : `${boat} — ⏰ ${due.label} to fund your deposit`

        await sendEmail({
          to: buyerEmail,
          subject,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:19px; margin:0 0 4px;">
              ${overdue ? 'Your deposit deadline has passed' : `${due.label} left to secure ${boat}`}
            </h2>
            <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
              ${overdue
                ? `The agreed deadline to fund your <strong>${amount}</strong> earnest-money deposit on <strong>${boat}</strong> has passed. The seller is now free to release the boat and consider other buyers.`
                : `Your <strong>${amount}</strong> earnest-money deposit on <strong>${boat}</strong> is due by <strong>${deadlineText}</strong>.`}
            </p>
            <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
              The deposit is what holds this boat off the market for you. Until it's in,
              the seller can keep taking other offers &mdash; and you can't move forward
              to closing.
            </p>
            <p style="text-align:center; margin:26px 0;">
              <a href="${dealUrl}" style="background:#b8863a; color:#08152e; padding:14px 30px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">
                ${overdue ? 'Submit your deposit proof now' : 'Submit deposit proof'} &rarr;
              </a>
            </p>
            <p style="color:#94a3b8; font-size:12px; line-height:1.5;">
              Already sent it? Just upload the confirmation on the Due Diligence step and
              this reminder stops. If you need more time, message the seller in the deal
              &mdash; they can extend the deadline.
            </p>
          `)
        })
        results.push({ deal: deal.id, to: 'buyer', reminder: due.key })
      }

      // ── Seller: heads up, be ready ──
      if (sellerEmail) {
        const subject = overdue
          ? `${boat} — Buyer's deposit is overdue, you can release the boat`
          : `${boat} — Heads up: buyer has ${due.label} to fund the deposit`

        await sendEmail({
          to: sellerEmail,
          subject,
          html: emailLayout(`
            <h2 style="color:#08152e; font-size:19px; margin:0 0 4px;">
              ${overdue ? "The buyer's deposit deadline has passed" : `Buyer has ${due.label} left to fund`}
            </h2>
            <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
              ${overdue
                ? `The buyer did not fund their <strong>${amount}</strong> earnest-money deposit on <strong>${boat}</strong> by the agreed deadline. This deal may not go through.`
                : `The buyer has until <strong>${deadlineText}</strong> to fund their <strong>${amount}</strong> earnest-money deposit on <strong>${boat}</strong>.`}
            </p>
            <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
              ${overdue
                ? `You have two clean options: give them more time, or end this deal and pursue other buyers. Nothing happens automatically &mdash; the choice is yours.`
                : `If the deposit doesn't arrive in time, this deal may fall through. It's worth lining up a backup buyer now so you're not starting from scratch. You can also give them more time if you'd rather keep this one alive.`}
            </p>
            <p style="text-align:center; margin:26px 0;">
              <a href="${dealUrl}" style="background:#b8863a; color:#08152e; padding:14px 30px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">
                Open your deal &rarr;
              </a>
            </p>
            <p style="color:#94a3b8; font-size:12px; line-height:1.5;">
              Nothing is lost while you wait &mdash; every offer, message, and signature on
              this deal stays exactly where it is.
            </p>
          `)
        })
        results.push({ deal: deal.id, to: 'seller', reminder: due.key })
      }

      // Record it so this reminder never fires twice.
      await sb
        .from('deals')
        .update({ negotiate: { ...neg, remindersSent: [...sent, due.key] } })
        .eq('id', deal.id)
    }

    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), sent: results })
  } catch (e: any) {
    return NextResponse.json({ error: 'CRON ERROR: ' + (e?.message || 'unknown') }, { status: 500 })
  }
}
