import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import {
  CHURCH_NEWS_IMAGE_MAX_HEIGHT,
  CHURCH_NEWS_IMAGE_MAX_WIDTH,
  CHURCH_NEWS_WEBP_QUALITY,
} from '../lib/manage/churchNewsImage'
import { assertDurableUploadStorageConfigured } from '../lib/manage/uploadStorage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: '이미지/파일',
    plural: '이미지/파일',
  },
  folders: true,
  admin: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description: '사이트에서 사용하는 이미지, 주보 파일, QR 코드 등을 보관합니다.',
    group: '5. 이미지/파일',
    useAsTitle: 'filename',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeOperation: [
      ({ args, operation }) => {
        if ((operation === 'create' || operation === 'update') && args.req.file) {
          assertDurableUploadStorageConfigured(1)
        }

        return args
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '대체 텍스트',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      label: '설명',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'contentHash',
      type: 'text',
      label: '원본 파일 해시',
      index: true,
      admin: {
        hidden: true,
      },
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    resizeOptions: {
      fit: 'inside',
      height: CHURCH_NEWS_IMAGE_MAX_HEIGHT,
      width: CHURCH_NEWS_IMAGE_MAX_WIDTH,
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'webp',
      options: {
        effort: 4,
        quality: CHURCH_NEWS_WEBP_QUALITY,
      },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
