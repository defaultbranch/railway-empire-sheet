import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let adjacentCities;
let pathForCity;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ adjacentCities, pathForCity } = await server.ssrLoadModule('/src/app/entities/city-routes.ts'));
});
after(async () => { await server?.close(); });

test('adjacent cities are alphabetical, wrap at both ends, and do not mutate the list', () => {
  const cities = [{ name: 'Zurich' }, { name: 'Chicago' }, { name: 'Boston' }];
  assert.deepEqual(adjacentCities(cities, { name: 'Chicago' }), {
    previous: { name: 'Boston' },
    next: { name: 'Zurich' },
  });
  assert.deepEqual(adjacentCities(cities, { name: 'Boston' }), {
    previous: { name: 'Zurich' },
    next: { name: 'Chicago' },
  });
  assert.deepEqual(cities, [{ name: 'Zurich' }, { name: 'Chicago' }, { name: 'Boston' }]);
});

test('empty, missing, and single-city lists are safe and routes use city slugs', () => {
  assert.equal(adjacentCities([], { name: 'Chicago' }), undefined);
  assert.equal(adjacentCities([{ name: 'Boston' }], { name: 'Chicago' }), undefined);
  assert.deepEqual(adjacentCities([{ name: 'Chicago' }], { name: 'Chicago' }), {
    previous: { name: 'Chicago' },
    next: { name: 'Chicago' },
  });
  const adjacent = adjacentCities([{ name: 'Boston' }, { name: 'Chicago' }], { name: 'Boston' });
  assert.equal(pathForCity(adjacent.next), '/cities/chicago');
  assert.equal(pathForCity(adjacent.previous), '/cities/chicago');
});
