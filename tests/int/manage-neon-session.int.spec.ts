import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createManageNeonAuth = vi.hoisted(() => vi.fn())
const getSession = vi.hoisted(() => vi.fn())

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

beforeEach(() => {
  process.env.MANAGE_AUTH_PROVIDER = 'neon'
  process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
  process.env.NEON_AUTH_BASE_URL = 'https://example.neonauth.us-east-1.aws.neon.tech'
  process.env.NEON_AUTH_COOKIE_SECRET = cookieSecret
  createManageNeonAuth.mockReturnValue({ getSession })
  getSession.mockResolvedValue({
    data: { user: { email: 'ADMIN@example.com', id: 'neon-user-id' } },
    error: null,
  })
})

afterEach(() => {
  createManageNeonAuth.mockReset()
  getSession.mockReset()

  for (const name of environmentNames) {
    const originalValue = originalEnvironment[name]
    if (originalValue === undefined) delete process.env[name]
    else process.env[name] = originalValue
  }
})

describe('Neon 관리자 세션', () => {
  it('페이지와 Server Action 모두에서 Neon Auth 서버 세션으로 관리자를 읽는다', async () => {
    await expect(getManageAuthState()).resolves.toEqual({
      configured: true,
      missingEnv: [],
      user: { email: 'admin@example.com', id: 'neon-user-id' },
    })
    expect(getSession).toHaveBeenCalledTimes(1)
  })

  it('로그인 화면에서는 세션을 조회하지 않는다', async () => {
    await expect(getManageAuthState({ includeUser: false })).resolves.toMatchObject({
      configured: true,
      user: null,
    })
    expect(getSession).not.toHaveBeenCalled()
  })

  it('Neon Auth가 세션을 거부하거나 허용 목록 밖 계정을 반환하면 관리자로 인식하지 않는다', async () => {
    getSession.mockResolvedValueOnce({ data: null, error: { message: 'invalid session' } })

    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })

    getSession.mockResolvedValueOnce({
      data: { user: { email: 'outside@example.com', id: 'outside-user-id' } },
      error: null,
    })
    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })

    getSession.mockRejectedValueOnce(new Error('temporary auth network failure'))
    await expect(getManageAuthState()).resolves.toMatchObject({ user: null })
  })
})
