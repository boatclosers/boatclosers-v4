import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail, emailLayout } from '@/lib/sendEmail';

// The SELLER cannot edit the buyer's offer terms, but can flag a conflict on
// schedule/dates/deposit terms by emailing the buyer a structured request to
// adjust so the deal can move forward. Uses the existing Resend wrapper.
export async function POST(req: Request) {
  try {
    const { dealId, topic, message, fromName } = await req.json();
    if (!dealId || !topic || !message) {
      return NextResponse.json({ error: 'Missing dealId, topic, or message.' }, { status: 400 });
    }

    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .select('parties, vessel')
      .eq('id', dealId)
      .single();

    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found.' }, { status: 404 });
    }

    const buyerEmail = deal?.parties?.buyer?.email;
    if (!buyerEmail) {
      return NextResponse.json({ error: 'No buyer email on this deal yet.' }, { status: 400 });
    }

    const vesselName = deal?.vessel?.name || deal?.vessel?.make || 'your vessel';
    const topicLabel = topic === 'dates' ? 'Schedule / Dates'
      : topic === 'deposit' ? 'Deposit Terms'
      : topic === 'contingencies' ? 'Contingencies'
      : 'Deal Terms';

    const result = await sendEmail({
      to: buyerEmail,
      subject: `Action needed: ${topicLabel} conflict on your BoatClosers deal`,
      html: emailLayout(`
        <h2 style="margin:0 0 12px;">The seller has flagged a conflict</h2>
        <p>The seller on your deal for <strong>${vesselName}</strong> has raised a conflict
        regarding <strong>${topicLabel}</strong> and is asking you to adjust your offer so the
        deal can move forward.</p>
        <p style="background:#f8fafc;border-left:3px solid #b8863a;padding:12px 14px;margin:16px 0;">
          ${(message || '').replace(/</g, '&lt;')}
        </p>
        <p>Open your deal in BoatClosers to review and update your offer terms.</p>
        <p style="color:#64748b;font-size:13px;">${fromName ? 'Sent by ' + fromName + ' (seller)' : 'Sent by the seller'}</p>
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
