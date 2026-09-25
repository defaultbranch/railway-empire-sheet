import type { TrainStation } from './game-state/types';
import type { DefaultCityName } from './default-cities';
import type { DefaultRuralBusinessName } from './default-rural-businesses';

type DefaultTrainStation = Omit<TrainStation, 'host'> & {
  host:
    | { kind: 'city'; city: DefaultCityName }
    | {
        kind: 'ruralBusinesses';
        ruralBusinesses: [DefaultRuralBusinessName] | [DefaultRuralBusinessName, DefaultRuralBusinessName];
      };
};

export const defaultTrainStations: readonly DefaultTrainStation[] = [
  // City stations (alphabetical)
  { name: 'Baker City', tracks: 2, host: { kind: 'city', city: 'Baker City' } },
  { name: 'Billings', tracks: 4, host: { kind: 'city', city: 'Billings' } },
  { name: 'Casper', tracks: 2, host: { kind: 'city', city: 'Casper' } },
  { name: 'Gardiner', tracks: 4, host: { kind: 'city', city: 'Gardiner' } },
  { name: 'Great Falls', tracks: 2, host: { kind: 'city', city: 'Great Falls' } },
  { name: 'Idaho Falls', tracks: 4, host: { kind: 'city', city: 'Idaho Falls' } },
  { name: 'Miles City', tracks: 2, host: { kind: 'city', city: 'Miles City' } },
  { name: 'Missoula', tracks: 2, host: { kind: 'city', city: 'Missoula' } },
  { name: 'Nampa', tracks: 2, host: { kind: 'city', city: 'Nampa' } },
  { name: 'Rock Springs', tracks: 2, host: { kind: 'city', city: 'Rock Springs' } },
  { name: 'Spokane', tracks: 2, host: { kind: 'city', city: 'Spokane' } },

  // Rural business stops (alphabetical)
  { name: 'Green Forest', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Green Forest aisles'] } },
  { name: 'Harris Breeding', tracks: 1, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Harris Breeding'] } },
  { name: 'Hill Farm', tracks: 1, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Hill Farm'] } },
  { name: 'Lee Cattle', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Lee Cattle'] } },
  { name: 'Martin Farm', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Martin Farm'] } },
  { name: 'Moore Ranch', tracks: 1, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Moore Ranch'] } },
  { name: 'Roberts Manor', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Roberts Manor'] } },
  { name: 'Robinson Manor', tracks: 1, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Robinson Manor'] } },
  { name: 'Stevens Estate', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Stevens Estate'] } },
  { name: 'Steward Preserve', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Steward Preserve'] } },
  { name: 'Walker Fattening', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Walker Fattening'] } },
  { name: 'Young Logging', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Young Logging'] } },
] as const;
