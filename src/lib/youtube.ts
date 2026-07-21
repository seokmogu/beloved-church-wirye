export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
}

/**
 * Combine administrator-managed sermons with channel videos into one timeline.
 * Earlier groups win when the same YouTube ID appears more than once, so callers
 * can pass CMS videos first to preserve curated titles, dates, and thumbnails.
 */
export function mergeYouTubeVideos(...groups: YouTubeVideo[][]): YouTubeVideo[] {
  const videosById = new Map<string, YouTubeVideo>()

  for (const videos of groups) {
    for (const video of videos) {
      if (!video.id || videosById.has(video.id)) continue
      videosById.set(video.id, video)
    }
  }

  return [...videosById.values()].sort((left, right) => {
    const leftTimestamp = Date.parse(left.publishedAt)
    const rightTimestamp = Date.parse(right.publishedAt)
    const safeLeftTimestamp = Number.isNaN(leftTimestamp) ? Number.NEGATIVE_INFINITY : leftTimestamp
    const safeRightTimestamp = Number.isNaN(rightTimestamp)
      ? Number.NEGATIVE_INFINITY
      : rightTimestamp

    return safeRightTimestamp - safeLeftTimestamp
  })
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
 * "N일 전" / "3 weeks ago" 류 상대 시간을 근사 ISO 날짜로 변환한다.
 * InnerTube 목록 응답에는 절대 날짜가 없어 근사값으로 정렬/표시를 지탱한다.
 */
export function relativeTimeToISO(text: string, now = Date.now()): string {
  const match = text.match(
    /(\d+)\s*(초|분|시간|일|주|개월|달|년|second|minute|hour|day|week|month|year)/i,
  )
  if (!match) return ''

  const value = Number(match[1])
  const unit = match[2].toLowerCase()
  const msPer: Record<string, number> = {
    초: 1e3,
    second: 1e3,
    분: 6e4,
    minute: 6e4,
    시간: 36e5,
    hour: 36e5,
    일: 864e5,
    day: 864e5,
    주: 6048e5,
    week: 6048e5,
    개월: 2592e6,
    달: 2592e6,
    month: 2592e6,
    년: 31536e6,
    year: 31536e6,
  }
  const ms = msPer[unit]
  if (!ms) return ''
  return new Date(now - value * ms).toISOString()
}

type InnerTubeLockup = {
  contentId?: string
  contentType?: string
  metadata?: {
    lockupMetadataViewModel?: {
      metadata?: {
        contentMetadataViewModel?: {
          metadataRows?: Array<{ metadataParts?: Array<{ text?: { content?: string } }> }>
        }
      }
      title?: { content?: string }
    }
  }
}

/**
 * 키 없이 동작하는 최후 폴백: 유튜브 웹 클라이언트가 쓰는 내장(InnerTube) browse API로
 * 채널 '동영상' 탭을 조회한다. RSS가 플랫폼 광역 장애(2026년 반복)일 때를 대비한다.
 */
async function fetchVideosByInnerTube(
  count: number,
  channelId: string,
): Promise<YouTubeVideo[] | null> {
  const res = await fetch('https://www.youtube.com/youtubei/v1/browse', {
    body: JSON.stringify({
      browseId: channelId,
      context: {
        client: { clientName: 'WEB', clientVersion: '2.20260101.00.00', gl: 'KR', hl: 'ko' },
      },
      params: 'EgZ2aWRlb3PyBgQKAjoA', // '동영상' 탭
    }),
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: AbortSignal.timeout(YOUTUBE_FETCH_TIMEOUT_MS * 2),
  })
  if (!res.ok) return null

  const json = (await res.json().catch(() => null)) as unknown
  if (!json) return null

  const lockups: InnerTubeLockup[] = []
  collectLockups(json, lockups)

  const seen = new Set<string>()
  const videos: YouTubeVideo[] = []
  for (const lockup of lockups) {
    const id = lockup.contentId ?? ''
    if (!/^[A-Za-z0-9_-]{11}$/.test(id) || seen.has(id)) continue
    seen.add(id)

    const meta = lockup.metadata?.lockupMetadataViewModel
    const parts =
      meta?.metadata?.contentMetadataViewModel?.metadataRows?.flatMap(
        (row) => row.metadataParts ?? [],
      ) ?? []
    const relative = parts.map((part) => part.text?.content ?? '').find((text) => /전|ago/.test(text))

    videos.push({
      id,
      publishedAt: relative ? relativeTimeToISO(relative) : '',
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      title: meta?.title?.content ?? '',
    })
    if (videos.length >= count) break
  }

  return videos.length > 0 ? videos : null
}

function collectLockups(node: unknown, out: InnerTubeLockup[]) {
  if (Array.isArray(node)) {
    for (const item of node) collectLockups(item, out)
    return
  }
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>
    if (record.lockupViewModel) out.push(record.lockupViewModel as InnerTubeLockup)
    for (const value of Object.values(record)) collectLockups(value, out)
  }
}

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
    // RSS → Data API(키 있을 때) → InnerTube(키 불필요) 순 폴백
    const fetchWithFallbacks = async (id: string) => {
      const rss = await fetchVideosByChannelId(count, id, options)
      if (rss?.length) return rss
      const api = await fetchVideosByDataApi(count, id, options)
      if (api?.length) return api
      return await fetchVideosByInnerTube(count, id)
    }

    const explicitChannelId = parseChannelId(channelId?.trim() ?? '')
    if (explicitChannelId) {
      const videos = await fetchWithFallbacks(explicitChannelId)
      if (videos?.length) return videos
    }

    const resolvedChannelId = await resolveChannelIdFromURL(channelUrl, options)
    if (!resolvedChannelId || resolvedChannelId === explicitChannelId) return []

    return (await fetchWithFallbacks(resolvedChannelId)) ?? []
  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error)
    return []
  }
}
