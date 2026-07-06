import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Media } from '@/payload-types'

type Args = {
  params: Promise<{
    id?: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  })
}

export default async function BulletinDetailPage({ params: paramsPromise }: Args) {
  const { id = '' } = await paramsPromise
  const bulletin = await queryBulletinByID(id)

  if (!bulletin) return notFound()

  const title = bulletin.title || '주보'
  const bulletinDate = bulletin.date ? formatDate(bulletin.date) : '날짜 미정'
  const file = bulletin.file as Media | null
  const fileUrl = file?.url ?? null
  const isPdf = file?.mimeType === 'application/pdf'
  const images = (Array.isArray(bulletin.images) ? bulletin.images : []).filter(
    (row: any) => row?.image && typeof row.image === 'object' && row.image.url,
  )

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container max-w-4xl py-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            Weekly Bulletin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">주보</h1>
        </div>
      </section>

      <div className="container max-w-4xl py-8 md:py-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">주보 상세</p>
          <Link
            href="/bulletins"
            className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
          >
            목록으로
          </Link>
        </div>

        <article className="overflow-hidden border-y-2 border-y-primary bg-card">
          <header>
            <div className="border-b border-border px-5 py-6 md:px-8">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-sm border border-border px-2 py-1">주보</span>
                <span className="rounded-sm border border-border px-2 py-1">{bulletinDate}</span>
                {isPdf && <span className="rounded-sm border border-border px-2 py-1">PDF</span>}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                {title}
              </h2>
              {bulletin.description && (
                <p className="mt-3 text-sm text-muted-foreground">{bulletin.description}</p>
              )}
            </div>
          </header>

          <div className="px-5 py-8 md:px-8 md:py-10">
            {images.length > 0 ? (
              <div className="grid gap-4">
                {images.map((row: any, index: number) => (
                  <figure
                    key={row.id ?? index}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.image.url}
                      alt={row.caption || `${title} ${index + 1}면`}
                      className="w-full object-contain"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    {row.caption && (
                      <figcaption className="px-3 py-2 text-sm text-muted-foreground">
                        {row.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {fileUrl
                  ? '이 주보는 첨부 파일로 제공됩니다. 아래 버튼으로 열어보세요.'
                  : '주보 내용이 아직 등록되지 않았습니다.'}
              </p>
            )}
          </div>

          {fileUrl && (
            <div className="border-t border-border bg-muted/25 px-5 py-5 md:px-8">
              <dl className="grid gap-3 text-sm sm:grid-cols-[96px_1fr]">
                <dt className="font-medium text-foreground">원본 파일</dt>
                <dd>
                  <a
                    className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light"
                    href={fileUrl}
                    rel="noreferrer"
                    target="_blank"
                    download={isPdf}
                  >
                    {isPdf ? 'PDF 다운로드' : '원본 보기'}
                  </a>
                </dd>
              </dl>
            </div>
          )}
        </article>

        <div className="mt-6 flex justify-center">
          <Link
            href="/bulletins"
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
  const bulletin = await queryBulletinByID(id)

  return {
    title: bulletin?.title ? `${bulletin.title} | 사랑하는교회` : '주보 | 사랑하는교회',
    description: '사랑하는교회 주보',
  }
}

const queryBulletinByID = cache(async (id: string) => {
  if (!id) return null

  try {
    const payload = await getPayload({ config: configPromise })
    const bulletin = await payload.findByID({
      collection: 'bulletins',
      id,
    })
    // 비공개 주보는 상세 URL로도 노출하지 않는다
    if (!bulletin?.isPublic) return null
    return bulletin
  } catch {
    return null
  }
})
