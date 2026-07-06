const INTERNAL_HOST_PATTERN =
  /^(?:www\.)?belovedchurch\.co\.kr$|^beloved-church-wirye[a-z0-9-]*\.vercel\.app$/i

/**
 * 자체 도메인(정식/프리뷰)을 가리키는 절대 URL을 상대경로로 정규화한다.
 *
 * CMS에 프리뷰 도메인 절대 URL이 저장되면 방문자가 클릭 시 정식 도메인을
 * 조용히 이탈하게 되므로, 내부 링크는 항상 상대경로로 유지한다.
 * 외부 도메인 URL은 그대로 반환한다.
 */
export function toRelativeInternalURL<T extends string | null | undefined>(url: T): T {
  if (!url || url.startsWith('/')) return url

  try {
    const parsed = new URL(url)
    if (INTERNAL_HOST_PATTERN.test(parsed.hostname)) {
      return (`${parsed.pathname}${parsed.search}${parsed.hash}` || '/') as T
    }
  } catch {
    // 절대 URL이 아니면 그대로 둔다
  }

  return url
}
