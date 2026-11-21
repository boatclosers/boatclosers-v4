import { NextResponse, type NextRequest } from 'next/server'

// My Boat Closing lives in this app under /express. When it's opened on its own
// domain (myboatclosing.com), serve those pages at the root:
//   myboatclosing.com/        -> /express
//   myboatclosing.com/start   -> /express/start
//   myboatclosing.com/help    -> /express/help
//   myboatclosing.com/deal/x  -> /express/deal/x
// Everything else (/express/..., /api, /hin-check, assets) works as-is.
const OWN_HOSTS = ['myboatclosing.com', 'www.myboatclosing.com']

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0]
  if (!OWN_HOSTS.includes(host)) return NextResponse.next()
  const { pathname } = req.nextUrl
  // Google looks for /favicon.ico first: give myboatclosing.com its own icon.
  if (pathname === '/favicon.ico') {
    const url = req.nextUrl.clone()
    url.pathname = '/icons/mbc-favicon.ico'
    return NextResponse.rewrite(url)
  }
  if (pathname === '/' || pathname === '/start' || pathname === '/help' || pathname.startsWith('/deal/') || pathname.startsWith('/seller/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname === '/' ? '/express' : `/express${pathname}`
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/favicon.ico', '/start', '/help', '/deal/:path*', '/seller/:path*'],
}
