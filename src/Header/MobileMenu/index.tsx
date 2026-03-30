'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'
import type { Header as HeaderType } from '@/payload-types'

interface MobileMenuProps {
  data: HeaderType
  open: boolean
  onClose: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ data, open, onClose }) => {
  const navItems = data?.navItems || []
  const [openSubs, setOpenSubs] = useState<Record<number, boolean>>({})

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  const toggleSub = (i: number) => setOpenSubs((p) => ({ ...p, [i]: !p[i] }))

  return (
    <div
      className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 pointer-events-none invisible'}`}
      aria-hidden={!open}
      onKeyDown={handleKeyDown}
    >
      <nav className="flex flex-col border-t border-white/20 pb-4 bg-[#1B3A2D]">
        {navItems.map((item, i) => {
          const link = item.link as { url?: string; label?: string }
          const hasChildren = item.subItems && item.subItems.length > 0

          return (
            <div key={i}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <Link
                  href={link.url || '/'}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  onClick={hasChildren ? undefined : onClose}
                >
                  {link.label}
                </Link>
                {hasChildren && (
                  <button
                    onClick={() => toggleSub(i)}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                  >
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${openSubs[i] ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>
              {hasChildren && openSubs[i] && (
                <div className="bg-[#152e22]">
                  {item.subItems!.map((sub, j) => {
                    const subLink = sub.link as { url?: string; label?: string }
                    return (
                      <Link
                        key={j}
                        href={subLink.url || '/'}
                        className="block pl-8 pr-4 py-2.5 text-sm text-white/70 hover:text-white border-b border-white/5 transition-colors"
                        onClick={onClose}
                      >
                        {subLink.label}
                      </Link>
                    )
                  })}
                </div>
              )}
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
