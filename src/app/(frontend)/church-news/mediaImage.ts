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

  // Blob에 저장된 파일은 /media/{filename} 정적 경로에 존재하지 않으므로
  // Payload가 준 URL을 1차로 쓰고, 레포에 커밋된 레거시 파일용 정적 경로는 폴백으로만 둔다.
  const staticSrc = filename ? `/media/${encodeURIComponent(filename)}` : undefined
  if (url) {
    return staticSrc ? { fallbackSrc: staticSrc, src: url } : { src: url }
  }

  return { src: staticSrc || '' }
}
