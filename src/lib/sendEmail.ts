// Shared email helper — every notification route calls this instead of
// talking to Resend directly, so there's one place to fix if anything
// about email sending ever needs to change.

import { getPrefs, isOptedOut, sendSms, smsFromEmail, unsubscribeUrl, type Channel } from '@/lib/comm';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_ADDRESS = 'BoatClosers <notifications@boatclosers.com>';

// Gmail groups messages from the same sender into one conversation, which buries
// the newest under the older ones — a customer opens a "3 hours left" reminder and
// reads a two-day-old notice instead. A unique X-Entity-Ref-ID on every send stops
// that grouping, so each notification lands as its own line in the inbox.
function uniqueRef() {
  return `bc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

type SendArgs = {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: string }[]
  replyTo?: string
  // Sign-in codes, receipts the person asked for, and the support desk: always
  // email, ignore channel choices and opt-outs.
  essential?: boolean
  // Text to send instead of the automatic "subject + link" when this person
  // chose texts.
  smsText?: string
  // Forward the person's text replies to this email address.
  smsForwardTo?: string
  context?: string
}

// Every notification goes through here. It honors the recipient's choice of
// email, text, or both (comm_prefs) and any opt-out (comm_optouts). If they chose
// text and texting isn't set up yet, or the text fails, they get the email.
export async function sendEmail(args: SendArgs) {
  if (args.essential) return deliverEmail(args, false)

  let channels: Channel[] = ['email']
  let phone: string | undefined
  const prefs = await getPrefs(args.to)
  if (prefs) {
    channels = prefs.channels
    phone = prefs.phone
  }

  let sentSms = false
  let smsError = ''
  if (channels.includes('sms') && phone) {
    const r = await sendSms({
      to: phone,
      body: args.smsText || smsFromEmail(args.subject, args.html),
      forwardTo: args.smsForwardTo,
      context: args.context,
    })
    sentSms = r.success
    if (!r.success) smsError = r.error || ''
  }

  // Papers can't ride along on a text, so anything with attachments is emailed too.
  const wantEmail = channels.includes('email') || !sentSms || !!args.attachments?.length
  if (wantEmail) {
    if (await isOptedOut(args.to, 'email')) {
      return sentSms ? { success: true, sentSms } : { success: false, optedOut: true, error: 'This person has opted out of BoatClosers emails.' }
    }
    const r = await deliverEmail(args, true)
    return { ...r, success: r.success || sentSms, sentSms, smsError: smsError || undefined }
  }
  return { success: sentSms, sentSms }
}

async function deliverEmail({ to, subject, html, attachments, replyTo }: SendArgs, withUnsubscribe: boolean): Promise<{ success: boolean; error?: string; optedOut?: boolean; sentSms?: boolean }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing — email not sent.');
    return { success: false, error: 'Email service not configured.' };
  }
  if (!to) {
    console.error('sendEmail called with no recipient.');
    return { success: false, error: 'No recipient email provided.' };
  }

  const unsub = withUnsubscribe ? unsubscribeUrl(to) : ''
  const body = unsub
    ? html + `<div style="max-width:480px;margin:0 auto;padding:0 24px 24px;font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;text-align:center;">Don't want these? <a href="${unsub}" style="color:#94a3b8;">Unsubscribe or switch to texts</a>.</div>`
    : html

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html: body,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments && attachments.length ? { attachments } : {}),
        headers: {
          'X-Entity-Ref-ID': uniqueRef(),
          // Lets Gmail and Apple Mail show their own one-tap Unsubscribe button.
          ...(unsub ? { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : {}),
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend send failed:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (e: any) {
    console.error('sendEmail network error:', e?.message);
    return { success: false, error: e?.message || 'Unknown email error' };
  }
}

// Wraps every email in the same simple, branded layout so we don't
// repeat this HTML in four different route files.
export function emailLayout(bodyHtml: string) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <div style="text-align:center; margin-bottom: 24px;">
      <span style="font-size: 18px; font-weight: 700; color:#08152e; letter-spacing: 1px;">BOATCLOSERS</span>
    </div>
    ${bodyHtml}
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
      BoatClosers · Private Vessel Transactions<br/>
      This is an automated notification about your deal.
    </div>
  </div>`;
}
