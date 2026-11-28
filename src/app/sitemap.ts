import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { STATE_GUIDES } from '@/lib/state-guides'
import { TOPIC_GUIDES } from '@/lib/topic-guides'

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
  'buy-used-boat-private-seller-florida',
  'texas-boat-bill-of-sale',
  'broker-vs-boatclosers-vs-diy',
  ...TOPIC_GUIDES.map((g) => g.slug),
  ...STATE_GUIDES.map((g) => g.slug),
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // myboatclosing.com is served by this same app: give it its own sitemap with
  // its own addresses (the /express pages say myboatclosing.com is their home).
  const host = ((await headers()).get('host') || '').toLowerCase()
  if (host.includes('myboatclosing.com')) {
    return [
      { url: 'https://myboatclosing.com', lastModified: now, changeFrequency: 'weekly', priority: 1 },
      { url: 'https://myboatclosing.com/help', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ]
  }

  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/hub`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/buyers-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/sellers-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/hin-check`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/found-the-boat`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/have-a-buyer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/broker-commission-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/boat-deal-checklist`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/lien-check`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...guides.map((slug) => ({
      url: `${BASE}/guides/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
