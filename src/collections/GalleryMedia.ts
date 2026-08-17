import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { authenticated } from '@/access/authenticated'
import { sanitizeMediaFilename } from '@/utilities/mediaFiles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * 행사갤러리 전용 업로드 컬렉션입니다.
 *
 * 공용 Media와 분리해 R2의 작은 이미지 파생본 정책을 적용합니다. 이 컬렉션의
 * 파일 URL은 R2 공개 도메인으로 직접 제공되므로, 비공개 앨범은 "공개 갤러리에
 * 표시하지 않음"을 뜻하며 민감 사진의 접근 제어 기능은 아닙니다.
 */
export const GalleryMedia: CollectionConfig = {
  slug: 'gallery-media',
  labels: {
    singular: '행사갤러리 사진',
    plural: '행사갤러리 사진',
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description: '행사갤러리 전용 사진입니다. Cloudflare R2 저장소를 사용합니다.',
    group: '5. 이미지/파일',
    useAsTitle: 'filename',
  },
  disableDuplicate: true,
  access: {
    create: authenticated,
    delete: authenticated,
    // Public gallery pages load these records server-side through their public
    // album query. Keep the media API itself authenticated so unlisted albums
    // do not expose a browsable metadata feed.
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '대체 텍스트',
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
          if (args?.data && !args.data.alt) {
            args.data.alt = original.normalize('NFC').replace(/\.[^.]+$/, '')
          }
        }

        return args
      },
    ],
  },
  upload: {
    staticDir: path.resolve(dirname, '../../public/gallery-media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        height: 480,
        crop: 'center',
      },
      {
        name: 'card',
        width: 960,
      },
      {
        name: 'display',
        width: 1440,
      },
    ],
  },
}
