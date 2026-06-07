import 'server-only'

import { timingSafeEqual } from 'node:crypto'

/**
 * Authorize a Vercel Cron (or manual) request via the CRON_SECRET bearer token using a
 * constant-time comparison. Fails closed when CRON_SECRET is unset. Shared by the cron
 * route handlers so the check cannot drift between them.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const provided = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  if (provided.length !== expected.length) return false

  return timingSafeEqual(provided, expected)
}
