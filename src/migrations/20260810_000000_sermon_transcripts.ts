import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_sermons_transcript_status" AS ENUM ('unavailable', 'automatic', 'reviewed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_sermons_transcript_source" AS ENUM ('whisper', 'youtube_automatic', 'combined', 'manual');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "sermons"
      ADD COLUMN IF NOT EXISTS "public_transcript" varchar,
      ADD COLUMN IF NOT EXISTS "raw_transcript" varchar,
      ADD COLUMN IF NOT EXISTS "transcript_status" "enum_sermons_transcript_status" DEFAULT 'unavailable' NOT NULL,
      ADD COLUMN IF NOT EXISTS "transcript_source" "enum_sermons_transcript_source",
      ADD COLUMN IF NOT EXISTS "transcript_updated_at" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sermons"
      DROP COLUMN IF EXISTS "public_transcript",
      DROP COLUMN IF EXISTS "raw_transcript",
      DROP COLUMN IF EXISTS "transcript_status",
      DROP COLUMN IF EXISTS "transcript_source",
      DROP COLUMN IF EXISTS "transcript_updated_at";
    DROP TYPE IF EXISTS "public"."enum_sermons_transcript_status";
    DROP TYPE IF EXISTS "public"."enum_sermons_transcript_source";
  `)
}
