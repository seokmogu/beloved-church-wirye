import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import { EmptyState } from '@/components/EmptyState'
import { PageHero } from '@/components/PageHero'
import type { ChurchNew, Media } from '@/payload-types'

import { ChurchNewsImage } from './ChurchNewsImage'
import { getChurchNewsImageSource } from './mediaImage'

export const metadata: Metadata = {
  title: '교회소식 | 사랑하는교회',
  description: '사랑하는교회 주간 교회소식',
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

type ChurchNewsImage = NonNullable<ChurchNew['images']>[number]

export default async function ChurchNewsPage() {
  let items: ChurchNew[] = []
  let hasError = false

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'church-news',
      depth: 1,
      limit: 40,
      sort: '-date',
      where: {
        isPublic: { equals: true },
      },
    })
    items = result.docs
  } catch (error) {
    console.error('Failed to fetch church news:', error)
    hasError = true
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="CHURCH NEWS"
        title="교회소식"
        subtitle="사랑하는교회의 주간 소식을 전합니다"
      />

      <div className="container py-12">
        <div className="mb-6 flex justify-end">
          <Link
            href="/church-news/videos"
            className="text-sm font-medium text-primary hover:underline"
          >
            동영상 모아보기 &rarr;
          </Link>
        </div>
        {items.length === 0 ? (
          hasError ? (
            <EmptyState
              icon="error"
              title="교회소식을 불러올 수 없습니다"
              description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
              ctaText="홈으로 돌아가기"
              ctaLink="/"
            />
          ) : (
            <EmptyState
              icon="announcement"
              title="등록된 교회소식이 없습니다"
              description="사랑하는교회의 새 소식이 곧 업로드될 예정입니다."
              ctaText="예배안내 보기"
              ctaLink="/worship"
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const media = firstMedia(item.images)
              const imageSource = getChurchNewsImageSource(media, ['medium', 'small'])
              return (
                <Link
                  className="group overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-md"
                  href={`/church-news/${item.id}`}
                  key={item.id}
                >
                  <div className="relative aspect-[4/5] bg-muted">
                    {imageSource ? (
                      <ChurchNewsImage
                        alt={media?.alt || item.title || '교회소식'}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        fallbackSrc={imageSource.fallbackSrc}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={imageSource.src}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        이미지 준비 중
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      {formatDate(item.date)}
                    </p>
                    <h2 className="line-clamp-2 text-lg font-semibold text-foreground">
                      {item.title || '교회소식'}
                    </h2>
                    {item.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-muted-foreground">
                      이미지 {item.images?.length || 0}장
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

function firstMedia(images: ChurchNew['images']): Media | null {
  const first = images?.[0]
  return first ? resolveMedia(first) : null
}

function resolveMedia(item: ChurchNewsImage): Media | null {
  return typeof item.image === 'object' && item.image ? item.image : null
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '날짜 미정'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '날짜 미정'

  return new Intl.DateTimeFormat('ko-KR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).format(date)
}
