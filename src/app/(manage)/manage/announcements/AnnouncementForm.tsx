import Link from 'next/link'

import { DeleteButton, SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ImageCompressor } from '@/app/(manage)/manage/_components/ImageCompressor'
import { ImageUploadFields } from '@/app/(manage)/manage/_components/ImageUploadFields'
import { deleteAnnouncementAction, saveAnnouncementAction } from '@/app/(manage)/manage/actions'
import { toDateTimeInputValue } from '@/lib/manage/date'
import { lexicalToPlaintext } from '@/lib/manage/lexical'
import type { Announcement } from '@/payload-types'

export function AnnouncementForm({ doc }: { doc?: Announcement }) {
  return (
    <>
      <form action={saveAnnouncementAction} className="manage-form">
        <ImageCompressor />
        {doc ? <input name="id" type="hidden" value={doc.id} /> : null}
        <div className="manage-field">
          <label htmlFor="title">제목</label>
          <input defaultValue={doc?.title || ''} id="title" name="title" required />
        </div>
        <div className="manage-field">
          <label htmlFor="content">내용</label>
          <textarea
            defaultValue={lexicalToPlaintext(doc?.content)}
            id="content"
            name="content"
            rows={10}
          />
        </div>
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="publishedAt">게시일</label>
            <input
              defaultValue={toDateTimeInputValue(doc?.publishedAt)}
              id="publishedAt"
              name="publishedAt"
              required
              type="datetime-local"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="googleDriveLink">구글드라이브 링크</label>
            <input
              defaultValue={doc?.googleDriveLink || ''}
              id="googleDriveLink"
              name="googleDriveLink"
              type="url"
            />
          </div>
        </div>
        <label className="manage-checkbox">
          <input defaultChecked={Boolean(doc?.isPinned)} name="isPinned" type="checkbox" />
          <span>상단 고정</span>
        </label>
        {/* 이미지 섹션은 교회소식/주보 폼과 동일하게 마지막에 배치 */}
        <ImageUploadFields docImages={doc?.images} prefix="announcement" title="행사 사진" />
        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage/announcements">
            취소
          </Link>
          <SaveButton />
        </div>
      </form>
      {doc ? (
        <form action={deleteAnnouncementAction} className="manage-form" style={{ marginTop: 14 }}>
          <input name="id" type="hidden" value={doc.id} />
          <div className="manage-form-actions">
            <DeleteButton />
          </div>
        </form>
      ) : null}
    </>
  )
}
