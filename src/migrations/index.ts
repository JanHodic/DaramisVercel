import * as migration_20260128_144959 from './20260128_144959';
import * as migration_20260128_151441 from './20260128_151441';

export const migrations = [
  {
    up: migration_20260128_144959.up,
    down: migration_20260128_144959.down,
    name: '20260128_144959',
  },
  {
    up: migration_20260128_151441.up,
    down: migration_20260128_151441.down,
    name: '20260128_151441'
  },
];
