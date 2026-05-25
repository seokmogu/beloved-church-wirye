import type { Header } from '@/payload-types'

type OfferingPublicContent = {
  bankAccounts?: unknown[] | null
  bibleReference?: string | null
  bibleVerse?: string | null
  introText?: string | null
  notes?: string | null
  offeringTypes?: unknown[] | null
}

type HeaderMenuItem = NonNullable<Header['navItems']>[number]

const offeringPath = '/offering'

export function createOfferingMenuItem(): HeaderMenuItem {
  return {
    link: {
      internalPath: offeringPath,
      label: '헌금 안내',
      newTab: false,
      type: 'internal',
    },
  }
}

export function ensureOfferingMenuLink(header: Header, offering: OfferingPublicContent): Header {
  if (!hasOfferingPublicContent(offering) || hasOfferingMenuLink(header.navItems)) return header

  return {
    ...header,
    navItems: [...(header.navItems ?? []), createOfferingMenuItem()],
  }
}

export function hasOfferingMenuLink(navItems?: Header['navItems'] | null): boolean {
  return (navItems ?? []).some((item) => {
    const link = item?.link
    return link?.internalPath === offeringPath || link?.url === offeringPath
  })
}

export function hasOfferingPublicContent(content: OfferingPublicContent): boolean {
  const textValues = [content.introText, content.notes, content.bibleVerse, content.bibleReference]

  return (
    textValues.some((value) => typeof value === 'string' && value.trim().length > 0) ||
    hasRows(content.bankAccounts) ||
    hasRows(content.offeringTypes)
  )
}

function hasRows(rows?: unknown[] | null): boolean {
  return Array.isArray(rows) && rows.length > 0
}
