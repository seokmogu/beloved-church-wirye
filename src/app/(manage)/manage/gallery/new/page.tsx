import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { GalleryAlbumForm } from '../GalleryAlbumForm'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function NewGalleryAlbumPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireManageUser()
  const params = await searchParams
  return (
    <ManageShell active="gallery" user={user}>
      <PageHeader title="사진첩 앨범 추가" />
      <GalleryAlbumForm error={firstParam(params.error)} />
    </ManageShell>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
