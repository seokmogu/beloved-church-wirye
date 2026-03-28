'use client'

import React from 'react'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

interface MobileMenuProps {
  data: HeaderType
  open: boolean
  onClose: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ data, open, onClose }) => {
  const navItems = data?.navItems || []

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 pointer-events-none invisible'}`}
      aria-hidden={!open}
      onKeyDown={handleKeyDown}
    >
      <nav
        className="flex flex-col gap-0 border-t border-[#1B3A2D]/20 pb-4"
        style={{ backgroundColor: 'transparent' }}
      >
        {navItems.map(({ link }, i) => (
          <div key={i} className="px-2 py-3 border-b border-[#1B3A2D]/10" onClick={onClose}>
            <CMSLink {...link} appearance="link" />
          </div>
        ))}
        <div className="px-2 py-3 border-b border-[#1B3A2D]/10">
          <Link
            href="/bulletins"
            className="text-sm font-medium text-foreground/80 hover:text-[#C9A84C] transition-colors"
            onClick={onClose}
          >
            주보
          </Link>
        </div>
        <div className="px-2 py-3">
          <Link
            href="/search"
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-[#C9A84C] transition-colors"
            onClick={onClose}
          >
            <SearchIcon className="w-4 h-4 text-primary" />
            검색
          </Link>
        </div>
      </nav>
    </div>
  )
}
