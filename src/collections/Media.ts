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
import { sanitizeMediaFilename, toRelativeMediaURL } from '../utilities/mediaFiles'

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
    // 복제는 원본 파일명을 그대로 재사용해 파일명 안전화 훅을 우회하므로 막는다
    disableDuplicate: true,
    group: '5. 이미지/파일',
    useAsTitle: 'filename',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
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
  hooks: {
    beforeOperation: [
      ({ args, operation, req }) => {
        if ((operation !== 'create' && operation !== 'update') || !req.file?.name) return args

        const original = req.file.name
        const sanitized = sanitizeMediaFilename(original)
        if (sanitized !== original) {
          req.file.name = sanitized
          // 원본 파일명은 관리 화면 가독성을 위해 대체 텍스트로 보존
          if (args?.data && !args.data.alt) {
            args.data.alt = original.normalize('NFC').replace(/\.[^.]+$/, '')
          }
        }

        return args
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (!doc) return doc
        if (doc.url) doc.url = toRelativeMediaURL(doc.url)
        if (doc.thumbnailURL) doc.thumbnailURL = toRelativeMediaURL(doc.thumbnailURL)
        if (doc.sizes) {
          for (const size of Object.values(doc.sizes) as Array<{ url?: string | null }>) {
            if (size?.url) size.url = toRelativeMediaURL(size.url)
          }
        }
        return doc
      },
    ],
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
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
        name: 'xlarge',
        width: 1920,
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
