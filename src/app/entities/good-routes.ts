import { slugify } from '../slug';
import type { Good } from '../game-state/types';

export function goodSlug(good: Good): string {
  return slugify(good);
}

export function pathForGood(good: Good): string {
  return `/goods/${goodSlug(good)}`;
}
