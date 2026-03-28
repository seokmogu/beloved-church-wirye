import type { CollectionConfig } from 'payload'

import { defaultLexical } from '@/fields/defaultLexical'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'isPinned'],
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
      name: 'publishedAt',
      type: 'date',
      required: true,
      label: '게시일',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
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
}
