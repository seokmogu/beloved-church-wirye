import Image from 'next/image'
import Link from 'next/link'

import type { Media, SiteSetting } from '@/payload-types'

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function getWorshipBadges(settings?: SiteSetting | null) {
  return (settings?.worshipServices ?? []).slice(0, 3).filter((item) => item?.name && item?.time)
}

export function HeroSection({ settings }: { settings?: SiteSetting | null }) {
  const heroImageUrl = getMediaUrl(settings?.heroImage as Media | number | null | undefined)
  const logoUrl = getMediaUrl(settings?.logo as Media | number | null | undefined)
  const churchName = settings?.churchName ?? '사랑하는교회'
  const eyebrow = settings?.heroEyebrow ?? settings?.englishName ?? 'Beloved Church Wirye'
  const title = settings?.heroTitle ?? churchName
  const subtitle = settings?.heroSubtitle ?? settings?.tagline ?? ''
  const body = settings?.subTagline ?? ''
  const badges = getWorshipBadges(settings)
  const primaryLabel = settings?.heroPrimaryLabel ?? '예배 안내'
  const primaryUrl = settings?.heroPrimaryUrl ?? '/worship'
  const secondaryLabel = settings?.heroSecondaryLabel ?? '최신 설교 보기'
  const secondaryUrl = settings?.heroSecondaryUrl ?? '/sermon'
  const location = [settings?.address, settings?.addressDetail].filter(Boolean).join(' · ')
  const scheduleItems = badges.length > 0 ? badges : (settings?.worshipServices ?? []).filter((item) => item?.name && item?.time)

  return (
    <section className="relative min-h-[82svh] overflow-hidden bg-primary text-white">
      <div className="church-hero-gradient absolute inset-0" />
      {heroImageUrl && (
        <Image
          src={heroImageUrl}
          alt={`${churchName} 히어로 이미지`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className="church-hero-overlay absolute inset-0" />
      <div className="church-hero-pattern absolute inset-0" />
      <div className="church-hero-fade absolute bottom-0 left-0 right-0 h-28" />

      <div className="container relative z-10 grid min-h-[82svh] items-center gap-12 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.65fr)] lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase text-secondary">{eyebrow}</p>

          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={churchName} className="mb-7 h-16 w-auto object-contain brightness-0 invert md:h-20" />
          ) : (
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">{title}</h1>
          )}

          {logoUrl && <h1 className="sr-only">{title}</h1>}
          {subtitle && <p className="max-w-2xl text-2xl font-semibold leading-snug text-white md:text-3xl">{subtitle}</p>}
          {body && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/72 md:text-lg">{body}</p>}

          {badges.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {badges.map((item) => (
                <span
                  key={`${item.name}-${item.time}`}
                  className="inline-flex items-center gap-2 rounded-md border border-white/18 bg-white/12 px-4 py-2 text-sm text-white backdrop-blur-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>{item.name}</span>
                  <span className="text-white/64">{item.time}</span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {primaryLabel && primaryUrl && (
              <Link
                href={primaryUrl}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary-dark"
              >
                {primaryLabel}
              </Link>
            )}
            {secondaryLabel && secondaryUrl && (
              <Link
                href={secondaryUrl}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/28 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/18"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>

        <aside className="hidden border-l border-white/18 pl-8 lg:block">
          <p className="text-sm font-semibold text-secondary">Worship This Week</p>
          <div className="mt-6 divide-y divide-white/12 border-y border-white/12">
            {scheduleItems.slice(0, 4).map((item) => (
              <div key={`${item.name}-${item.time}`} className="grid grid-cols-[1fr_auto] gap-5 py-4">
                <span className="text-sm text-white/70">{item.name}</span>
                <span className="text-sm font-semibold text-white">{item.time}</span>
              </div>
            ))}
          </div>
          {location && <p className="mt-6 text-sm leading-relaxed text-white/62">{location}</p>}
        </aside>
      </div>
    </section>
  )
}
