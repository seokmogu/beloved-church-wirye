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

  const requestedDocumentId = parseDocumentId(request.nextUrl.searchParams.get('documentId'))
  const requestedKind = parseKind(request.nextUrl.searchParams.get('kind'))
  if (request.nextUrl.searchParams.has('documentId') && requestedDocumentId === null) {
    return NextResponse.json({ error: 'invalid document ID', ok: false }, { status: 400 })
  }
  if (request.nextUrl.searchParams.has('kind') && !requestedKind) {
    return NextResponse.json({ error: 'invalid transcription kind', ok: false }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const baseURL = new URL(request.url).origin
  const kinds = requestedKind ? [requestedKind] : (['bulletin', 'church-news'] as const)
  const jobs = await Promise.all(
    kinds.map((kind) => findPendingJobs(payload, kind, baseURL, requestedDocumentId)),
  )

  const pendingJobs = jobs.flat()
  return NextResponse.json({
    jobs: requestedDocumentId === null ? pendingJobs.slice(0, 3) : pendingJobs,
    ok: true,
  })
}

async function findPendingJobs(
  payload: Awaited<ReturnType<typeof getPayload>>,
  kind: ImageTranscriptionKind,
  baseURL: string,
  documentId: number | null,
) {
  const collection = kind === 'bulletin' ? 'bulletins' : 'church-news'
  const result = await payload.find({
    collection,
    depth: 1,
    limit: documentId === null ? 20 : 1,
    sort: '-updatedAt',
    where:
      documentId === null
        ? ({ 'images.image': { exists: true } } as any)
        : ({ and: [{ id: { equals: documentId } }, { 'images.image': { exists: true } }] } as any),
  })

  return result.docs.flatMap((doc) => {
    const source = createImageTranscriptionSource(kind, doc, { baseURL })
    if (!source || doc.accessibleContent?.sourceHash === source.sourceHash) return []
    return [source]
  })
}

function parseDocumentId(value: string | null): number | null {
  if (value === null) return null
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function parseKind(value: string | null): ImageTranscriptionKind | null {
  if (value === null) return null
  return value === 'bulletin' || value === 'church-news' ? value : null
}
