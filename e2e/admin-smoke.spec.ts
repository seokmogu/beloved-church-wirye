import { expect, test } from '@playwright/test'

test('admin redirects to custom manage login shell', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/admin', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/manage(?:\/login)?$/)
  await expect(page.getByRole('heading', { name: /관리자 로그인|대시보드/ })).toBeVisible()

  expect(pageErrors).toEqual([])
})
