import { afterEach, describe, expect, it } from 'vitest'

import {
  getManageMissingEnv,
  getManageTrustedOrigins,
  resolveManageLoginIdentifier,
} from '@/lib/manage/env'
import {
  createManagePreviewE2ETestCookieValue,
  getManagePreviewE2ETestUserFromCookie,
  isManagePreviewE2ETestAuthEnabled,
  isValidManagePreviewE2ETestToken,
} from '@/lib/manage/preview-e2e-auth'

const managedEnvironmentNames = [
  'MANAGE_ADMIN_LOGIN_ALIASES',
  'MANAGE_AUTH_SECRET',
  'NEXT_PUBLIC_SERVER_URL',
  'PAYLOAD_PUBLIC_ORIGINS',
  'MANAGE_E2E_TEST_TOKEN',
  'VERCEL_ENV',
] as const

const originalEnvironment = Object.fromEntries(
  managedEnvironmentNames.map((name) => [name, process.env[name]]),
)

afterEach(() => {
  for (const name of managedEnvironmentNames) {
    const originalValue = originalEnvironment[name]

    if (originalValue === undefined) {
      delete process.env[name]
    } else {
      process.env[name] = originalValue
    }
  }
})

describe('Neon 관리자 인증 설정', () => {
  it('Supabase 값 없이 독립적인 관리자 인증 설정을 검증한다', () => {
    process.env.MANAGE_AUTH_SECRET = 'a-secure-manager-auth-secret-that-is-longer-than-32-characters'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://www.belovedchurch.co.kr'
    process.env.PAYLOAD_PUBLIC_ORIGINS = 'https://belovedchurch.co.kr,https://www.belovedchurch.co.kr'

    expect(getManageMissingEnv()).toEqual([])
    expect(getManageTrustedOrigins()).toEqual([
      'https://www.belovedchurch.co.kr',
      'https://belovedchurch.co.kr',
    ])
  })

  it('필수값 누락을 정확하게 알린다', () => {
    Reflect.deleteProperty(process.env, 'MANAGE_AUTH_SECRET')
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SERVER_URL')

    expect(getManageMissingEnv()).toEqual([
      'NEXT_PUBLIC_SERVER_URL',
      'MANAGE_AUTH_SECRET',
    ])
  })

  it('짧은 인증 비밀값은 실행 전에 설정 오류로 처리한다', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://www.belovedchurch.co.kr'
    process.env.MANAGE_AUTH_SECRET = 'too-short'

    expect(getManageMissingEnv()).toEqual(['MANAGE_AUTH_SECRET (32자 이상)'])
  })

  it('기존 관리자 로그인 별칭을 유지한다', () => {
    process.env.MANAGE_ADMIN_LOGIN_ALIASES = 'pastor=admin@example.com'

    expect(resolveManageLoginIdentifier('PaStOr')).toBe('admin@example.com')
  })

  it('독립 토큰이 있어도 Preview 외 환경에서는 E2E 인증을 열지 않는다', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.MANAGE_E2E_TEST_TOKEN = 'a-preview-only-test-token-that-is-longer-than-32-characters'

    expect(isManagePreviewE2ETestAuthEnabled()).toBe(false)
  })

  it('Preview의 E2E 토큰은 짧은 수명 쿠키 값으로만 인증한다', async () => {
    const token = 'a-preview-only-test-token-that-is-longer-than-32-characters'
    process.env.VERCEL_ENV = 'preview'
    process.env.MANAGE_E2E_TEST_TOKEN = token

    expect(isManagePreviewE2ETestAuthEnabled()).toBe(true)
    expect(await isValidManagePreviewE2ETestToken(token)).toBe(true)
    expect(await isValidManagePreviewE2ETestToken('incorrect-token')).toBe(false)
    const cookieValue = await createManagePreviewE2ETestCookieValue()
    expect(cookieValue).toBeTypeOf('string')
    expect(await getManagePreviewE2ETestUserFromCookie(cookieValue!)).toEqual({
      email: 'preview-e2e@belovedchurch.invalid',
      id: 'preview-e2e',
    })
    expect(await getManagePreviewE2ETestUserFromCookie('not-a-signed-test-cookie')).toBeNull()
  })
})
