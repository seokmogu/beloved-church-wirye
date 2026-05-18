import 'server-only'

import { redirect } from 'next/navigation'

import { getManageMissingEnv, isManageAdminEmail } from '@/lib/manage/env'
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

export async function getManageAuthState(): Promise<ManageAuthState> {
  const missingEnv = getManageMissingEnv()

  if (missingEnv.length > 0) {
    return {
      configured: false,
      missingEnv,
      user: null,
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
    await supabase.auth.signOut()
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
