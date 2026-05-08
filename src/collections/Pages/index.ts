import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Content } from '../../blocks/Content/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { YouTubeBlock } from '../../blocks/YouTubeBlock/config'
import { InstagramBlock } from '../../blocks/InstagramBlock/config'
import { ScheduleBlock } from '../../blocks/ScheduleBlock/config'
import { GoogleDriveBlock } from '../../blocks/GoogleDriveBlock/config'
import { OfferingBlock } from '../../blocks/OfferingBlock/config'
import { BulletinsBlock } from '../../blocks/BulletinsBlock/config'
import { AnnouncementsBlock } from '../../blocks/AnnouncementsBlock/config'
import { hero } from '@/heros/config'
import { adminSlugField } from '@/fields/adminSlugField'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: {
    singular: '일반 페이지',
    plural: '일반 페이지',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    components: {
      beforeList: ['@/components/admin/FixedPagesPanel#FixedPagesPanel'],
    },
    defaultColumns: ['title', 'updatedAt'],
    description:
      '기본 페이지와 콘텐츠 게시판은 위 목록의 관리 위치에서 수정하고, 여기는 별도로 필요한 독립 페이지를 만듭니다.',
    group: '2. 페이지와 메뉴',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '일반 페이지 제목',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              type: 'collapsible',
              label: '상단 배너',
              admin: {
                initCollapsed: true,
              },
              fields: [hero],
            },
            {
              name: 'layout',
              type: 'blocks',
              defaultValue: [
                {
                  blockType: 'content',
                  columns: [
                    {
                      size: 'full',
                    },
                  ],
                },
              ],
              blocks: [
                Content,
                MediaBlock,
                YouTubeBlock,
                InstagramBlock,
                ScheduleBlock,
                GoogleDriveBlock,
                OfferingBlock,
                AnnouncementsBlock,
                BulletinsBlock,
              ],
              admin: {
                description:
                  '기본 문단은 미리 추가되어 있습니다. 사진, 유튜브, 일정이 필요할 때만 섹션을 추가하세요.',
                initCollapsed: false,
              },
              label: '본문 블록',
            },
          ],
          label: '페이지 내용',
        },
        {
          name: 'meta',
          label: '고급 설정',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '발행일',
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: '자동으로 채워집니다. 예약/수정이 필요할 때만 바꾸세요.',
        position: 'sidebar',
      },
    },
    adminSlugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
