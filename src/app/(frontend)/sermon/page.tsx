import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Play, Youtube } from 'lucide-react'
import { FormattedText } from '@/components/FormattedText'
import { PageHero } from '@/components/PageHero'
import { fetchLatestVideos, type YouTubeVideo } from '@/lib/youtube'
import type { SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: '설교영상 | 사랑하는교회',
  description: '사랑하는교회의 설교 말씀을 들어보세요.',
}

// Force dynamic rendering to avoid build-time DB query
// This allows Payload CMS to run migrations on first admin access
export const dynamic = 'force-dynamic'

const SERMON_PAGE_VIDEO_COUNT = 12

type HomeSection = NonNullable<SiteSetting['homeSections']>[number]

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatRelativeDate(dateString: string): string {
  const published = new Date(dateString).getTime()
  if (Number.isNaN(published)) return ''

  const days = Math.max(0, Math.floor((Date.now() - published) / 86_400_000))
  if (days < 1) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 35) return `${Math.floor(days / 7)}주 전`
  if (days < 365) return `${Math.floor(days / 30)}개월 전`
  return `${Math.floor(days / 365)}년 전`
}

function getSermonsSection(settings: SiteSetting | null): Partial<HomeSection> {
  return (
    settings?.homeSections?.find(
      (section) => section?.enabled !== false && section?.sectionType === 'sermons',
    ) ?? {
      description: null,
      eyebrow: 'SERMON',
      title: '최신 설교',
    }
  )
}

function SermonArchiveSection({
  channelUrl,
  description,
  eyebrow,
  title,
  videos,
}: {
  channelUrl?: string | null
  description?: string | null
  eyebrow?: string | null
  title?: string | null
  videos: YouTubeVideo[]
}) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-primary">
              {eyebrow ?? 'SERMON'}
            </p>
            <h2 className="church-section-heading font-bold text-foreground">
              {title ?? '최신 설교'}
            </h2>
            <FormattedText
              className="church-body-copy mt-4 max-w-2xl space-y-3 leading-relaxed text-muted-foreground"
              headingClassName="text-xl font-bold leading-snug text-foreground"
            >
              {description}
            </FormattedText>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              최신순
            </span>
            {channelUrl && (
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Youtube className="h-4 w-4" aria-hidden="true" />
                YouTube 채널
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {videos.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video, index) => {
              const relativeDate = formatRelativeDate(video.publishedAt)

              return (
                <Link key={video.id} href={`/sermon/${video.id}`} className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading={index < 6 ? 'eager' : 'lazy'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                      <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                      보기
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {video.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {relativeDate
                        ? `${formatDate(video.publishedAt)} · ${relativeDate}`
                        : formatDate(video.publishedAt)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/70 px-6 py-12 text-center">
            <p className="text-base font-semibold text-foreground">등록된 설교영상이 없습니다.</p>
            {channelUrl && (
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Youtube className="h-4 w-4" aria-hidden="true" />
                YouTube 채널
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default async function SermonPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const payload = await getPayload({ config })
  const { page: pageParam } = await searchParams
  const requestedPage = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)

  let settings: SiteSetting | null = null
  let cmsVideos: YouTubeVideo[] = []
  let totalPages = 1
  let currentPage = 1

  try {
    settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
  }

  const videoCount = Math.max(
    typeof settings?.youtubeVideoCount === 'number' ? settings.youtubeVideoCount : 4,
    SERMON_PAGE_VIDEO_COUNT,
  )

  try {
    const sermonsData = await payload.find({
      collection: 'sermons',
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: videoCount,
      page: requestedPage,
      sort: '-sermonDate',
    })
    totalPages = sermonsData.totalPages || 1
    currentPage = sermonsData.page || requestedPage
    cmsVideos = sermonsData.docs
      .filter((sermon) => sermon.youtubeId)
      .map((sermon) => ({
        id: sermon.youtubeId as string,
        publishedAt: sermon.sermonDate,
        thumbnail:
          sermon.thumbnail || `https://img.youtube.com/vi/${sermon.youtubeId}/maxresdefault.jpg`,
        title: sermon.title,
      }))
  } catch (error) {
    console.error('Failed to fetch sermons:', error)
  }

  // CMS에 설교가 아예 없을 때만 YouTube RSS로 폴백 (RSS는 페이지네이션 불가)
  const usingFallback = cmsVideos.length === 0 && currentPage === 1
  const fallbackVideos = usingFallback
    ? await fetchLatestVideos(videoCount, settings?.youtubeChannelId, settings?.youtubeChannelUrl)
    : []
  const videos = cmsVideos.length > 0 ? cmsVideos : fallbackVideos
  const showPagination = !usingFallback && totalPages > 1
  const section = getSermonsSection(settings)

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="SERMON" title="설교영상" subtitle="하나님의 말씀을 영상으로 나눕니다." />

      <SermonArchiveSection
        channelUrl={settings?.youtubeChannelUrl}
        description={section.description}
        eyebrow={section.eyebrow}
        title={section.title}
        videos={videos}
      />

      {showPagination && (
        <nav
          aria-label="설교 목록 페이지"
          className="container flex items-center justify-center gap-4 pb-16"
        >
          {currentPage > 1 ? (
            <Link
              href={`/sermon?page=${currentPage - 1}`}
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
              href={`/sermon?page=${currentPage + 1}`}
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
    </main>
  )
}
