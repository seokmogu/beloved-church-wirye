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
        <p className="text-secondary text-sm md:text-base tracking-[0.3em] uppercase mb-6 font-medium">
          Beloved Church Wirye
        </p>
        {/* 로고 이미지 */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo-beloved.png"
            alt="사랑하는교회"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </div>
        <p className="text-white/80 text-base md:text-lg mb-3 leading-relaxed">
          우리는 사랑으로 교회를 세웁니다
        </p>
        <p className="text-white/60 text-sm md:text-base mb-10 leading-relaxed">
          더불어 우리의 삶 속에 하나님 나라를 세웁니다
        </p>

        {/* Worship time badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-full px-5 py-2.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            주일예배 {settings?.sundayServiceTime ?? '12:00'}
          </span>
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-full px-5 py-2.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            금요기도회 {settings?.fridayServiceTime ?? '20:00'}
          </span>
        </div>
        <p className="text-white/50 text-xs mb-10">
          청·장년예배 주일 낮 12시 &nbsp;·&nbsp; 어린이예배 주일 낮 12시 &nbsp;·&nbsp; 금요기도회 금요일 밤 8시
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="#map"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-primary font-semibold rounded-full px-8 py-3.5 text-base transition-colors"
          >
            예배 안내
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a
            href="https://www.youtube.com/@BelovedChurchWirye"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border-2 border-white/30 hover:bg-white/25 text-white font-semibold rounded-full px-8 py-3.5 text-base transition-colors"
          >
            최신 설교 바로가기
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
