import { slugify } from '../slug';
import type { RuralBusiness } from '../game-state/types';

export function ruralBusinessSlug(business: Pick<RuralBusiness, 'name'>): string {
  return slugify(business.name);
}

export function pathForRuralBusiness(business: Pick<RuralBusiness, 'name'>): string {
  return `/rural-businesses/${ruralBusinessSlug(business)}`;
}
