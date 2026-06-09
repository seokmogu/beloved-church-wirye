import Link from 'next/link'

import { DeleteButton, SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ImageCompressor } from '@/app/(manage)/manage/_components/ImageCompressor'
import { ImageUploadFields } from '@/app/(manage)/manage/_components/ImageUploadFields'
import { deleteBulletinAction, saveBulletinAction } from '@/app/(manage)/manage/actions'
import { toDateInputValue } from '@/lib/manage/date'
import type { Bulletin } from '@/payload-types'

export function BulletinForm({ doc }: { doc?: Bulletin }) {
  return (
    <>
      <form action={saveBulletinAction} className="manage-form">
        <ImageCompressor />
        {doc ? <input name="id" type="hidden" value={doc.id} /> : null}
        <div className="manage-field">
          <label htmlFor="title">제목</label>
          <input defaultValue={doc?.title || ''} id="title" name="title" />
        </div>
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="date">주보 날짜</label>
            <input
              defaultValue={toDateInputValue(doc?.date)}
              id="date"
              name="date"
              required
              type="date"
            />
          </div>
          <label className="manage-checkbox" style={{ alignSelf: 'end', minHeight: 42 }}>
            <input defaultChecked={doc?.isPublic !== false} name="isPublic" type="checkbox" />
            <span>공개</span>
          </label>
        </div>
        <div className="manage-field">
          <label htmlFor="description">설교 제목 / 메모</label>
          <textarea
            defaultValue={doc?.description || ''}
            id="description"
            name="description"
            rows={5}
          />
        </div>
        <ImageUploadFields docImages={doc?.images} prefix="bulletin" title="주보 이미지" />
        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage/bulletins">
            취소
          </Link>
          <SaveButton />
        </div>
      </form>
      {doc ? (
        <form action={deleteBulletinAction} className="manage-form" style={{ marginTop: 14 }}>
          <input name="id" type="hidden" value={doc.id} />
          <div className="manage-form-actions">
            <DeleteButton />
          </div>
        </form>
      ) : null}
    </>
  )
}
