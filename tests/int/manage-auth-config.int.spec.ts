import { afterEach, describe, expect, it } from 'vitest'

import {
  getManageMissingEnv,
  getManageTrustedOrigins,
  resolveManageLoginIdentifier,
} from '@/lib/manage/env'

const managedEnvironmentNames = [
  'MANAGE_ADMIN_EMAILS',
  'MANAGE_ADMIN_LOGIN_ALIASES',
  'MANAGE_AUTH_SECRET',
  'NEXT_PUBLIC_SERVER_URL',
  'PAYLOAD_PUBLIC_ORIGINS',
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
    process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
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
    process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
    Reflect.deleteProperty(process.env, 'MANAGE_AUTH_SECRET')
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SERVER_URL')

    expect(getManageMissingEnv()).toEqual([
      'NEXT_PUBLIC_SERVER_URL',
      'MANAGE_AUTH_SECRET',
    ])
  })

  it('짧은 인증 비밀값은 실행 전에 설정 오류로 처리한다', () => {
    process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://www.belovedchurch.co.kr'
    process.env.MANAGE_AUTH_SECRET = 'too-short'

    expect(getManageMissingEnv()).toEqual(['MANAGE_AUTH_SECRET (32자 이상)'])
  })

  it('기존 관리자 로그인 별칭을 유지한다', () => {
    process.env.MANAGE_ADMIN_LOGIN_ALIASES = 'pastor=admin@example.com'

    expect(resolveManageLoginIdentifier('PaStOr')).toBe('admin@example.com')
  })
})
