'use client'

import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'

interface SpecialBannerProps {
  banner: NonNullable<SiteSetting['specialBanner']>
}

const bgColorMap: Record<string, string> = {
  primary: 'bg-[#1B3A2D]',
  gold: 'bg-[#C9A84C]',
  dark: 'bg-[#0F2419]',
}

export default function SpecialBanner({ banner }: SpecialBannerProps) {
  if (!banner?.enabled || !banner?.title) {
    return null
  }

  const bgColor = bgColorMap[banner.backgroundColor || 'primary'] || bgColorMap.primary
  const content = (
    <div className={`${bgColor} text-white py-3 px-4 text-center`}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="font-bold text-base sm:text-lg">{banner.title}</span>
        {banner.message && (
          <span className="text-sm sm:text-base text-gray-200">{banner.message}</span>
        )}
      </div>
    </div>
  )

  if (banner.link) {
    const isExternal = banner.link.startsWith('http')
    if (isExternal) {
      return (
        <a
          href={banner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          {content}
        </a>
      )
    }
    return (
      <Link href={banner.link} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
