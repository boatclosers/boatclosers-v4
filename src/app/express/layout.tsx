import type { Metadata } from 'next'

// My Boat Closing pages install as their own app, with their own name and icon.
export const metadata: Metadata = {
  manifest: '/manifest-mbc.webmanifest',
  icons: { icon: '/icons/mbc-192.png', apple: '/icons/mbc-180.png' },
  appleWebApp: { capable: true, title: 'Boat Closing', statusBarStyle: 'default' },
}

export default function ExpressLayout({ children }: { children: React.ReactNode }) {
  return children
}
