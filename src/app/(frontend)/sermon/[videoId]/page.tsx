import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { ExternalLink, Youtube } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { fetchLatestVideos } from '@/lib/youtube'
import { canonicalAlternates } from '@/utilities/canonical'

type Args = {
  params: Promise<{
    videoId?: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

function formatYouTubeUploadDateTime(dateString: string | null | undefined) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(date)
}

export default async function SermonDetailPage({ params: paramsPromise }: Args) {
  const { videoId = '' } = await paramsPromise
  if (!YOUTUBE_ID_PATTERN.test(videoId)) return notFound()

  const sermon = await querySermonByVideoId(videoId)
  const title = sermon?.title ?? '설교영상'
  const sermonDate = formatYouTubeUploadDateTime(sermon?.publishedAt)
  const transcript = sermon?.publicTranscript?.trim()
  const hasTranscript = Boolean(transcript && sermon?.transcriptStatus !== 'unavailable')
  const transcriptPreview = transcript ? createTranscriptPreview(transcript) : ''
  const transcriptLength = transcript ? formatTranscriptLength(transcript) : null

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
              data-analytics-content-id={`youtube_${videoId}`}
              data-analytics-content-type="sermon"
              data-analytics-embed="youtube"
              data-youtube-video-id={videoId}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&playsinline=1`}
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
            {sermonDate && (
              <p className="mt-2 text-sm text-muted-foreground">YouTube 업로드 일시 · {sermonDate}</p>
            )}
          </div>

          <div className="border-t border-border bg-muted/25 px-5 py-5 md:px-8">
            <a
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              data-analytics-id="sermon_youtube_watch"
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

        {hasTranscript && transcript ? (
          <section
            className="mt-6 border border-border bg-card"
            aria-labelledby="sermon-transcript-title"
          >
            <div className="px-5 pt-5 md:px-8 md:pt-6">
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="sermon-transcript-title"
                  className="text-base font-semibold text-foreground"
                >
                  영상 내용을 글로 읽기
                </h2>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {sermon?.transcriptStatus === 'reviewed'
                    ? '검수 완료 전사본'
                    : `자동 전사본${transcriptLength ? ` · 약 ${transcriptLength}` : ''}`}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {transcriptPreview}
              </p>
            </div>
            <details className="group" data-analytics-id="sermon_transcript">
              <summary className="mt-5 cursor-pointer list-none border-t border-border px-5 py-4 text-foreground md:px-8">
                <span className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-sm font-medium text-primary">전체 전사 보기</span>
                  <span className="text-sm text-muted-foreground group-open:hidden">계속 읽기</span>
                  <span className="hidden text-sm text-muted-foreground group-open:inline">
                    접기
                  </span>
                </span>
              </summary>
              <div className="border-t border-border px-5 py-6 md:px-8">
                {sermon?.transcriptStatus !== 'reviewed' ? (
                  <p className="mb-5 rounded-md bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
                    이 내용은 음성을 자동으로 전사한 참고용 텍스트입니다. 일부 표현·고유명사·성경
                    장절에 오류가 있을 수 있으니, 정확한 내용은 영상으로 확인해 주세요.
                  </p>
                ) : null}
                <div className="whitespace-pre-wrap break-words text-[15px] leading-8 text-foreground">
                  {transcript}
                </div>
              </div>
            </details>
          </section>
        ) : null}

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
    alternates: canonicalAlternates(`/sermon/${videoId}`),
    title: sermon?.title ? `${sermon.title} | 사랑하는교회` : '설교영상 | 사랑하는교회',
    description:
      sermon?.publicTranscript && sermon.transcriptStatus !== 'unavailable'
        ? `${sermon.title} 설교 자동 전사본. ${createTranscriptExcerpt(sermon.publicTranscript)}`
        : '사랑하는교회 설교 말씀',
  }
}

function createTranscriptExcerpt(transcript: string) {
  const normalized = transcript.replace(/\s+/g, ' ').trim()
  if (normalized.length <= 140) return normalized
  return `${normalized.slice(0, 137).trimEnd()}...`
}

function createTranscriptPreview(transcript: string) {
  const normalized = transcript
    .replace(/\[\d{2}:\d{2}(?::\d{2})?\]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (normalized.length <= 360) return normalized
  return `${normalized.slice(0, 357).trimEnd()}...`
}

function formatTranscriptLength(transcript: string) {
  const timestamps = [...transcript.matchAll(/\[(\d{2}):(\d{2})(?::(\d{2}))?\]/g)]
  const lastTimestamp = timestamps.at(-1)
  if (!lastTimestamp) return null

  const hours = Number(lastTimestamp[1])
  const minutes = Number(lastTimestamp[2])
  const seconds = Number(lastTimestamp[3] ?? 0)
  const totalMinutes = Math.max(1, Math.ceil((hours * 3600 + minutes * 60 + seconds) / 60))
  return `${totalMinutes}분`
}

/**
 * 제목/날짜 메타데이터 조회: sermons 컬렉션 → YouTube RSS 순으로 찾는다.
 * 어느 쪽에도 없으면 null — 페이지는 임베드 플레이어만으로도 동작한다.
 */
const querySermonByVideoId = cache(
  async (
    videoId: string,
  ): Promise<{
    publishedAt?: string | null
    publicTranscript?: string | null
    title: string
    transcriptStatus?: 'unavailable' | 'automatic' | 'reviewed' | null
  } | null> => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'sermons',
        limit: 1,
        select: {
          publicTranscript: true,
          sermonDate: true,
          title: true,
          transcriptStatus: true,
        },
        where: {
          status: { equals: 'published' },
          youtubeId: { equals: videoId },
        },
      })
      const doc = result.docs[0]
      if (doc?.title) {
        return {
          publishedAt: doc.sermonDate,
          publicTranscript: doc.publicTranscript,
          title: doc.title,
          transcriptStatus: doc.transcriptStatus,
        }
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
