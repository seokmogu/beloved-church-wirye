import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { AnnouncementForm } from '../AnnouncementForm'

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireManageUser()
  const { id } = await params
  const payload = await getManagePayload()
  const doc = await payload
    .findByID({ collection: 'announcements', id: Number(id) })
    .catch(() => null)
  if (!doc) notFound()
  return (
    <ManageShell active="announcements" user={user}>
      <PageHeader title="교회로그 편집" />
      <AnnouncementForm doc={doc} />
    </ManageShell>
  )
}
