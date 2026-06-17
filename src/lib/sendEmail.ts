// Shared email helper — every notification route calls this instead of
// talking to Resend directly, so there's one place to fix if anything
// about email sending ever needs to change.

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_ADDRESS = 'BoatClosers <notifications@boatclosers.com>';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing — email not sent.');
    return { success: false, error: 'Email service not configured.' };
  }
  if (!to) {
    console.error('sendEmail called with no recipient.');
    return { success: false, error: 'No recipient email provided.' };
  }

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
        html
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
