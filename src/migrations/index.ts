import * as migration_20260322_233115_initial from './20260322_233115_initial'
import * as migration_20260401_014900_add_newcomers from './20260401_014900_add_newcomers'
import * as migration_20260401_191500_add_sermons from './20260401_191500_add_sermons'

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
  {
    up: migration_20260401_191500_add_sermons.up,
    down: migration_20260401_191500_add_sermons.down,
    name: '20260401_191500_add_sermons',
  },
]
