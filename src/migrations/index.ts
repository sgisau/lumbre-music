import * as migration_20261111_211739_inicial from './20261111_211739_inicial';

export const migrations = [
  {
    up: migration_20261111_211739_inicial.up,
    down: migration_20261111_211739_inicial.down,
    name: '20261111_211739_inicial'
  },
];
