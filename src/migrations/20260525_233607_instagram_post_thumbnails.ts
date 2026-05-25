import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_instagram_posts" ADD COLUMN IF NOT EXISTS "thumbnail_id" integer;

    DO $$
    BEGIN
      ALTER TABLE "site_settings_instagram_posts"
        ADD CONSTRAINT "site_settings_instagram_posts_thumbnail_id_media_id_fk"
        FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "site_settings_instagram_posts_thumbnail_idx"
      ON "site_settings_instagram_posts" USING btree ("thumbnail_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings_instagram_posts"
      DROP CONSTRAINT IF EXISTS "site_settings_instagram_posts_thumbnail_id_media_id_fk";
    DROP INDEX IF EXISTS "site_settings_instagram_posts_thumbnail_idx";
    ALTER TABLE "site_settings_instagram_posts" DROP COLUMN IF EXISTS "thumbnail_id";
  `)
}
