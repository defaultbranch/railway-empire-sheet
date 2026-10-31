import { slugify } from '../slug';
import type { RuralBusiness } from '../game-state/types';

export function ruralBusinessSlug(business: Pick<RuralBusiness, 'name'>): string {
  return slugify(business.name);
}

export function pathForRuralBusiness(business: Pick<RuralBusiness, 'name'>): string {
  return `/rural-businesses/${ruralBusinessSlug(business)}`;
}

export function adjacentRuralBusinesses(
  businesses: Pick<RuralBusiness, 'name'>[],
  current: Pick<RuralBusiness, 'name'>,
) {
  const sortedBusinesses = [...businesses].sort((left, right) => left.name.localeCompare(right.name));
  const index = sortedBusinesses.findIndex((business) => business.name === current.name);
  if (index < 0) return undefined;
  return {
    previous: sortedBusinesses[(index + sortedBusinesses.length - 1) % sortedBusinesses.length],
    next: sortedBusinesses[(index + 1) % sortedBusinesses.length],
  };
}
