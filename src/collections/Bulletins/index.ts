import type { CollectionConfig } from 'payload'

export const Bulletins: CollectionConfig = {
  slug: 'bulletins',
  labels: {
    singular: '주보',
    plural: '주보 목록',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'isPublic', 'updatedAt'],
    description: '매주 주보를 업로드하고 관리합니다. 공개 여부를 선택할 수 있습니다.',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return {
        isPublic: { equals: true },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '제목',
      required: true,
      admin: {
        description: '예: 2026년 3월 22일 주보',
      },
    },
    {
      name: 'date',
      type: 'date',
      label: '주보 날짜',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy년 MM월 dd일',
        },
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: '공개 여부',
      defaultValue: false,
      admin: {
        description: '체크하면 로그인 없이도 열람 가능합니다.',
        position: 'sidebar',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: '주보 파일',
      admin: {
        description: 'PDF 또는 이미지 파일을 업로드하세요.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '설교 제목 / 메모',
      admin: {
        description: '이번 주 설교 제목이나 특별 사항을 입력하세요.',
        rows: 3,
      },
    },
  ],
  timestamps: true,
}
