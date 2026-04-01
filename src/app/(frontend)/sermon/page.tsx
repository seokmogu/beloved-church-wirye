import type { Metadata } from 'next'
import { fetchLatestVideos } from '@/lib/youtube'
import Image from 'next/image'

export const metadata: Metadata = {
  title: '설교 | 사랑하는교회',
  description: '사랑하는교회의 설교 말씀을 들어보세요.',
}

export const revalidate = 600 // Revalidate every 10 minutes

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function SermonPage() {
  // Fetch latest sermon videos from YouTube
  const videos = await fetchLatestVideos(12) // Get 12 latest videos

  return (
    <article className="pt-16 pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <div className="max-w-3xl">
            <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-3">
              Sermon
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              설교
            </h1>
            <p className="text-lg text-muted-foreground">
              하나님의 말씀을 나눕니다.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Sermon Section */}
      {videos.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                최신 설교
              </h2>
              <p className="text-muted-foreground">
                가장 최근 설교 말씀을 확인하세요
              </p>
            </div>

            {/* Featured Video (First/Latest) */}
            <div className="mb-16">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted mb-6">
                <iframe
                  src={`https://www.youtube.com/embed/${videos[0].id}`}
                  title={videos[0].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <div className="max-w-3xl">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {videos[0].title}
                </h3>
                <time
                  className="text-sm text-muted-foreground"
                  dateTime={videos[0].publishedAt}
                >
                  {formatDate(videos[0].publishedAt)}
                </time>
              </div>
            </div>

            {/* Previous Sermons Grid */}
            {videos.length > 1 && (
              <>
                <div className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    이전 설교
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.slice(1).map((video) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <svg
                              className="w-6 h-6 text-primary ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {video.title}
                        </h3>
                        <time
                          className="text-sm text-muted-foreground"
                          dateTime={video.publishedAt}
                        >
                          {formatDate(video.publishedAt)}
                        </time>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* YouTube Channel Link */}
            <div className="mt-12 text-center">
              <a
                href="https://www.youtube.com/@BelovedChurchWirye"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube 채널에서 더 많은 설교 보기
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {videos.length === 0 && (
        <section className="py-16">
          <div className="container">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                설교 영상이 없습니다
              </h3>
              <p className="text-muted-foreground mb-6">
                YouTube 채널에서 최신 설교를 확인해보세요.
              </p>
              <a
                href="https://www.youtube.com/@BelovedChurchWirye"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                YouTube 채널 방문하기 &rarr;
              </a>
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
