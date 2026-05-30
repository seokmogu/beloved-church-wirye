import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveVideoSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageVideosPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  return (
    <ManageShell active="videos" user={user}>
      <PageHeader
        description="교회소식 하위의 동영상페이지에 사용할 YouTube 채널 정보를 관리합니다."
        title="동영상"
      >
        <Link className="manage-button secondary" href="/church-news/videos" target="_blank">
          공개페이지 보기
        </Link>
      </PageHeader>
      <form action={saveVideoSettingsAction} className="manage-form">
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="youtubeChannelUrl">YouTube 채널 URL</label>
            <input
              defaultValue={settings.youtubeChannelUrl || ''}
              id="youtubeChannelUrl"
              name="youtubeChannelUrl"
              type="url"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="youtubeVideoCount">표시 개수</label>
            <input
              defaultValue={settings.youtubeVideoCount ?? 8}
              id="youtubeVideoCount"
              max={24}
              min={1}
              name="youtubeVideoCount"
              type="number"
            />
          </div>
        </div>

        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage">
            취소
          </Link>
          <SaveButton label="설정 저장" />
        </div>
      </form>
    </ManageShell>
  )
}
