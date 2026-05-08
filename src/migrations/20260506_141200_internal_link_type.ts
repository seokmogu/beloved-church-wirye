import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_hero_links_link_type" ADD VALUE IF NOT EXISTS 'internal';
    ALTER TYPE "public"."enum_pages_blocks_content_columns_link_type" ADD VALUE IF NOT EXISTS 'internal';
    ALTER TYPE "public"."enum__pages_v_version_hero_links_link_type" ADD VALUE IF NOT EXISTS 'internal';
    ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_type" ADD VALUE IF NOT EXISTS 'internal';
    ALTER TYPE "public"."enum_header_nav_items_link_type" ADD VALUE IF NOT EXISTS 'internal';
    ALTER TYPE "public"."enum_footer_nav_items_link_type" ADD VALUE IF NOT EXISTS 'internal';

    ALTER TABLE "pages_hero_links" ADD COLUMN IF NOT EXISTS "link_internal_path" varchar;
    ALTER TABLE "pages_blocks_content_columns" ADD COLUMN IF NOT EXISTS "link_internal_path" varchar;
    ALTER TABLE "_pages_v_version_hero_links" ADD COLUMN IF NOT EXISTS "link_internal_path" varchar;
    ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN IF NOT EXISTS "link_internal_path" varchar;
    ALTER TABLE "header_nav_items" ADD COLUMN IF NOT EXISTS "link_internal_path" varchar;
    ALTER TABLE "footer_nav_items" ADD COLUMN IF NOT EXISTS "link_internal_path" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_hero_links" DROP COLUMN IF EXISTS "link_internal_path";
    ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "link_internal_path";
    ALTER TABLE "_pages_v_version_hero_links" DROP COLUMN IF EXISTS "link_internal_path";
    ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "link_internal_path";
    ALTER TABLE "header_nav_items" DROP COLUMN IF EXISTS "link_internal_path";
    ALTER TABLE "footer_nav_items" DROP COLUMN IF EXISTS "link_internal_path";
  `)
}
