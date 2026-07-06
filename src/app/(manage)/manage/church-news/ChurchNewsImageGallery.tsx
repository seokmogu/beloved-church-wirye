'use client'

import Image from 'next/image'
import { useState } from 'react'

export type GalleryItem = {
  alt: string
  caption: string
  mediaId: string
  rowId: string
  url: string | null
}

/**
 * 등록된 이미지를 그리드 갤러리로 보여주고 ←/→ 버튼으로 표시 순서를 바꾼다.
 * 저장 액션이 hidden input의 DOM 순서를 그대로 저장 순서로 쓰므로,
 * 카드 순서만 바꾸면 공개 갤러리 순서도 함께 바뀐다.
 */
export function ChurchNewsImageGallery({ items: initialItems }: { items: GalleryItem[] }) {
  const [items, setItems] = useState(initialItems)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  if (items.length === 0) return null

  return (
    <section aria-label="등록된 이미지 (표시 순서대로)" className="manage-image-gallery">
      {items.map((item, index) => (
        <figure className="manage-image-card" key={item.rowId || `${item.mediaId}-${index}`}>
          <input name="churchNewsImageRowId" type="hidden" value={item.rowId} />
          <input name="churchNewsImageId" type="hidden" value={item.mediaId} />

          <div className="manage-image-card-thumb">
            {item.url ? (
              <Image alt={item.alt} fill sizes="220px" src={item.url} unoptimized />
            ) : (
              <span>이미지 미리보기 없음</span>
            )}
          </div>

          <div className="manage-image-card-order">
            <button
              aria-label="앞으로 이동"
              className="manage-image-order-button"
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
              type="button"
            >
              &larr;
            </button>
            <span>
              {index + 1} / {items.length}
            </span>
            <button
              aria-label="뒤로 이동"
              className="manage-image-order-button"
              disabled={index === items.length - 1}
              onClick={() => move(index, index + 1)}
              type="button"
            >
              &rarr;
            </button>
          </div>

          <input
            defaultValue={item.caption}
            name="churchNewsImageCaption"
            placeholder="이미지 설명 (선택)"
            type="text"
          />
          <label className="manage-checkbox compact">
            <input name={`churchNewsRemoveImage-${index}`} type="checkbox" />
            삭제
          </label>
        </figure>
      ))}
    </section>
  )
}
