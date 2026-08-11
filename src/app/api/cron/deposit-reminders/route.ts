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
      // docs_data carries signedDocs, which the stalled-signature nudge reads.
      .select('id, vessel, parties, negotiate, docs_data, invite_role, invite_email, other_party_id, initiator_role')

    if (error) {
      return NextResponse.json({ error: 'Could not read deals: ' + error.message }, { status: 500 })
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || ''

    // ── Pass 1: the Purchase Agreement is signed but the fee hasn't been paid ──
    // Nothing moves until it is — no due diligence, no documents, no closing — and
    // the deal just sits there silently. These nudges are deliberately gentle and
    // finite: three over a week, then we stop rather than nag forever.
    const PAY_STEPS = [
      { key: 'p1', afterHours: 24,  tone: 'Your deal is ready — one step left' },
      { key: 'p2', afterHours: 72,  tone: 'Your boat deal is still waiting on you' },
      { key: 'p3', afterHours: 168, tone: 'Last reminder about your boat deal' },
    ]

    // Escrow.com background auto-verify. If a deal's Escrow.com transaction is
    // funded but the deal isn't verified yet, confirm it here — so a deposit that
    // lands overnight advances the deal without anyone opening the app. Same
    // server-side, tamper-proof confirmation as the on-open check, just unattended.
    const escBase = process.env.ESCROW_API_BASE || 'https://api.escrow-sandbox.com'
    const escEmail = process.env.ESCROW_API_EMAIL || ''
    const escKey = process.env.ESCROW_API_KEY || ''
    const escFundedStates = ['secured','in_dispute','dispute','closed','completed','shipped','received','accepted','in_progress','inspection']

    // ── Offer expiry ────────────────────────────────────────────────────────
    // The expiry is what RELEASES the seller. Without it a buyer can tie up a boat
    // indefinitely at no cost. Two things happen here: a warning when a quarter of
    // the window is left, and the lapse itself — which frees the seller to take
    // another offer and invites the buyer to send a fresh one. Neither ends the deal.
    const offerEmail = (deal: any, role: 'buyer' | 'seller') => {
      const p = deal?.parties || {}
      return role === 'buyer' ? p.buyer?.email : p.seller?.email
    }

    for (const deal of deals || []) {
      const neg = deal?.negotiate || {}

      // ── offer expiry: warning, then lapse ──
      if (!neg.canceled && !neg.dealFinalized && Array.isArray(neg.offers) && neg.offers.length) {
        const boat = [deal?.vessel?.year, deal?.vessel?.make, deal?.vessel?.model].filter(Boolean).join(' ') || 'your boat'
        const link = `${base}/?dealId=${encodeURIComponent(String(deal.id))}`
        let changed = false
        const offers = neg.offers.map((o: any) => {
          if (!o || o.status !== 'pending' || !o.expiresAt) return o
          const from = o.from === 'seller' ? 'seller' : 'buyer'
          const other = from === 'seller' ? 'buyer' : 'seller'
          const total = Number(o.expiresHours || 0) * 3600000
          const left = Number(o.expiresAt) - now

          // Lapsed.
          if (left <= 0) {
            changed = true
            const seller = offerEmail(deal, 'seller')
            const buyer = offerEmail(deal, 'buyer')
            const sellerIsSender = from === 'seller'
            // The party who SENT it is told it lapsed; the party who received it is
            // released. Which is which depends on who made the offer.
            if (buyer) sendEmail({
              to: buyer,
              subject: `${boat} — the offer has expired`,
              html: emailLayout(`
                <h2 style="margin:0 0 12px;color:#08152e;font-size:19px;">The offer has expired</h2>
                <p style="color:#475569;font-size:14px;line-height:1.6;">${sellerIsSender
                  ? `The seller's offer on <strong>${boat}</strong> has passed its deadline and can no longer be accepted.`
                  : `Your offer on <strong>${boat}</strong> has passed its deadline and can no longer be accepted. The boat is no longer held for you.`}</p>
                <p style="color:#475569;font-size:14px;line-height:1.6;">Nothing has been cancelled. ${sellerIsSender
                  ? 'You can send an offer of your own, or ask them to send a fresh one.'
                  : 'If you are still interested, send a new offer — the deal is still open.'}</p>
                <p style="margin:18px 0;"><a href="${link}" style="background:#08152e;color:#fff;text-decoration:none;padding:11px 22px;border-radius:6px;font-size:14px;font-weight:700;display:inline-block;">Open the deal</a></p>
              `),
            }).catch(() => {})
            if (seller) sendEmail({
              to: seller,
              subject: `${boat} — the offer expired, you are free to consider others`,
              html: emailLayout(`
                <h2 style="margin:0 0 12px;color:#08152e;font-size:19px;">The offer has expired</h2>
                <p style="color:#475569;font-size:14px;line-height:1.6;">${sellerIsSender
                  ? `Your offer on <strong>${boat}</strong> has passed its deadline. It can no longer be accepted.`
                  : `The buyer's offer on <strong>${boat}</strong> has passed its deadline without being accepted. <strong>Your boat is no longer held</strong> — you are free to consider other offers.</p><p style="color:#475569;font-size:14px;line-height:1.6;">Nothing has been cancelled. If you would still like to sell to this buyer, they can send a fresh offer.`}</p>
                <p style="margin:18px 0;"><a href="${link}" style="background:#08152e;color:#fff;text-decoration:none;padding:11px 22px;border-radius:6px;font-size:14px;font-weight:700;display:inline-block;">Open the deal</a></p>
              `),
            }).catch(() => {})
            results.push({ deal: deal.id, offerExpired: o.id })
            return { ...o, status: 'expired', expiredAt: now }
          }

          // A quarter of the window left — one warning, never repeated.
          if (total > 0 && left <= total / 4 && !o.expiryWarned) {
            changed = true
            const to = offerEmail(deal, other as 'buyer' | 'seller')
            const hrs = Math.max(1, Math.round(left / 3600000))
            if (to) sendEmail({
              to,
              subject: `${boat} — the offer expires in about ${hrs} hour${hrs === 1 ? '' : 's'}`,
              html: emailLayout(`
                <h2 style="margin:0 0 12px;color:#08152e;font-size:19px;">The offer is about to expire</h2>
                <p style="color:#475569;font-size:14px;line-height:1.6;">The ${from}'s offer on <strong>${boat}</strong> expires in about <strong>${hrs} hour${hrs === 1 ? '' : 's'}</strong>. After that it can no longer be accepted.</p>
                <p style="color:#475569;font-size:14px;line-height:1.6;">No rush if you are still thinking — nothing is cancelled when it lapses, and a new offer can be sent at any time.</p>
                <p style="margin:18px 0;"><a href="${link}" style="background:#08152e;color:#fff;text-decoration:none;padding:11px 22px;border-radius:6px;font-size:14px;font-weight:700;display:inline-block;">Open the deal</a></p>
              `),
            }).catch(() => {})
            results.push({ deal: deal.id, offerExpiryWarned: o.id })
            return { ...o, expiryWarned: now }
          }
          return o
        })
        if (changed) {
          const nn = { ...neg, offers }
          await sb.from('deals').update({ negotiate: nn }).eq('id', deal.id)
          Object.assign(neg, nn)
        }
      }

      // ── stalled signature: one side signed, the other hasn't noticed ──
      // The app knows the deal is waiting on someone; nobody tells them. Named and
      // specific, twice, then it stops — a third email is nagging, and a person who
      // has gone quiet has a reason.
      const SIG_STEPS = [
        { key: 's1', afterHours: 24 },
        { key: 's2', afterHours: 72 },
      ]
      if (!neg.canceled && !neg.dealFinalized && deal?.other_party_id) {
        const signed: any = (deal as any)?.docs_data?.signedDocs || {}
        const mine: Array<[string, any]> = Object.entries(signed)
          .filter(([, v]: any) => v && v.role && v.at) as Array<[string, any]>
        if (mine.length) {
          const latest = mine.reduce((a: any, b: any) => (Number(b[1].at) > Number(a[1].at) ? b : a))
          const lastRole = latest[1].role === 'seller' ? 'seller' : 'buyer'
          const waitingOn = lastRole === 'seller' ? 'buyer' : 'seller'
          const waitingEmail = offerEmail(deal, waitingOn as 'buyer' | 'seller')
          const signerName = (deal?.parties?.[lastRole]?.name) || `the ${lastRole}`
          const since = Number(latest[1].at) || 0
          const sentMap = neg.sigNudges || {}
          const boat2 = [deal?.vessel?.year, deal?.vessel?.make, deal?.vessel?.model].filter(Boolean).join(' ') || 'your boat'
          const link2 = `${base}/?dealId=${encodeURIComponent(String(deal.id))}&step=4`
          for (const step of SIG_STEPS) {
            if (sentMap[step.key]) continue
            if (!since || now - since < step.afterHours * 3600000) continue
            // Only chase if the other side still has not signed anything since.
            const theirs = mine.some(([, v]: any) => v.role === waitingOn && Number(v.at) > since)
            if (theirs) break
            if (waitingEmail) {
              await sendEmail({
                to: waitingEmail,
                subject: `${boat2} — waiting on your signature`,
                html: emailLayout(`
                  <h2 style="margin:0 0 12px;color:#08152e;font-size:19px;">The deal is waiting on you</h2>
                  <p style="color:#475569;font-size:14px;line-height:1.6;"><strong>${signerName}</strong> signed their side of the paperwork for <strong>${boat2}</strong>. Yours is still outstanding, and the deal cannot move on until both of you have signed.</p>
                  <p style="color:#475569;font-size:14px;line-height:1.6;">It only takes a minute — open the deal and sign what is left.</p>
                  <p style="margin:18px 0;"><a href="${link2}" style="background:#08152e;color:#fff;text-decoration:none;padding:11px 22px;border-radius:6px;font-size:14px;font-weight:700;display:inline-block;">Open your documents</a></p>
                `),
              }).catch(() => {})
            }
            const nn2 = { ...neg, sigNudges: { ...sentMap, [step.key]: now } }
            await sb.from('deals').update({ negotiate: nn2 }).eq('id', deal.id)
            Object.assign(neg, nn2)
            results.push({ deal: deal.id, signatureNudge: step.key, waitingOn })
            break
          }
        }
      }

      // ── background escrow auto-verify ──
      if (escEmail && escKey && neg.escrowPath === 'escrow_com' && neg.escrowTxId
          && neg.depositVerification?.status !== 'confirmed' && !neg.depositEnded && !neg.canceled) {
        try {
          const escAuth = 'Basic ' + Buffer.from(`${escEmail}:${escKey}`).toString('base64')
          const er = await fetch(`${escBase}/2017-09-01/transaction/${String(neg.escrowTxId)}`, {
            method: 'GET', headers: { Authorization: escAuth, Accept: 'application/json' }, cache: 'no-store',
          })
          if (er.ok) {
            const etx = await er.json().catch(() => null)
            const estate = String(etx?.status?.transaction || etx?.status?.state || '').toLowerCase()
            if (escFundedStates.some(s => estate.includes(s))) {
              const nn = { ...neg, depositVerification: {
                status: 'confirmed', at: Date.now(), by: 'escrow_com_api',
                note: `Automatically confirmed by Escrow.com — transaction #${neg.escrowTxId} is funded.`,
                sig: 'Escrow.com (verified via API)', auto: true,
              } }
              await sb.from('deals').update({ negotiate: nn }).eq('id', deal.id)
              results.push({ deal: deal.id, escrowAutoVerified: true })
              // Use the freshly-verified neg for the rest of this iteration.
              Object.assign(neg, nn)
            }
          }
        } catch { /* a status check failing must never break the reminder run */ }
      }

      const offersList = Array.isArray(neg.offers) ? neg.offers : []
      const agreed = offersList.find((o: any) => o.status === 'agreed')
      const paSigned = !!(agreed && agreed.paBuyerSig && agreed.paSellerSig)
      const unpaid = !neg.paid && !neg.dealLocked

      if (paSigned && unpaid && !neg.canceled && deal.other_party_id) {
        const pr = neg.payReminder || {}
        // The cron records when it first saw this state, so no schema change is
        // needed to know how long a deal has been sitting unpaid.
        const firstSeen = Number(pr.firstSeen) || now
        const sentPay: string[] = Array.isArray(pr.sent) ? pr.sent : []
        const hoursWaiting = (now - firstSeen) / 3600000

        let duePay: { key: string; tone: string } | null = null
        for (let i = PAY_STEPS.length - 1; i >= 0; i--) {
          const s = PAY_STEPS[i]
          if (hoursWaiting >= s.afterHours && !sentPay.includes(s.key)) { duePay = s; break }
        }

        const initiatorRole = deal.initiator_role === 'seller' ? 'seller' : 'buyer'
        let payerEmail = deal?.parties?.[initiatorRole]?.email
        if (!payerEmail && deal.invite_role && deal.invite_role !== initiatorRole) {
          // initiator is whichever side wasn't invited
          payerEmail = deal?.parties?.[initiatorRole]?.email
        }

        if (!pr.firstSeen || duePay) {
          if (duePay && payerEmail) {
            const vv = deal?.vessel || {}
            const boatName = [vv.year, vv.make, vv.model].filter(Boolean).join(' ') || vv.name || 'Your boat'
            const price = agreed?.amount ? Number(agreed.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : ''
            await sendEmail({
              to: payerEmail,
              subject: `${boatName} — ${duePay.tone}`,
              html: emailLayout(`
                <h2 style="color:#08152e; font-size:18px;">Both of you have signed &mdash; the deal just needs unlocking</h2>
                <p style="color:#475569; font-size:14px; line-height:1.6;">
                  You and the other party have both signed the Purchase Agreement for
                  <strong>${boatName}</strong>${price ? ` at <strong>${price}</strong>` : ''}. The last step is the
                  one-off <strong>$249</strong> platform fee, which you cover as the person who started this deal.
                </p>
                <p style="color:#475569; font-size:14px; line-height:1.6;">
                  Until it's paid, the deal is on hold for <strong>both</strong> of you &mdash; due diligence,
                  documents, and closing all stay locked. Nothing else is owed after this, and there's no
                  commission on either side.
                </p>
                <p style="text-align:center; margin: 24px 0;">
                  <a href="${base}/?dealId=${deal.id}&step=2" style="background:#b8863a; color:#08152e; padding:13px 26px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">Unlock the deal &mdash; $249 &rarr;</a>
                </p>
                <p style="color:#94a3b8; font-size:12px; line-height:1.6;">
                  Changed your mind? You don't have to do anything &mdash; nothing is charged and the deal
                  simply stays where it is. If this boat isn't happening, you can cancel it in the app so the
                  other party knows where they stand.
                </p>
              `)
            })
            results.push({ deal: deal.id, to: 'initiator', reminder: duePay.key })
          }
          await sb.from('deals').update({
            negotiate: { ...neg, payReminder: { firstSeen, sent: duePay ? [...sentPay, duePay.key] : sentPay } }
          }).eq('id', deal.id)
        }
      }

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
