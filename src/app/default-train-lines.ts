import type { TrainLine } from './game-state/types';
import type { DefaultTrainStationName } from './default-train-stations';
import type { DefaultWarehouseName } from './default-warehouses';

type DefaultStopRef =
  | { kind: 'station'; name: DefaultTrainStationName }
  | { kind: 'warehouse'; name: DefaultWarehouseName };

type DefaultTrainLine = Omit<TrainLine, 'stops'> & { stops: DefaultStopRef[] };

export const defaultTrainLines: readonly DefaultTrainLine[] = [
  {
    name: 'Collins Farm - Baker City WH',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'warehouse', name: 'Baker City WH' },
    ],
    trains: 1,
    cargo: 'anything',
  },
  {
    name: 'Collins Farm - Idaho Falls',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'station', name: 'Idaho Falls' },
    ],
    trains: 1,
    tourDays: 87,
    cargo: 'anything',
  },
  {
    name: 'Collins Farm - Missoula WH',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'warehouse', name: 'Missoula WH' },
    ],
    trains: 4,
    tourDays: Math.round((35 + 34 + 40 + 35) / 4),
    cargo: 'anything',
  },
  {
    name: 'Collins Farm - Nampa',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'station', name: 'Nampa' },
    ],
    trains: 1,
    tourDays: 92,
    cargo: 'anything',
  },
  {
    name: 'Collins Farm - Spokane WH',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'warehouse', name: 'Spokane WH' },
    ],
    trains: 1,
    tourDays: 22,
    cargo: 'anything',
  },
  {
    name: 'Collins Farm - Young Logging',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'station', name: 'Young Logging' },
    ],
    trains: 3,
    tourDays: Math.round((39 + 40 + 36) / 3),
    cargo: 'anything',
  },
  {
    name: 'Young Logging - Baker City WH',
    stops: [
      { kind: 'station', name: 'Young Logging' },
      { kind: 'warehouse', name: 'Baker City WH' },
    ],
    trains: 2,
    tourDays: Math.round((41 + 39) / 2),
    cargo: 'anything',
  },
  {
    name: 'Baker City WH - Nampa WH',
    stops: [
      { kind: 'warehouse', name: 'Baker City WH' },
      { kind: 'warehouse', name: 'Nampa WH' },
    ],
    trains: 2,
    tourDays: Math.round((31 + 33) / 2),
    cargo: 'anything',
  },
  {
    name: 'Missoula WH - Great Falls WH',
    stops: [
      { kind: 'warehouse', name: 'Missoula WH' },
      { kind: 'warehouse', name: 'Great Falls WH' },
    ],
    trains: 3,
    tourDays: Math.round((65 + 66 + 68) / 3),
    cargo: 'anything',
  },
  {
    name: 'Missoula WH - Walker WH',
    stops: [
      { kind: 'warehouse', name: 'Missoula WH' },
      { kind: 'warehouse', name: 'Walker WH' },
    ],
    trains: 2,
    tourDays: Math.round((62 + 64) / 2),
    cargo: 'anything',
  },
  {
    name: 'Baker City - Idaho Falls',
    stops: [
      { kind: 'station', name: 'Baker City' },
      { kind: 'station', name: 'Idaho Falls' },
    ],
    trains: 1,
    cargo: 'anything',
  },
  {
    name: 'Baker City - Walker WH',
    stops: [
      { kind: 'station', name: 'Baker City' },
      { kind: 'warehouse', name: 'Walker WH' },
    ],
    trains: 2,
    cargo: 'anything',
  },
  {
    name: 'Baker City - Missoula',
    stops: [
      { kind: 'station', name: 'Baker City' },
      { kind: 'station', name: 'Missoula' },
    ],
    trains: 1,
    cargo: 'mail and passengers',
  },
  {
    name: 'Baker City - Nampa',
    stops: [
      { kind: 'station', name: 'Baker City' },
      { kind: 'station', name: 'Nampa' },
    ],
    trains: 1,
    cargo: 'mail and passengers',
  },
  {
    name: 'Baker City - Spokane',
    stops: [
      { kind: 'station', name: 'Baker City' },
      { kind: 'station', name: 'Spokane' },
    ],
    trains: 1,
    cargo: 'mail and passengers',
  },
  {
    name: 'Baker City - Wright Farm',
    stops: [
      { kind: 'station', name: 'Baker City' },
      { kind: 'station', name: 'Wright Farm' },
    ],
    trains: 1,
    cargo: 'anything',
  },
  {
    name: 'Miles City WH - Billings',
    stops: [
      { kind: 'warehouse', name: 'Miles City WH' },
      { kind: 'station', name: 'Billings' },
    ],
    trains: 1,
    tourDays: 40,
    cargo: 'anything',
  },
  {
    name: 'Miles City WH - Billings WH A',
    stops: [
      { kind: 'warehouse', name: 'Miles City WH' },
      { kind: 'warehouse', name: 'Billings WH A' },
    ],
    trains: 2,
    tourDays: 42,
    cargo: 'anything',
  },
  {
    name: 'Miles City WH - Casper WH',
    stops: [
      { kind: 'warehouse', name: 'Miles City WH' },
      { kind: 'warehouse', name: 'Casper WH' },
    ],
    trains: 3,
    tourDays: Math.round((65 + 41 + 35) / 3),
    cargo: 'anything',
  },
  {
    name: 'Miles City WH - Steward Preserve',
    stops: [
      { kind: 'warehouse', name: 'Miles City WH' },
      { kind: 'station', name: 'Steward Preserve' },
    ],
    trains: 3,
    tourDays: Math.round((21 + 22 + 24) / 3),
    cargo: 'anything',
  },
  {
    name: 'Lee Cattle - Billings WH B',
    stops: [
      { kind: 'station', name: 'Lee Cattle' },
      { kind: 'warehouse', name: 'Billings WH B' },
    ],
    trains: 6,
    tourDays: Math.round((34 + 31 + 40 + 31 + 41 + 41) / 6),
    cargo: 'anything',
  },
  {
    name: 'Robinson Manor - Billings WH A',
    stops: [
      { kind: 'station', name: 'Robinson Manor' },
      { kind: 'warehouse', name: 'Billings WH A' },
    ],
    trains: 1,
    tourDays: 55,
    cargo: 'anything',
  },
  {
    name: 'Robinson Manor - Gardiner WH',
    stops: [
      { kind: 'station', name: 'Robinson Manor' },
      { kind: 'warehouse', name: 'Gardiner WH' },
    ],
    trains: 1,
    tourDays: 70,
    cargo: 'anything',
  },
  {
    name: 'Robinson Manor - Casper WH',
    stops: [
      { kind: 'station', name: 'Robinson Manor' },
      { kind: 'warehouse', name: 'Casper WH' },
    ],
    trains: 1,
    tourDays: 38,
    cargo: 'anything',
  },
] as const;
