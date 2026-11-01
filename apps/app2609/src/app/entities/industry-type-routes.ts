import { slugify } from '../slug';
import type { IndustryType } from '../game-state/types';

export function industryTypeSlug(type: Pick<IndustryType, 'name'>): string {
  return slugify(type.name);
}

export function pathForIndustryType(type: Pick<IndustryType, 'name'>): string {
  return `/industry-types/${industryTypeSlug(type)}`;
}
