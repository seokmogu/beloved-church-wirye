import React from 'react'
import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'

export const PageBannerHero: React.FC<Page['hero']> = ({ richText }) => {
  return (
    <div className="bg-primary py-16">
      <div className="container text-center">
        {richText && (
          <RichText
            data={richText}
            enableGutter={false}
            className="[&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:text-white [&_p]:text-white/60 [&_p]:mt-2"
          />
        )}
      </div>
    </div>
  )
}
