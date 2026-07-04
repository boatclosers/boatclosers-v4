import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'

// The short link (boatclosers.com/join/BOAT-7F3K2M) lands here. We look up the
// deal by its short code, then send the person to the real invite/join page.
// Facebook following this link ends up on the invite page's boat-name preview.
export default async function JoinShortPage({ params }: { params: { code: string } }) {
  const code = params?.code || ''
  let token: string | null = null

  try {
    const sb = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { data } = await sb
      .from('deals')
      .select('invite_token')
      .eq('invite_short_code', code)
      .maybeSingle()
    token = data?.invite_token || null
  } catch (e) {
    token = null
  }

  // redirect() must be called OUTSIDE the try/catch (it works by throwing).
  if (token) {
    redirect(`/invite/${token}`)
  }
  // Unknown or expired code → send them to the home page.
  redirect('/')
}
