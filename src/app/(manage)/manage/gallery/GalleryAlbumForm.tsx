import Link from 'next/link'

import { DeleteButton, SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageImageGallery } from '@/app/(manage)/manage/_components/ManageImageGallery'
import { deleteGalleryAlbumAction, saveGalleryAlbumAction } from '@/app/(manage)/manage/actions'
import { toDateInputValue } from '@/lib/manage/date'
import type { GalleryAlbum, GalleryMedia } from '@/payload-types'

import { GalleryImagePicker } from './GalleryImagePicker'

type GalleryImage = NonNullable<GalleryAlbum['images']>[number]

const errorMessages: Record<string, string> = {
  save: '앨범을 저장하지 못했습니다. 입력한 내용과 사진을 확인한 뒤 다시 시도해 주세요.',
  storage: 'R2 저장소 설정이 아직 완료되지 않았습니다.',
  upload: '사진을 저장하지 못했습니다. 사진을 다시 선택해 주세요.',
}

export function GalleryAlbumForm({ doc, error }: { doc?: GalleryAlbum; error?: string }) {
  const images = doc?.images || []

  return (
    <>
      <form action={saveGalleryAlbumAction} className="manage-form">
        {doc ? <input name="id" type="hidden" value={doc.id} /> : null}
        <div className="manage-field">
          <label htmlFor="title">앨범 제목</label>
          <input defaultValue={doc?.title || ''} id="title" name="title" required />
        </div>
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="eventDate">행사 일자</label>
            <input
              defaultValue={toDateInputValue(doc?.eventDate)}
              id="eventDate"
              name="eventDate"
              required
              type="date"
            />
          </div>
          <label className="manage-checkbox" style={{ alignSelf: 'end', minHeight: 42 }}>
            <input defaultChecked={doc?.isPublic === true} name="isPublic" type="checkbox" />
            <span>공개 갤러리에 표시</span>
          </label>
        </div>
        <p className="manage-field-hint" style={{ marginTop: -8 }}>
          공개를 해제하면 사이트 행사갤러리에는 표시되지 않고 관리자 화면에서만 관리할 수 있습니다.
        </p>
        <div className="manage-field">
          <label htmlFor="description">앨범 소개</label>
          <textarea defaultValue={doc?.description || ''} id="description" name="description" rows={3} />
        </div>

        <GalleryImagePicker />

        <section className="manage-card">
          <h2 className="text-base font-bold text-foreground">등록된 사진</h2>
          <p className="manage-field-hint" style={{ marginTop: 8 }}>
            사진을 끌거나 좌우 버튼으로 순서를 바꿀 수 있습니다. 맨 첫 사진이 앨범 대표 사진입니다.
          </p>
          <ManageImageGallery
            items={images.map((item, index) => {
              const media = resolveMedia(item)
              return {
                alt: media?.alt || item.caption || `${doc?.title || '행사갤러리'} 사진 ${index + 1}`,
                caption: item.caption || '',
                imageId: mediaRelationId(item),
                rowId: item.id || '',
                url: imageUrl(media),
              }
            })}
            names={{
              caption: 'galleryImageCaption',
              imageId: 'galleryImageId',
              remove: 'galleryRemoveImage-{i}',
              rowId: 'galleryImageRowId',
            }}
          />
        </section>

        {error ? (
          <div className="manage-alert danger" role="alert">
            {errorMessages[error] || errorMessages.save}
          </div>
        ) : null}

        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage/gallery">
            취소
          </Link>
          <SaveButton />
        </div>
      </form>
      {doc ? (
        <form action={deleteGalleryAlbumAction} className="manage-form" style={{ marginTop: 14 }}>
          <input name="id" type="hidden" value={doc.id} />
          <div className="manage-form-actions">
            <DeleteButton />
          </div>
        </form>
      ) : null}
    </>
  )
}

function resolveMedia(item: GalleryImage): GalleryMedia | null {
  return typeof item.image === 'object' && item.image ? item.image : null
}

function imageUrl(media: GalleryMedia | null): string | null {
  return media?.sizes?.thumbnail?.url || media?.url || null
}

function mediaRelationId(item: GalleryImage): string {
  if (typeof item.image === 'number' || typeof item.image === 'string') return String(item.image)
  return item.image?.id ? String(item.image.id) : ''
}
