import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { EmptyState } from '@/components/EmptyState'
import { PageHero } from '@/components/PageHero'
import type { Bulletin, Media } from '@/payload-types'

export const metadata: Metadata = {
  title: '주보 | 사랑하는교회',
  description: '사랑하는교회 주보 아카이브',
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

type BulletinSearchParams = {
  page?: string
  year?: string
}

export default async function BulletinsPage({
  searchParams,
}: {
  searchParams: Promise<BulletinSearchParams>
}) {
  const { page: pageParam, year: yearParam } = await searchParams
  const requestedPage = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)
  const selectedYear = parseYear(yearParam)

  let bulletins: Bulletin[] = []
  let years: number[] = []
  let hasError = false
  let totalDocs = 0
  let totalPages = 1
  let currentPage = 1

  try {
    const payload = await getPayload({ config: configPromise })
    const [archiveDates, result] = await Promise.all([
      payload.find({
        collection: 'bulletins',
        depth: 0,
        limit: 1000,
        pagination: false,
        select: { date: true },
        sort: '-date',
        where: { isPublic: { equals: true } },
      }),
      payload.find({
        collection: 'bulletins',
        depth: 1,
        limit: PAGE_SIZE,
        page: requestedPage,
        sort: '-date',
        where: buildBulletinWhere(selectedYear),
      }),
    ])

    years = Array.from(
      new Set(
        archiveDates.docs
          .map((bulletin) => getKoreanYear(bulletin.date))
          .filter((year): year is number => year !== null),
      ),
    ).sort((first, second) => second - first)
    bulletins = result.docs
    totalDocs = result.totalDocs
    totalPages = result.totalPages || 1
    currentPage = result.page || requestedPage
  } catch (error) {
    console.error('Failed to fetch bulletins:', error)
    hasError = true
  }

  if (totalDocs > 0 && bulletins.length === 0 && requestedPage > totalPages) {
    redirect(buildBulletinHref({ page: totalPages, selectedYear }))
  }

  const featuredBulletin = currentPage === 1 ? bulletins[0] : null
  const archiveBulletins = featuredBulletin ? bulletins.slice(1) : bulletins
  const archiveTitle = selectedYear ? `${selectedYear}년 주보` : '전체 주보'

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="WEEKLY BULLETIN" title="주보" subtitle="사랑하는교회 주보 아카이브" />

      <div className="container max-w-7xl py-10 sm:py-12">
        {hasError ? (
          <EmptyState
            icon="error"
            title="주보를 불러올 수 없습니다"
            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            ctaText="홈으로 돌아가기"
            ctaLink="/"
          />
        ) : bulletins.length === 0 ? (
          <EmptyState
            icon="document"
            title="등록된 주보가 없습니다"
            description="사랑하는교회의 주보가 곧 업로드될 예정입니다. 자주 방문해주세요!"
            ctaText="예배안내 보기"
            ctaLink="/worship"
          />
        ) : (
          <>
            <section className="mb-8 border-b border-border pb-6 sm:mb-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Bulletin Archive
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {archiveTitle}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedYear ? `${selectedYear}년 ` : ''}총 {totalDocs}건
                </p>
              </div>

              {years.length > 1 && (
                <nav aria-label="주보 연도 선택" className="mt-5 flex flex-wrap gap-2">
                  <ArchiveYearLink active={!selectedYear} href="/bulletins">
                    전체
                  </ArchiveYearLink>
                  {years.map((year) => (
                    <ArchiveYearLink
                      active={selectedYear === year}
                      href={buildBulletinHref({ year })}
                      key={year}
                    >
                      {year}년
                    </ArchiveYearLink>
                  ))}
                </nav>
              )}
            </section>

            {featuredBulletin && (
              <section aria-labelledby="latest-bulletin-title" className="mb-10 sm:mb-12">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Latest bulletin
                </p>
                <BulletinFeature bulletin={featuredBulletin} />
              </section>
            )}

            {archiveBulletins.length > 0 && (
              <section aria-labelledby="bulletin-archive-title">
                <div className="mb-5 flex items-baseline justify-between gap-4">
                  <h2 className="text-xl font-semibold text-foreground" id="bulletin-archive-title">
                    {featuredBulletin ? '최근 주보' : archiveTitle}
                  </h2>
                  <p className="text-xs text-muted-foreground">한 페이지에 {PAGE_SIZE}건</p>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4">
                  {archiveBulletins.map((bulletin) => (
                    <BulletinCard bulletin={bulletin} key={bulletin.id} />
                  ))}
                </div>
              </section>
            )}

            {totalPages > 1 && (
              <nav
                aria-label="주보 목록 페이지"
                className="mt-10 flex items-center justify-center gap-4 border-t border-border pt-8 sm:mt-12"
              >
                {currentPage > 1 ? (
                  <Link
                    className={paginationButtonClassName}
                    href={buildBulletinHref({ page: currentPage - 1, selectedYear })}
                  >
                    &larr; 이전
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className={`${paginationButtonClassName} cursor-not-allowed text-muted-foreground/45`}
                  >
                    &larr; 이전
                  </span>
                )}
                <span
                  aria-current="page"
                  className="min-w-14 text-center text-sm font-medium text-foreground"
                >
                  {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages ? (
                  <Link
                    className={paginationButtonClassName}
                    href={buildBulletinHref({ page: currentPage + 1, selectedYear })}
                  >
                    다음 &rarr;
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className={`${paginationButtonClassName} cursor-not-allowed text-muted-foreground/45`}
                  >
                    다음 &rarr;
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function ArchiveYearLink({
  active,
  children,
  href,
}: {
  active: boolean
  children: React.ReactNode
  href: string
}) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
      }`}
      href={href}
    >
      {children}
    </Link>
  )
}

function BulletinFeature({ bulletin }: { bulletin: Bulletin }) {
  const cover = getBulletinCover(bulletin)

  return (
    <Link
      className="group grid overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md md:grid-cols-[minmax(15rem,0.74fr)_minmax(0,1fr)]"
      href={`/bulletins/${bulletin.id}`}
    >
      <BulletinImage
        alt={bulletin.title || '주보'}
        className="aspect-[3/4] w-full bg-muted object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        src={cover}
      />
      <div className="flex flex-col justify-between p-5 sm:p-7 md:p-9">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            이번 주 주보
          </p>
          <h2
            className="mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
            id="latest-bulletin-title"
          >
            {bulletin.title || '주보'}
          </h2>
          <time
            className="mt-4 block text-sm text-muted-foreground"
            dateTime={bulletin.date || undefined}
          >
            {formatDate(bulletin.date)}
          </time>
          {bulletin.description && (
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {bulletin.description}
            </p>
          )}
        </div>
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          주보 열기 <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  )
}

function BulletinCard({ bulletin }: { bulletin: Bulletin }) {
  const cover = getBulletinCover(bulletin)

  return (
    <Link className="group block" href={`/bulletins/${bulletin.id}`}>
      <div className="overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition-shadow group-hover:shadow-md">
        <BulletinImage
          alt={bulletin.title || '주보'}
          className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          src={cover}
        />
      </div>
      <div className="px-0.5 pt-3">
        <time
          className="text-xs font-semibold tracking-[0.02em] text-primary"
          dateTime={bulletin.date || undefined}
        >
          {formatDate(bulletin.date)}
        </time>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-foreground sm:text-base">
          {bulletin.title || '주보'}
        </h3>
      </div>
    </Link>
  )
}

function BulletinImage({
  alt,
  className,
  src,
}: {
  alt: string
  className: string
  src: string | null
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} className={className} src={src} />
  }

  return (
    <div className={`${className} flex items-center justify-center text-sm text-muted-foreground`}>
      주보 준비 중
    </div>
  )
}

function getBulletinCover(bulletin: Bulletin): string | null {
  const images = Array.isArray(bulletin.images) ? bulletin.images : []
  const firstImageUrl = images
    .map((row) => resolveMedia(row.image)?.url ?? null)
    .find((url): url is string => Boolean(url))
  if (firstImageUrl) return firstImageUrl

  const file = bulletin.file && typeof bulletin.file === 'object' ? (bulletin.file as Media) : null
  return file?.mimeType?.startsWith('image/') ? file.url || null : null
}

function resolveMedia(value: unknown): Media | null {
  return value && typeof value === 'object' ? (value as Media) : null
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

function getKoreanYear(value: string | null | undefined): number | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(date),
  )
}

function parseYear(value: string | undefined): number | null {
  if (!value || !/^\d{4}$/.test(value)) return null
  const year = Number(value)
  return year >= 2000 && year <= 2100 ? year : null
}

function buildBulletinWhere(selectedYear: number | null): Where {
  if (!selectedYear) return { isPublic: { equals: true } }

  const start = new Date(`${selectedYear}-01-01T00:00:00+09:00`).toISOString()
  const end = new Date(`${selectedYear + 1}-01-01T00:00:00+09:00`).toISOString()
  return {
    and: [
      { isPublic: { equals: true } },
      { date: { greater_than_equal: start } },
      { date: { less_than: end } },
    ],
  }
}

function buildBulletinHref({
  page = 1,
  selectedYear,
  year,
}: {
  page?: number
  selectedYear?: number | null
  year?: number
}) {
  const targetYear = year ?? selectedYear
  const search = new URLSearchParams()
  if (targetYear) search.set('year', String(targetYear))
  if (page > 1) search.set('page', String(page))
  const query = search.toString()
  return query ? `/bulletins?${query}` : '/bulletins'
}

const paginationButtonClassName =
  'rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5'
