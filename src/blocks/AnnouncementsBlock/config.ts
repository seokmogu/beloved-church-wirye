import type { Block } from 'payload'

export const AnnouncementsBlock: Block = {
  slug: 'announcementsBlock',
  labels: { singular: '공지사항 목록', plural: '공지사항 목록' },
  fields: [
    {
      name: 'limit',
      type: 'number',
      label: '표시 개수',
      defaultValue: 10,
      min: 1,
      max: 50,
    },
    {
      name: 'showPinnedFirst',
      type: 'checkbox',
      label: '상단 고정 공지 먼저 표시',
      defaultValue: true,
    },
  ],
}
