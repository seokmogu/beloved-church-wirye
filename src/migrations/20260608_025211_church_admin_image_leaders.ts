import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// Hand-written, idempotent (this project does not keep migrate:create snapshots).
// Adds the array tables for: Bulletins.images, Announcements.images, SiteSettings.leaders.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "bulletins_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "caption" varchar
    );

    CREATE TABLE IF NOT EXISTS "announcements_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "caption" varchar
    );

    CREATE TABLE IF NOT EXISTS "site_settings_leaders" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar,
      "title" varchar,
      "role" varchar,
      "photo_id" integer,
      "bio" varchar
    );

    DO $$ BEGIN
      ALTER TABLE "bulletins_images" ADD CONSTRAINT "bulletins_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."bulletins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "bulletins_images" ADD CONSTRAINT "bulletins_images_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "announcements_images" ADD CONSTRAINT "announcements_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "announcements_images" ADD CONSTRAINT "announcements_images_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "site_settings_leaders" ADD CONSTRAINT "site_settings_leaders_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "site_settings_leaders" ADD CONSTRAINT "site_settings_leaders_photo_id_media_id_fk"
        FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "bulletins_images_order_idx" ON "bulletins_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "bulletins_images_parent_id_idx" ON "bulletins_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "bulletins_images_image_idx" ON "bulletins_images" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "announcements_images_order_idx" ON "announcements_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "announcements_images_parent_id_idx" ON "announcements_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "announcements_images_image_idx" ON "announcements_images" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "site_settings_leaders_order_idx" ON "site_settings_leaders" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_leaders_parent_id_idx" ON "site_settings_leaders" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_leaders_photo_idx" ON "site_settings_leaders" USING btree ("photo_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "bulletins_images" CASCADE;
    DROP TABLE IF EXISTS "announcements_images" CASCADE;
    DROP TABLE IF EXISTS "site_settings_leaders" CASCADE;
  `)
}
