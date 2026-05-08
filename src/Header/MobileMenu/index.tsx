'use client'

import React from 'react'
import Link from 'next/link'
import type { Header as HeaderType } from '@/payload-types'
import { resolveCMSLink } from '@/utilities/resolveCMSLink'

interface MobileMenuProps {
  data: HeaderType
  open: boolean
  onClose: () => void
}

type NavItem = {
  href: string
  label: string
  newTab?: boolean
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ data, open, onClose }) => {
  const navItems = (data?.navItems || [])
    .map((item) => resolveCMSLink(item.link))
    .filter(Boolean) as NavItem[]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 pointer-events-none invisible'}`}
      aria-hidden={!open}
      onKeyDown={handleKeyDown}
    >
      <nav className="flex flex-col border-t border-white/12 bg-primary pb-4">
        {navItems.map((item, i) => {
          const newTabProps = item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

          return (
            <div key={i} className="border-b border-white/10 px-4 py-3" onClick={onClose}>
              <Link
                href={item.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                {...newTabProps}
              >
                {item.label}
              </Link>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
