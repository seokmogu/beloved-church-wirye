import 'server-only'

import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { Pool } from 'pg'

import { getManageAuthConfig, getManageTrustedOrigins } from '@/lib/manage/env'

type PasswordVerifierInput = {
  hash: string
  password: string
}

const config = getManageAuthConfig()

// Keep the manager's authentication data separate from Payload's public schema.
// The public schema is retained in the search path because pgcrypto is installed
// there on the production database and is used to preserve existing bcrypt hashes.
const manageAuthPool = new Pool({
  connectionString: process.env.POSTGRES_URL || undefined,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
  max: 2,
  // Set the manager schema before Better Auth receives the client for a query.
  onConnect: (client) => client.query('SET search_path TO manage_auth, public'),
})

async function hashManagePassword(password: string): Promise<string> {
  const result = await manageAuthPool.query<{ hash: string }>(
    "SELECT public.crypt($1, public.gen_salt('bf', 12)) AS hash",
    [password],
  )

  const hash = result.rows[0]?.hash
  if (!hash) throw new Error('관리자 비밀번호 해시를 생성하지 못했습니다.')

  return hash
}

async function verifyManagePassword({ hash, password }: PasswordVerifierInput): Promise<boolean> {
  // All migrated Supabase passwords use bcrypt. Rejecting another format keeps
  // the verifier explicit and prevents accidental fallback to a weaker scheme.
  if (!hash.startsWith('$2')) return false

  const result = await manageAuthPool.query<{ verified: boolean }>(
    'SELECT public.crypt($1, $2) = $2 AS verified',
    [password, hash],
  )

  return result.rows[0]?.verified === true
}

export const manageAuth = betterAuth({
  baseURL: config.baseUrl || 'http://localhost:3000',
  database: manageAuthPool,
  emailAndPassword: {
    disableSignUp: true,
    enabled: true,
    password: {
      hash: hashManagePassword,
      verify: verifyManagePassword,
    },
  },
  // A distinct secret is required in production. PAYLOAD_SECRET is only a
  // build-safe fallback; protected manager pages and server actions remain
  // unavailable until MANAGE_AUTH_SECRET is set.
  secret: config.secret || process.env.PAYLOAD_SECRET,
  trustedOrigins: getManageTrustedOrigins(),
  plugins: [nextCookies()],
})
