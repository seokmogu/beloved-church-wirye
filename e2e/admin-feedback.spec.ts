import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config.js'

const serverURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const adminEmail = process.env.MANAGE_TEST_ADMIN_EMAIL
const adminPassword = process.env.MANAGE_TEST_ADMIN_PASSWORD
const TEST_TITLE = `e2e-주보-${Date.now()}`
// 1x1 PNG; the server resizes/converts every upload to WebP.
const TEST_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
)

let payload: Payload

async function login(page: Page) {
  await page.goto(`${serverURL}/manage/login`, { waitUntil: 'networkidle' })
  if (page.url().replace(/\/$/, '') === `${serverURL}/manage`) return
  await page.fill('input[name=login]', adminEmail || '')
  await page.fill('input[name=password]', adminPassword || '')
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(/\/manage$/)
}

test.describe('church admin feedback', () => {
  test.skip(!adminEmail || !adminPassword, 'MANAGE_TEST_ADMIN_EMAIL/PASSWORD required')

  test.beforeAll(async () => {
    payload = await getPayload({ config })
  })

  test.afterAll(async () => {
    const res = await payload.find({
      collection: 'bulletins',
      where: { title: { like: 'e2e-주보-' } },
      limit: 50,
    })
    for (const doc of res.docs) {
      await payload.delete({ collection: 'bulletins', id: doc.id }).catch(() => {})
    }
  })

  test('항목1: /worship 에 예배 순서 섹션이 없다', async ({ page }) => {
    await page.goto(`${serverURL}/worship`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: '예배 순서' })).toHaveCount(0)
  })

  test('항목5: 공개 게시판이 교회로그로 표기된다', async ({ page }) => {
    await page.goto(`${serverURL}/announcements`, { waitUntil: 'networkidle' })
    await expect(page.getByText('교회로그').first()).toBeVisible()
  })

  test('어드민: 교회로그 nav / 교회소개 편집 / 이미지 업로드 / 리더 편집 노출', async ({ page }) => {
    await login(page)
    await expect(
      page.locator('a[href="/manage/announcements"]').filter({ hasText: '교회로그' }).first(),
    ).toBeVisible()

    await page.goto(`${serverURL}/manage/about`, { waitUntil: 'networkidle' })
    await expect(page.locator('input[name=churchVision]')).toBeVisible()

    await page.goto(`${serverURL}/manage/bulletins/new`, { waitUntil: 'networkidle' })
    await expect(page.locator('input[name=bulletinImageFiles]')).toBeVisible()

    await page.goto(`${serverURL}/manage/announcements/new`, { waitUntil: 'networkidle' })
    await expect(page.locator('input[name=announcementImageFiles]')).toBeVisible()

    await page.goto(`${serverURL}/manage/leaders`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: '추가 섬기는 사람들' })).toBeVisible()
    await expect(page.locator('input[name=leaderName]').first()).toBeVisible()
  })

  test('항목2: 주보에 이미지 업로드 → WebP로 저장되고 /bulletins 에 노출', async ({ page }) => {
    await login(page)
    await page.goto(`${serverURL}/manage/bulletins/new`, { waitUntil: 'networkidle' })
    await page.fill('input[name=title]', TEST_TITLE)
    await page
      .locator('input[name=bulletinImageFiles]')
      .setInputFiles({ buffer: TEST_PNG, mimeType: 'image/png', name: 'test.png' })

    await page.getByRole('button', { name: /저장/ }).first().click()
    const confirm = page.getByRole('button', { name: '저장하기' })
    if (await confirm.isVisible().catch(() => false)) await confirm.click()
    await page.waitForURL(/\/manage\/bulletins$/, { timeout: 30000 })

    const res = await payload.find({
      collection: 'bulletins',
      depth: 1,
      limit: 1,
      where: { title: { equals: TEST_TITLE } },
    })
    expect(res.docs.length).toBe(1)
    const images = (res.docs[0]?.images ?? []) as Array<{ image?: unknown }>
    expect(images.length).toBeGreaterThan(0)
    const media = images[0].image as { mimeType?: string } | undefined
    expect(media?.mimeType).toBe('image/webp')

    await page.goto(`${serverURL}/bulletins`, { waitUntil: 'networkidle' })
    await expect(page.getByText(TEST_TITLE)).toBeVisible()
  })
})
