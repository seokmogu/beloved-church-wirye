import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { GalleryAlbumForm } from '../GalleryAlbumForm'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function EditGalleryAlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const user = await requireManageUser()
  const { id } = await params
  const query = await searchParams
  const payload = await getManagePayload()
  const doc = await payload
    .findByID({ collection: 'gallery-albums', depth: 1, id: Number(id) })
    .catch(() => null)
  if (!doc) notFound()

  return (
    <ManageShell active="gallery" user={user}>
      <PageHeader title="사진첩 앨범 편집" />
      <GalleryAlbumForm doc={doc} error={firstParam(query.error)} />
    </ManageShell>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
