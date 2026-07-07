import { describe, expect, it } from 'vitest'

import { fetchLatestVideos, relativeTimeToISO } from '@/lib/youtube'

describe('relativeTimeToISO', () => {
  const now = Date.parse('2026-07-07T00:00:00.000Z')

  it('한국어 상대 시간을 근사 날짜로 바꾼다', () => {
    expect(relativeTimeToISO('8일 전', now)).toBe('2026-06-29T00:00:00.000Z')
    expect(relativeTimeToISO('3주 전', now)).toBe('2026-06-16T00:00:00.000Z')
    expect(relativeTimeToISO('2개월 전', now)).toBe('2026-05-08T00:00:00.000Z')
  })

  it('영어 상대 시간도 처리한다', () => {
    expect(relativeTimeToISO('2 weeks ago', now)).toBe('2026-06-23T00:00:00.000Z')
  })

  it('해석 불가 문자열은 빈 값을 돌려준다', () => {
    expect(relativeTimeToISO('조회수 131회', now)).toBe('')
    expect(relativeTimeToISO('', now)).toBe('')
  })
})

describe('fetchLatestVideos (실네트워크, RSS 장애 시 폴백 검증)', () => {
  it('교회 채널 영상 목록을 어떤 경로로든 가져온다', async () => {
    const videos = await fetchLatestVideos(4, 'UCEyfzJVbYFdI9An9e0FTojw', null, {
      cache: 'no-store',
    })
    expect(videos.length).toBeGreaterThan(0)
    expect(videos[0].id).toMatch(/^[A-Za-z0-9_-]{11}$/)
    expect(videos[0].title.length).toBeGreaterThan(0)
  }, 30_000)
})
