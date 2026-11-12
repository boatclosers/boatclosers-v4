// Private links that let a customer's own AI (ChatGPT, Claude and others) read their deals.
// The link holds a long random secret; only its hash is stored, so a database leak can't be used to connect.
import { createHash, randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const siteUrl = () => (process.env.NEXT_PUBLIC_APP_URL || 'https://boatclosers.com').replace(/\/$/, '')
export const newToken = () => randomBytes(32).toString('base64url')
export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex')
export const connectorUrl = (t: string) => `${siteUrl()}/api/mcp/${t}`

/** The user a link belongs to, or null if unknown or turned off. */
export async function userForToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null
  const { data } = await supabaseAdmin.from('ai_links').select('id, user_id, revoked_at, last_used_at').eq('token_hash', hashToken(token)).maybeSingle()
  if (!data || data.revoked_at) return null
  if (!data.last_used_at || Date.now() - Date.parse(data.last_used_at) > 3600_000) {
    await supabaseAdmin.from('ai_links').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
  }
  return { userId: data.user_id as string }
}
