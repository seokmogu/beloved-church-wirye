import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { automaticSermonData, needsAutomaticTranscription } from '@/lib/sermonTranscription'
import { dispatchSermonTranscription } from '@/lib/sermonTranscriptionDispatch'
import {
  getYouTubePushChallenge,
  isAuthorizedYouTubePush,
  parseYouTubePushNotifications,
} from '@/lib/youtubePush'
import type { Sermon, SiteSetting } from '@/payload-types'

export const dynamic = 'force-dynamic'

/**
 * YouTube's PubSubHubbub hub calls this during subscription setup. Returning
 * only the verified challenge proves this is our configured channel callback.
 */
export async function GET(request: NextRequest) {
  const channelId = await getConfiguredChannelId()
  if (!channelId) return new NextResponse(null, { status: 404 })

  const challenge = getYouTubePushChallenge(request.nextUrl.searchParams, channelId)
  if (!challenge) return new NextResponse(null, { status: 404 })

  return new NextResponse(challenge, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    status: 200,
  })
}

/**
 * A verified channel-upload notification registers the specific sermon and
 * immediately dispatches that video ID to Mac Studio. Updated metadata for an
 * already-known video is intentionally ignored, so it cannot re-run a finished
 * transcript.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  if (!isAuthorizedYouTubePush(body, request.headers)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const channelId = await getConfiguredChannelId()
  if (!channelId) return NextResponse.json({ ok: false }, { status: 503 })

  const notifications = parseYouTubePushNotifications(body).filter(
    (notification) => notification.channelId === channelId,
  )
  if (notifications.length === 0) return new NextResponse(null, { status: 204 })

  const payload = await getPayload({ config: configPromise })
  const dispatched: string[] = []

  for (const notification of notifications) {
    const { created, sermon } = await findOrCreateSermon(payload, notification.video)
    if (!created || !needsAutomaticTranscription(sermon)) continue

    try {
      await dispatchSermonTranscription({ videoId: notification.video.id })
    } catch (error) {
      // The hub retries non-2xx delivery. Remove only the record created in this
      // callback so that a retry can safely claim and dispatch the same video.
      await payload.delete({ collection: 'sermons', id: sermon.id })
      throw error
    }

    dispatched.push(notification.video.id)
  }

  if (dispatched.length > 0) {
    revalidatePath('/')
    revalidatePath('/sermon')
    for (const videoId of dispatched) revalidatePath(`/sermon/${videoId}`)
  }

  return NextResponse.json({ dispatched, ok: true }, { status: 202 })
}

async function getConfiguredChannelId(): Promise<string | null> {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const channelId = settings.youtubeChannelId?.trim()
  return channelId || null
}

async function findOrCreateSermon(
  payload: Awaited<ReturnType<typeof getPayload>>,
  video: { id: string; publishedAt: string; thumbnail: string; title: string },
): Promise<{ created: boolean; sermon: Sermon }> {
  const existing = await findSermonByYouTubeId(payload, video.id)
  if (existing) return { created: false, sermon: existing }

  try {
    const sermon = await payload.create({
      collection: 'sermons',
      data: automaticSermonData(video),
    })
    return { created: true, sermon }
  } catch (error) {
    const concurrent = await findSermonByYouTubeId(payload, video.id)
    if (concurrent) return { created: false, sermon: concurrent }
    throw error
  }
}

async function findSermonByYouTubeId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  videoId: string,
): Promise<Sermon | null> {
  const result = await payload.find({
    collection: 'sermons',
    depth: 0,
    limit: 1,
    where: { youtubeId: { equals: videoId } },
  })
  return result.docs[0] ?? null
}
