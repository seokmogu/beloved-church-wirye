export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
}

const CHANNEL_ID = 'UCEyfzJVbYFdI9An9e0FTojw'
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`

/**
 * Fetch latest videos from the church YouTube channel via RSS feed.
 * No API key required. Results cached and revalidated every 12 hours.
 */
export async function fetchLatestVideos(count = 4): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 43200 } })
    if (!res.ok) {
      console.warn('YouTube RSS feed returned non-OK status:', res.status)
      return []
    }

    const xml = await res.text()

    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? []

    return entries.slice(0, count).map((entry) => {
      const videoId = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ?? [])[1] ?? ''
      const title = (entry.match(/<media:title>([^<]+)<\/media:title>/) ?? [])[1] ?? ''
      const thumbnail =
        (entry.match(/<media:thumbnail url="([^"]+)"/) ?? [])[1] ??
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      const publishedAt = (entry.match(/<published>([^<]+)<\/published>/) ?? [])[1] ?? ''

      return { id: videoId, title, thumbnail, publishedAt }
    })
  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error)
    return []
  }
}
