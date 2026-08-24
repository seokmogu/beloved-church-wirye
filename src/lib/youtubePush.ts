import { createHmac, timingSafeEqual } from 'node:crypto'

import { parseYouTubeVideoId } from '@/lib/sermonTranscription'
import type { YouTubeVideo } from '@/lib/youtube'

export const YOUTUBE_PUBSUB_HUB_URL = 'https://pubsubhubbub.appspot.com/subscribe'

const YOUTUBE_CHANNEL_ID_PATTERN = /^UC[\w-]{20,}$/

export type YouTubePushNotification = {
  channelId: string
  video: YouTubeVideo
}

export function getYouTubePushTopic(channelId: string): string {
  if (!YOUTUBE_CHANNEL_ID_PATTERN.test(channelId)) {
    throw new Error('A canonical YouTube channel ID is required')
  }

  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
}

export function isAuthorizedYouTubePush(body: string, headers: Headers): boolean {
  const secret = process.env.YOUTUBE_PUSH_SECRET
  if (!secret) return false

  const rawSignature = headers.get('x-hub-signature-256') || headers.get('x-hub-signature')
  const match = rawSignature?.match(/^(sha1|sha256)=([a-f0-9]+)$/i)
  if (!match) return false

  const algorithm = match[1].toLowerCase()
  const actual = Buffer.from(`${algorithm}=${match[2].toLowerCase()}`)
  const expected = Buffer.from(
    `${algorithm}=${createHmac(algorithm, secret).update(body).digest('hex')}`,
  )

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function getYouTubePushChallenge(
  searchParams: URLSearchParams,
  channelId: string,
): string | null {
  const verifyToken = process.env.YOUTUBE_PUSH_VERIFY_TOKEN
  const mode = searchParams.get('hub.mode')
  const topic = searchParams.get('hub.topic')
  const challenge = searchParams.get('hub.challenge')
  const token = searchParams.get('hub.verify_token')

  if (!verifyToken || !challenge || mode !== 'subscribe' || topic !== getYouTubePushTopic(channelId)) {
    return null
  }

  const actual = Buffer.from(token || '')
  const expected = Buffer.from(verifyToken)
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? challenge : null
}

export function parseYouTubePushNotifications(body: string): YouTubePushNotification[] {
  const entries = body.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/g) ?? []

  return entries.flatMap((entry) => {
    const videoId = parseYouTubeVideoId(readTag(entry, 'yt:videoId'))
    const channelId = readTag(entry, 'yt:channelId')
    const title = readTag(entry, 'title')
    const publishedAt = readTag(entry, 'published')

    if (!videoId || !channelId || !YOUTUBE_CHANNEL_ID_PATTERN.test(channelId) || !title || !publishedAt) {
      return []
    }

    if (Number.isNaN(Date.parse(publishedAt))) return []

    return [
      {
        channelId,
        video: {
          id: videoId,
          publishedAt,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          title,
        },
      },
    ]
  })
}

export function buildYouTubePushSubscriptionBody(input: {
  callbackURL: string
  channelId: string
  secret: string
  verifyToken: string
}): URLSearchParams {
  const callbackURL = new URL(input.callbackURL)
  if (callbackURL.protocol !== 'https:') throw new Error('YouTube push callback URL must use HTTPS')

  return new URLSearchParams({
    'hub.callback': callbackURL.toString(),
    'hub.mode': 'subscribe',
    'hub.secret': input.secret,
    'hub.topic': getYouTubePushTopic(input.channelId),
    'hub.verify': 'async',
    'hub.verify_token': input.verifyToken,
  })
}

export async function requestYouTubePushSubscription(channelId: string): Promise<void> {
  const callbackURL = requiredEnv('YOUTUBE_PUSH_CALLBACK_URL')
  const secret = requiredEnv('YOUTUBE_PUSH_SECRET')
  const verifyToken = requiredEnv('YOUTUBE_PUSH_VERIFY_TOKEN')
  const body = buildYouTubePushSubscriptionBody({ callbackURL, channelId, secret, verifyToken })
  const response = await fetch(YOUTUBE_PUBSUB_HUB_URL, {
    body,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(`YouTube push subscription request failed: HTTP ${response.status}`)
  }
}

function readTag(source: string, tag: string): string | null {
  const match = source.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  if (!match) return null

  const value = match[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1').trim()
  return value ? decodeXmlEntities(value) : null
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

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required for YouTube push notifications`)
  return value
}
