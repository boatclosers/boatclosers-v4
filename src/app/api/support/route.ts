import { NextResponse } from 'next/server'
import { sendEmail, emailLayout } from '@/lib/sendEmail'

// Receives a help / conflict / refund request from a user, emails it to the
// BoatClosers team, and sends the user a confirmation. No AI, no automation —
// a human reviews every request. Set SUPPORT_EMAIL in Vercel to your inbox.
export async function POST(req: Request) {
  const to = process.env.SUPPORT_EMAIL || 'support@boatclosers.com'
  try {
    const { name, email, dealId, role, issueType, message } = await req.json()
    if (!email || !message) {
      return NextResponse.json({ error: 'Please include your email and a description of the problem.' }, { status: 400 })
    }
    const type = issueType || 'General question'
    const safe = String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // 1) Send the request to the BoatClosers team.
    const teamResult = await sendEmail({
      to,
      subject: `Support / conflict request — ${type}${dealId ? ` (Deal #${dealId})` : ''}`,
      html: emailLayout(`
        <h2 style="font-size:16px;color:#08152e;margin:0 0 12px">New support request</h2>
        <p style="font-size:14px;color:#334155;margin:4px 0"><b>Type:</b> ${type}</p>
        <p style="font-size:14px;color:#334155;margin:4px 0"><b>From:</b> ${name || '—'} (${email})</p>
        <p style="font-size:14px;color:#334155;margin:4px 0"><b>Role:</b> ${role || '—'} &nbsp;·&nbsp; <b>Deal:</b> ${dealId || '—'}</p>
        <div style="margin-top:14px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;color:#222;line-height:1.6;white-space:pre-wrap">${safe}</div>
        <p style="font-size:12px;color:#64748b;margin-top:14px">Reply directly to <b>${email}</b> to respond to this person.</p>
      `)
    })
    if (!teamResult.success) {
      return NextResponse.json({ error: 'Could not send your request right now. Please try again.' }, { status: 400 })
    }

    // 2) Confirmation to the person who submitted it.
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
