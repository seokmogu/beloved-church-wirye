import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: '하단 메뉴/푸터',
  admin: {
    description: '사이트 하단 링크, 예배 시간, 주소, 연락처를 관리합니다.',
    group: '2. 페이지와 메뉴',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Footer 링크',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'worshipSchedule',
      type: 'textarea',
      label: '예배 시간 안내',
      defaultValue: '청·장년예배 주일 낮 12시\n어린이예배 주일 낮 12시\n금요기도회 금요일 밤 8시',
    },
    {
      name: 'address',
      type: 'textarea',
      label: '주소',
      defaultValue: '위례서일로 3길 21-4 (BELOVED LOUNGE)',
    },
    {
      name: 'churchPhone',
      type: 'text',
      label: '전화번호',
    },
    {
      name: 'legalText',
      type: 'text',
      label: '저작권 문구',
      defaultValue: 'All rights reserved.',
    },
    {
      name: 'showThemeSelector',
      type: 'checkbox',
      label: '테마 선택 표시',
      defaultValue: true,
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
