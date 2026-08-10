import type { ImageTranscriptionKind } from '@/lib/imageTranscription'

type ImageTranscriptionDispatchInput = {
  documentId: number | string
  kind: ImageTranscriptionKind
  sourceHash: string
}

const githubAPIURL = 'https://api.github.com'

/**
 * Wake the Mac Studio self-hosted runner only when an image set changes.
 * GitHub keeps the workflow request queued while the runner is unavailable.
 */
export async function dispatchImageTranscription(input: ImageTranscriptionDispatchInput): Promise<void> {
  const token = requiredEnv('IMAGE_TRANSCRIPTION_GITHUB_TOKEN')
  const repository = requiredEnv('IMAGE_TRANSCRIPTION_GITHUB_REPOSITORY')
  const ref = process.env.IMAGE_TRANSCRIPTION_WORKFLOW_REF?.trim() || 'main'
  const workflow = process.env.IMAGE_TRANSCRIPTION_GITHUB_WORKFLOW?.trim() || 'image-transcription.yml'
  const url = new URL(
    `/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`,
    githubAPIURL,
  )

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        body: JSON.stringify({
          inputs: {
            document_id: String(input.documentId),
            kind: input.kind,
            source_hash: input.sourceHash,
          },
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

      lastError = new Error(`Image transcription workflow dispatch failed: HTTP ${response.status}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }

    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 500))
  }

  throw lastError || new Error('Image transcription workflow dispatch failed')
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required to dispatch image transcription`)
  return value
}
