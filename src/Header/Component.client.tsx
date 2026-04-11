'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { MobileMenu } from './MobileMenu'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeaderTheme(null)
    setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    setTheme(headerTheme ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    if (!mobileOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen])

  return (
    <header className="relative z-20 shadow-sm" style={{ backgroundColor: '#1B3A2D', color: '#ffffff' }}>
      <div ref={menuRef} className="container">
        <div className="py-3 flex justify-between items-center">
          <Link href="/">
            <Logo loading="eager" priority="high" />
          </Link>
          <HeaderNav data={data} />
          {/* Hamburger button - mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none"
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </button>
        </div>
        <MobileMenu data={data} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
    </header>
  )
}
