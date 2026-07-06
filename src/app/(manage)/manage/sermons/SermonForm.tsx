import Link from 'next/link'

import { DeleteButton, SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { deleteSermonAction, saveSermonAction } from '@/app/(manage)/manage/actions'
import { toDateInputValue } from '@/lib/manage/date'
import type { Sermon } from '@/payload-types'

export function SermonForm({ doc, error }: { doc?: Sermon; error?: string }) {
  return (
    <>
      <form action={saveSermonAction} className="manage-form">
        {doc ? <input name="id" type="hidden" value={doc.id} /> : null}
        {error === 'save' ? (
          <div className="manage-alert danger" role="alert">
            저장에 실패했습니다. YouTube 주소 등 입력값을 확인한 뒤 다시 시도해 주세요.
          </div>
        ) : null}
        <div className="manage-field">
          <label htmlFor="title">제목</label>
          <input defaultValue={doc?.title || ''} id="title" name="title" required />
        </div>
        <div className="manage-field">
          <label htmlFor="youtubeUrl">YouTube URL</label>
          <input
            defaultValue={doc?.youtubeUrl || ''}
            id="youtubeUrl"
            name="youtubeUrl"
            required
            type="url"
          />
        </div>
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="sermonDate">설교 날짜</label>
            <input
              defaultValue={toDateInputValue(doc?.sermonDate)}
              id="sermonDate"
              name="sermonDate"
              required
              type="date"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="status">상태</label>
            <select defaultValue={doc?.status || 'published'} id="status" name="status">
              <option value="published">공개</option>
              <option value="draft">초안</option>
            </select>
          </div>
        </div>
        {/* 설교자/성경본문/시리즈/설명은 공개 화면에 표시되지 않아 입력을 받지 않는다 */}
        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage/sermons">
            취소
          </Link>
          <SaveButton />
        </div>
      </form>
      {doc ? (
        <form action={deleteSermonAction} className="manage-form" style={{ marginTop: 14 }}>
          <input name="id" type="hidden" value={doc.id} />
          <div className="manage-form-actions">
            <DeleteButton />
          </div>
        </form>
      ) : null}
    </>
  )
}
