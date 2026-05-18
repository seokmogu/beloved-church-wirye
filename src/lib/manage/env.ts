import 'server-only'

export type ManageSupabaseConfig = {
  key?: string
  keyName?: string
  url?: string
}

export function getManageSupabaseConfig(): ManageSupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  return {
    key: publishableKey || anonKey,
    keyName: publishableKey
      ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
      : anonKey
        ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        : undefined,
    url,
  }
}

export function getManageAdminEmails(): string[] {
  return (process.env.MANAGE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function getManageMissingEnv(): string[] {
  const { key, url } = getManageSupabaseConfig()
  const missing: string[] = []

  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!key) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  if (getManageAdminEmails().length === 0) missing.push('MANAGE_ADMIN_EMAILS')

  return missing
}

export function isManageAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getManageAdminEmails().includes(email.trim().toLowerCase())
}
