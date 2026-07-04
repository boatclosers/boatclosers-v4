import { createClient } from '@supabase/supabase-js'
import InviteClient from './InviteClient'

const SUPABASE_URL = 'https://xoihnmkgncuocxiknvgs.supabase.co'
const APP_URL = 'https://boatclosers.com'

// Look up ONLY the boat's year/make/model for this invite token — nothing
// sensitive — so the shared link preview can name the specific vessel.
async function getBoatName(token: string): Promise<string | null> {
  try {
    if (!token) return null
    const sb = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { data, error } = await sb
      .from('deals')
      .select('vessel')
      .eq('invite_token', token)
      .maybeSingle()
    if (error || !data) return null
    const v: any = data.vessel || {}
    const built = [v.year, v.make, v.model].filter(Boolean).join(' ')
    return built || v.name || v.makeModel || null
  } catch (e) {
    return null
  }
}

// Runs on the server when a link is shared/crawled (e.g. by Facebook), so the
// preview card can say "You're invited to close the deal on a 2020 Azimut 55".
export async function generateMetadata({ params }: { params: { token: string } }) {
  const token = params?.token || ''
  const boat = await getBoatName(token)
  const title = boat
    ? `You're invited to close the deal on a ${boat}`
    : `You're invited to close a private boat deal on BoatClosers`
  const description = 'Review the offer, sign securely, and close your boat sale online — flat fee, no broker.'
  const url = `${APP_URL}/invite/${token}`

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      siteName: 'BoatClosers',
      title,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default function Page() {
  return <InviteClient />
}
