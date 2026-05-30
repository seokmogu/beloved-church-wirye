import { Buffer } from 'node:buffer'

import sharp from 'sharp'

export const CHURCH_NEWS_IMAGE_MAX_HEIGHT = 1920
export const CHURCH_NEWS_IMAGE_MAX_WIDTH = 1440
export const CHURCH_NEWS_WEBP_QUALITY = 82

type UploadFileLike = {
  name?: string
  type?: string
}

export type OptimizedChurchNewsImage = {
  data: Buffer
  filename: string
  mimeType: string
  optimized: boolean
}

export async function optimizeChurchNewsImage(
  data: Buffer,
  file: UploadFileLike,
): Promise<OptimizedChurchNewsImage> {
  if (!file.type?.startsWith('image/')) {
    return {
      data,
      filename: file.name || 'church-news-image.upload',
      mimeType: file.type || 'application/octet-stream',
      optimized: false,
    }
  }

  const optimizedData = await sharp(data, { failOn: 'none' })
    .rotate()
    .resize({
      fit: 'inside',
      height: CHURCH_NEWS_IMAGE_MAX_HEIGHT,
      width: CHURCH_NEWS_IMAGE_MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ effort: 4, quality: CHURCH_NEWS_WEBP_QUALITY })
    .toBuffer()

  return {
    data: optimizedData,
    filename: toChurchNewsWebpFilename(file.name || ''),
    mimeType: 'image/webp',
    optimized: optimizedData.length < data.length,
  }
}

export function toChurchNewsWebpFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^.]+$/, '').trim()
  const safeBase = withoutExtension
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${safeBase || 'church-news-image'}.webp`
}
