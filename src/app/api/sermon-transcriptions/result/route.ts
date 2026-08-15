import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  isAuthorizedSermonTranscriptionWorker,
  normalizeSermonTranscriptionResult,
  parseYouTubeVideoId,
} from '@/lib/sermonTranscription'
import { fetchLatestVideos } from '@/lib/youtube'
import type { SiteSetting } from '@/payload-types'

export const dynamic = 'force-dynamic'

type ResultBody = {
  result?: unknown
  videoId?: unknown
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedSermonTranscriptionWorker(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as ResultBody | null
  const videoId = parseYouTubeVideoId(body?.videoId)
  const result = normalizeSermonTranscriptionResult(body?.result)
  if (!videoId || !result) {
    return NextResponse.json({ error: 'invalid transcription result', ok: false }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const existing = await payload.find({
    collection: 'sermons',
    depth: 0,
    limit: 1,
    where: { youtubeId: { equals: videoId } },
  })
  const sermon = existing.docs[0]
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const sourceVideo = (
    await fetchLatestVideos(
      getVideoCount(settings),
      settings.youtubeChannelId,
      settings.youtubeChannelUrl,
      { cache: 'no-store' },
    )
  ).find((video) => video.id === videoId)

  if (!sermon && !sourceVideo) {
    return NextResponse.json(
      { error: 'video is no longer available from this channel', ok: false },
      { status: 404 },
    )
  }

  const transcription = {
    publicTranscript: result.publicTranscript,
    rawTranscript: result.rawTranscript,
    transcriptSource: 'whisper' as const,
    transcriptStatus: 'automatic' as const,
    transcriptUpdatedAt: new Date().toISOString(),
  }

  if (sermon) {
    await payload.update({
      collection: 'sermons',
      data: transcription,
      id: sermon.id,
    })
  } else if (sourceVideo) {
    await payload.create({
      collection: 'sermons',
      data: {
        ...transcription,
        sermonDate: sourceVideo.publishedAt,
        status: 'published',
        thumbnail: sourceVideo.thumbnail,
        title: sourceVideo.title,
        youtubeId: sourceVideo.id,
        youtubeUrl: `https://www.youtube.com/watch?v=${sourceVideo.id}`,
      },
    })
  }

  revalidatePath('/')
  revalidatePath('/sermon')
  revalidatePath(`/sermon/${videoId}`)

  return NextResponse.json({ ok: true, videoId })
}

function getVideoCount(settings: SiteSetting) {
  const configured =
    typeof settings.youtubeVideoCount === 'number' ? settings.youtubeVideoCount : 12
  return Math.min(Math.max(configured, 12), 50)
}
