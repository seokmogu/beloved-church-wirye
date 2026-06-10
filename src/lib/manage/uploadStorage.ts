export const uploadStorageNotConfiguredCode = 'UPLOAD_STORAGE_NOT_CONFIGURED'

type UploadStorageEnv = {
  BLOB_READ_WRITE_TOKEN?: string
}

export class UploadStorageNotConfiguredError extends Error {
  constructor() {
    super(uploadStorageNotConfiguredCode)
    this.name = 'UploadStorageNotConfiguredError'
  }
}

export function isDurableUploadStorageConfigured(env: UploadStorageEnv = process.env): boolean {
  return Boolean(env.BLOB_READ_WRITE_TOKEN?.trim())
}

export function assertDurableUploadStorageConfigured(
  fileCount: number,
  env: UploadStorageEnv = process.env,
) {
  if (fileCount <= 0) return
  if (!isDurableUploadStorageConfigured(env)) throw new UploadStorageNotConfiguredError()
}

export function isUploadStorageNotConfiguredError(error: unknown): boolean {
  return error instanceof Error && error.message === uploadStorageNotConfiguredCode
}
