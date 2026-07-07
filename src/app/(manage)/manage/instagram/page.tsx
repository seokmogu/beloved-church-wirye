import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import {
  saveInstagramSettingsAction,
  syncInstagramSettingsAction,
} from '@/app/(manage)/manage/actions'
import { hasInstagramSyncConfig } from '@/lib/instagram'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { SiteSetting } from '@/payload-types'

import { InstagramPostsEditor, type EditorPost } from './InstagramPostsEditor'

type InstagramSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ManageInstagramPage({
  searchParams,
}: {
  searchParams: InstagramSearchParams
}) {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const params = await searchParams
  const syncStatus = getStringParam(params.sync)
  const syncedCount = getStringParam(params.count)
  const canSyncInstagram = hasInstagramSyncConfig()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const posts = toEditorPosts(settings.instagramPosts)

  return (
    <ManageShell active="instagram" user={user}>
      <PageHeader
        description="메인 화면 인스타그램 섹션의 계정 링크와 게시물 노출을 관리합니다."
        title="인스타그램"
      />

      {syncStatus ? (
        <div
          className={`manage-alert${syncStatus === 'failed' || syncStatus === 'missing-config' ? ' danger' : ''}`}
          role="status"
        >
          {syncMessage(syncStatus, syncedCount)}
        </div>
      ) : null}

      <section className="manage-sync-panel">
        <div>
          <h2>최신 게시물 자동 동기화</h2>
          <p>
            Instagram 공식 API는 개인 계정 자동 피드를 지원하지 않습니다. Business 또는 Creator 계정
            토큰이 있으면 최신 게시물, 캡션, 날짜, 썸네일을 최신순으로 갱신합니다.
          </p>
        </div>
        <form action={syncInstagramSettingsAction}>
          <SaveButton label={canSyncInstagram ? '최신 게시물 동기화' : '연동 설정 필요'} />
        </form>
      </section>

      {!canSyncInstagram ? (
        <div className="manage-alert" role="status">
          자동 동기화에는 Vercel 환경 변수 <strong>INSTAGRAM_ACCESS_TOKEN</strong>이 필요합니다.
          개인 계정은 공식 자동 연동이 막혀 있어, 계정 전환 전에는 아래 수동 입력으로 운영합니다.
        </div>
      ) : null}

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
              defaultValue={settings.instagramDisplayCount ? String(settings.instagramDisplayCount) : ''}
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




function getStringParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function syncMessage(status: string, count: string) {
  if (status === 'success') {
    return `${count || '0'}개 Instagram 게시물을 최신순으로 동기화했습니다.`
  }
  if (status === 'missing-config') {
    return 'Instagram 자동 동기화 환경 변수가 아직 설정되지 않았습니다.'
  }
  return 'Instagram 최신 게시물 동기화에 실패했습니다. 토큰 권한과 계정 설정을 확인해 주세요.'
}
