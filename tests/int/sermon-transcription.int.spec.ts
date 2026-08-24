import { describe, expect, it } from 'vitest'

import {
  automaticSermonData,
  needsAutomaticTranscription,
  normalizeSermonTranscriptionResult,
  parseYouTubeVideoId,
} from '@/lib/sermonTranscription'

describe('sermon transcription input', () => {
  it('accepts a validated raw and public transcript pair for automatic publication', () => {
    expect(
      normalizeSermonTranscriptionResult({
        publicTranscript: '공개 전사본',
        rawTranscript: '원문 전사본',
      }),
    ).toEqual({ publicTranscript: '공개 전사본', rawTranscript: '원문 전사본' })
  })

  it('rejects incomplete or oversized worker callbacks', () => {
    expect(normalizeSermonTranscriptionResult({ publicTranscript: '있음' })).toBeNull()
    expect(
      normalizeSermonTranscriptionResult({
        publicTranscript: '공개',
        rawTranscript: 'x'.repeat(250_001),
      }),
    ).toBeNull()
  })

  it('accepts only canonical YouTube video IDs', () => {
    expect(parseYouTubeVideoId('N8N-UlS7DfQ')).toBe('N8N-UlS7DfQ')
    expect(parseYouTubeVideoId('not-a-video-id')).toBeNull()
  })

  it('creates a published CMS record from a confirmed channel video', () => {
    expect(
      automaticSermonData({
        id: 'N8N-UlS7DfQ',
        publishedAt: '2026-08-16T03:00:00.000Z',
        thumbnail: 'https://img.youtube.com/vi/N8N-UlS7DfQ/hqdefault.jpg',
        title: 'Beloved Church 26.08.16. 주일예배',
      }),
    ).toEqual({
      sermonDate: '2026-08-16T03:00:00.000Z',
      status: 'published',
      thumbnail: 'https://img.youtube.com/vi/N8N-UlS7DfQ/hqdefault.jpg',
      title: 'Beloved Church 26.08.16. 주일예배',
      youtubeId: 'N8N-UlS7DfQ',
      youtubeUrl: 'https://www.youtube.com/watch?v=N8N-UlS7DfQ',
    })
  })

  it('queues a published record only while its transcript is missing', () => {
    expect(
      needsAutomaticTranscription({
        status: 'published',
        transcriptStatus: 'unavailable',
        youtubeId: 'N8N-UlS7DfQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=N8N-UlS7DfQ',
      }),
    ).toBe(true)
    expect(
      needsAutomaticTranscription({
        publicTranscript: '이미 전사됨',
        status: 'published',
        transcriptStatus: 'automatic',
        youtubeId: 'N8N-UlS7DfQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=N8N-UlS7DfQ',
      }),
    ).toBe(false)
  })
})
