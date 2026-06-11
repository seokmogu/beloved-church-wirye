import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@payload-config'
import { FormattedText } from '@/components/FormattedText'
import { PageHero } from '@/components/PageHero'
import type { SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: '교회소개 | 사랑하는교회',
  description: '사랑하는교회 위례 소개',
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

export default async function AboutPage() {
  const settings = await getSettings()
  const values = settings?.coreValues ?? []
  const subPages = [
    {
      description: '담임목사 소개와 섬김의 방향을 확인합니다.',
      href: '/about/leaders',
      title: '섬기는 사람들',
    },
    {
      description: '예배 시간, 위치, 방문 안내를 확인합니다.',
      href: '/worship',
      title: '예배안내',
    },
    {
      description: '처음 방문하시는 분의 등록을 돕습니다.',
      href: '/newcomer',
      title: '새가족등록',
    },
    { description: '주일 예배 주보를 확인합니다.', href: '/bulletins', title: '주보' },
  ]

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="ABOUT US"
        title="교회소개"
        subtitle={settings?.tagline ?? '그리스도를 본받아 함께 사랑하는 공동체'}
      />

      <section className="border-b border-border bg-background py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Church Introduction
              </p>
              <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
                {settings?.churchVision ?? 'Like Christ'}
              </h2>
            </div>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <FormattedText
                className="space-y-4"
                headingClassName="text-xl font-bold leading-snug text-foreground"
              >
                {settings?.churchDescription}
              </FormattedText>
              {settings?.churchQuote && (
                <blockquote className="border-l-2 border-secondary pl-5 font-medium text-foreground">
                  <FormattedText className="space-y-2" paragraphClassName="m-0">
                    {settings.churchQuote}
                  </FormattedText>
                </blockquote>
              )}
              <dl className="grid gap-4 pt-4 sm:grid-cols-2">
                {settings?.denomination && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      교단
                    </dt>
                    <dd className="mt-2 font-semibold text-foreground">{settings.denomination}</dd>
                  </div>
                )}
                {(settings?.address || settings?.addressDetail) && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      위치
                    </dt>
                    <dd className="mt-2 font-semibold text-foreground">{settings.address}</dd>
                    {settings.addressDetail && (
                      <dd className="text-sm text-muted-foreground">{settings.addressDetail}</dd>
                    )}
                  </div>
                )}
              </dl>
            </div>
          </div>

          {values.length > 0 && (
            <div className="mt-16 grid gap-5 md:grid-cols-3">
              {values.map((value, index) => (
                <article
                  key={value.id ?? value.title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <span className="text-xs font-bold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{value.title}</h3>
                  <FormattedText
                    className="mt-3 space-y-1 text-sm leading-relaxed text-muted-foreground"
                    headingClassName="text-sm font-bold leading-snug text-foreground"
                  >
                    {value.description}
                  </FormattedText>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              More About Beloved
            </p>
            <h2 className="text-3xl font-bold text-foreground">교회소개 더보기</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {subPages.map((page) => (
              <Link
                className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
                href={page.href}
                key={page.href}
              >
                <h3 className="text-lg font-bold text-foreground">{page.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {page.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
