import configPromise from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  isAuthorizedSermonTranscriptionWorker,
  parseYouTubeVideoId,
} from '@/lib/sermonTranscription'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isAuthorizedSermonTranscriptionWorker(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const requestedVideoId = parseYouTubeVideoId(request.nextUrl.searchParams.get('videoId'))
  if (request.nextUrl.searchParams.has('videoId') && !requestedVideoId) {
    return NextResponse.json({ error: 'invalid YouTube video ID', ok: false }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const sermons = await payload.find({
    collection: 'sermons',
    depth: 0,
    limit: requestedVideoId ? 1 : 3,
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
        { youtubeId: requestedVideoId ? { equals: requestedVideoId } : { exists: true } },
      ],
    },
  })
  const jobs = sermons.docs
    .filter(
      (sermon) =>
        Boolean(sermon.youtubeId && sermon.youtubeUrl) &&
        !(Boolean(sermon.publicTranscript?.trim()) && sermon.transcriptStatus !== 'unavailable'),
    )
    .map((sermon) => ({
      videoId: sermon.youtubeId as string,
      youtubeUrl: sermon.youtubeUrl as string,
    }))

  return NextResponse.json({ jobs, ok: true })
}
