import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', '100.94.135.5', '100.65.249.52'],
  experimental: {
    serverActions: {
      bodySizeLimit: '32mb',
    },
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    qualities: [100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
      { hostname: 'images.unsplash.com', protocol: 'https' },
      { hostname: '*.ytimg.com', protocol: 'https' },
      { hostname: 'img.youtube.com', protocol: 'https' },
      { hostname: '*.cdninstagram.com', protocol: 'https' },
      { hostname: '*.public.blob.vercel-storage.com', protocol: 'https' },
    ],
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

const payloadNextConfig = withPayload(nextConfig, { devBundleServerPackages: false })
const payloadHeaders = payloadNextConfig.headers

// Site-wide security headers. CSP `frame-ancestors 'self'` blocks foreign framing
// (clickjacking) while still allowing Payload's same-origin admin / live-preview iframes —
// a blanket `X-Frame-Options: DENY` would break those. HSTS is production-only.
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
]

payloadNextConfig.headers = async () => {
  const headerRoutes = payloadHeaders ? await payloadHeaders() : []

  // Payload adds these theme client hints globally. On Vercel they trigger an HTTPS retry
  // that can leave the admin RSC children unmounted even though the Flight payload is valid.
  const cleanedRoutes = headerRoutes.map((route) => ({
    ...route,
    headers: route.headers.filter(({ key, value }) => {
      const lowerKey = key.toLowerCase()
      const isThemeClientHint = value === 'Sec-CH-Prefers-Color-Scheme'

      return !(
        isThemeClientHint &&
        (lowerKey === 'accept-ch' || lowerKey === 'critical-ch' || lowerKey === 'vary')
      )
    }),
  }))

  // Append (never replace Payload's per-route headers) the security headers globally.
  return [...cleanedRoutes, { source: '/(.*)', headers: securityHeaders }]
}

export default payloadNextConfig
