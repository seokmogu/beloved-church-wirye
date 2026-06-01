export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
}

export const YOUTUBE_CACHE_TAG = 'youtube-videos'

const YOUTUBE_REVALIDATE_SECONDS = 43200
const CHANNEL_ID_SCAN_LIMIT = 512 * 1024

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
  if (options?.cache === 'no-store') {
    return { cache: 'no-store' }
  }

  return {
    next: {
      revalidate: options?.revalidateSeconds ?? YOUTUBE_REVALIDATE_SECONDS,
      tags: [YOUTUBE_CACHE_TAG],
    },
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
    const title = (entry.match(/<media:title>([^<]+)<\/media:title>/) ?? [])[1] ?? ''
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
      if (videos) return videos
    }

    const resolvedChannelId = await resolveChannelIdFromURL(channelUrl, options)
    if (!resolvedChannelId || resolvedChannelId === explicitChannelId) return []

    return (await fetchVideosByChannelId(count, resolvedChannelId, options)) ?? []
  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error)
    return []
  }
}
