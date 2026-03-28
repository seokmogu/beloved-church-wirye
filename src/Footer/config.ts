import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
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
      type: 'text',
      label: '예배 시간 안내',
      defaultValue: '주일예배 12:00 | 저녁예배 20:00',
    },
    {
      name: 'address',
      type: 'text',
      label: '주소',
      defaultValue: '위례서일로 3길 21-4 (BELOVED LOUNGE)',
    },
    {
      name: 'churchPhone',
      type: 'text',
      label: '전화번호',
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
