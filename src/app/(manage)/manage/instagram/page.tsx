import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveInstagramSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { Media, SiteSetting } from '@/payload-types'

type InstagramPost = NonNullable<SiteSetting['instagramPosts']>[number]

export default async function ManageInstagramPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const posts = padPosts(settings.instagramPosts)

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
        </div>

        <section className="manage-grid">
          <h2 className="manage-section-title">게시물</h2>
          {posts.map((post, index) => {
            const thumbnailUrl = getMediaUrl(post.thumbnail as Media | number | null | undefined)
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
                  <label htmlFor={`instagramPostId-${index}`}>게시물 ID</label>
                  <input
                    defaultValue={post.postId || ''}
                    id={`instagramPostId-${index}`}
                    name="instagramPostId"
                  />
                </div>
                <div className="manage-media-control" style={{ gridColumn: '1 / -1' }}>
                  <div>
                    <strong>썸네일 이미지</strong>
                    <div
                      aria-hidden="true"
                      className="manage-media-thumb"
                      style={thumbnailUrl ? { backgroundImage: cssUrl(thumbnailUrl) } : undefined}
                    />
                  </div>
                  <input
                    name={`instagramPostThumbnail-${index}`}
                    type="hidden"
                    value={thumbnailId ?? ''}
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
                  <label className="manage-checkbox compact" htmlFor={`instagramPostClearThumbnail-${index}`}>
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

function cssUrl(url: string) {
  return `url(${JSON.stringify(url)})`
}
