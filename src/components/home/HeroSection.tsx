import Image from 'next/image'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'

async function getSiteSettings() {
  try {
    const payload = await getPayload({ config: configPromise })
    return await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    return null
  }
}

export async function HeroSection() {
  const settings = await getSiteSettings()
  const heroImage = settings?.heroImage as Media | null | undefined
  const heroImageUrl =
    heroImage && typeof heroImage === 'object' && heroImage.url ? heroImage.url : null

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary-dark" />
      {heroImageUrl && (
        <Image
          src={heroImageUrl}
          alt="위례 신도시 사랑하는교회 예배당 전경"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/75" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="text-secondary text-sm md:text-base tracking-[0.3em] uppercase mb-4 font-medium">
          Beloved Church Wirye
        </p>
        <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          {settings?.heroTitle || '사랑하는교회'}
        </h1>
        <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed">
          {settings?.heroSubtitle || '위례에서 하나님의 사랑을 나누는 공동체'}
        </p>

        {/* Worship time badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-full px-5 py-2.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            주일예배 {settings?.sundayServiceTime ?? '12:00'}
          </span>
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-full px-5 py-2.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            금요기도회 {settings?.fridayServiceTime ?? '20:00'}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="/newcomer"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-primary font-semibold rounded-full px-8 py-3.5 text-base transition-colors"
          >
            새가족 등록
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a
            href="#map"
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border-2 border-white/30 hover:bg-white/25 text-white font-semibold rounded-full px-8 py-3.5 text-base transition-colors"
          >
            예배 안내
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex justify-center pt-2">
          <div className="w-1 h-3 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
