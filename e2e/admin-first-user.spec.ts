import { test, expect } from '@playwright/test'

// Verifies the full Vercel-deploy-like path: fresh migrated DB → create first user →
// login succeeds → admin dashboard loads without errors.
// Runs ONLY when RUN_FIRST_USER_TEST=1 is set, because it mutates DB state.
const shouldRun = process.env.RUN_FIRST_USER_TEST === '1'

test.skip(!shouldRun, 'Set RUN_FIRST_USER_TEST=1 to run this mutating test')

test('creates first admin user and reaches dashboard', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text())
  })

  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })
  await page.waitForURL(/\/admin\/create-first-user/, { timeout: 10000 })

  const email = `admin-${Date.now()}@beloved-church.test`
  const password = 'TestAdmin!2345'

  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('input[name="confirm-password"]').fill(password)
  const nameField = page.locator('input[name="name"]')
  if (await nameField.count() > 0) await nameField.fill('관리자')

  await page.locator('button[type="submit"]').click()

  // After create-first-user, Payload redirects to admin dashboard
  await page.waitForURL((url) => !url.pathname.includes('create-first-user'), { timeout: 15000 })

  const finalUrl = page.url()
  expect(finalUrl).toContain('/admin')
  expect(finalUrl).not.toContain('create-first-user')
  expect(finalUrl).not.toContain('/login')

  // Dashboard should have the collection nav (users, pages, posts, etc.)
  await expect(page.locator('nav.nav__wrap')).toBeVisible()

  // No page errors during the flow
  expect(errors.filter((e) => e.startsWith('PAGEERROR'))).toEqual([])
})
