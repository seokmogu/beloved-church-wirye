'use client'

import { ImagePlus, X } from 'lucide-react'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'

type PreviewImage = {
  file: File
  id: string
  imageId?: string
  name: string
  status: 'error' | 'pending' | 'uploaded' | 'uploading'
  url: string
}

export function ChurchNewsImagePicker() {
  const hasUploadErrorRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isUploadingRef = useRef(false)
  const previewsRef = useRef<PreviewImage[]>([])
  const removedIdsRef = useRef<Set<string>>(new Set())
  const uploadRunRef = useRef(0)
  const [previews, setPreviews] = useState<PreviewImage[]>([])

  const uploadedCount = previews.filter((preview) => preview.status === 'uploaded').length
  const failedCount = previews.filter((preview) => preview.status === 'error').length
  const pendingCount = previews.filter(
    (preview) => preview.status === 'pending' || preview.status === 'uploading',
  ).length
  const totalBytes = previews.reduce((sum, preview) => sum + preview.file.size, 0)
  const statusText = getStatusText({
    failedCount,
    pendingCount,
    totalBytes,
    totalCount: previews.length,
    uploadedCount,
  })

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [])

  useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return

    const handleSubmit = (event: SubmitEvent) => {
      if (!isUploadingRef.current && !hasUploadErrorRef.current) return

      event.preventDefault()
      event.stopImmediatePropagation()
      window.alert(
        isUploadingRef.current
          ? '이미지를 1장씩 업로드하는 중입니다. 완료 후 저장해 주세요.'
          : '업로드에 실패한 이미지가 있습니다. 실패한 이미지를 제거하거나 다시 선택해 주세요.',
      )
    }

    form.addEventListener('submit', handleSubmit)
    return () => form.removeEventListener('submit', handleSubmit)
  }, [])

  return (
    <div className="manage-field">
      <label htmlFor="imageFiles">이미지</label>
      <input
        accept="image/*"
        id="imageFiles"
        ref={inputRef}
        multiple
        onChange={handleChange}
        type="file"
      />
      <span className="manage-muted">
        카카오톡에서 받은 이미지는 화질을 낮추지 않고 원본 파일을 1장씩 업로드합니다.
      </span>
      {statusText ? <span className="manage-new-image-status">{statusText}</span> : null}
      {previews
        .filter((preview) => preview.status === 'uploaded' && preview.imageId)
        .map((preview) => (
          <input
            key={preview.id}
            name="uploadedChurchNewsImageId"
            type="hidden"
            value={preview.imageId}
          />
        ))}

      {previews.length ? (
        <section
          aria-busy={pendingCount > 0}
          aria-label="선택한 이미지 미리보기"
          className="manage-new-image-preview"
        >
          <div className="manage-new-image-preview-header">
            <span>선택한 이미지 {previews.length}장 · {formatBytes(totalBytes)}</span>
          </div>
          <div className="manage-new-image-preview-grid">
            {previews.map((preview, index) => (
              <figure
                className={`manage-new-image-preview-item is-${preview.status}`}
                key={preview.id}
              >
                <div className="manage-new-image-preview-frame">
                  <div
                    aria-label={`${index + 1}번째 선택 이미지 미리보기`}
                    className="manage-new-image-preview-thumb"
                    role="img"
                    style={{ backgroundImage: `url(${preview.url})` }}
                  />
                  <button
                    aria-label={`${index + 1}번째 선택 이미지 제거`}
                    className="manage-new-image-remove"
                    onClick={() => removePreview(index)}
                    type="button"
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>
                <figcaption title={preview.name}>
                  <span>{index + 1}</span>
                  <small>{statusLabel(preview.status)}</small>
                </figcaption>
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

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || [])
    const runId = uploadRunRef.current + 1
    uploadRunRef.current = runId
    removedIdsRef.current = new Set()

    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url))

    const nextPreviews = files.map((file, index) => ({
      file,
      id: `${Date.now()}-${file.name}-${file.size}-${index}`,
      name: file.name,
      status: 'pending' as const,
      url: URL.createObjectURL(file),
    }))

    setPreviewState(nextPreviews)
    if (files.length) void uploadSequentially(nextPreviews, runId)
  }

  function removePreview(removeIndex: number) {
    const target = previewsRef.current[removeIndex]
    if (!target) return

    removedIdsRef.current.add(target.id)
    URL.revokeObjectURL(target.url)
    setPreviewState(previewsRef.current.filter((_, index) => index !== removeIndex))

    if (target.imageId) void deleteUploadedImage(target.imageId)
  }

  async function uploadSequentially(items: PreviewImage[], runId: number) {
    for (const item of items) {
      if (uploadRunRef.current !== runId) return
      if (removedIdsRef.current.has(item.id)) continue

      updatePreview(item.id, { status: 'uploading' })

      try {
        const imageId = await uploadImageFile(item.file)

        if (uploadRunRef.current !== runId) return
        if (removedIdsRef.current.has(item.id)) {
          await deleteUploadedImage(imageId)
          continue
        }

        updatePreview(item.id, { imageId, status: 'uploaded' })
      } catch (error) {
        console.error('Failed to upload church news image:', error)
        if (uploadRunRef.current !== runId || removedIdsRef.current.has(item.id)) continue
        updatePreview(item.id, { status: 'error' })
      }
    }
  }

  function updatePreview(id: string, patch: Partial<PreviewImage>) {
    setPreviewState(
      previewsRef.current.map((preview) =>
        preview.id === id ? { ...preview, ...patch } : preview,
      ),
    )
  }

  function setPreviewState(next: PreviewImage[]) {
    previewsRef.current = next
    isUploadingRef.current = next.some(
      (preview) => preview.status === 'pending' || preview.status === 'uploading',
    )
    hasUploadErrorRef.current = next.some((preview) => preview.status === 'error')
    setPreviews(next)
  }
}

async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('alt', file.name)

  const response = await fetch('/manage/church-news/upload-image', {
    body: formData,
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`)
  }

  const result = (await response.json()) as { id?: number | string }
  if (!result.id) throw new Error('Upload did not return an image id')

  return String(result.id)
}

async function deleteUploadedImage(id: string) {
  try {
    await fetch('/manage/church-news/upload-image', {
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Failed to clean up removed church news image:', error)
  }
}

function getStatusText({
  failedCount,
  pendingCount,
  totalBytes,
  totalCount,
  uploadedCount,
}: {
  failedCount: number
  pendingCount: number
  totalBytes: number
  totalCount: number
  uploadedCount: number
}) {
  if (!totalCount) return null
  if (pendingCount) return `원본 이미지 업로드 중 ${uploadedCount}/${totalCount} · ${formatBytes(totalBytes)}`
  if (failedCount) return `업로드 실패 ${failedCount}장. 실패한 이미지를 제거하거나 다시 선택해 주세요.`
  return `원본 이미지 ${uploadedCount}장 업로드 완료 · ${formatBytes(totalBytes)}`
}

function statusLabel(status: PreviewImage['status']): string {
  if (status === 'pending') return '대기'
  if (status === 'uploading') return '업로드 중'
  if (status === 'uploaded') return '완료'
  return '실패'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
