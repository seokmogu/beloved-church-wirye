import type { CollectionConfig } from 'payload'

import { defaultLexical } from '@/fields/defaultLexical'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: {
    components: {
      beforeList: ['@/components/admin/AnnouncementBoardGuide#AnnouncementBoardGuide'],
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'isPinned'],
    description:
      '공지 글을 작성하면 /announcements 게시판과 홈 공지 섹션에 자동으로 노출됩니다. 별도 페이지를 만들 필요가 없습니다.',
    group: '3. 콘텐츠 게시',
  },
  labels: {
    singular: '공지사항',
    plural: '공지사항',
  },
  defaultSort: '-publishedAt',
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: '제목',
    },
    {
      name: 'content',
      type: 'richText',
      editor: defaultLexical,
      label: '내용',
    },
    {
      name: 'announcementPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/AnnouncementPreview#AnnouncementPreview',
        },
      },
    },
    {
      type: 'collapsible',
      label: '선택 설정',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
          label: '게시일',
          defaultValue: () => new Date().toISOString(),
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            description: '비워두면 지금 시각으로 저장됩니다.',
          },
        },
        {
          name: 'isPinned',
          type: 'checkbox',
          defaultValue: false,
          label: '상단 고정',
        },
        {
          name: 'googleDriveLink',
          type: 'text',
          label: '구글드라이브 링크',
          admin: {
            description: '구글드라이브 파일 링크를 입력하면 미리보기가 표시됩니다',
          },
        },
      ],
    },
  ],
}
