import { HeaderClient } from './Component.client'
import { ensureOfferingMenuLink } from '@/lib/offeringPublic'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header, OfferingPage, SiteSetting } from '@/payload-types'

export async function Header() {
  let headerData: Header = { id: 0, navItems: [] }
  let offeringPage: OfferingPage | null = null
  let siteSettings: SiteSetting | null = null

  try {
    ;[headerData, siteSettings, offeringPage] = await Promise.all([
      getCachedGlobal('header', 1)() as Promise<Header>,
      getCachedGlobal('site-settings', 1)() as Promise<SiteSetting>,
      getCachedGlobal('offering-page', 0)() as Promise<OfferingPage>,
    ])
  } catch (error) {
    console.error('Failed to fetch header globals:', error)
  }

  if (offeringPage) headerData = ensureOfferingMenuLink(headerData, offeringPage)

  return <HeaderClient data={headerData} siteSettings={siteSettings} />
}
