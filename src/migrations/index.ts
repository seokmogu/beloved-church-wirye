import * as migration_20260322_233115_initial from './20260322_233115_initial'
import * as migration_20260330_000000_add_header_nav_subitems from './20260330_000000_add_header_nav_subitems'

export const migrations = [
  {
    up: migration_20260322_233115_initial.up,
    down: migration_20260322_233115_initial.down,
    name: '20260322_233115_initial',
  },
  {
    up: migration_20260330_000000_add_header_nav_subitems.up,
    down: migration_20260330_000000_add_header_nav_subitems.down,
    name: '20260330_000000_add_header_nav_subitems',
  },
]
