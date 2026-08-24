import configPromise from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { isAuthorizedCronRequest } from '@/lib/cronAuth'
import { requestYouTubePushSubscription } from '@/lib/youtubePush'

export const dynamic = 'force-dynamic'

/**
 * Renews the hub subscription only. It never starts a transcription; actual
 * Mac Studio work begins solely from a verified upload notification.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const channelId = settings.youtubeChannelId?.trim()
  if (!channelId) return NextResponse.json({ ok: false, reason: 'channel not configured' }, { status: 503 })

  try {
    await requestYouTubePushSubscription(channelId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    payload.logger.error({ err: error }, 'YouTube push subscription renewal failed')
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
