import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'

import { NextResponse } from 'next/server'

import { requireManageActionUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

export async function POST(request: Request) {
  try {
    await requireManageActionUser()

    if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'storage_not_configured' }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const alt = String(formData.get('alt') || '교회소식 이미지')

    if (!isUploadableFile(file) || !file.size) {
      return NextResponse.json({ error: 'file_required' }, { status: 400 })
    }

    const data = Buffer.from(await file.arrayBuffer())
    const contentHash = createHash('sha256').update(data).digest('hex')
    const payload = await getManagePayload()
    const existing = await findReusableMedia(payload, contentHash, file.size)

    if (existing) {
      return NextResponse.json({ contentHash, id: existing.id, reused: true })
    }

    const uploaded = await payload.create({
      collection: 'media',
      data: { alt, contentHash },
      file: {
        data,
        mimetype: file.type || 'application/octet-stream',
        name: file.name || 'church-news-image.upload',
        size: file.size,
      },
    } as any)

    return NextResponse.json({ contentHash, id: uploaded.id, reused: false })
  } catch (error) {
    console.error('Failed to upload church news image:', error)
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireManageActionUser()

    const { id } = (await request.json()) as { id?: number | string }
    if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })

    const payload = await getManagePayload()
    await payload.delete({ collection: 'media', id })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete removed church news image:', error)
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
  }
}

async function findReusableMedia(
  payload: Awaited<ReturnType<typeof getManagePayload>>,
  contentHash: string,
  filesize: number,
) {
  const result = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    sort: '-createdAt',
    where: {
      and: [{ contentHash: { equals: contentHash } }, { filesize: { equals: filesize } }],
    } as any,
  })

  return result.docs[0]
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
