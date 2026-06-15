import {
  ArrowRight,
  ClipboardList,
  FileText,
  Megaphone,
  Newspaper,
  Radio,
  Video,
} from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

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

export default async function ManageDashboardPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()

  const [announcements, churchNews, churchVideos, sermons, bulletins, newcomers, pendingNewcomers] =
    await Promise.all([
      payload.find({ collection: 'announcements', limit: 4, sort: '-publishedAt' }),
      payload.find({ collection: 'church-news', limit: 4, sort: '-date' }),
      payload.find({ collection: 'church-videos', limit: 3, sort: '-videoDate' }),
      payload.find({ collection: 'sermons', limit: 3, sort: '-sermonDate' }),
      payload.find({ collection: 'bulletins', limit: 4, sort: '-date' }),
      payload.find({ collection: 'newcomers', limit: 5, sort: '-createdAt' }),
      payload.find({
        collection: 'newcomers',
        limit: 1,
        where: { status: { equals: 'pending' } },
      }),
    ])

  const latestBulletin = bulletins.docs[0]
  const latestChurchNews = churchNews.docs[0]
  const latestAnnouncement = announcements.docs[0]

  return (
    <ManageShell active="dashboard" user={user}>
      <PageHeader description="새 등록과 최근 게시 상태를 먼저 확인합니다." title="관리 홈" />

      <section className="manage-dashboard-hero" aria-label="운영 요약">
        <div className="manage-hero-copy">
          <span className="manage-kicker">오늘의 운영 인박스</span>
          <h2>새가족 후속 연락과 이번 주 게시 흐름을 한 화면에서 확인합니다.</h2>
        </div>
        <div className="manage-hero-metrics">
          <Metric label="전체 새가족" value={newcomers.totalDocs} />
          <Metric label="대기 중" tone="warning" value={pendingNewcomers.totalDocs} />
          <Metric label="최근 목록" value={newcomers.docs.length} />
        </div>
      </section>

      <section className="manage-dashboard-layout">
        <div className="manage-panel manage-inbox-panel">
          <div className="manage-panel-head">
            <div>
              <span className="manage-kicker">새가족</span>
              <h2>최근 등록</h2>
            </div>
            <Link className="manage-button secondary" href="/manage/newcomers">
              전체 보기
              <ArrowRight />
            </Link>
          </div>
          <div className="manage-inbox-list">
            {newcomers.docs.length ? (
              newcomers.docs.map((doc) => <NewcomerRow doc={doc} key={doc.id} />)
            ) : (
              <div className="manage-empty">표시할 새가족 등록이 없습니다.</div>
            )}
          </div>
        </div>

        <div className="manage-panel manage-operation-panel">
          <div className="manage-panel-head">
            <div>
              <span className="manage-kicker">공개 콘텐츠</span>
              <h2>최근 업데이트</h2>
            </div>
          </div>
          <div className="manage-update-stack">
            <UpdateItem
              href="/manage/bulletins"
              icon={FileText}
              label="주보"
              meta={formatKoreanDate(latestBulletin?.date)}
              title={latestBulletin?.title || '등록된 주보 없음'}
            />
            <UpdateItem
              href="/manage/church-news"
              icon={Newspaper}
              label="교회소식"
              meta={formatKoreanDate(latestChurchNews?.date)}
              title={latestChurchNews?.title || '등록된 교회소식 없음'}
            />
            <UpdateItem
              href="/manage/announcements"
              icon={Megaphone}
              label="교회로그"
              meta={formatKoreanDate(latestAnnouncement?.publishedAt)}
              title={latestAnnouncement?.title || '등록된 교회로그 없음'}
            />
          </div>
        </div>
      </section>

      <section className="manage-panel manage-content-board" aria-label="콘텐츠 작업 현황">
        <div className="manage-panel-head">
          <div>
            <span className="manage-kicker">작업 현황</span>
            <h2>최근 콘텐츠</h2>
          </div>
        </div>
        <div className="manage-content-columns">
          <RecentList
            hrefPrefix="/manage/announcements"
            items={announcements.docs.map((doc) => ({
              date: doc.publishedAt,
              id: doc.id,
              title: doc.title,
            }))}
            title="교회로그"
          />
          <RecentList
            hrefPrefix="/manage/church-news"
            items={churchNews.docs.map((doc) => ({
              date: doc.date,
              id: doc.id,
              title: doc.title,
            }))}
            title="교회소식"
          />
          <RecentList
            hrefPrefix="/manage/bulletins"
            items={bulletins.docs.map((doc) => ({
              date: doc.date,
              id: doc.id,
              title: doc.title || '주보',
            }))}
            title="주보"
          />
          <RecentList
            hrefPrefix="/manage/sermons"
            icon={Radio}
            items={sermons.docs.map((doc) => ({
              date: doc.sermonDate,
              id: doc.id,
              title: doc.title,
            }))}
            title="설교영상"
          />
          <RecentList
            hrefPrefix="/manage/videos"
            icon={Video}
            items={churchVideos.docs.map((doc) => ({
              date: doc.videoDate,
              id: doc.id,
              title: doc.title,
            }))}
            title="동영상"
          />
        </div>
      </section>
    </ManageShell>
  )
}

function Metric({ label, tone, value }: { label: string; tone?: 'warning'; value: number }) {
  return (
    <div className={`manage-hero-metric ${tone ? `is-${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function NewcomerRow({ doc }: { doc: Newcomer }) {
  const status = doc.status || 'pending'

  return (
    <Link className="manage-inbox-row" href="/manage/newcomers">
      <span className="manage-inbox-icon">
        <ClipboardList />
      </span>
      <span className="manage-inbox-main">
        <strong>{doc.name}</strong>
        <span>
          {doc.phone} · {formatKoreanDate(doc.visitDate || doc.createdAt)}
        </span>
      </span>
      <span className={`manage-badge ${statusTone[status]}`}>{statusLabels[status]}</span>
    </Link>
  )
}

function UpdateItem({
  href,
  icon: Icon,
  label,
  meta,
  title,
}: {
  href: string
  icon: ComponentType<{ className?: string }>
  label: string
  meta: string
  title: string
}) {
  return (
    <Link className="manage-update-item" href={href}>
      <span className="manage-update-icon">
        <Icon />
      </span>
      <span>
        <span className="manage-update-label">{label}</span>
        <strong>{title}</strong>
      </span>
      <em>{meta}</em>
    </Link>
  )
}

function RecentList({
  hrefPrefix,
  icon: Icon = Newspaper,
  items,
  title,
}: {
  hrefPrefix: string
  icon?: ComponentType<{ className?: string }>
  items: { date?: string | null; id: number; title?: string | null }[]
  title: string
}) {
  return (
    <div className="manage-content-column">
      <div className="manage-column-head">
        <Icon />
        <h3>{title}</h3>
      </div>
      <div className="manage-column-list">
        {items.length ? (
          items.map((item) => (
            <Link className="manage-column-item" href={`${hrefPrefix}/${item.id}`} key={item.id}>
              <strong>{item.title || '-'}</strong>
              <span>{formatKoreanDate(item.date)}</span>
            </Link>
          ))
        ) : (
          <span className="manage-column-empty">표시할 항목 없음</span>
        )}
      </div>
    </div>
  )
}
