import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "design_hero_title_font_size" numeric DEFAULT 88;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "design_hero_subtitle_font_size" numeric DEFAULT 30;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "design_section_title_font_size" numeric DEFAULT 48;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "design_body_font_size" numeric DEFAULT 16;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "design_hero_title_font_size";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "design_hero_subtitle_font_size";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "design_section_title_font_size";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "design_body_font_size";
  `)
}
