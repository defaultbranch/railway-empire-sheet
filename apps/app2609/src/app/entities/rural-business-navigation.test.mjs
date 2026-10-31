import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let adjacentRuralBusinesses;
let pathForRuralBusiness;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ adjacentRuralBusinesses, pathForRuralBusiness } = await server.ssrLoadModule(
    '/src/app/entities/rural-business-routes.ts',
  ));
});
after(async () => { await server?.close(); });

test('rural businesses navigate alphabetically and wrap without mutating the list', () => {
  const businesses = [{ name: 'Parker Farm' }, { name: 'Adams Farm' }, { name: 'Miller Farm' }];
  assert.deepEqual(adjacentRuralBusinesses(businesses, { name: 'Parker Farm' }), {
    previous: { name: 'Miller Farm' },
    next: { name: 'Adams Farm' },
  });
  assert.deepEqual(adjacentRuralBusinesses(businesses, { name: 'Adams Farm' }), {
    previous: { name: 'Parker Farm' },
    next: { name: 'Miller Farm' },
  });
  assert.deepEqual(businesses, [{ name: 'Parker Farm' }, { name: 'Adams Farm' }, { name: 'Miller Farm' }]);
});

test('empty, missing, and single-business lists are safe and routes use business slugs', () => {
  assert.equal(adjacentRuralBusinesses([], { name: 'Parker Farm' }), undefined);
  assert.equal(adjacentRuralBusinesses([{ name: 'Adams Farm' }], { name: 'Parker Farm' }), undefined);
  assert.deepEqual(adjacentRuralBusinesses([{ name: 'Parker Farm' }], { name: 'Parker Farm' }), {
    previous: { name: 'Parker Farm' },
    next: { name: 'Parker Farm' },
  });
  const adjacent = adjacentRuralBusinesses([{ name: 'Adams Farm' }, { name: 'Parker Farm' }], { name: 'Adams Farm' });
  assert.equal(pathForRuralBusiness(adjacent.next), '/rural-businesses/parker-farm');
  assert.equal(pathForRuralBusiness(adjacent.previous), '/rural-businesses/parker-farm');
});
