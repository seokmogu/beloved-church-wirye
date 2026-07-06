import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { ExternalLink, Youtube } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { extractYouTubeId } from '@/lib/youtube'

type Args = {
  params: Promise<{
    videoId?: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

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

export default async function ChurchVideoDetailPage({ params: paramsPromise }: Args) {
  const { videoId = '' } = await paramsPromise
  const video = await queryChurchVideoByID(videoId)

  if (!video?.embedId) return notFound()

  const videoDate = formatDate(video.videoDate)

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container max-w-4xl py-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Videos</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">동영상</h1>
        </div>
      </section>

      <div className="container max-w-4xl py-8 md:py-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">동영상 보기</p>
          <Link
            href="/church-news/videos"
            className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
          >
            목록으로
          </Link>
        </div>

        <article className="overflow-hidden border-y-2 border-y-primary bg-card">
          <div className="relative aspect-video bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.embedId}`}
              className="absolute inset-0 h-full w-full border-0"
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="px-5 py-6 md:px-8">
            <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              {video.title}
            </h2>
            {videoDate && <p className="mt-2 text-sm text-muted-foreground">{videoDate}</p>}
            {video.description && (
              <p className="mt-4 leading-relaxed text-muted-foreground">{video.description}</p>
            )}
          </div>

          <div className="border-t border-border bg-muted/25 px-5 py-5 md:px-8">
            <a
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              href={video.youtubeUrl}
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
            href="/church-news/videos"
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
  const video = await queryChurchVideoByID(videoId)

  return {
    title: video?.title ? `${video.title} | 사랑하는교회` : '동영상 | 사랑하는교회',
    description: '사랑하는교회 소식 영상',
  }
}

const queryChurchVideoByID = cache(async (id: string) => {
  if (!id || !/^\d+$/.test(id)) return null

  try {
    const payload = await getPayload({ config: configPromise })
    const video = (await payload.findByID({
      collection: 'church-videos',
      id,
    })) as {
      description?: string | null
      status?: string | null
      title: string
      videoDate?: string | null
      youtubeId?: string | null
      youtubeUrl: string
    } | null

    if (!video || video.status !== 'published') return null

    return {
      ...video,
      embedId: video.youtubeId || extractYouTubeId(video.youtubeUrl) || null,
    }
  } catch {
    return null
  }
})
