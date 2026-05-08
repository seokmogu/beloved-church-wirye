'use client'

import { useFormFields } from '@payloadcms/ui'

type FieldState = {
  value?: unknown
}

type Props = {
  path?: string
}

const sectionMeta: Record<
  string,
  {
    defaultEyebrow: string
    defaultTitle: string
    label: string
    source: string
  }
> = {
  announcements: {
    defaultEyebrow: 'NOTICE',
    defaultTitle: '교회 소식',
    label: '공지사항',
    source:
      '공지사항 글 목록은 공지사항 메뉴에서 작성하고, 이 카드에서는 홈 노출 제목과 설명을 편집합니다.',
  },
  instagram: {
    defaultEyebrow: 'INSTAGRAM',
    defaultTitle: '인스타그램',
    label: '인스타그램',
    source:
      '게시물과 계정은 SNS/자동 연동 탭에서 관리하고, 이 카드에서는 홈 섹션 제목과 설명을 편집합니다.',
  },
  intro: {
    defaultEyebrow: 'ABOUT US',
    defaultTitle: '그리스도를 본받아 함께 사랑하는 공동체',
    label: '교회 소개',
    source:
      '소개 본문, 목회자, 핵심 가치는 교회 정보 탭에서 관리하고, 이 카드에서는 홈 섹션 제목과 설명을 편집합니다.',
  },
  map: {
    defaultEyebrow: 'LOCATION',
    defaultTitle: '오시는 길',
    label: '오시는 길',
    source:
      '주소, 주차, 지도 좌표는 예배/오시는 길 탭에서 관리하고, 이 카드에서는 홈 섹션 제목과 설명을 편집합니다.',
  },
  sermons: {
    defaultEyebrow: 'SERMON',
    defaultTitle: '최신 설교',
    label: '최신 설교',
    source:
      '설교 영상은 설교 메뉴에서 작성하고, YouTube 자동 연동은 SNS/자동 연동 탭에서 관리합니다.',
  },
}

function rowPath(path?: string): string | null {
  if (!path) return null
  const match = path.match(/^(homeSections\.\d+)\./)
  return match?.[1] ?? null
}

function getValue(fields: Record<string, FieldState>, path: string): unknown {
  return fields[path]?.value
}

function getText(fields: Record<string, FieldState>, path: string, fallback: string): string {
  const value = getValue(fields, path)
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function HomeSectionInlinePreview({ path }: Props) {
  const fields = useFormFields(([allFields]) => allFields as Record<string, FieldState>)
  const basePath = rowPath(path)

  if (!basePath) {
    return (
      <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
        섹션 역할, 제목, 설명을 입력하면 홈 화면 표시 형태가 이 카드에 같이 표시됩니다.
      </div>
    )
  }

  const typeValue = getValue(fields, `${basePath}.sectionType`)
  const sectionType = typeof typeValue === 'string' ? typeValue : ''
  const meta = sectionMeta[sectionType] ?? {
    defaultEyebrow: 'SECTION',
    defaultTitle: '새 섹션',
    label: '섹션',
    source: '섹션 역할을 선택하면 홈에 연결되는 콘텐츠와 관리 위치가 표시됩니다.',
  }
  const enabled = getValue(fields, `${basePath}.enabled`) !== false
  const eyebrow = getText(fields, `${basePath}.eyebrow`, meta.defaultEyebrow)
  const title = getText(fields, `${basePath}.title`, meta.defaultTitle)
  const description = getText(fields, `${basePath}.description`, meta.source)

  return (
    <div
      style={{
        background: enabled ? '#ffffff' : '#f3f4f6',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        color: enabled ? 'var(--theme-text)' : '#6b7280',
        display: 'grid',
        gap: 10,
        marginBottom: 14,
        padding: 14,
      }}
    >
      <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 700 }}>섹션 미리보기</div>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 14 }}>{meta.label}</strong>
        <span style={{ color: enabled ? '#0f766e' : '#9ca3af', fontSize: 12, fontWeight: 700 }}>
          {enabled ? '홈에 표시' : '숨김'}
        </span>
      </div>
      <div>
        <div style={{ color: '#b08a2e', fontSize: 12, fontWeight: 700 }}>{eyebrow}</div>
        <div
          style={{
            color: enabled ? '#111827' : '#6b7280',
            fontSize: 20,
            fontWeight: 800,
            marginTop: 4,
          }}
        >
          {title}
        </div>
        <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5, margin: '6px 0 0' }}>
          {description}
        </p>
      </div>
      <div
        style={{
          background: '#f9fafb',
          borderRadius: 6,
          color: '#4b5563',
          fontSize: 12,
          lineHeight: 1.45,
          padding: 10,
        }}
      >
        {meta.source}
      </div>
    </div>
  )
}
