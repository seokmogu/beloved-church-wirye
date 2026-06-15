import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@payload-config'
import { FormattedText } from '@/components/FormattedText'
import { NaverMapSectionServer } from '@/components/home/NaverMapSection.server'
import { PageHero } from '@/components/PageHero'
import type { SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: '예배안내 | 사랑하는교회',
  description: '사랑하는교회 위례 예배안내',
}

export const dynamic = 'force-dynamic'

async function getSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload({ config })
    return await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
    return null
  }
}

export default async function WorshipPage() {
  const settings = await getSettings()
  const services = settings?.worshipServices ?? []
  const visitorNotes = settings?.visitorNotes ?? []
  const hasParkingInfo = Boolean(settings?.parkingInfo?.trim())
  const hasVisitNotes = hasParkingInfo || visitorNotes.length > 0

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="WORSHIP"
        title="예배안내"
        subtitle={settings?.heroSubtitle ?? '하나님께 영광 돌리는 예배'}
      />

      <section className="border-b border-border py-16">
        <div className="container max-w-5xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Schedule
              </p>
              <h2 className="text-3xl font-bold text-foreground">예배와 모임</h2>
            </div>
            {settings?.youtubeChannelUrl && (
              <a
                href={settings.youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                설교영상 보기 &rarr;
              </a>
            )}
          </div>

          {services.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service) => (
                <article
                  key={service.id ?? `${service.name}-${service.time}`}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <p className="text-sm font-semibold text-primary">{service.time}</p>
                  <h3 className="mt-3 text-2xl font-bold text-foreground">{service.name}</h3>
                  <FormattedText
                    className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground"
                    headingClassName="text-base font-bold leading-snug text-foreground"
                  >
                    {service.description}
                  </FormattedText>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <NaverMapSectionServer eyebrow="VISIT" settings={settings} title="찾아오시는 길" />

      {hasVisitNotes && (
        <section className="border-t border-border py-16">
          <div className="container max-w-5xl">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Visitor
                </p>
                <h2 className="text-3xl font-bold text-foreground">방문 안내</h2>
              </div>

              <div className="space-y-5">
                {hasParkingInfo && (
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="font-semibold text-foreground">주차 안내</h3>
                    <FormattedText
                      className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground"
                      headingClassName="text-sm font-bold leading-snug text-foreground"
                    >
                      {settings?.parkingInfo}
                    </FormattedText>
                  </div>
                )}

                {visitorNotes.length > 0 && (
                  <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-6">
                    <h3 className="text-xl font-bold text-foreground">처음 오시는 분들께</h3>
                    <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      {visitorNotes.map((note) => (
                        <li key={note.id ?? note.text}>- {note.text}</li>
                      ))}
                    </ul>
                    <Link
                      href="/newcomer"
                      className="mt-6 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                    >
                      새가족등록하기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
