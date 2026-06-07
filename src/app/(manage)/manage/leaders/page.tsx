import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveLeadersSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { Media } from '@/payload-types'

export default async function ManageLeadersPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const pastorPhotoUrl = getMediaUrl(settings.pastorPhoto as Media | number | null | undefined)

  return (
    <ManageShell active="leaders" user={user}>
      <PageHeader
        description="섬기는 사람들 페이지에 표시되는 담임목사 소개와 사진을 관리합니다."
        title="섬기는 사람들"
      >
        <Link className="manage-button secondary" href="/about/leaders" target="_blank">
          공개페이지 보기
        </Link>
      </PageHeader>
      <form action={saveLeadersSettingsAction} className="manage-visual-form manage-public-editor">
        <div className="manage-editor-toolbar">
          <Link className="manage-button secondary" href="/manage">
            취소
          </Link>
          <SaveButton />
        </div>

        <div className="manage-public-canvas">
          <section className="manage-public-hero">
            <p>LEADERS</p>
            <h2>섬기는 사람들</h2>
            <span>사랑하는교회를 말씀과 섬김으로 세워갑니다</span>
          </section>

          <section className="manage-public-section">
            <div className="manage-public-section-head">
              <div>
                <p>Senior Pastor</p>
                <h2>담임목사 소개</h2>
              </div>
              <span className="manage-scope-chip">/about/leaders 본문 영역</span>
            </div>

            <div className="manage-leader-editor-layout">
              <aside className="manage-public-photo-editor">
                <div
                  aria-hidden="true"
                  className="manage-public-photo-preview"
                  style={pastorPhotoUrl ? { backgroundImage: cssUrl(pastorPhotoUrl) } : undefined}
                >
                  {pastorPhotoUrl ? null : <span>사진 준비 중</span>}
                </div>
                <label htmlFor="pastorPhotoFile">
                  사진 변경
                  <input accept="image/*" id="pastorPhotoFile" name="pastorPhotoFile" type="file" />
                </label>
                <label className="manage-checkbox compact" htmlFor="clearPastorPhoto">
                  <input id="clearPastorPhoto" name="clearPastorPhoto" type="checkbox" />
                  사진 제거
                </label>
              </aside>

              <article className="manage-public-card edit-card">
                <label className="manage-visual-field accent" htmlFor="pastorTitle">
                  <span>직함</span>
                  <input
                    defaultValue={settings.pastorTitle || ''}
                    id="pastorTitle"
                    name="pastorTitle"
                  />
                </label>
                <label className="manage-visual-field heading" htmlFor="pastorName">
                  <span>이름</span>
                  <input
                    defaultValue={settings.pastorName || ''}
                    id="pastorName"
                    name="pastorName"
                  />
                </label>
                <label className="manage-visual-field muted" htmlFor="pastorBio">
                  <span>소개</span>
                  <textarea
                    defaultValue={settings.pastorBio || ''}
                    id="pastorBio"
                    name="pastorBio"
                    rows={7}
                  />
                </label>
                <label className="manage-visual-field quote" htmlFor="pastorQuote">
                  <span>인용 문구</span>
                  <textarea
                    defaultValue={settings.pastorQuote || ''}
                    id="pastorQuote"
                    name="pastorQuote"
                    rows={3}
                  />
                </label>
              </article>
            </div>
          </section>
        </div>
      </form>
    </ManageShell>
  )
}

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function cssUrl(url: string) {
  return `url(${JSON.stringify(url)})`
}
