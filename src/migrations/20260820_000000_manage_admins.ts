import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Manager accounts are application data in a dedicated auth schema. The
// migration makes access state explicit so it can be managed in the CMS rather
// than through a deployment-time email allowlist.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "manage_auth"."user"
      ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'admin',
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true;

    ALTER TABLE "manage_auth"."user"
      DROP CONSTRAINT IF EXISTS "manage_auth_user_role_check";

    ALTER TABLE "manage_auth"."user"
      ADD CONSTRAINT "manage_auth_user_role_check" CHECK ("role" = 'admin');

    CREATE UNIQUE INDEX IF NOT EXISTS "manage_auth_user_email_lower_unique"
      ON "manage_auth"."user" (lower("email"));
  `)
}

// Retain the access fields during rollback. Removing them could unexpectedly
// re-enable disabled accounts or erase the record of who has admin access.
export async function down(_args: MigrateDownArgs): Promise<void> {}
