import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_church_videos_status" AS ENUM('draft', 'published');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "church_videos" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar,
      "youtube_url" varchar NOT NULL,
      "video_date" timestamp(3) with time zone NOT NULL,
      "description" varchar,
      "youtube_id" varchar,
      "thumbnail" varchar,
      "status" "enum_church_videos_status" DEFAULT 'published' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "church_videos_slug_idx"
      ON "church_videos" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "church_videos_video_date_idx"
      ON "church_videos" USING btree ("video_date");
    CREATE INDEX IF NOT EXISTS "church_videos_updated_at_idx"
      ON "church_videos" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "church_videos_created_at_idx"
      ON "church_videos" USING btree ("created_at");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "church_videos_id" integer;

    DO $$
    BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_church_videos_fk"
        FOREIGN KEY ("church_videos_id") REFERENCES "public"."church_videos"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_church_videos_id_idx"
      ON "payload_locked_documents_rels" USING btree ("church_videos_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_church_videos_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_church_videos_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "church_videos_id";

    DROP INDEX IF EXISTS "church_videos_created_at_idx";
    DROP INDEX IF EXISTS "church_videos_updated_at_idx";
    DROP INDEX IF EXISTS "church_videos_video_date_idx";
    DROP INDEX IF EXISTS "church_videos_slug_idx";
    DROP TABLE IF EXISTS "church_videos" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_church_videos_status";
  `)
}
