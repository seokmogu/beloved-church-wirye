import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveInstagramSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { SiteSetting } from '@/payload-types'

type InstagramPost = NonNullable<SiteSetting['instagramPosts']>[number]

export default async function ManageInstagramPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
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
          {posts.map((post, index) => (
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
            </div>
          ))}
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
