import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header, SiteSetting } from '@/payload-types'

export async function Header() {
  let headerData: Header = { id: 0, navItems: [] }
  let siteSettings: SiteSetting | null = null

  try {
    ;[headerData, siteSettings] = await Promise.all([
      getCachedGlobal('header', 1)() as Promise<Header>,
      getCachedGlobal('site-settings', 1)() as Promise<SiteSetting>,
    ])
  } catch (error) {
    console.error('Failed to fetch header globals:', error)
  }

  return <HeaderClient data={headerData} siteSettings={siteSettings} />
}
