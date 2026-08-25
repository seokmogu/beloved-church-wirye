import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  login: string
  password: string
}

/**
 * Logs a permitted manager into the custom /manage application.
 */
export async function login({ page, login: identifier, password }: LoginOptions): Promise<void> {
  await page.goto('/manage/login?next=/manage')

  await page.getByLabel('아이디(wirye) 또는 이메일').fill(identifier)
  await page.getByLabel('비밀번호').fill(password)
  await page.getByRole('button', { name: '로그인', exact: true }).click()

  await page.waitForURL(/\/manage$/)

  await expect(page.getByRole('heading', { name: '관리 홈', exact: true })).toBeVisible()
}
