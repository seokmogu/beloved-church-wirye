'use client'

import { useFormFields } from '@payloadcms/ui'

type FieldState = {
  value?: unknown
}

function getText(fields: Record<string, FieldState>, path: string, fallback: string): string {
  const value = fields[path]?.value
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function HomeHeroInlinePreview() {
  const fields = useFormFields(([allFields]) => allFields as Record<string, FieldState>)
  const eyebrow = getText(fields, 'heroEyebrow', 'Beloved Church Wirye')
  const title = getText(fields, 'heroTitle', '사랑하는교회')
  const subtitle = getText(fields, 'heroSubtitle', '위례에서 하나님의 사랑을 나누는 공동체')
  const primaryLabel = getText(fields, 'heroPrimaryLabel', '예배 안내')
  const primaryUrl = getText(fields, 'heroPrimaryUrl', '/worship')
  const secondaryLabel = getText(fields, 'heroSecondaryLabel', '최신 설교 보기')
  const secondaryUrl = getText(fields, 'heroSecondaryUrl', '/sermon')
  const hasImage =
    fields.heroImage?.value !== undefined &&
    fields.heroImage?.value !== null &&
    fields.heroImage?.value !== ''

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--theme-elevation-150)',
          display: 'grid',
          gap: 4,
          padding: 12,
        }}
      >
        <strong style={{ fontSize: 14 }}>히어로 미리보기</strong>
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          아래 입력값을 바꾸면 홈 첫 화면에 보이는 문구와 버튼이 같이 바뀝니다.
        </span>
      </div>
      <div
        style={{
          background: '#123125',
          color: '#fff',
          padding: 24,
        }}
      >
        <div style={{ color: '#f3ead6', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15 }}>{title}</div>
        <p style={{ color: 'rgba(255,255,255,.72)', margin: '10px 0 18px' }}>{subtitle}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span
            style={{
              background: '#f3ead6',
              borderRadius: 6,
              color: '#123125',
              display: 'inline-block',
              fontSize: 13,
              fontWeight: 700,
              padding: '9px 12px',
            }}
          >
            {primaryLabel}
            {' -> '}
            {primaryUrl}
          </span>
          <span
            style={{
              border: '1px solid rgba(255,255,255,.3)',
              borderRadius: 6,
              color: '#fff',
              display: 'inline-block',
              fontSize: 13,
              fontWeight: 700,
              padding: '9px 12px',
            }}
          >
            {secondaryLabel}
            {' -> '}
            {secondaryUrl}
          </span>
        </div>
      </div>
      <div style={{ background: '#f9fafb', color: '#4b5563', fontSize: 13, padding: 12 }}>
        {hasImage
          ? '히어로 배경 이미지가 선택되어 있습니다.'
          : '배경 이미지를 선택하면 이 영역 뒤에 깔립니다.'}
      </div>
    </div>
  )
}
