import { test, expect } from '@playwright/test'

test.describe('Desktop tests (1280x800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('Homepage loads with CMS-driven hero and primary CTAs', async ({ page }) => {
    await page.goto('/')
    const heroSection = page.locator('main section').first()
    await expect(heroSection).toBeVisible()
    await expect(page.locator('h1')).toContainText('사랑하는교회')
    await expect(heroSection.getByRole('link', { name: '예배 안내' })).toBeVisible()
    await expect(heroSection.getByRole('link', { name: '최신 설교 보기' })).toBeVisible()
  })

  test('Header and footer shells are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('Homepage renders CMS-controlled sections', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '그리스도를 본받아 함께 사랑하는 공동체' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '최신 설교' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '인스타그램' })).toBeVisible()
  })

  test('CTA links navigate to dedicated pages', async ({ page }) => {
    await page.goto('/')
    await page.locator('main section').first().getByRole('link', { name: '예배 안내' }).click()
    await expect(page).toHaveURL(/\/worship$/)
    await expect(page.locator('h1', { hasText: '예배 안내' })).toBeVisible()

    await page.goto('/')
    await page.locator('main section').first().getByRole('link', { name: '최신 설교 보기' }).click()
    await expect(page).toHaveURL(/\/sermon$/)
    await expect(page.locator('h1', { hasText: '설교' })).toBeVisible()
  })

  test('Bulletins (/bulletins) page loads', async ({ page }) => {
    await page.goto('/bulletins')
    await expect(page.locator('h1', { hasText: '주보' })).toBeVisible()
  })
})

test.describe('Mobile tests (375x667 - iPhone SE)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('Homepage loads on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('사랑하는교회')
    await expect(page.locator('footer')).toBeAttached()
  })

  test('Mobile header menu control is usable when nav items exist', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const hamburger = page.locator('header button[aria-label="메뉴 열기"]')
    const hamburgerCount = await hamburger.count()
    if (hamburgerCount > 0) {
      await hamburger.click()
      await expect(page.locator('header button[aria-expanded="true"]')).toBeVisible()
    } else {
      test.info().annotations.push({
        type: 'note',
        description: 'No mobile hamburger rendered because Header global currently has no nav items.',
      })
      await expect(page.locator('header')).toBeVisible()
    }
  })

  test('Footer is visible on mobile', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
    await expect(footer.getByRole('heading', { name: '예배 안내' })).toBeVisible()
  })
})
