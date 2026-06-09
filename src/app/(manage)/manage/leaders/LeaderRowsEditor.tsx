'use client'

import { useState } from 'react'

export type LeaderRowData = {
  name?: string | null
  title?: string | null
  role?: string | null
  bio?: string | null
  photoUrl?: string | null
}

function cssUrl(url: string) {
  return `url(${JSON.stringify(url)})`
}

/**
 * Client editor for "추가 섬기는 사람들". Existing leaders render at fixed indices 0..N-1
 * (so the server action's per-index photo preservation stays aligned); the "+ 추가" button
 * only appends blank rows beyond them, so any number of leaders can be added. Removing a
 * person is done by clearing the name (server drops empty-name rows).
 */
export function LeaderRowsEditor({ initialLeaders }: { initialLeaders: LeaderRowData[] }) {
  const base = initialLeaders.length
  const [extra, setExtra] = useState(() => Math.max(1, 4 - base))
  const rows: LeaderRowData[] = [...initialLeaders, ...Array.from({ length: extra }, () => ({}))]

  return (
    <>
      <div className="manage-public-card-grid two">
        {rows.map((row, index) => (
          <article className="manage-public-card edit-card" key={index}>
            <aside className="manage-public-photo-editor">
              <div
                aria-hidden="true"
                className="manage-public-photo-preview"
                style={row.photoUrl ? { backgroundImage: cssUrl(row.photoUrl) } : undefined}
              >
                {row.photoUrl ? null : <span>사진 없음</span>}
              </div>
              <label htmlFor={`leaderPhotoFile-${index}`}>
                사진 변경
                <input
                  accept="image/*"
                  id={`leaderPhotoFile-${index}`}
                  name={`leaderPhotoFile-${index}`}
                  type="file"
                />
              </label>
              {row.photoUrl ? (
                <label className="manage-checkbox compact" htmlFor={`leaderClearPhoto-${index}`}>
                  <input
                    id={`leaderClearPhoto-${index}`}
                    name={`leaderClearPhoto-${index}`}
                    type="checkbox"
                  />
                  사진 제거
                </label>
              ) : null}
            </aside>
            <label className="manage-visual-field heading">
              <span>이름 (비우면 미노출)</span>
              <input defaultValue={row.name || ''} name="leaderName" />
            </label>
            <label className="manage-visual-field accent">
              <span>직함</span>
              <input defaultValue={row.title || ''} name="leaderTitle" />
            </label>
            <label className="manage-visual-field muted">
              <span>역할/구분</span>
              <input defaultValue={row.role || ''} name="leaderRole" />
            </label>
            <label className="manage-visual-field muted">
              <span>소개</span>
              <textarea defaultValue={row.bio || ''} name="leaderBio" rows={4} />
            </label>
          </article>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="manage-button secondary"
          onClick={() => setExtra((value) => value + 1)}
          type="button"
        >
          + 섬기는 사람 추가
        </button>
      </div>
    </>
  )
}
