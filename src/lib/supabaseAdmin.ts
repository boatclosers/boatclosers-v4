import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Correct project URL — baked in so it can never be mistyped in env vars again.
const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

// Admin client — full access, used only inside server API routes.
// The service role key is read from Vercel env (server-only, never exposed to the
// browser). The client is made the first time a route actually uses it, not when
// the file loads, so a build without the key (preview builds, local builds) can
// still finish. Routes behave exactly as before.
let client: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return client
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient() as any
    const v = c[prop]
    return typeof v === 'function' ? v.bind(c) : v
  },
})

export const SUPABASE_PROJECT_URL = SUPABASE_URL
