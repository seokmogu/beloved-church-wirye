import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { SermonForm } from '../SermonForm'

export default async function NewSermonPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireManageUser()
  const params = await searchParams
  return (
    <ManageShell active="sermons" user={user}>
      <PageHeader title="설교 추가" />
      <SermonForm error={getStringParam(params.error)} />
    </ManageShell>
  )
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}
