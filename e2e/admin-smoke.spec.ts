import { test, expect } from '@playwright/test'

test('admin panel hydrates and reaches login or first-user page', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text())
  })

  await page.goto('/admin', { waitUntil: 'networkidle' })
  // After hydration, Payload admin redirects to /admin/create-first-user if no users
  // or /admin/login otherwise. Both pages render via client-side navigation.
  await page.waitForTimeout(2000)

  const url = page.url()
  const title = await page.title()

  // Must have landed on login or create-first-user after the client redirect chain
  expect(url).toMatch(/\/admin(\/(login|create-first-user))?$/)
  expect(title).toContain('Payload')

  // Page should have interactive inputs (email + password fields at minimum)
  await expect(page.locator('input[type="email"], input[name="email"]')).toHaveCount(1)
  await expect(page.locator('input[type="password"]').first()).toBeVisible()

  // Should not have any uncaught page errors
  expect(errors.filter((e) => e.startsWith('PAGEERROR'))).toEqual([])
})
