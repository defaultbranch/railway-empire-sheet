import { slugify } from '../slug';
import type { Industry } from '../game-state/types';

export function industrySlug(industry: Pick<Industry, 'city' | 'citySlot'>): string {
  return `${slugify(industry.city)}-${industry.citySlot}`;
}

export function pathForIndustry(industry: Pick<Industry, 'city' | 'citySlot'>): string {
  return `/industries/${industrySlug(industry)}`;
}
