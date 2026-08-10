import { describe, expect, it } from 'vitest'

import {
  createImageTranscriptionSource,
  imageSourcesChanged,
  normalizeImageTranscriptionResult,
} from '@/lib/imageTranscription'

describe('image transcription source', () => {
  const document = {
    id: 14,
    images: [
      { image: { filename: 'first.webp', id: 101, updatedAt: '2026-08-10T00:00:00.000Z', url: '/api/media/file/first.webp' } },
      { image: { filename: 'second.webp', id: 102, updatedAt: '2026-08-10T00:00:00.000Z', url: '/api/media/file/second.webp' } },
    ],
    title: '8월 둘째주 교회소식',
  }

  it('preserves the uploaded image order in the worker payload', () => {
    const source = createImageTranscriptionSource('church-news', document)

    expect(source?.images.map((image) => image.filename)).toEqual(['first.webp', 'second.webp'])
    expect(source?.sourceHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('detects an image replacement but ignores unrelated document edits', () => {
    expect(imageSourcesChanged(document, { ...document, title: '수정된 제목' })).toBe(false)
    expect(
      imageSourcesChanged(document, {
        ...document,
        images: [{ image: { id: 999 } }],
      }),
    ).toBe(true)
  })
})

describe('image transcription result', () => {
  it('accepts flexible source-preserving markdown without requiring an advertisement template', () => {
    expect(
      normalizeImageTranscriptionResult({
        content: '## 여름수련회\n- 준비물: 성경책',
        seoDescription: '여름수련회 안내',
        seoTitle: '여름수련회',
        summary: '여름수련회 준비물 안내',
      }),
    ).toEqual({
      content: '## 여름수련회\n- 준비물: 성경책',
      seoDescription: '여름수련회 안내',
      seoTitle: '여름수련회',
      summary: '여름수련회 준비물 안내',
    })
  })
})
