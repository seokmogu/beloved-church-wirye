import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { BulletinForm } from '../BulletinForm'

export default async function EditBulletinPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireManageUser()
  const { id } = await params
  const payload = await getManagePayload()
  const doc = await payload.findByID({ collection: 'bulletins', id: Number(id) }).catch(() => null)
  if (!doc) notFound()
  return (
    <ManageShell active="bulletins" user={user}>
      <PageHeader title="주보 편집" />
      <BulletinForm doc={doc} />
    </ManageShell>
  )
}
