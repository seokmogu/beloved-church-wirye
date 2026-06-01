import configPromise from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { fetchLatestVideos, YOUTUBE_CACHE_TAG } from '@/lib/youtube'
import type { SiteSetting } from '@/payload-types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const videoCount = getVideoCount(settings)

    revalidateTag(YOUTUBE_CACHE_TAG, 'max')

    const videos = await fetchLatestVideos(
      videoCount,
      settings.youtubeChannelId,
      settings.youtubeChannelUrl,
      { cache: 'no-store' },
    )

    revalidatePath('/')
    revalidatePath('/sermon')
    const warmedPaths = await warmPublicPages(request)

    return NextResponse.json({
      count: videos.length,
      latestVideoId: videos[0]?.id ?? null,
      ok: true,
      warmedPaths,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'YouTube refresh failed')
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

function isAuthorizedCronRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  return request.headers.get('authorization') === `Bearer ${secret}`
}

function getVideoCount(settings: SiteSetting) {
  return Math.max(typeof settings.youtubeVideoCount === 'number' ? settings.youtubeVideoCount : 4, 12)
}

async function warmPublicPages(request: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_SERVER_URL || request.nextUrl.origin
  const paths = ['/', '/sermon']

  const results = await Promise.allSettled(
    paths.map(async (path) => {
      const url = new URL(path, origin)
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`${path} returned ${response.status}`)
      }
      return path
    }),
  )

  return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
}
