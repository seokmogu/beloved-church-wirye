import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { AnnouncementForm } from '../AnnouncementForm'

export default async function NewAnnouncementPage() {
  const user = await requireManageUser()
  return (
    <ManageShell active="announcements" user={user}>
      <PageHeader title="교회로그 추가" />
      <AnnouncementForm />
    </ManageShell>
  )
}
