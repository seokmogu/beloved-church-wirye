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

const PAGE_SIZE = 30

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const requestedPage = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)

  let announcements: AnnouncementItem[] = []
  let hasError = false
  let totalDocs = 0
  let totalPages = 1
  let currentPage = 1
  let pinnedTotal = 0

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'announcements',
      limit: PAGE_SIZE,
      page: requestedPage,
      sort: '-isPinned,-publishedAt',
    })
    announcements = result.docs
    totalDocs = result.totalDocs
    totalPages = result.totalPages || 1
    currentPage = result.page || requestedPage
    pinnedTotal = (
      await payload.count({
        collection: 'announcements',
        where: { isPinned: { equals: true } },
      })
    ).totalDocs
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
  // 고정글은 항상 목록 맨 앞에 오므로, 일반글 순번은 전체 기준으로 이어서 매긴다
  const totalRegular = totalDocs - pinnedTotal
  const boardRows = announcements.map((item, index) => {
    const globalIndex = (currentPage - 1) * PAGE_SIZE + index
    const regularsBefore = Math.max(0, globalIndex - pinnedTotal)
    return {
      ...item,
      boardNumber: item.isPinned ? '고정' : String(totalRegular - regularsBefore),
    }
  })

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="NOTICE" title="교회로그" subtitle="사랑하는교회의 새 소식을 전합니다" />

      <div className="container max-w-5xl py-12">
        {hasError ? (
          <EmptyState
            icon="error"
            title="교회로그를 불러올 수 없습니다"
            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            ctaText="홈으로 돌아가기"
            ctaLink="/"
          />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon="announcement"
            title="등록된 교회로그가 없습니다"
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
                <span>전체 {totalDocs}건</span>
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
                      <tr key={item.id} className="relative transition-colors hover:bg-muted/25">
                        <td className="px-4 py-4 text-center text-muted-foreground">
                          {item.isPinned ? (
                            <span className="inline-flex min-w-12 justify-center rounded-sm bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                              고정
                            </span>
                          ) : (
                            item.boardNumber
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {/* after:inset-0가 행 전체를 클릭 영역으로 확장 (tr이 relative) */}
                          <Link
                            href={`/announcements/${item.id}`}
                            className="font-medium text-foreground underline-offset-4 after:absolute after:inset-0 hover:text-primary hover:underline"
                          >
                            {item.title || '제목 없음'}
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
                        고정
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
                    {item.title || '제목 없음'}
                  </h3>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="교회로그 목록 페이지"
                className="mt-8 flex items-center justify-center gap-4"
              >
                {currentPage > 1 ? (
                  <Link
                    href={`/announcements?page=${currentPage - 1}`}
                    className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    &larr; 이전
                  </Link>
                ) : (
                  <span className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground/50">
                    &larr; 이전
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages ? (
                  <Link
                    href={`/announcements?page=${currentPage + 1}`}
                    className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    다음 &rarr;
                  </Link>
                ) : (
                  <span className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground/50">
                    다음 &rarr;
                  </span>
                )}
              </nav>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
