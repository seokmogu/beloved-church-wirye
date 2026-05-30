import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "church_news" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "date" timestamp(3) with time zone NOT NULL,
      "is_public" boolean DEFAULT true,
      "description" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "church_news_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "caption" varchar
    );

    DO $$
    BEGIN
      ALTER TABLE "church_news_images"
        ADD CONSTRAINT "church_news_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."church_news"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$
    BEGIN
      ALTER TABLE "church_news_images"
        ADD CONSTRAINT "church_news_images_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "church_news_images_order_idx"
      ON "church_news_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "church_news_images_parent_id_idx"
      ON "church_news_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "church_news_images_image_idx"
      ON "church_news_images" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "church_news_date_idx"
      ON "church_news" USING btree ("date");
    CREATE INDEX IF NOT EXISTS "church_news_updated_at_idx"
      ON "church_news" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "church_news_created_at_idx"
      ON "church_news" USING btree ("created_at");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "church_news_id" integer;

    DO $$
    BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_church_news_fk"
        FOREIGN KEY ("church_news_id") REFERENCES "public"."church_news"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_church_news_id_idx"
      ON "payload_locked_documents_rels" USING btree ("church_news_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_church_news_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_church_news_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "church_news_id";

    ALTER TABLE "church_news_images"
      DROP CONSTRAINT IF EXISTS "church_news_images_image_id_media_id_fk";
    ALTER TABLE "church_news_images"
      DROP CONSTRAINT IF EXISTS "church_news_images_parent_id_fk";
    DROP INDEX IF EXISTS "church_news_images_image_idx";
    DROP INDEX IF EXISTS "church_news_images_parent_id_idx";
    DROP INDEX IF EXISTS "church_news_images_order_idx";
    DROP INDEX IF EXISTS "church_news_created_at_idx";
    DROP INDEX IF EXISTS "church_news_updated_at_idx";
    DROP INDEX IF EXISTS "church_news_date_idx";
    DROP TABLE IF EXISTS "church_news_images" CASCADE;
    DROP TABLE IF EXISTS "church_news" CASCADE;
  `)
}
