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
        <fieldset className="manage-field" style={{ marginTop: 24 }}>
          <legend>설교 전사본 (선택)</legend>
          <p className="manage-field-description">
            자동 전사본은 오류가 있을 수 있다는 안내와 함께 공개됩니다. 전사 내용이 없으면 페이지에
            표시되지 않습니다.
          </p>
          <label htmlFor="transcriptStatus">전사 상태</label>
          <select
            defaultValue={doc?.transcriptStatus || 'unavailable'}
            id="transcriptStatus"
            name="transcriptStatus"
          >
            <option value="unavailable">전사본 없음</option>
            <option value="automatic">자동 전사본</option>
            <option value="reviewed">검수 완료</option>
          </select>
          <label htmlFor="transcriptSource">전사 출처</label>
          <select
            defaultValue={doc?.transcriptSource || ''}
            id="transcriptSource"
            name="transcriptSource"
          >
            <option value="">선택 안 함</option>
            <option value="whisper">Whisper</option>
            <option value="youtube_automatic">YouTube 자동 자막</option>
            <option value="combined">Whisper·YouTube 대조</option>
            <option value="manual">관리자 직접 입력</option>
          </select>
          <label htmlFor="publicTranscript">공개 전사본</label>
          <textarea
            defaultValue={doc?.publicTranscript || ''}
            id="publicTranscript"
            name="publicTranscript"
            placeholder="자동 전사한 설교 내용을 붙여넣으세요."
            rows={16}
          />
        </fieldset>
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
