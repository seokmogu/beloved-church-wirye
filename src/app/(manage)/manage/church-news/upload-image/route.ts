import { Buffer } from 'node:buffer'

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

    const payload = await getManagePayload()
    const uploaded = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type || 'application/octet-stream',
        name: file.name || 'church-news-image.upload',
        size: file.size,
      },
    } as any)

    return NextResponse.json({ id: uploaded.id })
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

function isUploadableFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'arrayBuffer' in value &&
    'size' in value &&
    'name' in value
  )
}
