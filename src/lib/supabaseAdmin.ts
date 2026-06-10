import { createClient } from '@supabase/supabase-js'

// Correct project URL — baked in so it can never be mistyped in env vars again.
const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

// Service role key is read from Vercel env (server-only, never exposed to browser).
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Admin client — full access, used only inside server API routes.
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export const SUPABASE_PROJECT_URL = SUPABASE_URL
