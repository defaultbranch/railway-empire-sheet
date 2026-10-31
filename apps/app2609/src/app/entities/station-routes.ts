import { slugify } from '../slug';
import type { TrainStation } from '../game-state/types';

export function stationSlug(station: Pick<TrainStation, 'name'>): string {
  return slugify(station.name);
}

export function pathForStation(station: Pick<TrainStation, 'name'>): string {
  return `/stations/${stationSlug(station)}`;
}

export function adjacentStations(
  stations: Pick<TrainStation, 'name'>[],
  current: Pick<TrainStation, 'name'>,
) {
  const sortedStations = [...stations].sort((left, right) => left.name.localeCompare(right.name));
  const index = sortedStations.findIndex((station) => station.name === current.name);
  if (index < 0) return undefined;
  return {
    previous: sortedStations[(index + sortedStations.length - 1) % sortedStations.length],
    next: sortedStations[(index + 1) % sortedStations.length],
  };
}
