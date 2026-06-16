import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { dealId, inviteEmail, inviteRole, userId } = await req.json();

  if (!dealId || !inviteEmail || !inviteRole || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: deal, error: fetchError } = await supabaseAdmin
    .from('deals')
    .select('id, party_a_user_id')
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

  return NextResponse.json({ success: true, inviteUrl, token });
}
