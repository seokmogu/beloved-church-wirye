import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

import { VideoForm } from '../VideoForm'

export default async function NewVideoPage() {
  const user = await requireManageUser()
  return (
    <ManageShell active="videos" user={user}>
      <PageHeader
        description="YouTube 링크를 직접 입력해 동영상페이지에 노출합니다."
        title="동영상 추가"
      />
      <VideoForm />
    </ManageShell>
  )
}
