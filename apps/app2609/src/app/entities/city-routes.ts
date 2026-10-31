import { slugify } from '../slug';
import type { City } from '../game-state/types';

export function citySlug(city: Pick<City, 'name'>): string {
  return slugify(city.name);
}

export function pathForCity(city: Pick<City, 'name'>): string {
  return `/cities/${citySlug(city)}`;
}

export function adjacentCities(cities: Pick<City, 'name'>[], current: Pick<City, 'name'>) {
  const sortedCities = [...cities].sort((left, right) => left.name.localeCompare(right.name));
  const index = sortedCities.findIndex((city) => city.name === current.name);
  if (index < 0) return undefined;
  return {
    previous: sortedCities[(index + sortedCities.length - 1) % sortedCities.length],
    next: sortedCities[(index + 1) % sortedCities.length],
  };
}
