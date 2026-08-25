import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  token: string
}

/**
 * Starts an isolated, Preview-only E2E manager session. This route is disabled
 * outside Vercel Preview and requires its own high-entropy test token.
 */
export async function login({ page, token }: LoginOptions): Promise<void> {
  await page.goto('/manage/e2e-login')

  await page.getByLabel('Preview E2E 토큰').fill(token)
  await page.getByRole('button', { name: '개발 검증 시작', exact: true }).click()

  await page.waitForURL(/\/manage$/)

  await expect(page.getByRole('heading', { name: '관리 홈', exact: true })).toBeVisible()
}
