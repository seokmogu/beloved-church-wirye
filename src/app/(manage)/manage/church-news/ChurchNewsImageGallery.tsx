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
 * 등록된 이미지를 그리드 갤러리로 보여주고, 썸네일 드래그 또는 ←/→ 버튼으로
 * 표시 순서를 바꾼다. 저장 액션이 hidden input의 DOM 순서를 그대로 저장
 * 순서로 쓰므로, 카드 순서만 바꾸면 공개 갤러리 순서도 함께 바뀐다.
 * (터치 기기는 HTML5 드래그가 없어 ←/→ 버튼이 대체 수단)
 */
export function ChurchNewsImageGallery({ items: initialItems }: { items: GalleryItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const endDrag = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  if (items.length === 0) return null

  return (
    <section aria-label="등록된 이미지 (표시 순서대로)" className="manage-image-gallery">
      {items.map((item, index) => (
        <figure
          className={`manage-image-card${overIndex === index && dragIndex !== index ? ' drag-over' : ''}${dragIndex === index ? ' dragging' : ''}`}
          key={item.rowId || `${item.mediaId}-${index}`}
          onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
          onDragOver={(event) => {
            if (dragIndex === null) return
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            setOverIndex(index)
          }}
          onDrop={(event) => {
            event.preventDefault()
            if (dragIndex !== null && dragIndex !== index) move(dragIndex, index)
            endDrag()
          }}
        >
          <input name="churchNewsImageRowId" type="hidden" value={item.rowId} />
          <input name="churchNewsImageId" type="hidden" value={item.mediaId} />

          <div
            className="manage-image-card-thumb"
            draggable
            onDragEnd={endDrag}
            onDragStart={(event) => {
              setDragIndex(index)
              event.dataTransfer.effectAllowed = 'move'
            }}
            title="끌어서 순서 변경"
          >
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
