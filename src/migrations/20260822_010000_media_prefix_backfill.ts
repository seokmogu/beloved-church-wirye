import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "media"
      SET "prefix" = 'media'
      WHERE "prefix" IS NULL OR "prefix" = '';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "media"
      SET "prefix" = NULL
      WHERE "prefix" = 'media';
  `)
}
