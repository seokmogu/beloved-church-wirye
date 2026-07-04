const MEDIA_FILE_PATH_MARKER = '/api/media/file/'
const MAX_BASENAME_LENGTH = 80

/**
 * Rewrites an absolute media file URL to a relative path.
 *
 * Payload generates absolute URLs from `serverURL`, but the site is served on
 * multiple hosts (www/apex custom domain, *.vercel.app previews). Relative
 * paths keep Next.js image optimization on the local loader regardless of the
 * host, and let `generateMeta` prepend the canonical origin exactly once.
 */
export function toRelativeMediaURL<T extends string | null | undefined>(url: T): T {
  if (!url || url.startsWith('/')) return url

  const index = url.indexOf(MEDIA_FILE_PATH_MARKER)
  return (index >= 0 ? url.slice(index) : url) as T
}

/**
 * Normalizes an upload filename to URL-safe ASCII.
 *
 * Non-ASCII filenames (한글 등) survive storage but create encoding pitfalls:
 * macOS uploads NFD-decomposed unicode, and every consumer must encode the
 * name identically to hit the same object. Sanitizing at upload removes the
 * entire class of issues. The original name should be preserved separately
 * (e.g. in `alt`) for admin readability.
 */
export function sanitizeMediaFilename(original: string): string {
  const normalized = original.normalize('NFC')
  const extensionMatch = normalized.match(/\.([a-zA-Z0-9]+)$/)
  const extension = extensionMatch ? `.${extensionMatch[1].toLowerCase()}` : ''
  const rawBase = extensionMatch ? normalized.slice(0, -extensionMatch[0].length) : normalized

  const base = rawBase
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, MAX_BASENAME_LENGTH)

  // 전부 비-ASCII인 이름은 밀리초 타임스탬프만으로는 동시 업로드끼리 충돌하므로 난수를 붙인다
  const fallback = `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return `${base || fallback}${extension}`
}
