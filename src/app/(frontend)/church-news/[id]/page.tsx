import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { PageHero } from '@/components/PageHero'
import type { ChurchNew, Media } from '@/payload-types'

import { ChurchNewsGallery, type ChurchNewsGalleryImage } from './ChurchNewsGallery'
import { getChurchNewsImageSource } from '../mediaImage'

type ChurchNewsImage = NonNullable<ChurchNew['images']>[number]

type PageProps = {
  params: Promise<{ id: string }>
}

export const revalidate = 300
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await findChurchNews((await params).id)

  if (!item) {
    return {
      title: '교회소식 | 사랑하는교회',
    }
  }

  return {
    title: `${item.title || '교회소식'} | 사랑하는교회`,
    description: item.description || '사랑하는교회 주간 교회소식',
  }
}

export default async function ChurchNewsDetailPage({ params }: PageProps) {
  const item = await findChurchNews((await params).id)
  if (!item) notFound()
  const galleryImages = toGalleryImages(item)

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="CHURCH NEWS" title={item.title || '교회소식'} subtitle={formatDate(item.date)} />

      <div className="container max-w-5xl py-10">
        <Link
          className="mb-6 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          href="/church-news"
        >
          교회소식 목록으로
        </Link>
        {item.description ? (
          <p className="mx-auto mb-8 max-w-3xl rounded-md border border-border bg-card p-4 text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        <ChurchNewsGallery images={galleryImages} title={item.title || '교회소식'} />
      </div>
    </main>
  )
}

async function findChurchNews(id: string): Promise<ChurchNew | null> {
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) return null

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'church-news',
      depth: 1,
      limit: 1,
      where: {
        and: [{ id: { equals: numericId } }, { isPublic: { equals: true } }],
      },
    })

    return result.docs[0] || null
  } catch (error) {
    console.error('Failed to fetch church news detail:', error)
    return null
  }
}

function resolveMedia(item: ChurchNewsImage): Media | null {
  return typeof item.image === 'object' && item.image ? item.image : null
}

function toGalleryImages(item: ChurchNew): ChurchNewsGalleryImage[] {
  const galleryImages: ChurchNewsGalleryImage[] = []

  for (const [index, image] of (item.images || []).entries()) {
    const media = resolveMedia(image)
    const imageSource = getChurchNewsImageSource(media, ['large', 'medium'])
    if (!imageSource) continue

    galleryImages.push({
      alt: media?.alt || image.caption || `${item.title || '교회소식'} ${index + 1}`,
      caption: image.caption,
      fallbackSrc: imageSource.fallbackSrc,
      height: media?.height || 1350,
      src: imageSource.src,
      width: media?.width || 1080,
    })
  }

  return galleryImages
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
