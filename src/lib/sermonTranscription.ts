import { timingSafeEqual } from 'node:crypto'

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export type SermonTranscriptionResult = {
  publicTranscript: string
  rawTranscript: string
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

function normalizeTranscript(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const transcript = value.trim()
  return transcript && transcript.length <= 250_000 ? transcript : null
}
