'use client'

import { useEffect, useRef } from 'react'

// Vercel serverless functions reject request bodies over ~4.5MB, so a raw phone photo
// (3–12MB) would fail to upload before the server's sharp pass ever runs. This downscales
// images in the browser (to the same 1600×2000 cap) BEFORE the form posts, so only small
// files reach the server action. The server-side optimizeUploadImage still runs as the
// final WebP normalization.
const MAX_W = 1600
const MAX_H = 2000
const COMPRESS_OVER_BYTES = 2_500_000

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  // GIF passes through untouched — drawing it to a canvas would drop the animation.
  if (file.type === 'image/gif') return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file // undecodable here — let the server handle it
  }

  const { width, height } = bitmap
  const overSize = file.size > COMPRESS_OVER_BYTES
  const overDims = width > MAX_W || height > MAX_H
  if (!overSize && !overDims) {
    bitmap.close?.()
    return file // already small enough; keep original (preserves format/alpha)
  }

  const scale = Math.min(1, MAX_W / width, MAX_H / height)
  const targetW = Math.max(1, Math.round(width * scale))
  const targetH = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close?.()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close?.()

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85))

  const blob = (await toBlob('image/webp')) || (await toBlob('image/jpeg'))
  if (!blob || blob.size >= file.size) return file // no gain — keep original

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.${ext}`, { type: blob.type })
}

/**
 * Drop inside any manage <form>. Attaches a delegated change listener so every image
 * file input (including dynamically-added leader rows) gets its selection downscaled
 * before submit. Renders nothing visible.
 */
export function ImageCompressor() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const form = ref.current?.closest('form')
    if (!form) return

    const onChange = async (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input?.tagName !== 'INPUT' || input.type !== 'file' || !input.files?.length) return
      if (input.dataset.compressing === '1') return
      const files = Array.from(input.files)
      if (!files.some((f) => f.type.startsWith('image/'))) return

      input.dataset.compressing = '1'
      try {
        const processed = await Promise.all(files.map(compressImageFile))
        const dataTransfer = new DataTransfer()
        processed.forEach((f) => dataTransfer.items.add(f))
        input.files = dataTransfer.files
      } catch {
        // leave the original selection in place on any failure
      } finally {
        delete input.dataset.compressing
      }
    }

    form.addEventListener('change', onChange)
    return () => form.removeEventListener('change', onChange)
  }, [])

  return <span ref={ref} hidden />
}
