import { describe, expect, it } from 'vitest'

import {
  fetchLatestVideos,
  mergeYouTubeVideos,
  relativeTimeToISO,
  type YouTubeVideo,
} from '@/lib/youtube'

describe('mergeYouTubeVideos', () => {
  const video = (overrides: Partial<YouTubeVideo> & Pick<YouTubeVideo, 'id'>): YouTubeVideo => ({
    id: overrides.id,
    publishedAt: overrides.publishedAt ?? '2026-01-01T00:00:00.000Z',
    thumbnail: overrides.thumbnail ?? `https://img.youtube.com/vi/${overrides.id}/hqdefault.jpg`,
    title: overrides.title ?? overrides.id,
  })

  it('관리자 영상과 자동 영상을 중복 제거하고 최신순으로 합친다', () => {
    const cmsVideos = [
      video({ id: 'same-video1', publishedAt: '2026-07-10T00:00:00.000Z', title: '관리자 제목' }),
      video({ id: 'cms-video01', publishedAt: '2026-07-12T00:00:00.000Z' }),
    ]
    const youtubeVideos = [
      video({ id: 'auto-video1', publishedAt: '2026-07-19T00:00:00.000Z' }),
      video({ id: 'same-video1', publishedAt: '2026-07-20T00:00:00.000Z', title: '자동 제목' }),
    ]

    const merged = mergeYouTubeVideos(cmsVideos, youtubeVideos)

    expect(merged.map((item) => item.id)).toEqual(['auto-video1', 'cms-video01', 'same-video1'])
    expect(merged.find((item) => item.id === 'same-video1')?.title).toBe('관리자 제목')
  })

  it('날짜를 해석할 수 없는 영상은 목록 뒤로 보낸다', () => {
    const merged = mergeYouTubeVideos([
      video({ id: 'unknown0001', publishedAt: '' }),
      video({ id: 'dated-video', publishedAt: '2026-07-01T00:00:00.000Z' }),
    ])

    expect(merged.map((item) => item.id)).toEqual(['dated-video', 'unknown0001'])
  })
})

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
