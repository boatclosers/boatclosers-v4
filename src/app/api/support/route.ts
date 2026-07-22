import { NextResponse } from 'next/server'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

// Receives a help / conflict / refund request from a user and emails it straight
// to the BoatClosers owner's inbox — with reply_to set to the customer, so you
// just hit Reply in Gmail to answer them. No AI, no forwarder in the middle.
// Override the destination anytime by setting SUPPORT_EMAIL in Vercel.
const OWNER_INBOX = process.env.SUPPORT_EMAIL || 'chupurdy@gmail.com'

// ── Rate limiting ────────────────────────────────────────────────────────────
// Every submission sends TWO emails (one to the owner, one confirming to the
// sender), so an unthrottled form is a way to flood the owner's inbox and burn
// the Resend quota — and, because the confirmation goes to whatever address was
// typed, a way to bounce mail off this domain at a stranger.
//
// This is deliberately simple: an in-memory counter per serverless instance. It
// is a speed bump, not a wall — instances don't share memory, so a determined
// attacker spread across many cold starts gets more through. It stops the common
// cases (a stuck retry loop, someone leaning on the button, a naive script). If
// support spam ever becomes real, move this to a Supabase table or a captcha.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 3
const hits = new Map<string, { count: number; start: number }>()

function overLimit(key: string) {
  if (!key) return false
  const now = Date.now()
  const rec = hits.get(key)
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(key, { count: 1, start: now })
    return false
  }
  rec.count += 1
  if (rec.count > MAX_PER_WINDOW) return true
  return false
}

// Keep the map from growing forever on a long-lived instance.
function prune() {
  const now = Date.now()
  for (const [k, v] of hits) {
    if (now - v.start > WINDOW_MS) hits.delete(k)
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, dealId, role, issueType, message } = await req.json()
    if (!email || !message) {
      return NextResponse.json({ error: 'Please include your email and a description of the problem.' }, { status: 400 })
    }

    prune()
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    const tooMany = overLimit(`ip:${ip}`) || overLimit(`em:${String(email).toLowerCase().trim()}`)
    if (tooMany) {
      return NextResponse.json({
        error: "You've sent several requests in a row — we already have them. Please give us a few minutes to reply before sending another."
      }, { status: 429 })
    }

    const type = issueType || 'General question'
    const safe = String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const cust = String(email).replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // 1) Send the request to the owner — reply_to is the customer, so a Gmail
    //    "Reply" goes straight to them. Subject carries their email for search.
    const teamResult = await sendEmail({
      to: OWNER_INBOX,
      replyTo: email,
      subject: `🆘 Support: ${type} — from ${email}${dealId ? ` (Deal #${dealId})` : ''}`,
      html: emailLayout(`
        <h2 style="font-size:16px;color:#08152e;margin:0 0 12px">New support request</h2>
        <p style="font-size:14px;color:#334155;margin:4px 0"><b>Type:</b> ${type}</p>
        <p style="font-size:14px;color:#334155;margin:4px 0"><b>From:</b> ${name || '—'}</p>
        <p style="font-size:15px;color:#08152e;margin:4px 0"><b>Reply to:</b> <a href="mailto:${cust}" style="color:#b8863a;font-weight:700">${cust}</a></p>
        <p style="font-size:14px;color:#334155;margin:4px 0"><b>Role:</b> ${role || '—'} &nbsp;·&nbsp; <b>Deal:</b> ${dealId || '—'}</p>
        <div style="margin-top:14px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:15px;color:#111;line-height:1.6;white-space:pre-wrap"><b>Their message:</b><br>${safe}</div>
        <p style="font-size:13px;color:#64748b;margin-top:16px">👉 Just hit <b>Reply</b> to this email — your reply goes directly to ${cust}.</p>
      `)
    })
    if (!teamResult.success) {
      return NextResponse.json({ error: 'Could not send your request right now. Please try again.' }, { status: 400 })
    }

    // 2) Confirmation to the customer who submitted it.
    await sendEmail({
      to: email,
      subject: 'We received your request — BoatClosers',
      html: emailLayout(`
        <p style="font-size:14px;color:#334155;line-height:1.7">Thanks for reaching out. We've received your request and a member of the BoatClosers team will review it and reply to this email.</p>
        <p style="font-size:14px;color:#334155;line-height:1.7">If your issue involves a deposit or a disagreement with the other party, please keep any records handy — including the rejection notice you can print from your deal.</p>
        <p style="font-size:14px;color:#334155;line-height:1.7">— The BoatClosers Team</p>
      `)
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Could not send your request right now. Please try again.' }, { status: 500 })
  }
}
