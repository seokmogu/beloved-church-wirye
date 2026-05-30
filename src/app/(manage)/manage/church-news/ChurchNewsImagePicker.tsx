'use client'

import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'

type PreviewImage = {
  id: string
  url: string
}

export function ChurchNewsImagePicker() {
  const [previews, setPreviews] = useState<PreviewImage[]>([])

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    },
    [previews],
  )

  return (
    <div className="manage-field">
      <label htmlFor="imageFiles">이미지</label>
      <input
        accept="image/*"
        id="imageFiles"
        multiple
        name="imageFiles"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files || [])
          setPreviews((current) => {
            current.forEach((preview) => URL.revokeObjectURL(preview.url))
            return files.map((file, index) => ({
              id: `${file.name}-${file.size}-${index}`,
              url: URL.createObjectURL(file),
            }))
          })
        }}
        type="file"
      />
      <span className="manage-muted">
        카카오톡에서 받은 이미지를 여러 장 선택하면 저장 전에 아래에서 확인할 수 있습니다.
      </span>

      {previews.length ? (
        <section className="manage-new-image-preview" aria-label="선택한 이미지 미리보기">
          <div className="manage-new-image-preview-header">
            <span>선택한 이미지 {previews.length}장</span>
          </div>
          <div className="manage-new-image-preview-grid">
            {previews.map((preview, index) => (
              <figure className="manage-new-image-preview-item" key={preview.id}>
                <div
                  aria-label={`${index + 1}번째 선택 이미지 미리보기`}
                  className="manage-new-image-preview-thumb"
                  role="img"
                  style={{ backgroundImage: `url(${preview.url})` }}
                />
                <figcaption>{index + 1}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : (
        <div className="manage-new-image-empty">
          <ImagePlus aria-hidden="true" />
          <span>이미지를 선택하면 이곳에 미리보기가 표시됩니다.</span>
        </div>
      )}
    </div>
  )
}
