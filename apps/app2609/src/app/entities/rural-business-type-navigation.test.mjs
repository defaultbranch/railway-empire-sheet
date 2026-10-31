import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let adjacentRuralBusinessTypes;
let pathForRuralBusinessType;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ adjacentRuralBusinessTypes, pathForRuralBusinessType } = await server.ssrLoadModule(
    '/src/app/entities/rural-business-type-routes.ts',
  ));
});
after(async () => { await server?.close(); });

test('rural business types navigate alphabetically and wrap without mutating the list', () => {
  const types = [{ name: 'Wheat Farm' }, { name: 'Cattle Ranch' }, { name: 'Grain Farm' }];
  assert.deepEqual(adjacentRuralBusinessTypes(types, { name: 'Grain Farm' }), {
    previous: { name: 'Cattle Ranch' },
    next: { name: 'Wheat Farm' },
  });
  assert.deepEqual(adjacentRuralBusinessTypes(types, { name: 'Cattle Ranch' }), {
    previous: { name: 'Wheat Farm' },
    next: { name: 'Grain Farm' },
  });
  assert.deepEqual(types, [{ name: 'Wheat Farm' }, { name: 'Cattle Ranch' }, { name: 'Grain Farm' }]);
});

test('empty, missing, and single-type lists are safe and routes use type slugs', () => {
  assert.equal(adjacentRuralBusinessTypes([], { name: 'Grain Farm' }), undefined);
  assert.equal(adjacentRuralBusinessTypes([{ name: 'Cattle Ranch' }], { name: 'Grain Farm' }), undefined);
  assert.deepEqual(adjacentRuralBusinessTypes([{ name: 'Grain Farm' }], { name: 'Grain Farm' }), {
    previous: { name: 'Grain Farm' },
    next: { name: 'Grain Farm' },
  });
  const adjacent = adjacentRuralBusinessTypes([{ name: 'Cattle Ranch' }, { name: 'Grain Farm' }], { name: 'Cattle Ranch' });
  assert.equal(pathForRuralBusinessType(adjacent.next), '/rural-business-types/grain-farm');
  assert.equal(pathForRuralBusinessType(adjacent.previous), '/rural-business-types/grain-farm');
});
