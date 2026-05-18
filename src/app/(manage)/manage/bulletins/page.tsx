import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageBulletinsPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const bulletins = await payload.find({ collection: 'bulletins', limit: 80, sort: '-date' })

  return (
    <ManageShell active="bulletins" user={user}>
      <PageHeader actionHref="/manage/bulletins/new" actionLabel="주보 추가" title="주보" />
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
            {bulletins.docs.length ? (
              bulletins.docs.map((doc) => (
                <tr key={doc.id}>
                  <td className="manage-table-title">{doc.title || '주보'}</td>
                  <td>{formatKoreanDate(doc.date)}</td>
                  <td>
                    {doc.isPublic ? (
                      <span className="manage-badge">공개</span>
                    ) : (
                      <span className="manage-badge draft">비공개</span>
                    )}
                  </td>
                  <td>
                    <Link className="manage-button secondary" href={`/manage/bulletins/${doc.id}`}>
                      편집
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="manage-empty" colSpan={4}>
                  표시할 주보가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ManageShell>
  )
}
