import 'server-only'

export type ManageAuthConfig = {
  baseUrl?: string
  secret?: string
}

export function getManageAuthConfig(): ManageAuthConfig {
  return {
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URL?.trim(),
    secret: process.env.MANAGE_AUTH_SECRET?.trim(),
  }
}

export function getManageTrustedOrigins(): string[] {
  const candidates = [
    process.env.NEXT_PUBLIC_SERVER_URL,
    ...(process.env.PAYLOAD_PUBLIC_ORIGINS || '').split(','),
  ]

  return [...new Set(candidates.map((value) => value?.trim()).filter(isHttpUrl))]
}

export function getManageAdminLoginAliases(): Record<string, string> {
  return (process.env.MANAGE_ADMIN_LOGIN_ALIASES || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .reduce<Record<string, string>>((aliases, entry) => {
      const separator = entry.indexOf('=')
      if (separator <= 0) return aliases

      const alias = entry.slice(0, separator).trim()
      const email = entry.slice(separator + 1).trim()
      if (alias && email) aliases[alias] = email

      return aliases
    }, {})
}

export function resolveManageLoginIdentifier(identifier: string): string {
  const normalized = identifier.trim().toLowerCase()
  if (!normalized) return normalized

  return getManageAdminLoginAliases()[normalized] || normalized
}

export function getManageMissingEnv(): string[] {
  const missing: string[] = []
  const { baseUrl, secret } = getManageAuthConfig()

  if (!baseUrl) missing.push('NEXT_PUBLIC_SERVER_URL')
  else if (!isHttpUrl(baseUrl)) missing.push('NEXT_PUBLIC_SERVER_URL (http 또는 https URL)')

  if (!secret) missing.push('MANAGE_AUTH_SECRET')
  else if (secret.length < 32) missing.push('MANAGE_AUTH_SECRET (32자 이상)')

  return missing
}

function isHttpUrl(value: string | undefined): value is string {
  if (!value) return false

  try {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
