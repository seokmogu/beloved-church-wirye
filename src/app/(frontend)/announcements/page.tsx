import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState } from '@/components/EmptyState'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: '공지사항 | 사랑하는교회',
  description: '사랑하는교회 공지사항',
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

function extractPlainText(children: any[]): string {
  return children
    .map((node: any) => {
      if (node.text) return node.text
      if (node.children) return extractPlainText(node.children)
      return ''
    })
    .join(' ')
    .trim()
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  })
}

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

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="NOTICE" title="공지사항" subtitle="사랑하는교회의 새 소식을 전합니다" />

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
              <Link
                key={item.id}
                href={`/announcements/${item.id}`}
                className="flex items-start justify-between gap-4 px-6 py-4 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {item.isPinned && (
                      <span className="shrink-0 mt-0.5 inline-flex items-center bg-secondary/15 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">
                        고정
                      </span>
                    )}
                    <h3 className="text-sm font-medium text-foreground line-clamp-2">{item.title}</h3>
                  </div>
                  {item.content?.root?.children && (
                    <p className="text-xs text-muted-foreground line-clamp-1 pl-0">
                      {extractPlainText(item.content.root.children).slice(0, 100)}
                    </p>
                  )}
                </div>
                <time className="shrink-0 text-xs text-muted-foreground mt-0.5" dateTime={item.publishedAt}>
                  {formatDate(item.publishedAt)}
                </time>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
