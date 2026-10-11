import { slugify } from '../slug';
import type { RuralBusinessType } from '../game-state/types';

export function ruralBusinessTypeSlug(type: Pick<RuralBusinessType, 'name'>): string {
  return slugify(type.name);
}

export function pathForRuralBusinessType(type: Pick<RuralBusinessType, 'name'>): string {
  return `/rural-business-types/${ruralBusinessTypeSlug(type)}`;
}