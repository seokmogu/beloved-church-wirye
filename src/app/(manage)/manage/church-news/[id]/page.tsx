import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { ChurchNewsForm } from '../ChurchNewsForm'

export default async function EditChurchNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireManageUser()
  const { id } = await params
  const payload = await getManagePayload()
  const doc = await payload
    .findByID({ collection: 'church-news', depth: 1, id: Number(id) })
    .catch(() => null)
  if (!doc) notFound()
  return (
    <ManageShell active="churchNews" user={user}>
      <PageHeader title="교회소식 편집" />
      <ChurchNewsForm doc={doc} />
    </ManageShell>
  )
}
