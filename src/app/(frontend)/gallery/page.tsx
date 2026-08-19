import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import { cache } from 'react'

import { EmptyState } from '@/components/EmptyState'
import { PageHero } from '@/components/PageHero'
import { GalleryCollectionStructuredData } from '@/components/StructuredData/GalleryStructuredData'
import type { GalleryAlbum, GalleryMedia } from '@/payload-types'
import { canonicalAlternates } from '@/utilities/canonical'
import { getServerSideURL } from '@/utilities/getURL'

import { galleryImageURL } from './galleryMediaImage'

export const revalidate = 300
export const dynamic = 'force-dynamic'

const title = '사진첩 | 사랑하는교회'
const description = '사랑하는교회 위례의 예배와 행사 순간을 모은 사진첩입니다.'

export async function generateMetadata(): Promise<Metadata> {
  const { albums } = await findPublicGalleryAlbums()
  const cover = albums
    .map((album) => galleryImageURL(coverMedia(album), ['card', 'thumbnail']))
    .find(Boolean)

  return {
    alternates: canonicalAlternates('/gallery'),
    description,
    openGraph: {
      description,
      images: [{ alt: '사랑하는교회 위례 사진첩', url: cover || '/logo-beloved.png' }],
      locale: 'ko_KR',
      siteName: '사랑하는교회 Beloved Church Wirye',
      title,
      type: 'website',
      url: '/gallery',
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [cover || '/logo-beloved.png'],
      title,
    },
  }
}

export default async function GalleryPage() {
  const result = await findPublicGalleryAlbums()
  const albums = result.albums
  const hasError = result.hasError
  const siteURL = getServerSideURL().replace(/\/$/, '')

  return (
    <main className="min-h-screen bg-[#fbfaf6]">
      <PageHero
        label="PHOTO JOURNAL"
        subtitle="사랑하는교회 위례의 예배와 함께한 날들을 사진으로 나눕니다"
        title="사진첩"
      />
      {albums.length ? (
        <GalleryCollectionStructuredData
          albums={albums.map((album) => {
            const cover = coverMedia(album)
            const coverURL = galleryImageURL(cover, ['display', 'card', 'thumbnail'])
            return {
              description: album.description,
              images: coverURL
                ? [{ alt: album.title, contentUrl: absoluteURL(coverURL, siteURL) }]
                : [],
              name: album.title,
              url: `${siteURL}/gallery/${album.id}`,
            }
          })}
          description={description}
          url={`${siteURL}/gallery`}
        />
      ) : null}

      <div className="container py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-3 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-primary">OUR MOMENTS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              함께한 순간들
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            앨범을 열면 사진을 한 장씩 크게 볼 수 있습니다.
          </p>
        </div>

        {hasError ? (
          <EmptyState
            ctaLink="/"
            ctaText="홈으로 돌아가기"
            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
            icon="error"
            title="사진첩을 불러올 수 없습니다"
          />
        ) : albums.length === 0 ? (
          <EmptyState
            ctaLink="/worship"
            ctaText="예배안내 보기"
            description="사랑하는교회의 다음 이야기를 사진으로 전해드릴 예정입니다."
            icon="announcement"
            title="공개된 사진첩이 없습니다"
          />
        ) : (
          <section className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
            {albums.map((album) => {
              const media = coverMedia(album)
              const src = galleryImageURL(media, ['card', 'thumbnail'])
              return (
                <Link className="group block min-w-0" href={`/gallery/${album.id}`} key={album.id}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-[0_12px_30px_-22px_rgba(22,35,25,0.45)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_34px_-22px_rgba(22,35,25,0.6)]">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- R2 serves the pre-generated card size without an image-optimizer hop.
                      <img
                        alt={album.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                        loading="lazy"
                        src={src}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        사진 준비 중
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                      {album.images?.length || 0}장
                    </span>
                  </div>
                  <div className="px-0.5 pt-3">
                    <p className="text-xs font-semibold tracking-[0.1em] text-primary">
                      {formatDate(album.eventDate)}
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-lg">
                      {album.title}
                    </h2>
                    {album.description ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {album.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}

const findPublicGalleryAlbums = cache(
  async (): Promise<{ albums: GalleryAlbum[]; hasError: boolean }> => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'gallery-albums',
        depth: 1,
        limit: 60,
        sort: '-eventDate',
        where: { isPublic: { equals: true } },
      })
      return { albums: result.docs, hasError: false }
    } catch (error) {
      console.error('Failed to fetch gallery albums:', error)
      return { albums: [], hasError: true }
    }
  },
)

function coverMedia(album: GalleryAlbum): GalleryMedia | null {
  if (typeof album.coverImage === 'object' && album.coverImage) return album.coverImage
  const first = album.images?.[0]
  return first && typeof first.image === 'object' && first.image ? first.image : null
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '날짜 미정'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '날짜 미정'
  return new Intl.DateTimeFormat('ko-KR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).format(date)
}

function absoluteURL(pathname: string, siteURL: string): string {
  return new URL(pathname, `${siteURL}/`).toString()
}
