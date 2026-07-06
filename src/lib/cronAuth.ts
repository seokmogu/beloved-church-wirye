import 'server-only'

import { timingSafeEqual } from 'node:crypto'

function isAuthorizedBearer(request: Request, secret: string | undefined): boolean {
  if (!secret) return false

  const provided = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  if (provided.length !== expected.length) return false

  return timingSafeEqual(provided, expected)
}

/**
 * Authorize a Vercel Cron (or manual) request via the CRON_SECRET bearer token using a
 * constant-time comparison. Fails closed when CRON_SECRET is unset. Shared by the cron
 * route handlers so the check cannot drift between them.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  return isAuthorizedBearer(request, process.env.CRON_SECRET)
}

/**
 * Authorize an external Instagram-post push (e.g. from the macstudio watcher) via the
 * INSTAGRAM_PUSH_SECRET bearer token. Kept separate from CRON_SECRET so a leaked watcher
 * credential can't reach the other cron-authenticated routes.
 */
export function isAuthorizedInstagramPushRequest(request: Request): boolean {
  return isAuthorizedBearer(request, process.env.INSTAGRAM_PUSH_SECRET)
}
