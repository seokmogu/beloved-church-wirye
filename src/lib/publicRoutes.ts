const disabledPublicPaths = new Set(['/newcomer', '/newcomer/thank-you'])

export function isPublicRouteEnabled(href?: string | null): boolean {
  if (!href) return false

  const pathname = href.split(/[?#]/, 1)[0]
  return !disabledPublicPaths.has(pathname)
}
