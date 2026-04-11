import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import RichText from '@/components/RichText'
import type { Announcement } from '@/payload-types'

export const revalidate = 300
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    id: string
  }>
}

export default async function AnnouncementDetailPage({ params: paramsPromise }: Args) {
  const { id } = await paramsPromise
  const numericId = Number(id)

  if (isNaN(numericId)) {
    notFound()
  }

  let announcement: Announcement | null = null

  try {
    const payload = await getPayload({ config: configPromise })
    announcement = await payload.findByID({
      collection: 'announcements',
      id: numericId,
    })
  } catch {
    notFound()
  }

  if (!announcement) {
    notFound()
  }

  const publishedDate = new Date(announcement.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-12 max-w-3xl">
        {/* Back button */}
        <Link
          href="/announcements"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          공지사항 목록
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            {announcement.isPinned && (
              <span className="inline-flex items-center bg-secondary/15 text-secondary text-xs font-semibold px-2.5 py-1 rounded-full">
                고정
              </span>
            )}
            <time className="text-sm text-muted-foreground" dateTime={announcement.publishedAt}>
              {publishedDate}
            </time>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {announcement.title}
          </h1>
        </header>

        {/* Content */}
        {announcement.content && (
          <div className="mb-10">
            <RichText
              className="max-w-none"
              data={announcement.content}
              enableGutter={false}
            />
          </div>
        )}

        {/* Google Drive link */}
        {announcement.googleDriveLink && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">첨부 파일</p>
            <a
              href={announcement.googleDriveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Google Drive에서 보기
            </a>
          </div>
        )}

        {/* Bottom back link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { id } = await paramsPromise
  const numericId = Number(id)

  if (isNaN(numericId)) {
    return { title: '공지사항 | 사랑하는교회' }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const announcement = await payload.findByID({
      collection: 'announcements',
      id: numericId,
    })

    return {
      title: `${announcement.title} | 사랑하는교회`,
      description: announcement.title,
    }
  } catch {
    return { title: '공지사항 | 사랑하는교회' }
  }
}
