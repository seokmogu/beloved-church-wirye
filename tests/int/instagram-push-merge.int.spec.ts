import { describe, expect, it } from 'vitest'

import { mergePushedInstagramPosts, type PushedInstagramPost } from '@/lib/instagram'

const push = (postId: string, publishedAt: string, type: 'p' | 'reel' = 'p'): PushedInstagramPost => ({
  postId,
  publishedAt,
  type,
})

describe('mergePushedInstagramPosts', () => {
  it('새 게시물은 맨 앞에, 기존 게시물은 관리자 순서 그대로 유지한다', () => {
    const existing = [{ postId: 'B' }, { postId: 'A' }, { postId: 'C' }] // 관리자가 B를 앞으로 올린 상태
    const pushed = [
      push('NEW', '2026-07-07'),
      push('A', '2026-07-01'),
      push('B', '2026-06-20'),
      push('C', '2026-06-10'),
    ]

    expect(mergePushedInstagramPosts(existing, pushed).map((post) => post.postId)).toEqual([
      'NEW',
      'B',
      'A',
      'C',
    ])
  })

  it('인스타에서 사라진 게시물은 목록에서 제거한다', () => {
    const existing = [{ postId: 'GONE' }, { postId: 'A' }]
    const pushed = [push('A', '2026-07-01')]

    expect(mergePushedInstagramPosts(existing, pushed).map((post) => post.postId)).toEqual(['A'])
  })

  it('기존 목록이 비어 있으면 최신순으로 채운다', () => {
    const pushed = [push('OLD', '2026-06-01'), push('NEW', '2026-07-01')]

    expect(mergePushedInstagramPosts([], pushed).map((post) => post.postId)).toEqual([
      'NEW',
      'OLD',
    ])
  })

  it('12개를 넘지 않는다', () => {
    const pushed = Array.from({ length: 15 }, (_, index) =>
      push(`P${index}`, `2026-06-${String(index + 1).padStart(2, '0')}`),
    )

    expect(mergePushedInstagramPosts([], pushed)).toHaveLength(12)
  })

  it('type 변경(게시물→릴스 재분류)은 push 값을 따른다', () => {
    const existing = [{ postId: 'A' }]
    const pushed = [push('A', '2026-07-01', 'reel')]

    expect(mergePushedInstagramPosts(existing, pushed)[0].type).toBe('reel')
  })
})
