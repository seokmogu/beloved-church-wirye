import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageDashboardPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const [announcements, churchNews, sermons, bulletins] = await Promise.all([
    payload.find({ collection: 'announcements', limit: 5, sort: '-publishedAt' }),
    payload.find({ collection: 'church-news', limit: 5, sort: '-date' }),
    payload.find({ collection: 'sermons', limit: 5, sort: '-sermonDate' }),
    payload.find({ collection: 'bulletins', limit: 5, sort: '-date' }),
  ])

  return (
    <ManageShell active="dashboard" user={user}>
      <PageHeader description="주요 콘텐츠를 빠르게 확인하고 수정합니다." title="대시보드" />
      <section className="manage-grid cols-3">
        <Link className="manage-card manage-stat" href="/manage/guide">
          <span>관리가이드</span>
          <strong>안내</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/home">
          <span>홈관리</span>
          <strong>5</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/leaders">
          <span>섬기는 사람들</span>
          <strong>소개</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/worship">
          <span>예배안내</span>
          <strong>위치</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/instagram">
          <span>인스타그램</span>
          <strong>SNS</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/announcements">
          <span>공지사항</span>
          <strong>{announcements.totalDocs}</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/church-news">
          <span>교회소식</span>
          <strong>{churchNews.totalDocs}</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/videos">
          <span>동영상</span>
          <strong>채널</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/sermons">
          <span>설교</span>
          <strong>{sermons.totalDocs}</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/bulletins">
          <span>주보</span>
          <strong>{bulletins.totalDocs}</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/offering">
          <span>헌금안내</span>
          <strong>계좌</strong>
        </Link>
        <Link className="manage-card manage-stat" href="/manage/menu">
          <span>메뉴관리</span>
          <strong>GNB</strong>
        </Link>
      </section>
      <section className="manage-grid" style={{ marginTop: 18 }}>
        <RecentList
          hrefPrefix="/manage/announcements"
          items={announcements.docs.map((doc) => ({
            date: doc.publishedAt,
            id: doc.id,
            title: doc.title,
          }))}
          title="최근 공지"
        />
        <RecentList
          hrefPrefix="/manage/church-news"
          items={churchNews.docs.map((doc) => ({
            date: doc.date,
            id: doc.id,
            title: doc.title,
          }))}
          title="최근 교회소식"
        />
        <RecentList
          hrefPrefix="/manage/sermons"
          items={sermons.docs.map((doc) => ({
            date: doc.sermonDate,
            id: doc.id,
            title: doc.title,
          }))}
          title="최근 설교"
        />
      </section>
    </ManageShell>
  )
}

function RecentList({
  hrefPrefix,
  items,
  title,
}: {
  hrefPrefix: string
  items: { date?: string | null; id: number; title?: string | null }[]
  title: string
}) {
  return (
    <div className="manage-table-wrap">
      <table className="manage-table">
        <thead>
          <tr>
            <th>{title}</th>
            <th>날짜</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item) => (
              <tr key={item.id}>
                <td className="manage-table-title">{item.title}</td>
                <td>{formatKoreanDate(item.date)}</td>
                <td>
                  <Link className="manage-button secondary" href={`${hrefPrefix}/${item.id}`}>
                    편집
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="manage-empty" colSpan={3}>
                표시할 항목이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
