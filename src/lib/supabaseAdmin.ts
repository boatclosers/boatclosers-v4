import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Correct project URL — baked in so it can never be mistyped in env vars again.
const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

// The admin (service-role) client is created LAZILY, on first use, rather than at
// module load. The service-role key only needs to exist at RUNTIME, inside a
// request handler. Building the client at import time meant any build environment
// without SUPABASE_SERVICE_ROLE_KEY set — e.g. Vercel Preview deployments, where
// the key is scoped to Production — crashed the build during "Collecting page
// data" with "supabaseKey is required". Deferring creation lets the build succeed;
// the key is read only when a route actually runs (where it is present).
let _client: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _client
}

// Exposed as a Proxy so every existing call site keeps working unchanged
// (`supabaseAdmin.from(...)`, `supabaseAdmin.auth`, `supabaseAdmin.storage`, …):
// each property access resolves against the real client, which is created on the
// first touch — never during import/build.
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client as any, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export const SUPABASE_PROJECT_URL = SUPABASE_URL
