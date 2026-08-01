import type { Payload } from 'payload'

import { normalizeInstagramPostInput } from './instagramPost'

export { normalizeInstagramPostInput } from './instagramPost'

export type InstagramPushResult = {
  count: number
  posts: Array<{
    postId: string
    publishedAt?: string | null
    type: 'p' | 'reel'
  }>
}

export type PushedInstagramPost = {
  postId: string
  publishedAt?: string | null
  type: 'p' | 'reel'
}

const MAX_PUSHED_POSTS = 12

/**
 * push된 전체 게시물 집합과 기존 목록을 병합한다.
 * 배열 순서 = 홈 노출 순서(관리자가 드래그로 지정)이므로 전체 교체 대신:
 * 새 게시물은 최신순으로 맨 앞에, 기존 게시물은 관리자 순서 그대로,
 * 인스타에서 사라진 게시물만 제거한다.
 */
export function mergePushedInstagramPosts(
  existing: Array<{ postId?: string | null }>,
  pushed: PushedInstagramPost[],
): Array<{ postId: string; publishedAt: string | null; type: 'p' | 'reel' }> {
  const pushedById = new Map(pushed.map((post) => [post.postId, post]))
  const existingIds = new Set(
    existing.map((post) => post.postId).filter((id): id is string => Boolean(id)),
  )

  const freshIds = pushed
    .filter((post) => !existingIds.has(post.postId))
    .sort((a, b) => Date.parse(b.publishedAt ?? '') - Date.parse(a.publishedAt ?? ''))
    .map((post) => post.postId)

  const keptIds = existing
    .map((post) => post.postId)
    .filter((id): id is string => Boolean(id && pushedById.has(id)))

  const seen = new Set<string>()
  const ordered: Array<{ postId: string; publishedAt: string | null; type: 'p' | 'reel' }> = []
  for (const id of [...freshIds, ...keptIds]) {
    if (seen.has(id)) continue
    seen.add(id)
    const source = pushedById.get(id)
    if (!source) continue
    ordered.push({
      postId: id,
      publishedAt: source.publishedAt ?? null,
      type: source.type,
    })
  }

  return ordered.slice(0, MAX_PUSHED_POSTS)
}

/**
 * Merge the Instagram post list from an external watcher (no Meta API involved — the
 * watcher discovers shortcodes itself and pushes just {postId, type, publishedAt}).
 * Keeps an empty collection request from erasing the existing embedded URL list.
 */
export async function applyPushedInstagramPosts(
  payload: Payload,
  posts: PushedInstagramPost[],
): Promise<InstagramPushResult> {
  if (posts.length === 0) {
    payload.logger.warn('Instagram push 요청에 게시물이 없어 기존 목록을 유지합니다.')
    return { count: 0, posts: [] }
  }

  const settings = (await payload.findGlobal({ depth: 0, slug: 'site-settings' })) as {
    instagramPosts?: Array<{ postId?: string | null }> | null
  }
  const instagramPosts = mergePushedInstagramPosts(settings.instagramPosts ?? [], posts)

  await payload.updateGlobal({
    data: {
      instagramPosts,
    } as any,
    slug: 'site-settings',
  })

  return {
    count: instagramPosts.length,
    posts: instagramPosts,
  }
}
