import 'server-only'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  getManageAuthProvider,
  getManageMissingEnv,
  getManageNeonAuthConfig,
  isManageAdminEmail,
} from '@/lib/manage/env'
import { createManageNeonAuth } from '@/lib/manage/neon/server'
import { createManageSupabaseServerClient } from '@/lib/manage/supabase/server'

export type ManageUser = {
  email: string
  id: string
}

export type ManageAuthState = {
  configured: boolean
  missingEnv: string[]
  user: ManageUser | null
}

export type ManageSignInResult = 'configuration' | 'forbidden' | 'invalid' | 'ok'

const NEON_SESSION_TOKEN_COOKIE = '__Secure-neon-auth.session_token'
const NEON_SESSION_DATA_COOKIE = '__Secure-neon-auth.local.session_data'
const NEON_PROXY_HEADER = 'x-neon-auth-middleware'

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = `${normalized}${'='.repeat((4 - (normalized.length % 4)) % 4)}`
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function parseManageUser(payload: unknown): ManageUser | null {
  if (!payload || typeof payload !== 'object') return null

  const user = (payload as { user?: unknown }).user
  if (!user || typeof user !== 'object') return null

  const { email, id } = user as { email?: unknown; id?: unknown }
  if (typeof email !== 'string' || typeof id !== 'string') return null

  return { email: email.toLowerCase(), id }
}

async function getManageNeonSessionUser(): Promise<ManageUser | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(NEON_SESSION_TOKEN_COOKIE)?.value
  const sessionData = cookieStore.get(NEON_SESSION_DATA_COOKIE)?.value
  const { cookieSecret } = getManageNeonAuthConfig()

  if (!sessionToken || !sessionData || !cookieSecret) return null

  const parts = sessionData.split('.')
  if (parts.length !== 3) return null

  try {
    const [header, payload, signature] = parts
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(cookieSecret),
      { hash: 'SHA-256', name: 'HMAC' },
      false,
      ['verify'],
    )
    const isValid = await crypto.subtle.verify(
      { name: 'HMAC' },
      key,
      decodeBase64Url(signature),
      new TextEncoder().encode(`${header}.${payload}`),
    )

    if (!isValid) return null

    const decodedPayload = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as {
      exp?: unknown
    }
    if (typeof decodedPayload.exp !== 'number' || decodedPayload.exp * 1000 <= Date.now()) {
      return null
    }

    return parseManageUser(decodedPayload)
  } catch {
    return null
  }
}

export async function getManageAuthState({ includeUser = true }: { includeUser?: boolean } = {}): Promise<ManageAuthState> {
  const missingEnv = getManageMissingEnv()

  if (missingEnv.length > 0) {
    return {
      configured: false,
      missingEnv,
      user: null,
    }
  }

  const provider = getManageAuthProvider()

  if (!provider) {
    return {
      configured: false,
      missingEnv: getManageMissingEnv(),
      user: null,
    }
  }

  if (provider === 'neon') {
    if (!includeUser || (await headers()).get(NEON_PROXY_HEADER) !== 'true') {
      return {
        configured: true,
        missingEnv: [],
        user: null,
      }
    }

    // The proxy validates or refreshes the Neon session before this Server
    // Component renders. Reading its signed cache here avoids writing cookies
    // from a render, which Next.js intentionally disallows.
    const user = await getManageNeonSessionUser()

    if (!user) {
      return {
        configured: true,
        missingEnv: [],
        user: null,
      }
    }

    if (!isManageAdminEmail(user.email)) {
      return {
        configured: true,
        missingEnv: [],
        user: null,
      }
    }

    return {
      configured: true,
      missingEnv: [],
      user,
    }
  }

  const supabase = await createManageSupabaseServerClient()

  if (!supabase) {
    return {
      configured: false,
      missingEnv: getManageMissingEnv(),
      user: null,
    }
  }

  const { data, error } = await supabase.auth.getUser()
  const email = data.user?.email?.toLowerCase()

  if (error || !data.user || !email) {
    return {
      configured: true,
      missingEnv: [],
      user: null,
    }
  }

  if (!isManageAdminEmail(email)) {
    return {
      configured: true,
      missingEnv: [],
      user: null,
    }
  }

  return {
    configured: true,
    missingEnv: [],
    user: {
      email,
      id: data.user.id,
    },
  }
}

export async function signInManageUser(
  email: string,
  password: string,
): Promise<ManageSignInResult> {
  const missingEnv = getManageMissingEnv()
  const provider = getManageAuthProvider()

  if (missingEnv.length > 0 || !provider) return 'configuration'

  if (provider === 'neon') {
    const neonAuth = createManageNeonAuth()
    if (!neonAuth) return 'configuration'

    const { data, error } = await neonAuth.signIn.email({ email, password })
    const signedInEmail = data?.user?.email?.toLowerCase()

    if (error || !signedInEmail) return 'invalid'

    if (!isManageAdminEmail(signedInEmail)) {
      await neonAuth.signOut()
      return 'forbidden'
    }

    return 'ok'
  }

  const supabase = await createManageSupabaseServerClient()
  if (!supabase) return 'configuration'

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user?.email) return 'invalid'

  if (!isManageAdminEmail(data.user.email)) {
    await supabase.auth.signOut()
    return 'forbidden'
  }

  return 'ok'
}

export async function signOutManageUser(): Promise<void> {
  const provider = getManageAuthProvider()

  if (provider === 'neon') {
    const neonAuth = createManageNeonAuth()
    if (neonAuth) await neonAuth.signOut()
    return
  }

  if (provider === 'supabase') {
    const supabase = await createManageSupabaseServerClient()
    if (supabase) await supabase.auth.signOut()
  }
}

export async function requireManageUser(): Promise<ManageUser> {
  const state = await getManageAuthState()

  if (!state.user) {
    redirect('/manage/login')
  }

  return state.user
}

export async function requireManageActionUser(): Promise<ManageUser> {
  const state = await getManageAuthState()

  if (!state.user) {
    throw new Error('관리자 인증이 필요합니다.')
  }

  return state.user
}
