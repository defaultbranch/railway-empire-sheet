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
  { name: 'Billings', tracks: 4, host: { kind: 'city', city: 'Billings' } },
  { name: 'Lee Cattle', tracks: 2, host: { kind: 'ruralBusinesses', ruralBusinesses: ['Lee Cattle'] } },
] as const;
