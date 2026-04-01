import React from 'react'
import Link from 'next/link'

export interface EmptyStateProps {
  /**
   * 아이콘 타입 (기본값: 'document')
   */
  icon?: 'document' | 'announcement' | 'search' | 'error'
  /**
   * 메인 메시지
   */
  title: string
  /**
   * 서브 메시지 (선택)
   */
  description?: string
  /**
   * CTA 버튼 텍스트 (선택)
   */
  ctaText?: string
  /**
   * CTA 버튼 링크 (선택)
   */
  ctaLink?: string
  /**
   * CTA 버튼 외부 링크 여부 (선택, 기본값: false)
   */
  ctaExternal?: boolean
}

const ICONS = {
  document: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  announcement: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
}

export function EmptyState({
  icon = 'document',
  title,
  description,
  ctaText,
  ctaLink,
  ctaExternal = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Icon */}
      <div className="text-muted-foreground/40 mb-4">{ICONS[icon]}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>

      {/* Description */}
      {description && <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>}

      {/* CTA */}
      {ctaText && ctaLink && (
        <>
          {ctaExternal ? (
            <a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A2D] text-white rounded-lg font-medium text-sm hover:bg-[#C9A84C] transition-colors"
            >
              {ctaText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ) : (
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A2D] text-white rounded-lg font-medium text-sm hover:bg-[#C9A84C] transition-colors"
            >
              {ctaText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </>
      )}
    </div>
  )
}
