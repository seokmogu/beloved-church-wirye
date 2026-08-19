import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getManageAdminByEmail, getManageAdminForUser, manageAuth } from '@/lib/manage/better-auth'
import { getManageMissingEnv } from '@/lib/manage/env'

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

async function toManageUser(
  user: { email?: string | null; id?: string | null } | null | undefined,
): Promise<ManageUser | null> {
  const email = user?.email?.toLowerCase()
  const id = user?.id

  if (!email || !id) return null

  const admin = await getManageAdminForUser({ email, id })
  if (!admin) return null

  return { email, id }
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

  if (!includeUser) {
    return {
      configured: true,
      missingEnv: [],
      user: null,
    }
  }

  const session = await manageAuth.api.getSession({ headers: await headers() })

  return {
    configured: true,
    missingEnv: [],
    user: await toManageUser(session?.user),
  }
}

export async function signInManageUser(
  email: string,
  password: string,
): Promise<ManageSignInResult> {
  if (getManageMissingEnv().length > 0) return 'configuration'

  const admin = await getManageAdminByEmail(email)
  if (!admin?.isActive) return 'forbidden'

  try {
    const result = await manageAuth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })

    return (await toManageUser(result.user)) ? 'ok' : 'invalid'
  } catch {
    return 'invalid'
  }
}

export async function signOutManageUser(): Promise<void> {
  await manageAuth.api.signOut({ headers: await headers() })
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
