import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublishedSermon } from '@/access/authenticatedOrPublishedSermon'
import { formatAdminSlug } from '@/fields/adminSlugField'
import { extractYouTubeId } from '@/lib/youtube'

const defaultPreacher = '사랑하는교회'

function defaultToday() {
  return new Date().toISOString()
}

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
    read: authenticatedOrPublishedSermon,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'preacher', 'sermonDate', 'updatedAt'],
    description: '설교 제목과 YouTube URL만 입력해도 영상 정보와 공개 상태가 자동으로 정리됩니다.',
    group: '3. 콘텐츠 게시',
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
      label: 'URL 주소',
      admin: {
        position: 'sidebar',
        description: '제목을 기준으로 자동 생성됩니다. 필요하면 직접 수정할 수 있습니다.',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            const existing = formatAdminSlug(value)
            if (existing) return existing

            return formatAdminSlug(data?.title)
          },
        ],
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
          ko: '설교영상 YouTube URL (예: https://www.youtube.com/watch?v=VIDEO_ID)',
          en: 'YouTube video URL',
        },
      },
      validate: (val: unknown) => {
        if (!val || typeof val !== 'string') return true
        // Accept the same URL shapes the ID extractor understands (watch / youtu.be /
        // embed / shorts / live / bare ID) so editors aren't blocked on valid links.
        return extractYouTubeId(val) ? true : '올바른 YouTube 주소를 입력해 주세요.'
      },
    },
    {
      type: 'collapsible',
      label: '설교 상세 정보',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'preacher',
          type: 'text',
          label: {
            ko: '설교자',
            en: 'Preacher',
          },
          defaultValue: defaultPreacher,
          admin: {
            description: {
              ko: '비워두면 기본 교회명으로 저장됩니다',
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
          admin: {
            description: {
              ko: '선택사항입니다. 예: 요한복음 3:16',
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
          defaultValue: defaultToday,
          admin: {
            description: {
              ko: '비워두면 오늘 날짜로 저장됩니다',
              en: 'Date when the sermon was preached',
            },
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'yyyy-MM-dd',
            },
          },
          index: true,
        },
      ],
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
          ko: 'YouTube URL에서 자동 추출됩니다. 필요하면 직접 수정할 수 있습니다',
          en: 'Auto-extracted from YouTube URL',
        },
      },
      hooks: {
        beforeChange: [
          ({ value, data, siblingData }) => {
            // Extract YouTube ID from URL
            const url = siblingData?.youtubeUrl || data?.youtubeUrl
            if (!url || value) return value

            // Extract video ID from various YouTube URL formats
            return extractYouTubeId(url) ?? value
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
          ko: 'YouTube ID로부터 자동 생성됩니다. 필요하면 직접 수정할 수 있습니다',
          en: 'Auto-generated from YouTube ID',
        },
      },
      hooks: {
        beforeChange: [
          ({ value, data, siblingData }) => {
            // Auto-generate thumbnail URL from YouTube ID
            const youtubeId = siblingData?.youtubeId || data?.youtubeId
            if (!youtubeId || value) return value
            return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
          },
        ],
      },
    },
    {
      type: 'collapsible',
      label: '선택 정보',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'description',
          type: 'textarea',
          label: {
            ko: '설교 설명',
            en: 'Description',
          },
          admin: {
            description: {
              ko: '설교에 대한 간략한 설명 또는 요약',
              en: 'Brief description or summary of the sermon',
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
              ko: '설교 시리즈명. 예: 사랑의 실천',
              en: 'Sermon series name',
            },
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '설교 전사본',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'publicTranscript',
          type: 'textarea',
          label: {
            ko: '공개 전사본',
            en: 'Public transcript',
          },
          admin: {
            description: {
              ko: '자동 전사본 또는 검수한 전사본입니다. 공개 화면에는 자동 전사 안내와 함께 표시됩니다.',
              en: 'An automatic or reviewed transcript shown publicly with a disclosure.',
            },
          },
        },
        {
          name: 'transcriptStatus',
          type: 'select',
          label: {
            ko: '전사 상태',
            en: 'Transcript status',
          },
          defaultValue: 'unavailable',
          options: [
            { label: { ko: '전사본 없음', en: 'Unavailable' }, value: 'unavailable' },
            { label: { ko: '자동 전사본', en: 'Automatic' }, value: 'automatic' },
            { label: { ko: '검수 완료', en: 'Reviewed' }, value: 'reviewed' },
          ],
        },
        {
          name: 'transcriptSource',
          type: 'select',
          label: {
            ko: '전사 출처',
            en: 'Transcript source',
          },
          options: [
            { label: { ko: 'Whisper', en: 'Whisper' }, value: 'whisper' },
            {
              label: { ko: 'YouTube 자동 자막', en: 'YouTube automatic captions' },
              value: 'youtube_automatic',
            },
            {
              label: { ko: 'Whisper·YouTube 대조', en: 'Whisper and YouTube compared' },
              value: 'combined',
            },
            { label: { ko: '관리자 직접 입력', en: 'Manually entered' }, value: 'manual' },
          ],
        },
        {
          name: 'transcriptUpdatedAt',
          type: 'date',
          label: {
            ko: '전사본 갱신일',
            en: 'Transcript updated at',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'rawTranscript',
          type: 'textarea',
          label: {
            ko: '원문 전사본 (관리자 전용)',
            en: 'Raw transcript (admin only)',
          },
          access: {
            create: ({ req: { user } }) => Boolean(user),
            read: ({ req: { user } }) => Boolean(user),
            update: ({ req: { user } }) => Boolean(user),
          },
          admin: {
            description: {
              ko: '자동 처리 원문 보관용입니다. 공개 화면에는 표시되지 않습니다.',
              en: 'Preserved processing source; never shown on the public site.',
            },
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: {
        ko: '공개 상태',
        en: 'Status',
      },
      required: true,
      defaultValue: 'published',
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
          ko: '기본값은 공개입니다. 초안으로 저장해야 할 때만 바꾸세요',
          en: 'Select the publication status',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.preacher) data.preacher = defaultPreacher
        if (data.scriptureRef == null) data.scriptureRef = ''
        if (!data.sermonDate) data.sermonDate = defaultToday()
        if (!data.youtubeId) data.youtubeId = extractYouTubeId(data.youtubeUrl)
        if (!data.thumbnail && data.youtubeId) {
          data.thumbnail = `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`
        }
        if (!data.status) data.status = 'published'
        return data
      },
    ],
  },
  defaultSort: '-sermonDate',
  timestamps: true,
}
