'use server'

import { redirect } from 'next/navigation'

import {
  createManagePreviewE2ETestSession,
  isManagePreviewE2ETestAuthEnabled,
  isValidManagePreviewE2ETestToken,
} from '@/lib/manage/preview-e2e-auth'

export async function startManagePreviewE2ETestAction(formData: FormData) {
  if (!isManagePreviewE2ETestAuthEnabled()) redirect('/manage/login')

  const token = String(formData.get('token') || '')
  if (!(await isValidManagePreviewE2ETestToken(token))) {
    redirect('/manage/e2e-login?error=invalid')
  }

  if (!(await createManagePreviewE2ETestSession())) {
    redirect('/manage/login')
  }

  redirect('/manage')
}
