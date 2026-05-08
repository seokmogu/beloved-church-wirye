'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Header, SiteSetting } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { MobileMenu } from './MobileMenu'

interface HeaderClientProps {
  data: Header
  siteSettings?: SiteSetting | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, siteSettings }) => {
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

  const logo = siteSettings?.logo
  const logoUrl = typeof logo === 'object' && logo?.url ? logo.url : undefined
  const logoAlt = siteSettings?.churchName ?? '사랑하는교회'
  const logoHeight =
    typeof siteSettings?.headerLogoHeight === 'number'
      ? Math.max(24, Math.min(96, siteSettings.headerLogoHeight))
      : 40
  const logoInverted = siteSettings?.headerLogoInvert ?? true

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 shadow-sm"
      style={{ backgroundColor: 'var(--church-header-bg)', color: '#ffffff' }}
    >
      <div ref={menuRef} className="container">
        <div className="flex items-center justify-between py-4">
          <Link href="/">
            <Logo
              alt={logoAlt}
              height={logoHeight}
              inverted={logoInverted}
              loading="eager"
              priority="high"
              src={logoUrl}
            />
          </Link>
          <HeaderNav data={data} />
          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-white/12 bg-white/5 md:hidden"
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
