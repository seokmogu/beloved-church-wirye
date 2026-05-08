import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN "header_logo_height" numeric DEFAULT 40;
    ALTER TABLE "site_settings" ADD COLUMN "header_logo_invert" boolean DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN "header_logo_height";
    ALTER TABLE "site_settings" DROP COLUMN "header_logo_invert";
  `)
}
