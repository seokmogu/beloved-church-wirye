import type { CollectionConfig } from 'payload'

function defaultChurchNewsTitle(dateValue: unknown): string {
  const date = dateValue ? new Date(String(dateValue)) : new Date()

  if (Number.isNaN(date.getTime())) {
    return '교회소식'
  }

  return (
    new Intl.DateTimeFormat('ko-KR', {
      day: 'numeric',
      month: 'long',
      timeZone: 'Asia/Seoul',
      year: 'numeric',
    }).format(date) + ' 교회소식'
  )
}

export const ChurchNews: CollectionConfig = {
  slug: 'church-news',
  labels: {
    singular: '교회소식',
    plural: '교회소식',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'isPublic', 'updatedAt'],
    description: '카카오톡으로 공유되는 주간 교회소식 이미지를 묶어서 등록합니다.',
    group: '3. 콘텐츠 게시',
  },
  defaultSort: '-date',
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return {
        isPublic: { equals: true },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '제목',
      admin: {
        description: '비워두면 날짜 기준으로 자동 생성됩니다.',
      },
    },
    {
      name: 'date',
      type: 'date',
      label: '소식 날짜',
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
        description: '체크하면 로그인 없이도 교회소식 페이지에 표시됩니다.',
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '설명 / 메모',
      admin: {
        rows: 3,
      },
    },
    {
      name: 'images',
      type: 'array',
      label: '소식 이미지',
      labels: {
        singular: '이미지',
        plural: '이미지',
      },
      admin: {
        description: '카카오톡에서 받은 이미지를 순서대로 등록합니다.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: '이미지',
        },
        {
          name: 'caption',
          type: 'text',
          label: '캡션',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.title) data.title = defaultChurchNewsTitle(data.date)
        return data
      },
    ],
  },
  timestamps: true,
}
