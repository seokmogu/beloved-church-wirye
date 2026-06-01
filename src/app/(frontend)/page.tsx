import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { AnnouncementsSection } from '@/components/home/AnnouncementsSection'
import type { AnnouncementItem } from '@/components/home/AnnouncementsSection'
import { ChurchIntroSection } from '@/components/home/ChurchIntroSection'
import { HeroSection } from '@/components/home/HeroSection'
import { InstagramSection } from '@/components/home/InstagramSection'
import { NaverMapSectionServer } from '@/components/home/NaverMapSection.server'
import { YouTubeSection } from '@/components/home/YouTubeSection'
import type { SiteSetting } from '@/payload-types'
import { fetchLatestVideos, type YouTubeVideo } from '@/lib/youtube'
import { hasPayloadRuntimeConfig } from '@/utilities/payloadRuntime'

export const metadata = {
  title: '사랑하는교회 | Beloved Church Wirye',
  description: '위례 신도시 사랑하는교회 | Like Christ',
}

export const revalidate = 600

type HomeSection = NonNullable<SiteSetting['homeSections']>[number]
type SectionType = NonNullable<HomeSection['sectionType']>

const defaultSections: HomeSection[] = [
  {
    enabled: true,
    sectionType: 'intro',
    eyebrow: 'ABOUT US',
    title: '그리스도를 본받아 함께 사랑하는 공동체',
  },
  { enabled: true, sectionType: 'announcements', eyebrow: 'NOTICE', title: '교회 소식' },
  { enabled: true, sectionType: 'sermons', eyebrow: 'SERMON', title: '최신 설교' },
  { enabled: true, sectionType: 'instagram', eyebrow: 'INSTAGRAM', title: '인스타그램' },
  { enabled: true, sectionType: 'map', eyebrow: 'LOCATION', title: '오시는 길' },
]

function getSections(settings: SiteSetting | null): HomeSection[] {
  const sections = settings?.homeSections?.filter(
    (section) => section?.enabled !== false && section?.sectionType,
  )
  return sections && sections.length > 0 ? sections : defaultSections
}

function hasSection(sections: HomeSection[], type: SectionType): boolean {
  return sections.some((section) => section.sectionType === type)
}

export default async function HomePage() {
  let settings: SiteSetting | null = null
  let announcements: AnnouncementItem[] = []
  let cmsVideos: YouTubeVideo[] = []

  if (hasPayloadRuntimeConfig()) {
    try {
      const payload = await getPayload({ config: configPromise })
      settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

      const sections = getSections(settings)
      const showAnnouncements = hasSection(sections, 'announcements')
      const showSermons = hasSection(sections, 'sermons')
      const videoCount =
        typeof settings?.youtubeVideoCount === 'number' ? settings.youtubeVideoCount : 4

      const [announcementsResult, sermonsResult] = await Promise.all([
        showAnnouncements
          ? payload
              .find({
                collection: 'announcements',
                limit: 3,
                sort: '-publishedAt',
              })
              .catch((error) => {
                console.error('Failed to fetch announcements:', error)
                return null
              })
          : Promise.resolve(null),
        showSermons
          ? payload
              .find({
                collection: 'sermons',
                where: {
                  status: {
                    equals: 'published',
                  },
                },
                limit: videoCount,
                sort: '-sermonDate',
              })
              .catch((error) => {
                console.error('Failed to fetch sermons:', error)
                return null
              })
          : Promise.resolve(null),
      ])

      announcements = announcementsResult
        ? announcementsResult.docs.map((doc) => ({
            id: String(doc.id),
            title: doc.title as string,
            publishedAt: doc.publishedAt as string,
            isPinned: doc.isPinned as boolean | null,
          }))
        : []
      cmsVideos = sermonsResult
        ? sermonsResult.docs
            .filter((doc) => doc.youtubeId)
            .map((doc) => ({
              id: doc.youtubeId as string,
              publishedAt: doc.sermonDate,
              thumbnail:
                doc.thumbnail || `https://img.youtube.com/vi/${doc.youtubeId}/maxresdefault.jpg`,
              title: doc.title,
            }))
        : []
    } catch (error) {
      console.error('Failed to fetch home CMS content:', error)
    }
  }

  const sections = getSections(settings)
  const showSermons = hasSection(sections, 'sermons')
  const videoCount =
    typeof settings?.youtubeVideoCount === 'number' ? settings.youtubeVideoCount : 4

  const fallbackVideos =
    showSermons && cmsVideos.length === 0
      ? await fetchLatestVideos(videoCount, settings?.youtubeChannelId, settings?.youtubeChannelUrl)
      : []
  const videos = cmsVideos.length > 0 ? cmsVideos : fallbackVideos

  return (
    <main>
      <HeroSection settings={settings} />
      {sections.map((section) => {
        switch (section.sectionType) {
          case 'intro':
            return (
              <ChurchIntroSection
                key={section.id ?? section.sectionType}
                section={section}
                settings={settings}
              />
            )
          case 'announcements':
            return (
              <AnnouncementsSection
                key={section.id ?? section.sectionType}
                announcements={announcements}
                description={section.description}
                eyebrow={section.eyebrow}
                title={section.title}
              />
            )
          case 'sermons':
            return (
              <YouTubeSection
                key={section.id ?? section.sectionType}
                channelUrl={settings?.youtubeChannelUrl}
                description={section.description}
                eyebrow={section.eyebrow}
                title={section.title}
                videos={videos}
              />
            )
          case 'instagram':
            return (
              <InstagramSection
                key={section.id ?? section.sectionType}
                description={section.description}
                eyebrow={section.eyebrow}
                handle={settings?.instagramHandle}
                posts={settings?.instagramPosts}
                title={section.title}
                url={settings?.instagramUrl}
              />
            )
          case 'map':
            return (
              <NaverMapSectionServer
                key={section.id ?? section.sectionType}
                description={section.description}
                eyebrow={section.eyebrow}
                settings={settings}
                title={section.title}
              />
            )
          default:
            return null
        }
      })}
    </main>
  )
}
