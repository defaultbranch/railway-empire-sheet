import { slugify } from '../slug';
import type { RuralBusinessType } from '../game-state/types';

export function ruralBusinessTypeSlug(type: Pick<RuralBusinessType, 'name'>): string {
  return slugify(type.name);
}

export function pathForRuralBusinessType(type: Pick<RuralBusinessType, 'name'>): string {
  return `/rural-business-types/${ruralBusinessTypeSlug(type)}`;
}

export function adjacentRuralBusinessTypes(
  types: Pick<RuralBusinessType, 'name'>[],
  current: Pick<RuralBusinessType, 'name'>,
) {
  const sortedTypes = [...types].sort((left, right) => left.name.localeCompare(right.name));
  const index = sortedTypes.findIndex((type) => type.name === current.name);
  if (index < 0) return undefined;
  return {
    previous: sortedTypes[(index + sortedTypes.length - 1) % sortedTypes.length],
    next: sortedTypes[(index + 1) % sortedTypes.length],
  };
}
