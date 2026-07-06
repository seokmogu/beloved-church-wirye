import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import RichText from '@/components/RichText'

type Args = {
  params: Promise<{
    id?: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

// CMS에 스킴 없이 저장된 링크(drive.google.com/... 등)가 상대경로로 해석되지 않게 보정
function withHttps(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  })
}

export default async function AnnouncementDetailPage({ params: paramsPromise }: Args) {
  const { id = '' } = await paramsPromise
  const announcement = await queryAnnouncementByID(id)

  if (!announcement) return notFound()

  const title = announcement.title || '교회로그'
  const publishedDate = announcement.publishedAt
    ? formatDate(announcement.publishedAt)
    : '날짜 미정'
  const hasAttachment = Boolean(announcement.googleDriveLink)

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container max-w-4xl py-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            Notice Board
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">교회로그</h1>
        </div>
      </section>

      <div className="container max-w-4xl py-8 md:py-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">교회로그 상세</p>
          <Link
            href="/announcements"
            className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
          >
            목록으로
          </Link>
        </div>

        <article className="overflow-hidden border-y-2 border-y-primary bg-card">
          <header>
            <div className="border-b border-border px-5 py-6 md:px-8">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-sm border border-border px-2 py-1">교회로그</span>
                {announcement.isPinned && (
                  <span className="rounded-sm bg-primary px-2 py-1 font-semibold text-primary-foreground">
                    고정
                  </span>
                )}
                {hasAttachment && (
                  <span className="rounded-sm border border-border px-2 py-1">첨부 자료</span>
                )}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                {title}
              </h2>
            </div>

            {/* 목록의 '번호'는 정렬 순번이라 DB id와 달라 혼동을 준다 — 상세에서는 번호를 표기하지 않는다 */}
            <dl className="grid grid-cols-3 border-b border-border bg-muted/30 text-sm">
              <div className="border-r border-border px-5 py-3 md:px-6">
                <dt className="text-xs font-semibold text-muted-foreground">작성일</dt>
                <dd className="mt-1 text-foreground">{publishedDate}</dd>
              </div>
              <div className="border-r border-border px-5 py-3 md:px-6">
                <dt className="text-xs font-semibold text-muted-foreground">구분</dt>
                <dd className="mt-1 text-foreground">
                  {announcement.isPinned ? '고정' : '일반'}
                </dd>
              </div>
              <div className="px-5 py-3 md:px-6">
                <dt className="text-xs font-semibold text-muted-foreground">첨부</dt>
                <dd className="mt-1 text-foreground">{hasAttachment ? '있음' : '없음'}</dd>
              </div>
            </dl>
          </header>

          <div className="min-h-64 px-5 py-8 md:px-8 md:py-10">
            {announcement.content ? (
              <RichText data={announcement.content} enableGutter={false} />
            ) : (
              <p className="text-muted-foreground">본문이 아직 입력되지 않았습니다.</p>
            )}

            {Array.isArray(announcement.images) && announcement.images.length > 0 && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {announcement.images.map((row, index) => {
                  const img = row?.image
                  const url = img && typeof img === 'object' ? img.url : null
                  if (!url) return null
                  return (
                    <figure
                      key={row.id ?? index}
                      className="overflow-hidden rounded-lg border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={row.caption || title}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                      {row.caption && (
                        <figcaption className="px-3 py-2 text-sm text-muted-foreground">
                          {row.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                })}
              </div>
            )}
          </div>

          {announcement.googleDriveLink && (
            <div className="border-t border-border bg-muted/25 px-5 py-5 md:px-8">
              <dl className="grid gap-3 text-sm sm:grid-cols-[96px_1fr]">
                <dt className="font-medium text-foreground">첨부 자료</dt>
                <dd>
                  <a
                    className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light"
                    href={withHttps(announcement.googleDriveLink)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    구글드라이브 열기
                  </a>
                </dd>
              </dl>
            </div>
          )}
        </article>

        <div className="mt-6 flex justify-center">
          <Link
            href="/announcements"
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
  const { id = '' } = await paramsPromise
  const announcement = await queryAnnouncementByID(id)

  return {
    title: announcement?.title ? `${announcement.title} | 사랑하는교회` : '교회로그 | 사랑하는교회',
    description: '사랑하는교회 교회로그',
  }
}

const queryAnnouncementByID = cache(async (id: string) => {
  if (!id) return null

  try {
    const payload = await getPayload({ config: configPromise })
    return await payload.findByID({
      collection: 'announcements',
      id,
    })
  } catch {
    return null
  }
})
