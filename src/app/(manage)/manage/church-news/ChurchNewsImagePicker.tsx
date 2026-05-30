'use client'

import { ImagePlus, X } from 'lucide-react'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'

const CHURCH_NEWS_CLIENT_IMAGE_MAX_HEIGHT = 1920
const CHURCH_NEWS_CLIENT_IMAGE_MAX_WIDTH = 1440
const CHURCH_NEWS_CLIENT_WEBP_QUALITY = 0.82

type PreviewImage = {
  contentHash?: string
  errorMessage?: string
  file: File
  id: string
  imageId?: string
  loadedBytes?: number
  name: string
  originalSize?: number
  reused?: boolean
  status: 'error' | 'pending' | 'uploaded' | 'uploading'
  uploadedFilename?: string
  uploadedSize?: number
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
  const reusedCount = previews.filter(
    (preview) => preview.status === 'uploaded' && preview.reused,
  ).length
  const totalBytes = previews.reduce((sum, preview) => sum + preview.file.size, 0)
  const uploadedBytes = previews.reduce((sum, preview) => {
    if (preview.status === 'uploaded') return sum + preview.file.size
    if (preview.status === 'uploading') {
      return sum + Math.min(preview.loadedBytes ?? 0, preview.file.size)
    }
    return sum
  }, 0)
  const savedBytes = previews.reduce((sum, preview) => {
    if (!preview.uploadedSize) return sum
    return sum + Math.max(0, preview.file.size - preview.uploadedSize)
  }, 0)
  const progressPercent = totalBytes
    ? Math.min(100, Math.round((uploadedBytes / totalBytes) * 100))
    : 0
  const statusText = getStatusText({
    failedCount,
    pendingCount,
    reusedCount,
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
        카카오톡에서 받은 이미지는 1장씩 업로드하며, 저장 전에 WebP로 압축해 용량을 줄입니다.
      </span>
      {statusText ? <span className="manage-new-image-status">{statusText}</span> : null}
      {previews.length ? (
        <div className="manage-upload-progress">
          <div className="manage-upload-progress-top">
            <span>업로드 진행률</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div
            aria-label="이미지 업로드 진행률"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progressPercent}
            className="manage-upload-progress-track"
            role="progressbar"
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          {savedBytes > 0 ? (
            <small>WebP 압축으로 {formatBytes(savedBytes)} 절감</small>
          ) : null}
        </div>
      ) : null}
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
            <span>
              선택한 이미지 {previews.length}장 · {formatBytes(totalBytes)}
            </span>
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
                  <small>{statusLabel(preview)}</small>
                </figcaption>
                {preview.errorMessage ? (
                  <small className="manage-new-image-error">{preview.errorMessage}</small>
                ) : null}
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

    if (shouldDeleteUploadedImage(target)) void deleteUploadedImage(target.imageId)
  }

  async function uploadSequentially(items: PreviewImage[], runId: number) {
    for (const item of items) {
      if (uploadRunRef.current !== runId) return
      if (removedIdsRef.current.has(item.id)) continue

      updatePreview(item.id, { errorMessage: undefined, loadedBytes: 0, status: 'uploading' })

      try {
        const uploaded = await uploadImageFile(item.file, (loaded) => {
          updatePreview(item.id, { loadedBytes: loaded })
        })

        if (uploadRunRef.current !== runId) {
          if (!uploaded.reused) await deleteUploadedImage(uploaded.id)
          return
        }
        if (removedIdsRef.current.has(item.id)) {
          if (!uploaded.reused) await deleteUploadedImage(uploaded.id)
          continue
        }

        const duplicate = previewsRef.current.find(
          (preview) =>
            preview.id !== item.id &&
            preview.contentHash === uploaded.contentHash &&
            preview.status === 'uploaded',
        )

        if (duplicate) {
          removedIdsRef.current.add(item.id)
          URL.revokeObjectURL(item.url)
          if (!uploaded.reused) await deleteUploadedImage(uploaded.id)
          setPreviewState(previewsRef.current.filter((preview) => preview.id !== item.id))
          continue
        }

        updatePreview(item.id, {
          contentHash: uploaded.contentHash,
          imageId: uploaded.id,
          loadedBytes: item.file.size,
          originalSize: uploaded.originalSize,
          reused: uploaded.reused,
          status: 'uploaded',
          uploadedFilename: uploaded.filename,
          uploadedSize: uploaded.uploadedSize,
        })
      } catch (error) {
        console.error('Failed to upload church news image:', error)
        if (uploadRunRef.current !== runId || removedIdsRef.current.has(item.id)) continue
        updatePreview(item.id, { errorMessage: uploadErrorMessage(error), status: 'error' })
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

  function shouldDeleteUploadedImage(
    target: PreviewImage,
  ): target is PreviewImage & { imageId: string } {
    if (!target.imageId || target.reused) return false

    return !previewsRef.current.some(
      (preview) => preview.id !== target.id && preview.imageId === target.imageId,
    )
  }
}

type UploadImageResult = {
  contentHash: string
  filename?: string
  id: string
  optimized?: boolean
  originalSize?: number
  reused: boolean
  uploadedSize?: number
}

async function uploadImageFile(
  file: File,
  onProgress: (loadedBytes: number) => void,
): Promise<UploadImageResult> {
  const uploadFile = await optimizeImageForUpload(file)
  const uploadFileSize = Math.max(1, uploadFile.size)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/manage/church-news/upload-image')

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const ratio = Math.min(1, event.loaded / Math.max(event.total, uploadFileSize))
      onProgress(Math.round(file.size * ratio))
    }

    xhr.onerror = () => reject(new Error('network_error'))
    xhr.onload = () => {
      let result: {
        contentHash?: string
        error?: string
        filename?: string
        id?: number | string
        optimized?: boolean
        originalSize?: number
        reused?: boolean
        uploadedSize?: number
      } = {}

      try {
        result = JSON.parse(xhr.responseText || '{}')
      } catch {
        result = {}
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new UploadImageError(result.error, xhr.status))
        return
      }

      if (!result.id || !result.contentHash) {
        reject(new Error('missing_upload_result'))
        return
      }

      onProgress(file.size)
      resolve({
        contentHash: result.contentHash,
        filename: result.filename,
        id: String(result.id),
        optimized: Boolean(result.optimized),
        originalSize: result.originalSize,
        reused: Boolean(result.reused),
        uploadedSize: result.uploadedSize,
      })
    }

    const optimizedFormData = new FormData()
    optimizedFormData.append('file', uploadFile)
    optimizedFormData.append('alt', file.name)
    xhr.send(optimizedFormData)
  })
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
  reusedCount,
  totalBytes,
  totalCount,
  uploadedCount,
}: {
  failedCount: number
  pendingCount: number
  reusedCount: number
  totalBytes: number
  totalCount: number
  uploadedCount: number
}) {
  if (!totalCount) return null
  if (pendingCount)
    return `이미지 업로드 중 ${uploadedCount}/${totalCount} · 원본 ${formatBytes(totalBytes)}`
  if (failedCount)
    return `업로드 실패 ${failedCount}장. 실패한 이미지를 제거하거나 다시 선택해 주세요.`
  const reuseText = reusedCount ? ` · 기존 파일 ${reusedCount}장 재사용` : ''
  return `이미지 ${uploadedCount}장 업로드 완료 · 원본 ${formatBytes(totalBytes)}${reuseText}`
}

