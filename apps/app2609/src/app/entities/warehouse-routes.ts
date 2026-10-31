import { slugify } from '../slug';
import type { Warehouse } from '../game-state/types';

export function warehouseSlug(warehouse: Pick<Warehouse, 'name'>): string {
  return slugify(warehouse.name);
}

export function pathForWarehouse(warehouse: Pick<Warehouse, 'name'>): string {
  return `/warehouses/${warehouseSlug(warehouse)}`;
}

export function adjacentWarehouses(
  warehouses: Pick<Warehouse, 'name'>[],
  current: Pick<Warehouse, 'name'>,
) {
  const sortedWarehouses = [...warehouses].sort((left, right) => left.name.localeCompare(right.name));
  const index = sortedWarehouses.findIndex((warehouse) => warehouse.name === current.name);
  if (index < 0) return undefined;
  return {
    previous: sortedWarehouses[(index + sortedWarehouses.length - 1) % sortedWarehouses.length],
    next: sortedWarehouses[(index + 1) % sortedWarehouses.length],
  };
}
