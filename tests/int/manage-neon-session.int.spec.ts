import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createManageNeonAuth = vi.hoisted(() => vi.fn())
const cookies = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({ cookies }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/manage/neon/server', () => ({ createManageNeonAuth }))
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
const sessionToken = 'neon-session-token'

function base64Url(value: string | Uint8Array): string {
  return Buffer.from(value).toString('base64url')
}

async function signedSessionData({
  email = 'ADMIN@example.com',
  expiresAt = Math.floor(Date.now() / 1000) + 60,
  id = 'neon-user-id',
}: {
  email?: string
  expiresAt?: number
  id?: string
} = {}): Promise<string> {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64Url(JSON.stringify({ exp: expiresAt, user: { email, id } }))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(cookieSecret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    { name: 'HMAC' },
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  )

  return `${header}.${payload}.${base64Url(new Uint8Array(signature))}`
}

async function setSession(options?: Parameters<typeof signedSessionData>[0]) {
  const data = await signedSessionData(options)
  cookies.mockResolvedValue({
    get: (name: string) => {
      if (name === '__Secure-neon-auth.session_token') return { value: sessionToken }
      if (name === '__Secure-neon-auth.local.session_data') return { value: data }
      return undefined
    },
  })
}

beforeEach(async () => {
  process.env.MANAGE_AUTH_PROVIDER = 'neon'
  process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
  process.env.NEON_AUTH_BASE_URL = 'https://example.neonauth.us-east-1.aws.neon.tech'
  process.env.NEON_AUTH_COOKIE_SECRET = cookieSecret
  await setSession()
})

afterEach(() => {
  createManageNeonAuth.mockReset()
  cookies.mockReset()

  for (const name of environmentNames) {
    const originalValue = originalEnvironment[name]
    if (originalValue === undefined) delete process.env[name]
    else process.env[name] = originalValue
  }
})

describe('Neon 관리자 세션', () => {
  it('페이지와 Server Action 모두에서 서명된 Neon 세션 캐시로 관리자를 읽는다', async () => {
    await expect(getManageAuthState()).resolves.toEqual({
      configured: true,
      missingEnv: [],
      user: { email: 'admin@example.com', id: 'neon-user-id' },
    })
    expect(cookies).toHaveBeenCalledTimes(1)
    expect(createManageNeonAuth).not.toHaveBeenCalled()
  })

  it('로그인 화면에서는 세션을 조회하지 않는다', async () => {
    await expect(getManageAuthState({ includeUser: false })).resolves.toMatchObject({
      configured: true,
      user: null,
    })
    expect(cookies).not.toHaveBeenCalled()
  })

  it('서명이 유효하지 않거나 만료되었거나 허용 목록 밖인 계정은 관리자로 인식하지 않는다', async () => {
    cookies.mockResolvedValue({
      get: (name: string) =>
        name === '__Secure-neon-auth.session_token'
          ? { value: sessionToken }
          : name === '__Secure-neon-auth.local.session_data'
            ? { value: 'invalid.session.signature' }
            : undefined,
    })
    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })

    await setSession({ expiresAt: Math.floor(Date.now() / 1000) - 1 })
    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })

    await setSession({ email: 'outside@example.com' })
    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })
  })
})
