import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const proxyMiddleware = vi.hoisted(() => vi.fn())
const createNeonAuth = vi.hoisted(() => vi.fn())
const nextResponse = vi.hoisted(() => ({ kind: 'next' }))
const next = vi.hoisted(() => vi.fn(() => nextResponse))

vi.mock('@neondatabase/auth/next/server', () => ({ createNeonAuth }))
vi.mock('next/server', () => ({ NextResponse: { next } }))

const environmentNames = [
  'MANAGE_AUTH_PROVIDER',
  'NEON_AUTH_BASE_URL',
  'NEON_AUTH_COOKIE_SECRET',
] as const
const originalEnvironment = Object.fromEntries(
  environmentNames.map((name) => [name, process.env[name]]),
)

beforeEach(() => {
  vi.resetModules()
  createNeonAuth.mockReset()
  proxyMiddleware.mockReset()
  next.mockClear()
  proxyMiddleware.mockReturnValue({ kind: 'neon' })
})

afterEach(() => {
  for (const name of environmentNames) {
    const originalValue = originalEnvironment[name]
    if (originalValue === undefined) delete process.env[name]
    else process.env[name] = originalValue
  }
})

describe('Neon 관리자 프록시', () => {
  it('Supabase 운영 경로에서는 Neon SDK를 초기화하지 않는다', async () => {
    process.env.MANAGE_AUTH_PROVIDER = 'supabase'
    delete process.env.NEON_AUTH_BASE_URL
    delete process.env.NEON_AUTH_COOKIE_SECRET

    const { proxy } = await import('@/proxy')

    expect(proxy({} as never)).toBe(nextResponse)
    expect(createNeonAuth).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('개발 Neon 경로만 /manage 로그인 URL로 세션 프록시를 연결한다', async () => {
    process.env.MANAGE_AUTH_PROVIDER = 'neon'
    process.env.NEON_AUTH_BASE_URL = 'https://example.neonauth.us-east-1.aws.neon.tech'
    process.env.NEON_AUTH_COOKIE_SECRET = 'a-secure-cookie-secret-that-is-longer-than-32-characters'
    const middlewareFactory = vi.fn(() => proxyMiddleware)
    createNeonAuth.mockReturnValue({ middleware: middlewareFactory })
    const request = {} as never

    const { config, proxy } = await import('@/proxy')

    expect(createNeonAuth).toHaveBeenCalledWith({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET },
    })
    expect(middlewareFactory).toHaveBeenCalledWith({ loginUrl: '/manage/login' })
    expect(proxy(request)).toBe(proxyMiddleware.mock.results[0]?.value)
    expect(proxyMiddleware).toHaveBeenCalledWith(request)
    expect(config).toEqual({ matcher: ['/manage/:path*'] })
  })

  it('불완전한 Neon 설정은 프록시를 통과시키고 설정 화면에서 처리하게 한다', async () => {
    process.env.MANAGE_AUTH_PROVIDER = 'neon'
    process.env.NEON_AUTH_BASE_URL = 'https://example.neonauth.us-east-1.aws.neon.tech'
    process.env.NEON_AUTH_COOKIE_SECRET = 'too-short'

    const { proxy } = await import('@/proxy')

    expect(proxy({} as never)).toBe(nextResponse)
    expect(createNeonAuth).not.toHaveBeenCalled()
  })

  it('형식이 잘못된 Neon URL도 프록시 초기화 전에 설정 오류로 처리한다', async () => {
    process.env.MANAGE_AUTH_PROVIDER = 'neon'
    process.env.NEON_AUTH_BASE_URL = 'https://'
    process.env.NEON_AUTH_COOKIE_SECRET = 'a-secure-cookie-secret-that-is-longer-than-32-characters'

    const { proxy } = await import('@/proxy')

    expect(proxy({} as never)).toBe(nextResponse)
    expect(createNeonAuth).not.toHaveBeenCalled()
  })
})
