import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { ChurchNewsForm } from '../ChurchNewsForm'

export default async function NewChurchNewsPage() {
  const user = await requireManageUser()
  return (
    <ManageShell active="churchNews" user={user}>
      <PageHeader title="교회소식 추가" />
      <ChurchNewsForm />
    </ManageShell>
  )
}
