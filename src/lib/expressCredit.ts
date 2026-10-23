// Server-only: a paid BoatClosers Express purchase is worth $29.99 off the $249 fee, once,
// for the same email. The credit is chosen at checkout and claimed when Stripe
// confirms payment, so an abandoned checkout never uses it up.
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const EXPRESS_CREDIT_CENTS = 2999

export async function findExpressCredit(email: string | null | undefined): Promise<string | null> {
  const e = String(email || '').trim().toLowerCase()
  if (!e) return null
  const { data } = await supabaseAdmin
    .from('express_deals')
    .select('id')
    .ilike('buyer_email', e)
    .eq('status', 'paid')
    .is('credit_used_deal_id', null)
    .order('paid_at', { ascending: true })
    .limit(1)
  return data?.[0]?.id || null
}

export async function claimExpressCredit(expressId: string | null | undefined, dealId: string) {
  if (!expressId || !dealId) return
  try {
    await supabaseAdmin
      .from('express_deals')
      .update({ credit_used_deal_id: dealId, credit_used_at: new Date().toISOString() })
      .eq('id', expressId)
      .is('credit_used_deal_id', null)
  } catch (e) {
    console.error('express credit claim failed:', e)
  }
}
