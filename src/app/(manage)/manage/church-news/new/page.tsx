import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { ChurchNewsForm } from '../ChurchNewsForm'

type NewChurchNewsSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function NewChurchNewsPage({
  searchParams,
}: {
  searchParams: NewChurchNewsSearchParams
}) {
  const user = await requireManageUser()
  const params = await searchParams
  return (
    <ManageShell active="churchNews" user={user}>
      <PageHeader title="교회소식 추가" />
      <ChurchNewsForm error={getStringParam(params.error)} />
    </ManageShell>
  )
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}
