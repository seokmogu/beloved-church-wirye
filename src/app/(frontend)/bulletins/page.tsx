import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { Media } from '@/payload-types'
import { EmptyState } from '@/components/EmptyState'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: '주보 | 사랑하는교회',
  description: '사랑하는교회 주보 아카이브',
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

export default async function BulletinsPage() {
  let bulletins: any[] = []
  let hasError = false

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'bulletins',
      limit: 50,
      sort: '-date',
      where: {
        isPublic: { equals: true },
      },
    })
    bulletins = result.docs
  } catch (error) {
    console.error('Failed to fetch bulletins:', error)
    hasError = true
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="WEEKLY BULLETIN" title="주보" subtitle="사랑하는교회 주보 아카이브" />

      {/* Bulletins grid */}
      <div className="container py-12">
        {bulletins.length === 0 ? (
          hasError ? (
            <EmptyState
              icon="error"
              title="주보를 불러올 수 없습니다"
              description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
              ctaText="홈으로 돌아가기"
              ctaLink="/"
            />
          ) : (
            <EmptyState
              icon="document"
              title="등록된 주보가 없습니다"
              description="사랑하는교회의 주보가 곧 업로드될 예정입니다. 자주 방문해주세요!"
              ctaText="예배안내 보기"
              ctaLink="/worship"
            />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bulletins.map((bulletin) => {
              const file = bulletin.file as Media | null
              const fileUrl = file?.url ?? null
              const isImage = file?.mimeType?.startsWith('image/')
              const images = Array.isArray(bulletin.images) ? bulletin.images : []
              const firstImageUrl =
                images
                  .map((row: any) =>
                    row?.image && typeof row.image === 'object' ? row.image.url : null,
                  )
                  .find((url: any) => Boolean(url)) ?? null
              const coverUrl = firstImageUrl ?? (isImage ? fileUrl : null)

              return (
                <Link
                  key={bulletin.id}
                  href={`/bulletins/${bulletin.id}`}
                  className="group block border border-border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow"
                >
                  {/* Preview */}
                  <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={bulletin.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm">PDF</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                      {bulletin.title}
                    </h3>
                    {bulletin.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {bulletin.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-3">
                      {new Date(bulletin.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'Asia/Seoul',
                      })}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors group-hover:text-secondary">
                      자세히 보기 &rarr;
                    </span>
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
