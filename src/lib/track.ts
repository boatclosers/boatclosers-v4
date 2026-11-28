// Counts a sale in Google Analytics and, once it's set up, in Google Ads, so
// ads can be judged by real paying customers instead of clicks.
//
// Google Ads stays OFF until these are set in Vercel (Settings > Environment
// Variables), then redeploy:
//   NEXT_PUBLIC_GOOGLE_ADS_ID              e.g. AW-123456789
//   NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOATCLOSERS  the "BoatClosers purchase" conversion label
//   NEXT_PUBLIC_GOOGLE_ADS_LABEL_MBC          the "My Boat Closing purchase" conversion label
// Google Analytics (already on the site) gets a standard "purchase" event either way.

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''

const LABELS: Record<string, string> = {
  boatclosers: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOATCLOSERS || '',
  mbc: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_MBC || '',
}

const NAMES: Record<string, string> = { boatclosers: 'BoatClosers', mbc: 'My Boat Closing' }

type Product = 'boatclosers' | 'mbc'

// `done` always runs (once), even if tracking is blocked, so it never holds up the customer.
export function trackPurchase(p: { product: Product; value: number; id: string }, done?: () => void) {
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    done?.()
  }
  try {
    const w = window as any
    // Count each payment once, even if the page is refreshed.
    const key = `bc_tracked_${p.product}_${p.id}`
    if (!w.gtag || sessionStorage.getItem(key)) return finish()
    sessionStorage.setItem(key, '1')
    const common = { value: p.value, currency: 'USD', transaction_id: p.id }
    w.gtag('event', 'purchase', { ...common, items: [{ item_name: NAMES[p.product], price: p.value, quantity: 1 }] })
    const label = LABELS[p.product]
    if (GOOGLE_ADS_ID && label) {
      w.gtag('event', 'conversion', { ...common, send_to: `${GOOGLE_ADS_ID}/${label}`, event_callback: finish })
    }
  } catch {}
  setTimeout(finish, done ? 700 : 0)
}
