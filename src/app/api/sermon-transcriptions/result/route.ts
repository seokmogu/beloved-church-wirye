import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  isAuthorizedSermonTranscriptionWorker,
  normalizeSermonTranscriptionResult,
  parseYouTubeVideoId,
} from '@/lib/sermonTranscription'

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

  if (!sermon) {
    return NextResponse.json(
      { error: 'sermon must be registered in CMS before transcription', ok: false },
      { status: 409 },
    )
  }

  const transcription = {
    publicTranscript: result.publicTranscript,
    rawTranscript: result.rawTranscript,
    transcriptSource: 'whisper' as const,
    transcriptStatus: 'automatic' as const,
    transcriptUpdatedAt: new Date().toISOString(),
  }

  await payload.update({
    collection: 'sermons',
    data: transcription,
    id: sermon.id,
  })

  revalidatePath('/')
  revalidatePath('/sermon')
  revalidatePath(`/sermon/${videoId}`)

  return NextResponse.json({ ok: true, videoId })
}
