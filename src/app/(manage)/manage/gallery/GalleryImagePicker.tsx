'use client'

import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { Fragment, type ChangeEvent, useEffect, useRef, useState } from 'react'

const MAX_HEIGHT = 2000
const MAX_WIDTH = 1600
const WEBP_QUALITY = 0.8

type Preview = {
  caption: string
  error?: string
  file: File
  id: string
  imageId?: string
  name: string
  savedSize?: number
  status: 'error' | 'pending' | 'uploading' | 'uploaded'
  url: string
}

type UploadResult = {
  contentHash: string
  id: number | string
  reused: boolean
  uploadedSize: number
}

/** 업로드를 저장 전에 한 장씩 처리해 모바일에서도 요청 크기를 작게 유지한다. */
export function GalleryImagePicker() {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewsRef = useRef<Preview[]>([])
  const removedRef = useRef(new Set<string>())
  const [previews, setPreviews] = useState<Preview[]>([])

  const uploading = previews.some(
    (item) => item.status === 'pending' || item.status === 'uploading',
  )
  const failed = previews.some((item) => item.status === 'error')
  const complete = previews.filter((item) => item.status === 'uploaded').length

  useEffect(() => {
    return () => previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [])

  useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return

    const handleSubmit = (event: SubmitEvent) => {
      if (!uploading && !failed) return
      event.preventDefault()
      event.stopImmediatePropagation()
      window.alert(
        uploading
          ? '사진을 업로드 중입니다. 완료된 뒤 앨범을 저장해 주세요.'
          : '업로드에 실패한 사진이 있습니다. 제거하거나 다시 선택해 주세요.',
      )
    }

    form.addEventListener('submit', handleSubmit)
    return () => form.removeEventListener('submit', handleSubmit)
  }, [failed, uploading])

  function setPreviewState(next: Preview[]) {
    previewsRef.current = next
    setPreviews(next)
  }

  function updatePreview(id: string, patch: Partial<Preview>) {
    setPreviewState(
      previewsRef.current.map((preview) =>
        preview.id === id ? { ...preview, ...patch } : preview,
      ),
    )
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []).filter((file) =>
      file.type.startsWith('image/'),
    )
    if (!files.length) return

    const nextPreviews = [
      ...previewsRef.current,
      ...files.map((file, index) => ({
        caption: '',
        file,
        id: `${Date.now()}-${index}-${file.name}-${file.size}`,
        name: file.name,
        status: 'pending' as const,
        url: URL.createObjectURL(file),
      })),
    ]

    event.currentTarget.value = ''
    setPreviewState(nextPreviews)
    void uploadSequentially(nextPreviews.filter((preview) => preview.status === 'pending'))
  }

  async function uploadSequentially(items: Preview[]) {
    for (const item of items) {
      if (removedRef.current.has(item.id)) continue
      updatePreview(item.id, { error: undefined, status: 'uploading' })

      try {
        const result = await uploadImage(item.file)
        if (removedRef.current.has(item.id)) {
          if (!result.reused) await deleteUploadedImage(String(result.id))
          continue
        }

        const duplicate = previewsRef.current.find(
          (preview) => preview.id !== item.id && preview.imageId === String(result.id),
        )
        if (duplicate) {
          removedRef.current.add(item.id)
          URL.revokeObjectURL(item.url)
          if (!result.reused) await deleteUploadedImage(String(result.id))
          setPreviewState(previewsRef.current.filter((preview) => preview.id !== item.id))
          continue
        }

        updatePreview(item.id, {
          imageId: String(result.id),
          savedSize: result.uploadedSize,
          status: 'uploaded',
        })
      } catch (error) {
        console.error('Failed to upload gallery image:', error)
        if (removedRef.current.has(item.id)) continue
        updatePreview(item.id, { error: uploadErrorMessage(error), status: 'error' })
      }
    }
  }

  function removePreview(id: string) {
    const target = previewsRef.current.find((preview) => preview.id === id)
    if (!target) return

    removedRef.current.add(id)
    URL.revokeObjectURL(target.url)
    setPreviewState(previewsRef.current.filter((preview) => preview.id !== id))
    if (target.imageId) void deleteUploadedImage(target.imageId)
  }

  return (
    <section className="manage-field" aria-labelledby="gallery-upload-label">
      <label id="gallery-upload-label" htmlFor="galleryImageFiles">
        사진 추가
      </label>
      <input
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        id="galleryImageFiles"
        multiple
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <span className="manage-muted">
        여러 장을 선택할 수 있습니다. 사진 설명을 쓰면 공개 화면의 대체 텍스트와 이미지 검색 정보에
        함께 반영됩니다. 휴대폰 사진은 저장 전 WebP로 압축해 R2 용량과 전송량을 줄입니다.
      </span>

      {previews
        .filter((preview) => preview.status === 'uploaded' && preview.imageId)
        .map((preview) => (
          <Fragment key={preview.id}>
            <input name="uploadedGalleryImageId" type="hidden" value={preview.imageId} />
            <input name="uploadedGalleryImageCaption" type="hidden" value={preview.caption} />
          </Fragment>
        ))}

      {previews.length ? (
        <div className="manage-new-image-preview" aria-busy={uploading}>
          <div className="manage-new-image-preview-header">
            <span>
              새 사진 {previews.length}장 · 완료 {complete}장
            </span>
            {uploading ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> 업로드 중
              </span>
            ) : null}
          </div>
          <div className="manage-new-image-preview-grid">
            {previews.map((preview, index) => (
              <figure
                className={`manage-new-image-preview-item is-${preview.status}`}
                key={preview.id}
              >
                <div className="manage-new-image-preview-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Local object URL previews are not supported by next/image. */}
                  <img
                    alt=""
                    className="manage-new-image-preview-thumb object-cover"
                    src={preview.url}
                  />
                  <button
                    aria-label={`${index + 1}번째 새 사진 제거`}
                    className="manage-new-image-remove"
                    onClick={() => removePreview(preview.id)}
                    type="button"
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>
                <figcaption title={preview.name}>
                  <span>{index + 1}</span>
                  <small>{statusLabel(preview)}</small>
                </figcaption>
                <label className="sr-only" htmlFor={`gallery-image-caption-${preview.id}`}>
                  {index + 1}번째 사진 설명
                </label>
                <input
                  id={`gallery-image-caption-${preview.id}`}
                  onChange={(event) => updatePreview(preview.id, { caption: event.target.value })}
                  placeholder="사진 설명 (권장)"
                  type="text"
                  value={preview.caption}
                />
                {preview.error ? (
                  <small className="manage-new-image-error">{preview.error}</small>
                ) : null}
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <div className="manage-new-image-empty">
          <ImagePlus aria-hidden="true" />
          <span>사진을 선택하면 작은 미리보기와 업로드 상태가 표시됩니다.</span>
        </div>
      )}
      {previews.some((preview) => preview.status === 'uploaded') ? (
        <p className="manage-field-hint">
          새 사진의 순서는 저장 후 조정할 수 있습니다. 앨범 첫 사진이 대표 사진이 됩니다.
        </p>
      ) : null}
    </section>
  )
}

async function uploadImage(file: File): Promise<UploadResult> {
  const optimized = await optimizeImage(file)
  const formData = new FormData()
  formData.append('file', optimized)
  formData.append('alt', file.name.replace(/\.[^.]+$/, ''))

  const response = await fetch('/manage/gallery/upload-image', { method: 'POST', body: formData })
  const result = (await response.json().catch(() => ({}))) as Partial<UploadResult> & {
    error?: string
  }
  if (!response.ok || !result.id || !result.contentHash) {
    throw new GalleryUploadError(result.error, response.status)
  }

  return {
    contentHash: result.contentHash,
    id: result.id,
    reused: Boolean(result.reused),
    uploadedSize: Number(result.uploadedSize) || optimized.size,
  }
}

async function deleteUploadedImage(id: string) {
  try {
    await fetch('/manage/gallery/upload-image', {
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Failed to clean up gallery image:', error)
  }
}

async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
    )
    if (!blob || blob.size >= file.size) return file
    return new File([blob], toWebpFilename(file.name), {
      lastModified: file.lastModified,
      type: 'image/webp',
    })
  } catch (error) {
    console.error('Failed to optimize gallery image:', error)
    return file
  }
}

function toWebpFilename(filename: string): string {
  const base = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base || 'gallery-image'}.webp`
}

function statusLabel(preview: Preview) {
  if (preview.status === 'pending') return '대기'
  if (preview.status === 'uploading') return '업로드 중'
  if (preview.status === 'uploaded') return `${formatBytes(preview.savedSize || 0)} 저장`
  return '업로드 실패'
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

class GalleryUploadError extends Error {
  constructor(
    readonly code: string | undefined,
    readonly status: number,
  ) {
    super(code || `upload_failed_${status}`)
  }
}

function uploadErrorMessage(error: unknown) {
  if (error instanceof GalleryUploadError) {
    if (error.code === 'storage_limit_reached') {
      return '갤러리 저장공간 안전 한도(8GB)에 도달했습니다. 관리자에게 용량 확장을 요청해 주세요.'
    }
    if (error.status === 413) return '파일이 너무 큽니다. 더 작은 사진으로 다시 시도해 주세요.'
    if (error.code === 'storage_not_configured') return 'R2 저장소 설정이 아직 완료되지 않았습니다.'
    if (error.code === 'file_required') return '사진 파일을 다시 선택해 주세요.'
  }
  return '사진을 압축하거나 저장하지 못했습니다.'
}
