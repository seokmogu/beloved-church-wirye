'use server'

import { redirect } from 'next/navigation'

import { signInManageUser, signOutManageUser } from '@/lib/manage/auth'
import { resolveManageLoginIdentifier } from '@/lib/manage/env'

export async function signInAction(formData: FormData) {
  const login = String(formData.get('login') || formData.get('email') || '')
    .trim()
    .toLowerCase()
  const email = resolveManageLoginIdentifier(login)
  const password = String(formData.get('password') || '')
  const next = sanitizeNext(String(formData.get('next') || '/manage'))
  const result = await signInManageUser(email, password)

  if (result === 'configuration') {
    redirect(`/manage/login?error=config&next=${encodeURIComponent(next)}`)
  }

  if (result === 'invalid') {
    redirect(`/manage/login?error=invalid&next=${encodeURIComponent(next)}`)
  }

  if (result === 'forbidden') {
    redirect(`/manage/login?error=forbidden&next=${encodeURIComponent(next)}`)
  }

  redirect(next)
}

export async function signOutAction() {
  await signOutManageUser()
  redirect('/manage/login')
}

function sanitizeNext(value: string): string {
  if (!value.startsWith('/manage')) return '/manage'
  if (value.startsWith('/manage/login')) return '/manage'
  return value
}
