import Link from 'next/link'

export function AnnouncementBoardGuide() {
  return (
    <section
      data-testid="announcement-board-guide"
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        marginBottom: 24,
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>공지사항 게시판</h2>
          <p style={{ color: 'var(--theme-elevation-650)', margin: '6px 0 0' }}>
            여기서 공지 글을 작성하면 사이트의 <code>/announcements</code> 게시판에 자동으로
            표시됩니다. 공지사항용 일반 페이지를 새로 만들 필요가 없습니다.
          </p>
          <p style={{ color: 'var(--theme-elevation-650)', margin: '6px 0 0' }}>
            상단메뉴에 노출하려면 상단메뉴에서 링크 유형을 “사이트 고정페이지”로 두고 “공지사항”을
            선택하세요.
          </p>
        </div>

        <div style={{ alignItems: 'flex-start', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link
            className="btn btn--style-primary btn--size-small"
            href="/admin/collections/announcements/create"
          >
            공지 글 쓰기
          </Link>
          <Link className="btn btn--style-secondary btn--size-small" href="/announcements">
            게시판 보기
          </Link>
          <Link className="btn btn--style-secondary btn--size-small" href="/admin/globals/header">
            상단메뉴 편집
          </Link>
        </div>
      </div>
    </section>
  )
}
