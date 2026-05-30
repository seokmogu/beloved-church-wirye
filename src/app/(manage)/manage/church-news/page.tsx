import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageChurchNewsPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const churchNews = await payload.find({ collection: 'church-news', limit: 80, sort: '-date' })

  return (
    <ManageShell active="churchNews" user={user}>
      <PageHeader
        actionHref="/manage/church-news/new"
        actionLabel="교회소식 추가"
        description="카카오톡으로 공유하는 주간 교회소식 이미지를 등록합니다."
        title="교회소식"
      />
      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>날짜</th>
              <th>이미지</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {churchNews.docs.length ? (
              churchNews.docs.map((doc) => (
                <tr key={doc.id}>
                  <td className="manage-table-title">{doc.title || '교회소식'}</td>
                  <td>{formatKoreanDate(doc.date)}</td>
                  <td>{doc.images?.length || 0}장</td>
                  <td>
                    {doc.isPublic ? (
                      <span className="manage-badge">공개</span>
                    ) : (
                      <span className="manage-badge draft">비공개</span>
                    )}
                  </td>
                  <td>
                    <Link className="manage-button secondary" href={`/manage/church-news/${doc.id}`}>
                      편집
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="manage-empty" colSpan={5}>
                  표시할 교회소식이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ManageShell>
  )
}
