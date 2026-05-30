import type { Header as HeaderType } from '@/payload-types'
import { resolveCMSLink } from '@/utilities/resolveCMSLink'

type ResolvedNavLink = NonNullable<ReturnType<typeof resolveCMSLink>>

export type HeaderNavItem = ResolvedNavLink & {
  children: ResolvedNavLink[]
}

function isResolvedNavLink(item: ResolvedNavLink | null): item is ResolvedNavLink {
  return Boolean(item)
}

function isHeaderNavItem(item: HeaderNavItem | null): item is HeaderNavItem {
  return Boolean(item)
}

export function normalizeHeaderNavItems(data?: HeaderType | null): HeaderNavItem[] {
  return (data?.navItems || [])
    .map((item) => {
      const link = resolveCMSLink(item.link)
      if (!link) return null

      const children = (item.children || [])
        .map((child) => resolveCMSLink(child.link))
        .filter(isResolvedNavLink)

      return { ...link, children }
    })
    .filter(isHeaderNavItem)
}
