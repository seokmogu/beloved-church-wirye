import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "header_nav_items_children" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "link_type" "enum_header_nav_items_link_type" DEFAULT 'internal',
      "link_new_tab" boolean,
      "link_internal_path" varchar,
      "link_url" varchar,
      "link_label" varchar NOT NULL
    );

    DO $$
    BEGIN
      ALTER TABLE "header_nav_items_children"
        ADD CONSTRAINT "header_nav_items_children_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "header_nav_items_children_order_idx"
      ON "header_nav_items_children" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "header_nav_items_children_parent_id_idx"
      ON "header_nav_items_children" USING btree ("_parent_id");

    ALTER TABLE "header_nav_items_children" DISABLE ROW LEVEL SECURITY;

    DO $$
    DECLARE
      header_id integer;
    BEGIN
      SELECT "id" INTO header_id FROM "header" ORDER BY "id" LIMIT 1;

      IF header_id IS NULL THEN
        INSERT INTO "header" ("updated_at", "created_at")
        VALUES (now(), now())
        RETURNING "id" INTO header_id;
      END IF;

      DELETE FROM "header_nav_items_children"
      WHERE "_parent_id" IN (
        SELECT "id" FROM "header_nav_items" WHERE "_parent_id" = header_id
      );

      DELETE FROM "header_nav_items"
      WHERE "_parent_id" = header_id;

      INSERT INTO "header_nav_items"
        ("_order", "_parent_id", "id", "link_type", "link_new_tab", "link_internal_path", "link_label")
      VALUES
        (0, header_id, 'main-about', 'internal', false, '/about', '교회소개'),
        (1, header_id, 'main-sermon-videos', 'internal', false, '/sermon', '설교영상'),
        (2, header_id, 'main-announcements', 'internal', false, '/announcements', '공지사항'),
        (3, header_id, 'main-church-news', 'internal', false, '/church-news', '교회소식');

      INSERT INTO "header_nav_items_children"
        ("_order", "_parent_id", "id", "link_type", "link_new_tab", "link_internal_path", "link_label")
      VALUES
        (0, 'main-about', 'main-about-intro', 'internal', false, '/about', '교회소개'),
        (1, 'main-about', 'main-about-leaders', 'internal', false, '/about/leaders', '섬기는 사람들'),
        (2, 'main-about', 'main-about-worship', 'internal', false, '/worship', '예배안내'),
        (3, 'main-about', 'main-about-newcomer', 'internal', false, '/newcomer', '새가족등록'),
        (4, 'main-about', 'main-about-bulletins', 'internal', false, '/bulletins', '주보'),
        (0, 'main-church-news', 'main-church-news-index', 'internal', false, '/church-news', '교회소식'),
        (1, 'main-church-news', 'main-church-news-videos', 'internal', false, '/church-news/videos', '동영상');

      UPDATE "header" SET "updated_at" = now() WHERE "id" = header_id;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "header_nav_items"
    WHERE "id" IN ('main-about', 'main-sermon-videos', 'main-announcements', 'main-church-news');

    ALTER TABLE "header_nav_items_children"
      DROP CONSTRAINT IF EXISTS "header_nav_items_children_parent_id_fk";
    DROP INDEX IF EXISTS "header_nav_items_children_parent_id_idx";
    DROP INDEX IF EXISTS "header_nav_items_children_order_idx";
    DROP TABLE IF EXISTS "header_nav_items_children" CASCADE;
  `)
}
