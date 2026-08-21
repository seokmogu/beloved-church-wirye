import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { list } from '@vercel/blob'

const execute = process.argv.includes('--execute')
const requiredEnvNames = [
  'BLOB_READ_WRITE_TOKEN',
  'R2_MEDIA_ACCESS_KEY_ID',
  'R2_MEDIA_BUCKET',
  'R2_MEDIA_ENDPOINT',
  'R2_MEDIA_SECRET_ACCESS_KEY',
]

const missingEnvNames = requiredEnvNames.filter((name) => !process.env[name]?.trim())
if (missingEnvNames.length) {
  throw new Error(`Missing required environment variables: ${missingEnvNames.join(', ')}`)
}

const sourceToken = process.env.BLOB_READ_WRITE_TOKEN
const targetBucket = process.env.R2_MEDIA_BUCKET
const client = new S3Client({
  credentials: {
    accessKeyId: process.env.R2_MEDIA_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_MEDIA_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.R2_MEDIA_ENDPOINT,
  forcePathStyle: true,
  region: 'auto',
})

const blobs = []
let cursor
let hasMore = true

while (hasMore) {
  const page = await list({ cursor, limit: 1000, token: sourceToken })
  blobs.push(...page.blobs)
  cursor = page.cursor
  hasMore = page.hasMore
}

const nestedPathnames = blobs.filter((blob) => blob.pathname.replace(/^\/+/, '').includes('/'))
if (nestedPathnames.length) {
  throw new Error(
    `Found ${nestedPathnames.length} nested Blob pathname(s); migration stopped to avoid changing Payload media keys`,
  )
}

const totalBytes = blobs.reduce((total, blob) => total + blob.size, 0)
const summary = {
  execute,
  sourceObjects: blobs.length,
  sourceBytes: totalBytes,
  targetPrefix: 'media/',
}

if (!execute) {
  console.log(JSON.stringify({ ...summary, status: 'dry-run' }, null, 2))
  process.exit(0)
}

let copied = 0
let skipped = 0

for (const blob of blobs) {
  const pathname = blob.pathname.replace(/^\/+/, '')
  const key = `media/${pathname}`

  try {
    const existing = await client.send(new HeadObjectCommand({ Bucket: targetBucket, Key: key }))
    if (Number(existing.ContentLength) !== blob.size) {
      throw new Error(`Target object size conflict at a public media key`)
    }
    skipped += 1
    continue
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode
    if (statusCode !== 404 && error?.name !== 'NotFound') throw error
  }

  const response = await fetch(blob.downloadUrl || blob.url)
  if (!response.ok) throw new Error(`Blob download failed with HTTP ${response.status}`)

  const body = Buffer.from(await response.arrayBuffer())
  if (body.length !== blob.size) throw new Error('Blob download size mismatch')

  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: targetBucket,
      CacheControl: 'public, max-age=31536000, immutable',
      ContentType: response.headers.get('content-type') || 'application/octet-stream',
      Key: key,
    }),
  )

  const uploaded = await client.send(new HeadObjectCommand({ Bucket: targetBucket, Key: key }))
  if (Number(uploaded.ContentLength) !== blob.size) {
    throw new Error('R2 verification size mismatch')
  }
  copied += 1
}

console.log(
  JSON.stringify(
    {
      ...summary,
      copied,
      skipped,
      status: 'copied-and-size-verified',
    },
    null,
    2,
  ),
)
