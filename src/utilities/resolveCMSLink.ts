type CMSLinkData = {
  internalPath?: string | null
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo?: string | null
    value?: { slug?: string | null } | string | number | null
  } | null
  type?: 'custom' | 'internal' | 'reference' | null
  url?: string | null
}

export function resolveCMSLink(link?: CMSLinkData | null): {
  href: string
  label: string
  newTab: boolean
} | null {
  if (!link) return null

  const label = link.label ?? ''
  const newTab = Boolean(link.newTab)

  if (link.type === 'internal') {
    const href = link.internalPath || link.url
    return href ? { href, label, newTab } : null
  }

  const referenceValue = link.reference?.value
  if (link.type === 'reference' && referenceValue && typeof referenceValue === 'object') {
    const slug = referenceValue.slug
    if (!slug) return null
    const prefix = link.reference?.relationTo === 'posts' ? '/posts' : ''
    return {
      href: slug === 'home' ? '/' : `${prefix}/${slug}`,
      label,
      newTab,
    }
  }

  if (link.url) return { href: link.url, label, newTab }

  return null
}
