import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageVideosPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const videos = await payload.find({
    collection: 'church-videos',
    limit: 80,
    sort: '-videoDate',
  })

  return (
    <ManageShell active="videos" user={user}>
      <PageHeader
        actionHref="/manage/videos/new"
        actionLabel="동영상 추가"
        description="교회소식 하위 동영상페이지에는 자동 수집 없이 직접 등록한 YouTube 링크만 노출됩니다."
        title="동영상"
      >
        <Link className="manage-button secondary" href="/church-news/videos" target="_blank">
          공개페이지 보기
        </Link>
      </PageHeader>
      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>영상 날짜</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {videos.docs.length ? (
              videos.docs.map((doc) => (
                <tr key={doc.id}>
                  <td className="manage-table-title">{doc.title}</td>
                  <td>{formatKoreanDate(doc.videoDate)}</td>
                  <td>
                    <span className={`manage-badge${doc.status === 'draft' ? ' draft' : ''}`}>
                      {doc.status === 'draft' ? '초안' : '공개'}
                    </span>
                  </td>
                  <td>
                    <Link className="manage-button secondary" href={`/manage/videos/${doc.id}`}>
                      편집
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="manage-empty" colSpan={4}>
                  표시할 동영상이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ManageShell>
  )
}
