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
import { getGoogleAnalyticsSummary, type GoogleAnalyticsSummary } from '@/lib/googleAnalytics'
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

  const [
    announcements,
    churchNews,
    churchVideos,
    sermons,
    bulletins,
    newcomers,
    pendingNewcomers,
    analytics,
  ] = await Promise.all([
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
      getGoogleAnalyticsSummary(),
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

      <AnalyticsPanel analytics={analytics} />

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

function AnalyticsPanel({ analytics }: { analytics: GoogleAnalyticsSummary }) {
  if (analytics.status !== 'ready') {
    return (
      <section className="manage-panel manage-analytics-panel" aria-label="웹사이트 주요 지표">
        <div className="manage-panel-head">
          <div>
            <span className="manage-kicker">Google Analytics</span>
            <h2>웹사이트 주요 지표</h2>
          </div>
          <span className="manage-analytics-period">최근 28일</span>
        </div>
        <p className="manage-analytics-status">
          {analytics.status === 'not-configured'
            ? '분석 연결을 준비 중입니다. 연결되면 이곳에 실제 방문·클릭·새가족 전환 지표가 표시됩니다.'
            : 'Google Analytics 데이터를 지금 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.'}
        </p>
      </section>
    )
  }

  const clickRate = analytics.pageViews ? analytics.clicks / analytics.pageViews : null
  const newcomerConversionRate = analytics.newcomerPageViews
    ? analytics.leadConversions / analytics.newcomerPageViews
    : null

  return (
    <section className="manage-panel manage-analytics-panel" aria-label="웹사이트 주요 지표">
      <div className="manage-panel-head">
        <div>
          <span className="manage-kicker">Google Analytics</span>
          <h2>웹사이트 주요 지표</h2>
        </div>
        <span className="manage-analytics-period">최근 28일</span>
      </div>
      <div className="manage-analytics-grid">
        <AnalyticsMetric label="PV" value={formatNumber(analytics.pageViews)} />
        <AnalyticsMetric label="AU" value={formatNumber(analytics.activeUsers)} />
        <AnalyticsMetric detail={`${formatNumber(analytics.clicks)}회 클릭`} label="클릭률" value={formatPercent(clickRate)} />
        <AnalyticsMetric
          detail={`${formatNumber(analytics.leadConversions)}건 새가족 등록`}
          label="새가족 전환율"
          value={formatPercent(newcomerConversionRate)}
        />
      </div>
      <p className="manage-analytics-note">
        클릭률은 전체 페이지 조회 대비 `ui_click`, 전환율은 새가족 페이지 조회 대비 `generate_lead` 기준입니다.
      </p>
    </section>
  )
}

function AnalyticsMetric({ detail, label, value }: { detail?: string; label: string; value: string }) {
  return (
    <div className="manage-analytics-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatPercent(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1, style: 'percent' }).format(value)
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
