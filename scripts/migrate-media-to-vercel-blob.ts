import fs from 'fs/promises'
import path from 'path'

import config from '@payload-config'
// @ts-expect-error pg types are not installed in this app.
import pg from 'pg'
import { getPayload } from 'payload'

import { optimizeUploadImage, toWebpFilename } from '../src/lib/manage/churchNewsImage'

type MediaDoc = {
  id: number | string
  alt?: string | null
  caption?: unknown
  contentHash?: string | null
  filename?: string | null
  mimeType?: string | null
  url?: string | null
  sizes?: Record<
    string,
    { filename?: string | null; mimeType?: string | null; url?: string | null } | null
  >
}

type PlannedMigration = {
  id: number | string
  currentFilename: string
  sourcePath: string
  targetFilename: string
}

const mediaDir = path.resolve(process.cwd(), 'public/media')
const backupDir = path.resolve(process.cwd(), 'tmp/media-migration')
const dryRun = !process.argv.includes('--execute')
const force = process.argv.includes('--force')
const limit = readNumericArg('--limit')
const onlyId = readStringArg('--id')
const sourceDirs = readRepeatedStringArg('--source-dir').map((dir) =>
  path.resolve(process.cwd(), dir),
)
const { Client } = pg

async function main() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is required for Payload DB access.')
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required to upload media into Vercel Blob.')
  }

  const payload = await getPayload({ config })
  const docs = await fetchAllMedia(payload)
  const scopedDocs = onlyId ? docs.filter((doc) => String(doc.id) === onlyId) : docs
  const plans = await createMigrationPlan(scopedDocs)

  console.log(
    JSON.stringify(
      {
        dryRun,
        force,
        mediaRows: docs.length,
        scopedRows: scopedDocs.length,
        planned: plans.planned.length,
        alreadyWebp: plans.alreadyWebp,
        missingSource: plans.missingSource,
        nonImages: plans.nonImages,
        limit: limit ?? null,
        sourceDirs: [mediaDir, ...sourceDirs],
      },
      null,
      2,
    ),
  )

  if (plans.missing.length > 0) {
    console.log('Missing source files:')
    for (const item of plans.missing) {
      console.log(`- media ${item.id}: ${item.filename}`)
    }
  }

  const runnablePlans = limit ? plans.planned.slice(0, limit) : plans.planned
  for (const plan of runnablePlans.slice(0, 5)) {
    console.log(
      `plan media ${plan.id}: ${plan.currentFilename} -> ${plan.targetFilename} (${path.relative(
        process.cwd(),
        plan.sourcePath,
      )})`,
    )
  }

  if (dryRun) {
    console.log('Dry run only. Re-run with --execute to update DB rows and upload to Blob.')
    process.exit(0)
  }

  const dbClient = new Client({ connectionString: process.env.POSTGRES_URL })
  await dbClient.connect()

  await fs.mkdir(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `media-before-blob-${timestamp()}.json`)
  await fs.writeFile(
    backupPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        planned: runnablePlans,
        docs: scopedDocs,
      },
      null,
      2,
    ),
  )
  console.log(`Backup written: ${path.relative(process.cwd(), backupPath)}`)

  let migrated = 0
  try {
    for (const plan of runnablePlans) {
      const sourceData = await fs.readFile(plan.sourcePath)
      const optimized = await optimizeUploadImage(
        sourceData,
        {
          name: plan.currentFilename,
          type: mimeTypeForFilename(plan.currentFilename),
        },
        'site-image',
      )

      const updatedDoc = (await payload.update({
        collection: 'media',
        id: plan.id,
        data: {},
        depth: 0,
        file: {
          data: optimized.data,
          mimetype: optimized.mimeType,
          name: optimized.filename,
          size: optimized.data.length,
        },
        overrideAccess: true,
        overwriteExistingFiles: true,
      } as any)) as unknown as MediaDoc
      await updateMediaBaseUrl(dbClient, plan.id, optimized.filename, mediaBaseURL(updatedDoc))

      migrated += 1
      console.log(`migrated ${migrated}/${runnablePlans.length}: media ${plan.id}`)
    }
  } finally {
    await dbClient.end()
  }

  const afterDocs = onlyId ? await fetchMediaById(payload, onlyId) : await fetchAllMedia(payload)
  const afterPlan = await createMigrationPlan(afterDocs)
  console.log(
    JSON.stringify(
      {
        migrated,
        remainingPlanned: afterPlan.planned.length,
        remainingMissingSource: afterPlan.missingSource,
      },
      null,
      2,
    ),
  )

  process.exit(0)
}

