export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
}

export const YOUTUBE_CACHE_TAG = 'youtube-videos'

/**
 * Extract the 11-character YouTube video ID from the URL shapes editors realistically
 * paste: watch?v=, youtu.be/, embed/, shorts/, live/, /v/ (incl. www. / m. hosts, which
 * are matched as substrings), or a bare 11-char ID on its own.
 * Returns undefined for anything that is not recognizably a YouTube reference.
 *
 * Single source of truth — previously this regex was duplicated (and diverging) across
 * the Sermons/ChurchVideos collections and the manage server actions.
 */
export function extractYouTubeId(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined

  // A bare ID pasted on its own. Anchored so we never match an incidental 11-char
  // substring of unrelated text.
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  const match = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  )
  return match?.[1]
}

const YOUTUBE_REVALIDATE_SECONDS = 43200
const CHANNEL_ID_SCAN_LIMIT = 512 * 1024
const YOUTUBE_FETCH_TIMEOUT_MS = 5000

type YouTubeFetchOptions = {
  cache?: RequestCache
  revalidateSeconds?: number
}

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

function getYouTubeFetchInit(options?: YouTubeFetchOptions): NextFetchInit {
  // Abort a slow/hung upstream rather than holding the request open until the platform
  // timeout. All callers already treat a rejected fetch as a soft failure (return []).
  const signal = AbortSignal.timeout(YOUTUBE_FETCH_TIMEOUT_MS)

  if (options?.cache === 'no-store') {
    return { cache: 'no-store', signal }
  }

  return {
    next: {
      revalidate: options?.revalidateSeconds ?? YOUTUBE_REVALIDATE_SECONDS,
      tags: [YOUTUBE_CACHE_TAG],
    },
    signal,
  }
}

function parseChannelId(source: string): string | null {
  const patterns = [
    /^(UC[\w-]{20,})$/,
    /youtube\.com\/channel\/(UC[\w-]{20,})/,
    /"channelId"\s*:\s*"(UC[\w-]{20,})"/,
    /itemprop="channelId"\s+content="(UC[\w-]{20,})"/,
    /content="(UC[\w-]{20,})"\s+itemprop="channelId"/,
  ]

  for (const pattern of patterns) {
    const channelId = source.match(pattern)?.[1]
    if (channelId) return channelId
  }

  return null
}

function normalizeYouTubeURL(url: string): string | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`)
    const isYouTubeHost = parsed.hostname === 'youtube.com' || parsed.hostname.endsWith('.youtube.com')
    return isYouTubeHost ? parsed.toString() : null
  } catch {
    return null
  }
}

async function resolveChannelIdFromURL(
  channelUrl?: string | null,
  options?: YouTubeFetchOptions,
): Promise<string | null> {
  const rawURL = channelUrl?.trim()
  if (!rawURL) return null

  const directMatch = parseChannelId(rawURL)
  if (directMatch) return directMatch

  const normalizedURL = normalizeYouTubeURL(rawURL)
  if (!normalizedURL) return null

  const res = await fetch(normalizedURL, getYouTubeFetchInit(options))
  if (!res.ok) return null

  return parseChannelId(await readResponsePrefix(res))
}

async function readResponsePrefix(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return res.text()

  const decoder = new TextDecoder()
  let bytesRead = 0
  let text = ''

  while (bytesRead < CHANNEL_ID_SCAN_LIMIT) {
    const { done, value } = await reader.read()
    if (done || !value) break

    bytesRead += value.byteLength
    text += decoder.decode(value, { stream: true })
    if (parseChannelId(text)) break
  }

  await reader.cancel().catch(() => null)
  text += decoder.decode()

  return text
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

async function fetchVideosByChannelId(
  count: number,
  channelId: string,
  options?: YouTubeFetchOptions,
): Promise<YouTubeVideo[] | null> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  const res = await fetch(rssUrl, getYouTubeFetchInit(options))
  if (!res.ok) return null

  const xml = await res.text()
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? []

  return entries.slice(0, count).map((entry) => {
    const videoId = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ?? [])[1] ?? ''
    const title = decodeXmlEntities((entry.match(/<media:title>([^<]+)<\/media:title>/) ?? [])[1] ?? '')
    const thumbnail =
      (entry.match(/<media:thumbnail url="([^"]+)"/) ?? [])[1] ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    const publishedAt = (entry.match(/<published>([^<]+)<\/published>/) ?? [])[1] ?? ''

    return { id: videoId, title, thumbnail, publishedAt }
  })
}

/**
 * Fetch latest videos from the church YouTube channel via RSS feed.
 * No API key required. Results cached and revalidated every 12 hours unless a cron refresh
 * invalidates the YouTube cache tag during the Sunday publishing window.
 */
/**
 * YouTube RSS가 간헐적으로 500을 반환할 때를 대비한 Data API 폴백.
 * (RSS 실패가 ISR 캐시에 박히면 홈 설교 섹션이 통째로 비어 보인다.)
 */
async function fetchVideosByDataApi(
  count: number,
  channelId: string,
  options?: YouTubeFetchOptions,
): Promise<YouTubeVideo[] | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date` +
    `&maxResults=${Math.max(1, Math.min(50, count))}&channelId=${channelId}&key=${apiKey}`
  const res = await fetch(url, getYouTubeFetchInit(options))
  if (!res.ok) return null

  const json = (await res.json().catch(() => null)) as {
    items?: Array<{
      id?: { videoId?: string }
      snippet?: {
        publishedAt?: string
        thumbnails?: { high?: { url?: string } }
        title?: string
      }
    }>
  } | null

  const items = json?.items ?? []
  const videos = items
    .map((item) => {
      const id = item.id?.videoId ?? ''
      return {
        id,
        publishedAt: item.snippet?.publishedAt ?? '',
        thumbnail: item.snippet?.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        title: decodeXmlEntities(item.snippet?.title ?? ''),
      }
    })
    .filter((video) => video.id)

  return videos.length > 0 ? videos : null
}

export async function fetchLatestVideos(
  count = 4,
  channelId?: string | null,
  channelUrl?: string | null,
  options?: YouTubeFetchOptions,
): Promise<YouTubeVideo[]> {
  try {
    const explicitChannelId = parseChannelId(channelId?.trim() ?? '')
    if (explicitChannelId) {
      const videos = await fetchVideosByChannelId(count, explicitChannelId, options)
      if (videos && videos.length > 0) return videos

      // RSS 실패/빈 결과 → Data API 폴백
      const fallback = await fetchVideosByDataApi(count, explicitChannelId, options)
      if (fallback) return fallback
    }

    const resolvedChannelId = await resolveChannelIdFromURL(channelUrl, options)
    if (!resolvedChannelId || resolvedChannelId === explicitChannelId) return []

    const videos = await fetchVideosByChannelId(count, resolvedChannelId, options)
    if (videos && videos.length > 0) return videos

    return (await fetchVideosByDataApi(count, resolvedChannelId, options)) ?? []
  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error)
    return []
  }
}
