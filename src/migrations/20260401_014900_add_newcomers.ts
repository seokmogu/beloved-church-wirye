import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "newcomers" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "phone" varchar NOT NULL,
      "email" varchar,
      "visit_date" timestamp(3) with time zone NOT NULL,
      "source" varchar NOT NULL,
      "source_detail" varchar,
      "interests" jsonb,
      "message" varchar,
      "privacy_consent" boolean DEFAULT false NOT NULL,
      "status" varchar DEFAULT 'pending',
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "newcomers_created_at_idx" ON "newcomers" ("created_at");
  `)

  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "newcomers_status_idx" ON "newcomers" ("status");
  `)

  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "newcomers_visit_date_idx" ON "newcomers" ("visit_date");
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE IF EXISTS "newcomers" CASCADE;
  `)
}
