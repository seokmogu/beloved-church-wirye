import type { GlobalConfig } from 'payload'

import { internalLinkOptions, link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: '상단메뉴',
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
      label: '메뉴항목',
      admin: {
        description:
          '상단에 보일 링크의 이름과 순서를 관리합니다. 링크 대상 페이지의 본문은 각 관리 화면에서 수정합니다. 예배안내는 홈페이지 빌더의 예배/오시는 길, 최신 설교는 설교, 공지사항은 공지사항, 주보는 주보, 헌금안내는 헌금안내페이지에서 관리합니다.',
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'children',
          type: 'array',
          label: '하위메뉴',
          admin: {
            description:
              '상위 메뉴 아래에 펼쳐질 하위 링크를 관리합니다. 비워두면 기존처럼 단일 메뉴로 표시됩니다.',
            initCollapsed: true,
            components: {
              RowLabel: '@/Header/RowLabel#RowLabel',
            },
          },
          fields: [
            {
              name: 'link',
              type: 'group',
              admin: {
                hideGutter: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'type',
                      type: 'radio',
                      admin: {
                        layout: 'horizontal',
                        width: '50%',
                      },
                      defaultValue: 'internal',
                      options: [
                        { label: '사이트 고정페이지', value: 'internal' },
                        { label: '외부/직접 주소', value: 'custom' },
                      ],
                    },
                    {
                      name: 'newTab',
                      type: 'checkbox',
                      admin: {
                        style: {
                          alignSelf: 'flex-end',
                        },
                        width: '50%',
                      },
                      label: 'Open in new tab',
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'internalPath',
                      type: 'select',
                      admin: {
                        condition: (_, siblingData) => siblingData?.type === 'internal',
                        width: '50%',
                      },
                      defaultValue: '/',
                      label: '사이트 고정페이지',
                      options: internalLinkOptions,
                      required: true,
                    },
                    {
                      name: 'url',
                      type: 'text',
                      admin: {
                        condition: (_, siblingData) => siblingData?.type === 'custom',
                        width: '50%',
                      },
                      label: '외부 URL 또는 직접 주소',
                      required: true,
                    },
                    {
                      name: 'label',
                      type: 'text',
                      admin: {
                        width: '50%',
                      },
                      label: 'Label',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
          maxRows: 6,
        },
      ],
      maxRows: 10,
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
