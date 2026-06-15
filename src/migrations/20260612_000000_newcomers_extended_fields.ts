import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

// Hand-written, idempotent (this project does not keep migrate:create snapshots).
// Adds the registration-card fields introduced on the Newcomers collection:
//   scalars: gender, birthDate, age, address, schoolOrWork, faithExperience,
//            previousChurch, mbti, baptismStatus, groupChatConsent,
//            conductConsent, faithCommunityConsent
//   hasMany selects (child tables): sourceChannels, churchRoles
// New columns are added nullable (or DEFAULT false) so existing newcomer rows are preserved.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_newcomers_gender" AS ENUM('male', 'female'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_newcomers_source_channels" AS ENUM('referral', 'sns', 'youtube', 'search', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_newcomers_faith_experience" AS ENUM('firstTime', 'returning', 'transfer'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_newcomers_baptism_status" AS ENUM('baptized', 'notBaptized'); EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_newcomers_church_roles" AS ENUM('deacon', 'kwonsa', 'elder', 'pastor'); EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "gender" "enum_newcomers_gender";
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "birth_date" timestamp(3) with time zone;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "age" varchar;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "address" varchar;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "school_or_work" varchar;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "faith_experience" "enum_newcomers_faith_experience";
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "previous_church" varchar;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "mbti" varchar;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "baptism_status" "enum_newcomers_baptism_status";
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "group_chat_consent" boolean DEFAULT false NOT NULL;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "conduct_consent" boolean DEFAULT false NOT NULL;
    ALTER TABLE "newcomers" ADD COLUMN IF NOT EXISTS "faith_community_consent" boolean DEFAULT false NOT NULL;

    CREATE TABLE IF NOT EXISTS "newcomers_source_channels" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_newcomers_source_channels",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "newcomers_church_roles" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_newcomers_church_roles",
      "id" serial PRIMARY KEY NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "newcomers_source_channels" ADD CONSTRAINT "newcomers_source_channels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."newcomers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "newcomers_church_roles" ADD CONSTRAINT "newcomers_church_roles_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."newcomers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "newcomers_source_channels_order_idx" ON "newcomers_source_channels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "newcomers_source_channels_parent_idx" ON "newcomers_source_channels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "newcomers_church_roles_order_idx" ON "newcomers_church_roles" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "newcomers_church_roles_parent_idx" ON "newcomers_church_roles" USING btree ("parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "newcomers_source_channels" CASCADE;
    DROP TABLE IF EXISTS "newcomers_church_roles" CASCADE;

    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "gender";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "birth_date";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "age";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "address";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "school_or_work";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "faith_experience";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "previous_church";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "mbti";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "baptism_status";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "group_chat_consent";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "conduct_consent";
    ALTER TABLE "newcomers" DROP COLUMN IF EXISTS "faith_community_consent";

    DROP TYPE IF EXISTS "public"."enum_newcomers_gender";
    DROP TYPE IF EXISTS "public"."enum_newcomers_source_channels";
    DROP TYPE IF EXISTS "public"."enum_newcomers_faith_experience";
    DROP TYPE IF EXISTS "public"."enum_newcomers_baptism_status";
    DROP TYPE IF EXISTS "public"."enum_newcomers_church_roles";
  `)
}
