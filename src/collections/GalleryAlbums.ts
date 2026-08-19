import type { CollectionConfig } from 'payload'

export const GalleryAlbums: CollectionConfig = {
  slug: 'gallery-albums',
  labels: {
    singular: '사진첩 앨범',
    plural: '사진첩',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventDate', 'isPublic', 'updatedAt'],
    description: '행사별 사진 앨범을 등록하고 공개 여부를 관리합니다.',
    group: '3. 콘텐츠 게시',
  },
  defaultSort: '-eventDate',
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { isPublic: { equals: true } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '앨범 제목',
      required: true,
    },
    {
      name: 'eventDate',
      type: 'date',
      label: '행사 일자',
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
      defaultValue: false,
      admin: {
        description: '체크하면 로그인 없이 사진첩에 표시됩니다. 해제하면 관리자 화면에서만 보입니다.',
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '앨범 소개',
      admin: {
        rows: 3,
      },
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'gallery-media',
      label: '대표 사진',
      admin: {
        description: '관리 화면에서는 앨범 첫 번째 사진이 대표 사진으로 자동 설정됩니다.',
        readOnly: true,
      },
    },
    {
      name: 'images',
      type: 'array',
      label: '사진',
      labels: {
        singular: '사진',
        plural: '사진',
      },
      admin: {
        description: '첫 번째 사진이 앨범 대표 사진이 됩니다.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'gallery-media',
          required: true,
          label: '사진',
        },
        {
          name: 'caption',
          type: 'text',
          label: '사진 설명',
        },
      ],
    },
  ],
  timestamps: true,
}
