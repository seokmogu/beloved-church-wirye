import type { CSSProperties } from 'react'
import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { HomeVisualEditorBridge } from '@/app/(manage)/manage/_components/HomeVisualEditorBridge'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveHomeSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { Media, SiteSetting } from '@/payload-types'

type HomeSection = NonNullable<SiteSetting['homeSections']>[number]
type DesignSettings = Record<string, unknown>

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

const designDefaults = {
  backgroundColor: '#f7f8f6',
  bodyFontSize: 16,
  borderColor: '#d9ded6',
  cardBackgroundColor: '#ffffff',
  darkSectionBackgroundColor: '#143c2e',
  footerBackgroundColor: '#143c2e',
  headerBackgroundColor: '#123125',
  heroOverlayColor: '#0a1c15',
  heroOverlayOpacity: 82,
  heroSubtitleFontSize: 30,
  heroTitleFontSize: 88,
  mutedTextColor: '#5d675f',
  primaryColor: '#123125',
  primaryLightColor: '#1c4938',
  secondaryColor: '#f3ead6',
  sectionBackgroundColor: '#f7f8f6',
  sectionTitleFontSize: 48,
  textColor: '#171a17',
}

export default async function ManageHomePage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const sections = normalizeSections(settings.homeSections)
  const design = (settings.design || {}) as DesignSettings
  const heroImageUrl = getMediaUrl(settings.heroImage as Media | number | null | undefined)
  const pageBackgroundImageUrl = getMediaUrl(
    design.pageBackgroundImage as Media | number | null | undefined,
  )
  const darkSectionBackgroundImageUrl = getMediaUrl(
    design.darkSectionBackgroundImage as Media | number | null | undefined,
  )
  const heroOverlayOpacity = numberValue(
    design.heroOverlayOpacity,
    designDefaults.heroOverlayOpacity,
  )
  const previewStyle = {
    '--preview-background': colorValue(design.backgroundColor, designDefaults.backgroundColor),
    '--preview-body-size': `${numberValue(design.bodyFontSize, designDefaults.bodyFontSize)}px`,
    '--preview-border': colorValue(design.borderColor, designDefaults.borderColor),
    '--preview-card-bg': colorValue(design.cardBackgroundColor, designDefaults.cardBackgroundColor),
    '--preview-dark-section-bg': colorValue(
      design.darkSectionBackgroundColor,
      designDefaults.darkSectionBackgroundColor,
    ),
    '--preview-dark-section-bg-image': darkSectionBackgroundImageUrl ? cssUrl(darkSectionBackgroundImageUrl) : 'none',
    '--preview-hero-bg-image': heroImageUrl ? cssUrl(heroImageUrl) : 'none',
    '--preview-hero-overlay': colorValue(design.heroOverlayColor, designDefaults.heroOverlayColor),
    '--preview-hero-overlay-opacity': String(heroOverlayOpacity / 100),
    '--preview-hero-subtitle-size': `${numberValue(
      design.heroSubtitleFontSize,
      designDefaults.heroSubtitleFontSize,
    )}px`,
    '--preview-hero-title-size': `${numberValue(
      design.heroTitleFontSize,
      designDefaults.heroTitleFontSize,
    )}px`,
    '--preview-muted': colorValue(design.mutedTextColor, designDefaults.mutedTextColor),
    '--preview-primary': colorValue(design.primaryColor, designDefaults.primaryColor),
    '--preview-primary-light': colorValue(design.primaryLightColor, designDefaults.primaryLightColor),
    '--preview-page-bg-image': pageBackgroundImageUrl ? cssUrl(pageBackgroundImageUrl) : 'none',
    '--preview-secondary': colorValue(design.secondaryColor, designDefaults.secondaryColor),
    '--preview-section-bg': colorValue(
      design.sectionBackgroundColor,
      designDefaults.sectionBackgroundColor,
    ),
    '--preview-section-title-size': `${numberValue(
      design.sectionTitleFontSize,
      designDefaults.sectionTitleFontSize,
    )}px`,
    '--preview-text': colorValue(design.textColor, designDefaults.textColor),
  } as CSSProperties

  return (
    <ManageShell active="home" user={user}>
      <PageHeader description="공개 메인 화면을 보면서 문구, 배경, 색상, 글자 크기를 수정합니다." title="홈 관리" />
      <form
        action={saveHomeSettingsAction}
        className="manage-visual-form"
        id="home-visual-editor"
        data-show-pattern={design.showHeroPattern === false ? 'false' : 'true'}
        style={previewStyle}
      >
        <HomeVisualEditorBridge />
        <div className="manage-editor-toolbar">
          <Link className="manage-button secondary" href="/manage">
            취소
          </Link>
          <SaveButton />
        </div>

        <div className="manage-editor-layout">
          <div className="manage-site-preview">
            <header className="manage-preview-nav">
              <label className="manage-inline-field brand" htmlFor="churchName">
                <span>교회명</span>
                <input
                  defaultValue={settings.churchName || '사랑하는교회'}
                  id="churchName"
                  name="churchName"
                  required
                />
              </label>
              <label className="manage-inline-field small" htmlFor="englishName">
                <span>영문명</span>
                <input defaultValue={settings.englishName || ''} id="englishName" name="englishName" />
              </label>
            </header>

            <section className="manage-edit-hero">
              <div className="manage-edit-hero-shade" />
              <div className="manage-edit-hero-content">
                <label className="manage-inline-field eyebrow" htmlFor="heroEyebrow">
                  <span>작은 제목</span>
                  <input
                    defaultValue={settings.heroEyebrow || ''}
                    id="heroEyebrow"
                    name="heroEyebrow"
                  />
                </label>
                <label className="manage-inline-field hero-title" htmlFor="heroTitle">
                  <span>히어로 제목</span>
                  <textarea defaultValue={settings.heroTitle || ''} id="heroTitle" name="heroTitle" rows={2} />
                </label>
                <label className="manage-inline-field hero-subtitle" htmlFor="heroSubtitle">
                  <span>부제목</span>
                  <textarea
                    defaultValue={settings.heroSubtitle || ''}
                    id="heroSubtitle"
                    name="heroSubtitle"
                    rows={2}
                  />
                </label>
                <div className="manage-preview-buttons">
                  <label className="manage-inline-field button-label" htmlFor="heroPrimaryLabel">
                    <span>기본 버튼</span>
                    <input
                      defaultValue={settings.heroPrimaryLabel || '예배 안내'}
                      id="heroPrimaryLabel"
                      name="heroPrimaryLabel"
                    />
                  </label>
                  <label className="manage-inline-field button-label secondary" htmlFor="heroSecondaryLabel">
                    <span>보조 버튼</span>
                    <input
                      defaultValue={settings.heroSecondaryLabel || '최신 설교 보기'}
                      id="heroSecondaryLabel"
                      name="heroSecondaryLabel"
                    />
                  </label>
                </div>
                <div className="manage-preview-link-row">
                  <label htmlFor="heroPrimaryUrl">
                    기본 링크
                    <input
                      defaultValue={settings.heroPrimaryUrl || '/worship'}
                      id="heroPrimaryUrl"
                      name="heroPrimaryUrl"
                    />
                  </label>
                  <label htmlFor="heroSecondaryUrl">
                    보조 링크
                    <input
                      defaultValue={settings.heroSecondaryUrl || '/sermon'}
                      id="heroSecondaryUrl"
                      name="heroSecondaryUrl"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="manage-edit-intro-strip">
              <label className="manage-inline-field tagline" htmlFor="tagline">
                <span>대표 문구</span>
                <input defaultValue={settings.tagline || ''} id="tagline" name="tagline" />
              </label>
              <label className="manage-inline-field body-copy" htmlFor="subTagline">
                <span>보조 문구</span>
                <textarea defaultValue={settings.subTagline || ''} id="subTagline" name="subTagline" rows={2} />
              </label>
            </section>

            <section className="manage-edit-sections">
              {sections.map((section, index) => (
                <article className={sectionCardClassName(section.sectionType)} key={`${section.sectionType}-${index}`}>
                  <input name="homeSectionType" type="hidden" value={section.sectionType} />
                  <div className="manage-edit-section-card-top">
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
                  <label className="manage-inline-field section-eyebrow" htmlFor={`homeSectionEyebrow-${index}`}>
                    <span>작은 제목</span>
                    <input
                      defaultValue={section.eyebrow || ''}
                      id={`homeSectionEyebrow-${index}`}
                      name={`homeSectionEyebrow-${index}`}
                    />
                  </label>
                  <label className="manage-inline-field section-title" htmlFor={`homeSectionTitle-${index}`}>
                    <span>섹션 제목</span>
                    <textarea
                      defaultValue={section.title || ''}
                      id={`homeSectionTitle-${index}`}
                      name={`homeSectionTitle-${index}`}
                      rows={2}
                    />
                  </label>
                  <label className="manage-inline-field body-copy" htmlFor={`homeSectionDescription-${index}`}>
                    <span>설명</span>
                    <textarea
                      defaultValue={section.description || ''}
                      id={`homeSectionDescription-${index}`}
                      name={`homeSectionDescription-${index}`}
                      rows={3}
                    />
                  </label>
                </article>
              ))}
            </section>
          </div>

          <aside className="manage-style-panel">
            <section className="manage-style-group">
              <h2>배경 이미지</h2>
              <MediaPickerControl
                clearName="clearHeroImage"
                currentUrl={heroImageUrl}
                fileName="heroImageFile"
                label="히어로 배경"
              />
              <MediaPickerControl
                clearName="clearPageBackgroundImage"
                currentUrl={pageBackgroundImageUrl}
                fileName="pageBackgroundImageFile"
                label="전체 페이지 배경"
              />
              <MediaPickerControl
                clearName="clearDarkSectionBackgroundImage"
                currentUrl={darkSectionBackgroundImageUrl}
                fileName="darkSectionBackgroundImageFile"
                label="어두운 섹션 배경"
              />
            </section>

            <section className="manage-style-group">
              <h2>컬러</h2>
              <ColorControl design={design} fallback={designDefaults.primaryColor} label="메인" name="primaryColor" />
              <ColorControl
                design={design}
                fallback={designDefaults.primaryLightColor}
                label="메인 밝은색"
                name="primaryLightColor"
              />
              <ColorControl design={design} fallback={designDefaults.secondaryColor} label="강조" name="secondaryColor" />
              <ColorControl design={design} fallback={designDefaults.backgroundColor} label="페이지 배경" name="backgroundColor" />
              <ColorControl
                design={design}
                fallback={designDefaults.sectionBackgroundColor}
                label="밝은 섹션"
                name="sectionBackgroundColor"
              />
              <ColorControl
                design={design}
                fallback={designDefaults.darkSectionBackgroundColor}
                label="어두운 섹션"
                name="darkSectionBackgroundColor"
              />
              <ColorControl design={design} fallback={designDefaults.cardBackgroundColor} label="카드" name="cardBackgroundColor" />
              <ColorControl design={design} fallback={designDefaults.textColor} label="본문" name="textColor" />
              <ColorControl design={design} fallback={designDefaults.mutedTextColor} label="보조 글자" name="mutedTextColor" />
              <ColorControl design={design} fallback={designDefaults.borderColor} label="테두리" name="borderColor" />
              <ColorControl
                design={design}
                fallback={designDefaults.headerBackgroundColor}
                label="상단 배경"
                name="headerBackgroundColor"
              />
              <ColorControl
                design={design}
                fallback={designDefaults.footerBackgroundColor}
                label="하단 배경"
                name="footerBackgroundColor"
              />
              <ColorControl
                design={design}
                fallback={designDefaults.heroOverlayColor}
                label="히어로 오버레이"
                name="heroOverlayColor"
              />
            </section>

            <section className="manage-style-group">
              <h2>크기와 효과</h2>
              <NumberControl
                design={design}
                fallback={designDefaults.heroOverlayOpacity}
                label="히어로 오버레이"
                max={100}
                min={0}
                name="heroOverlayOpacity"
                suffix="%"
              />
              <NumberControl
                design={design}
                fallback={designDefaults.heroTitleFontSize}
                label="히어로 제목"
                max={128}
                min={36}
                name="heroTitleFontSize"
                suffix="px"
              />
              <NumberControl
                design={design}
                fallback={designDefaults.heroSubtitleFontSize}
                label="히어로 부제목"
                max={64}
                min={16}
                name="heroSubtitleFontSize"
                suffix="px"
              />
              <NumberControl
                design={design}
                fallback={designDefaults.sectionTitleFontSize}
                label="섹션 제목"
                max={80}
                min={24}
                name="sectionTitleFontSize"
                suffix="px"
              />
              <NumberControl
                design={design}
                fallback={designDefaults.bodyFontSize}
                label="본문"
                max={24}
                min={13}
                name="bodyFontSize"
                suffix="px"
              />
              <label className="manage-checkbox compact" htmlFor="showHeroPattern">
                <input
                  defaultChecked={design.showHeroPattern !== false}
                  id="showHeroPattern"
                  name="showHeroPattern"
                  type="checkbox"
                />
                히어로 패턴 표시
              </label>
            </section>
          </aside>
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

function sectionCardClassName(type: HomeSection['sectionType']): string {
  return type === 'instagram' ? 'manage-edit-section-card dark' : 'manage-edit-section-card'
}

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function cssUrl(url: string) {
  return `url(${JSON.stringify(url)})`
}

function colorValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
}

