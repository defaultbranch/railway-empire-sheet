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
  },
  {
    name: 'Collins Farm - Idaho Falls',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'station', name: 'Idaho Falls' },
    ],
    trains: 1,
    tourDays: 87,
  },
  {
    name: 'Collins Farm - Missoula WH',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'warehouse', name: 'Missoula WH' },
    ],
    trains: 4,
    tourDays: (35 + 34 + 40 + 35) / 4,
  },
  {
    name: 'Collins Farm - Nampa',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'station', name: 'Nampa' },
    ],
    trains: 1,
    tourDays: 92,
  },
  {
    name: 'Collins Farm - Spokane WH',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'warehouse', name: 'Spokane WH' },
    ],
    trains: 1,
    tourDays: 22,
  },
  {
    name: 'Collins Farm - Young Logging',
    stops: [
      { kind: 'warehouse', name: 'Collins Farm' },
      { kind: 'station', name: 'Young Logging' },
    ],
    trains: 3,
    tourDays: (39 + 40 + 36) / 3,
  },
] as const;
