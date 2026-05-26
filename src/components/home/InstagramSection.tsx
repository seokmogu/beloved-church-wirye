'use client'

import Image from 'next/image'

import type { Media } from '@/payload-types'

type InstagramPost = {
  caption?: string | null
  hashtags?: string | null
  postId?: string | null
  publishedAt?: string | null
  thumbnail?: (number | null) | Media
  thumbnailUrl?: string | null
  type?: 'p' | 'reel' | null
}

type Props = {
  description?: string | null
  eyebrow?: string | null
  handle?: string | null
  posts?: InstagramPost[] | null
  title?: string | null
  url?: string | null
}

export function InstagramSection({ description, eyebrow, handle, posts, title, url }: Props) {
  const visiblePosts = (posts ?? [])
    .filter((post) => post?.postId)
    .sort((a, b) => compareInstagramPosts(a.publishedAt, b.publishedAt))
  if (visiblePosts.length === 0) return null
  const accountUrl = url ?? 'https://www.instagram.com/'

  return (
    <section className="church-dark-section py-20 text-white md:py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-secondary">
              {eyebrow ?? 'Instagram'}
            </p>
            <h2 className="church-section-heading font-bold">{title ?? '인스타그램'}</h2>
            <p className="church-body-copy mt-4 max-w-2xl leading-relaxed text-white/64">
              {description ?? '사랑하는교회의 일상과 소식을 만나보세요'}
            </p>
          </div>
          {accountUrl && (
            <a
              href={accountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md border border-white/18 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {handle ?? 'Instagram'} &rarr;
            </a>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visiblePosts.map((post, index) => {
            const postUrl = `https://www.instagram.com/${post.type ?? 'p'}/${post.postId}/`
            const thumbnailUrl = getMediaUrl(post.thumbnail) || post.thumbnailUrl
            const displayDate = formatPostDate(post.publishedAt)
            const tags = getDisplayHashtags(post.hashtags, post.caption)
            const summary = getCaptionSummary(post.caption)

            return (
              <a
                key={post.postId}
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:bg-white/[0.09]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-primary/70">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={`${handle ?? 'Instagram'} 게시물 썸네일`}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:44px_44px]" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 p-3">
                  <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/58">
                    <span>{post.type === 'reel' ? 'Reel' : 'Post'}</span>
                    {displayDate ? (
                      <time dateTime={post.publishedAt ?? undefined}>{displayDate}</time>
                    ) : (
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    )}
                  </div>
                  {summary ? (
                    <p className="text-sm font-semibold leading-snug text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [overflow:hidden]">
                      {summary}
                    </p>
                  ) : null}
                  {tags.length > 0 ? (
                    <p className="truncate text-xs font-semibold text-secondary/90">
                      {tags.join(' ')}
                    </p>
                  ) : null}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function compareInstagramPosts(a: string | null | undefined, b: string | null | undefined) {
  const aTime = a ? Date.parse(a) : 0
  const bTime = b ? Date.parse(b) : 0
  return bTime - aTime
}

function getCaptionSummary(caption: string | null | undefined): string | null {
  if (!caption) return null

  const text = caption
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .join(' ')
    .replace(/#[^\s#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text || null
}

function getDisplayHashtags(
  hashtags: string | null | undefined,
  caption: string | null | undefined,
) {
  const source = hashtags || caption || ''
  const explicit = source
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith('#'))

  const extracted = source.match(/#[^\s#]+/g) ?? []
  return Array.from(new Set([...explicit, ...extracted])).slice(0, 3)
}

function formatPostDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('ko-KR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Seoul',
  }).format(date)
}
