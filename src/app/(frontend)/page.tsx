import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { HeroSection } from '@/components/home/HeroSection'
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
  // Fetch announcements from Payload CMS
  let announcements: AnnouncementItem[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'announcements',
      limit: 3,
      sort: '-publishedAt',
    })
    announcements = result.docs.map((doc) => ({
      id: String(doc.id),
      title: doc.title as string,
      publishedAt: doc.publishedAt as string,
      isPinned: doc.isPinned as boolean | null,
    }))
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
  }

  // Fetch YouTube videos
  const videos = await fetchLatestVideos(4)

  return (
    <main>
      <HeroSection />
      <AnnouncementsSection announcements={announcements} />
      <YouTubeSection videos={videos} />
      <InstagramSection />
      <KakaoMapSection />
    </main>
  )
}
