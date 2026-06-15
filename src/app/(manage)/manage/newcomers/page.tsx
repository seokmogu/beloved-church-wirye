import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'
import type { Newcomer } from '@/payload-types'

const statusLabels: Record<NonNullable<Newcomer['status']>, string> = {
  contacted: '연락 완료',
  pending: '대기 중',
  registered: '등록 완료',
  visited: '방문 완료',
}

const statusTone: Record<NonNullable<Newcomer['status']>, string> = {
  contacted: 'info',
  pending: 'warning',
  registered: 'success',
  visited: 'success',
}

const sourceLabels: Record<Newcomer['source'], string> = {
  other: '기타',
  passingBy: '지나가다가',
  referral: '전도/소개',
  search: '인터넷 검색',
  sns: 'SNS',
  youtube: '유튜브',
}

export default async function ManageNewcomersPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const newcomers = await payload.find({ collection: 'newcomers', limit: 100, sort: '-createdAt' })

  return (
    <ManageShell active="newcomers" user={user}>
      <PageHeader description="공개 새가족등록 폼으로 접수된 신청입니다." title="새가족조회" />
      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>연락처</th>
              <th>등록신청일</th>
              <th>방문경로</th>
              <th>상태</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {newcomers.docs.length ? (
              newcomers.docs.map((doc) => {
                const status = doc.status || 'pending'

                return (
                  <tr key={doc.id}>
                    <td className="manage-table-title">{doc.name}</td>
                    <td>{doc.phone}</td>
                    <td>{formatKoreanDate(doc.visitDate || doc.createdAt)}</td>
                    <td>{sourceLabels[doc.source]}</td>
                    <td>
                      <span className={`manage-badge ${statusTone[status]}`}>
                        {statusLabels[status]}
                      </span>
                    </td>
                    <td>
                      {doc.notes ? (
                        <span className="manage-note-preview">{doc.notes}</span>
                      ) : (
                        <span className="manage-muted">-</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td className="manage-empty" colSpan={6}>
                  표시할 새가족 등록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="manage-page-footnote">
        <Link className="manage-button secondary" href="/newcomer" target="_blank">
          등록 폼 열기
        </Link>
      </div>
    </ManageShell>
  )
}
