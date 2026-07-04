import { notFound } from 'next/navigation'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

import { VideoForm } from '../VideoForm'

export default async function EditVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireManageUser()
  const { id } = await params
  const sp = await searchParams
  const payload = await getManagePayload()
  const doc = await payload
    .findByID({ collection: 'church-videos', id: Number(id) })
    .catch(() => null)
  if (!doc) notFound()
  return (
    <ManageShell active="videos" user={user}>
      <PageHeader title="동영상 편집" />
      <VideoForm doc={doc} error={getStringParam(sp.error)} />
    </ManageShell>
  )
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}
