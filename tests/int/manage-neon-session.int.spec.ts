import { webcrypto } from 'node:crypto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sessionCookies = vi.hoisted(() => new Map<string, string>())
const requestHeaders = vi.hoisted(() => new Map<string, string>())

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = sessionCookies.get(name)
      return value ? { value } : undefined
    },
  })),
  headers: vi.fn(async () => ({
    get: (name: string) => requestHeaders.get(name) ?? null,
  })),
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/manage/neon/server', () => ({ createManageNeonAuth: vi.fn() }))
vi.mock('@/lib/manage/supabase/server', () => ({ createManageSupabaseServerClient: vi.fn() }))

import { getManageAuthState } from '@/lib/manage/auth'

const environmentNames = [
  'MANAGE_AUTH_PROVIDER',
  'MANAGE_ADMIN_EMAILS',
  'NEON_AUTH_BASE_URL',
  'NEON_AUTH_COOKIE_SECRET',
] as const

const originalEnvironment = Object.fromEntries(
  environmentNames.map((name) => [name, process.env[name]]),
)
const cookieSecret = 'a-secure-cookie-secret-that-is-longer-than-32-characters'

function asBase64Url(value: Uint8Array) {
  let binary = ''
  for (const byte of value) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function signedSessionData(payload: Record<string, unknown>) {
  const encoder = new TextEncoder()
  const header = asBase64Url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = asBase64Url(encoder.encode(JSON.stringify(payload)))
  const key = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode(cookieSecret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(
    await webcrypto.subtle.sign({ name: 'HMAC' }, key, encoder.encode(`${header}.${body}`)),
  )

  return `${header}.${body}.${asBase64Url(signature)}`
}

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto)
  process.env.MANAGE_AUTH_PROVIDER = 'neon'
  process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
  process.env.NEON_AUTH_BASE_URL = 'https://example.neonauth.us-east-1.aws.neon.tech'
  process.env.NEON_AUTH_COOKIE_SECRET = cookieSecret
  sessionCookies.clear()
  requestHeaders.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  sessionCookies.clear()
  requestHeaders.clear()

  for (const name of environmentNames) {
    const originalValue = originalEnvironment[name]
    if (originalValue === undefined) delete process.env[name]
    else process.env[name] = originalValue
  }
})

describe('Neon 관리자 세션', () => {
  it('프록시가 검증한 서명 세션에서만 허용된 관리자를 읽는다', async () => {
    sessionCookies.set('__Secure-neon-auth.session_token', 'session-token')
    sessionCookies.set(
      '__Secure-neon-auth.local.session_data',
      await signedSessionData({
        exp: Math.floor(Date.now() / 1000) + 60,
        user: { email: 'ADMIN@example.com', id: 'neon-user-id' },
      }),
    )
    requestHeaders.set('x-neon-auth-middleware', 'true')

    await expect(getManageAuthState()).resolves.toEqual({
      configured: true,
      missingEnv: [],
      user: { email: 'admin@example.com', id: 'neon-user-id' },
    })
  })

  it('로그인 화면과 프록시 검증이 없는 요청에서는 세션을 신뢰하지 않는다', async () => {
    sessionCookies.set('__Secure-neon-auth.session_token', 'session-token')
    sessionCookies.set(
      '__Secure-neon-auth.local.session_data',
      await signedSessionData({
        exp: Math.floor(Date.now() / 1000) + 60,
        user: { email: 'admin@example.com', id: 'neon-user-id' },
      }),
    )

    await expect(getManageAuthState({ includeUser: false })).resolves.toMatchObject({
      configured: true,
      user: null,
    })
    await expect(getManageAuthState()).resolves.toMatchObject({
      configured: true,
      user: null,
    })
  })

  it('만료되었거나 서명이 변조된 캐시는 관리자로 인식하지 않는다', async () => {
    requestHeaders.set('x-neon-auth-middleware', 'true')
    sessionCookies.set('__Secure-neon-auth.session_token', 'session-token')
    sessionCookies.set(
      '__Secure-neon-auth.local.session_data',
      await signedSessionData({
        exp: Math.floor(Date.now() / 1000) - 1,
        user: { email: 'admin@example.com', id: 'neon-user-id' },
      }),
    )

    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })

    sessionCookies.set('__Secure-neon-auth.local.session_data', 'invalid.signature.value')
    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })
  })
})
