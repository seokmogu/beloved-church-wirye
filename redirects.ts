import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const legacyRouteRedirects = [
    {
      source: '/ministry',
      destination: '/',
      permanent: true,
    },
    {
      source: '/sermons',
      destination: '/sermon',
      permanent: true,
    },
    {
      source: '/news',
      destination: '/announcements',
      permanent: true,
    },
  ]

  return [internetExplorerRedirect, ...legacyRouteRedirects]
}
