import type { Metadata } from 'next'
import Script from 'next/script'

const GA_ID = 'G-TSE5VMCK7N'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.boatclosers.com'),
  title: {
    default: 'BoatClosers — Buy or Sell a Boat Without a Broker',
    template: '%s · BoatClosers',
  },
  description:
    'Buy or sell a boat privately without a broker. Deposit-backed offers, secure escrow, and 56 professional documents — from the purchase agreement and bill of sale to title-transfer paperwork. Flat $249, no commission.',
  keywords: [
    'sell a boat without a broker',
    'buy a boat without a broker',
    'private boat sale',
    'boat bill of sale',
    'boat purchase agreement',
    'boat title transfer',
    'boat closing documents',
    'boat sale paperwork',
    'boat escrow',
    'USCG documented vessel transfer',
    'how to sell a boat privately',
    'inherited boat sale',
  ],
  authors: [{ name: 'BoatClosers' }],
  creator: 'BoatClosers',
  applicationName: 'BoatClosers',
  alternates: {
    canonical: 'https://www.boatclosers.com',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.boatclosers.com',
    siteName: 'BoatClosers',
    title: 'Buy or Sell a Boat Without a Broker — BoatClosers',
    description:
      'The complete private boat sale, done right: deposit-backed offers, secure escrow, and 56 professional documents. Flat $249, no broker, no commission.',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BoatClosers — Buy or Sell a Boat Without a Broker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy or Sell a Boat Without a Broker — BoatClosers',
    description:
      'Deposit-backed offers, secure escrow, and 56 professional documents for a private boat sale. Flat $249, no commission.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Google Analytics 4. Loaded with afterInteractive so it never blocks
            first paint — the deal flow renders before analytics touches the page. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
