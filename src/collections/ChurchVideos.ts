import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublishedSermon } from '@/access/authenticatedOrPublishedSermon'
import { formatAdminSlug } from '@/fields/adminSlugField'
import { extractYouTubeId } from '@/lib/youtube'

function defaultToday() {
  return new Date().toISOString()
}

export const ChurchVideos: CollectionConfig = {
  slug: 'church-videos',
  labels: {
    singular: {
      ko: '동영상',
      en: 'Church Video',
    },
    plural: {
      ko: '동영상',
      en: 'Church Videos',
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublishedSermon,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'videoDate', 'status', 'updatedAt'],
    description: '교회소식 하위 동영상페이지에 수동으로 노출할 YouTube 영상을 관리합니다.',
    group: '3. 콘텐츠 게시',
    listSearchableFields: ['title', 'description'],
    useAsTitle: 'title',
  },
  defaultSort: '-videoDate',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '영상 제목',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL 주소',
      admin: {
        description: '제목을 기준으로 자동 생성됩니다. 필요하면 직접 수정할 수 있습니다.',
        position: 'sidebar',
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
      label: 'YouTube URL',
      required: true,
      admin: {
        description: '동영상 YouTube URL을 직접 입력합니다. 채널 자동 수집은 사용하지 않습니다.',
      },
      validate: (val: unknown) => {
        if (!val || typeof val !== 'string') return true
        // Accept the same URL shapes the ID extractor understands (watch / youtu.be /
        // embed / shorts / live / bare ID) so editors aren't blocked on valid links.
        return extractYouTubeId(val) ? true : '올바른 YouTube 주소를 입력해 주세요.'
      },
    },
    {
      name: 'videoDate',
      type: 'date',
      label: '영상 날짜',
      required: true,
      defaultValue: defaultToday,
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd',
          pickerAppearance: 'dayOnly',
        },
      },
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '설명',
    },
    {
      name: 'youtubeId',
      type: 'text',
      label: 'YouTube ID',
      admin: {
        description: 'YouTube URL에서 자동 추출됩니다.',
        position: 'sidebar',
      },
    },
    {
      name: 'thumbnail',
      type: 'text',
      label: '썸네일 URL',
      admin: {
        description: 'YouTube ID로부터 자동 생성됩니다. 필요하면 직접 수정할 수 있습니다.',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: '공개 상태',
      required: true,
      defaultValue: 'published',
      options: [
        { label: '초안', value: 'draft' },
        { label: '공개', value: 'published' },
      ],
      admin: {
        description: '공개 상태인 영상만 동영상페이지에 표시됩니다.',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.videoDate) data.videoDate = defaultToday()
        if (!data.youtubeId) data.youtubeId = extractYouTubeId(data.youtubeUrl)
        if (!data.thumbnail && data.youtubeId) {
          data.thumbnail = `https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`
        }
        if (!data.status) data.status = 'published'
        return data
      },
    ],
  },
  timestamps: true,
}
