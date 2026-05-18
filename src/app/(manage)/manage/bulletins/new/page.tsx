import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { BulletinForm } from '../BulletinForm'

export default async function NewBulletinPage() {
  const user = await requireManageUser()
  return (
    <ManageShell active="bulletins" user={user}>
      <PageHeader title="주보 추가" />
      <BulletinForm />
    </ManageShell>
  )
}
