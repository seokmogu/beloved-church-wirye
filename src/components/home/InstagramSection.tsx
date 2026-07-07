import { FormattedText } from '@/components/FormattedText'

type InstagramPost = {
  postId?: string | null
  type?: 'p' | 'reel' | null
}

type Props = {
  description?: string | null
  displayCount?: number | null
  eyebrow?: string | null
  handle?: string | null
  posts?: InstagramPost[] | null
  title?: string | null
  url?: string | null
}

/**
 * 게시물을 인스타그램 공식 임베드(iframe)로 렌더한다.
 * API 토큰/썸네일 관리 없이 게시물 ID만으로 항상 최신 내용이 보인다.
 * 노출 순서는 관리자에서 정한 배열 순서 그대로, 개수는 displayCount로 제한한다.
 */
export function InstagramSection({
  description,
  displayCount,
  eyebrow,
  handle,
  posts,
  title,
  url,
}: Props) {
  const visiblePosts = (posts ?? [])
    .filter((post) => post?.postId)
    .slice(0, displayCount && displayCount > 0 ? displayCount : undefined)
  if (visiblePosts.length === 0) return null
  const accountUrl = url ?? 'https://www.instagram.com/'

  return (
    <section className="church-dark-section py-14 text-white md:py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold uppercase text-secondary">
              {eyebrow ?? 'Instagram'}
            </p>
            <h2 className="church-section-heading font-bold">{title ?? '인스타그램'}</h2>
            <FormattedText
              className="church-body-copy mt-4 max-w-2xl space-y-3 leading-relaxed text-white/72"
              headingClassName="text-xl font-bold leading-snug text-white"
              linkClassName="font-semibold text-secondary underline underline-offset-4"
            >
              {description ?? '사랑하는교회의 일상과 소식을 만나보세요'}
            </FormattedText>
          </div>
          {accountUrl && (
            <a
              href={accountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-full shrink-0 rounded-md border border-white/18 px-4 py-2 text-sm font-semibold text-white/80 transition-colors [overflow-wrap:anywhere] hover:bg-white/10 hover:text-white"
            >
              {handle ?? 'Instagram'} &rarr;
            </a>
          )}
        </div>

        {/* 데스크탑: 4열 그리드 / 모바일·태블릿: 가로 스와이프 캐럴셀(scroll-snap) —
            게시물이 많아도 세로로 길어지지 않는다 */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {visiblePosts.map((post) => {
            const kind = post.type === 'reel' ? 'reel' : 'p'

            return (
              <div
                key={post.postId}
                className="relative aspect-[4/5] w-[78%] shrink-0 snap-center overflow-hidden rounded-lg border border-white/10 bg-black/20 sm:w-[46%] lg:w-full lg:shrink"
              >
                <iframe
                  src={`https://www.instagram.com/${kind}/${post.postId}/embed/`}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  title={`Instagram ${kind === 'reel' ? 'Reel' : 'Post'} ${post.postId}`}
                />
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-center text-xs text-white/40 lg:hidden">
          옆으로 넘겨서 더 보기 &rarr;
        </p>
      </div>
    </section>
  )
}

