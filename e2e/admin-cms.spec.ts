import { test, expect } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config.js'

const shouldRun = process.env.RUN_ADMIN_CMS_TEST === '1'
const serverURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const disableRevalidate = { disableRevalidate: true }
const testUser = {
  email: 'playwright-admin@beloved.local',
  password: 'TestAdmin!2345',
  name: 'Playwright 관리자',
}

let payload: Payload
const createdPageIds: Array<number | string> = []

function idFromCollectionURL(url: string, collection: string): string | null {
  const { pathname } = new URL(url)
  const prefix = `/admin/collections/${collection}/`
  if (!pathname.startsWith(prefix)) return null

  const id = pathname.split('/').filter(Boolean).at(-1)
  return id && id !== 'create' ? id : null
}

test.skip(!shouldRun, 'Set RUN_ADMIN_CMS_TEST=1 to run authenticated admin CMS tests')
test.describe.configure({ mode: 'serial' })

test.describe('Authenticated admin CMS', () => {
  test.beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    await payload.delete({
      collection: 'users',
      where: { email: { equals: testUser.email } },
      context: disableRevalidate,
    })

    await payload.create({
      collection: 'users',
      data: testUser,
      context: disableRevalidate,
    })
  })

  test.afterAll(async () => {
    if (!payload) return

    await payload.delete({
      collection: 'users',
      where: { email: { equals: testUser.email } },
      context: disableRevalidate,
    })

    for (const id of createdPageIds) {
      await payload
        .delete({ collection: 'pages', id, context: disableRevalidate })
        .catch(() => null)
    }
  })

  test('shows a clear error when login credentials are incorrect', async ({ page }) => {
    await page.goto(`${serverURL}/admin/login`, { waitUntil: 'networkidle' })
    await page.locator('#field-email').fill(testUser.email)
    await page.locator('#field-password').fill('not-the-right-password')
    await page.locator('button[type="submit"]').click()

    await expect(page.getByTestId('admin-login-error')).toContainText('로그인에 실패했습니다')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test.describe('authenticated screens', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${serverURL}/admin/login`, { waitUntil: 'networkidle' })
      await page.locator('#field-email').fill(testUser.email)
      await page.locator('#field-password').fill(testUser.password)
      await page.locator('button[type="submit"]').click()
      await page.waitForURL(`${serverURL}/admin`, { timeout: 15000 })
    })

    test('loads dashboard after login', async ({ page }) => {
      await expect(page).toHaveTitle(/Payload/)
      await expect(page.locator('body')).toContainText('대시보드')
      await expect(page.locator('body')).toContainText('위례 사랑하는교회 사이트 관리')
      await expect(page.locator('body')).toContainText('홈페이지 빌더')
      await expect(page.locator('body')).toContainText('일반 페이지')
      await expect(page.locator('body')).toContainText('콘텐츠 게시판')

      await expect
        .poll(async () => page.locator('.nav-group__label').allTextContents())
        .toEqual([
          '1. 홈페이지 편집',
          '2. 페이지와 메뉴',
          '3. 콘텐츠 게시',
          '4. 새가족/계정',
          '5. 이미지/파일',
          '6. 고급 기능',
        ])
    })

    test('loads Site Settings global controls', async ({ page }) => {
      await page.goto(`${serverURL}/admin/globals/site-settings`, { waitUntil: 'networkidle' })
      await expect(page.locator('body')).toContainText('홈페이지 빌더')
      await expect(page.locator('body')).toContainText('홈 빌더')
      await expect(page.locator('body')).toContainText('1. 히어로 편집')
      await expect(page.locator('body')).toContainText('히어로 미리보기')
      await expect(page.locator('body')).toContainText('2. 섹션 편집')
      await expect(page.locator('body')).toContainText('섹션 미리보기')
      await expect(page.locator('body')).toContainText('섹션 역할')
      await expect(page.locator('body')).toContainText('섹션 설명/용도')
      await expect(page.locator('body')).toContainText('디자인')
      await expect(page.locator('body')).toContainText('교회 정보')
      await expect(page.locator('body')).toContainText('예배/오시는 길')
      await expect(page.locator('body')).toContainText('SNS/자동 연동')

      const heroTitle = `UT 히어로 ${Date.now()}`
      await page.locator('input[name="heroTitle"]').fill(heroTitle)
      await expect(page.locator('body')).toContainText(heroTitle)

      const sectionTitle = `UT 섹션 ${Date.now()}`
      const sectionDescription = `UT 섹션 설명 ${Date.now()}`
      await page.locator('input[name="homeSections.0.title"]').fill(sectionTitle)
      await page.locator('textarea[name="homeSections.0.description"]').fill(sectionDescription)
      await expect(page.locator('body')).toContainText(sectionTitle)
      await expect(page.locator('body')).toContainText(sectionDescription)

      const designTab = page.getByRole('tab', { name: '디자인' })
      if ((await designTab.count()) > 0) {
        await designTab.first().click()
      } else {
        await page.getByText('디자인', { exact: true }).first().click()
      }

      await expect(page.locator('body')).toContainText('디자인 미리보기')
      await expect(page.locator('body')).toContainText('메인 컬러')
      await expect(page.locator('body')).toContainText('사이트 열기')
    })

    test('shows editable logo controls in church information', async ({ page }) => {
      await page.goto(`${serverURL}/admin/globals/site-settings`, { waitUntil: 'networkidle' })

      const churchInfoTab = page.getByRole('tab', { name: '교회 정보', exact: true })
      if ((await churchInfoTab.count()) > 0) {
        await churchInfoTab.first().click()
      } else {
        await page.getByText('교회 정보', { exact: true }).first().click()
      }

      await expect(page.locator('body')).toContainText('로고')
      await expect(page.locator('body')).toContainText('상단 로고 크기')
      await expect(page.locator('input[name="headerLogoHeight"]')).toBeVisible()
      await expect(page.locator('body')).toContainText('상단 로고 색상 반전')
      await expect(page.locator('input[name="headerLogoInvert"]')).toBeVisible()
    })

    test('loads Header and Footer global controls', async ({ page }) => {
      await page.goto(`${serverURL}/admin/globals/header`, { waitUntil: 'networkidle' })
      await expect(page.locator('body')).toContainText('상단 메뉴')
      await expect(page.locator('body')).toContainText('메뉴 항목')
      await expect(page.locator('body')).toContainText('고정 페이지')
      await expect(page.locator('body')).toContainText('예배 안내')
      await expect(page.locator('body')).toContainText('최신 설교 보기')

      await page.goto(`${serverURL}/admin/globals/footer`, { waitUntil: 'networkidle' })
      await expect(page.locator('body')).toContainText('하단 메뉴/푸터')
      await expect(page.locator('body')).toContainText('Footer 링크')
      await expect(page.locator('body')).toContainText('예배 시간 안내')
    })

    test('shows announcement board guidance', async ({ page }) => {
      await page.goto(`${serverURL}/admin/collections/announcements`, { waitUntil: 'networkidle' })

      await expect(page.getByTestId('announcement-board-guide')).toBeVisible()
      await expect(page.locator('body')).toContainText('공지사항 게시판')
      await expect(page.locator('body')).toContainText('/announcements')
      await expect(page.locator('body')).toContainText('일반 페이지를 새로 만들 필요가 없습니다')
      await expect(page.locator('body')).toContainText('상단 메뉴 편집')
    })

    test('shows fixed pages in page management', async ({ page }) => {
      await page.goto(`${serverURL}/admin/collections/pages`, { waitUntil: 'networkidle' })

      await expect(page.getByTestId('fixed-pages-panel')).toBeVisible()
      await expect(page.locator('body')).toContainText('기본 페이지와 콘텐츠 게시판')
      await expect(page.locator('body')).toContainText('콘텐츠 게시판')
      await expect(page.locator('body')).toContainText('홈')
      await expect(page.locator('body')).toContainText('홈페이지 빌더에서 편집')
      await expect(page.locator('body')).toContainText('교회 소개')
      await expect(page.locator('body')).toContainText('/about')
      await expect(page.locator('body')).toContainText('교회 정보에서 편집')
      await expect(page.locator('body')).toContainText('예배 안내')
      await expect(page.locator('body')).toContainText('/worship')
      await expect(page.locator('body')).toContainText('예배/오시는 길에서 편집')
      await expect(page.locator('body')).toContainText('최신 설교')
      await expect(page.locator('body')).toContainText('/sermon')
      await expect(page.locator('body')).toContainText('설교를 작성하면 자동 표시')
      await expect(page.locator('body')).toContainText('공지사항')
      await expect(page.locator('body')).toContainText('/announcements')
      await expect(page.locator('body')).toContainText('공지 글을 작성하면 자동 표시')
      await expect(page.locator('body')).toContainText('주보')
      await expect(page.locator('body')).toContainText('/bulletins')
      await expect(page.locator('body')).toContainText('주보를 작성하면 자동 표시')
      await expect(page.locator('body')).toContainText('헌금 안내')
      await expect(page.locator('body')).toContainText('/offering')
      await expect(page.locator('body')).toContainText('헌금 안내 페이지에서 편집')
      await expect(page.locator('body')).toContainText('새가족 등록')
      await expect(page.locator('body')).toContainText('/newcomer')
      await expect(page.locator('body')).toContainText('고정 폼 페이지')
    })

    test('loads page builder create screen', async ({ page }) => {
      await page.goto(`${serverURL}/admin/collections/pages/create`, { waitUntil: 'networkidle' })
      const createdId = idFromCollectionURL(page.url(), 'pages')
      if (createdId) createdPageIds.push(createdId)

      await expect(page.locator('input[name="title"]')).toBeVisible()
      await page.locator('input[name="title"]').fill('테스트 페이지')
      await expect(page.locator('input[name="slug"]')).toBeVisible()
      await page.getByRole('button', { name: '잠금 해제' }).first().click()
      await page.locator('input[name="slug"]').fill('test-page-custom-url')
      await expect(page.locator('input[name="slug"]')).toHaveValue('test-page-custom-url')
      await expect(page.locator('body')).toContainText('URL 주소')
      await expect(page.locator('body')).toContainText('상위 페이지')
      await expect(page.locator('body')).not.toContainText('Breadcrumbs')
      await expect(page.locator('body')).not.toContainText('Parent')
      await expect(page.locator('body')).toContainText('페이지 내용')
      await expect(page.locator('body')).toContainText('상단 배너')
      await expect(page.locator('body')).toContainText('본문 블록')
    })
  })
})
