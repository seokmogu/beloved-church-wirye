import { timingSafeEqual } from 'node:crypto'

import type { YouTubeVideo } from '@/lib/youtube'

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export type SermonTranscriptionResult = {
  publicTranscript: string
  rawTranscript: string
}

export type SermonTranscriptionCandidate = {
  publicTranscript?: string | null
  status?: string | null
  transcriptStatus?: string | null
  youtubeId?: string | null
  youtubeUrl?: string | null
}

export function isAuthorizedSermonTranscriptionWorker(request: Request): boolean {
  const secret = process.env.SERMON_TRANSCRIPTION_WORKER_SECRET
  if (!secret) return false

  const provided = Buffer.from(request.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

export function normalizeSermonTranscriptionResult(
  value: unknown,
): SermonTranscriptionResult | null {
  if (typeof value !== 'object' || value === null) return null

  const input = value as Record<string, unknown>
  const publicTranscript = normalizeTranscript(input.publicTranscript)
  const rawTranscript = normalizeTranscript(input.rawTranscript)
  if (!publicTranscript || !rawTranscript) return null

  return { publicTranscript, rawTranscript }
}

export function parseYouTubeVideoId(value: unknown): string | null {
  return typeof value === 'string' && YOUTUBE_ID_PATTERN.test(value) ? value : null
}

/**
 * The authenticated YouTube notification is the source of truth for automatic
 * records. Keeping the conversion here ensures the callback and worker use the
 * same CMS data contract.
 */
export function automaticSermonData(video: YouTubeVideo) {
  return {
    sermonDate: video.publishedAt,
    status: 'published' as const,
    thumbnail: video.thumbnail,
    title: video.title,
    youtubeId: video.id,
    youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
  }
}

export function needsAutomaticTranscription(sermon: SermonTranscriptionCandidate): boolean {
  return (
    sermon.status === 'published' &&
    Boolean(sermon.youtubeId && sermon.youtubeUrl) &&
    !(Boolean(sermon.publicTranscript?.trim()) && sermon.transcriptStatus !== 'unavailable')
  )
}

function normalizeTranscript(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const transcript = value.trim()
  return transcript && transcript.length <= 250_000 ? transcript : null
}
