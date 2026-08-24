import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT "youtube_id"
        FROM "sermons"
        WHERE "youtube_id" IS NOT NULL
        GROUP BY "youtube_id"
        HAVING count(*) > 1
      ) THEN
        RAISE EXCEPTION 'Cannot add unique sermons.youtube_id index while duplicate IDs exist';
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "sermons_youtube_id_unique"
      ON "sermons" USING btree ("youtube_id")
      WHERE "youtube_id" IS NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "sermons_youtube_id_unique";`)
}
