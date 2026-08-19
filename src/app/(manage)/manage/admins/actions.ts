'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  createManageAdmin,
  ManageAdminError,
  resetManageAdminPassword,
  setManageAdminActive,
} from '@/lib/manage/better-auth'
import { requireManageActionUser } from '@/lib/manage/auth'

export async function createManageAdminAction(formData: FormData) {
  await requireManageActionUser()

  try {
    await createManageAdmin({
      email: stringValue(formData, 'email'),
      name: stringValue(formData, 'name'),
      password: rawValue(formData, 'password'),
    })
  } catch (error) {
    redirect(`/manage/admins?error=${manageAdminErrorCode(error)}`)
  }

  revalidatePath('/manage/admins')
  redirect('/manage/admins?status=created')
}

export async function resetManageAdminPasswordAction(formData: FormData) {
  const actor = await requireManageActionUser()

  try {
    await resetManageAdminPassword({
      actorId: actor.id,
      password: rawValue(formData, 'password'),
      targetId: rawValue(formData, 'id'),
    })
  } catch (error) {
    redirect(`/manage/admins?error=${manageAdminErrorCode(error)}`)
  }

  revalidatePath('/manage/admins')
  redirect('/manage/admins?status=password')
}

export async function setManageAdminActiveAction(formData: FormData) {
  const actor = await requireManageActionUser()

  try {
    await setManageAdminActive({
      actorId: actor.id,
      isActive: rawValue(formData, 'nextActive') === 'true',
      targetId: rawValue(formData, 'id'),
    })
  } catch (error) {
    redirect(`/manage/admins?error=${manageAdminErrorCode(error)}`)
  }

  revalidatePath('/manage/admins')
  redirect('/manage/admins?status=access')
}

function rawValue(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

function stringValue(formData: FormData, name: string): string {
  return rawValue(formData, name).trim()
}

function manageAdminErrorCode(error: unknown): string {
  if (error instanceof ManageAdminError) return error.code
  return 'save'
}
