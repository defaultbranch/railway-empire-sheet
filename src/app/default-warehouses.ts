import type { Warehouse } from './game-state/types';
import type { DefaultCityName } from './default-cities';
import type { DefaultRuralBusinessName } from './default-rural-businesses';
import type { DefaultGood } from './default-goods';

type DefaultWarehouse = Omit<Warehouse, 'host' | 'goods'> & {
  host:
    | { kind: 'city'; city: DefaultCityName }
    | {
        kind: 'ruralBusinesses';
        ruralBusinesses: [DefaultRuralBusinessName] | [DefaultRuralBusinessName, DefaultRuralBusinessName];
      };
  goods: DefaultGood[];
};

export const defaultWarehouses: readonly DefaultWarehouse[] = [
  // City warehouses (alphabetical)
  {
    name: 'Billings WH B',
    tracks: 4,
    host: { kind: 'city', city: 'Billings' },
    goods: ['Cattle']
  },

  // Rural business warehouses (alphabetical)
  {
    name: 'Clark Preserve WH',
    tracks: 2,
    host: { kind: 'ruralBusinesses', ruralBusinesses: ['Clark Preserve'] },
    goods: ['Vegetables', 'Cotton'],
  },
  {
    name: 'Collins Farm',
    tracks: 4,
    host: { kind: 'ruralBusinesses', ruralBusinesses: ['Collins Farm', 'Wilson Farm'] },
    goods: ['Grain', 'Vegetables'],
  },
  {
    name: 'Kelly Farm',
    tracks: 2,
    host: { kind: 'ruralBusinesses', ruralBusinesses: ['Kelly Farm', 'Allen Preserve'] },
    goods: ['Corn', 'Sugar'],
  },
  {
    name: 'Reed Breading',
    tracks: 2,
    host: { kind: 'ruralBusinesses', ruralBusinesses: ['Reed Breading'] },
    goods: ['Cattle'],
  },
] as const;
