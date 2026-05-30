import * as migration_20260410_130740_initial from './20260410_130740_initial'
import * as migration_20260503_143752_cms_control_globals from './20260503_143752_cms_control_globals'
import * as migration_20260505_144109_cms_design_controls from './20260505_144109_cms_design_controls'
import * as migration_20260506_141200_internal_link_type from './20260506_141200_internal_link_type'
import * as migration_20260507_064900_header_logo_controls from './20260507_064900_header_logo_controls'
import * as migration_20260525_002300_visual_editor_font_controls from './20260525_002300_visual_editor_font_controls'
import * as migration_20260525_233607_instagram_post_thumbnails from './20260525_233607_instagram_post_thumbnails'
import * as migration_20260526_231800_instagram_thumbnail_urls from './20260526_231800_instagram_thumbnail_urls'
import * as migration_20260527_000100_instagram_post_metadata from './20260527_000100_instagram_post_metadata'
import * as migration_20260530_165500_church_news from './20260530_165500_church_news'
import * as migration_20260531_010000_header_submenus from './20260531_010000_header_submenus'
import * as migration_20260531_020000_media_content_hash from './20260531_020000_media_content_hash'
import * as migration_20260531_030000_compact_korean_menu_labels from './20260531_030000_compact_korean_menu_labels'
import * as migration_20260531_040000_church_videos from './20260531_040000_church_videos'

export const migrations = [
  {
    up: migration_20260410_130740_initial.up,
    down: migration_20260410_130740_initial.down,
    name: '20260410_130740_initial',
  },
  {
    up: migration_20260503_143752_cms_control_globals.up,
    down: migration_20260503_143752_cms_control_globals.down,
    name: '20260503_143752_cms_control_globals',
  },
  {
    up: migration_20260505_144109_cms_design_controls.up,
    down: migration_20260505_144109_cms_design_controls.down,
    name: '20260505_144109_cms_design_controls',
  },
  {
    up: migration_20260506_141200_internal_link_type.up,
    down: migration_20260506_141200_internal_link_type.down,
    name: '20260506_141200_internal_link_type',
  },
  {
    up: migration_20260507_064900_header_logo_controls.up,
    down: migration_20260507_064900_header_logo_controls.down,
    name: '20260507_064900_header_logo_controls',
  },
  {
    up: migration_20260525_002300_visual_editor_font_controls.up,
    down: migration_20260525_002300_visual_editor_font_controls.down,
    name: '20260525_002300_visual_editor_font_controls',
  },
  {
    up: migration_20260525_233607_instagram_post_thumbnails.up,
    down: migration_20260525_233607_instagram_post_thumbnails.down,
    name: '20260525_233607_instagram_post_thumbnails',
  },
  {
    up: migration_20260526_231800_instagram_thumbnail_urls.up,
    down: migration_20260526_231800_instagram_thumbnail_urls.down,
    name: '20260526_231800_instagram_thumbnail_urls',
  },
  {
    up: migration_20260527_000100_instagram_post_metadata.up,
    down: migration_20260527_000100_instagram_post_metadata.down,
    name: '20260527_000100_instagram_post_metadata',
  },
  {
    up: migration_20260530_165500_church_news.up,
    down: migration_20260530_165500_church_news.down,
    name: '20260530_165500_church_news',
  },
  {
    up: migration_20260531_010000_header_submenus.up,
    down: migration_20260531_010000_header_submenus.down,
    name: '20260531_010000_header_submenus',
  },
  {
    up: migration_20260531_020000_media_content_hash.up,
    down: migration_20260531_020000_media_content_hash.down,
    name: '20260531_020000_media_content_hash',
  },
  {
    up: migration_20260531_030000_compact_korean_menu_labels.up,
    down: migration_20260531_030000_compact_korean_menu_labels.down,
    name: '20260531_030000_compact_korean_menu_labels',
  },
  {
    up: migration_20260531_040000_church_videos.up,
    down: migration_20260531_040000_church_videos.down,
    name: '20260531_040000_church_videos',
  },
]
