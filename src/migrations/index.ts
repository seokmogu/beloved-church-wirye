import * as migration_20260322_233115_initial from './20260322_233115_initial'
import * as migration_20260330_000001_add_pages_blocks from './20260330_000001_add_pages_blocks'

export const migrations = [
  {
    up: migration_20260322_233115_initial.up,
    down: migration_20260322_233115_initial.down,
    name: '20260322_233115_initial',
  },
  {
    up: migration_20260330_000001_add_pages_blocks.up,
    down: migration_20260330_000001_add_pages_blocks.down,
    name: '20260330_000001_add_pages_blocks',
  },
]
