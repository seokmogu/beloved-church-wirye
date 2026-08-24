import { createHmac } from 'node:crypto'

import { afterEach, describe, expect, it } from 'vitest'

import {
  buildYouTubePushSubscriptionBody,
  getYouTubePushChallenge,
  getYouTubePushTopic,
  isAuthorizedYouTubePush,
  parseYouTubePushNotifications,
} from '@/lib/youtubePush'

const channelId = 'UCEyfzJVbYFdI9An9e0FTojw'
const body = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <entry>
    <yt:videoId>wkbm1nB-FYs</yt:videoId>
    <yt:channelId>${channelId}</yt:channelId>
    <title>Beloved &amp; Church 26.08.23. 주일예배</title>
    <published>2026-08-23T10:05:32+00:00</published>
  </entry>
</feed>`

const originalSecret = process.env.YOUTUBE_PUSH_SECRET
const originalVerifyToken = process.env.YOUTUBE_PUSH_VERIFY_TOKEN

afterEach(() => {
  if (originalSecret === undefined) delete process.env.YOUTUBE_PUSH_SECRET
  else process.env.YOUTUBE_PUSH_SECRET = originalSecret

  if (originalVerifyToken === undefined) delete process.env.YOUTUBE_PUSH_VERIFY_TOKEN
  else process.env.YOUTUBE_PUSH_VERIFY_TOKEN = originalVerifyToken
})

describe('YouTube push notifications', () => {
  it('accepts a correctly signed upload and rejects a modified payload', () => {
    process.env.YOUTUBE_PUSH_SECRET = 'test-signing-secret'
    const signature = createHmac('sha1', process.env.YOUTUBE_PUSH_SECRET).update(body).digest('hex')
    const headers = new Headers({ 'x-hub-signature': `sha1=${signature}` })

    expect(isAuthorizedYouTubePush(body, headers)).toBe(true)
    expect(isAuthorizedYouTubePush(`${body}\nmodified`, headers)).toBe(false)
  })

  it('returns the hub challenge only for the expected topic and verify token', () => {
    process.env.YOUTUBE_PUSH_VERIFY_TOKEN = 'verify-token'
    const params = new URLSearchParams({
      'hub.challenge': 'hub-challenge',
      'hub.mode': 'subscribe',
      'hub.topic': getYouTubePushTopic(channelId),
      'hub.verify_token': 'verify-token',
    })

    expect(getYouTubePushChallenge(params, channelId)).toBe('hub-challenge')
    params.set('hub.topic', 'https://www.youtube.com/feeds/videos.xml?channel_id=other')
    expect(getYouTubePushChallenge(params, channelId)).toBeNull()
  })

  it('parses only complete channel video entries and preserves their published timestamp', () => {
    expect(parseYouTubePushNotifications(body)).toEqual([
      {
        channelId,
        video: {
          id: 'wkbm1nB-FYs',
          publishedAt: '2026-08-23T10:05:32+00:00',
          thumbnail: 'https://i.ytimg.com/vi/wkbm1nB-FYs/hqdefault.jpg',
          title: 'Beloved & Church 26.08.23. 주일예배',
        },
      },
    ])
    expect(parseYouTubePushNotifications('<feed><entry><title>missing</title></entry></feed>')).toEqual([])
  })

  it('builds a signed HTTPS subscription request for the configured feed', () => {
    const form = buildYouTubePushSubscriptionBody({
      callbackURL: 'https://www.belovedchurch.co.kr/api/youtube-push',
      channelId,
      secret: 'hub-secret',
      verifyToken: 'verify-token',
    })

    expect(Object.fromEntries(form)).toEqual({
      'hub.callback': 'https://www.belovedchurch.co.kr/api/youtube-push',
      'hub.mode': 'subscribe',
      'hub.secret': 'hub-secret',
      'hub.topic': getYouTubePushTopic(channelId),
      'hub.verify': 'async',
      'hub.verify_token': 'verify-token',
    })
  })
})
