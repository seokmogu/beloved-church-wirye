import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Play } from 'lucide-react'
import { getPayload } from 'payload'

import config from '@payload-config'
import { extractYouTubeId } from '@/lib/youtube'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: '동영상 | 사랑하는교회',
  description: '사랑하는교회의 소식 영상을 모아봅니다.',
}

export const dynamic = 'force-dynamic'

type ManualVideo = {
  id: number
  description?: string | null
  thumbnail?: string | null
  title: string
  videoDate: string
  youtubeId?: string | null
  youtubeUrl: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '날짜 미정'

  return date.toLocaleDateString('ko-KR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getVideoThumbnail(video: ManualVideo): string | null {
  if (video.thumbnail) return video.thumbnail
  if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
  return null
}

export default async function ChurchNewsVideosPage() {
  const payload = await getPayload({ config })
  let videos: ManualVideo[] = []

  try {
    const result = await payload.find({
      collection: 'church-videos',
      limit: 24,
      sort: '-videoDate',
      where: {
        status: {
          equals: 'published',
        },
      },
    })
    videos = result.docs as ManualVideo[]
  } catch (error) {
    console.error('Failed to fetch church videos:', error)
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="VIDEOS" title="동영상" subtitle="교회의 현장과 소식을 영상으로 전합니다" />

      <section className="py-14 md:py-20">
        <div className="container">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Church Videos
            </p>
            <h2 className="church-section-heading font-bold text-foreground">동영상</h2>
            <p className="church-body-copy mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              교회의 현장과 소식을 영상으로 만나보세요.
            </p>
          </div>

          {videos.length > 0 ? (
            <div className="grid gap-x-6 gap-y-9 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card/70 px-5 py-10 text-center">
              <p className="text-base font-semibold text-foreground">표시할 동영상이 없습니다.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                곧 새로운 영상으로 찾아뵙겠습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function VideoCard({ video }: { video: ManualVideo }) {
  const thumbnail = getVideoThumbnail(video)
  const embeddable = Boolean(video.youtubeId || extractYouTubeId(video.youtubeUrl))

  // 임베드 가능한 영상은 사이트 내 상세에서 재생, 아니면 기존처럼 외부로
  const cardProps = embeddable
    ? { href: `/church-news/videos/${video.id}` }
    : { href: video.youtubeUrl, rel: 'noopener noreferrer', target: '_blank' }
  const CardTag = embeddable ? Link : 'a'

  return (
    <CardTag {...cardProps} className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
            <Play className="h-10 w-10 fill-current" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
          <Play className="h-3 w-3 fill-current" aria-hidden="true" />
          보기
        </span>
      </div>
      <div className="mt-4 flex min-w-0 items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors [overflow-wrap:anywhere] group-hover:text-primary">
            {video.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{formatDate(video.videoDate)}</p>
          {video.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {video.description}
            </p>
          ) : null}
        </div>
        {!embeddable && (
          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </div>
    </CardTag>
  )
}
