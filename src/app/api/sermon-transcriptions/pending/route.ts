import configPromise from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  isAuthorizedSermonTranscriptionWorker,
  parseYouTubeVideoId,
} from '@/lib/sermonTranscription'
import { fetchLatestVideos } from '@/lib/youtube'
import type { SiteSetting } from '@/payload-types'

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
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const latestVideos = await fetchLatestVideos(
    getVideoCount(settings),
    settings.youtubeChannelId,
    settings.youtubeChannelUrl,
    { cache: 'no-store' },
  )
  const candidateVideos = requestedVideoId
    ? latestVideos.filter((video) => video.id === requestedVideoId)
    : latestVideos

  if (candidateVideos.length === 0) {
    return NextResponse.json({ jobs: [], ok: true })
  }

  const existing = await payload.find({
    collection: 'sermons',
    depth: 0,
    limit: candidateVideos.length,
    select: {
      publicTranscript: true,
      transcriptStatus: true,
      youtubeId: true,
    },
    where: { youtubeId: { in: candidateVideos.map((video) => video.id) } },
  })
  const completedIds = new Set(
    existing.docs
      .filter(
        (sermon) =>
          Boolean(sermon.publicTranscript?.trim()) && sermon.transcriptStatus !== 'unavailable',
      )
      .map((sermon) => sermon.youtubeId)
      .filter((videoId): videoId is string => Boolean(videoId)),
  )
  const jobs = candidateVideos
    .filter((video) => !completedIds.has(video.id))
    .slice(0, 1)
    .map((video) => ({
      publishedAt: video.publishedAt,
      thumbnail: video.thumbnail,
      title: video.title,
      videoId: video.id,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
    }))

  return NextResponse.json({ jobs, ok: true })
}

function getVideoCount(settings: SiteSetting) {
  const configured =
    typeof settings.youtubeVideoCount === 'number'
      ? settings.youtubeVideoCount
      : DEFAULT_VIDEO_COUNT
  return Math.min(Math.max(configured, DEFAULT_VIDEO_COUNT), MAX_VIDEO_COUNT)
}
