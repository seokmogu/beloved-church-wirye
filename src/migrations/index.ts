import * as migration_20260322_233115_initial from './20260322_233115_initial'
import * as migration_20260401_014900_add_newcomers from './20260401_014900_add_newcomers'

export const migrations = [
  {
    up: migration_20260322_233115_initial.up,
    down: migration_20260322_233115_initial.down,
    name: '20260322_233115_initial',
  },
  {
    up: migration_20260401_014900_add_newcomers.up,
    down: migration_20260401_014900_add_newcomers.down,
    name: '20260401_014900_add_newcomers',
  },
]
