import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail, emailLayout } from '@/lib/sendEmail';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { dealId, inviteEmail, userId } = await req.json();

  if (!dealId || !inviteEmail || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: deal, error: fetchError } = await supabaseAdmin
    .from('deals')
    .select('id, party_a_user_id, initiator_role, vessel, parties')
    .eq('id', dealId)
    .single();

  if (fetchError || !deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  if (deal.party_a_user_id !== userId) {
    return NextResponse.json({ error: 'Not authorized to invite for this deal' }, { status: 403 });
  }

  // The invited party is ALWAYS the opposite role of the initiator. Don't trust
  // a client-sent role — derive it from the deal so the two sides can never end
  // up with the same role (which broke negotiation: nobody could respond).
  const derivedInviteRole = (deal.initiator_role === 'seller') ? 'buyer' : 'seller';

  const token = crypto.randomBytes(32).toString('hex');

  const { error: updateError } = await supabaseAdmin
    .from('deals')
    .update({
      invite_token: token,
      invite_email: inviteEmail,
      invite_role: derivedInviteRole,
      invite_status: 'pending',
      invite_sent_at: new Date().toISOString(),
    })
    .eq('id', dealId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
  const v = deal?.vessel || {};
  const boat = [v.year, v.make, v.model].filter(Boolean).join(' ') || v.name || v.makeModel || 'a boat';
  const inviterName = (deal?.parties?.[deal.initiator_role]?.name || '').trim();
  const inviterLabel = inviterName || (deal.initiator_role === 'seller' ? 'The seller' : 'The buyer');
  const youAreLabel = derivedInviteRole === 'seller' ? 'selling' : 'buying';
  const counterpartLabel = derivedInviteRole === 'seller' ? 'buyer' : 'seller';

  const emailResult = await sendEmail({
    to: inviteEmail,
    subject: `${inviterLabel} wants to handle the ${boat} sale with you on BoatClosers`,
    html: emailLayout(`
      <h2 style="color:#08152e; font-size:19px; margin:0 0 4px;">You've been added to a boat deal</h2>
      <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
        <strong>${inviterLabel}</strong> has invited you to complete the sale of
        <strong>${boat}</strong> with them on <strong>BoatClosers</strong>, where you'll be the
        <strong>${derivedInviteRole}</strong> (the one ${youAreLabel} the boat).
      </p>
      <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
        BoatClosers is a private platform that walks a buyer and seller through a boat sale
        from start to finish &mdash; offers, the purchase agreement, deposit, signatures, and
        title transfer &mdash; for one flat fee, with no broker commission. It replaces the
        back-and-forth of texts, emails, and paperwork with one shared, organized deal.
      </p>
      <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 6px;"><strong>What happens when you click below:</strong></p>
      <ol style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 16px; padding-left:20px;">
        <li>You'll create a quick, free sign-in (just an email and password).</li>
        <li>The deal is already set up &mdash; you'll confirm your details, nothing to re-type.</li>
        <li>You and the ${counterpartLabel} negotiate, sign, and close, all in one place.</li>
      </ol>
      <p style="text-align:center; margin: 26px 0;">
        <a href="${inviteUrl}" style="background:#b8863a; color:#08152e; padding:14px 30px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">
          Open your deal &rarr;
        </a>
      </p>
      <p style="color:#94a3b8; font-size:12px; line-height:1.5;">
        If the button doesn't work, paste this link into your browser:<br/>
        <span style="color:#475569; word-break:break-all;">${inviteUrl}</span>
      </p>
      <p style="color:#94a3b8; font-size:12px; line-height:1.5;">
        Expecting to buy or sell ${boat}? This invite is for you. If this doesn't look familiar,
        you can safely ignore this email &mdash; nothing happens until you open the deal.
      </p>
    `)
  });

  if (!emailResult.success) {
    console.error('Invite email failed to send:', emailResult.error);
  }

  return NextResponse.json({ success: true, inviteUrl, token, emailSent: emailResult.success });
}
