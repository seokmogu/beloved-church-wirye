import 'server-only'

import { randomUUID } from 'node:crypto'

import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { Pool } from 'pg'

import { getManageAuthConfig, getManageTrustedOrigins } from '@/lib/manage/env'

type PasswordVerifierInput = {
  hash: string
  password: string
}

type ManageAdminRow = {
  createdAt: Date
  email: string
  id: string
  isActive: boolean
  name: string
}

export type ManageAdmin = {
  createdAt: string
  email: string
  id: string
  isActive: boolean
  name: string
}

export type ManageAdminErrorCode =
  | 'duplicate-email'
  | 'invalid-email'
  | 'invalid-name'
  | 'invalid-password'
  | 'last-admin'
  | 'not-found'
  | 'self-deactivation'

export class ManageAdminError extends Error {
  code: ManageAdminErrorCode

  constructor(code: ManageAdminErrorCode) {
    super(code)
    this.code = code
  }
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

export async function hashManagePassword(password: string): Promise<string> {
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

export async function getManageAdminForUser(
  user: { email?: string | null; id?: string | null } | null | undefined,
): Promise<ManageAdmin | null> {
  const id = user?.id
  const email = normalizeEmail(user?.email)

  if (!id || !email) return null

  const result = await manageAuthPool.query<ManageAdminRow>(
    `
      SELECT id, name, email, "isActive", "createdAt"
      FROM manage_auth."user"
      WHERE id = $1
        AND lower(email) = $2
        AND role = 'admin'
        AND "isActive" = true
      LIMIT 1
    `,
    [id, email],
  )

  return result.rows[0] ? toManageAdmin(result.rows[0]) : null
}

export async function getManageAdminByEmail(email: string): Promise<ManageAdmin | null> {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return null

  const result = await manageAuthPool.query<ManageAdminRow>(
    `
      SELECT id, name, email, "isActive", "createdAt"
      FROM manage_auth."user"
      WHERE lower(email) = $1
        AND role = 'admin'
      LIMIT 1
    `,
    [normalizedEmail],
  )

  return result.rows[0] ? toManageAdmin(result.rows[0]) : null
}

export async function listManageAdmins(): Promise<ManageAdmin[]> {
  const result = await manageAuthPool.query<ManageAdminRow>(`
    SELECT id, name, email, "isActive", "createdAt"
    FROM manage_auth."user"
    WHERE role = 'admin'
    ORDER BY "isActive" DESC, "createdAt" ASC
  `)

  return result.rows.map(toManageAdmin)
}

export async function createManageAdmin(input: {
  email: string
  name: string
  password: string
}): Promise<void> {
  const email = normalizeEmail(input.email)
  const name = input.name.trim()

  if (!email || !isEmail(email)) throw new ManageAdminError('invalid-email')
  if (!name || name.length > 80) throw new ManageAdminError('invalid-name')
  if (input.password.length < 12) throw new ManageAdminError('invalid-password')

  const passwordHash = await hashManagePassword(input.password)
  const userId = randomUUID()
  const client = await manageAuthPool.connect()

  try {
    await client.query('BEGIN')
    const existing = await client.query(
      'SELECT id FROM manage_auth."user" WHERE lower(email) = $1 FOR UPDATE',
      [email],
    )

    if (existing.rowCount) throw new ManageAdminError('duplicate-email')

    await client.query(
      `
        INSERT INTO manage_auth."user"
          (id, name, email, "emailVerified", role, "isActive")
        VALUES ($1, $2, $3, true, 'admin', true)
      `,
      [userId, name, email],
    )
    await client.query(
      `
        INSERT INTO manage_auth."account"
          (id, "accountId", "providerId", "userId", password)
        VALUES ($1, $2, 'credential', $2, $3)
      `,
      [`local:${userId}`, userId, passwordHash],
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

export async function resetManageAdminPassword(input: {
  actorId: string
  password: string
  targetId: string
}): Promise<void> {
  if (input.password.length < 12) throw new ManageAdminError('invalid-password')

  const passwordHash = await hashManagePassword(input.password)
  const client = await manageAuthPool.connect()

  try {
    await client.query('BEGIN')
    const target = await client.query<{ id: string }>(
      'SELECT id FROM manage_auth."user" WHERE id = $1 AND role = \'admin\' FOR UPDATE',
      [input.targetId],
    )
    if (!target.rowCount) throw new ManageAdminError('not-found')

    const account = await client.query(
      `
        UPDATE manage_auth."account"
        SET password = $2, "updatedAt" = now()
        WHERE "userId" = $1 AND "providerId" = 'credential'
      `,
      [input.targetId, passwordHash],
    )
    if (account.rowCount !== 1) throw new ManageAdminError('not-found')

    // A reset invalidates another manager's existing sessions. The acting
    // manager keeps their own session when changing their own password.
    if (input.actorId !== input.targetId) {
      await client.query('DELETE FROM manage_auth."session" WHERE "userId" = $1', [input.targetId])
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

export async function setManageAdminActive(input: {
  actorId: string
  isActive: boolean
  targetId: string
}): Promise<void> {
  const client = await manageAuthPool.connect()

  try {
    await client.query('BEGIN')
    const target = await client.query<{ id: string; isActive: boolean }>(
      'SELECT id, "isActive" FROM manage_auth."user" WHERE id = $1 AND role = \'admin\' FOR UPDATE',
      [input.targetId],
    )
    const admin = target.rows[0]
    if (!admin) throw new ManageAdminError('not-found')

    if (!input.isActive && input.actorId === input.targetId) {
      throw new ManageAdminError('self-deactivation')
    }

    if (!input.isActive && admin.isActive) {
      const activeAdmins = await client.query<{ id: string }>(
        'SELECT id FROM manage_auth."user" WHERE role = \'admin\' AND "isActive" = true FOR UPDATE',
      )
      if ((activeAdmins.rowCount ?? 0) <= 1) throw new ManageAdminError('last-admin')
    }

    await client.query(
      'UPDATE manage_auth."user" SET "isActive" = $2, "updatedAt" = now() WHERE id = $1',
      [input.targetId, input.isActive],
    )

    if (!input.isActive) {
      await client.query('DELETE FROM manage_auth."session" WHERE "userId" = $1', [input.targetId])
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

function normalizeEmail(value: string | null | undefined): string {
  return value?.trim().toLowerCase() || ''
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function toManageAdmin(row: ManageAdminRow): ManageAdmin {
  return {
    createdAt: row.createdAt.toISOString(),
    email: row.email.toLowerCase(),
    id: row.id,
    isActive: row.isActive,
    name: row.name,
  }
}
