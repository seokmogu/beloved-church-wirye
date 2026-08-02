import 'server-only'

import { redirect } from 'next/navigation'

import {
  getManageAuthProvider,
  getManageMissingEnv,
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

function parseManageUser(payload: unknown): ManageUser | null {
  if (!payload || typeof payload !== 'object') return null

  const user = (payload as { user?: unknown }).user
  if (!user || typeof user !== 'object') return null

  const { email, id } = user as { email?: unknown; id?: unknown }
  if (typeof email !== 'string' || typeof id !== 'string') return null

  return { email: email.toLowerCase(), id }
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
    if (!includeUser) {
      return {
        configured: true,
        missingEnv: [],
        user: null,
      }
    }

    const neonAuth = createManageNeonAuth()
    if (!neonAuth) {
      return {
        configured: false,
        missingEnv: getManageMissingEnv(),
        user: null,
      }
    }

    // Server Actions may not receive the request header that Neon middleware
    // injects for page renders. Neon Auth's server API validates the signed
    // session cache directly, so it works consistently for both page loads and
    // form submissions.
    let user: ManageUser | null = null
    try {
      const { data, error } = await neonAuth.getSession()
      user = error ? null : parseManageUser(data)
    } catch {
      // 인증 서비스의 일시적 네트워크 실패는 공개 서버 오류가 아니라
      // 재로그인이 필요한 상태로 처리한다.
      user = null
    }

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
