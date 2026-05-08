import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config.js'

const shouldRun = process.env.RUN_ADMIN_CMS_TEST === '1'
const serverURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const disableRevalidate = { disableRevalidate: true }
const runId = `church-admin-${Date.now()}`
const testUser = {
  email: `persona-${runId}@beloved.local`,
  password: 'TestAdmin!2345',
  name: '교회 관리자',
}

let payload: Payload
let originalSiteSettings: Record<string, unknown> | null = null
const createdAnnouncementIds: Array<number | string> = []
const createdMediaIds: Array<number | string> = []
const createdSermonIds: Array<number | string> = []
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beloved-cms-e2e-'))
const imagePath = path.join(tempDir, 'church-notice.png')
const pdfPath = path.join(tempDir, 'weekly-bulletin.pdf')

const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
)
const tinyPDF = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 20 100 Td (Beloved bulletin) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000202 00000 n 
trailer
<< /Root 1 0 R /Size 5 >>
startxref
295
%%EOF`

test.skip(!shouldRun, 'Set RUN_ADMIN_CMS_TEST=1 to run mutating admin persona tests')
test.setTimeout(60000)
test.describe.configure({ mode: 'serial' })

function stripSystemFields(data: Record<string, unknown> | null): Record<string, unknown> {
  if (!data) return {}
  const { id, createdAt, updatedAt, globalType, ...rest } = data
  return rest
}

async function loginAsChurchAdmin(page: Page) {
  await page.goto(`${serverURL}/admin/login`, { waitUntil: 'networkidle' })
  await page.locator('#field-email').fill(testUser.email)
  await page.locator('#field-password').fill(testUser.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(`${serverURL}/admin`, { timeout: 20000 })
}

async function clickSave(page: Page) {
  const saveButton = page.getByRole('button', { name: '저장' }).first()
  await expect(saveButton).toBeEnabled()
  await saveButton.click()
}

function idFromCurrentURL(page: Page) {
  const id = new URL(page.url()).pathname.split('/').filter(Boolean).at(-1)
  if (!id || id === 'create') throw new Error(`Could not parse document id from ${page.url()}`)
  return id
}

async function waitForCreatedCollectionDocument(page: Page, collection: string) {
  const pathPrefix = `/admin/collections/${collection}/`

  await expect
    .poll(
      async () => {
        const { pathname } = new URL(page.url())
        if (!pathname.startsWith(pathPrefix)) return ''

        const id = pathname.split('/').filter(Boolean).at(-1)
        return id && id !== 'create' ? id : ''
      },
      { timeout: 20000 },
    )
    .not.toBe('')

  return idFromCurrentURL(page)
}

test.describe('교회 관리자 CMS 실제 작업 흐름', () => {
  test.beforeAll(async () => {
    fs.writeFileSync(imagePath, png1x1)
    fs.writeFileSync(pdfPath, tinyPDF)

    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    originalSiteSettings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })) as unknown as Record<string, unknown>

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
    if (payload) {
      await payload.updateGlobal({
        slug: 'site-settings',
        data: stripSystemFields(originalSiteSettings),
        context: disableRevalidate,
      })

      for (const id of createdAnnouncementIds) {
        await payload
          .delete({ collection: 'announcements', id, context: disableRevalidate })
          .catch(() => null)
      }
      await payload
        .delete({
          collection: 'announcements',
          where: { title: { contains: runId } },
          context: disableRevalidate,
        })
        .catch(() => null)

      for (const id of createdSermonIds) {
        await payload
          .delete({ collection: 'sermons', id, context: disableRevalidate })
          .catch(() => null)
      }
      await payload
        .delete({
          collection: 'sermons',
          where: { title: { contains: runId } },
          context: disableRevalidate,
        })
        .catch(() => null)

      for (const id of createdMediaIds) {
        await payload
          .delete({ collection: 'media', id, context: disableRevalidate })
          .catch(() => null)
      }
      await payload
        .delete({
          collection: 'media',
          where: { alt: { contains: runId } },
          context: disableRevalidate,
        })
        .catch(() => null)

      await payload.delete({
        collection: 'users',
        where: { email: { equals: testUser.email } },
        context: disableRevalidate,
      })
    }

    fs.rmSync(tempDir, { force: true, recursive: true })
  })

  test.beforeEach(async ({ page }) => {
    await loginAsChurchAdmin(page)
  })

  test('담당자가 공지사항을 만들고 수정하고 삭제할 수 있다', async ({ page }) => {
    const title = `${runId} 주일예배 안내`
    const updatedTitle = `${runId} 주일예배 안내 수정`

    await page.goto(`${serverURL}/admin/collections/announcements/create`, {
      waitUntil: 'networkidle',
    })
    await page.locator('input[name="title"]').fill(title)
    await expect(page.getByText('공지 미리보기')).toBeVisible()
    await expect(page.getByTestId('announcement-preview-title')).toContainText(title)
    await clickSave(page)

    const createdId = await waitForCreatedCollectionDocument(page, 'announcements')
    createdAnnouncementIds.push(createdId)
    await expect
      .poll(async () => {
        const doc = await payload.findByID({ collection: 'announcements', id: createdId, depth: 0 })
        return doc.title
      })
      .toBe(title)

    await page.goto(`${serverURL}/announcements/${createdId}`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: title })).toBeVisible()

    await page.goto(`${serverURL}/admin/collections/announcements/${createdId}`, {
      waitUntil: 'networkidle',
    })
    await page.locator('input[name="title"]').fill(updatedTitle)
    await clickSave(page)
    await expect
      .poll(async () => {
        const doc = await payload.findByID({ collection: 'announcements', id: createdId, depth: 0 })
        return doc.title
      })
      .toBe(updatedTitle)

    await page.locator('button.popup-button').first().click()
    await page.getByRole('button', { name: '삭제' }).last().click()
    await expect(page.getByRole('dialog')).toContainText('삭제하시겠습니까?')
    await page.getByRole('button', { name: '확인' }).click()
    await page.waitForURL(/\/admin\/collections\/announcements$/, { timeout: 20000 })

    await expect
      .poll(async () => {
        const result = await payload.find({
          collection: 'announcements',
          where: { id: { equals: createdId } },
        })
        return result.totalDocs
      })
      .toBe(0)
  })

  test('담당자가 슬러그와 공개 상태를 몰라도 설교를 등록할 수 있다', async ({ page }) => {
    const title = `${runId} 쉬운 설교 등록`

    await page.goto(`${serverURL}/admin/collections/sermons/create`, { waitUntil: 'networkidle' })
    await expect(page.locator('input[name="slug"]')).toBeVisible()
    await expect(page.locator('body')).toContainText('URL 주소')
    await expect(page.locator('body')).toContainText('공개 상태')

    await page.locator('input[name="title"]').fill(title)
    await page
      .locator('input[name="youtubeUrl"]')
      .fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await clickSave(page)

    const createdId = await waitForCreatedCollectionDocument(page, 'sermons')
    createdSermonIds.push(createdId)
    await expect
      .poll(async () => {
        const doc = await payload.findByID({ collection: 'sermons', id: createdId, depth: 0 })
        return {
          preacher: doc.preacher,
          slugIncludesTitle: String(doc.slug).includes('쉬운-설교-등록'),
          status: doc.status,
          title: doc.title,
          youtubeId: doc.youtubeId,
        }
      })
      .toEqual({
        preacher: '사랑하는교회',
        slugIncludesTitle: true,
        status: 'published',
        title,
        youtubeId: 'dQw4w9WgXcQ',
      })
  })

  test('디자인 색상을 컬러피커로 바꾸고 저장할 수 있다', async ({ page }) => {
    await page.goto(`${serverURL}/admin/globals/site-settings`, { waitUntil: 'networkidle' })

    const designTab = page.getByRole('tab', { name: '디자인', exact: true })
    if ((await designTab.count()) > 0) {
      await designTab.first().click()
    } else {
      await page.getByText('디자인', { exact: true }).first().click()
    }

    const primaryPicker = page.getByTestId('color-picker-design-primaryColor')
    await expect(primaryPicker).toHaveAttribute('type', 'color')
    await primaryPicker.fill('#335577')
    await expect(page.locator('input[name="design.primaryColor"]')).toHaveValue('#335577')

    await clickSave(page)
    await expect
      .poll(async () => {
        const settings = (await payload.findGlobal({
          slug: 'site-settings',
          depth: 0,
        })) as unknown as { design?: { primaryColor?: string } }
        return settings.design?.primaryColor
      })
      .toBe('#335577')
  })

  test('이미지 파일과 PDF 파일을 실제 CMS 업로드 화면에서 올릴 수 있다', async ({ page }) => {
    await page.goto(`${serverURL}/admin/collections/media/create`, { waitUntil: 'networkidle' })
    await page.locator('input[type="file"]').setInputFiles(imagePath)
    await page.locator('input[name="alt"]').fill(`${runId} 교회 이미지`)
    await clickSave(page)

    const imageId = await waitForCreatedCollectionDocument(page, 'media')
    createdMediaIds.push(imageId)
    await expect
      .poll(async () => {
        const doc = await payload.findByID({ collection: 'media', id: imageId, depth: 0 })
        return { alt: doc.alt, filename: doc.filename, mimeType: doc.mimeType }
      })
      .toEqual({
        alt: `${runId} 교회 이미지`,
        filename: 'church-notice.png',
        mimeType: 'image/png',
      })

    await page.goto(`${serverURL}/admin/collections/media/create`, { waitUntil: 'networkidle' })
    await page.locator('input[type="file"]').setInputFiles(pdfPath)
    await page.locator('input[name="alt"]').fill(`${runId} 주보 PDF`)
    await clickSave(page)

    const pdfId = await waitForCreatedCollectionDocument(page, 'media')
    createdMediaIds.push(pdfId)
    await expect
      .poll(async () => {
        const doc = await payload.findByID({ collection: 'media', id: pdfId, depth: 0 })
        return { alt: doc.alt, filename: doc.filename, mimeType: doc.mimeType }
      })
      .toEqual({
        alt: `${runId} 주보 PDF`,
        filename: 'weekly-bulletin.pdf',
        mimeType: 'application/pdf',
      })
  })

  test('담당자가 주요 메뉴를 헷갈리지 않고 찾을 수 있다', async ({ page }) => {
    await expect(page.locator('body')).toContainText('위례 사랑하는교회 사이트 관리')
    await expect(page.locator('body')).toContainText('홈페이지 빌더')
    await expect(page.locator('body')).toContainText('콘텐츠 게시')
    await expect(page.locator('body')).toContainText('이미지/파일')
    await expect(page.locator('body')).toContainText('6. 고급 기능')
  })
})
