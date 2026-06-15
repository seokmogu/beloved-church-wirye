import { Buffer } from 'node:buffer'

import sharp from 'sharp'

// All manage-form image uploads are normalized to WebP and capped in size before they
// reach storage (Vercel Blob), keeping the gallery cheap to host. Non-images pass through.
export const UPLOAD_IMAGE_MAX_WIDTH = 1600
export const UPLOAD_IMAGE_MAX_HEIGHT = 2000
export const UPLOAD_IMAGE_WEBP_QUALITY = 80

type UploadFileLike = {
  name?: string
  type?: string
}

export type OptimizedImage = {
  data: Buffer
  filename: string
  mimeType: string
  optimized: boolean
}

export async function optimizeUploadImage(
  data: Buffer,
  file: UploadFileLike,
): Promise<OptimizedImage> {
  // Non-images (e.g. a PDF bulletin) and animated GIFs pass through untouched —
  // sharp's single-frame WebP pass would flatten a GIF's animation.
  if (!file.type?.startsWith('image/') || file.type === 'image/gif') {
    return {
      data,
      filename: file.name || 'upload',
      mimeType: file.type || 'application/octet-stream',
      optimized: false,
    }
  }

  const optimizedData = await sharp(data, { failOn: 'none' })
    .rotate()
    .resize({
      fit: 'inside',
      height: UPLOAD_IMAGE_MAX_HEIGHT,
      width: UPLOAD_IMAGE_MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ effort: 4, quality: UPLOAD_IMAGE_WEBP_QUALITY })
    .toBuffer()

  return {
    data: optimizedData,
    filename: toWebpFilename(file.name || ''),
    mimeType: 'image/webp',
    optimized: optimizedData.length < data.length,
  }
}

export function toWebpFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^.]+$/, '').trim()
  const safeBase = withoutExtension
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${safeBase || 'image'}.webp`
}
