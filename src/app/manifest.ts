import type { MetadataRoute } from 'next'

// Lets people save BoatClosers to their phone's home screen and open it like an app.
// My Boat Closing has its own manifest (public/manifest-mbc.webmanifest, set in src/app/express/layout.tsx).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BoatClosers',
    short_name: 'BoatClosers',
    description: 'Close a private boat sale online: offers, escrow, paperwork and title transfer in one place.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f1b2d',
    theme_color: '#0f1b2d',
    icons: [
      { src: '/icons/bc-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/bc-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/bc-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
