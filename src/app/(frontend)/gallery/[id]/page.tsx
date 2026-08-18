import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { FormattedText } from '@/components/FormattedText'
import { PageHero } from '@/components/PageHero'
import type { GalleryAlbum, GalleryMedia } from '@/payload-types'
import { canonicalAlternates } from '@/utilities/canonical'

import { GalleryPhotoGrid, type GalleryPhoto } from '../GalleryPhotoGrid'
import { galleryImageURL } from '../galleryMediaImage'

type PageProps = {
  params: Promise<{ id: string }>
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const album = await findGalleryAlbum((await params).id)
  return album
    ? {
        alternates: canonicalAlternates(`/gallery/${album.id}`),
        description: album.description || '사랑하는교회 위례 행사 사진 앨범',
        title: `${album.title} | 행사갤러리 | 사랑하는교회`,
      }
    : { title: '행사갤러리 | 사랑하는교회' }
}

export default async function GalleryAlbumPage({ params }: PageProps) {
  const album = await findGalleryAlbum((await params).id)
  if (!album) notFound()
  const images = toGalleryPhotos(album)

  return (
    <main className="min-h-screen bg-[#fbfaf6]">
      <PageHero label="PHOTO JOURNAL" subtitle={formatDate(album.eventDate)} title={album.title} />
      <div className="container max-w-6xl py-8 sm:py-12">
        <Link
          className="mb-7 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          href="/gallery"
        >
          행사갤러리 목록으로
        </Link>
        {album.description ? (
          <FormattedText className="mb-8 max-w-3xl text-[15px] leading-7 text-muted-foreground">
            {album.description}
          </FormattedText>
        ) : null}
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.13em] text-primary">PHOTO ALBUM</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">사진 {images.length}장</h2>
          </div>
          <p className="text-sm text-muted-foreground">사진을 누르면 크게 볼 수 있습니다.</p>
        </div>
        <GalleryPhotoGrid images={images} title={album.title} />
      </div>
    </main>
  )
}

async function findGalleryAlbum(id: string): Promise<GalleryAlbum | null> {
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) return null

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'gallery-albums',
      depth: 1,
      limit: 1,
      where: {
        and: [{ id: { equals: numericId } }, { isPublic: { equals: true } }],
      },
    })
    return result.docs[0] || null
  } catch (error) {
    console.error('Failed to fetch gallery album:', error)
    return null
  }
}

function toGalleryPhotos(album: GalleryAlbum): GalleryPhoto[] {
  return (album.images || []).flatMap((item, index) => {
    const media = resolveMedia(item)
    const cardSrc = galleryImageURL(media, ['card', 'thumbnail'])
    const displaySrc = galleryImageURL(media, ['display', 'card', 'thumbnail'])
    if (!cardSrc || !displaySrc) return []

    return [
      {
        alt: media?.alt || item.caption || `${album.title} 사진 ${index + 1}`,
        caption: item.caption,
        cardSrc,
        displaySrc,
      },
    ]
  })
}

function resolveMedia(item: NonNullable<GalleryAlbum['images']>[number]): GalleryMedia | null {
  return typeof item.image === 'object' && item.image ? item.image : null
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '날짜 미정'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '날짜 미정'
  return new Intl.DateTimeFormat('ko-KR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).format(date)
}
