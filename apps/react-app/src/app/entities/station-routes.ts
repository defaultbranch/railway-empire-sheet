import { slugify } from '../slug';
import type { TrainStation } from '../game-state/types';

export function stationSlug(station: Pick<TrainStation, 'name'>): string {
  return slugify(station.name);
}

export function pathForStation(station: Pick<TrainStation, 'name'>): string {
  return `/stations/${stationSlug(station)}`;
}
