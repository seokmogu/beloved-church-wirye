import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { ExternalLink, Youtube } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { fetchLatestVideos } from '@/lib/youtube'

type Args = {
  params: Promise<{
    videoId?: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('ko-KR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  })
}

export default async function SermonDetailPage({ params: paramsPromise }: Args) {
  const { videoId = '' } = await paramsPromise
  if (!YOUTUBE_ID_PATTERN.test(videoId)) return notFound()

  const sermon = await querySermonByVideoId(videoId)
  const title = sermon?.title ?? '설교영상'
  const sermonDate = formatDate(sermon?.publishedAt)

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container max-w-4xl py-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Sermon</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">설교영상</h1>
        </div>
      </section>

      <div className="container max-w-4xl py-8 md:py-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">설교 보기</p>
          <Link
            href="/sermon"
            className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
          >
            목록으로
          </Link>
        </div>

        <article className="overflow-hidden border-y-2 border-y-primary bg-card">
          <div className="relative aspect-video bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              className="absolute inset-0 h-full w-full border-0"
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="px-5 py-6 md:px-8">
            <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              {title}
            </h2>
            {sermonDate && <p className="mt-2 text-sm text-muted-foreground">{sermonDate}</p>}
          </div>

          <div className="border-t border-border bg-muted/25 px-5 py-5 md:px-8">
            <a
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              href={`https://www.youtube.com/watch?v=${videoId}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Youtube className="h-4 w-4" aria-hidden="true" />
              YouTube에서 보기
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </article>

        <div className="mt-6 flex justify-center">
          <Link
            href="/sermon"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light"
          >
            목록으로
          </Link>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { videoId = '' } = await paramsPromise
  if (!YOUTUBE_ID_PATTERN.test(videoId)) {
    return { title: '설교영상 | 사랑하는교회' }
  }

  const sermon = await querySermonByVideoId(videoId)
  return {
    title: sermon?.title ? `${sermon.title} | 사랑하는교회` : '설교영상 | 사랑하는교회',
    description: '사랑하는교회 설교 말씀',
  }
}

/**
 * 제목/날짜 메타데이터 조회: sermons 컬렉션 → YouTube RSS 순으로 찾는다.
 * 어느 쪽에도 없으면 null — 페이지는 임베드 플레이어만으로도 동작한다.
 */
const querySermonByVideoId = cache(
  async (videoId: string): Promise<{ publishedAt?: string | null; title: string } | null> => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'sermons',
        limit: 1,
        where: {
          status: { equals: 'published' },
          youtubeId: { equals: videoId },
        },
      })
      const doc = result.docs[0]
      if (doc?.title) {
        return { publishedAt: doc.sermonDate, title: doc.title }
      }
    } catch {
      // sermons 조회 실패 시 RSS로 폴백
    }

    try {
      const payload = await getPayload({ config: configPromise })
      const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
      const videos = await fetchLatestVideos(
        25,
        settings?.youtubeChannelId,
        settings?.youtubeChannelUrl,
      )
      const video = videos.find((item) => item.id === videoId)
      if (video) {
        return { publishedAt: video.publishedAt, title: video.title }
      }
    } catch {
      // 메타데이터 없이 렌더
    }

    return null
  },
)
