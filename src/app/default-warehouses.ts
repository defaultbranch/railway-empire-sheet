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
    name: 'Baker City WH',
    tracks: 4,
    host: { kind: 'city', city: 'Baker City' },
    goods: ['Grain', 'Wood', 'Corn', 'Meat', 'Beer'],
  },
  {
    name: 'Billings WH B',
    tracks: 4,
    host: { kind: 'city', city: 'Billings' },
    goods: ['Cattle']
  },
  {
    name: 'Missoula WH',
    tracks: 4,
    host: { kind: 'city', city: 'Missoula' },
    goods: ['Grain', 'Corn', 'Wood', 'Meat', 'Beer', 'Sugar'],
  },
  {
    name: 'Spokane WH',
    tracks: 4,
    host: { kind: 'city', city: 'Spokane' },
    goods: ['Grain', 'Beer', 'Meat', 'Corn', 'Wood'],
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

export type DefaultWarehouseName = (typeof defaultWarehouses)[number]['name'];
