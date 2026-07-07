'use client'

import { useId, useState } from 'react'

import { normalizeInstagramPostInput } from '@/lib/instagramPost'

export type EditorPost = {
  postId: string
  type: 'p' | 'reel'
}

type Row = EditorPost & { key: string }

const POST_ID_PATTERN = /^[A-Za-z0-9_-]{5,}$/

/**
 * 인스타그램 게시물 편집기: URL을 붙여넣으면 ID·종류를 자동 인식해 카드로 추가하고,
 * 카드마다 실제 임베드 미리보기를 보여준다. 카드 순서(드래그 또는 ←/→)가 그대로
 * 홈 노출 순서가 된다. 폼 필드명은 기존 저장 액션과 동일(위치 기반)이라 서버 변경이 없다.
 */
export function InstagramPostsEditor({ initialPosts }: { initialPosts: EditorPost[] }) {
  const inputId = useId()
  const [rows, setRows] = useState<Row[]>(
    initialPosts.map((post, index) => ({ ...post, key: `initial-${post.postId}-${index}` })),
  )
  const [draft, setDraft] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const addFromDraft = () => {
    const { isReel, postId } = normalizeInstagramPostInput(draft)
    if (!postId || !POST_ID_PATTERN.test(postId)) {
      setAddError('게시물 URL 또는 ID를 확인해 주세요. 예: https://www.instagram.com/p/ABC123/')
      return
    }
    if (rows.some((row) => row.postId === postId)) {
      setAddError('이미 목록에 있는 게시물입니다.')
      return
    }

    setRows((prev) => [
      { key: `added-${postId}-${prev.length}`, postId, type: isReel ? 'reel' : 'p' },
      ...prev,
    ])
    setDraft('')
    setAddError(null)
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return
    setRows((prev) => {
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

  return (
    <section className="manage-grid">
      <h2 className="manage-section-title">게시물</h2>

      <div className="manage-insta-add">
        <div className="manage-field" style={{ flex: 1 }}>
          <label htmlFor={inputId}>게시물 추가 — 인스타그램 게시물 주소를 붙여넣으세요</label>
          <input
            id={inputId}
            onChange={(event) => {
              setDraft(event.target.value)
              setAddError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addFromDraft()
              }
            }}
            placeholder="https://www.instagram.com/p/... 또는 /reel/..."
            value={draft}
          />
        </div>
        <button className="manage-button" onClick={addFromDraft} type="button">
          추가
        </button>
      </div>
      {addError ? (
        <div className="manage-alert danger" role="alert">
          {addError}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="manage-empty-hint">
          아직 게시물이 없습니다. 위에 게시물 주소를 붙여넣어 추가하세요.
        </p>
      ) : (
        <div className="manage-insta-grid">
          {rows.map((row, index) => {
            const embeddable = POST_ID_PATTERN.test(row.postId)

            return (
              <figure
                className={`manage-insta-card${overIndex === index && dragIndex !== index ? ' drag-over' : ''}${dragIndex === index ? ' dragging' : ''}`}
                key={row.key}
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
                <input name="instagramPostType" type="hidden" value={row.type} />
                <input name="instagramPostId" type="hidden" value={row.postId} />

                <div
                  className="manage-insta-preview"
                  draggable
                  onDragEnd={endDrag}
                  onDragStart={(event) => {
                    setDragIndex(index)
                    event.dataTransfer.effectAllowed = 'move'
                  }}
                  title="끌어서 순서 변경"
                >
                  {embeddable ? (
                    <iframe
                      loading="lazy"
                      src={`https://www.instagram.com/${row.type === 'reel' ? 'reel' : 'p'}/${row.postId}/embed/`}
                      title={`Instagram ${row.postId}`}
                    />
                  ) : (
                    <span>미리보기를 표시할 수 없습니다</span>
                  )}
                </div>

                <div className="manage-insta-meta">
                  <span className={`manage-insta-kind${row.type === 'reel' ? ' reel' : ''}`}>
                    {row.type === 'reel' ? '릴스' : '게시물'}
                  </span>
                  <span className="manage-insta-order-label">
                    {index + 1} / {rows.length}
                  </span>
                  <button
                    aria-label="앞으로 이동"
                    className="manage-image-order-button"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    type="button"
                  >
                    &larr;
                  </button>
                  <button
                    aria-label="뒤로 이동"
                    className="manage-image-order-button"
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, index + 1)}
                    type="button"
                  >
                    &rarr;
                  </button>
                  <button
                    className="manage-image-order-button"
                    onClick={() => setRows((prev) => prev.filter((item) => item.key !== row.key))}
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              </figure>
            )
          })}
        </div>
      )}

      <p className="manage-empty-hint">
        카드 순서(왼쪽 위부터)가 그대로 홈 노출 순서입니다. 미리보기를 끌어서 순서를 바꾸고,
        저장을 눌러야 반영됩니다.
      </p>
    </section>
  )
}
