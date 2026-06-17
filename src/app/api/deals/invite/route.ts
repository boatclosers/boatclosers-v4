import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail, emailLayout } from '@/lib/sendEmail';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { dealId, inviteEmail, inviteRole, userId } = await req.json();

  if (!dealId || !inviteEmail || !inviteRole || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: deal, error: fetchError } = await supabaseAdmin
    .from('deals')
    .select('id, party_a_user_id, vessel')
    .eq('id', dealId)
    .single();

  if (fetchError || !deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  if (deal.party_a_user_id !== userId) {
    return NextResponse.json({ error: 'Not authorized to invite for this deal' }, { status: 403 });
  }

  const token = crypto.randomBytes(32).toString('hex');

  const { error: updateError } = await supabaseAdmin
    .from('deals')
    .update({
      invite_token: token,
      invite_email: inviteEmail,
      invite_role: inviteRole,
      invite_status: 'pending',
      invite_sent_at: new Date().toISOString(),
    })
    .eq('id', dealId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
  const vesselName = deal?.vessel?.name || deal?.vessel?.makeModel || 'a vessel';

  const emailResult = await sendEmail({
    to: inviteEmail,
    subject: `You've been invited to a deal on BoatClosers`,
    html: emailLayout(`
      <h2 style="color:#08152e; font-size:18px;">You're invited to a deal</h2>
      <p style="color:#475569; font-size:14px; line-height:1.5;">
        Someone has invited you to join a private vessel transaction on BoatClosers
        for <strong>${vesselName}</strong> as the <strong>${inviteRole}</strong>.
      </p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="${inviteUrl}" style="background:#b8863a; color:#08152e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
          View the Deal
        </a>
      </p>
      <p style="color:#94a3b8; font-size:12px;">
        If you weren't expecting this, you can safely ignore this email.
