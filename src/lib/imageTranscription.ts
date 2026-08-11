import { createHash, timingSafeEqual } from 'node:crypto'

import { getServerSideURL } from '@/utilities/getURL'

export type ImageTranscriptionKind = 'bulletin' | 'church-news'

export type ImageTranscriptionResult = {
  content: string
  seoDescription?: string | null
  seoTitle?: string | null
  summary?: string | null
}

type MediaLike = {
  filename?: string | null
  id?: number | string
  updatedAt?: string | null
  url?: string | null
}

type ImageRowLike = {
  image?: MediaLike | number | string | null
}

type TranscribableDocument = {
  id: number | string
  images?: ImageRowLike[] | null
  title?: string | null
}

export type ImageTranscriptionSource = {
  documentId: number | string
  images: Array<{ filename: string | null; url: string }>
  kind: ImageTranscriptionKind
  sourceHash: string
  title: string | null
}

export function createImageTranscriptionSource(
  kind: ImageTranscriptionKind,
  doc: TranscribableDocument,
  options: { baseURL?: string } = {},
): ImageTranscriptionSource | null {
  const images = (doc.images || [])
    .map((row) => (typeof row.image === 'object' && row.image ? row.image : null))
    .map((media) => {
      if (!media?.url) return null

      return {
        filename: media.filename || null,
        id: media.id || null,
        updatedAt: media.updatedAt || null,
        url: toAbsoluteURL(media.url, options.baseURL),
      }
    })
    .filter((image): image is NonNullable<typeof image> => Boolean(image))

  if (images.length === 0) return null

  const sourceHash = createHash('sha256')
    .update(
      JSON.stringify({
        documentId: doc.id,
        images,
        kind,
      }),
    )
    .digest('hex')

  return {
    documentId: doc.id,
    images: images.map(({ filename, url }) => ({ filename, url })),
    kind,
    sourceHash,
    title: doc.title?.trim() || null,
  }
}

export function imageSourcesChanged(
  current: TranscribableDocument,
  previous: TranscribableDocument | undefined,
): boolean {
  return imageIdentity(current.images) !== imageIdentity(previous?.images)
}

export function isAuthorizedImageTranscriptionWorker(request: Request): boolean {
  const secret = process.env.IMAGE_TRANSCRIPTION_WORKER_SECRET
  if (!secret) return false

  const provided = Buffer.from(request.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

export function normalizeImageTranscriptionResult(value: unknown): ImageTranscriptionResult | null {
  if (typeof value !== 'object' || value === null) return null

  const input = value as Record<string, unknown>
  const content = normalizeText(input.content, 80_000)
  if (!content) return null

  return {
    content,
    seoDescription: normalizeText(input.seoDescription, 500),
    seoTitle: normalizeText(input.seoTitle, 160),
    summary: normalizeText(input.summary, 1_000),
  }
}

function imageIdentity(images: ImageRowLike[] | null | undefined): string {
  return JSON.stringify(
    (images || []).map((row) => {
      if (typeof row.image === 'object' && row.image) {
        return {
          filename: row.image.filename || null,
          id: row.image.id || null,
          updatedAt: row.image.updatedAt || null,
          url: row.image.url || null,
        }
      }

      return row.image || null
    }),
  )
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text && text.length <= maxLength ? text : null
}

function toAbsoluteURL(value: string, baseURL?: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return new URL(value, baseURL || getServerSideURL()).toString()
}
