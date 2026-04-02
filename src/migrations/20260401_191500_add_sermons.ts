import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "sermons" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar,
      "preacher" varchar NOT NULL,
      "scripture_ref" varchar NOT NULL,
      "sermon_date" timestamp(3) with time zone NOT NULL,
      "youtube_url" varchar NOT NULL,
      "youtube_id" varchar,
      "thumbnail" varchar,
      "description" varchar,
      "sermon_series" varchar,
      "status" varchar DEFAULT 'draft' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "sermons_slug_idx" ON "sermons" USING btree ("slug");
  `)

  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "sermons_sermon_date_idx" ON "sermons" USING btree ("sermon_date");
  `)

  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "sermons_created_at_idx" ON "sermons" USING btree ("created_at");
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE IF EXISTS "sermons" CASCADE;
  `)
}
