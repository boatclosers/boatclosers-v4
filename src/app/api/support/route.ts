import { NextResponse } from 'next/server'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

// Receives a help / conflict / refund request from a user and emails it straight
// to the BoatClosers owner's inbox — with reply_to set to the customer, so you
// just hit Reply in Gmail to answer them. No AI, no forwarder in the middle.
// Override the destination anytime by setting SUPPORT_EMAIL in Vercel.
const OWNER_INBOX = process.env.SUPPORT_EMAIL || 'chupurdy@gmail.com'

export async function POST(req: Request) {
  try {
    const { name, email, dealId, role, issueType, message } = await req.json()
    if (!email || !message) {
      return NextResponse.json({ error: 'Please include your email and a description of the problem.' }, { status: 400 })
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
