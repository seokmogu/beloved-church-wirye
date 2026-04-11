import Link from 'next/link'

export interface AnnouncementItem {
  id: string
  title: string
  publishedAt: string
  isPinned?: boolean | null
}

interface Props {
  announcements: AnnouncementItem[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function AnnouncementsSection({ announcements }: Props) {
  if (announcements.length === 0) return null

  return (
    <section className="py-20 bg-background">
      <div className="container">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-2">
              Notice
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              교회 소식
            </h2>
          </div>
          <Link
            href="/announcements"
            className="text-sm text-muted-foreground hover:text-primary transition-colors hidden md:block"
          >
            전체보기 &rarr;
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((item) => (
            <Link
              key={item.id}
              href={`/announcements/${item.id}`}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 block"
            >
              <article>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.isPinned && (
                  <span className="shrink-0 inline-flex items-center bg-secondary/10 text-secondary text-xs font-medium px-2.5 py-1 rounded-full">
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

        {/* Mobile link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/announcements"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            전체보기 &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
