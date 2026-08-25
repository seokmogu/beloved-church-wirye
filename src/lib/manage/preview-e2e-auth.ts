import 'server-only'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'manage-preview-e2e'
const COOKIE_MAX_AGE_SECONDS = 10 * 60
const TOKEN_MIN_LENGTH = 32
const TOKEN_SCOPE = 'beloved-church-wirye:manage-preview-e2e:v1'

export type ManagePreviewE2ETestUser = {
  email: string
  id: string
}

const previewE2ETestUser: ManagePreviewE2ETestUser = {
  email: 'preview-e2e@belovedchurch.invalid',
  id: 'preview-e2e',
}

/**
 * This capability is intentionally unavailable in local development and every
 * production deployment. A Preview deployment must also receive a distinct,
 * high-entropy token before the route or cookie has any effect.
 */
export function isManagePreviewE2ETestAuthEnabled(): boolean {
  return process.env.VERCEL_ENV === 'preview' && Boolean(getPreviewE2ETestToken())
}

export async function isValidManagePreviewE2ETestToken(value: string): Promise<boolean> {
  const expected = getPreviewE2ETestToken()
  if (!expected || !value) return false

  return constantTimeEqual(await hashToken(value), await hashToken(expected))
}

export async function getManagePreviewE2ETestUserFromCookie(
  cookieValue: string | undefined,
): Promise<ManagePreviewE2ETestUser | null> {
  const token = getPreviewE2ETestToken()
  if (!token || !cookieValue) return null

  const [expiresAt, signature] = cookieValue.split('.')
  const expiration = Number(expiresAt)
  if (!expiresAt || !signature || !Number.isSafeInteger(expiration) || expiration <= Date.now()) {
    return null
  }

  const expectedSignature = await signCookieExpiration(token, expiresAt)
  return constantTimeEqual(signature, expectedSignature) ? previewE2ETestUser : null
}

export async function getManagePreviewE2ETestUser(): Promise<ManagePreviewE2ETestUser | null> {
  const cookieStore = await cookies()
  return getManagePreviewE2ETestUserFromCookie(cookieStore.get(COOKIE_NAME)?.value)
}

export async function createManagePreviewE2ETestSession(): Promise<boolean> {
  const value = await createManagePreviewE2ETestCookieValue()
  if (!value) return false

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'strict',
    secure: true,
  })

  return true
}

export async function createManagePreviewE2ETestCookieValue(): Promise<string | null> {
  const token = getPreviewE2ETestToken()
  if (!token) return null

  const expiresAt = String(Date.now() + COOKIE_MAX_AGE_SECONDS * 1000)
  return `${expiresAt}.${await signCookieExpiration(token, expiresAt)}`
}

export async function clearManagePreviewE2ETestSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function getManagePreviewE2ETestCookieName(): string {
  return COOKIE_NAME
}

function getPreviewE2ETestToken(): string | null {
  if (process.env.VERCEL_ENV !== 'preview') return null

  const token = process.env.MANAGE_E2E_TEST_TOKEN?.trim()
  return token && token.length >= TOKEN_MIN_LENGTH ? token : null
}

async function hashToken(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(`${TOKEN_SCOPE}:${value}`)
  const digest = await crypto.subtle.digest('SHA-256', encoded)

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function signCookieExpiration(token: string, expiresAt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${TOKEN_SCOPE}:expires:${expiresAt}`),
  )

  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return difference === 0
}
