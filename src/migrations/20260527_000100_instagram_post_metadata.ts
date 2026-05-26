import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_instagram_posts"
      ADD COLUMN IF NOT EXISTS "caption" varchar,
      ADD COLUMN IF NOT EXISTS "published_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "hashtags" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_instagram_posts"
      DROP COLUMN IF EXISTS "hashtags",
      DROP COLUMN IF EXISTS "published_at",
      DROP COLUMN IF EXISTS "caption";
  `)
}