async function fetchAllMedia(payload: Awaited<ReturnType<typeof getPayload>>): Promise<MediaDoc[]> {
  const docs: MediaDoc[] = []
  let page = 1
  let totalPages = 1

  do {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
    })
    docs.push(...(result.docs as MediaDoc[]))
    totalPages = result.totalPages
    page += 1
  } while (page <= totalPages)

  return docs
}

async function fetchMediaById(
  payload: Awaited<ReturnType<typeof getPayload>>,
  id: string,
): Promise<MediaDoc[]> {
  const doc = await payload.findByID({
    collection: 'media',
    depth: 0,
    id,
    overrideAccess: true,
  })
  return [doc as MediaDoc]
}

async function createMigrationPlan(docs: MediaDoc[]) {
  const planned: PlannedMigration[] = []
  const missing: Array<{ filename: string | null | undefined; id: number | string }> = []
  let alreadyWebp = 0
  let missingSource = 0
  let nonImages = 0

  for (const doc of docs) {
    if (!doc.filename) {
      missingSource += 1
      missing.push({ filename: doc.filename, id: doc.id })
      continue
    }

    if (!isImageDoc(doc)) {
      nonImages += 1
      continue
    }

    if (!force && isWebpMediaDoc(doc)) {
      alreadyWebp += 1
      continue
    }

    const targetFilename = toWebpFilename(doc.filename)
    const sourcePath = await findSourcePath(doc.filename, targetFilename)
    if (!sourcePath) {
      missingSource += 1
      missing.push({ filename: doc.filename, id: doc.id })
      continue
    }

    planned.push({
      currentFilename: doc.filename,
      id: doc.id,
      sourcePath,
      targetFilename,
    })
  }

  return { alreadyWebp, missing, missingSource, nonImages, planned }
}

function isImageDoc(doc: MediaDoc): boolean {
  return Boolean(
    doc.mimeType?.startsWith('image/') || doc.filename?.match(/\.(avif|gif|jpe?g|png|webp)$/i),
  )
}

function isWebpMediaDoc(doc: MediaDoc): boolean {
  if (!doc.filename?.toLowerCase().endsWith('.webp')) return false
  if (doc.mimeType && doc.mimeType !== 'image/webp') return false

  return Object.values(doc.sizes || {}).every((size) => {
    if (!size?.filename) return true
    return (
      size.filename.toLowerCase().endsWith('.webp') &&
      (!size.mimeType || size.mimeType === 'image/webp')
    )
  })
}

async function findSourcePath(filename: string, targetFilename: string): Promise<string | null> {
  const candidates = Array.from(new Set([targetFilename, filename]))

  for (const sourceDir of [mediaDir, ...sourceDirs]) {
    for (const candidate of candidates) {
      const candidatePath = path.join(sourceDir, candidate)
      try {
        const stat = await fs.stat(candidatePath)
        if (stat.isFile()) return candidatePath
      } catch {
        // Try the next candidate.
      }
    }
  }

  return null
}

function mimeTypeForFilename(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.avif')) return 'image/avif'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  return 'application/octet-stream'
}

async function updateMediaBaseUrl(
  client: any,
  id: number | string,
  filename: string,
  baseURL: string,
): Promise<void> {
  await client.query('update media set url = $1 where id = $2', [
    mediaFileUrl(filename, baseURL),
    id,
  ])
}

function mediaBaseURL(doc: MediaDoc): string {
  const urls = [
    doc.url,
    ...Object.values(doc.sizes || {})
      .map((size) => size?.url)
      .filter(Boolean),
  ]

  for (const url of urls) {
    const match = url?.match(/^(.*)\/api\/media\/file\/.*$/)
    if (match?.[1]) return match[1]
  }

  return ''
}

function mediaFileUrl(filename: string, baseURL: string): string {
  const filePath = `/api/media/file/${encodeURIComponent(filename)}`
  const base = baseURL.replace(/\/$/, '')
  return base ? `${base}${filePath}` : filePath
}

function readNumericArg(name: string): number | null {
  const raw = readStringArg(name)
  if (!raw) return null
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`)
  return value
}

function readStringArg(name: string): string | null {
  const index = process.argv.indexOf(name)
  if (index === -1) return null
  return process.argv[index + 1] || null
}

function readRepeatedStringArg(name: string): string[] {
  const values: string[] = []
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === name && process.argv[index + 1]) {
      values.push(process.argv[index + 1])
    }
  }
  return values
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
