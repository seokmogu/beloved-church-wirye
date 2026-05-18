import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { SermonForm } from '../SermonForm'

export default async function EditSermonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireManageUser()
  const { id } = await params
  const payload = await getManagePayload()
  const doc = await payload.findByID({ collection: 'sermons', id: Number(id) }).catch(() => null)
  if (!doc) notFound()
  return (
    <ManageShell active="sermons" user={user}>
      <PageHeader title="설교 편집" />
      <SermonForm doc={doc} />
    </ManageShell>
  )
}
