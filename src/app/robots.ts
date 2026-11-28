import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

// This app serves two domains, so robots.txt changes with the host:
//   www.boatclosers.com/robots.txt -> points to the BoatClosers sitemap
//   myboatclosing.com/robots.txt   -> points to the My Boat Closing sitemap
// Search engines want each site's sitemap on its own domain.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') || '').toLowerCase()
  const mbc = host.includes('myboatclosing.com')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/join/', '/invite/', '/forgot-password'],
      },
    ],
    sitemap: mbc ? 'https://myboatclosing.com/sitemap.xml' : 'https://www.boatclosers.com/sitemap.xml',
  }
}
