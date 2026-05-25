import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config.js'

const serverURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const adminEmail = process.env.MANAGE_TEST_ADMIN_EMAIL
const adminPassword = process.env.MANAGE_TEST_ADMIN_PASSWORD
const runId = `manage-e2e-${Date.now()}`
const instagramPostId = `C7${Date.now()}`
const disableRevalidate = { disableRevalidate: true }

let payload: Payload
let originalSiteSettings: Record<string, unknown> | null = null
let originalHeader: Record<string, unknown> | null = null
let originalOffering: Record<string, unknown> | null = null

function stripSystemFields<T extends Record<string, unknown> | null>(
  data: T,
): Record<string, unknown> {
  if (!data) return {}
  const { id, createdAt, updatedAt, globalType, ...rest } = data
  return rest
}

async function login(page: Page) {
  await page.goto(`${serverURL}/manage/login`, { waitUntil: 'networkidle' })

  if (page.url().replace(/\/$/, '') === `${serverURL}/manage`) return

  await page.fill('input[name=email]', adminEmail || '')
  await page.fill('input[name=password]', adminPassword || '')
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(/\/manage$/)
  await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
}

async function save(page: Page) {
  const currentPath = new URL(page.url()).pathname
  await page.getByRole('button', { name: /저장/ }).click()
  await expect(page.getByRole('dialog', { name: '변경사항을 저장할까요?' })).toBeVisible()
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === currentPath &&
        response.status() < 400,
    ),
    page.getByRole('button', { name: '저장하기' }).click(),
  ])
  await page.waitForLoadState('networkidle')
}

async function deleteByTitle(collection: 'announcements' | 'bulletins' | 'sermons', title: string) {
  const result = await payload.find({
    collection,
    limit: 20,
    where: { title: { equals: title } },
  })

  await Promise.all(
    result.docs.map((doc) =>
      payload.delete({ collection, context: disableRevalidate, id: doc.id }),
    ),
  )
}

async function deleteMediaByAlt(alt: string) {
  const result = await payload.find({
    collection: 'media',
    limit: 20,
    where: { alt: { equals: alt } },
  })

  await Promise.all(
    result.docs.map((doc) =>
      payload.delete({ collection: 'media', context: disableRevalidate, id: doc.id }),
    ),
  )
}

test.describe.configure({ mode: 'serial' })
test.skip(!adminEmail || !adminPassword, 'MANAGE_TEST_ADMIN_EMAIL/PASSWORD required')

