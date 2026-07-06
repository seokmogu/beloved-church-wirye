import { test, expect } from '@playwright/test'

/**
 * CMS 문구는 관리자가 수시로 바꾸므로, 스펙은 정확한 카피 대신
 * 구조와 동작(내부 링크 유지, 섹션 존재, 핵심 페이지 로드)을 검증한다.
 */

test.describe('Desktop tests (1280x800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('Homepage loads with CMS-driven hero and primary CTAs', async ({ page }) => {
    await page.goto('/')
    const heroSection = page.locator('main section').first()
    await expect(heroSection).toBeVisible()
    // 히어로 제목(h1)은 CMS 값이라 문구 대신 존재만 확인한다
    await expect(page.locator('h1').first()).not.toBeEmpty()
    // 히어로 CTA는 문구와 무관하게 최소 1개 존재해야 한다
    const heroLinks = heroSection.getByRole('link')
    expect(await heroLinks.count()).toBeGreaterThan(0)
  })

  test('Header and footer shells are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('Homepage renders CMS-controlled sections', async ({ page }) => {
    await page.goto('/')
    // 설교 섹션: 사이트 내 상세로 향하는 카드가 있어야 한다 (외부 이탈 회귀 방지)
    await expect(page.locator('a[href^="/sermon/"]').first()).toBeAttached()
    // 인스타그램 섹션: 공식 임베드 iframe이 렌더돼야 한다
    await expect(page.locator('iframe[src*="instagram.com"]').first()).toBeAttached()
  })

  test('Hero CTAs stay on the site (no preview-domain escape)', async ({ page }) => {
    await page.goto('/')
    const heroSection = page.locator('main section').first()
    const links = heroSection.getByRole('link')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
    // 모든 히어로 CTA는 상대경로여야 한다 (vercel.app 절대 URL 회귀 방지)
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      expect(href, `hero CTA ${i} href`).toMatch(/^\//)
    }
    const firstHref = await links.first().getAttribute('href')
    await links.first().click()
    await expect(page).toHaveURL(new RegExp(`${firstHref}$`))
  })

  test('Worship page loads', async ({ page }) => {
    await page.goto('/worship')
    await expect(page.locator('h1', { hasText: '예배' })).toBeVisible()
  })

  test('Sermon page loads with in-site video cards', async ({ page }) => {
    await page.goto('/sermon')
    await expect(page.locator('h1', { hasText: '설교' })).toBeVisible()
    await expect(page.locator('a[href^="/sermon/"]').first()).toBeAttached()
  })

  test('Bulletins (/bulletins) page loads', async ({ page }) => {
    await page.goto('/bulletins')
    await expect(page.locator('h1', { hasText: '주보' })).toBeVisible()
  })

  test('Church news (/church-news) page loads', async ({ page }) => {
    await page.goto('/church-news')
    await expect(page.locator('h1', { hasText: '교회소식' })).toBeVisible()
  })

  test('Template leftover routes redirect home', async ({ page }) => {
    for (const path of ['/home', '/posts', '/search']) {
      const response = await page.goto(path)
      expect(response?.url().replace(/\/$/, '')).toBe(
        (await page.evaluate(() => window.location.origin)).replace(/\/$/, ''),
      )
    }
  })
})

test.describe('Mobile tests (375x667 - iPhone SE)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('Homepage loads on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).not.toBeEmpty()
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
    // 풋터 구성(주소/링크)은 CMS 데이터라 문구 대신 링크 존재를 확인한다
    expect(await footer.getByRole('link').count()).toBeGreaterThan(0)
  })
})
