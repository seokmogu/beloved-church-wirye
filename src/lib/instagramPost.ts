/**
 * Instagram 게시물 URL/ID 파싱 — 서버 액션과 관리 UI(클라이언트)가 함께 쓰는
 * 순수 모듈. Node/Payload 의존이 없어 클라이언트 번들에 안전하다.
 */

export function parseInstagramPostId(permalink?: string) {
  if (!permalink) return null

  try {
    const parsed = new URL(permalink)
    const match = parsed.pathname.match(/\/(?:p|reel|tv)\/([^/]+)/)
    return match?.[1] ?? null
  } catch {
    const match = permalink.match(/\/(?:p|reel|tv)\/([^/?#]+)/)
    return match?.[1] ?? null
  }
}

/**
 * 게시물 URL을 그대로 붙여넣어도 ID와 종류(reel/p)를 인식한다.
 * URL이 아니면(이미 ID면) 그대로 돌려준다.
 */
export function normalizeInstagramPostInput(value: string): {
  isReel: boolean | null
  postId: string
} {
  const trimmed = value.trim()
  if (!trimmed.includes('/')) {
    return { isReel: null, postId: trimmed }
  }

  const extracted = parseInstagramPostId(trimmed)
  const isReel = /\/reel\//.test(trimmed) ? true : /\/(?:p|tv)\//.test(trimmed) ? false : null
  return { isReel, postId: extracted ?? trimmed }
}
