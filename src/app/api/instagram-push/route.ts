import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { isAuthorizedInstagramPushRequest } from '@/lib/cronAuth'
import { applyPushedInstagramPosts, type PushedInstagramPost } from '@/lib/instagram'

export const dynamic = 'force-dynamic'

type RequestBody = {
  posts?: unknown
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedInstagramPushRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null
  const posts = parsePushedPosts(body?.posts)
  if (posts === null) {
    return NextResponse.json({ error: 'invalid posts payload', ok: false }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const result = await applyPushedInstagramPosts(payload, posts)
    revalidatePath('/')
    revalidatePath('/manage/instagram')
    return NextResponse.json({ count: result.count, ok: true })
  } catch (error) {
    payload.logger.error({ err: error }, 'Instagram push failed')
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

function parsePushedPosts(value: unknown): PushedInstagramPost[] | null {
  if (!Array.isArray(value)) return null

  const posts: PushedInstagramPost[] = []
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null

    const { postId, publishedAt, type } = item as Record<string, unknown>
    if (typeof postId !== 'string' || !postId.trim()) return null
    if (type !== 'p' && type !== 'reel') return null
    if (publishedAt !== undefined && publishedAt !== null && typeof publishedAt !== 'string') {
      return null
    }

    posts.push({ postId: postId.trim(), publishedAt: publishedAt ?? null, type })
  }

  return posts
}
