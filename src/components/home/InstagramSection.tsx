'use client'

type InstagramPost = {
  postId?: string | null
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
  const visiblePosts = (posts ?? []).filter((post) => post?.postId)
  if (visiblePosts.length === 0) return null
  const accountUrl = url ?? 'https://www.instagram.com/'

  return (
    <section className="church-dark-section py-20 text-white md:py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-secondary">{eyebrow ?? 'Instagram'}</p>
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
          {visiblePosts.map(({ postId, type }, index) => {
            const postUrl = `https://www.instagram.com/${type ?? 'p'}/${postId}/`
            return (
            <a
              key={postId}
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative min-h-[320px] overflow-hidden rounded-lg border border-white/10 bg-primary/55 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40"
            >
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:44px_44px]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between text-sm text-white/56">
                  <span>{handle ?? 'Instagram'}</span>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold leading-tight text-white">
                    사랑하는교회의 최근 소식
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/62">
                    Instagram에서 게시물과 릴스를 확인하세요.
                  </p>
                </div>
                <span className="inline-flex text-sm font-semibold text-secondary transition-transform group-hover:translate-x-1">
                  게시물 보기 &rarr;
                </span>
              </div>
            </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
