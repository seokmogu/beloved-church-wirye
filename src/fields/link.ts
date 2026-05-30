import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

export type LinkAppearances = 'default' | 'outline'

export const appearanceOptions: Record<LinkAppearances, { label: string; value: string }> = {
  default: {
    label: 'Default',
    value: 'default',
  },
  outline: {
    label: 'Outline',
    value: 'outline',
  },
}

export const internalLinkOptions = [
  { label: '홈', value: '/' },
  { label: '교회소개 - 홈/디자인/교회 정보에서 관리', value: '/about' },
  { label: '섬기는 사람들 - 섬기는 사람들에서 관리', value: '/about/leaders' },
  { label: '예배안내 - 홈/디자인/교회 정보 > 예배와 위치에서 관리', value: '/worship' },
  { label: '설교영상 - 설교에서 관리', value: '/sermon' },
  { label: '공지사항 - 공지사항에서 관리', value: '/announcements' },
  { label: '교회소식 - 교회소식에서 관리', value: '/church-news' },
  { label: '동영상 - 동영상에서 관리', value: '/church-news/videos' },
  { label: '주보 - 주보에서 관리', value: '/bulletins' },
  { label: '새가족등록 - 신청 내역은 새가족에서 확인', value: '/newcomer' },
  { label: '헌금안내 - 헌금안내페이지에서 관리', value: '/offering' },
]

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  overrides?: Partial<GroupField>
}) => Field

export const link: LinkType = ({ appearances, disableLabel = false, overrides = {} } = {}) => {
  const linkResult: GroupField = {
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
              {
                label: '사이트 고정페이지',
                value: 'internal',
              },
              {
                label: 'CMS 페이지/글 선택',
                value: 'reference',
              },
              {
                label: '외부/직접 주소',
                value: 'custom',
              },
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
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'internalPath',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'internal',
        description:
          '고정페이지의 본문은 메뉴 화면이 아니라 해당 CMS 영역에서 관리합니다. 예배안내는 홈/디자인/교회 정보, 최신 설교는 설교, 공지사항은 공지사항에서 수정합니다.',
      },
      defaultValue: '/',
      label: '사이트 고정페이지',
      options: internalLinkOptions,
      required: true,
    },
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: 'CMS 페이지/글 선택',
      relationTo: ['pages', 'posts'],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: '외부 URL 또는 직접 주소',
      required: true,
    },
  ]

  if (!disableLabel) {
    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
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
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline]

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      admin: {
        description: 'Choose how the link should be rendered.',
      },
      defaultValue: 'default',
      options: appearanceOptionsToUse,
    })
  }

  return deepMerge(linkResult, overrides)
}
