import type { NextConfig } from 'next'

/**
 * Baseline security headers on every response. A full Content-Security-Policy
 * is a Phase 2 item: GTM loads arbitrary third-party scripts, so a CSP needs
 * a nonce strategy and an allowlist agreed with marketing ops.
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Clickjacking protection (the modern replacement for X-Frame-Options).
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
]

const nextConfig: NextConfig = {
  transpilePackages: ['sanity-types'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
