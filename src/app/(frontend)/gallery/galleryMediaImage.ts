import type { GalleryMedia } from '@/payload-types'

type GallerySize = 'card' | 'display' | 'thumbnail'

export function galleryImageURL(
  media: GalleryMedia | null | undefined,
  preferredSizes: GallerySize[],
): string | null {
  if (!media) return null

  for (const sizeName of preferredSizes) {
    const url = media.sizes?.[sizeName]?.url
    if (url) return url
  }

  if (media.url) return media.url
  return media.filename ? `/gallery-media/${encodeURIComponent(media.filename)}` : null
}
