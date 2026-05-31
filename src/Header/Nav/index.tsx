'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Header as HeaderType } from '@/payload-types'
import { normalizeHeaderNavItems } from '@/Header/normalizeNavItems'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = normalizeHeaderNavItems(data)

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map((item, i) => {
        const hasChildren = item.children.length > 0
        const newTabProps = item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

        return (
          <div className="group relative flex items-center" key={`${item.href}-${i}`}>
            <Link
              href={item.href}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/78 transition-colors hover:bg-white/10 hover:text-white"
              aria-haspopup={hasChildren ? 'menu' : undefined}
              {...newTabProps}
            >
              <span>{item.label}</span>
              {hasChildren ? (
                <ChevronDown
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                  strokeWidth={2.25}
                />
              ) : null}
            </Link>
            {hasChildren ? (
              <div className="invisible absolute right-0 top-full z-50 min-w-48 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div
                  className="overflow-hidden rounded-md border border-white/12 bg-[#173427] py-2 shadow-xl shadow-black/20"
                  role="menu"
                >
                  {item.children.map((child, childIndex) => {
                    const childNewTabProps = child.newTab
                      ? { rel: 'noopener noreferrer', target: '_blank' }
                      : {}

                    return (
                      <Link
                        key={`${child.href}-${childIndex}`}
                        href={child.href}
                        className="block whitespace-nowrap px-4 py-2.5 text-sm font-medium text-white/76 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none"
                        role="menuitem"
                        {...childNewTabProps}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
