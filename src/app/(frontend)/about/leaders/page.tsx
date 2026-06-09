import type { Metadata } from 'next'
import Image from 'next/image'
import { getPayload } from 'payload'

import config from '@payload-config'
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

type Person = {
  key: string
  name: string
  title?: string | null
  role?: string | null
  photo: string | null
  bio?: string | null
}

export default async function LeadersPage() {
  const settings = await getSettings()

  // 담임목사와 함께 섬기는 분들을 하나의 동일한 카드 레이어로 합친다(인원이 많아도 균일하게 확장).
  const people: Person[] = []
  if (settings?.pastorName) {
    people.push({
      key: 'pastor',
      name: settings.pastorName,
      title: settings.pastorTitle,
      role: '담임목사',
      photo: mediaUrl(settings.pastorPhoto as Media | number | null | undefined),
      bio: settings.pastorBio,
    })
  }
  ;(settings?.leaders ?? []).forEach((leader, index) => {
    if (!leader?.name) return
    people.push({
      key: leader.id ?? `leader-${index}`,
      name: leader.name,
      title: leader.title,
      role: leader.role,
      photo: mediaUrl(leader.photo as Media | number | null | undefined),
      bio: leader.bio,
    })
  })

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="LEADERS"
        title="섬기는 사람들"
        subtitle="사랑하는교회를 말씀과 섬김으로 세워갑니다"
      />

      <section className="py-16 md:py-20">
        <div className="container max-w-5xl">
          {people.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => (
                <article
                  key={person.key}
                  className="flex flex-col rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {person.photo ? (
                        <Image
                          src={person.photo}
                          alt={person.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center px-1 text-center text-[11px] leading-tight text-muted-foreground">
                          사진 준비 중
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      {person.role && (
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          {person.role}
                        </p>
                      )}
                      <h3 className="truncate text-lg font-bold text-foreground">{person.name}</h3>
                      {person.title && (
                        <p className="truncate text-sm font-medium text-primary">{person.title}</p>
                      )}
                    </div>
                  </div>
                  {person.bio && (
                    <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {person.bio}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">소개가 곧 준비될 예정입니다.</p>
          )}
        </div>
      </section>
    </main>
  )
}
