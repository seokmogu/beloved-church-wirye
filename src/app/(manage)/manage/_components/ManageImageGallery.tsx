'use client'

import Image from 'next/image'
import { useState } from 'react'

export type ManageGalleryItem = {
  alt: string
  caption: string
  imageId: string
  rowId?: string
  url: string | null
}

type NameTemplates = {
  /** 캡션 input name. '{i}' 자리에 현재 인덱스가 들어간다. 없으면 위치 기반(name 동일) */
  caption: string
  /** 이미지 id hidden input name (위치 기반) */
  imageId: string
  /** 삭제 체크박스 name. '{i}' 자리에 현재 인덱스 */
  remove: string
  /** 배열 row id hidden input name (선택, 위치 기반) */
  rowId?: string
}

function withIndex(template: string, index: number) {
  return template.replace('{i}', String(index))
}

/**
 * 관리 폼 공용 이미지 갤러리: 그리드 카드 + 썸네일 드래그/←→ 버튼으로 순서 변경.
 * 저장 액션이 hidden input의 DOM 순서를 그대로 저장 순서로 쓰므로(위치 기반 파싱),
 * 카드 순서를 바꾸면 공개 화면 순서도 함께 바뀐다. 캡션/삭제는 현재 인덱스 기준.
 * (터치 기기는 HTML5 드래그가 없어 ←/→ 버튼이 대체 수단)
 */
export function ManageImageGallery({
  items: initialItems,
  names,
}: {
  items: ManageGalleryItem[]
  names: NameTemplates
}) {
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
      {items.map((item, index) => {
        return (
          <figure
            className={`manage-image-card${overIndex === index && dragIndex !== index ? ' drag-over' : ''}${dragIndex === index ? ' dragging' : ''}`}
            key={item.rowId || `${item.imageId}-${index}`}
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
            {names.rowId ? <input name={names.rowId} type="hidden" value={item.rowId || ''} /> : null}
            <input name={names.imageId} type="hidden" value={item.imageId} />

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
              name={withIndex(names.caption, index)}
              placeholder="이미지 설명 (선택)"
              type="text"
            />
            <label className="manage-checkbox compact">
              <input name={withIndex(names.remove, index)} type="checkbox" />
              삭제
            </label>
          </figure>
        )
      })}
    </section>
  )
}
