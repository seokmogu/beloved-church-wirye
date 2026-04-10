import * as migration_20260410_130740_initial from './20260410_130740_initial';

export const migrations = [
  {
    up: migration_20260410_130740_initial.up,
    down: migration_20260410_130740_initial.down,
    name: '20260410_130740_initial'
  },
];
