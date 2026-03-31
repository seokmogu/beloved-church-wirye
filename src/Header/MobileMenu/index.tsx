'use client'

import React from 'react'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import type { Header as HeaderType } from '@/payload-types'

interface MobileMenuProps {
  data: HeaderType
  open: boolean
  onClose: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ data, open, onClose }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navItems: any[] = data?.navItems || []

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 pointer-events-none invisible'}`}
      aria-hidden={!open}
      onKeyDown={handleKeyDown}
    >
      <nav className="flex flex-col border-t border-white/20 pb-4 bg-[#1B3A2D]">
        {navItems.map((item, i) => {
          const link = item.link as { url?: string; label?: string }
          return (
            <div key={i} className="px-4 py-3 border-b border-white/10" onClick={onClose}>
              <Link
                href={link.url || '/'}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            </div>
          )
        })}
        <div className="px-4 py-3 border-b border-white/10">
          <Link
            href="/bulletins"
            className="text-sm font-medium text-white/80 hover:text-[#C9A84C] transition-colors"
            onClick={onClose}
          >
            주보
          </Link>
        </div>
        <div className="px-4 py-3">
          <Link
            href="/search"
            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-[#C9A84C] transition-colors"
            onClick={onClose}
          >
            <SearchIcon className="w-4 h-4 text-white/60" />
            검색
          </Link>
        </div>
      </nav>
    </div>
  )
}
