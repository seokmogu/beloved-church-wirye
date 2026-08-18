import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'

import { getManageAuthState } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ filename: string }>
}

function getR2Client() {
  return new S3Client({
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    endpoint: process.env.R2_ENDPOINT || '',
    forcePathStyle: true,
    region: 'auto',
  })
}

function isR2Configured() {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_BUCKET &&
      process.env.R2_ENDPOINT &&
      process.env.R2_SECRET_ACCESS_KEY,
  )
}

function notFound() {
  return new Response(null, {
    headers: { 'Cache-Control': 'private, no-store' },
    status: 404,
  })
}

export async function GET(request: Request, context: RouteContext) {
  if (!isR2Configured()) return notFound()

  const { filename } = await context.params
  const prefix = new URL(request.url).searchParams.get('prefix') || ''
  if (!filename || filename.includes('/') || prefix.split('/').some((part) => part === '..')) {
    return notFound()
  }

  const payload = await getManagePayload()
  const mediaResult = await payload.find({
    collection: 'gallery-media',
    depth: 0,
    limit: 1,
    where: {
      or: [
        { filename: { equals: filename } },
        { 'sizes.thumbnail.filename': { equals: filename } },
        { 'sizes.card.filename': { equals: filename } },
        { 'sizes.display.filename': { equals: filename } },
      ],
    } as any,
  })
  const media = mediaResult.docs[0]
  if (!media || (media.prefix || '') !== prefix) return notFound()

  const publicAlbumResult = await payload.find({
    collection: 'gallery-albums',
    depth: 0,
    limit: 1,
    where: {
      and: [{ isPublic: { equals: true } }, { 'images.image': { equals: media.id } }],
    } as any,
  })

  if (!publicAlbumResult.docs[0]) {
    const auth = await getManageAuthState()
    if (!auth.user) return notFound()
  }

  const key = ['gallery', prefix, filename].filter(Boolean).join('/')

  try {
    const object = await getR2Client().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }),
    )
    if (!object.Body) return notFound()

    const body = object.Body as unknown as Readable
    const headers = new Headers({
      'Cache-Control': 'private, no-store',
      'Content-Type': object.ContentType || media.mimeType || 'application/octet-stream',
    })
    if (object.ContentLength !== undefined) headers.set('Content-Length', String(object.ContentLength))

    return new Response(Readable.toWeb(body) as ReadableStream, { headers })
  } catch {
    return notFound()
  }
}
