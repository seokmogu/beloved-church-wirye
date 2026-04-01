import configPromise from '@payload-config'
import { getPayload } from 'payload'

type AnnouncementsBlockProps = {
  limit?: number | null
  showPinnedFirst?: boolean | null
  id?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  })
}

export async function AnnouncementsBlockComponent({
  limit = 10,
  showPinnedFirst = true,
}: AnnouncementsBlockProps) {
  let announcements: any[] = []
  let hasError = false

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'announcements',
      limit: limit ?? 10,
      sort: showPinnedFirst ? '-isPinned,-publishedAt' : '-publishedAt',
    })
    announcements = result.docs
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
    hasError = true
  }

  if (hasError) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>공지사항을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>등록된 공지사항이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
      {announcements.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-4 px-6 py-4 bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start gap-3 min-w-0">
            {item.isPinned && (
              <span className="shrink-0 mt-0.5 inline-flex items-center bg-secondary/15 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">
                고정
              </span>
            )}
            <h3 className="text-sm font-medium text-foreground line-clamp-2">{item.title}</h3>
          </div>
          <time
            className="shrink-0 text-xs text-muted-foreground mt-0.5"
            dateTime={item.publishedAt}
          >
            {formatDate(item.publishedAt)}
          </time>
        </div>
      ))}
    </div>
  )
}
