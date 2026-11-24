'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Meta (Facebook/Instagram) Pixel. Only loads when the Pixel ID is set in
// Vercel as NEXT_PUBLIC_META_PIXEL_ID (digits only). With no ID, nothing loads.
// Counts a page view on first load and on every page change inside the site.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

const RAW_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
const PIXEL_ID = /^\d{5,20}$/.test(RAW_ID) ? RAW_ID : ''

export default function MetaPixel() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (!PIXEL_ID) return
    // The first page view is sent by the base code below.
    if (first.current) {
      first.current = false
      return
    }
    try {
      window.fbq?.('track', 'PageView')
    } catch {}
  }, [pathname])

  if (!PIXEL_ID) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
