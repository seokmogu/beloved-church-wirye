import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageAnnouncementsPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const announcements = await payload.find({
    collection: 'announcements',
    limit: 60,
    sort: '-publishedAt',
  })

  return (
    <ManageShell active="announcements" user={user}>
      <PageHeader actionHref="/manage/announcements/new" actionLabel="글 추가" title="교회로그" />
      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>게시일</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {announcements.docs.length ? (
              announcements.docs.map((doc) => (
                <tr key={doc.id}>
                  <td className="manage-table-title">{doc.title}</td>
                  <td>{formatKoreanDate(doc.publishedAt)}</td>
                  <td>{doc.isPinned ? <span className="manage-badge">상단 고정</span> : null}</td>
                  <td>
                    <Link
                      className="manage-button secondary"
                      href={`/manage/announcements/${doc.id}`}
                    >
                      편집
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="manage-empty" colSpan={4}>
                  표시할 교회로그가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ManageShell>
  )
}
