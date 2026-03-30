import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- BulletinsBlock table for pages
    CREATE TABLE IF NOT EXISTS "pages_blocks_bulletins_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "description" varchar,
      "limit" numeric,
      "block_name" varchar
    );

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'pages_blocks_bulletins_block_parent_id_fk'
      ) THEN
        ALTER TABLE "pages_blocks_bulletins_block"
          ADD CONSTRAINT "pages_blocks_bulletins_block_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "pages_blocks_bulletins_block_order_idx"
      ON "pages_blocks_bulletins_block" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_bulletins_block_parent_id_idx"
      ON "pages_blocks_bulletins_block" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_bulletins_block_path_idx"
      ON "pages_blocks_bulletins_block" USING btree ("_path");

    -- AnnouncementsBlock table for pages
    CREATE TABLE IF NOT EXISTS "pages_blocks_announcements_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "limit" numeric,
      "show_pinned_first" boolean,
      "block_name" varchar
    );

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'pages_blocks_announcements_block_parent_id_fk'
      ) THEN
        ALTER TABLE "pages_blocks_announcements_block"
          ADD CONSTRAINT "pages_blocks_announcements_block_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "pages_blocks_announcements_block_order_idx"
      ON "pages_blocks_announcements_block" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_announcements_block_parent_id_idx"
      ON "pages_blocks_announcements_block" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_announcements_block_path_idx"
      ON "pages_blocks_announcements_block" USING btree ("_path");

    -- header subItems table
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_header_nav_items_sub_items_link_type') THEN
        CREATE TYPE "public"."enum_header_nav_items_sub_items_link_type" AS ENUM('reference', 'custom');
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "header_nav_items_sub_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "link_type" "enum_header_nav_items_sub_items_link_type" DEFAULT 'reference',
      "link_new_tab" boolean,
      "link_url" varchar,
      "link_label" varchar NOT NULL
    );

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'header_nav_items_sub_items_parent_id_fk'
      ) THEN
        ALTER TABLE "header_nav_items_sub_items"
          ADD CONSTRAINT "header_nav_items_sub_items_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."header_nav_items"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "header_nav_items_sub_items_order_idx"
      ON "header_nav_items_sub_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "header_nav_items_sub_items_parent_id_idx"
      ON "header_nav_items_sub_items" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_bulletins_block";
    DROP TABLE IF EXISTS "pages_blocks_announcements_block";
    DROP TABLE IF EXISTS "header_nav_items_sub_items";
    DROP TYPE IF EXISTS "public"."enum_header_nav_items_sub_items_link_type";
  `)
}
