'use client'
import type { RowLabelProps } from '@payloadcms/ui'
import { useRowLabel } from '@payloadcms/ui'

type RowLabelData = {
  link?: { label?: string | null; type?: 'custom' | 'internal' | 'reference' | null } | null
}

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<RowLabelData>()

  const typeLabels = {
    custom: '직접 주소',
    internal: '고정페이지',
    reference: 'CMS 페이지/글',
  }
  const type = data?.data?.link?.type
  const typeLabel =
    type === 'custom' || type === 'internal' || type === 'reference' ? typeLabels[type] : null
  const label = data?.data?.link?.label
    ? `메뉴 ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}${typeLabel ? ` (${typeLabel})` : ''}`
    : '메뉴항목'

  return <div>{label}</div>
}
