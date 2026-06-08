import type { Metadata } from 'next'
import Image from 'next/image'
import { getPayload } from 'payload'

import config from '@payload-config'
import { FormattedText } from '@/components/FormattedText'
import { PageHero } from '@/components/PageHero'
import type { Media, SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: '섬기는 사람들 | 사랑하는교회',
  description: '사랑하는교회를 섬기는 사람들을 소개합니다.',
}

export const dynamic = 'force-dynamic'

function mediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
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

export default async function LeadersPage() {
  const settings = await getSettings()
  const pastorPhotoUrl = mediaUrl(settings?.pastorPhoto as Media | number | null | undefined)

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="LEADERS"
        title="섬기는 사람들"
        subtitle="사랑하는교회를 말씀과 섬김으로 세워갑니다"
      />

      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[260px_1fr]">
            <div>
              {pastorPhotoUrl ? (
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
                  <Image
                    src={pastorPhotoUrl}
                    alt={settings?.pastorName ?? '담임목사'}
                    fill
                    className="object-cover"
                    sizes="260px"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                  사진 준비 중
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Senior Pastor
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                {settings?.pastorName ?? '담임목사'}
              </h2>
              {settings?.pastorTitle && (
                <p className="mt-2 font-medium text-primary">{settings.pastorTitle}</p>
              )}
              <FormattedText
                className="mt-7 space-y-3 leading-relaxed text-muted-foreground"
                headingClassName="text-lg font-bold leading-snug text-foreground"
                listClassName="space-y-1 text-muted-foreground"
              >
                {settings?.pastorBio}
              </FormattedText>
              {settings?.pastorQuote && (
                <blockquote className="mt-7 border-l-2 border-secondary pl-5 italic text-muted-foreground">
                  <FormattedText className="space-y-2" paragraphClassName="m-0">
                    {settings.pastorQuote}
                  </FormattedText>
                </blockquote>
              )}
            </div>
          </div>
        </div>
      </section>

      {(settings?.leaders ?? []).length > 0 && (
        <section className="border-t border-border py-16">
          <div className="container max-w-5xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Team</p>
            <h2 className="text-3xl font-bold text-foreground">함께 섬기는 분들</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {(settings?.leaders ?? []).map((leader, index) => {
                const photoUrl = mediaUrl(leader.photo as Media | number | null | undefined)
                return (
                  <article
                    key={leader.id ?? index}
                    className="flex gap-5 rounded-lg border border-border bg-card p-5"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={leader.name ?? '섬기는 사람'}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          사진 준비 중
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground">{leader.name}</h3>
                      {leader.title && (
                        <p className="mt-1 text-sm font-medium text-primary">{leader.title}</p>
                      )}
                      {leader.role && (
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          {leader.role}
                        </p>
                      )}
                      <FormattedText className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
                        {leader.bio}
                      </FormattedText>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
