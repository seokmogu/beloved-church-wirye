import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'

import { NextResponse } from 'next/server'

import { requireManageActionUser } from '@/lib/manage/auth'
import { optimizeUploadImage } from '@/lib/manage/imageOptimize'
import { getManagePayload } from '@/lib/manage/payload'

// Cloudflare R2 does not provide a per-bucket hard storage cap. Keep the CMS
// gallery below the 10 GB free-tier allowance, while preserving room for
// temporary objects and operational overhead outside this upload flow.
const DEFAULT_GALLERY_STORAGE_LIMIT_BYTES = 8_000_000_000

function isR2Configured() {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_BUCKET &&
      process.env.R2_ENDPOINT &&
      process.env.R2_PUBLIC_URL &&
      process.env.R2_SECRET_ACCESS_KEY,
  )
}

export async function POST(request: Request) {
  try {
    await requireManageActionUser()

    if (process.env.VERCEL && !isR2Configured()) {
      return NextResponse.json({ error: 'storage_not_configured' }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const alt = String(formData.get('alt') || '행사갤러리 사진')
    if (!isUploadableFile(file) || !file.size) {
      return NextResponse.json({ error: 'file_required' }, { status: 400 })
    }

    const originalData = Buffer.from(await file.arrayBuffer())
    const contentHash = createHash('sha256').update(originalData).digest('hex')
    const optimized = await optimizeUploadImage(originalData, file)
    const payload = await getManagePayload()
    const existing = await findReusableGalleryMedia(payload, contentHash, optimized.data.length)

    if (existing) {
      return NextResponse.json({
        contentHash,
        id: existing.id,
        reused: true,
        uploadedSize: existing.filesize ?? optimized.data.length,
      })
    }

    const storageLimitBytes = galleryStorageLimitBytes()
    const usedBytes = await getGalleryStorageBytes(payload)
    if (usedBytes + optimized.data.length > storageLimitBytes) {
      return NextResponse.json(
        {
          error: 'storage_limit_reached',
          storageLimitBytes,
          usedBytes,
        },
        { status: 413 },
      )
    }

    const uploaded = await payload.create({
      collection: 'gallery-media',
      data: { alt, contentHash },
      file: {
        data: optimized.data,
        mimetype: optimized.mimeType,
        name: `gallery-${contentHash.slice(0, 12)}-${optimized.filename}`,
        size: optimized.data.length,
      },
    } as any)

    return NextResponse.json({
      contentHash,
      id: uploaded.id,
      reused: false,
      uploadedSize: optimized.data.length,
    })
  } catch (error) {
    console.error('Failed to upload gallery image:', error)
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireManageActionUser()
    const { id } = (await request.json()) as { id?: number | string }
    if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })

    const payload = await getManagePayload()
    await payload.delete({ collection: 'gallery-media', id })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to clean up gallery image:', error)
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
  }
}

async function findReusableGalleryMedia(
  payload: Awaited<ReturnType<typeof getManagePayload>>,
  contentHash: string,
  filesize: number,
) {
  const result = await payload.find({
    collection: 'gallery-media',
    depth: 0,
    limit: 1,
    sort: '-createdAt',
    where: {
      and: [{ contentHash: { equals: contentHash } }, { filesize: { equals: filesize } }],
    } as any,
  })
  return result.docs[0]
}

async function getGalleryStorageBytes(payload: Awaited<ReturnType<typeof getManagePayload>>) {
  const result = (await payload.find({
    collection: 'gallery-media',
    depth: 0,
    pagination: false,
    select: {
      filesize: true,
    },
  } as any)) as { docs: Array<{ filesize?: number | null }> }

  return result.docs.reduce((total: number, media: { filesize?: number | null }) => {
    return total + (Number(media.filesize) || 0)
  }, 0)
}

function galleryStorageLimitBytes() {
  const configuredLimit = Number(process.env.R2_GALLERY_STORAGE_LIMIT_BYTES)
  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? Math.floor(configuredLimit)
    : DEFAULT_GALLERY_STORAGE_LIMIT_BYTES
}

function isUploadableFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'arrayBuffer' in value &&
    'size' in value &&
    'name' in value
  )
}
