import type { MetadataRoute } from 'next'

const BASE = 'https://www.boatclosers.com'

const guides = [
  'sell-a-boat-without-a-broker',
  'how-to-negotiate-boat-purchase',
  'marine-survey-what-it-covers',
  'boat-survey-came-back-bad',
  'seller-due-diligence-boat-sale',
  'documents-needed-private-boat-sale',
  'boat-deposit-and-escrow',
  'boat-bill-of-sale',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...guides.map((slug) => ({
      url: `${BASE}/guides/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
