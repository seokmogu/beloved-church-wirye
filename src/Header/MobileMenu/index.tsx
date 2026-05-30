'use client'

import React from 'react'
import Link from 'next/link'
import type { Header as HeaderType } from '@/payload-types'
import { normalizeHeaderNavItems } from '@/Header/normalizeNavItems'

interface MobileMenuProps {
  data: HeaderType
  open: boolean
  onClose: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ data, open, onClose }) => {
  const navItems = normalizeHeaderNavItems(data)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className={`md:hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[80vh] overflow-y-auto opacity-100 visible' : 'max-h-0 overflow-hidden opacity-0 pointer-events-none invisible'}`}
      aria-hidden={!open}
      onKeyDown={handleKeyDown}
    >
      <nav className="flex flex-col border-t border-white/12 bg-primary pb-4">
        {navItems.map((item, i) => {
          const newTabProps = item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

          return (
            <div key={`${item.href}-${i}`} className="border-b border-white/10 px-4 py-3">
              <Link
                href={item.href}
                className="block text-sm font-medium text-white/82 transition-colors hover:text-white"
                onClick={onClose}
                {...newTabProps}
              >
                {item.label}
              </Link>
              {item.children.length ? (
                <div className="mt-3 grid gap-1 border-l border-white/14 pl-3">
                  {item.children.map((child, childIndex) => {
                    const childNewTabProps = child.newTab
                      ? { rel: 'noopener noreferrer', target: '_blank' }
                      : {}

                    return (
                      <Link
                        key={`${child.href}-${childIndex}`}
                        href={child.href}
                        className="block rounded-sm px-2 py-2 text-sm font-medium text-white/68 transition-colors hover:bg-white/8 hover:text-white"
                        onClick={onClose}
                        {...childNewTabProps}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
