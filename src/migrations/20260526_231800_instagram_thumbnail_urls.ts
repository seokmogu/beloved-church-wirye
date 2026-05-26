import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_instagram_posts"
      ADD COLUMN IF NOT EXISTS "thumbnail_url" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_instagram_posts"
      DROP COLUMN IF EXISTS "thumbnail_url";
  `)
}
