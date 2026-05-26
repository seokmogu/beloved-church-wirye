import { Buffer } from 'node:buffer'

import type { Payload } from 'payload'

type InstagramMedia = {
  caption?: string
  children?: {
    data?: Array<{
      media_type?: string
      media_url?: string
      thumbnail_url?: string
    }>
  }
  id: string
  media_product_type?: string
  media_type?: string
  media_url?: string
  permalink?: string
  shortcode?: string
  thumbnail_url?: string
  timestamp?: string
}

type InstagramMediaResponse = {
  data?: InstagramMedia[]
  error?: {
    message?: string
    type?: string
  }
}

type InstagramPostInput = {
  caption: string | null
  hashtags: string | null
  imageUrl: string
  postId: string
  publishedAt: string | null
  type: 'p' | 'reel'
}

export type InstagramSyncResult = {
  count: number
  posts: Array<{
    caption?: string | null
    hashtags?: string | null
    postId: string
    publishedAt?: string | null
    thumbnail?: number | string | null
    thumbnailUrl?: string | null
    type: 'p' | 'reel'
  }>
}

export class InstagramSyncConfigError extends Error {
  constructor(message = 'Instagram 자동 동기화 설정이 필요합니다.') {
    super(message)
    this.name = 'InstagramSyncConfigError'
  }
}

const DEFAULT_LIMIT = 4
const DEFAULT_API_VERSION = 'v21.0'
const IMAGE_MIME_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export function hasInstagramSyncConfig() {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN)
}

export async function syncInstagramPosts(
  payload: Payload,
  { limit = DEFAULT_LIMIT }: { limit?: number } = {},
): Promise<InstagramSyncResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!accessToken) {
    throw new InstagramSyncConfigError()
  }

  const media = await fetchInstagramMedia(accessToken, limit)
  const posts = media
    .sort((a, b) => Date.parse(b.timestamp ?? '') - Date.parse(a.timestamp ?? ''))
    .map(toPostInput)
    .filter((post): post is InstagramPostInput => Boolean(post))
    .slice(0, limit)

  const instagramPosts = await Promise.all(
    posts.map(async (post) => {
      const thumbnail = await ensureInstagramThumbnail(payload, post).catch(() => null)

      return {
        caption: post.caption,
        hashtags: post.hashtags,
        postId: post.postId,
        publishedAt: post.publishedAt,
        thumbnail,
        thumbnailUrl: thumbnail ? null : post.imageUrl,
        type: post.type,
      }
    }),
  )

  await payload.updateGlobal({
    data: {
      instagramPosts,
    } as any,
    slug: 'site-settings',
  })

  return {
    count: instagramPosts.length,
    posts: instagramPosts,
  }
}

async function fetchInstagramMedia(accessToken: string, limit: number): Promise<InstagramMedia[]> {
  const url = buildInstagramMediaURL(limit)
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const json = (await res.json().catch(() => ({}))) as InstagramMediaResponse
  if (!res.ok) {
    const message = json.error?.message || `Instagram API 요청 실패: ${res.status}`
    throw new Error(message)
  }

  return Array.isArray(json.data) ? json.data : []
}

function buildInstagramMediaURL(limit: number) {
  const userId = process.env.INSTAGRAM_USER_ID?.trim()
  const version = process.env.INSTAGRAM_API_VERSION?.trim() || DEFAULT_API_VERSION
  const base = userId
    ? `https://graph.facebook.com/${version}/${userId}/media`
    : `https://graph.instagram.com/${version}/me/media`
  const url = new URL(base)
  url.searchParams.set(
    'fields',
    'id,caption,media_product_type,media_type,media_url,permalink,shortcode,thumbnail_url,timestamp,children{media_type,media_url,thumbnail_url}',
  )
  url.searchParams.set('limit', String(Math.max(1, Math.min(25, limit))))
  return url
}

function toPostInput(media: InstagramMedia): InstagramPostInput | null {
  const permalink = media.permalink
  const postId = media.shortcode || parseInstagramPostId(permalink)
  const imageUrl = resolveMediaImageUrl(media)
  if (!permalink || !postId || !imageUrl) return null

  return {
    caption: normalizeCaption(media.caption),
    hashtags: extractHashtags(media.caption),
    imageUrl,
    postId,
    publishedAt: normalizeTimestamp(media.timestamp),
    type: isReel(media) ? 'reel' : 'p',
  }
}

function parseInstagramPostId(permalink?: string) {
  if (!permalink) return null

  try {
    const parsed = new URL(permalink)
    const match = parsed.pathname.match(/\/(?:p|reel|tv)\/([^/]+)/)
    return match?.[1] ?? null
  } catch {
    const match = permalink.match(/\/(?:p|reel|tv)\/([^/?#]+)/)
    return match?.[1] ?? null
  }
}

function resolveMediaImageUrl(media: InstagramMedia) {
  if (media.thumbnail_url) return media.thumbnail_url
  if (media.media_type === 'IMAGE' && media.media_url) return media.media_url

  const child = media.children?.data?.find((item) => item.thumbnail_url || item.media_url)
  return child?.thumbnail_url || child?.media_url || media.media_url || null
}

function isReel(media: InstagramMedia) {
  return media.media_product_type === 'REELS' || media.permalink?.includes('/reel/') || false
}

function normalizeCaption(caption: string | undefined) {
  const trimmed = caption?.trim()
  return trimmed || null
}

function extractHashtags(caption: string | undefined) {
  const tags = caption?.match(/#[^\s#]+/g) ?? []
  return tags.length > 0 ? Array.from(new Set(tags)).join(' ') : null
}

function normalizeTimestamp(timestamp: string | undefined) {
  if (!timestamp) return null

  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function ensureInstagramThumbnail(payload: Payload, post: InstagramPostInput) {
  const alt = `Instagram 자동 썸네일 ${post.postId}`
  const existing = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    where: {
      alt: {
        equals: alt,
      },
    },
  })

  const existingId = existing.docs[0]?.id
  if (existingId) return existingId

  const file = await downloadInstagramImage(post)
  const uploaded = await payload.create({
    collection: 'media',
    data: { alt },
    file,
  } as any)

  return uploaded.id
}

async function downloadInstagramImage(post: InstagramPostInput) {
  const res = await fetch(post.imageUrl, {
    cache: 'no-store',
    headers: {
      Referer: 'https://www.instagram.com/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    },
  })

  if (!res.ok) {
    throw new Error(`Instagram 썸네일 다운로드 실패: ${post.postId}`)
  }

  const mimetype = normalizeImageMimeType(res.headers.get('content-type'))
  const data = Buffer.from(await res.arrayBuffer())
  return {
    data,
    mimetype,
    name: `instagram-${post.postId}.${extensionForMimeType(mimetype)}`,
    size: data.byteLength,
  }
}

function normalizeImageMimeType(contentType: string | null) {
  const mimetype = contentType?.split(';')[0]?.trim().toLowerCase()
  return mimetype && IMAGE_MIME_TYPES.has(mimetype) ? mimetype : 'image/jpeg'
}

function extensionForMimeType(mimetype: string) {
  switch (mimetype) {
    case 'image/avif':
      return 'avif'
    case 'image/gif':
      return 'gif'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}
