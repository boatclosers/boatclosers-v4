import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const { token, userId } = await req.json();

  if (!token || !userId) {
    return NextResponse.json({ error: 'Missing token or userId' }, { status: 400 });
  }

  const { data: deal, error: fetchError } = await supabaseAdmin
    .from('deals')
    .select('id, invite_status, invite_role, party_a_user_id, party_b_user_id')
    .eq('invite_token', token)
    .single();

  if (fetchError || !deal) {
    return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
  }

  if (deal.invite_status === 'accepted' && deal.party_b_user_id && deal.party_b_user_id !== userId) {
    return NextResponse.json({ error: 'This invite has already been claimed' }, { status: 409 });
  }

  if (deal.party_a_user_id === userId) {
    return NextResponse.json({ error: 'You cannot accept your own invite' }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('deals')
    .update({
      party_b_user_id: userId,
      invite_status: 'accepted',
      invite_accepted_at: new Date().toISOString(),
    })
    .eq('id', deal.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, dealId: deal.id, role: deal.invite_role });
}
