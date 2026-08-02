import { afterEach, describe, expect, it } from 'vitest'

import {
  getManageAuthProvider,
  getManageMissingEnv,
  resolveManageLoginIdentifier,
} from '@/lib/manage/env'

const managedEnvironmentNames = [
  'MANAGE_AUTH_PROVIDER',
  'MANAGE_ADMIN_EMAILS',
  'MANAGE_ADMIN_LOGIN_ALIASES',
  'NEON_AUTH_BASE_URL',
  'NEON_AUTH_COOKIE_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
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

describe('관리자 인증 공급자 설정', () => {
  it('공급자를 지정하지 않으면 기존 Supabase 방식을 유지한다', () => {
    delete process.env.MANAGE_AUTH_PROVIDER

    expect(getManageAuthProvider()).toBe('supabase')
  })

  it('Neon 인증은 Supabase 공개 키 없이 독립적으로 설정을 검증한다', () => {
    process.env.MANAGE_AUTH_PROVIDER = 'neon'
    process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
    process.env.NEON_AUTH_BASE_URL = 'https://example.neonauth.us-east-1.aws.neon.tech'
    process.env.NEON_AUTH_COOKIE_SECRET = 'a-secure-cookie-secret-that-is-longer-than-32-characters'
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(getManageAuthProvider()).toBe('neon')
    expect(getManageMissingEnv()).toEqual([])
  })

  it('Neon 인증의 필수값 누락을 정확하게 알린다', () => {
    process.env.MANAGE_AUTH_PROVIDER = 'neon'
    process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
    delete process.env.NEON_AUTH_BASE_URL
    delete process.env.NEON_AUTH_COOKIE_SECRET

    expect(getManageMissingEnv()).toEqual([
      'NEON_AUTH_BASE_URL',
      'NEON_AUTH_COOKIE_SECRET',
    ])
  })

  it('Neon 쿠키 서명이 너무 짧으면 실행 전에 설정 오류로 처리한다', () => {
    process.env.MANAGE_AUTH_PROVIDER = 'neon'
    process.env.MANAGE_ADMIN_EMAILS = 'admin@example.com'
    process.env.NEON_AUTH_BASE_URL = 'http://not-secure.example.com'
    process.env.NEON_AUTH_COOKIE_SECRET = 'too-short'

    expect(getManageMissingEnv()).toEqual([
      'NEON_AUTH_BASE_URL (https URL)',
      'NEON_AUTH_COOKIE_SECRET (32자 이상)',
    ])
  })

  it('기존 관리자 로그인 별칭을 두 인증 방식에서 공통으로 유지한다', () => {
    process.env.MANAGE_ADMIN_LOGIN_ALIASES = 'pastor=admin@example.com'

    expect(resolveManageLoginIdentifier('PaStOr')).toBe('admin@example.com')
  })
})
