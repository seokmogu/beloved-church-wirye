import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

import { galleryImageURL } from '@/app/(frontend)/gallery/galleryMediaImage'
import type { GalleryAlbum, GalleryMedia } from '@/payload-types'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const [pages, announcements, bulletins, churchNews, galleryAlbums, sermons, churchVideos] =
      await Promise.all([
        payload.find({
          collection: 'pages',
          overrideAccess: false,
          draft: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          where: {
            _status: {
              equals: 'published',
            },
          },
          select: { slug: true, updatedAt: true },
        }),
        payload.find({
          collection: 'announcements',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          select: { id: true, publishedAt: true, updatedAt: true },
        }),
        payload.find({
          collection: 'bulletins',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          where: { isPublic: { equals: true } },
          select: { id: true, date: true, updatedAt: true },
        }),
        payload.find({
          collection: 'church-news',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          where: { isPublic: { equals: true } },
          select: { id: true, date: true, updatedAt: true },
        }),
        payload.find({
          collection: 'gallery-albums',
          // The query is limited to public albums. Expand their linked media here so
          // the sitemap can advertise only the same protected, public image URLs
          // that the gallery page renders.
          overrideAccess: true,
          depth: 1,
          limit: 1000,
          pagination: false,
          where: { isPublic: { equals: true } },
          select: {
            description: true,
            eventDate: true,
            id: true,
            images: true,
            title: true,
            updatedAt: true,
          },
        }),
        payload.find({
          collection: 'sermons',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          where: { status: { equals: 'published' } },
          select: { youtubeId: true, sermonDate: true, updatedAt: true },
        }),
        payload.find({
          collection: 'church-videos',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          where: { status: { equals: 'published' } },
          select: { id: true, videoDate: true, updatedAt: true },
        }),
      ])

    const dateFallback = new Date().toISOString()

    const staticSitemap = [
      '/',
      '/about',
      '/about/leaders',
      '/sermon',
      '/announcements',
      '/bulletins',
      '/church-news',
      '/gallery',
      '/church-news/videos',
      '/worship',
      '/offering',
    ].map((path) => ({ loc: `${SITE_URL}${path}` }))

    const pageSitemap = pages.docs
      .filter((page) => Boolean(page?.slug))
      .map((page) => ({
        loc: page.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page.slug}`,
        lastmod: page.updatedAt || dateFallback,
      }))

    const announcementSitemap = announcements.docs.map((announcement) => ({
      loc: `${SITE_URL}/announcements/${announcement.id}`,
      lastmod: announcement.updatedAt || announcement.publishedAt || dateFallback,
    }))

    const bulletinSitemap = bulletins.docs.map((bulletin) => ({
      loc: `${SITE_URL}/bulletins/${bulletin.id}`,
      lastmod: bulletin.updatedAt || bulletin.date || dateFallback,
    }))

    const churchNewsSitemap = churchNews.docs.map((news) => ({
      loc: `${SITE_URL}/church-news/${news.id}`,
      lastmod: news.updatedAt || news.date || dateFallback,
    }))

    const gallerySitemap = galleryAlbums.docs.map((album) => ({
      images: gallerySitemapImages(album, SITE_URL),
      loc: `${SITE_URL}/gallery/${album.id}`,
      lastmod: album.updatedAt || album.eventDate || dateFallback,
    }))

    const sermonSitemap = sermons.docs
      .filter((sermon) => Boolean(sermon.youtubeId))
      .map((sermon) => ({
        loc: `${SITE_URL}/sermon/${sermon.youtubeId}`,
        lastmod: sermon.updatedAt || sermon.sermonDate || dateFallback,
      }))

    const churchVideoSitemap = churchVideos.docs.map((video) => ({
      loc: `${SITE_URL}/church-news/videos/${video.id}`,
      lastmod: video.updatedAt || video.videoDate || dateFallback,
    }))

    return [
      ...staticSitemap,
      ...pageSitemap,
      ...announcementSitemap,
      ...bulletinSitemap,
      ...churchNewsSitemap,
      ...gallerySitemap,
      ...sermonSitemap,
      ...churchVideoSitemap,
    ]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
    revalidate: 300,
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}

function gallerySitemapImages(album: GalleryAlbum, siteURL: string) {
  return (album.images || []).flatMap((item, index) => {
    const media = resolveGalleryMedia(item)
    const source = galleryImageURL(media, ['display', 'card', 'thumbnail'])
    if (!source) return []

    const caption = item.caption || album.description || undefined
    return [
      {
        ...(caption ? { caption } : {}),
        loc: new URL(source, `${siteURL.replace(/\/$/, '')}/`),
        title: item.caption || `${album.title} 사진 ${index + 1}`,
      },
    ]
  })
}

function resolveGalleryMedia(
  item: NonNullable<GalleryAlbum['images']>[number],
): GalleryMedia | null {
  return typeof item.image === 'object' && item.image ? item.image : null
}
