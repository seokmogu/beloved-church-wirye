import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const Sermons: CollectionConfig = {
  slug: 'sermons',
  labels: {
    singular: {
      ko: '설교',
      en: 'Sermon',
    },
    plural: {
      ko: '설교',
      en: 'Sermons',
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'preacher', 'scriptureRef', 'sermonDate', 'status', 'updatedAt'],
    listSearchableFields: ['title', 'preacher', 'scriptureRef', 'description'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        ko: '설교 제목',
        en: 'Sermon Title',
      },
      required: true,
      admin: {
        description: {
          ko: '설교의 제목을 입력하세요',
          en: 'Enter the sermon title',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        ko: 'URL 슬러그',
        en: 'Slug',
      },
      admin: {
        position: 'sidebar',
        description: {
          ko: '자동 생성됩니다',
          en: 'Auto-generated from title',
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            // Auto-generate slug from title + sermonDate
            if (data?.title && data?.sermonDate) {
              const date = new Date(data.sermonDate)
              const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
              return `${dateStr}-${data.title
                .toLowerCase()
                .replace(/[^a-z0-9가-힣]+/g, '-')
                .replace(/^-+|-+$/g, '')}`
            }
            return value
          },
        ],
      },
      index: true,
    },
    {
      name: 'preacher',
      type: 'text',
      label: {
        ko: '설교자',
        en: 'Preacher',
      },
      required: true,
      admin: {
        description: {
          ko: '설교자의 이름 (예: 홍길동 목사)',
          en: 'Name of the preacher',
        },
      },
    },
    {
      name: 'scriptureRef',
      type: 'text',
      label: {
        ko: '성경 본문',
        en: 'Scripture Reference',
      },
      required: true,
      admin: {
        description: {
          ko: '성경 본문 (예: 요한복음 3:16, 창세기 1:1-5)',
          en: 'Scripture reference (e.g., John 3:16, Genesis 1:1-5)',
        },
      },
    },
    {
      name: 'sermonDate',
      type: 'date',
      label: {
        ko: '설교 날짜',
        en: 'Sermon Date',
      },
      required: true,
      admin: {
        description: {
          ko: '설교가 진행된 날짜',
          en: 'Date when the sermon was preached',
        },
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
      index: true,
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      label: {
        ko: 'YouTube URL',
        en: 'YouTube URL',
      },
      required: true,
      admin: {
        description: {
          ko: '설교 영상 YouTube URL (예: https://www.youtube.com/watch?v=VIDEO_ID)',
          en: 'YouTube video URL',
        },
      },
      validate: (val: unknown) => {
        if (!val || typeof val !== 'string') return true
        // Validate YouTube URL format
        const youtubeRegex =
          /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/
        if (!youtubeRegex.test(val)) {
          return 'Please enter a valid YouTube URL'
        }
        return true
      },
    },
    {
      name: 'youtubeId',
      type: 'text',
      label: {
        ko: 'YouTube ID',
        en: 'YouTube Video ID',
      },
      admin: {
        position: 'sidebar',
        description: {
          ko: 'YouTube URL에서 자동 추출됩니다',
          en: 'Auto-extracted from YouTube URL',
        },
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ value, data, siblingData }) => {
            // Extract YouTube ID from URL
            const url = siblingData?.youtubeUrl || data?.youtubeUrl
            if (!url) return value

            // Extract video ID from various YouTube URL formats
            const match = url.match(
              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            )
            return match ? match[1] : value
          },
        ],
      },
    },
    {
      name: 'thumbnail',
      type: 'text',
      label: {
        ko: '썸네일 URL',
        en: 'Thumbnail URL',
      },
      admin: {
        position: 'sidebar',
        description: {
          ko: 'YouTube ID로부터 자동 생성됩니다',
          en: 'Auto-generated from YouTube ID',
        },
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ value, data, siblingData }) => {
            // Auto-generate thumbnail URL from YouTube ID
            const youtubeId = siblingData?.youtubeId || data?.youtubeId
            if (!youtubeId) return value
            return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        ko: '설교 설명',
        en: 'Description',
      },
      admin: {
        description: {
          ko: '설교에 대한 간략한 설명 또는 요약 (선택사항)',
          en: 'Brief description or summary of the sermon (optional)',
        },
      },
    },
    {
      name: 'sermonSeries',
      type: 'text',
      label: {
        ko: '설교 시리즈',
        en: 'Sermon Series',
      },
      admin: {
        description: {
          ko: '설교 시리즈명 (선택사항, 예: "사랑의 실천", "믿음의 여정")',
          en: 'Sermon series name (optional)',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: {
        ko: '공개 상태',
        en: 'Status',
      },
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: {
            ko: '초안',
            en: 'Draft',
          },
          value: 'draft',
        },
        {
          label: {
            ko: '공개',
            en: 'Published',
          },
          value: 'published',
        },
      ],
      admin: {
        position: 'sidebar',
        description: {
          ko: '공개 상태를 선택하세요',
          en: 'Select the publication status',
        },
      },
    },
  ],
  defaultSort: '-sermonDate',
  timestamps: true,
}
