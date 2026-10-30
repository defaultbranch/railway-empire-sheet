import { slugify } from '../slug';
import type { Warehouse } from '../game-state/types';

export function warehouseSlug(warehouse: Pick<Warehouse, 'name'>): string {
  return slugify(warehouse.name);
}

export function pathForWarehouse(warehouse: Pick<Warehouse, 'name'>): string {
  return `/warehouses/${warehouseSlug(warehouse)}`;
}
