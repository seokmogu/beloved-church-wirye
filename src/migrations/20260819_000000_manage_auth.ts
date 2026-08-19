import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Better Auth owns these tables, but Payload owns their provisioning so a
// Git-based deployment can initialize a new Neon branch deterministically.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE SCHEMA IF NOT EXISTS "manage_auth";

    CREATE TABLE IF NOT EXISTS "manage_auth"."user" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "emailVerified" boolean NOT NULL DEFAULT false,
      "image" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "manage_auth"."session" (
      "id" text PRIMARY KEY,
      "expiresAt" timestamptz NOT NULL,
      "token" text NOT NULL UNIQUE,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "ipAddress" text,
      "userAgent" text,
      "userId" text NOT NULL REFERENCES "manage_auth"."user"("id") ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS "manage_auth_session_user_id_idx"
      ON "manage_auth"."session" ("userId");

    CREATE TABLE IF NOT EXISTS "manage_auth"."account" (
      "id" text PRIMARY KEY,
      "accountId" text NOT NULL,
      "providerId" text NOT NULL,
      "userId" text NOT NULL REFERENCES "manage_auth"."user"("id") ON DELETE CASCADE,
      "accessToken" text,
      "refreshToken" text,
      "idToken" text,
      "accessTokenExpiresAt" timestamptz,
      "refreshTokenExpiresAt" timestamptz,
      "scope" text,
      "password" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      UNIQUE ("providerId", "accountId")
    );

    CREATE INDEX IF NOT EXISTS "manage_auth_account_user_id_idx"
      ON "manage_auth"."account" ("userId");

    CREATE TABLE IF NOT EXISTS "manage_auth"."verification" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expiresAt" timestamptz NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "manage_auth_verification_identifier_idx"
      ON "manage_auth"."verification" ("identifier");
  `)
}

// Authentication records are intentionally retained during a Payload rollback.
// Removing this migration must never silently delete administrator accounts or
// invalidate preserved bcrypt passwords.
export async function down(_args: MigrateDownArgs): Promise<void> {}