test.describe('custom manage admin linkage', () => {
  test.beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    originalSiteSettings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })) as unknown as Record<string, unknown>
    originalHeader = (await payload.findGlobal({ slug: 'header', depth: 0 })) as unknown as Record<
      string,
      unknown
    >
    originalOffering = (await payload.findGlobal({
      slug: 'offering-page',
      depth: 0,
    })) as unknown as Record<string, unknown>

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        homeSections: [
          { enabled: true, sectionType: 'intro', eyebrow: 'ABOUT', title: `${runId} 소개` },
          { enabled: true, sectionType: 'announcements', eyebrow: 'NOTICE', title: '교회 소식' },
          { enabled: true, sectionType: 'sermons', eyebrow: 'SERMON', title: '최신 설교' },
          { enabled: true, sectionType: 'instagram', eyebrow: 'INSTAGRAM', title: '인스타그램' },
          { enabled: true, sectionType: 'map', eyebrow: 'LOCATION', title: '오시는 길' },
        ],
      },
      context: disableRevalidate,
    })
  })

  test.afterAll(async () => {
    if (!payload) return

    await payload.updateGlobal({
      slug: 'site-settings',
      data: stripSystemFields(originalSiteSettings),
      context: disableRevalidate,
    })
    await payload.updateGlobal({
      slug: 'header',
      data: stripSystemFields(originalHeader),
      context: disableRevalidate,
    })
    await payload.updateGlobal({
      slug: 'offering-page',
      data: stripSystemFields(originalOffering),
      context: disableRevalidate,
    })

    await deleteByTitle('sermons', `${runId} 설교`)
    await deleteByTitle('announcements', `${runId} 공지`)
    await deleteByTitle('bulletins', `${runId} 주보`)
    await deleteMediaByAlt(`Instagram 게시물 ${instagramPostId} 썸네일`)
  })

  test('shows the admin guide and every page-specific manager route', async ({ page }) => {
    await login(page)

    const guideNavLink = page.locator('.manage-nav').getByRole('link', { name: '관리 가이드' })
    await expect(guideNavLink).toBeVisible()
    await guideNavLink.click()
    await expect(page).toHaveURL(`${serverURL}/manage/guide`)
    await expect(page.getByRole('heading', { name: '관리 가이드' })).toBeVisible()

    for (const label of [
      '홈 관리',
      '예배 안내',
      '설교',
      '인스타그램',
      '공지사항',
      '주보',
      '헌금 안내',
      '상단 배너',
      '메뉴 관리',
    ]) {
      await expect(page.locator('article').filter({ hasText: label }).first()).toBeVisible()
    }
  })

  test('saves global manager forms and reflects them on public pages', async ({ page }) => {
    await login(page)

    await page.goto(`${serverURL}/manage/home`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: '홈 관리' })).toBeVisible()
    await page.fill('#heroTitle', `${runId} 히어로`)
    await page.fill('#heroSubtitle', `${runId} 히어로 부제목`)
    await expect(page.locator('#heroImageFile')).toBeVisible()
    await expect(page.locator('#pageBackgroundImageFile')).toBeVisible()
    await page.locator('#primaryColor').evaluate((element) => {
      const input = element as HTMLInputElement
      input.value = '#24513b'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await page.locator('#secondaryColor').evaluate((element) => {
      const input = element as HTMLInputElement
      input.value = '#efe1bd'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await page.fill('#heroTitleFontSize', '72')
    await page.fill('#sectionTitleFontSize', '44')
    await save(page)
    await page.goto(`${serverURL}/`, { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(`${runId} 히어로`)
    const themeCSS = await page.locator('#church-theme').textContent()
    expect(themeCSS).toContain('--primary: #24513b')
    expect(themeCSS).toContain('--church-hero-title-size: 72px')
    expect(themeCSS).toContain('--church-section-title-size: 44px')

    await page.goto(`${serverURL}/manage/worship`, { waitUntil: 'networkidle' })
    await page.fill('#worshipServiceName-0', `${runId} 예배`)
    await page.fill('#worshipServiceTime-0', '주일 오전 11시')
    await page.fill('#worshipServiceDescription-0', `${runId} 예배 설명`)
    await save(page)
    await page.goto(`${serverURL}/worship`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: `${runId} 예배` })).toBeVisible()
    await expect(page.getByText('주일 오전 11시')).toBeVisible()

    await page.goto(`${serverURL}/manage/instagram`, { waitUntil: 'networkidle' })
    await page.fill('#instagramUrl', 'https://www.instagram.com/manage-e2e/')
    await page.fill('#instagramHandle', '@manage-e2e')
    await page.selectOption('#instagramPostType-0', 'p')
    await page.fill('#instagramPostId-0', instagramPostId)
    await page.setInputFiles('#instagramPostThumbnailFile-0', 'public/logo-beloved.png')
    await save(page)
    await page.goto(`${serverURL}/`, { waitUntil: 'networkidle' })
    await expect(
      page.locator('a[href="https://www.instagram.com/manage-e2e/"]').first(),
    ).toHaveAttribute('href', 'https://www.instagram.com/manage-e2e/')
    const instagramCard = page.locator(`a[href="https://www.instagram.com/p/${instagramPostId}/"]`)
    await expect(instagramCard).toBeVisible()
    await expect(instagramCard.locator('img')).toBeVisible()

    await page.goto(`${serverURL}/manage/offering`, { waitUntil: 'networkidle' })
    await page.fill('#introText', `${runId} 헌금 소개`)
    await page.fill('#bankName-0', '관리테스트은행')
    await page.fill('#accountNumber-0', '999-111-2222')
    await page.fill('#accountHolder-0', `${runId} 예금주`)
    await page.fill('#offeringTypeTitle-0', `${runId} 헌금`)
    await page.fill('#offeringTypeDescription-0', `${runId} 헌금 설명`)
    await save(page)
    await page.goto(`${serverURL}/offering`, { waitUntil: 'networkidle' })
    await expect(page.getByText(`${runId} 헌금 소개`)).toBeVisible()
    await expect(page.getByText('관리테스트은행')).toBeVisible()
    await expect(page.getByRole('heading', { name: `${runId} 헌금` })).toBeVisible()

    await page.goto(`${serverURL}/manage/menu`, { waitUntil: 'networkidle' })
    await page.fill('#menuLabel-0', `${runId} 헌금 메뉴`)
    await page.selectOption('#menuType-0', 'internal')
    await page.selectOption('#menuInternalPath-0', '/offering')
    await save(page)
    await page.goto(`${serverURL}/`, { waitUntil: 'networkidle' })
    await page
      .getByRole('link', { name: `${runId} 헌금 메뉴` })
      .first()
      .click()
    await expect(page).toHaveURL(`${serverURL}/offering`)
  })

  test('saves collection manager forms and reflects them on public pages', async ({ page }) => {
    await login(page)

    await page.goto(`${serverURL}/manage/sermons/new`, { waitUntil: 'networkidle' })
    await page.fill('#title', `${runId} 설교`)
    await page.fill('#youtubeUrl', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await page.fill('#sermonDate', '2026-05-24')
    await save(page)
    await page.goto(`${serverURL}/`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('link', { name: new RegExp(`${runId} 설교`) })).toBeVisible()
    await page.goto(`${serverURL}/sermon`, { waitUntil: 'networkidle' })
    await expect(page.getByText(`${runId} 설교`)).toBeVisible()

    await page.goto(`${serverURL}/manage/announcements/new`, { waitUntil: 'networkidle' })
    await page.fill('#title', `${runId} 공지`)
    await page.fill('#content', `${runId} 공지 내용`)
    await page.fill('#publishedAt', '2026-05-24T09:00')
    await save(page)
    await page.goto(`${serverURL}/announcements`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('link', { name: `${runId} 공지` })).toBeVisible()

    await page.goto(`${serverURL}/manage/bulletins/new`, { waitUntil: 'networkidle' })
    await page.fill('#title', `${runId} 주보`)
    await page.fill('#date', '2026-05-24')
    await page.fill('#description', `${runId} 주보 설명`)
    await save(page)
    await page.goto(`${serverURL}/bulletins`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: `${runId} 주보` })).toBeVisible()
    await expect(page.getByText(`${runId} 주보 설명`)).toBeVisible()
  })
})
