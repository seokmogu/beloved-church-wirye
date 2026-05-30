import type { Media } from '@/payload-types'

type ImageSizeName = 'large' | 'medium' | 'small'

export type ChurchNewsImageSource = {
  fallbackSrc?: string
  src: string
}

export function getChurchNewsImageSource(
  media: Media | null | undefined,
  preferredSizes: ImageSizeName[],
): ChurchNewsImageSource | null {
  if (!media) return null

  for (const sizeName of preferredSizes) {
    const size = media.sizes?.[sizeName]
    const source = getSourceFromUrlAndFilename(size?.url, size?.filename)
    if (source) return source
  }

  return getSourceFromUrlAndFilename(media.url, media.filename)
}

function getSourceFromUrlAndFilename(
  url: null | string | undefined,
  filename: null | string | undefined,
): ChurchNewsImageSource | null {
  if (!url && !filename) return null

  const staticSrc = filename ? `/media/${encodeURIComponent(filename)}` : undefined
  if (!url && staticSrc) return { src: staticSrc }

  if (isPayloadMediaFileUrl(url) && staticSrc) {
    return {
      fallbackSrc: url || undefined,
      src: staticSrc,
    }
  }

  return { src: url || staticSrc || '' }
}

function isPayloadMediaFileUrl(url: null | string | undefined): boolean {
  if (!url) return false
  return url.startsWith('/api/media/file/') || url.includes('/api/media/file/')
}
