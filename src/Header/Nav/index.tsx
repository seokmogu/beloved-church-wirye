'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="hidden md:flex gap-1 items-center">
      {navItems.map(({ link }, i) => {
        return (
          <Link
            key={i}
            href={(link as { url?: string }).url || '/'}
            className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
          >
            {(link as { label?: string }).label}
          </Link>
        )
      })}
      <Link href="/bulletins" className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors">
        주보
      </Link>
      <Link href="/search" className="text-white/80 hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-4 h-4" />
      </Link>
    </nav>
  )
}
