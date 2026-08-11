import { describe, expect, it, vi } from 'vitest'

import { resetStaleImageTranscription } from '@/hooks/resetStaleImageTranscription'
import {
  createImageTranscriptionSource,
  imageSourcesChanged,
  normalizeImageTranscriptionResult,
} from '@/lib/imageTranscription'

describe('image transcription source', () => {
  const document = {
    id: 14,
    images: [
      {
        image: {
          filename: 'first.webp',
          id: 101,
          updatedAt: '2026-08-10T00:00:00.000Z',
          url: '/api/media/file/first.webp',
        },
      },
      {
        image: {
          filename: 'second.webp',
          id: 102,
          updatedAt: '2026-08-10T00:00:00.000Z',
          url: '/api/media/file/second.webp',
        },
      },
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

  it('detects changes to the same media record that require a new transcription', () => {
    expect(
      imageSourcesChanged(document, {
        ...document,
        images: [
          { image: { ...document.images[0].image, filename: 'renamed.webp' } },
          document.images[1],
        ],
      }),
    ).toBe(true)
    expect(
      imageSourcesChanged(document, {
        ...document,
        images: [
          { image: { ...document.images[0].image, updatedAt: '2026-08-11T00:00:00.000Z' } },
          document.images[1],
        ],
      }),
    ).toBe(true)
  })

  it('clears stale text when the final image is removed without scheduling a worker', async () => {
    const update = vi.fn().mockResolvedValue({})

    await resetStaleImageTranscription('church-news')({
      context: {},
      doc: {
        accessibleContent: {
          content: '오래된 전사',
          seoDescription: '오래된 설명',
          seoTitle: '오래된 제목',
          sourceHash: 'previous',
          summary: '오래된 요약',
        },
        id: document.id,
        images: [],
      },
      operation: 'update',
      previousDoc: document,
      req: { payload: { update } },
    } as any)

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'church-news',
        data: {
          accessibleContent: expect.objectContaining({
            content: null,
            processedAt: null,
            seoDescription: null,
            seoTitle: null,
            sourceHash: null,
            summary: null,
          }),
        },
        id: document.id,
      }),
    )
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
