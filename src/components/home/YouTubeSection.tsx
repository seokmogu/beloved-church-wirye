import Image from 'next/image'
import type { YouTubeVideo } from '@/lib/youtube'

interface Props {
  videos: YouTubeVideo[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function YouTubeSection({ videos }: Props) {
  if (videos.length === 0) return null

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-2">
              Sermon
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              최신 설교
            </h2>
          </div>
          <a
            href="https://www.youtube.com/@BelovedChurchWirye"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors hidden md:block"
          >
            YouTube 채널 &rarr;
          </a>
        </div>

        {/* Video carousel (mobile) / grid (desktop) */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 shrink-0 w-[280px] md:w-auto snap-start"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 50vw"
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
                <time className="text-sm text-muted-foreground" dateTime={video.publishedAt}>
                  {formatDate(video.publishedAt)}
                </time>
              </div>
            </a>
          ))}
        </div>

        {/* Mobile link */}
        <div className="mt-8 text-center md:hidden">
          <a
            href="https://www.youtube.com/@BelovedChurchWirye"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            YouTube 채널 &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
