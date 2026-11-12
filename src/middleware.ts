import { NextResponse, type NextRequest } from 'next/server'

// My Boat Closing lives in this app under /express. When it's opened on its own
// domain (myboatclosing.com), serve those pages at the root:
//   myboatclosing.com/        -> /express
//   myboatclosing.com/start   -> /express/start
//   myboatclosing.com/deal/x  -> /express/deal/x
// Everything else (/express/..., /api, /hin-check, assets) works as-is.
const OWN_HOSTS = ['myboatclosing.com', 'www.myboatclosing.com']

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0]
  if (!OWN_HOSTS.includes(host)) return NextResponse.next()
  const { pathname } = req.nextUrl
  if (pathname === '/' || pathname === '/start' || pathname.startsWith('/deal/') || pathname.startsWith('/seller/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname === '/' ? '/express' : `/express${pathname}`
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/start', '/deal/:path*', '/seller/:path*'],
}
