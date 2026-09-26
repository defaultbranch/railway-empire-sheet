import { slugify } from '../slug';
import type { City } from '../game-state/types';

export function citySlug(city: Pick<City, 'name'>): string {
  return slugify(city.name);
}

export function pathForCity(city: Pick<City, 'name'>): string {
  return `/cities/${citySlug(city)}`;
}