function statusLabel(preview: PreviewImage): string {
  const { reused, status, uploadedSize } = preview
  if (status === 'pending') return '대기'
  if (status === 'uploading') return '업로드 중'
  if (status === 'uploaded') {
    const sizeText = uploadedSize ? ` · ${formatBytes(uploadedSize)}` : ''
    return `${reused ? '재사용' : '완료'}${sizeText}`
  }
  return '실패'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file

  try {
    const bitmap = await createImageBitmap(file)
    const { height, width } = fitWithinBounds(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      return file
    }

    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await canvasToBlob(canvas, 'image/webp', CHURCH_NEWS_CLIENT_WEBP_QUALITY)
    if (!blob || blob.size >= file.size) return file

    return new File([blob], toWebpFilename(file.name), {
      lastModified: file.lastModified,
      type: 'image/webp',
    })
  } catch (error) {
    console.error('Failed to optimize church news image before upload:', error)
    return file
  }
}

function fitWithinBounds(width: number, height: number) {
  const scale = Math.min(
    1,
    CHURCH_NEWS_CLIENT_IMAGE_MAX_WIDTH / width,
    CHURCH_NEWS_CLIENT_IMAGE_MAX_HEIGHT / height,
  )

  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality))
}

function toWebpFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^.]+$/, '').trim()
  const safeBase = withoutExtension
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${safeBase || 'church-news-image'}.webp`
}

class UploadImageError extends Error {
  constructor(
    readonly code: string | undefined,
    readonly status: number,
  ) {
    super(code || `upload_failed_${status}`)
  }
}

function uploadErrorMessage(error: unknown): string {
  if (error instanceof UploadImageError) {
    if (error.status === 413) return '파일이 너무 큽니다. 더 작은 이미지로 다시 시도해 주세요.'
    if (error.code === 'storage_not_configured') return '운영 이미지 저장소 설정이 필요합니다.'
    if (error.code === 'file_required') return '이미지 파일을 다시 선택해 주세요.'
  }
  if (error instanceof Error && error.message === 'network_error') {
    return '네트워크 오류로 업로드하지 못했습니다.'
  }
  return '이미지를 압축하거나 저장하지 못했습니다.'
}
