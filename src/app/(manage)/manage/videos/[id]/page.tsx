import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { VideoForm } from '../VideoForm'

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireManageUser()
  const { id } = await params
  const payload = await getManagePayload()
  const doc = await payload
    .findByID({ collection: 'church-videos', id: Number(id) })
    .catch(() => null)
  if (!doc) notFound()
  return (
    <ManageShell active="videos" user={user}>
      <PageHeader title="동영상 편집" />
      <VideoForm doc={doc} />
    </ManageShell>
  )
}
