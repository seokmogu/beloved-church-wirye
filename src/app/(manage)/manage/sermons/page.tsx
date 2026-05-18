import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageSermonsPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const sermons = await payload.find({ collection: 'sermons', limit: 80, sort: '-sermonDate' })

  return (
    <ManageShell active="sermons" user={user}>
      <PageHeader actionHref="/manage/sermons/new" actionLabel="설교 추가" title="설교" />
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
