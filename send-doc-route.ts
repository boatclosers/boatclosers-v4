import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail, emailLayout } from '@/lib/sendEmail';

// Sends a single closing document to a recipient by email, with an optional note
// and a deep-link back into the deal's Documents step so they can review, fill,
// and sign it in the app. Mirrors the lightweight pattern of the conflict route:
// looks the deal up by id for vessel context, then sends via the Resend wrapper.
export async function POST(req: Request) {
  try {
    const { dealId, to, docName, note, fromName } = await req.json();
    if (!dealId || !to) {
      return NextResponse.json({ error: 'Missing dealId or recipient email.' }, { status: 400 });
    }

    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .select('id, parties, vessel')
      .eq('id', dealId)
      .single();

    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found.' }, { status: 404 });
    }

    const v: any = deal?.vessel || {};
    const vesselName = v?.name || [v?.year, v?.make, v?.model].filter(Boolean).join(' ') || 'the vessel';
    const base = process.env.NEXT_PUBLIC_APP_URL || '';
    const link = `${base}/?dealId=${deal.id}&step=4&to=${encodeURIComponent(to)}`;
    const safeNote = String(note || '').replace(/</g, '&lt;');
    const safeDoc = String(docName || 'Document').replace(/</g, '&lt;');

    const result = await sendEmail({
      to,
      subject: `Document to review: ${safeDoc} (${vesselName})`,
      html: emailLayout(`
        <h2 style="color:#08152e; font-size:18px;">A document was shared with you</h2>
        <p style="color:#475569; font-size:14px; line-height:1.5;">
          ${fromName ? String(fromName).replace(/</g, '&lt;') + ' has' : 'Someone has'} shared a document with you on the BoatClosers deal for <strong>${vesselName}</strong>: <strong>${safeDoc}</strong>.
        </p>
        ${safeNote ? `<p style="background:#f8fafc;border-left:3px solid #b8863a;padding:12px 14px;margin:16px 0;color:#334155;font-size:13px;">${safeNote}</p>` : ''}
        <p style="color:#475569; font-size:14px; line-height:1.5;">Open the deal to review, fill in, and sign the document right in the app.</p>
        <p style="text-align:center; margin: 24px 0;">
          <a href="${link}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">Open the Documents</a>
        </p>
      `)
    });

    if (!result?.success) {
      return NextResponse.json({ error: 'Email failed: ' + (result?.error || 'unknown') }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'SERVER ERROR: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
