'use server'

import { redirect } from 'next/navigation'

import { isManageAdminEmail } from '@/lib/manage/env'
import { createManageSupabaseServerClient } from '@/lib/manage/supabase/server'

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') || '')
  const next = sanitizeNext(String(formData.get('next') || '/manage'))
  const supabase = await createManageSupabaseServerClient()

  if (!supabase) {
    redirect(`/manage/login?error=config&next=${encodeURIComponent(next)}`)
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user?.email) {
    redirect(`/manage/login?error=invalid&next=${encodeURIComponent(next)}`)
  }

  if (!isManageAdminEmail(data.user.email)) {
    await supabase.auth.signOut()
    redirect(`/manage/login?error=forbidden&next=${encodeURIComponent(next)}`)
  }

  redirect(next)
}

export async function signOutAction() {
  const supabase = await createManageSupabaseServerClient()
  if (supabase) await supabase.auth.signOut()
  redirect('/manage/login')
}

function sanitizeNext(value: string): string {
  if (!value.startsWith('/manage')) return '/manage'
  if (value.startsWith('/manage/login')) return '/manage'
  return value
}
