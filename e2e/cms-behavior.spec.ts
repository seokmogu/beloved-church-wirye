import { test, expect } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config.js'

const serverURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

let payload: Payload
let originalSiteSettings: Record<string, unknown> | null = null
let originalHeader: Record<string, unknown> | null = null
let pageId: number | string | null = null
let announcementId: number | string | null = null
let sermonId: number | string | null = null

const runId = `e2e-${Date.now()}`
const managedPageSlug = `${runId}-managed-page`
const managedPageTitle = `${runId} 신규 페이지`
const hiddenAnnouncementTitle = `${runId} 숨김 공지`
const heroTitle = `${runId} 히어로`
const introTitle = `${runId} 소개`
const sermonSectionTitle = `${runId} 최신 설교`
const sermonTitle = `${runId} 동기화 설교`
const worshipName = `${runId} 새벽예배`
const disableRevalidate = { disableRevalidate: true }

function stripSystemFields<T extends Record<string, unknown> | null>(
  data: T,
): Record<string, unknown> {
  if (!data) return {}
  const { id, createdAt, updatedAt, globalType, ...rest } = data
  return rest
}

test.describe.configure({ mode: 'serial' })

test.describe('CMS controlled public behavior', () => {
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

    const page = await payload.create({
      collection: 'pages',
      data: {
        title: managedPageTitle,
        slug: managedPageSlug,
        hero: { type: 'none' },
        layout: [],
        _status: 'published',
      },
      context: disableRevalidate,
    })
    pageId = page.id

    const announcement = await payload.create({
      collection: 'announcements',
      data: {
        title: hiddenAnnouncementTitle,
        publishedAt: new Date().toISOString(),
        isPinned: true,
      },
      context: disableRevalidate,
    })
    announcementId = announcement.id

    const sermon = await payload.create({
      collection: 'sermons',
      data: {
        preacher: '사랑하는교회',
        sermonDate: new Date().toISOString(),
        status: 'published',
        title: sermonTitle,
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      context: disableRevalidate,
    })
    sermonId = sermon.id

    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              reference: {
                relationTo: 'pages',
                value: page.id,
              },
              label: managedPageTitle,
            },
          },
        ],
      },
      context: disableRevalidate,
    })

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        churchName: `${runId} 교회`,
        heroTitle,
        heroSubtitle: `${runId} 부제목`,
        subTagline: `${runId} 보조 문구`,
        worshipServices: [
          {
            name: worshipName,
            time: '화요일 오전 6시',
            description: `${runId} 예배 설명`,
          },
        ],
        homeSections: [
          {
            enabled: true,
            sectionType: 'intro',
            eyebrow: 'E2E INTRO',
            title: introTitle,
            description: `${runId} 소개 본문`,
          },
          {
            enabled: false,
            sectionType: 'announcements',
            eyebrow: 'E2E NOTICE',
            title: hiddenAnnouncementTitle,
          },
          {
            enabled: true,
            sectionType: 'sermons',
            eyebrow: 'E2E SERMON',
            title: sermonSectionTitle,
          },
          {
            enabled: true,
            sectionType: 'map',
            eyebrow: 'E2E LOCATION',
            title: `${runId} 위치`,
          },
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

    if (announcementId) {
      await payload.delete({
        collection: 'announcements',
        id: announcementId,
        context: disableRevalidate,
      })
    }
    if (pageId) {
      await payload.delete({ collection: 'pages', id: pageId, context: disableRevalidate })
    }
    if (sermonId) {
      await payload.delete({ collection: 'sermons', id: sermonId, context: disableRevalidate })
    }
  })

  test('renders CMS-managed hero, section visibility, and menu link on the homepage', async ({
    page,
  }) => {
    const response = await page.goto(`${serverURL}/`, { waitUntil: 'networkidle' })
    expect(response?.status()).toBeLessThan(400)

    await expect(page.locator('h1')).toContainText(heroTitle)
    await expect(page.getByRole('heading', { name: introTitle })).toBeVisible()
    await expect(page.getByText(hiddenAnnouncementTitle)).toHaveCount(0)

    const menuLink = page.getByRole('link', { name: managedPageTitle }).first()
    await expect(menuLink).toBeVisible()
    await menuLink.click()

    await expect(page).toHaveURL(`${serverURL}/${managedPageSlug}`)
    await expect(page.locator('body')).not.toContainText('This page could not be found')
  })

  test('renders the CMS sermon collection in the homepage latest sermon section', async ({
    page,
  }) => {
    const response = await page.goto(`${serverURL}/`, { waitUntil: 'networkidle' })
    expect(response?.status()).toBeLessThan(400)

    await expect(page.getByRole('heading', { name: sermonSectionTitle })).toBeVisible()

    const sermonLink = page.getByRole('link', { name: new RegExp(sermonTitle) }).first()
    await expect(sermonLink).toBeVisible()
    await expect(sermonLink).toHaveAttribute('href', /dQw4w9WgXcQ/)
  })

  test('renders CMS-managed worship service copy on the worship page', async ({ page }) => {
    const response = await page.goto(`${serverURL}/worship`, { waitUntil: 'networkidle' })
    expect(response?.status()).toBeLessThan(400)

    await expect(page.getByRole('heading', { name: worshipName })).toBeVisible()
    await expect(page.getByText('화요일 오전 6시')).toBeVisible()
  })

  test('renders announcements as a board page', async ({ page }) => {
    const response = await page.goto(`${serverURL}/announcements`, { waitUntil: 'networkidle' })
    expect(response?.status()).toBeLessThan(400)

    await expect(page.getByRole('heading', { name: '공지사항 게시판' })).toBeVisible()
    await expect(page.locator('body')).toContainText('전체')
    await expect(page.locator('body')).toContainText('번호')
    await expect(page.locator('body')).toContainText('제목')
    await expect(page.locator('body')).toContainText('작성일')
    await expect(page.getByRole('link', { name: hiddenAnnouncementTitle })).toBeVisible()
    await expect(page.locator('body')).toContainText('공지')
  })

  test('renders announcement detail as a board article', async ({ page }) => {
    const response = await page.goto(`${serverURL}/announcements/${announcementId}`, {
      waitUntil: 'networkidle',
    })
    expect(response?.status()).toBeLessThan(400)

    await expect(page.getByRole('heading', { name: '공지사항' })).toBeVisible()
    await expect(page.locator('body')).toContainText('공지사항 상세')
    await expect(page.getByRole('heading', { name: hiddenAnnouncementTitle })).toBeVisible()
    await expect(page.locator('body')).toContainText('번호')
    await expect(page.locator('body')).toContainText('작성일')
    await expect(page.locator('body')).toContainText('구분')
    await expect(page.locator('body')).toContainText('첨부')
    await expect(page.locator('body')).toContainText('고정 공지')
    await expect(page.getByRole('link', { name: '목록으로' }).first()).toBeVisible()
  })
})
