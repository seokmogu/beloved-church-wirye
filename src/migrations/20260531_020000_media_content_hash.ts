import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "content_hash" varchar;
    CREATE INDEX IF NOT EXISTS "media_content_hash_idx" ON "media" USING btree ("content_hash");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_content_hash_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "content_hash";
  `)
}
