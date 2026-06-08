import type { CollectionConfig } from 'payload'

function defaultBulletinTitle(dateValue: unknown): string {
  const date = dateValue ? new Date(String(dateValue)) : new Date()

  if (Number.isNaN(date.getTime())) {
    return '주보'
  }

  return (
    new Intl.DateTimeFormat('ko-KR', {
      day: 'numeric',
      month: 'long',
      timeZone: 'Asia/Seoul',
      year: 'numeric',
    }).format(date) + ' 주보'
  )
}

export const Bulletins: CollectionConfig = {
  slug: 'bulletins',
  labels: {
    singular: '주보',
    plural: '주보 목록',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'isPublic', 'updatedAt'],
    description: '주보 파일만 올려도 날짜와 제목은 자동으로 채워집니다.',
    group: '3. 콘텐츠 게시',
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
      admin: {
        description: '비워두면 주보 날짜 기준으로 자동 생성됩니다.',
      },
    },
    {
      name: 'date',
      type: 'date',
      label: '주보 날짜',
      required: true,
      defaultValue: () => new Date().toISOString(),
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
      defaultValue: true,
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
      name: 'images',
      type: 'array',
      label: '주보 이미지',
      labels: { singular: '이미지', plural: '이미지' },
      admin: {
        description: '주보를 이미지로 올릴 경우 여러 장을 순서대로 등록합니다. (PDF 파일과 별개)',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: '이미지' },
        { name: 'caption', type: 'text', label: '캡션' },
      ],
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
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.title) data.title = defaultBulletinTitle(data.date)
        return data
      },
    ],
  },
  timestamps: true,
}
