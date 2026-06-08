import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveLeadersSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { Media, SiteSetting } from '@/payload-types'

type Leader = NonNullable<SiteSetting['leaders']>[number]

export default async function ManageLeadersPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const pastorPhotoUrl = getMediaUrl(settings.pastorPhoto as Media | number | null | undefined)
  const leaders = padRows<Leader>(settings.leaders, 4, { name: '' } as Leader)

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

          <section className="manage-public-section">
            <div className="manage-public-section-head">
              <div>
                <p>Team</p>
                <h2>추가 섬기는 사람들</h2>
              </div>
              <span className="manage-scope-chip">/about/leaders 담임목사 아래 영역</span>
            </div>

            <div className="manage-public-card-grid two">
              {leaders.map((leader, index) => {
                const photoUrl = getMediaUrl(leader.photo as Media | number | null | undefined)
                return (
                  <article className="manage-public-card edit-card" key={index}>
                    <aside className="manage-public-photo-editor">
                      <div
                        aria-hidden="true"
                        className="manage-public-photo-preview"
                        style={photoUrl ? { backgroundImage: cssUrl(photoUrl) } : undefined}
                      >
                        {photoUrl ? null : <span>사진 없음</span>}
                      </div>
                      <label htmlFor={`leaderPhotoFile-${index}`}>
                        사진 변경
                        <input
                          accept="image/*"
                          id={`leaderPhotoFile-${index}`}
                          name={`leaderPhotoFile-${index}`}
                          type="file"
                        />
                      </label>
                      <label className="manage-checkbox compact" htmlFor={`leaderClearPhoto-${index}`}>
                        <input
                          id={`leaderClearPhoto-${index}`}
                          name={`leaderClearPhoto-${index}`}
                          type="checkbox"
                        />
                        사진 제거
                      </label>
                    </aside>
                    <label className="manage-visual-field heading">
                      <span>이름 (비우면 미노출)</span>
                      <input defaultValue={leader.name || ''} name="leaderName" />
                    </label>
                    <label className="manage-visual-field accent">
                      <span>직함</span>
                      <input defaultValue={leader.title || ''} name="leaderTitle" />
                    </label>
                    <label className="manage-visual-field muted">
                      <span>역할/구분</span>
                      <input defaultValue={leader.role || ''} name="leaderRole" />
                    </label>
                    <label className="manage-visual-field muted">
                      <span>소개</span>
                      <textarea defaultValue={leader.bio || ''} name="leaderBio" rows={4} />
                    </label>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      </form>
    </ManageShell>
  )
}

function padRows<T>(rows: T[] | null | undefined, minLength: number, blank: T): T[] {
  const filled = [...(rows || [])]
  while (filled.length < minLength) filled.push(blank)
  return filled
}

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function cssUrl(url: string) {
  return `url(${JSON.stringify(url)})`
}
