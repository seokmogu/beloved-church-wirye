import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@payload-config'
import { FormattedText } from '@/components/FormattedText'
import { NaverMapSectionServer } from '@/components/home/NaverMapSection.server'
import { PageHero } from '@/components/PageHero'
import { FAQStructuredData } from '@/components/StructuredData/FAQStructuredData'
import type { SiteSetting } from '@/payload-types'
import { canonicalAlternates } from '@/utilities/canonical'

export const metadata: Metadata = {
  alternates: canonicalAlternates('/worship'),
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
  const churchName = settings?.churchName?.trim() || '사랑하는교회'
  const address = [settings?.address?.trim(), settings?.addressDetail?.trim()]
    .filter(Boolean)
    .join(' ')
  const worshipSummary = services
    .filter((service) => service?.name && service?.time)
    .map((service) => `${service.name} ${service.time}`)
    .join(', ')
  const faqItems = [
    ...(worshipSummary
      ? [
          {
            question: `${churchName}의 예배 시간은 언제인가요?`,
            answer: `${churchName}의 예배와 모임 시간은 ${worshipSummary}입니다.`,
          },
        ]
      : []),
    ...(address
      ? [
          {
            question: `${churchName}는 어디에 있나요?`,
            answer: `${churchName}는 ${address}에 있습니다.${settings?.transitInfo?.trim() ? ` ${settings.transitInfo.trim()}` : ''}`,
          },
        ]
      : []),
    {
      question: '처음 방문하려면 어떻게 하나요?',
      answer:
        '예배에 자유롭게 참석하시거나 새가족등록 페이지에 방문 정보를 남겨주시면 교회가 안내해 드립니다.',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <FAQStructuredData items={faqItems} />
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
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/sermon" className="text-sm font-medium text-primary hover:underline">
                설교영상 보기 &rarr;
              </Link>
              <Link href="/offering" className="text-sm font-medium text-primary hover:underline">
                헌금 안내 &rarr;
              </Link>
            </div>
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border py-16" aria-labelledby="worship-faq-heading">
        <div className="container max-w-5xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
          <h2 id="worship-faq-heading" className="text-3xl font-bold text-foreground">
            자주 묻는 질문
          </h2>
          <dl className="mt-8 grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-lg border border-border bg-card p-6">
                <dt className="text-lg font-semibold text-foreground">{item.question}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}
