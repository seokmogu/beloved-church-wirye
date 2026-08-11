import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  createImageTranscriptionSource,
  isAuthorizedImageTranscriptionWorker,
  normalizeImageTranscriptionResult,
  type ImageTranscriptionKind,
} from '@/lib/imageTranscription'

export const dynamic = 'force-dynamic'

type ResultBody = {
  documentId?: unknown
  kind?: unknown
  result?: unknown
  sourceHash?: unknown
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedImageTranscriptionWorker(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as ResultBody | null
  const kind = parseKind(body?.kind)
  const documentId = parseDocumentId(body?.documentId)
  const sourceHash = typeof body?.sourceHash === 'string' ? body.sourceHash : null
  const result = normalizeImageTranscriptionResult(body?.result)
  if (!kind || documentId === null || !sourceHash || !result) {
    return NextResponse.json({ error: 'invalid transcription result', ok: false }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const collection = kind === 'bulletin' ? 'bulletins' : 'church-news'
  const doc = await payload.findByID({ collection, depth: 1, id: documentId })
  const source = createImageTranscriptionSource(kind, doc, { baseURL: new URL(request.url).origin })

  if (!source || source.sourceHash !== sourceHash) {
    return NextResponse.json({ error: 'stale source', ok: false }, { status: 409 })
  }

  await payload.update({
    collection,
    context: { skipImageTranscription: true },
    data: {
      accessibleContent: {
        content: result.content,
        processedAt: new Date().toISOString(),
        seoDescription: result.seoDescription,
        seoTitle: result.seoTitle,
        sourceHash,
        summary: result.summary,
      },
    },
    id: documentId,
  })

  revalidatePath(kind === 'bulletin' ? `/bulletins/${documentId}` : `/church-news/${documentId}`)
  revalidatePath(kind === 'bulletin' ? '/bulletins' : '/church-news')

  return NextResponse.json({ ok: true })
}

function parseDocumentId(value: unknown): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function parseKind(value: unknown): ImageTranscriptionKind | null {
  return value === 'bulletin' || value === 'church-news' ? value : null
}
