import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let adjacentWarehouses;
let pathForWarehouse;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ adjacentWarehouses, pathForWarehouse } = await server.ssrLoadModule(
    '/src/app/entities/warehouse-routes.ts',
  ));
});
after(async () => { await server?.close(); });

test('warehouses navigate alphabetically and wrap without mutating the list', () => {
  const warehouses = [{ name: 'Howard Breeding' }, { name: 'Benton Yard' }, { name: 'Cedar Depot' }];
  assert.deepEqual(adjacentWarehouses(warehouses, { name: 'Howard Breeding' }), {
    previous: { name: 'Cedar Depot' },
    next: { name: 'Benton Yard' },
  });
  assert.deepEqual(adjacentWarehouses(warehouses, { name: 'Benton Yard' }), {
    previous: { name: 'Howard Breeding' },
    next: { name: 'Cedar Depot' },
  });
  assert.deepEqual(warehouses, [{ name: 'Howard Breeding' }, { name: 'Benton Yard' }, { name: 'Cedar Depot' }]);
});

test('empty, missing, and single-warehouse lists are safe and routes use warehouse slugs', () => {
  assert.equal(adjacentWarehouses([], { name: 'Howard Breeding' }), undefined);
  assert.equal(adjacentWarehouses([{ name: 'Benton Yard' }], { name: 'Howard Breeding' }), undefined);
  assert.deepEqual(adjacentWarehouses([{ name: 'Howard Breeding' }], { name: 'Howard Breeding' }), {
    previous: { name: 'Howard Breeding' },
    next: { name: 'Howard Breeding' },
  });
  const adjacent = adjacentWarehouses([{ name: 'Benton Yard' }, { name: 'Howard Breeding' }], { name: 'Benton Yard' });
  assert.equal(pathForWarehouse(adjacent.next), '/warehouses/howard-breeding');
  assert.equal(pathForWarehouse(adjacent.previous), '/warehouses/howard-breeding');
});
