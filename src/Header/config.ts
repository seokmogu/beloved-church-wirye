import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: '상단 메뉴',
  admin: {
    description: '사이트 상단 내비게이션 메뉴를 관리합니다.',
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
      label: '메뉴 항목',
      admin: {
        description:
          '상단에 보일 링크의 이름과 순서를 관리합니다. 링크 대상 페이지의 본문은 각 관리 화면에서 수정합니다. 예배 안내는 홈페이지 빌더의 예배/오시는 길, 최신 설교는 설교, 공지사항은 공지사항, 주보는 주보, 헌금 안내는 헌금 안내 페이지에서 관리합니다.',
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 10,
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
