import { parseYouTubeVideoId } from '@/lib/sermonTranscription'

type SermonTranscriptionDispatchInput = {
  videoId: string
}

const githubAPIURL = 'https://api.github.com'

/**
 * Dispatch a single confirmed YouTube upload to the Mac Studio self-hosted
 * runner. GitHub keeps the request queued if the Mac Studio is temporarily
 * offline, while the video ID keeps the worker idempotent.
 */
export async function dispatchSermonTranscription(
  input: SermonTranscriptionDispatchInput,
): Promise<void> {
  const videoId = parseYouTubeVideoId(input.videoId)
  if (!videoId) throw new Error('A canonical YouTube video ID is required')

  const token = requiredEnv('SERMON_TRANSCRIPTION_GITHUB_TOKEN')
  const repository = requiredEnv('SERMON_TRANSCRIPTION_GITHUB_REPOSITORY')
  const ref = process.env.SERMON_TRANSCRIPTION_WORKFLOW_REF?.trim() || 'main'
  const workflow = process.env.SERMON_TRANSCRIPTION_GITHUB_WORKFLOW?.trim() || 'sermon-transcription.yml'
  const url = new URL(
    `/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`,
    githubAPIURL,
  )

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        body: JSON.stringify({
          inputs: { video_id: videoId },
          ref,
        }),
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          'x-github-api-version': '2022-11-28',
        },
        method: 'POST',
        signal: AbortSignal.timeout(15_000),
      })

      if (response.ok) return

      lastError = new Error(`Sermon transcription workflow dispatch failed: HTTP ${response.status}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }

    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 500))
  }

  throw lastError || new Error('Sermon transcription workflow dispatch failed')
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required to dispatch sermon transcription`)
  return value
}
