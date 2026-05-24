import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveHomeSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { SiteSetting } from '@/payload-types'

type HomeSection = NonNullable<SiteSetting['homeSections']>[number]

const defaultSections: HomeSection[] = [
  {
    enabled: true,
    sectionType: 'intro',
    eyebrow: 'ABOUT US',
    title: '그리스도를 본받아 함께 사랑하는 공동체',
  },
  { enabled: true, sectionType: 'announcements', eyebrow: 'NOTICE', title: '교회 소식' },
  { enabled: true, sectionType: 'sermons', eyebrow: 'SERMON', title: '최신 설교' },
  { enabled: true, sectionType: 'instagram', eyebrow: 'INSTAGRAM', title: '인스타그램' },
  { enabled: true, sectionType: 'map', eyebrow: 'LOCATION', title: '오시는 길' },
]

export default async function ManageHomePage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const sections = normalizeSections(settings.homeSections)

  return (
    <ManageShell active="home" user={user}>
      <PageHeader description="메인 화면의 히어로와 하단 섹션 노출을 관리합니다." title="홈 관리" />
      <form action={saveHomeSettingsAction} className="manage-form">
        <section className="manage-grid">
          <h2 className="manage-section-title">히어로</h2>
          <div className="manage-field-grid">
            <div className="manage-field">
              <label htmlFor="churchName">교회명</label>
              <input
                defaultValue={settings.churchName || '사랑하는교회'}
                id="churchName"
                name="churchName"
                required
              />
            </div>
            <div className="manage-field">
              <label htmlFor="englishName">영문명</label>
              <input
                defaultValue={settings.englishName || ''}
                id="englishName"
                name="englishName"
              />
            </div>
          </div>
          <div className="manage-field-grid">
            <div className="manage-field">
              <label htmlFor="heroEyebrow">작은 제목</label>
              <input
                defaultValue={settings.heroEyebrow || ''}
                id="heroEyebrow"
                name="heroEyebrow"
              />
            </div>
            <div className="manage-field">
              <label htmlFor="heroTitle">제목</label>
              <input defaultValue={settings.heroTitle || ''} id="heroTitle" name="heroTitle" />
            </div>
          </div>
          <div className="manage-field">
            <label htmlFor="heroSubtitle">부제목</label>
            <input
              defaultValue={settings.heroSubtitle || ''}
              id="heroSubtitle"
              name="heroSubtitle"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="tagline">대표 문구</label>
            <input defaultValue={settings.tagline || ''} id="tagline" name="tagline" />
          </div>
          <div className="manage-field">
            <label htmlFor="subTagline">보조 문구</label>
            <textarea
              defaultValue={settings.subTagline || ''}
              id="subTagline"
              name="subTagline"
              rows={3}
            />
          </div>
          <div className="manage-field-grid">
            <div className="manage-field">
              <label htmlFor="heroPrimaryLabel">기본 버튼 문구</label>
              <input
                defaultValue={settings.heroPrimaryLabel || '예배 안내'}
                id="heroPrimaryLabel"
                name="heroPrimaryLabel"
              />
            </div>
            <div className="manage-field">
              <label htmlFor="heroPrimaryUrl">기본 버튼 링크</label>
              <input
                defaultValue={settings.heroPrimaryUrl || '/worship'}
                id="heroPrimaryUrl"
                name="heroPrimaryUrl"
              />
            </div>
          </div>
          <div className="manage-field-grid">
            <div className="manage-field">
              <label htmlFor="heroSecondaryLabel">보조 버튼 문구</label>
              <input
                defaultValue={settings.heroSecondaryLabel || '최신 설교 보기'}
                id="heroSecondaryLabel"
                name="heroSecondaryLabel"
              />
            </div>
            <div className="manage-field">
              <label htmlFor="heroSecondaryUrl">보조 버튼 링크</label>
              <input
                defaultValue={settings.heroSecondaryUrl || '/sermon'}
                id="heroSecondaryUrl"
                name="heroSecondaryUrl"
              />
            </div>
          </div>
        </section>

        <section className="manage-grid">
          <h2 className="manage-section-title">홈 섹션</h2>
          {sections.map((section, index) => (
            <div className="manage-subform" key={`${section.sectionType}-${index}`}>
              <input name="homeSectionType" type="hidden" value={section.sectionType} />
              <div className="manage-subform-header">
                <strong>{sectionLabel(section.sectionType)}</strong>
                <label className="manage-checkbox compact" htmlFor={`homeSectionEnabled-${index}`}>
                  <input
                    defaultChecked={section.enabled !== false}
                    id={`homeSectionEnabled-${index}`}
                    name={`homeSectionEnabled-${index}`}
                    type="checkbox"
                  />
                  홈에 표시
                </label>
              </div>
              <div className="manage-field-grid">
                <div className="manage-field">
                  <label htmlFor={`homeSectionEyebrow-${index}`}>작은 제목</label>
                  <input
                    defaultValue={section.eyebrow || ''}
                    id={`homeSectionEyebrow-${index}`}
                    name={`homeSectionEyebrow-${index}`}
                  />
                </div>
                <div className="manage-field">
                  <label htmlFor={`homeSectionTitle-${index}`}>섹션 제목</label>
                  <input
                    defaultValue={section.title || ''}
                    id={`homeSectionTitle-${index}`}
                    name={`homeSectionTitle-${index}`}
                  />
                </div>
              </div>
              <div className="manage-field">
                <label htmlFor={`homeSectionDescription-${index}`}>설명</label>
                <textarea
                  defaultValue={section.description || ''}
                  id={`homeSectionDescription-${index}`}
                  name={`homeSectionDescription-${index}`}
                  rows={3}
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

function normalizeSections(sections: SiteSetting['homeSections']): HomeSection[] {
  const existing = [...(sections || [])]
  const missing = defaultSections.filter(
    (section) => !existing.some((item) => item.sectionType === section.sectionType),
  )

  return [...existing, ...missing]
}

function sectionLabel(type: HomeSection['sectionType']) {
  const labels: Record<HomeSection['sectionType'], string> = {
    announcements: '공지사항',
    instagram: '인스타그램',
    intro: '교회 소개',
    map: '오시는 길',
    sermons: '최신 설교',
  }

  return labels[type]
}
