import { randomBytes } from 'node:crypto'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { optimizeChurchNewsImage } from '@/lib/manage/churchNewsImage'
import {
  assertDurableUploadStorageConfigured,
  isDurableUploadStorageConfigured,
  isUploadStorageNotConfiguredError,
} from '@/lib/manage/uploadStorage'

describe('church news image upload optimization', () => {
  it('compresses a large image to a bounded webp payload', async () => {
    const original = await createLargeTestImage()
    const result = await optimizeChurchNewsImage(original, {
      name: 'church-news-large.jpg',
      type: 'image/jpeg',
    })

    expect(result).toMatchObject({
      filename: 'church-news-large.webp',
      mimeType: 'image/webp',
      optimized: true,
    })
    expect(result.data.length).toBeLessThan(original.length)

    const metadata = await sharp(result.data).metadata()
    expect(metadata.format).toBe('webp')
    expect(metadata.width).toBeLessThanOrEqual(1440)
    expect(metadata.height).toBeLessThanOrEqual(1920)
  })
})

describe('durable upload storage guard', () => {
  it('blocks file uploads when Blob storage is not configured', () => {
    expect(isDurableUploadStorageConfigured({ BLOB_READ_WRITE_TOKEN: '' })).toBe(false)

    expect(() => {
      assertDurableUploadStorageConfigured(1, { BLOB_READ_WRITE_TOKEN: '' })
    }).toThrow('UPLOAD_STORAGE_NOT_CONFIGURED')

    try {
      assertDurableUploadStorageConfigured(1, { BLOB_READ_WRITE_TOKEN: '' })
    } catch (error) {
      expect(isUploadStorageNotConfiguredError(error)).toBe(true)
    }
  })

  it('allows no-file saves and Blob-backed uploads', () => {
    expect(() => {
      assertDurableUploadStorageConfigured(0, { BLOB_READ_WRITE_TOKEN: '' })
    }).not.toThrow()
    expect(() => {
      assertDurableUploadStorageConfigured(1, { BLOB_READ_WRITE_TOKEN: 'blob-token' })
    }).not.toThrow()
  })
})

async function createLargeTestImage() {
  const width = 1800
  const height = 2400
  const channels = 3
  const data = randomBytes(width * height * channels)

  return sharp(data, {
    raw: { channels, height, width },
  })
    .jpeg({ quality: 100 })
    .toBuffer()
}
