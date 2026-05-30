import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "hero_primary_label" = '예배안내',
      "updated_at" = now()
    WHERE "hero_primary_label" = '예배 안내';

    UPDATE "header_nav_items"
    SET "link_label" = CASE "link_label"
      WHEN '교회 소개' THEN '교회소개'
      WHEN '예배 안내' THEN '예배안내'
      WHEN '새가족 등록' THEN '새가족등록'
      WHEN '헌금 안내' THEN '헌금안내'
      WHEN '설교 영상' THEN '설교영상'
      ELSE "link_label"
    END
    WHERE "link_label" IN ('교회 소개', '예배 안내', '새가족 등록', '헌금 안내', '설교 영상');

    UPDATE "header_nav_items_children"
    SET "link_label" = CASE "link_label"
      WHEN '교회 소개' THEN '교회소개'
      WHEN '예배 안내' THEN '예배안내'
      WHEN '새가족 등록' THEN '새가족등록'
      WHEN '헌금 안내' THEN '헌금안내'
      WHEN '설교 영상' THEN '설교영상'
      ELSE "link_label"
    END
    WHERE "link_label" IN ('교회 소개', '예배 안내', '새가족 등록', '헌금 안내', '설교 영상');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "hero_primary_label" = '예배 안내',
      "updated_at" = now()
    WHERE "hero_primary_label" = '예배안내';
  `)
}
