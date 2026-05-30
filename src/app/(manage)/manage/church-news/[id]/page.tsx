import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { ChurchNewsForm } from '../ChurchNewsForm'

type EditChurchNewsSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function EditChurchNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: EditChurchNewsSearchParams
}) {
  const user = await requireManageUser()
  const { id } = await params
  const query = await searchParams
  const payload = await getManagePayload()
  const doc = await payload
    .findByID({ collection: 'church-news', depth: 1, id: Number(id) })
    .catch(() => null)
  if (!doc) notFound()
  return (
    <ManageShell active="churchNews" user={user}>
      <PageHeader title="교회소식 편집" />
      <ChurchNewsForm doc={doc} error={getStringParam(query.error)} />
    </ManageShell>
  )
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}
