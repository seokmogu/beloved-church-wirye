import Image from 'next/image'
import Link from 'next/link'

import { DeleteButton, SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { deleteChurchNewsAction, saveChurchNewsAction } from '@/app/(manage)/manage/actions'
import { toDateInputValue } from '@/lib/manage/date'
import type { ChurchNew, Media } from '@/payload-types'

import { ChurchNewsImagePicker } from './ChurchNewsImagePicker'

type ChurchNewsImage = NonNullable<ChurchNew['images']>[number]

const errorMessages: Record<string, string> = {
  generic: '교회소식을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  storage:
    '이미지 저장소 설정이 필요합니다. 운영 Vercel 환경 변수 BLOB_READ_WRITE_TOKEN을 확인해 주세요.',
  upload: '이미지를 저장하지 못했습니다. 이미지 파일을 다시 선택해서 저장해 주세요.',
}

export function ChurchNewsForm({ doc, error }: { doc?: ChurchNew; error?: string }) {
  const images = doc?.images || []

  return (
    <>
      <form action={saveChurchNewsAction} className="manage-form">
        {doc ? <input name="id" type="hidden" value={doc.id} /> : null}
        <div className="manage-field">
          <label htmlFor="title">제목</label>
          <input defaultValue={doc?.title || ''} id="title" name="title" required />
        </div>
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="date">일자</label>
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
        {/* 폼에 이 필드가 없으면 저장 액션이 description을 null로 덮어써 기존값이 소실된다 */}
        <div className="manage-field">
          <label htmlFor="description">설명 / 메모</label>
          <textarea
            defaultValue={doc?.description || ''}
            id="description"
            name="description"
            rows={3}
          />
        </div>
        <ChurchNewsImagePicker />

        {error ? (
          <div className="manage-alert danger" role="alert">
            {errorMessages[error] || errorMessages.generic}
          </div>
        ) : null}

        {images.length ? (
          <section className="manage-image-list" aria-label="등록된 이미지">
            {images.map((item, index) => {
              const media = resolveMedia(item)
              const url = imageUrl(media)
              const mediaId = mediaRelationId(item)
              return (
                <div className="manage-image-row" key={item.id || `${mediaId}-${index}`}>
                  <input name="churchNewsImageRowId" type="hidden" value={item.id || ''} />
                  <input name="churchNewsImageId" type="hidden" value={mediaId} />
                  <div className="manage-image-preview">
                    {url ? (
                      <Image
                        alt={media?.alt || item.caption || `교회소식 이미지 ${index + 1}`}
                        height={150}
                        src={url}
                        unoptimized
                        width={120}
                      />
                    ) : (
                      <span>이미지 미리보기 없음</span>
                    )}
                  </div>
                  <input
                    defaultValue={item.caption || ''}
                    name="churchNewsImageCaption"
                    placeholder="이미지 설명 (선택)"
                    type="text"
                  />
                  <label className="manage-checkbox compact">
                    <input name={`churchNewsRemoveImage-${index}`} type="checkbox" />
                    삭제
                  </label>
                </div>
              )
            })}
          </section>
        ) : null}

        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage/church-news">
            취소
          </Link>
          <SaveButton />
        </div>
      </form>
      {doc ? (
        <form action={deleteChurchNewsAction} className="manage-form" style={{ marginTop: 14 }}>
          <input name="id" type="hidden" value={doc.id} />
          <div className="manage-form-actions">
            <DeleteButton />
          </div>
        </form>
      ) : null}
    </>
  )
}

function resolveMedia(item: ChurchNewsImage): Media | null {
  return typeof item.image === 'object' && item.image ? item.image : null
}

function imageUrl(media: Media | null): string | null {
  return media?.sizes?.small?.url || media?.url || null
}

function mediaRelationId(item: ChurchNewsImage): string {
  if (typeof item.image === 'number' || typeof item.image === 'string') return String(item.image)
  return item.image?.id ? String(item.image.id) : ''
}
