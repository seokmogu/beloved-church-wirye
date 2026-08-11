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
  // Payload가 준 URL을 1차로 쓴다. 초기 교회소식은 PNG 원본만 레포에
  // 남아 있어, 누락된 개발 Blob의 WebP 대신 그 원본으로 되돌아간다.
  const staticSrc = filename ? `/media/${encodeURIComponent(filename)}` : undefined
  const legacyStaticSrc = getLegacyChurchNewsStaticSource(filename)
  const fallbackSrc = legacyStaticSrc || staticSrc
  if (url) {
    return fallbackSrc ? { fallbackSrc, src: url } : { src: url }
  }

  return { src: fallbackSrc || '' }
}

function getLegacyChurchNewsStaticSource(filename: string | null | undefined): string | undefined {
  if (!filename) return undefined

  const legacyMatch = filename.match(
    /^(KakaoTalk_Photo_\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})-(\d{3}(?:-\d+)?)(?:-\d+x\d+)?\.webp$/,
  )
  if (!legacyMatch) return undefined

  const [, timestamp, pageNumber] = legacyMatch
  return `/media/${encodeURIComponent(`${timestamp} ${pageNumber}.png`)}`
}
