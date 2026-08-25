import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'

const manageLogin = process.env.E2E_MANAGE_LOGIN
const managePassword = process.env.E2E_MANAGE_PASSWORD

const managerRoutes = [
  '/manage',
  '/manage/home',
  '/manage/about',
  '/manage/worship',
  '/manage/announcements',
  '/manage/church-news',
  '/manage/bulletins',
  '/manage/sermons',
  '/manage/videos',
  '/manage/gallery',
  '/manage/newcomers',
  '/manage/offering',
  '/manage/banner',
  '/manage/instagram',
  '/manage/leaders',
  '/manage/menu',
  '/manage/admins',
  '/manage/guide',
]

test.describe('관리자 Preview E2E', () => {
  test.skip(!manageLogin || !managePassword, 'E2E_MANAGE_LOGIN/PASSWORD가 필요합니다.')
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await login({ page, login: manageLogin!, password: managePassword! })
  })

  test('로그인 후 모든 관리자 최상위 화면을 연다', async ({ page }) => {
    for (const route of managerRoutes) {
      const response = await page.goto(route, { waitUntil: 'networkidle' })

      expect(response?.ok(), `${route}가 정상 응답해야 합니다.`).toBeTruthy()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.getByRole('heading').first()).toBeVisible()
    }
  })

  test('교회로그를 생성하고 수정한 뒤 삭제한다', async ({ page }) => {
    const timestamp = Date.now()
    const initialTitle = `E2E 임시 교회로그 ${timestamp}`
    const updatedTitle = `${initialTitle} 수정`
    const publishedAt = new Date().toISOString().slice(0, 16)
    let editPath: string | null = null

    try {
      await page.goto('/manage/announcements/new', { waitUntil: 'networkidle' })
      await page.getByLabel('제목').fill(initialTitle)
      await page.getByLabel('내용').fill('Preview E2E 검증용 임시 콘텐츠입니다.')
      await page.getByLabel('게시일').fill(publishedAt)
      await saveAndConfirm(page)
      await page.waitForURL(/\/manage\/announcements$/)

      const createdRow = page.locator('tr').filter({ hasText: initialTitle })
      await expect(createdRow).toBeVisible()
      editPath = await createdRow.getByRole('link', { name: '편집' }).getAttribute('href')
      expect(editPath).toMatch(/^\/manage\/announcements\/\d+$/)

      await page.goto(editPath!, { waitUntil: 'networkidle' })
      await page.getByLabel('제목').fill(updatedTitle)
      await saveAndConfirm(page)
      await page.waitForURL(/\/manage\/announcements$/)
      await expect(page.locator('tr').filter({ hasText: updatedTitle })).toBeVisible()

      await page.goto(editPath!, { waitUntil: 'networkidle' })
      await deleteAndAccept(page)
      await page.waitForURL(/\/manage\/announcements$/)
      await expect(page.locator('tr').filter({ hasText: updatedTitle })).toHaveCount(0)
      editPath = null
    } finally {
      // Keep the shared development database clean if an assertion above fails.
      if (editPath) {
        await page.goto(editPath, { waitUntil: 'networkidle' }).catch(() => undefined)
        if (await page.getByRole('button', { name: '삭제', exact: true }).isVisible().catch(() => false)) {
          await deleteAndAccept(page).catch(() => undefined)
        }
      }
    }
  })
})

async function saveAndConfirm(page: Parameters<typeof login>[0]['page']) {
  await page.getByRole('button', { name: '저장', exact: true }).click()
  const confirmation = page.getByRole('dialog', { name: '변경사항을 저장할까요?' })
  await expect(confirmation).toBeVisible()
  await confirmation.getByRole('button', { name: '저장하기', exact: true }).click()
}

async function deleteAndAccept(page: Parameters<typeof login>[0]['page']) {
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '삭제', exact: true }).click()
}
