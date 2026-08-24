import configPromise from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  automaticSermonData,
  isAuthorizedSermonTranscriptionWorker,
  needsAutomaticTranscription,
  parseYouTubeVideoId,
} from '@/lib/sermonTranscription'
import { fetchLatestVideos } from '@/lib/youtube'
import type { Sermon, SiteSetting } from '@/payload-types'

export const dynamic = 'force-dynamic'

const DEFAULT_VIDEO_COUNT = 12
const MAX_VIDEO_COUNT = 50

export async function GET(request: NextRequest) {
  if (!isAuthorizedSermonTranscriptionWorker(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const requestedVideoId = parseYouTubeVideoId(request.nextUrl.searchParams.get('videoId'))
  if (request.nextUrl.searchParams.has('videoId') && !requestedVideoId) {
    return NextResponse.json({ error: 'invalid YouTube video ID', ok: false }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  if (requestedVideoId) {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const sourceVideo = (
      await fetchLatestVideos(
        getVideoCount(settings),
        settings.youtubeChannelId,
        settings.youtubeChannelUrl,
        { cache: 'no-store' },
      )
    ).find((video) => video.id === requestedVideoId)

    if (!sourceVideo) return NextResponse.json({ jobs: [], ok: true })

    const sermon = await findOrCreateSermon(payload, sourceVideo)
    const jobs = needsAutomaticTranscription(sermon)
      ? [{ videoId: sermon.youtubeId as string, youtubeUrl: sermon.youtubeUrl as string }]
      : []

    return NextResponse.json({ jobs, ok: true })
  }

  const sermons = await payload.find({
    collection: 'sermons',
    depth: 0,
    limit: 3,
    select: {
      publicTranscript: true,
      transcriptStatus: true,
      youtubeId: true,
      youtubeUrl: true,
    },
    sort: '-createdAt',
    where: {
      and: [
        { status: { equals: 'published' } },
        { youtubeId: { exists: true } },
      ],
    },
  })
  const jobs = sermons.docs
    .filter(needsAutomaticTranscription)
    .map((sermon) => ({
      videoId: sermon.youtubeId as string,
      youtubeUrl: sermon.youtubeUrl as string,
    }))

  return NextResponse.json({ jobs, ok: true })
}

async function findOrCreateSermon(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sourceVideo: { id: string; publishedAt: string; thumbnail: string; title: string },
): Promise<Sermon> {
  const existing = await findSermonByYouTubeId(payload, sourceVideo.id)
  if (existing) return existing

  try {
    return await payload.create({
      collection: 'sermons',
      data: automaticSermonData(sourceVideo),
    })
  } catch (error) {
    // A simultaneous callback can win the unique YouTube-ID insert race. Re-read
    // once so callers retain one canonical CMS record rather than failing a job.
    const concurrent = await findSermonByYouTubeId(payload, sourceVideo.id)
    if (concurrent) return concurrent
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

function getVideoCount(settings: SiteSetting) {
  const configured =
    typeof settings.youtubeVideoCount === 'number'
      ? settings.youtubeVideoCount
      : DEFAULT_VIDEO_COUNT
  return Math.min(Math.max(configured, DEFAULT_VIDEO_COUNT), MAX_VIDEO_COUNT)
}
