import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { HeroSection } from '@/components/home/HeroSection'
import { ChurchIntroSection } from '@/components/home/ChurchIntroSection'
import { AnnouncementsSection } from '@/components/home/AnnouncementsSection'
import type { AnnouncementItem } from '@/components/home/AnnouncementsSection'
import { YouTubeSection } from '@/components/home/YouTubeSection'
import { InstagramSection } from '@/components/home/InstagramSection'
import { KakaoMapSection } from '@/components/home/KakaoMapSection'
import { fetchLatestVideos } from '@/lib/youtube'

export const metadata = {
  title: '사랑하는교회 | Beloved Church Wirye',
  description: '위례에서 하나님의 사랑을 나누는 공동체, 사랑하는교회입니다.',
}

export const revalidate = 600 // Revalidate every 10 minutes

export default async function HomePage() {
  // Fetch announcements and YouTube videos in parallel
  let announcements: AnnouncementItem[] = []
  const [announcementsResult, videos] = await Promise.all([
    getPayload({ config: configPromise }).then((payload) =>
      payload.find({
        collection: 'announcements',
        limit: 3,
        sort: '-publishedAt',
      }),
    ).catch((error) => {
      console.error('Failed to fetch announcements:', error)
      return null
    }),
    fetchLatestVideos(4),
  ])

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
      <KakaoMapSection />
    </main>
  )
}
