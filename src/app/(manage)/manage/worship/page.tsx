import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveWorshipSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { SiteSetting } from '@/payload-types'

type WorshipService = NonNullable<SiteSetting['worshipServices']>[number]
type WorshipOrder = NonNullable<SiteSetting['worshipOrder']>[number]
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
  const order = padRows<WorshipOrder>(settings.worshipOrder, 8, {
    description: '',
    title: '',
  })
  const visitorNotes = padRows<VisitorNote>(settings.visitorNotes, 5, { text: '' })

  return (
    <ManageShell active="worship" user={user}>
      <PageHeader
        description="예배 안내 페이지와 홈 히어로의 예배 시간, 위치 정보를 관리합니다."
        title="예배 안내"
      />
      <form action={saveWorshipSettingsAction} className="manage-form">
        <section className="manage-grid">
          <h2 className="manage-section-title">예배와 모임</h2>
          {services.map((service, index) => (
            <div className="manage-field-grid cols-3" key={index}>
              <div className="manage-field">
                <label htmlFor={`worshipServiceName-${index}`}>이름</label>
                <input
                  defaultValue={service.name}
                  id={`worshipServiceName-${index}`}
                  name="worshipServiceName"
                />
              </div>
              <div className="manage-field">
                <label htmlFor={`worshipServiceTime-${index}`}>시간</label>
                <input
                  defaultValue={service.time}
                  id={`worshipServiceTime-${index}`}
                  name="worshipServiceTime"
                />
              </div>
              <div className="manage-field">
                <label htmlFor={`worshipServiceDescription-${index}`}>설명</label>
                <input
                  defaultValue={service.description || ''}
                  id={`worshipServiceDescription-${index}`}
                  name="worshipServiceDescription"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="manage-grid">
          <h2 className="manage-section-title">예배 순서</h2>
          {order.map((item, index) => (
            <div className="manage-field-grid" key={index}>
              <div className="manage-field">
                <label htmlFor={`worshipOrderTitle-${index}`}>순서명</label>
                <input
                  defaultValue={item.title}
                  id={`worshipOrderTitle-${index}`}
                  name="worshipOrderTitle"
                />
              </div>
              <div className="manage-field">
                <label htmlFor={`worshipOrderDescription-${index}`}>설명</label>
                <input
                  defaultValue={item.description || ''}
                  id={`worshipOrderDescription-${index}`}
                  name="worshipOrderDescription"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="manage-grid">
          <h2 className="manage-section-title">오시는 길</h2>
          <div className="manage-field-grid">
            <div className="manage-field">
              <label htmlFor="address">주소</label>
              <input defaultValue={settings.address || ''} id="address" name="address" />
            </div>
            <div className="manage-field">
              <label htmlFor="addressDetail">상세 주소</label>
              <input
                defaultValue={settings.addressDetail || ''}
                id="addressDetail"
                name="addressDetail"
              />
            </div>
          </div>
          <div className="manage-field-grid">
            <div className="manage-field">
              <label htmlFor="mapLat">지도 위도</label>
              <input
                defaultValue={settings.mapLat ?? ''}
                id="mapLat"
                name="mapLat"
                step="any"
                type="number"
              />
            </div>
            <div className="manage-field">
              <label htmlFor="mapLng">지도 경도</label>
              <input
                defaultValue={settings.mapLng ?? ''}
                id="mapLng"
                name="mapLng"
                step="any"
                type="number"
              />
            </div>
          </div>
          <div className="manage-field">
            <label htmlFor="transitInfo">교통편 안내</label>
            <textarea
              defaultValue={settings.transitInfo || ''}
              id="transitInfo"
              name="transitInfo"
              rows={4}
            />
          </div>
          <div className="manage-field">
            <label htmlFor="parkingInfo">주차 안내</label>
            <textarea
              defaultValue={settings.parkingInfo || ''}
              id="parkingInfo"
              name="parkingInfo"
              rows={4}
            />
          </div>
        </section>

        <section className="manage-grid">
          <h2 className="manage-section-title">처음 오시는 분 안내</h2>
          {visitorNotes.map((note, index) => (
            <div className="manage-field" key={index}>
              <label htmlFor={`visitorNote-${index}`}>안내 문구</label>
              <input defaultValue={note.text} id={`visitorNote-${index}`} name="visitorNote" />
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

function padRows<T>(rows: T[] | null | undefined, minLength: number, blank: T): T[] {
  const filled = [...(rows || [])]
  while (filled.length < minLength) filled.push(blank)
  return filled
}
