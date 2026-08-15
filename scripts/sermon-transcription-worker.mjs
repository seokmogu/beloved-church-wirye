import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { dirname, resolve as resolvePath } from 'node:path'

const siteURL = process.env.SERMON_TRANSCRIPTION_SITE_URL?.replace(/\/$/, '')
const workerSecret = process.env.SERMON_TRANSCRIPTION_WORKER_SECRET
const runner = process.env.SERMON_TRANSCRIPTION_RUNNER
const videoIds = (process.env.SERMON_TRANSCRIPTION_VIDEO_IDS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

if (!siteURL || !workerSecret || !runner) {
  throw new Error(
    'SERMON_TRANSCRIPTION_SITE_URL, SERMON_TRANSCRIPTION_WORKER_SECRET, and SERMON_TRANSCRIPTION_RUNNER are required',
  )
}

const jobs = await fetchPendingJobs()
for (const job of jobs) {
  const runDir = await runSermonWorker(job.youtubeUrl)
  const [washingReport, publicTranscript, rawTranscript] = await Promise.all([
    readJSON(`${runDir}/washing-report.json`),
    readFile(`${runDir}/transcript.washed.txt`, 'utf8'),
    readFile(`${runDir}/transcript.raw.txt`, 'utf8'),
  ])

  if (washingReport.accepted !== true) {
    throw new Error(`Sermon transcription was not accepted for ${job.videoId}`)
  }

  await request('/api/sermon-transcriptions/result', {
    method: 'POST',
    body: JSON.stringify({
      result: { publicTranscript, rawTranscript },
      videoId: job.videoId,
    }),
  })
  console.log(`Published automatic transcript for ${job.videoId}`)
}

async function fetchPendingJobs() {
  if (videoIds.length === 0) {
    const response = await request('/api/sermon-transcriptions/pending')
    return response.jobs || []
  }

  const responses = await Promise.all(
    videoIds.map((videoId) =>
      request(`/api/sermon-transcriptions/pending?videoId=${encodeURIComponent(videoId)}`),
    ),
  )
  return responses.flatMap((response) => response.jobs || [])
}

async function runSermonWorker(youtubeUrl) {
  const output = await run(runner, ['--youtube-url', youtubeUrl])
  const completion = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .find((value) => value?.runDir)

  if (!completion?.runDir || completion.accepted !== true) {
    throw new Error('Sermon worker did not return an accepted run directory')
  }
  return completion.runDir
}

async function request(path, options = {}) {
  const response = await fetch(`${siteURL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${workerSecret}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`)
  }
  return body
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: resolvePath(dirname(command), '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
      process.stdout.write(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
      process.stderr.write(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(stdout)
      else reject(new Error(`${command} failed with ${code}: ${stderr.trim()}`))
    })
  })
}

async function readJSON(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}
