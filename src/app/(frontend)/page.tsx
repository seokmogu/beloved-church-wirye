import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { HeroSection } from '@/components/home/HeroSection'
import { ChurchIntroSection } from '@/components/home/ChurchIntroSection'
import { AnnouncementsSection } from '@/components/home/AnnouncementsSection'
import type { AnnouncementItem } from '@/components/home/AnnouncementsSection'
import { YouTubeSection } from '@/components/home/YouTubeSection'
import { InstagramSection } from '@/components/home/InstagramSection'
import { NaverMapSectionServer } from '@/components/home/NaverMapSection.server'
import { fetchLatestVideos } from '@/lib/youtube'
import type { YouTubeVideo } from '@/lib/youtube'

export const metadata = {
  title: '사랑하는교회 | Beloved Church Wirye',
  description: '위례 신도시 사랑하는교회 | Like Christ — 우리는 사랑으로 교회를 세웁니다. 청·장년예배 주일 낮 12시, 금요기도회 금요일 밤 8시',
}

export const revalidate = 600 // Revalidate every 10 minutes

export default async function HomePage() {
  // Fetch announcements and YouTube videos in parallel
  let announcements: AnnouncementItem[] = []
  const payload = await getPayload({ config: configPromise })
  const [announcementsResult, sermonsResult, rssVideos] = await Promise.all([
    payload.find({
      collection: 'announcements',
      limit: 3,
      sort: '-publishedAt',
    }).catch((error) => {
      console.error('Failed to fetch announcements:', error)
      return null
    }),
    payload.find({
      collection: 'sermons',
      where: { status: { equals: 'published' } },
      limit: 8,
      sort: '-sermonDate',
    }).catch((error) => {
      console.error('Failed to fetch sermons:', error)
      return null
    }),
    fetchLatestVideos(8),
  ])

  // Merge RSS + CMS: CMS entries take priority (richer metadata)
  const cmsVideos: YouTubeVideo[] = (sermonsResult?.docs ?? []).map((sermon) => ({
    id: (sermon.youtubeId as string) ?? '',
    title: sermon.title,
    thumbnail: (sermon.thumbnail as string) ?? `https://i.ytimg.com/vi/${sermon.youtubeId}/hqdefault.jpg`,
    publishedAt: sermon.sermonDate,
  }))
  const cmsIds = new Set(cmsVideos.map((v) => v.id))
  const mergedVideos = [
    ...cmsVideos,
    ...rssVideos.filter((v) => !cmsIds.has(v.id)),
  ]
  const videos = mergedVideos
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4)

  if (announcementsResult) {
    announcements = announcementsResult.docs.map((doc) => ({
      id: String(doc.id),
      title: doc.title as string,
      publishedAt: doc.publishedAt as string,
      isPinned: doc.isPinned as boolean | null,
    }))
  }

  return (
    <main>
      <HeroSection />
      <ChurchIntroSection />
      <AnnouncementsSection announcements={announcements} />
      <YouTubeSection videos={videos} />
      <InstagramSection />
      <NaverMapSectionServer />
    </main>
  )
}
