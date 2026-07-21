/** @type {import('next').NextConfig} */

// Security headers applied to every response. These are the safe, standard ones
// that close the real risks (clickjacking, MIME-sniffing) and harden the site
// without restricting the resources the app needs (Stripe, Supabase, etc.).
const securityHeaders = [
  // Stops your site from being embedded in a scammer's frame (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stops browsers from guessing content types (a common attack vector).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak full URLs to other sites in the referer header.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for a year (the site is already HTTPS everywhere on Vercel).
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // The app doesn't use these device features — deny them by default.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  // Anti-framing at the CSP level too (belt + suspenders). Kept minimal on
  // purpose so it can't break Stripe/Supabase resource loading.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
