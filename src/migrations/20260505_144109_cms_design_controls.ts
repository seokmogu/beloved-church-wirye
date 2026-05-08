import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "design_primary_color" varchar DEFAULT '#123125';
  ALTER TABLE "site_settings" ADD COLUMN "design_primary_light_color" varchar DEFAULT '#1c4938';
  ALTER TABLE "site_settings" ADD COLUMN "design_secondary_color" varchar DEFAULT '#f3ead6';
  ALTER TABLE "site_settings" ADD COLUMN "design_background_color" varchar DEFAULT '#f7f8f6';
  ALTER TABLE "site_settings" ADD COLUMN "design_section_background_color" varchar DEFAULT '#f7f8f6';
  ALTER TABLE "site_settings" ADD COLUMN "design_dark_section_background_color" varchar DEFAULT '#143c2e';
  ALTER TABLE "site_settings" ADD COLUMN "design_card_background_color" varchar DEFAULT '#ffffff';
  ALTER TABLE "site_settings" ADD COLUMN "design_text_color" varchar DEFAULT '#171a17';
  ALTER TABLE "site_settings" ADD COLUMN "design_muted_text_color" varchar DEFAULT '#5d675f';
  ALTER TABLE "site_settings" ADD COLUMN "design_border_color" varchar DEFAULT '#d9ded6';
  ALTER TABLE "site_settings" ADD COLUMN "design_header_background_color" varchar DEFAULT '#123125';
  ALTER TABLE "site_settings" ADD COLUMN "design_footer_background_color" varchar DEFAULT '#143c2e';
  ALTER TABLE "site_settings" ADD COLUMN "design_hero_overlay_color" varchar DEFAULT '#0a1c15';
  ALTER TABLE "site_settings" ADD COLUMN "design_hero_overlay_opacity" numeric DEFAULT 82;
  ALTER TABLE "site_settings" ADD COLUMN "design_show_hero_pattern" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "design_page_background_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "design_dark_section_background_image_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_design_page_background_image_id_media_id_fk" FOREIGN KEY ("design_page_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_design_dark_section_background_image_id_media_id_fk" FOREIGN KEY ("design_dark_section_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_design_design_page_background_image_idx" ON "site_settings" USING btree ("design_page_background_image_id");
  CREATE INDEX "site_settings_design_design_dark_section_background_imag_idx" ON "site_settings" USING btree ("design_dark_section_background_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_design_page_background_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_design_dark_section_background_image_id_media_id_fk";
  
  DROP INDEX "site_settings_design_design_page_background_image_idx";
  DROP INDEX "site_settings_design_design_dark_section_background_imag_idx";
  ALTER TABLE "site_settings" DROP COLUMN "design_primary_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_primary_light_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_secondary_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_background_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_section_background_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_dark_section_background_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_card_background_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_text_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_muted_text_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_border_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_header_background_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_footer_background_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_hero_overlay_color";
  ALTER TABLE "site_settings" DROP COLUMN "design_hero_overlay_opacity";
  ALTER TABLE "site_settings" DROP COLUMN "design_show_hero_pattern";
  ALTER TABLE "site_settings" DROP COLUMN "design_page_background_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "design_dark_section_background_image_id";`)
}
