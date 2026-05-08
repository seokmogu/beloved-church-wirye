import Image from 'next/image'
import type { YouTubeVideo } from '@/lib/youtube'

interface Props {
  channelUrl?: string | null
  description?: string | null
  eyebrow?: string | null
  title?: string | null
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

export function YouTubeSection({ channelUrl, description, eyebrow, title, videos }: Props) {
  if (videos.length === 0) return null
  const [featured, ...rest] = videos

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-secondary">{eyebrow ?? 'Sermon'}</p>
            <h2 className="text-3xl font-bold text-foreground md:text-5xl">{title ?? '최신 설교'}</h2>
            {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 md:block"
            >
              YouTube 채널 &rarr;
            </a>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {featured && (
            <a
              href={`https://www.youtube.com/watch?v=${featured.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-lg border border-border bg-card shadow-[0_20px_70px_rgba(20,42,33,0.1)] transition-all duration-300 hover:border-primary/25"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={featured.thumbnail}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.64))]" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="mb-3 inline-flex rounded-md bg-secondary px-3 py-1 text-xs font-bold text-primary">
                    최근 설교
                  </span>
                  <h3 className="max-w-2xl text-xl font-bold leading-tight text-white md:text-2xl">{featured.title}</h3>
                  <time className="mt-2 block text-sm text-white/72" dateTime={featured.publishedAt}>
                    {formatDate(featured.publishedAt)}
                  </time>
                </div>
                <div className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg transition-transform group-hover:scale-105">
                  <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </a>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 3).map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-[128px_minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/25 hover:bg-primary/5 sm:grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)]"
              >
                <div className="relative min-h-[112px] overflow-hidden sm:aspect-video lg:aspect-auto lg:h-full">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 128px, 280px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary">
                      <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {video.title}
                  </h3>
                  <time className="mt-2 block text-sm text-muted-foreground" dateTime={video.publishedAt}>
                    {formatDate(video.publishedAt)}
                  </time>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center md:hidden">
          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary transition-colors hover:text-primary-light"
            >
              YouTube 채널 &rarr;
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
