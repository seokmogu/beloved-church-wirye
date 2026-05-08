'use client'

import React from 'react'
import Link from 'next/link'
import type { Header as HeaderType } from '@/payload-types'
import { resolveCMSLink } from '@/utilities/resolveCMSLink'

type NavItem = {
  href: string
  label: string
  newTab?: boolean
}

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = (data?.navItems || [])
    .map((item) => resolveCMSLink(item.link))
    .filter(Boolean) as NavItem[]

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map((item, i) => {
        const newTabProps = item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

        return (
          <Link
            key={i}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-white/78 transition-colors hover:bg-white/10 hover:text-white"
            {...newTabProps}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
