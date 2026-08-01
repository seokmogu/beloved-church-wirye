import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveInstagramSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { SiteSetting } from '@/payload-types'

import { InstagramPostsEditor, type EditorPost } from './InstagramPostsEditor'

export default async function ManageInstagramPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const posts = toEditorPosts(settings.instagramPosts)

  return (
    <ManageShell active="instagram" user={user}>
      <PageHeader
        description="메인 화면 인스타그램 섹션의 계정 링크와 게시물 노출을 관리합니다."
        title="인스타그램"
      />

      <form action={saveInstagramSettingsAction} className="manage-form">
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="instagramUrl">Instagram URL</label>
            <input
              defaultValue={settings.instagramUrl || ''}
              id="instagramUrl"
              name="instagramUrl"
              type="url"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="instagramHandle">계정명</label>
            <input
              defaultValue={settings.instagramHandle || ''}
              id="instagramHandle"
              name="instagramHandle"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="instagramDisplayCount">홈 노출 개수</label>
            <select
              defaultValue={
                settings.instagramDisplayCount ? String(settings.instagramDisplayCount) : ''
              }
              id="instagramDisplayCount"
              name="instagramDisplayCount"
            >
              <option value="">전체</option>
              <option value="4">4개</option>
              <option value="8">8개</option>
              <option value="12">12개</option>
            </select>
            <p className="manage-empty-hint">
              4의 배수를 권장합니다 — 데스크탑(4열)·태블릿(2열)·모바일(1열) 모두 빈칸 없이
              표시됩니다.
            </p>
          </div>
        </div>

        <InstagramPostsEditor initialPosts={posts} />

        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage">
            취소
          </Link>
          <SaveButton />
        </div>
      </form>
    </ManageShell>
  )
}

function toEditorPosts(posts: SiteSetting['instagramPosts']): EditorPost[] {
  return (posts || [])
    .filter((post) => post.postId)
    .map((post) => ({
      postId: post.postId || '',
      type: post.type === 'reel' ? ('reel' as const) : ('p' as const),
    }))
}
