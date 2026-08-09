import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "bulletins"
      ADD COLUMN IF NOT EXISTS "accessible_content_summary" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_content" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_seo_title" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_seo_description" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_source_hash" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_processed_at" timestamp(3) with time zone;

    ALTER TABLE "church_news"
      ADD COLUMN IF NOT EXISTS "accessible_content_summary" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_content" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_seo_title" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_seo_description" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_source_hash" varchar,
      ADD COLUMN IF NOT EXISTS "accessible_content_processed_at" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "bulletins"
      DROP COLUMN IF EXISTS "accessible_content_processed_at",
      DROP COLUMN IF EXISTS "accessible_content_source_hash",
      DROP COLUMN IF EXISTS "accessible_content_seo_description",
      DROP COLUMN IF EXISTS "accessible_content_seo_title",
      DROP COLUMN IF EXISTS "accessible_content_content",
      DROP COLUMN IF EXISTS "accessible_content_summary";

    ALTER TABLE "church_news"
      DROP COLUMN IF EXISTS "accessible_content_processed_at",
      DROP COLUMN IF EXISTS "accessible_content_source_hash",
      DROP COLUMN IF EXISTS "accessible_content_seo_description",
      DROP COLUMN IF EXISTS "accessible_content_seo_title",
      DROP COLUMN IF EXISTS "accessible_content_content",
      DROP COLUMN IF EXISTS "accessible_content_summary";
  `)
}
