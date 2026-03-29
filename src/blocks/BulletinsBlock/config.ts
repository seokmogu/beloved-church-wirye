import type { Block } from 'payload'

export const BulletinsBlock: Block = {
  slug: 'bulletinsBlock',
  labels: { singular: '주보 목록', plural: '주보 목록' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '제목',
      defaultValue: '주보',
    },
    {
      name: 'description',
      type: 'text',
      label: '설명',
      defaultValue: '사랑하는교회 주보 아카이브',
    },
    {
      name: 'limit',
      type: 'number',
      label: '표시 개수',
      defaultValue: 20,
      min: 1,
      max: 100,
    },
  ],
}
