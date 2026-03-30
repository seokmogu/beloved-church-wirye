'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'
import type { Header as HeaderType } from '@/payload-types'

type NavItem = NonNullable<HeaderType['navItems']>[number]
type SubItem = NonNullable<NavItem['subItems']>[number]

function DropdownMenu({ items }: { items: SubItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
      {items.map((sub: SubItem, i: number) => {
        const subLink = sub.link as { url?: string; label?: string }
        return (
          <Link
            key={i}
            href={subLink.url || '/'}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#1B3A2D]/5 hover:text-[#1B3A2D] transition-colors"
          >
            {subLink.label}
          </Link>
        )
      })}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NavItemComponent({ item }: { item: any }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const link = item.link as { url?: string; label?: string }
  const hasChildren = item.subItems && item.subItems.length > 0

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!hasChildren) {
    return (
      <Link
        href={link.url || '/'}
        className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
      >
        {link.label}
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
      >
        {link.label}
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <DropdownMenu items={item.subItems} />}
    </div>
  )
}

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navItems: any[] = data?.navItems || []

  return (
    <nav className="hidden md:flex gap-1 items-center">
      {navItems.map((item, i) => (
        <NavItemComponent key={i} item={item} />
      ))}
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
