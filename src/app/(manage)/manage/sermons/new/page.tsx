import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { SermonForm } from '../SermonForm'

export default async function NewSermonPage() {
  const user = await requireManageUser()
  return (
    <ManageShell active="sermons" user={user}>
      <PageHeader title="설교 추가" />
      <SermonForm />
    </ManageShell>
  )
}
