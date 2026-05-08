import Link from 'next/link'

export interface AnnouncementItem {
  id: string
  title: string
  publishedAt: string
  isPinned?: boolean | null
}

interface Props {
  announcements: AnnouncementItem[]
  description?: string | null
  eyebrow?: string | null
  title?: string | null
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function AnnouncementsSection({ announcements, description, eyebrow, title }: Props) {
  if (announcements.length === 0) return null

  return (
    <section className="church-section-surface py-20 md:py-24">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-secondary">
              {eyebrow ?? 'Notice'}
            </p>
            <h2 className="text-3xl font-bold text-foreground md:text-5xl">
              {title ?? '교회 소식'}
            </h2>
            {description && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Link
            href="/announcements"
            className="hidden rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 md:block"
          >
            전체보기 &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {announcements.map((item) => (
            <Link
              key={item.id}
              href={`/announcements/${item.id}`}
              className="group block rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_60px_rgba(20,42,33,0.08)]"
            >
              <article>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  {item.isPinned && (
                    <span className="inline-flex shrink-0 items-center rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                      고정
                    </span>
                  )}
                </div>
                <time className="text-sm text-muted-foreground" dateTime={item.publishedAt}>
                  {formatDate(item.publishedAt)}
                </time>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/announcements"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-light"
          >
            전체보기 &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
