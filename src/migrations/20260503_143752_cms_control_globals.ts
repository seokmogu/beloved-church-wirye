import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_home_sections_section_type" AS ENUM('intro', 'announcements', 'sermons', 'instagram', 'map');
  CREATE TYPE "public"."enum_site_settings_instagram_posts_type" AS ENUM('p', 'reel');
  CREATE TABLE "pages_blocks_announcements_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 10,
  	"show_pinned_first" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bulletins_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT '주보',
  	"description" varchar DEFAULT '사랑하는교회 주보 아카이브',
  	"limit" numeric DEFAULT 20,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_announcements_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 10,
  	"show_pinned_first" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bulletins_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT '주보',
  	"description" varchar DEFAULT '사랑하는교회 주보 아카이브',
  	"limit" numeric DEFAULT 20,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "site_settings_home_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"section_type" "enum_site_settings_home_sections_section_type" NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "site_settings_worship_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"time" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "site_settings_worship_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "site_settings_core_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_visitor_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_instagram_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_site_settings_instagram_posts_type" DEFAULT 'p' NOT NULL,
  	"post_id" varchar NOT NULL
  );
  
  ALTER TABLE "footer" ALTER COLUMN "worship_schedule" SET DEFAULT '청·장년예배 주일 낮 12시
  어린이예배 주일 낮 12시
  금요기도회 금요일 밤 8시';
  ALTER TABLE "footer" ADD COLUMN "legal_text" varchar DEFAULT 'All rights reserved.';
  ALTER TABLE "footer" ADD COLUMN "show_theme_selector" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "church_name" varchar DEFAULT '사랑하는교회' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "english_name" varchar DEFAULT 'Beloved Church Wirye';
  ALTER TABLE "site_settings" ADD COLUMN "tagline" varchar DEFAULT '우리는 사랑으로 교회를 세웁니다';
  ALTER TABLE "site_settings" ADD COLUMN "sub_tagline" varchar DEFAULT '더불어 우리의 삶 속에 하나님 나라를 세웁니다';
  ALTER TABLE "site_settings" ADD COLUMN "logo_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "hero_eyebrow" varchar DEFAULT 'Beloved Church Wirye';
  ALTER TABLE "site_settings" ADD COLUMN "hero_primary_label" varchar DEFAULT '예배 안내';
  ALTER TABLE "site_settings" ADD COLUMN "hero_primary_url" varchar DEFAULT '/worship';
  ALTER TABLE "site_settings" ADD COLUMN "hero_secondary_label" varchar DEFAULT '최신 설교 보기';
  ALTER TABLE "site_settings" ADD COLUMN "hero_secondary_url" varchar DEFAULT '/sermon';
  ALTER TABLE "site_settings" ADD COLUMN "parking_info" varchar DEFAULT '주변 공영주차장을 이용하실 수 있습니다.';
  ALTER TABLE "site_settings" ADD COLUMN "pastor_name" varchar DEFAULT '차원석 목사';
  ALTER TABLE "site_settings" ADD COLUMN "pastor_title" varchar DEFAULT '사랑하는교회 담임목사';
  ALTER TABLE "site_settings" ADD COLUMN "pastor_photo_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "pastor_bio" varchar DEFAULT '연세대학교 일반대학원 박사과정(Ph.D) 재학
  감리교신학대학교 및 대학원(Th.M) 졸업
  前 만나교회 부목사';
  ALTER TABLE "site_settings" ADD COLUMN "pastor_quote" varchar DEFAULT '우리는 사랑으로 교회를 세웁니다.';
  ALTER TABLE "site_settings" ADD COLUMN "youtube_channel_url" varchar DEFAULT 'https://www.youtube.com/@BelovedChurchWirye';
  ALTER TABLE "site_settings" ADD COLUMN "youtube_channel_id" varchar DEFAULT 'UCEyfzJVbYFdI9An9e0FTojw';
  ALTER TABLE "site_settings" ADD COLUMN "youtube_video_count" numeric DEFAULT 4;
  ALTER TABLE "site_settings" ADD COLUMN "instagram_url" varchar DEFAULT 'https://www.instagram.com/beloved_ch_/';
  ALTER TABLE "site_settings" ADD COLUMN "instagram_handle" varchar DEFAULT '@beloved_ch_';
  ALTER TABLE "pages_blocks_announcements_block" ADD CONSTRAINT "pages_blocks_announcements_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bulletins_block" ADD CONSTRAINT "pages_blocks_bulletins_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_announcements_block" ADD CONSTRAINT "_pages_v_blocks_announcements_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bulletins_block" ADD CONSTRAINT "_pages_v_blocks_bulletins_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_home_sections" ADD CONSTRAINT "site_settings_home_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_worship_services" ADD CONSTRAINT "site_settings_worship_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_worship_order" ADD CONSTRAINT "site_settings_worship_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_core_values" ADD CONSTRAINT "site_settings_core_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_visitor_notes" ADD CONSTRAINT "site_settings_visitor_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_instagram_posts" ADD CONSTRAINT "site_settings_instagram_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_announcements_block_order_idx" ON "pages_blocks_announcements_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_announcements_block_parent_id_idx" ON "pages_blocks_announcements_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_announcements_block_path_idx" ON "pages_blocks_announcements_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_bulletins_block_order_idx" ON "pages_blocks_bulletins_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_bulletins_block_parent_id_idx" ON "pages_blocks_bulletins_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bulletins_block_path_idx" ON "pages_blocks_bulletins_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_announcements_block_order_idx" ON "_pages_v_blocks_announcements_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_announcements_block_parent_id_idx" ON "_pages_v_blocks_announcements_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_announcements_block_path_idx" ON "_pages_v_blocks_announcements_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bulletins_block_order_idx" ON "_pages_v_blocks_bulletins_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bulletins_block_parent_id_idx" ON "_pages_v_blocks_bulletins_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bulletins_block_path_idx" ON "_pages_v_blocks_bulletins_block" USING btree ("_path");
  CREATE INDEX "site_settings_home_sections_order_idx" ON "site_settings_home_sections" USING btree ("_order");
  CREATE INDEX "site_settings_home_sections_parent_id_idx" ON "site_settings_home_sections" USING btree ("_parent_id");
  CREATE INDEX "site_settings_worship_services_order_idx" ON "site_settings_worship_services" USING btree ("_order");
  CREATE INDEX "site_settings_worship_services_parent_id_idx" ON "site_settings_worship_services" USING btree ("_parent_id");
  CREATE INDEX "site_settings_worship_order_order_idx" ON "site_settings_worship_order" USING btree ("_order");
  CREATE INDEX "site_settings_worship_order_parent_id_idx" ON "site_settings_worship_order" USING btree ("_parent_id");
  CREATE INDEX "site_settings_core_values_order_idx" ON "site_settings_core_values" USING btree ("_order");
  CREATE INDEX "site_settings_core_values_parent_id_idx" ON "site_settings_core_values" USING btree ("_parent_id");
  CREATE INDEX "site_settings_visitor_notes_order_idx" ON "site_settings_visitor_notes" USING btree ("_order");
  CREATE INDEX "site_settings_visitor_notes_parent_id_idx" ON "site_settings_visitor_notes" USING btree ("_parent_id");
  CREATE INDEX "site_settings_instagram_posts_order_idx" ON "site_settings_instagram_posts" USING btree ("_order");
  CREATE INDEX "site_settings_instagram_posts_parent_id_idx" ON "site_settings_instagram_posts" USING btree ("_parent_id");
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_pastor_photo_id_media_id_fk" FOREIGN KEY ("pastor_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_pastor_photo_idx" ON "site_settings" USING btree ("pastor_photo_id");
  ALTER TABLE "site_settings" DROP COLUMN "sunday_service_time";
  ALTER TABLE "site_settings" DROP COLUMN "friday_service_time";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_announcements_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bulletins_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_announcements_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bulletins_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_home_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_worship_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_worship_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_core_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_visitor_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_instagram_posts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_announcements_block" CASCADE;
  DROP TABLE "pages_blocks_bulletins_block" CASCADE;
  DROP TABLE "_pages_v_blocks_announcements_block" CASCADE;
  DROP TABLE "_pages_v_blocks_bulletins_block" CASCADE;
  DROP TABLE "site_settings_home_sections" CASCADE;
  DROP TABLE "site_settings_worship_services" CASCADE;
  DROP TABLE "site_settings_worship_order" CASCADE;
  DROP TABLE "site_settings_core_values" CASCADE;
  DROP TABLE "site_settings_visitor_notes" CASCADE;
  DROP TABLE "site_settings_instagram_posts" CASCADE;
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_logo_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_pastor_photo_id_media_id_fk";
  
  DROP INDEX "site_settings_logo_idx";
  DROP INDEX "site_settings_pastor_photo_idx";
  ALTER TABLE "footer" ALTER COLUMN "worship_schedule" SET DEFAULT '주일예배 12:00 | 저녁예배 20:00';
  ALTER TABLE "site_settings" ADD COLUMN "sunday_service_time" varchar DEFAULT '12:00';
  ALTER TABLE "site_settings" ADD COLUMN "friday_service_time" varchar DEFAULT '20:00';
  ALTER TABLE "footer" DROP COLUMN "legal_text";
  ALTER TABLE "footer" DROP COLUMN "show_theme_selector";
  ALTER TABLE "site_settings" DROP COLUMN "church_name";
  ALTER TABLE "site_settings" DROP COLUMN "english_name";
  ALTER TABLE "site_settings" DROP COLUMN "tagline";
  ALTER TABLE "site_settings" DROP COLUMN "sub_tagline";
  ALTER TABLE "site_settings" DROP COLUMN "logo_id";
  ALTER TABLE "site_settings" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "hero_primary_label";
  ALTER TABLE "site_settings" DROP COLUMN "hero_primary_url";
  ALTER TABLE "site_settings" DROP COLUMN "hero_secondary_label";
  ALTER TABLE "site_settings" DROP COLUMN "hero_secondary_url";
  ALTER TABLE "site_settings" DROP COLUMN "parking_info";
  ALTER TABLE "site_settings" DROP COLUMN "pastor_name";
  ALTER TABLE "site_settings" DROP COLUMN "pastor_title";
  ALTER TABLE "site_settings" DROP COLUMN "pastor_photo_id";
  ALTER TABLE "site_settings" DROP COLUMN "pastor_bio";
  ALTER TABLE "site_settings" DROP COLUMN "pastor_quote";
  ALTER TABLE "site_settings" DROP COLUMN "youtube_channel_url";
  ALTER TABLE "site_settings" DROP COLUMN "youtube_channel_id";
  ALTER TABLE "site_settings" DROP COLUMN "youtube_video_count";
  ALTER TABLE "site_settings" DROP COLUMN "instagram_url";
  ALTER TABLE "site_settings" DROP COLUMN "instagram_handle";
  DROP TYPE "public"."enum_site_settings_home_sections_section_type";
  DROP TYPE "public"."enum_site_settings_instagram_posts_type";`)
}
