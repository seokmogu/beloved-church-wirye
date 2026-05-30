'use client'

import { useFormFields } from '@payloadcms/ui'

type FieldState = {
  value?: unknown
}

const defaults = {
  backgroundColor: '#f7f8f6',
  borderColor: '#d9ded6',
  cardBackgroundColor: '#ffffff',
  darkSectionBackgroundColor: '#143c2e',
  footerBackgroundColor: '#143c2e',
  headerBackgroundColor: '#123125',
  mutedTextColor: '#5d675f',
  primaryColor: '#123125',
  primaryLightColor: '#1c4938',
  secondaryColor: '#f3ead6',
  sectionBackgroundColor: '#f7f8f6',
  textColor: '#171a17',
}

function getText(fields: Record<string, FieldState>, path: string, fallback: string): string {
  const value = fields[path]?.value
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function hasValue(fields: Record<string, FieldState>, path: string): boolean {
  const value = fields[path]?.value
  return value !== undefined && value !== null && value !== ''
}

function swatch(label: string, value: string) {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <span
        aria-hidden="true"
        style={{
          background: value,
          border: '1px solid rgba(0,0,0,.14)',
          borderRadius: 4,
          display: 'inline-block',
          height: 20,
          width: 20,
        }}
      />
      <span style={{ color: '#4b5563', fontSize: 12 }}>{label}</span>
      <code style={{ color: '#111827', fontSize: 12 }}>{value}</code>
    </div>
  )
}

export function DesignPreview() {
  const fields = useFormFields(([allFields]) => allFields as Record<string, FieldState>)
  const primary = getText(fields, 'design.primaryColor', defaults.primaryColor)
  const primaryLight = getText(fields, 'design.primaryLightColor', defaults.primaryLightColor)
  const secondary = getText(fields, 'design.secondaryColor', defaults.secondaryColor)
  const background = getText(fields, 'design.backgroundColor', defaults.backgroundColor)
  const sectionBackground = getText(
    fields,
    'design.sectionBackgroundColor',
    defaults.sectionBackgroundColor,
  )
  const darkSectionBackground = getText(
    fields,
    'design.darkSectionBackgroundColor',
    defaults.darkSectionBackgroundColor,
  )
  const cardBackground = getText(fields, 'design.cardBackgroundColor', defaults.cardBackgroundColor)
  const text = getText(fields, 'design.textColor', defaults.textColor)
  const mutedText = getText(fields, 'design.mutedTextColor', defaults.mutedTextColor)
  const border = getText(fields, 'design.borderColor', defaults.borderColor)
  const headerBackground = getText(
    fields,
    'design.headerBackgroundColor',
    defaults.headerBackgroundColor,
  )
  const footerBackground = getText(
    fields,
    'design.footerBackgroundColor',
    defaults.footerBackgroundColor,
  )
  const hasPageBackground = hasValue(fields, 'design.pageBackgroundImage')
  const hasDarkBackground = hasValue(fields, 'design.darkSectionBackgroundImage')

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        marginBottom: 24,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          borderBottom: '1px solid var(--theme-elevation-150)',
          display: 'flex',
          gap: 12,
          justifyContent: 'space-between',
          padding: 16,
        }}
      >
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>디자인 미리보기</h3>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 0' }}>
            색상 입력값은 저장 전에도 즉시 반영됩니다. 배경 이미지는 저장 후 실제 사이트에서
            확인합니다.
          </p>
        </div>
        <a
          href="/"
          rel="noopener noreferrer"
          style={{
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 6,
            color: 'var(--theme-text)',
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 10px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
          target="_blank"
        >
          사이트 열기
        </a>
      </div>

      <div style={{ background, padding: 16 }}>
        <div
          style={{
            background: headerBackground,
            borderRadius: '8px 8px 0 0',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 16px',
          }}
        >
          <strong style={{ fontSize: 13 }}>BELOVED</strong>
          <span style={{ color: 'rgba(255,255,255,.72)', fontSize: 12 }}>예배안내 · 최신 설교</span>
        </div>

        <div
          style={{
            background: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
            color: '#fff',
            padding: 24,
          }}
        >
          <div style={{ color: secondary, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            BELOVED CHURCH WIRYE
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15 }}>사랑하는교회</div>
          <p style={{ color: 'rgba(255,255,255,.72)', marginBottom: 18 }}>
            위례에서 하나님의 사랑을 나누는 공동체
          </p>
          <button
            type="button"
            style={{
              background: secondary,
              border: 0,
              borderRadius: 6,
              color: primary,
              fontWeight: 700,
              padding: '10px 14px',
            }}
          >
            예배안내
          </button>
        </div>

        <div style={{ background: sectionBackground, display: 'grid', gap: 12, padding: 16 }}>
          <div style={{ color: secondary, fontSize: 12, fontWeight: 700 }}>ABOUT US</div>
          <div style={{ color: text, fontSize: 24, fontWeight: 800 }}>
            그리스도를 본받아 함께 사랑하는 공동체
          </div>
          <p style={{ color: mutedText, lineHeight: 1.55, margin: 0 }}>
            CMS에서 입력한 색상과 배경 설정으로 섹션 톤을 확인합니다.
          </p>
          <div
            style={{
              background: cardBackground,
              border: `1px solid ${border}`,
              borderRadius: 8,
              color: text,
              padding: 16,
            }}
          >
            <strong>예배와 모임</strong>
            <p style={{ color: mutedText, marginBottom: 0 }}>청·장년예배 · 주일 낮 12시</p>
          </div>
        </div>

        <div style={{ background: darkSectionBackground, color: '#fff', padding: 16 }}>
          <div style={{ color: secondary, fontSize: 12, fontWeight: 700 }}>INSTAGRAM</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>어두운 섹션</div>
          <p style={{ color: 'rgba(255,255,255,.64)' }}>
            {hasDarkBackground
              ? '어두운 섹션 배경 이미지가 선택되어 있습니다.'
              : '배경 이미지를 선택하면 저장 후 반영됩니다.'}
          </p>
        </div>

        <div
          style={{
            background: footerBackground,
            borderRadius: '0 0 8px 8px',
            color: '#fff',
            padding: 16,
          }}
        >
          <strong>Footer</strong>
          <span style={{ color: 'rgba(255,255,255,.62)', marginLeft: 10 }}>
            {hasPageBackground
              ? '전체 페이지 배경 이미지 선택됨'
              : '전체 페이지 배경 이미지는 비어 있음'}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          padding: 16,
        }}
      >
        {swatch('메인', primary)}
        {swatch('메인 밝은색', primaryLight)}
        {swatch('강조', secondary)}
        {swatch('배경', background)}
        {swatch('밝은 섹션', sectionBackground)}
        {swatch('어두운 섹션', darkSectionBackground)}
        {swatch('카드', cardBackground)}
        {swatch('본문', text)}
      </div>
    </div>
  )
}
