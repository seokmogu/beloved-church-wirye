import { randomBytes } from 'node:crypto'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { optimizeChurchNewsImage } from '@/lib/manage/churchNewsImage'

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
