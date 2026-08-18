import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "gallery_media" (
      "id" serial PRIMARY KEY NOT NULL,
      "alt" varchar,
      "content_hash" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric,
      "sizes_thumbnail_url" varchar,
      "sizes_thumbnail_width" numeric,
      "sizes_thumbnail_height" numeric,
      "sizes_thumbnail_mime_type" varchar,
      "sizes_thumbnail_filesize" numeric,
      "sizes_thumbnail_filename" varchar,
      "sizes_card_url" varchar,
      "sizes_card_width" numeric,
      "sizes_card_height" numeric,
      "sizes_card_mime_type" varchar,
      "sizes_card_filesize" numeric,
      "sizes_card_filename" varchar,
      "sizes_display_url" varchar,
      "sizes_display_width" numeric,
      "sizes_display_height" numeric,
      "sizes_display_mime_type" varchar,
      "sizes_display_filesize" numeric,
      "sizes_display_filename" varchar
    );

    CREATE TABLE IF NOT EXISTS "gallery_albums" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "event_date" timestamp(3) with time zone NOT NULL,
      "is_public" boolean DEFAULT false,
      "description" varchar,
      "cover_image_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "gallery_albums_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "caption" varchar
    );

    DO $$
    BEGIN
      ALTER TABLE "gallery_albums"
        ADD CONSTRAINT "gallery_albums_cover_image_id_gallery_media_id_fk"
        FOREIGN KEY ("cover_image_id") REFERENCES "public"."gallery_media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$
    BEGIN
      ALTER TABLE "gallery_albums_images"
        ADD CONSTRAINT "gallery_albums_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_albums"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$
    BEGIN
      ALTER TABLE "gallery_albums_images"
        ADD CONSTRAINT "gallery_albums_images_image_id_gallery_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."gallery_media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "gallery_media_content_hash_idx"
      ON "gallery_media" USING btree ("content_hash");
    CREATE INDEX IF NOT EXISTS "gallery_media_updated_at_idx"
      ON "gallery_media" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "gallery_media_created_at_idx"
      ON "gallery_media" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "gallery_media_filename_idx"
      ON "gallery_media" USING btree ("filename");
    CREATE INDEX IF NOT EXISTS "gallery_media_sizes_thumbnail_filename_idx"
      ON "gallery_media" USING btree ("sizes_thumbnail_filename");
    CREATE INDEX IF NOT EXISTS "gallery_media_sizes_card_filename_idx"
      ON "gallery_media" USING btree ("sizes_card_filename");
    CREATE INDEX IF NOT EXISTS "gallery_media_sizes_display_filename_idx"
      ON "gallery_media" USING btree ("sizes_display_filename");
    CREATE INDEX IF NOT EXISTS "gallery_albums_cover_image_idx"
      ON "gallery_albums" USING btree ("cover_image_id");
    CREATE INDEX IF NOT EXISTS "gallery_albums_event_date_idx"
      ON "gallery_albums" USING btree ("event_date");
    CREATE INDEX IF NOT EXISTS "gallery_albums_updated_at_idx"
      ON "gallery_albums" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "gallery_albums_created_at_idx"
      ON "gallery_albums" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "gallery_albums_images_order_idx"
      ON "gallery_albums_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "gallery_albums_images_parent_id_idx"
      ON "gallery_albums_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "gallery_albums_images_image_idx"
      ON "gallery_albums_images" USING btree ("image_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "gallery_albums_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "gallery_media_id" integer;

    DO $$
    BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_gallery_albums_fk"
        FOREIGN KEY ("gallery_albums_id") REFERENCES "public"."gallery_albums"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$
    BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_gallery_media_fk"
        FOREIGN KEY ("gallery_media_id") REFERENCES "public"."gallery_media"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_gallery_albums_id_idx"
      ON "payload_locked_documents_rels" USING btree ("gallery_albums_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_gallery_media_id_idx"
      ON "payload_locked_documents_rels" USING btree ("gallery_media_id");

    -- 기존 상단 메뉴가 사용자별로 수정된 경우에도 교회소식 하위에 한 번만 추가한다.
    INSERT INTO "header_nav_items_children"
      ("_order", "_parent_id", "id", "link_type", "link_new_tab", "link_internal_path", "link_label")
    SELECT
      COALESCE(MAX(children."_order") + 1, 0),
      parent."id",
      'main-church-news-gallery',
      'internal',
      false,
      '/gallery',
      '행사갤러리'
    FROM "header_nav_items" parent
    LEFT JOIN "header_nav_items_children" children ON children."_parent_id" = parent."id"
    WHERE parent."link_internal_path" = '/church-news'
      AND NOT EXISTS (
        SELECT 1 FROM "header_nav_items_children" existing
        WHERE existing."link_internal_path" = '/gallery'
      )
    GROUP BY parent."id"
    LIMIT 1;

    UPDATE "header" SET "updated_at" = now()
    WHERE EXISTS (
      SELECT 1 FROM "header_nav_items_children"
      WHERE "link_internal_path" = '/gallery'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "header_nav_items_children"
    WHERE "id" = 'main-church-news-gallery' AND "link_internal_path" = '/gallery';

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_gallery_albums_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_gallery_media_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_gallery_albums_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_gallery_media_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "gallery_albums_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "gallery_media_id";

    ALTER TABLE "gallery_albums"
      DROP CONSTRAINT IF EXISTS "gallery_albums_cover_image_id_gallery_media_id_fk";
    ALTER TABLE "gallery_albums_images"
      DROP CONSTRAINT IF EXISTS "gallery_albums_images_parent_id_fk";
    ALTER TABLE "gallery_albums_images"
      DROP CONSTRAINT IF EXISTS "gallery_albums_images_image_id_gallery_media_id_fk";
    DROP INDEX IF EXISTS "gallery_albums_images_image_idx";
    DROP INDEX IF EXISTS "gallery_albums_images_parent_id_idx";
    DROP INDEX IF EXISTS "gallery_albums_images_order_idx";
    DROP INDEX IF EXISTS "gallery_albums_created_at_idx";
    DROP INDEX IF EXISTS "gallery_albums_updated_at_idx";
    DROP INDEX IF EXISTS "gallery_albums_event_date_idx";
    DROP INDEX IF EXISTS "gallery_albums_cover_image_idx";
    DROP TABLE IF EXISTS "gallery_albums_images" CASCADE;
    DROP TABLE IF EXISTS "gallery_albums" CASCADE;

    DROP INDEX IF EXISTS "gallery_media_sizes_display_filename_idx";
    DROP INDEX IF EXISTS "gallery_media_sizes_card_filename_idx";
    DROP INDEX IF EXISTS "gallery_media_sizes_thumbnail_filename_idx";
    DROP INDEX IF EXISTS "gallery_media_filename_idx";
    DROP INDEX IF EXISTS "gallery_media_created_at_idx";
    DROP INDEX IF EXISTS "gallery_media_updated_at_idx";
    DROP INDEX IF EXISTS "gallery_media_content_hash_idx";
    DROP TABLE IF EXISTS "gallery_media" CASCADE;
  `)
}
