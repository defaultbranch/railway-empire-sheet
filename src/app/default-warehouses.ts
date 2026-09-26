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
    name: 'Gardiner WH',
    tracks: 4,
    host: { kind: 'city', city: 'Gardiner' },
    goods: ['Grain', 'Beer', 'Meat', 'Corn', 'Sugar', 'Wood'],
  },
  {
    name: 'Great Falls WH',
    tracks: 4,
    host: { kind: 'city', city: 'Great Falls' },
    goods: ['Corn', 'Sugar', 'Grain', 'Beer', 'Meat'],
  },
  {
    name: 'Missoula WH',
    tracks: 4,
    host: { kind: 'city', city: 'Missoula' },
    goods: ['Grain', 'Corn', 'Wood', 'Meat', 'Beer', 'Sugar'],
  },
  {
    name: 'Nampa WH',
    tracks: 4,
    host: { kind: 'city', city: 'Nampa' },
    goods: ['Cattle', 'Meat', 'Beer', 'Corn', 'Sugar', 'Wood'],
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
  {
    name: 'Walker WH',
    tracks: 4,
    host: { kind: 'ruralBusinesses', ruralBusinesses: ['Walker Fattening'] },
    goods: ['Cattle', 'Corn', 'Sugar', 'Beer', 'Cloth'],
  },
] as const;

export type DefaultWarehouseName = (typeof defaultWarehouses)[number]['name'];
