import { describe, expect, it } from 'vitest'

import { getChurchNewsImageSource } from '@/app/(frontend)/church-news/mediaImage'
import { normalizeInstagramPostInput } from '@/lib/instagram'
import { toRelativeInternalURL } from '@/utilities/internalUrl'
import { sanitizeMediaFilename, toRelativeMediaURL } from '@/utilities/mediaFiles'

describe('toRelativeInternalURL', () => {
  it('내부 정식/프리뷰 도메인 절대 URL을 상대경로로 바꾼다', () => {
    expect(toRelativeInternalURL('https://www.belovedchurch.co.kr/about/leaders')).toBe(
      '/about/leaders',
    )
    expect(toRelativeInternalURL('https://belovedchurch.co.kr/worship?a=1#top')).toBe(
      '/worship?a=1#top',
    )
    expect(toRelativeInternalURL('https://beloved-church-wirye.vercel.app/about/leaders')).toBe(
      '/about/leaders',
    )
    expect(
      toRelativeInternalURL('https://beloved-church-wirye-abc123-team.vercel.app/sermon'),
    ).toBe('/sermon')
  })

  it('외부 도메인·상대경로·빈 값은 그대로 둔다', () => {
    expect(toRelativeInternalURL('https://www.youtube.com/watch?v=abc')).toBe(
      'https://www.youtube.com/watch?v=abc',
    )
    expect(toRelativeInternalURL('/already/relative')).toBe('/already/relative')
    expect(toRelativeInternalURL(null)).toBeNull()
    expect(toRelativeInternalURL(undefined)).toBeUndefined()
    expect(toRelativeInternalURL('not a url')).toBe('not a url')
  })
})

describe('toRelativeMediaURL', () => {
  it('media 파일 절대 URL을 /api/media/file/ 상대경로로 자른다', () => {
    expect(
      toRelativeMediaURL('https://belovedchurch.co.kr/api/media/file/photo.webp'),
    ).toBe('/api/media/file/photo.webp')
    expect(toRelativeMediaURL('/api/media/file/photo.webp')).toBe('/api/media/file/photo.webp')
  })

  it('media 파일 경로가 아니면 그대로 둔다', () => {
    expect(toRelativeMediaURL('https://blob.example.com/x.png')).toBe(
      'https://blob.example.com/x.png',
    )
    expect(toRelativeMediaURL(null)).toBeNull()
  })
})

describe('sanitizeMediaFilename', () => {
  it('한글 파일명을 ASCII 안전 이름으로 바꾸되 확장자를 보존한다', () => {
    const result = sanitizeMediaFilename('프로필사진_이원목사님-7.webp')
    expect(result).toMatch(/^[A-Za-z0-9._-]+\.webp$/)
    expect(result).toBe('_-7.webp')
  })

  it('전부 한글이면 file-<난수> 폴백을 쓴다', () => {
    expect(sanitizeMediaFilename('사진.jpg')).toMatch(/^file-[a-z0-9]+-[a-z0-9]+\.jpg$/)
  })

  it('ASCII 이름은 공백/특수문자만 정리하고 유지한다', () => {
    expect(sanitizeMediaFilename('My Photo (1).JPG')).toBe('My-Photo-1.jpg')
    expect(sanitizeMediaFilename('already-safe_name.png')).toBe('already-safe_name.png')
  })

  it('NFD 분해 한글도 동일하게 처리한다', () => {
    const nfd = '주보.pdf'.normalize('NFD')
    expect(sanitizeMediaFilename(nfd)).toMatch(/^file-[a-z0-9]+-[a-z0-9]+\.pdf$/)
  })

  it('동시 호출이라도 파일명이 서로 달라진다 (난수 성분)', () => {
    const a = sanitizeMediaFilename('사진.jpg')
    const b = sanitizeMediaFilename('그림.jpg')
    expect(a).not.toBe(b)
  })
})

describe('normalizeInstagramPostInput', () => {
  it('게시물/릴스 URL에서 ID와 종류를 추출한다', () => {
    expect(normalizeInstagramPostInput('https://www.instagram.com/p/DYyW-I6EhYX/')).toEqual({
      isReel: false,
      postId: 'DYyW-I6EhYX',
    })
    expect(
      normalizeInstagramPostInput('https://www.instagram.com/reel/DRwm6aJEULF/?utm_source=x'),
    ).toEqual({ isReel: true, postId: 'DRwm6aJEULF' })
  })

  it('이미 ID면 그대로 통과시킨다', () => {
    expect(normalizeInstagramPostInput('DYyW-I6EhYX')).toEqual({
      isReel: null,
      postId: 'DYyW-I6EhYX',
    })
  })
})

describe('getChurchNewsImageSource', () => {
  it('Payload URL을 1차 src로, 정적 /media 경로를 폴백으로 쓴다', () => {
    const media = {
      filename: 'photo.webp',
      url: '/api/media/file/photo.webp',
    } as never
    expect(getChurchNewsImageSource(media, [])).toEqual({
      fallbackSrc: '/media/photo.webp',
      src: '/api/media/file/photo.webp',
    })
  })

  it('URL이 없으면 정적 경로만 쓴다', () => {
    const media = { filename: 'legacy.webp', url: null } as never
    expect(getChurchNewsImageSource(media, [])).toEqual({ src: '/media/legacy.webp' })
  })
})