function numberValue(value: unknown, fallback: number): number {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}

function ColorControl({
  design,
  fallback,
  label,
  name,
}: {
  design: DesignSettings
  fallback: string
  label: string
  name: string
}) {
  return (
    <label className="manage-color-control" htmlFor={name}>
      <span>{label}</span>
      <input defaultValue={colorValue(design[name], fallback)} id={name} name={name} type="color" />
    </label>
  )
}

function NumberControl({
  design,
  fallback,
  label,
  max,
  min,
  name,
  suffix,
}: {
  design: DesignSettings
  fallback: number
  label: string
  max: number
  min: number
  name: string
  suffix: string
}) {
  return (
    <label className="manage-number-control" htmlFor={name}>
      <span>{label}</span>
      <input defaultValue={numberValue(design[name], fallback)} id={name} max={max} min={min} name={name} type="number" />
      <small>{suffix}</small>
    </label>
  )
}

function MediaPickerControl({
  clearName,
  currentUrl,
  fileName,
  label,
}: {
  clearName: string
  currentUrl: string | null
  fileName: string
  label: string
}) {
  return (
    <div className="manage-media-control">
      <div>
        <strong>{label}</strong>
        <div
          aria-hidden="true"
          className="manage-media-thumb"
          style={currentUrl ? { backgroundImage: cssUrl(currentUrl) } : undefined}
        />
      </div>
      <label htmlFor={fileName}>
        이미지 선택
        <input accept="image/*" id={fileName} name={fileName} type="file" />
      </label>
      <label className="manage-checkbox compact" htmlFor={clearName}>
        <input id={clearName} name={clearName} type="checkbox" />
        제거
      </label>
    </div>
  )
}
