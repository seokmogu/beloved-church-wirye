import Image from 'next/image'
import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import {
  saveInstagramSettingsAction,
  syncInstagramSettingsAction,
} from '@/app/(manage)/manage/actions'
import { hasInstagramSyncConfig } from '@/lib/instagram'
import { requireManageUser } from '@/lib/manage/auth'
import { toDateInputValue } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'
import type { Media, SiteSetting } from '@/payload-types'

type InstagramPost = NonNullable<SiteSetting['instagramPosts']>[number]
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
  const posts = padPosts(settings.instagramPosts)

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
        </div>

        <section className="manage-grid">
          <h2 className="manage-section-title">게시물</h2>
          {posts.map((post, index) => {
            const externalThumbnailUrl = getOptionalString(post.thumbnailUrl)
            const thumbnailUrl =
              getMediaUrl(post.thumbnail as Media | number | null | undefined) ||
              externalThumbnailUrl
            const thumbnailId = getMediaId(post.thumbnail as Media | number | null | undefined)

            return (
              <div className="manage-field-grid" key={index}>
                <div className="manage-field">
                  <label htmlFor={`instagramPostType-${index}`}>종류</label>
                  <select
                    defaultValue={post.type || 'p'}
                    id={`instagramPostType-${index}`}
                    name="instagramPostType"
                  >
                    <option value="p">게시물</option>
                    <option value="reel">릴스</option>
                  </select>
                </div>
                <div className="manage-field">
                  <label htmlFor={`instagramPostId-${index}`}>게시물 URL 또는 ID</label>
                  <input
                    defaultValue={post.postId || ''}
                    id={`instagramPostId-${index}`}
                    name="instagramPostId"
                    placeholder="https://www.instagram.com/p/... 붙여넣기"
                  />
                </div>
                <div className="manage-field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor={`instagramPostCaption-${index}`}>캡션/제목</label>
                  <textarea
                    defaultValue={post.caption || ''}
                    id={`instagramPostCaption-${index}`}
                    name="instagramPostCaption"
                    placeholder="게시물의 첫 문장, 안내 문구, 또는 짧은 제목"
                    rows={3}
                  />
                </div>
                <div className="manage-field">
                  <label htmlFor={`instagramPostPublishedAt-${index}`}>게시일</label>
                  <input
                    defaultValue={post.publishedAt ? toDateInputValue(post.publishedAt) : ''}
                    id={`instagramPostPublishedAt-${index}`}
                    name="instagramPostPublishedAt"
                    type="date"
                  />
                </div>
                <div className="manage-field">
                  <label htmlFor={`instagramPostHashtags-${index}`}>해시태그</label>
                  <input
                    defaultValue={post.hashtags || ''}
                    id={`instagramPostHashtags-${index}`}
                    name="instagramPostHashtags"
                    placeholder="#주일예배 #사랑하는교회"
                  />
                </div>
                <div className="manage-media-control" style={{ gridColumn: '1 / -1' }}>
                  <div>
                    <strong>썸네일 이미지</strong>
                    <div aria-hidden="true" className="manage-media-thumb">
                      {thumbnailUrl ? (
                        <Image alt="" height={90} src={thumbnailUrl} unoptimized width={96} />
                      ) : null}
                    </div>
                  </div>
                  <input
                    name={`instagramPostThumbnail-${index}`}
                    type="hidden"
                    value={thumbnailId ?? ''}
                  />
                  <input
                    name={`instagramPostThumbnailUrl-${index}`}
                    type="hidden"
                    value={externalThumbnailUrl ?? ''}
                  />
                  <label htmlFor={`instagramPostThumbnailFile-${index}`}>
                    이미지 선택
                    <input
                      accept="image/*"
                      id={`instagramPostThumbnailFile-${index}`}
                      name={`instagramPostThumbnailFile-${index}`}
                      type="file"
                    />
                  </label>
                  <label
                    className="manage-checkbox compact"
                    htmlFor={`instagramPostClearThumbnail-${index}`}
                  >
                    <input
                      id={`instagramPostClearThumbnail-${index}`}
                      name={`instagramPostClearThumbnail-${index}`}
                      type="checkbox"
                    />
                    제거
                  </label>
                </div>
              </div>
            )
          })}
        </section>

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

function padPosts(posts: SiteSetting['instagramPosts']): InstagramPost[] {
  const filled = [...(posts || [])]
  while (filled.length < 6) filled.push({ postId: '', type: 'p' })
  return filled
}

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function getMediaId(media: Media | number | null | undefined): number | null {
  if (typeof media === 'number') return media
  return media && typeof media === 'object' ? media.id : null
}

function getOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
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
