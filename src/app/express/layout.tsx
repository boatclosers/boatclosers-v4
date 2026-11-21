import type { Metadata } from 'next'

// My Boat Closing pages install as their own app, with their own name and icon.
export const metadata: Metadata = {
  manifest: '/manifest-mbc.webmanifest',
  icons: {
    icon: [
      { url: '/icons/mbc-favicon.ico', sizes: '48x48' },
      { url: '/icons/mbc-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/mbc-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/mbc-180.png',
  },
  appleWebApp: { capable: true, title: 'Boat Closing', statusBarStyle: 'default' },
}

export default function ExpressLayout({ children }: { children: React.ReactNode }) {
  return children
}
