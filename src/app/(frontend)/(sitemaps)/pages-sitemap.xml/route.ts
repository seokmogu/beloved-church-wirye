import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const [pages, announcements, bulletins, churchNews, sermons, churchVideos] = await Promise.all([
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
      '/church-news/videos',
      '/worship',
      '/newcomer',
      '/offering',
    ].map((path) => ({
      loc: `${SITE_URL}${path}`,
      lastmod: dateFallback,
    }))

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
