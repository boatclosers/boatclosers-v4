import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail, emailLayout } from '@/lib/sendEmail';

// The SELLER cannot edit the buyer's offer terms, but can flag a conflict on
// schedule/dates/deposit terms by emailing the buyer a structured request to
// adjust so the deal can move forward. Uses the existing Resend wrapper.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dealId, topic, message, fromName } = body;
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

    const toRole = body?.toRole === 'seller' ? 'seller' : 'buyer';
    const fromRole = toRole === 'seller' ? 'buyer' : 'seller';
    const toEmail = deal?.parties?.[toRole]?.email;
    if (!toEmail) {
      return NextResponse.json({ error: `No ${toRole} email on this deal yet.` }, { status: 400 });
    }
    // "preSign" means the sender is being asked to sign something they want
    // changed first — a different message from a mid-negotiation conflict.
    const preSign = !!body?.preSign;
    const reviseKind = body?.kind === 'revise';

    const vesselName = deal?.vessel?.name || deal?.vessel?.make || 'your vessel';
    const topicLabel = topic === 'dates' ? 'Schedule / Dates'
      : topic === 'deposit' ? 'Deposit Terms'
      : topic === 'contingencies' ? 'Contingencies'
      : 'Deal Terms';

    const result = await sendEmail({
      to: toEmail,
      subject: reviseKind
        ? `Action needed: the ${fromRole} has asked you to revise the terms`
        : preSign
        ? `Action needed: the ${fromRole} wants a change before signing`
        : `Action needed: ${topicLabel} conflict on your BoatClosers deal`,
      html: emailLayout(`
        <h2 style="margin:0 0 12px;">${reviseKind ? `The ${fromRole} has asked you to revise the terms` : preSign ? `The ${fromRole} wants a change before signing` : 'A conflict has been flagged'}</h2>
        <p>${reviseKind
          ? `The ${fromRole} on your deal for <strong>${vesselName}</strong> has asked you to revise <strong>${topicLabel}</strong>. The offer has been reopened for editing \u2014 open the deal, change what needs changing, and send it again. Nothing has been signed or cancelled.`
          : preSign
          ? `You have signed the Purchase Agreement for <strong>${vesselName}</strong>, but the ${fromRole} has asked for a change to <strong>${topicLabel}</strong> before they sign.`
          : `The ${fromRole} on your deal for <strong>${vesselName}</strong> has raised a conflict regarding <strong>${topicLabel}</strong> and is asking you to adjust the terms so the deal can move forward.`}</p>
        ${(preSign && !reviseKind) ? `<p>Nothing has changed yet. To revise the terms, open the deal and <strong>withdraw your signature</strong> — that reopens the offer for editing, and you both re-sign once you agree.</p>` : ''}
        <p style="background:#f8fafc;border-left:3px solid #b8863a;padding:12px 14px;margin:16px 0;">
          ${(message || '').replace(/</g, '&lt;')}
        </p>
        <p>Open your deal in BoatClosers to review and update your offer terms.</p>
        <p style="color:#64748b;font-size:13px;">${fromName ? 'Sent by ' + fromName + ' (' + fromRole + ')' : 'Sent by the ' + fromRole}</p>
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
