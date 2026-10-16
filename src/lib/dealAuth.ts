// Server-only: who is calling, and are they a party to this deal?
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function callerId(req: Request): Promise<string | null> {
  const h = req.headers.get('authorization') || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return null
  try {
    const { data } = await supabaseAdmin.auth.getUser(token)
    return data?.user?.id || null
  } catch {
    return null
  }
}

// Returns the caller's user id if they are signed in and on this deal, else null.
export async function partyOf(req: Request, dealId: string): Promise<string | null> {
  const uid = await callerId(req)
  if (!uid || !dealId) return null
  const { data: deal } = await supabaseAdmin
    .from('deals')
    .select('initiator_id, other_party_id, party_a_user_id, party_b_user_id')
    .eq('id', dealId)
    .maybeSingle()
  if (!deal) return null
  return [deal.initiator_id, deal.other_party_id, deal.party_a_user_id, deal.party_b_user_id].includes(uid) ? uid : null
}
