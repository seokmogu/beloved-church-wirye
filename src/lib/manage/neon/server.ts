import 'server-only'

import { createNeonAuth } from '@neondatabase/auth/next/server'

import { getManageNeonAuthConfig } from '@/lib/manage/env'

export function createManageNeonAuth() {
  const { baseUrl, cookieSecret } = getManageNeonAuthConfig()

  if (!baseUrl || !cookieSecret || cookieSecret.length < 32) return null

  try {
    if (new URL(baseUrl).protocol !== 'https:') return null
  } catch {
    return null
  }

  return createNeonAuth({
    baseUrl,
    cookies: {
      secret: cookieSecret,
    },
  })
}
