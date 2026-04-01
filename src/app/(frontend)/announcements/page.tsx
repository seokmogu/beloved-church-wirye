import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { EmptyState } from '@/components/EmptyState'

export const metadata: Metadata = {
  title: '공지사항 | 사랑하는교회',
  description: '사랑하는교회 공지사항',
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

export default async function AnnouncementsPage() {
  let announcements: any[] = []
  let hasError = false

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'announcements',
      limit: 30,
      sort: '-isPinned,-publishedAt',
    })
    announcements = result.docs
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
    hasError = true
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#1B3A2D] py-16">
        <div className="container text-center">
          <p className="text-[#C9A84C] text-sm font-medium tracking-wider uppercase mb-2">
            NOTICE
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">공지사항</h1>
          <p className="text-white/60 mt-2">사랑하는교회의 새 소식을 전합니다</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 max-w-3xl">
        {hasError ? (
          <EmptyState
            icon="error"
            title="공지사항을 불러올 수 없습니다"
            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            ctaText="홈으로 돌아가기"
            ctaLink="/"
          />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon="announcement"
            title="등록된 공지사항이 없습니다"
            description="사랑하는교회의 새 소식이 곧 전해질 예정입니다. 자주 방문해주세요!"
            ctaText="예배 안내 보기"
            ctaLink="/worship"
          />
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 px-6 py-4 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {item.isPinned && (
                    <span className="shrink-0 mt-0.5 inline-flex items-center bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-semibold px-2 py-0.5 rounded-full">
                      고정
                    </span>
                  )}
                  <h3 className="text-sm font-medium text-foreground line-clamp-2">{item.title}</h3>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground mt-0.5" dateTime={item.publishedAt}>
                  {formatDate(item.publishedAt)}
                </time>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
