export const PUBLIC_MEDIA_R2_PREFIX = 'media'

const PUBLIC_MEDIA_R2_REQUIRED_ENV_NAMES = [
  'R2_MEDIA_ACCESS_KEY_ID',
  'R2_MEDIA_BUCKET',
  'R2_MEDIA_ENDPOINT',
  'R2_MEDIA_PUBLIC_URL',
  'R2_MEDIA_SECRET_ACCESS_KEY',
] as const

type EnvSource = Record<string, string | undefined>

export function isPublicMediaR2Configured(env: EnvSource = process.env): boolean {
  return PUBLIC_MEDIA_R2_REQUIRED_ENV_NAMES.every((name) => Boolean(env[name]?.trim()))
}

export function buildPublicMediaR2URL({
  filename,
  prefix,
  publicURL = process.env.R2_MEDIA_PUBLIC_URL,
}: {
  filename: string
  prefix?: null | string
  publicURL?: string
}): string {
  const baseURL = publicURL?.trim().replace(/\/+$/, '')
  if (!baseURL) throw new Error('R2_MEDIA_PUBLIC_URL is required')

  const normalizedPrefix = (prefix || PUBLIC_MEDIA_R2_PREFIX).replace(/^\/+|\/+$/g, '')
  const key = `${normalizedPrefix}/${filename}`
  return `${baseURL}/${key}`
}
