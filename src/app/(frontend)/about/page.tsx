import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import type { Media, SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: '교회 소개 | 사랑하는교회',
  description: '사랑하는교회 위례 소개',
}

export const dynamic = 'force-dynamic'

function mediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function splitLines(value?: string | null): string[] {
  return (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

async function getSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload({ config })
    return await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
    return null
  }
}

export default async function AboutPage() {
  const settings = await getSettings()
  const values = settings?.coreValues ?? []
  const services = settings?.worshipServices ?? []
  const pastorPhotoUrl = mediaUrl(settings?.pastorPhoto as Media | number | null | undefined)
  const pastorBio = splitLines(settings?.pastorBio)
  const visitorNotes = settings?.visitorNotes ?? []

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="ABOUT US"
        title="교회 소개"
        subtitle={settings?.tagline ?? '그리스도를 본받아 함께 사랑하는 공동체'}
      />

      <section className="border-b border-border bg-background py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Church Introduction
              </p>
              <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
                {settings?.churchVision ?? 'Like Christ'}
              </h2>
            </div>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              {settings?.churchDescription && <p>{settings.churchDescription}</p>}
              {settings?.churchQuote && (
                <blockquote className="border-l-2 border-secondary pl-5 font-medium text-foreground">
                  &ldquo;{settings.churchQuote}&rdquo;
                </blockquote>
              )}
              <dl className="grid gap-4 pt-4 sm:grid-cols-2">
                {settings?.denomination && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">교단</dt>
                    <dd className="mt-2 font-semibold text-foreground">{settings.denomination}</dd>
                  </div>
                )}
                {(settings?.address || settings?.addressDetail) && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">위치</dt>
                    <dd className="mt-2 font-semibold text-foreground">{settings.address}</dd>
                    {settings.addressDetail && <dd className="text-sm text-muted-foreground">{settings.addressDetail}</dd>}
                  </div>
                )}
              </dl>
            </div>
          </div>

          {values.length > 0 && (
            <div className="mt-16 grid gap-5 md:grid-cols-3">
              {values.map((value, index) => (
                <article key={value.id ?? value.title} className="rounded-lg border border-border bg-card p-6">
                  <span className="text-xs font-bold text-secondary">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-border bg-muted/25 py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[240px_1fr]">
            <div>
              {pastorPhotoUrl ? (
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
                  <Image src={pastorPhotoUrl} alt={settings?.pastorName ?? '담임목사'} fill className="object-cover" sizes="240px" />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                  사진 등록 필요
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Senior Pastor
              </p>
              <h2 className="text-3xl font-bold text-foreground">{settings?.pastorName ?? '담임목사'}</h2>
              {settings?.pastorTitle && <p className="mt-2 font-medium text-primary">{settings.pastorTitle}</p>}
              {pastorBio.length > 0 && (
                <div className="mt-7 space-y-2 text-muted-foreground">
                  {pastorBio.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
              {settings?.pastorQuote && (
                <blockquote className="mt-7 border-l-2 border-secondary pl-5 italic text-muted-foreground">
                  &ldquo;{settings.pastorQuote}&rdquo;
                </blockquote>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Worship Guide
              </p>
              <h2 className="text-3xl font-bold text-foreground">예배 안내</h2>
            </div>

            <div className="space-y-8">
              {services.length > 0 && (
                <div className="divide-y divide-border rounded-lg border border-border bg-card">
                  {services.map((service) => (
                    <div key={service.id ?? `${service.name}-${service.time}`} className="grid gap-2 p-5 sm:grid-cols-[1fr_auto]">
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        {service.description && <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>}
                      </div>
                      <p className="font-semibold text-primary">{service.time}</p>
                    </div>
                  ))}
                </div>
              )}

              {visitorNotes.length > 0 && (
                <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-6">
                  <h3 className="font-bold text-foreground">처음 오시는 분들께</h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {visitorNotes.map((note) => (
                      <li key={note.id ?? note.text}>- {note.text}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href="/newcomer"
                className="inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                새가족 등록하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
