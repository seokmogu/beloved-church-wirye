import { describe, expect, it } from 'vitest'

import { normalizeSermonTranscriptionResult, parseYouTubeVideoId } from '@/lib/sermonTranscription'

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
})
