import Link from 'next/link'

const fixedPages = [
  {
    title: '홈',
    type: '기본 페이지',
    path: '/',
    editLabel: '홈페이지 빌더에서 편집',
    editHref: '/admin/globals/site-settings',
    publicHref: '/',
  },
  {
    title: '교회소개',
    type: '기본 페이지',
    path: '/about',
    editLabel: '교회 정보에서 편집',
    editHref: '/admin/globals/site-settings',
    publicHref: '/about',
  },
  {
    title: '예배안내',
    type: '기본 페이지',
    path: '/worship',
    editLabel: '예배/오시는 길에서 편집',
    editHref: '/admin/globals/site-settings',
    publicHref: '/worship',
  },
  {
    title: '설교영상',
    type: '콘텐츠 게시판',
    path: '/sermon',
    editLabel: '설교영상 작성과 자동 채널 설정',
    editHref: '/admin/collections/sermons',
    publicHref: '/sermon',
  },
  {
    title: '동영상',
    type: '콘텐츠 게시판',
    path: '/church-news/videos',
    editLabel: '동영상을 수동 등록하면 표시',
    editHref: '/admin/collections/church-videos',
    publicHref: '/church-news/videos',
  },
  {
    title: '공지사항',
    type: '콘텐츠 게시판',
    path: '/announcements',
    editLabel: '공지 글을 작성하면 자동 표시',
    editHref: '/admin/collections/announcements',
    publicHref: '/announcements',
  },
  {
    title: '주보',
    type: '콘텐츠 게시판',
    path: '/bulletins',
    editLabel: '주보를 작성하면 자동 표시',
    editHref: '/admin/collections/bulletins',
    publicHref: '/bulletins',
  },
  {
    title: '헌금안내',
    type: '기본 페이지',
    path: '/offering',
    editLabel: '헌금안내페이지에서 편집',
    editHref: '/admin/globals/offering-page',
    publicHref: '/offering',
  },
  {
    title: '새가족등록',
    type: '고정 폼',
    path: '/newcomer',
    editLabel: '고정 폼 페이지',
    editHref: '/admin/collections/newcomers',
    publicHref: '/newcomer',
  },
]

export function FixedPagesPanel() {
  return (
    <section
      data-testid="fixed-pages-panel"
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        marginBottom: 24,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--theme-elevation-150)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          padding: '16px 18px',
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, margin: 0 }}>기본 페이지와 콘텐츠 게시판</h2>
          <p
            style={{
              color: 'var(--theme-elevation-650)',
              margin: '6px 0 0',
              maxWidth: 760,
            }}
          >
            아래 URL은 사이트에 기본으로 존재합니다. 공지사항/설교영상/동영상/주보는 페이지를 새로
            만드는 것이 아니라 해당 콘텐츠를 작성하면 게시판에 쌓입니다.
          </p>
        </div>
        <Link
          className="btn btn--style-secondary btn--size-small"
          href="/admin/collections/pages/create"
        >
          새 일반 페이지 만들기
        </Link>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            minWidth: 880,
            width: '100%',
          }}
        >
          <thead>
            <tr style={{ color: 'var(--theme-elevation-650)', textAlign: 'left' }}>
              <th style={{ fontWeight: 500, padding: '12px 18px' }}>페이지</th>
              <th style={{ fontWeight: 500, padding: '12px 18px' }}>유형</th>
              <th style={{ fontWeight: 500, padding: '12px 18px' }}>URL</th>
              <th style={{ fontWeight: 500, padding: '12px 18px' }}>관리 위치</th>
              <th style={{ fontWeight: 500, padding: '12px 18px' }}>바로가기</th>
            </tr>
          </thead>
          <tbody>
            {fixedPages.map((page) => (
              <tr
                key={page.path}
                style={{
                  borderTop: '1px solid var(--theme-elevation-150)',
                }}
              >
                <td style={{ padding: '14px 18px' }}>
                  <strong>{page.title}</strong>
                </td>
                <td style={{ padding: '14px 18px' }}>{page.type}</td>
                <td style={{ padding: '14px 18px' }}>
                  <code>{page.path}</code>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <a href={page.editHref}>{page.editLabel}</a>
                </td>
                <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                  <a href={page.publicHref} rel="noreferrer" target="_blank">
                    사이트에서 보기
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
