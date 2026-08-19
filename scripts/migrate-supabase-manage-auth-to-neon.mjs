import pg from 'pg'

const sourceConnectionString = process.env.SOURCE_AUTH_DATABASE_URL
const targetConnectionString = process.env.TARGET_AUTH_DATABASE_URL

if (!sourceConnectionString || !targetConnectionString) {
  throw new Error('SOURCE_AUTH_DATABASE_URL and TARGET_AUTH_DATABASE_URL are required')
}

const source = new pg.Client({ connectionString: sourceConnectionString })
const target = new pg.Client({ connectionString: targetConnectionString })

const sourceUsers = await (async () => {
  await source.connect()

  const result = await source.query(`
    SELECT
      id::text AS id,
      lower(email) AS email,
      COALESCE(
        NULLIF(raw_user_meta_data->>'full_name', ''),
        NULLIF(raw_user_meta_data->>'name', ''),
        split_part(email, '@', 1)
      ) AS name,
      (email_confirmed_at IS NOT NULL) AS "emailVerified",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      encrypted_password AS password
    FROM auth.users
    WHERE email IS NOT NULL
      AND encrypted_password IS NOT NULL
    ORDER BY id
  `)

  await source.end()
  return result.rows
})()

if (sourceUsers.length === 0) {
  throw new Error('No password-authenticated source accounts were found')
}

if (sourceUsers.some((user) => typeof user.password !== 'string' || !user.password.startsWith('$2'))) {
  throw new Error('Source contains a password hash that is not bcrypt; migration stopped')
}

await target.connect()

try {
  await target.query('BEGIN')

  const existing = await target.query('SELECT id, email FROM manage_auth."user"')
  const sourceById = new Map(sourceUsers.map((user) => [user.id, user]))

  for (const user of existing.rows) {
    const sourceUser = sourceById.get(user.id)

    if (!sourceUser || sourceUser.email !== user.email) {
      throw new Error('Target contains an unrelated manager account; migration stopped')
    }
  }

  for (const user of sourceUsers) {
    await target.query(
      `
        INSERT INTO manage_auth."user"
          (id, name, email, "emailVerified", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          "emailVerified" = EXCLUDED."emailVerified",
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [user.id, user.name, user.email, user.emailVerified, user.createdAt, user.updatedAt],
    )

    await target.query(
      `
        INSERT INTO manage_auth."account"
          (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        VALUES ($1, $2, 'credential', $2, $3, $4, $5)
        ON CONFLICT ("providerId", "accountId") DO UPDATE SET
          "userId" = EXCLUDED."userId",
          password = EXCLUDED.password,
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [`supabase:${user.id}`, user.id, user.password, user.createdAt, user.updatedAt],
    )

    // Supabase session cookies cannot be transferred safely. Passwords are
    // preserved, while every administrator signs in once on the new session.
    await target.query('DELETE FROM manage_auth."session" WHERE "userId" = $1', [user.id])
  }

  const verification = await target.query(`
    SELECT
      count(*)::int AS users,
      count(*) FILTER (WHERE password LIKE '$2%')::int AS bcrypt_accounts
    FROM manage_auth."user" u
    JOIN manage_auth."account" a ON a."userId" = u.id
    WHERE a."providerId" = 'credential'
  `)

  const verified = verification.rows[0]
  if (verified.users !== sourceUsers.length || verified.bcrypt_accounts !== sourceUsers.length) {
    throw new Error('Target verification did not match the source account count')
  }

  await target.query('COMMIT')
  console.log(JSON.stringify({ migratedAccounts: sourceUsers.length, bcryptAccounts: verified.bcrypt_accounts }))
} catch (error) {
  await target.query('ROLLBACK').catch(() => undefined)
  throw error
} finally {
  await target.end()
}
