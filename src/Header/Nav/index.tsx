'use client'

import React from 'react'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import type { Header as HeaderType } from '@/payload-types'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navItems: any[] = data?.navItems || []

  return (
    <nav className="hidden md:flex gap-1 items-center">
      {navItems.map((item, i) => {
        const link = item.link as { url?: string; label?: string }
        return (
          <Link
            key={i}
            href={link.url || '/'}
            className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
          >
            {link.label}
          </Link>
        )
      })}
      <Link
        href="/bulletins"
        className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
      >
        주보
      </Link>
      <Link
        href="/search"
        className="text-white/80 hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors"
      >
        <span className="sr-only">Search</span>
        <SearchIcon className="w-4 h-4" />
      </Link>
    </nav>
  )
}
