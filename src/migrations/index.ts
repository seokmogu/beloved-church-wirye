import * as migration_20260410_130740_initial from './20260410_130740_initial'
import * as migration_20260503_143752_cms_control_globals from './20260503_143752_cms_control_globals'
import * as migration_20260505_144109_cms_design_controls from './20260505_144109_cms_design_controls'
import * as migration_20260506_141200_internal_link_type from './20260506_141200_internal_link_type'
import * as migration_20260507_064900_header_logo_controls from './20260507_064900_header_logo_controls'

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
]
