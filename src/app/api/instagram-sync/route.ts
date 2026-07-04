import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { isAuthorizedCronRequest } from '@/lib/cronAuth'
import { InstagramSyncConfigError, syncInstagramPosts } from '@/lib/instagram'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const result = await syncInstagramPosts(payload)
    revalidateInstagramPaths()
    return NextResponse.json({ count: result.count, ok: true })
  } catch (error) {
    if (error instanceof InstagramSyncConfigError) {
      return NextResponse.json({ ok: false, skipped: 'missing-instagram-config' })
    }

    payload.logger.error({ err: error }, 'Instagram sync failed')
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

function revalidateInstagramPaths() {
  revalidatePath('/')
  revalidatePath('/manage/instagram')
}
