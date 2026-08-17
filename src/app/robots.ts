import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/join/', '/invite/', '/forgot-password'],
      },
    ],
    sitemap: 'https://www.boatclosers.com/sitemap.xml',
  }
}
