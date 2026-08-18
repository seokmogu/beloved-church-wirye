import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'
import { formatKoreanDate } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageGalleryPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const albums = await payload.find({ collection: 'gallery-albums', limit: 80, sort: '-eventDate' })

  return (
    <ManageShell active="gallery" user={user}>
      <PageHeader
        actionHref="/manage/gallery/new"
        actionLabel="앨범 추가"
        description="행사 사진을 앨범별로 등록하고 사이트 공개 여부를 관리합니다. 사진은 R2 전용 저장소에 보관됩니다."
        title="행사갤러리"
      />
      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>앨범</th>
              <th>행사 일자</th>
              <th>사진</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {albums.docs.length ? (
              albums.docs.map((album) => (
                <tr key={album.id}>
                  <td className="manage-table-title">{album.title}</td>
                  <td>{formatKoreanDate(album.eventDate)}</td>
                  <td>{album.images?.length || 0}장</td>
                  <td>
                    {album.isPublic ? (
                      <span className="manage-badge">공개</span>
                    ) : (
                      <span className="manage-badge draft">비공개</span>
                    )}
                  </td>
                  <td>
                    <Link className="manage-button secondary" href={`/manage/gallery/${album.id}`}>
                      편집
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="manage-empty" colSpan={5}>
                  등록된 행사갤러리 앨범이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ManageShell>
  )
}
