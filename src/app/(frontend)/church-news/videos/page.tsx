import type { Metadata } from 'next'
import Image from 'next/image'
import { ExternalLink, Play, Youtube } from 'lucide-react'
import { getPayload } from 'payload'

import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import { fetchLatestVideos, type YouTubeVideo } from '@/lib/youtube'
import type { SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: '동영상 | 사랑하는교회',
  description: '사랑하는교회의 최신 동영상을 모아봅니다.',
}

export const dynamic = 'force-dynamic'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '날짜 미정'

  return date.toLocaleDateString('ko-KR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ChurchNewsVideosPage() {
  const payload = await getPayload({ config })
  let settings: SiteSetting | null = null

  try {
    settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
  }

  const videoCount =
    typeof settings?.youtubeVideoCount === 'number' ? settings.youtubeVideoCount : 8
  const videos = await fetchLatestVideos(
    videoCount,
    settings?.youtubeChannelId,
    settings?.youtubeChannelUrl,
  )

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="VIDEOS" title="동영상" subtitle="교회의 현장과 소식을 영상으로 전합니다" />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Church Videos
              </p>
              <h2 className="church-section-heading font-bold text-foreground">최신 동영상</h2>
            </div>
            {settings?.youtubeChannelUrl && (
              <a
                href={settings.youtubeChannelUrl}
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

          {videos.length > 0 ? (
            <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card/70 px-6 py-12 text-center">
              <p className="text-base font-semibold text-foreground">표시할 동영상이 없습니다.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                관리자에서 YouTube 채널 주소를 확인해 주세요.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function VideoCard({ video }: { video: YouTubeVideo }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
          <Play className="h-3 w-3 fill-current" aria-hidden="true" />
          보기
        </span>
      </div>
      <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
        {video.title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{formatDate(video.publishedAt)}</p>
    </a>
  )
}
