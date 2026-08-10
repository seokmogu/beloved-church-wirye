#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const siteURL = requiredEnv('IMAGE_TRANSCRIPTION_SITE_URL')
const secret = requiredEnv('IMAGE_TRANSCRIPTION_WORKER_SECRET')
const model = requiredEnv('IMAGE_TRANSCRIPTION_CODEX_MODEL')
const codexBin = process.env.IMAGE_TRANSCRIPTION_CODEX_BIN || 'cdx'

const schema = {
  additionalProperties: false,
  properties: {
    content: { type: 'string' },
    seoDescription: { type: 'string' },
    seoTitle: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['content', 'seoDescription', 'seoTitle', 'summary'],
  type: 'object',
}

async function main() {
  const response = await request('/api/image-transcriptions/pending')
  if (!response.ok) throw new Error(`Could not load transcription queue: HTTP ${response.status}`)

  const { jobs } = await response.json()
  if (!Array.isArray(jobs) || jobs.length === 0) {
    console.log('No image transcription jobs are pending.')
    return
  }

  for (const job of jobs) {
    try {
      await transcribe(job)
    } catch (error) {
      console.error(
        `Skipped ${job.kind} ${job.documentId}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

async function transcribe(job) {
  const directory = await mkdtemp(join(tmpdir(), 'beloved-image-transcription-'))

  try {
    const imagePaths = await Promise.all(
      job.images.map(async (image, index) => {
        const imageResponse = await fetch(image.url, { signal: AbortSignal.timeout(30_000) })
        if (!imageResponse.ok) throw new Error(`Could not download image ${index + 1}: HTTP ${imageResponse.status}`)

        const bytes = new Uint8Array(await imageResponse.arrayBuffer())
        const extension = image.filename?.split('.').pop() || 'webp'
        const path = join(directory, `${String(index + 1).padStart(2, '0')}.${extension}`)
        await writeFile(path, bytes)
        return path
      }),
    )
    const schemaPath = join(directory, 'response-schema.json')
    const outputPath = join(directory, 'response.json')
    await writeFile(schemaPath, JSON.stringify(schema))

    await run(
      codexBin,
      [
        'exec',
        '--ephemeral',
        '--skip-git-repo-check',
        '--sandbox',
        'read-only',
        '--model',
        model,
        '--output-schema',
        schemaPath,
        '--output-last-message',
        outputPath,
        ...imagePaths.flatMap((path) => ['--image', path]),
        promptFor(job),
      ],
      { maxBuffer: 1024 * 1024 * 4, timeout: 10 * 60_000 },
    )

    const result = JSON.parse(await readFile(outputPath, 'utf8'))
    const saved = await request('/api/image-transcriptions/result', {
      body: JSON.stringify({
        documentId: job.documentId,
        kind: job.kind,
        result,
        sourceHash: job.sourceHash,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })

    if (!saved.ok) throw new Error(`Could not save transcription: HTTP ${saved.status}`)
    console.log(`Saved ${job.kind} ${job.documentId} (${imagePaths.length} images).`)
  } finally {
    await rm(directory, { force: true, recursive: true })
  }
}

function promptFor(job) {
  const bulletinRule =
    job.kind === 'bulletin'
      ? '반복되는 예배 시간·장소 안내 섹션은 제외합니다.'
      : '광고마다 형식이 달라도 임의의 공통 제목이나 항목을 만들지 않습니다.'

  return `첨부된 ${job.images.length}개 이미지를 원본 순서대로 전사하세요.

규칙:
- 이미지에 실제로 적힌 제목, 구획, 불릿, 줄바꿈 순서를 보존합니다.
- 이미지에 없는 일정, 장소, 신청 방법, 연락처, 해석을 절대 추가하지 않습니다.
- 각 이미지의 원문 제목이 있으면 그대로 Markdown 제목으로 기록합니다. 원문 제목이 없으면 제목을 만들지 않습니다.
- 여러 이미지는 이미지에 적힌 제목을 기준으로 이어 쓰며, "이미지 1" 같은 인위적 표기를 추가하지 않습니다.
- ${bulletinRule}
- summary, seoTitle, seoDescription도 원문에 근거한 짧은 한국어 텍스트만 작성합니다.

반드시 지정된 JSON 형식만 반환하세요.`
}

function request(path, options = {}) {
  return fetch(new URL(path, siteURL), {
    ...options,
    headers: {
      authorization: `Bearer ${secret}`,
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(45_000),
  })
}

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
