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

  // Rural business stops
  { name: 'Lee Cattle', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Lee Cattle'] } },
] as const;
