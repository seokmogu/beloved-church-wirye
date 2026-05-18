import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getManageSupabaseConfig } from '@/lib/manage/env'

export async function createManageSupabaseServerClient() {
  const { key, url } = getManageSupabaseConfig()

  if (!url || !key) return null

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components cannot write cookies; Server Actions and Route Handlers can.
        }
      },
    },
  })
}
