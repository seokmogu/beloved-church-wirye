'use client'

import type { SiteSetting } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

const sectionLabels: Record<string, string> = {
  announcements: '공지사항',
  instagram: '인스타그램',
  intro: '교회 소개',
  map: '오시는 길',
  sermons: '최신 설교',
}

export const HomeSectionRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<SiteSetting['homeSections']>[number]>()
  const sectionType = data?.data?.sectionType ?? ''
  const sectionLabel = sectionLabels[sectionType] ?? '섹션'
  const title = data?.data?.title
  const enabled = data?.data?.enabled !== false
  const row = data.rowNumber !== undefined ? data.rowNumber + 1 : ''

  return (
    <div>
      {row}. {sectionLabel}
      {title ? ` - ${title}` : ''}
      {enabled ? '' : ' (숨김)'}
    </div>
  )
}
