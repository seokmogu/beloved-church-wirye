'use client'

import { useFormFields } from '@payloadcms/ui'
import React from 'react'

type FieldState = {
  value?: unknown
}

type LexicalNode = {
  children?: LexicalNode[]
  fields?: {
    url?: string
  }
  format?: number
  tag?: string
  text?: string
  type?: string
}

const formatDate = (value: unknown) => {
  const date = value ? new Date(String(value)) : new Date()

  if (Number.isNaN(date.getTime())) return '오늘'

  return date.toLocaleDateString('ko-KR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  })
}

const renderChildren = (node: LexicalNode, keyPrefix: string) =>
  node.children?.map((child, index) => renderNode(child, `${keyPrefix}-${index}`))

const renderNode = (node: LexicalNode, key: string): React.ReactNode => {
  if (node.type === 'text') {
    const style: React.CSSProperties = {
      fontWeight: node.format && (node.format & 1) > 0 ? 700 : undefined,
      fontStyle: node.format && (node.format & 2) > 0 ? 'italic' : undefined,
      textDecoration: node.format && (node.format & 8) > 0 ? 'underline' : undefined,
    }

    return (
      <span key={key} style={style}>
        {node.text}
      </span>
    )
  }

  if (node.type === 'heading') {
    const Tag = node.tag === 'h3' ? 'h3' : 'h2'

    return (
      <Tag
        key={key}
        style={{ fontSize: Tag === 'h2' ? 22 : 18, fontWeight: 700, margin: '18px 0 8px' }}
      >
        {renderChildren(node, key)}
      </Tag>
    )
  }

  if (node.type === 'link') {
    return (
      <a
        key={key}
        href={node.fields?.url ?? '#'}
        style={{ color: 'var(--theme-text)', fontWeight: 600 }}
      >
        {renderChildren(node, key)}
      </a>
    )
  }

  if (node.type === 'list') {
    const Tag = node.tag === 'ol' ? 'ol' : 'ul'

    return (
      <Tag key={key} style={{ margin: '12px 0', paddingLeft: 22 }}>
        {renderChildren(node, key)}
      </Tag>
    )
  }

  if (node.type === 'listitem') {
    return (
      <li key={key} style={{ marginBottom: 6 }}>
        {renderChildren(node, key)}
      </li>
    )
  }

  if (node.type === 'linebreak') return <br key={key} />

  return (
    <p key={key} style={{ lineHeight: 1.75, margin: '0 0 12px' }}>
      {renderChildren(node, key)}
    </p>
  )
}

const renderRichTextPreview = (value: unknown) => {
  if (!value || typeof value !== 'object' || !('root' in value)) {
    return (
      <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
        본문을 입력하면 여기에 미리보기가 표시됩니다.
      </p>
    )
  }

  const root = (value as { root?: LexicalNode }).root
  const children = root?.children ?? []

  if (children.length === 0) {
    return (
      <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
        본문을 입력하면 여기에 미리보기가 표시됩니다.
      </p>
    )
  }

  return children.map((node, index) => renderNode(node, `preview-${index}`))
}

export function AnnouncementPreview() {
  const fields = useFormFields(([allFields]) => allFields as Record<string, FieldState>)
  const title = typeof fields.title?.value === 'string' ? fields.title.value : ''
  const publishedAt = fields.publishedAt?.value
  const isPinned = Boolean(fields.isPinned?.value)
  const content = fields.content?.value

  return (
    <div className="field-type" style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px' }}>공지 미리보기</h3>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'var(--theme-elevation-50)',
            borderBottom: '1px solid var(--theme-elevation-150)',
            padding: 18,
          }}
        >
          <p
            style={{
              color: 'var(--theme-elevation-600)',
              fontSize: 12,
              fontWeight: 700,
              margin: '0 0 8px',
            }}
          >
            목록 카드
          </p>
          <div
            style={{
              alignItems: 'flex-start',
              display: 'flex',
              gap: 12,
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
              {isPinned && (
                <span
                  style={{
                    background: 'rgba(84, 114, 84, 0.12)',
                    borderRadius: 999,
                    color: '#315f46',
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 8px',
                  }}
                >
                  고정
                </span>
              )}
              <strong data-testid="announcement-preview-title" style={{ fontSize: 15 }}>
                {title || '공지 제목'}
              </strong>
            </div>
            <time style={{ color: 'var(--theme-elevation-550)', flexShrink: 0, fontSize: 12 }}>
              {formatDate(publishedAt)}
            </time>
          </div>
        </div>

        <article style={{ background: 'white', color: '#18241d', padding: 24 }}>
          <p
            style={{
              color: '#4f6f5a',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0,
              margin: '0 0 8px',
            }}
          >
            상세 화면
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, margin: '0 0 8px' }}>
            {title || '공지 제목'}
          </h2>
          <time style={{ color: '#69746d', display: 'block', fontSize: 14, marginBottom: 22 }}>
            {formatDate(publishedAt)}
          </time>
          <div>{renderRichTextPreview(content)}</div>
        </article>
      </div>
    </div>
  )
}
