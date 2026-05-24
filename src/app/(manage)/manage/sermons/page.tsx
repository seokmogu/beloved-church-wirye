import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveSermonSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageSermonsPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const [settings, sermons] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.find({ collection: 'sermons', limit: 80, sort: '-sermonDate' }),
  ])

  return (
    <ManageShell active="sermons" user={user}>
      <PageHeader
        actionHref="/manage/sermons/new"
        actionLabel="설교 추가"
        description="공개된 설교가 메인 화면의 최신 설교 영역과 /sermon 페이지에 함께 노출됩니다."
        title="설교"
      />
      <form action={saveSermonSettingsAction} className="manage-form" style={{ marginBottom: 16 }}>
        <h2 className="manage-section-title">홈 최신 설교 설정</h2>
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
            <label htmlFor="youtubeVideoCount">홈 표시 개수</label>
            <input
              defaultValue={settings.youtubeVideoCount ?? 4}
              id="youtubeVideoCount"
              max={12}
              min={1}
              name="youtubeVideoCount"
              type="number"
            />
          </div>
        </div>
        <div className="manage-form-actions">
          <SaveButton label="설정 저장" />
        </div>
      </form>
      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>날짜</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {sermons.docs.length ? (
              sermons.docs.map((doc) => (
                <tr key={doc.id}>
                  <td className="manage-table-title">{doc.title}</td>
                  <td>{formatKoreanDate(doc.sermonDate)}</td>
                  <td>
                    <span className={`manage-badge${doc.status === 'draft' ? ' draft' : ''}`}>
                      {doc.status === 'draft' ? '초안' : '공개'}
                    </span>
                  </td>
                  <td>
                    <Link className="manage-button secondary" href={`/manage/sermons/${doc.id}`}>
                      편집
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="manage-empty" colSpan={4}>
                  표시할 설교가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ManageShell>
  )
}
