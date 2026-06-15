import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveWorshipSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { SiteSetting } from '@/payload-types'

type WorshipService = NonNullable<SiteSetting['worshipServices']>[number]
type VisitorNote = NonNullable<SiteSetting['visitorNotes']>[number]

export default async function ManageWorshipPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const services = padRows<WorshipService>(settings.worshipServices, 6, {
    description: '',
    name: '',
    time: '',
  })
  const visitorNotes = padRows<VisitorNote>(settings.visitorNotes, 5, { text: '' })

  return (
    <ManageShell active="worship" user={user}>
      <PageHeader
        description="예배안내페이지와 홈 히어로의 예배 시간, 위치 정보를 관리합니다."
        title="예배안내"
      >
        <Link className="manage-button secondary" href="/worship" target="_blank">
          공개페이지 보기
        </Link>
      </PageHeader>
      <form action={saveWorshipSettingsAction} className="manage-visual-form manage-public-editor">
        <div className="manage-editor-toolbar">
          <Link className="manage-button secondary" href="/manage">
            취소
          </Link>
          <SaveButton />
        </div>

        <div className="manage-public-canvas">
          <section className="manage-public-hero">
            <p>WORSHIP</p>
            <h2>예배안내</h2>
            <span>{settings.heroSubtitle ?? '하나님께 영광 돌리는 예배'}</span>
          </section>

          <section className="manage-public-section">
            <div className="manage-public-section-head">
              <div>
                <p>Schedule</p>
                <h2>예배와 모임</h2>
              </div>
              <span className="manage-scope-chip">/worship 첫 번째 카드 영역</span>
            </div>

            <div className="manage-public-card-grid two">
              {services.map((service, index) => (
                <article className="manage-public-card edit-card" key={index}>
                  <label
                    className="manage-visual-field accent"
                    htmlFor={`worshipServiceTime-${index}`}
                  >
                    <span>시간</span>
                    <input
                      defaultValue={service.time}
                      id={`worshipServiceTime-${index}`}
                      name="worshipServiceTime"
                    />
                  </label>
                  <label
                    className="manage-visual-field heading"
                    htmlFor={`worshipServiceName-${index}`}
                  >
                    <span>예배/모임 이름</span>
                    <input
                      defaultValue={service.name}
                      id={`worshipServiceName-${index}`}
                      name="worshipServiceName"
                    />
                  </label>
                  <label
                    className="manage-visual-field muted"
                    htmlFor={`worshipServiceDescription-${index}`}
                  >
                    <span>설명</span>
                    <textarea
                      defaultValue={service.description || ''}
                      id={`worshipServiceDescription-${index}`}
                      name="worshipServiceDescription"
                      rows={2}
                    />
                  </label>
                </article>
              ))}
            </div>
          </section>

          <section className="manage-public-section">
            <div className="manage-public-section-head">
              <div>
                <p>Visit</p>
                <h2>찾아오시는 길</h2>
              </div>
              <span className="manage-scope-chip">/worship 지도 위 주소 영역</span>
            </div>

            <div className="manage-public-card-grid two">
              <article className="manage-public-card edit-card">
                <label className="manage-visual-field heading" htmlFor="address">
                  <span>주소</span>
                  <input defaultValue={settings.address || ''} id="address" name="address" />
                </label>
                <label className="manage-visual-field muted" htmlFor="addressDetail">
                  <span>상세 주소</span>
                  <input
                    defaultValue={settings.addressDetail || ''}
                    id="addressDetail"
                    name="addressDetail"
                  />
                </label>
              </article>

              <article className="manage-public-map-placeholder">
                <span>지도 미리보기</span>
                <div className="manage-field-grid">
                  <label className="manage-visual-field compact" htmlFor="mapLat">
                    <span>위도</span>
                    <input
                      defaultValue={settings.mapLat ?? ''}
                      id="mapLat"
                      name="mapLat"
                      step="any"
                      type="number"
                    />
                  </label>
                  <label className="manage-visual-field compact" htmlFor="mapLng">
                    <span>경도</span>
                    <input
                      defaultValue={settings.mapLng ?? ''}
                      id="mapLng"
                      name="mapLng"
                      step="any"
                      type="number"
                    />
                  </label>
                </div>
              </article>
            </div>

            <div className="manage-public-card-grid two">
              <label
                className="manage-public-card edit-card manage-visual-field muted"
                htmlFor="transitInfo"
              >
                <span>교통편 안내</span>
                <textarea
                  defaultValue={settings.transitInfo || ''}
                  id="transitInfo"
                  name="transitInfo"
                  rows={4}
                />
              </label>
              <label
                className="manage-public-card edit-card manage-visual-field muted"
                htmlFor="parkingInfo"
              >
                <span>주차 안내</span>
                <textarea
                  defaultValue={settings.parkingInfo || ''}
                  id="parkingInfo"
                  name="parkingInfo"
                  rows={4}
                />
              </label>
            </div>
          </section>

          <section className="manage-public-section">
            <div className="manage-public-section-head">
              <div>
                <p>Visitor</p>
                <h2>방문 안내</h2>
              </div>
              <span className="manage-scope-chip">/worship 하단 방문 안내</span>
            </div>

            <div className="manage-public-note-card">
              <h3>처음 오시는 분들께</h3>
              <div className="manage-public-note-grid">
                {visitorNotes.map((note, index) => (
                  <label
                    className="manage-visual-field compact"
                    htmlFor={`visitorNote-${index}`}
                    key={index}
                  >
                    <span>안내 문구</span>
                    <input
                      defaultValue={note.text}
                      id={`visitorNote-${index}`}
                      name="visitorNote"
                    />
                  </label>
                ))}
              </div>
              <span className="manage-public-button-preview">새가족등록하기</span>
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
