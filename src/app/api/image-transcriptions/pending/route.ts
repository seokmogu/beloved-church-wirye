import configPromise from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  createImageTranscriptionSource,
  isAuthorizedImageTranscriptionWorker,
  type ImageTranscriptionKind,
} from '@/lib/imageTranscription'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isAuthorizedImageTranscriptionWorker(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const baseURL = new URL(request.url).origin
  const jobs = await Promise.all(
    (['bulletin', 'church-news'] as const).map((kind) => findPendingJobs(payload, kind, baseURL)),
  )

  return NextResponse.json({ jobs: jobs.flat().slice(0, 3), ok: true })
}

async function findPendingJobs(
  payload: Awaited<ReturnType<typeof getPayload>>,
  kind: ImageTranscriptionKind,
  baseURL: string,
) {
  const collection = kind === 'bulletin' ? 'bulletins' : 'church-news'
  const result = await payload.find({
    collection,
    depth: 1,
    limit: 20,
    sort: '-updatedAt',
    where: { 'images.image': { exists: true } } as any,
  })

  return result.docs.flatMap((doc) => {
    const source = createImageTranscriptionSource(kind, doc, { baseURL })
    if (!source || doc.accessibleContent?.sourceHash === source.sourceHash) return []
    return [source]
  })
}
