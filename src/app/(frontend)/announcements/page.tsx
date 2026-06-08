import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { EmptyState } from '@/components/EmptyState'
import { PageHero } from '@/components/PageHero'
import Link from 'next/link'

type AnnouncementItem = {
  googleDriveLink?: null | string
  id: number | string
  isPinned?: boolean | null
  publishedAt?: string | null
  title?: string | null
}

export const metadata: Metadata = {
  title: '교회로그 | 사랑하는교회',
  description: '사랑하는교회 교회로그',
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

export default async function AnnouncementsPage() {
  let announcements: AnnouncementItem[] = []
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

  const pinnedCount = announcements.filter((item) => item.isPinned).length
  const regularCount = announcements.length - pinnedCount
  let regularNumber = regularCount
  const boardRows = announcements.map((item) => ({
    ...item,
    boardNumber: item.isPinned ? '공지' : String(regularNumber--),
  }))

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="NOTICE" title="교회로그" subtitle="사랑하는교회의 새 소식을 전합니다" />

      <div className="container max-w-5xl py-12">
        {hasError ? (
          <EmptyState
            icon="error"
            title="교회로그을 불러올 수 없습니다"
            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            ctaText="홈으로 돌아가기"
            ctaLink="/"
          />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon="announcement"
            title="등록된 교회로그이 없습니다"
            description="사랑하는교회의 새 소식이 곧 전해질 예정입니다. 자주 방문해주세요!"
            ctaText="예배안내 보기"
            ctaLink="/worship"
          />
        ) : (
          <div>
            <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
                  Notice Board
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">교회로그 게시판</h2>
              </div>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>전체 {announcements.length}건</span>
                {pinnedCount > 0 && <span>고정 {pinnedCount}건</span>}
              </div>
            </div>

            <div className="hidden overflow-hidden rounded-md border border-border bg-card md:block">
              <table className="w-full border-collapse text-sm">
                <thead className="border-b border-border bg-muted/45 text-muted-foreground">
                  <tr>
                    <th className="w-24 px-4 py-3 text-center font-medium">번호</th>
                    <th className="px-4 py-3 text-left font-medium">제목</th>
                    <th className="w-24 px-4 py-3 text-center font-medium">첨부</th>
                    <th className="w-40 px-4 py-3 text-center font-medium">작성일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {boardRows.map((item) => {
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-muted/25">
                        <td className="px-4 py-4 text-center text-muted-foreground">
                          {item.isPinned ? (
                            <span className="inline-flex min-w-12 justify-center rounded-sm bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                              공지
                            </span>
                          ) : (
                            item.boardNumber
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/announcements/${item.id}`}
                            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                          >
                            {item.title || '제목 없는 공지'}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {item.googleDriveLink ? (
                            <span className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground">
                              자료
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-muted-foreground">
                          {item.publishedAt ? (
                            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                          ) : (
                            '날짜 미정'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card md:hidden">
              {boardRows.map((item) => (
                <Link
                  key={item.id}
                  href={`/announcements/${item.id}`}
                  className="block px-4 py-4 transition-colors hover:bg-muted/25"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {item.isPinned ? (
                      <span className="rounded-sm bg-primary px-2 py-1 font-semibold text-primary-foreground">
                        공지
                      </span>
                    ) : (
                      <span>No. {item.boardNumber}</span>
                    )}
                    {item.googleDriveLink && <span>자료</span>}
                    {item.publishedAt && (
                      <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                    )}
                  </div>
                  <h3 className="line-clamp-2 font-medium text-foreground">
                    {item.title || '제목 없는 공지'}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
