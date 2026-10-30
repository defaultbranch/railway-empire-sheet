import { slugify } from '../slug';
import type { Good } from '../game-state/types';

export function goodSlug(good: Good): string {
  return slugify(good);
}

export function pathForGood(good: Good): string {
  return `/goods/${goodSlug(good)}`;
}

export function adjacentGoods(goods: Good[], current: Good) {
  const index = goods.indexOf(current);
  if (index < 0) return undefined;
  return {
    previous: goods[(index + goods.length - 1) % goods.length],
    next: goods[(index + 1) % goods.length],
  };
}
