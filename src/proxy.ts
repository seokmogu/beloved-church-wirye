import { createNeonAuth } from '@neondatabase/auth/next/server'
import { NextResponse, type NextRequest } from 'next/server'

const isNeonManageAuth = process.env.MANAGE_AUTH_PROVIDER?.trim().toLowerCase() === 'neon'
const neonAuthBaseUrl = process.env.NEON_AUTH_BASE_URL?.trim()
const neonAuthCookieSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim()

function isHttpsUrl(value: string | undefined): value is string {
  if (!value) return false

  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const neonManageProxy =
  isNeonManageAuth &&
  isHttpsUrl(neonAuthBaseUrl) &&
  neonAuthCookieSecret &&
  neonAuthCookieSecret.length >= 32
    ? createNeonAuth({
        baseUrl: neonAuthBaseUrl,
        cookies: { secret: neonAuthCookieSecret },
      }).middleware({ loginUrl: '/manage/login' })
    : null

export function proxy(request: NextRequest) {
  // Neon middleware redirects an unauthenticated POST to an HTML login page.
  // Next Server Actions expect an RSC response, so that redirect becomes an
  // opaque client error even when the signed manager session is valid. Actions
  // verify that signed session in requireManageActionUser instead.
  if (request.headers.get('next-action')) return NextResponse.next()

  return neonManageProxy ? neonManageProxy(request) : NextResponse.next()
}

export const config = {
  matcher: ['/manage/:path*'],
}
