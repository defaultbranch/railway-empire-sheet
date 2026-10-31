import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let adjacentStations;
let pathForStation;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ adjacentStations, pathForStation } = await server.ssrLoadModule(
    '/src/app/entities/station-routes.ts',
  ));
});
after(async () => { await server?.close(); });

test('stations navigate alphabetically and wrap without mutating the list', () => {
  const stations = [{ name: 'Chicago' }, { name: 'Benton Yard' }, { name: 'Howard Breeding' }];
  assert.deepEqual(adjacentStations(stations, { name: 'Chicago' }), {
    previous: { name: 'Benton Yard' },
    next: { name: 'Howard Breeding' },
  });
  assert.deepEqual(adjacentStations(stations, { name: 'Benton Yard' }), {
    previous: { name: 'Howard Breeding' },
    next: { name: 'Chicago' },
  });
  assert.deepEqual(stations, [{ name: 'Chicago' }, { name: 'Benton Yard' }, { name: 'Howard Breeding' }]);
});

test('empty, missing, and single-station lists are safe and routes use station slugs', () => {
  assert.equal(adjacentStations([], { name: 'Chicago' }), undefined);
  assert.equal(adjacentStations([{ name: 'Benton Yard' }], { name: 'Chicago' }), undefined);
  assert.deepEqual(adjacentStations([{ name: 'Chicago' }], { name: 'Chicago' }), {
    previous: { name: 'Chicago' },
    next: { name: 'Chicago' },
  });
  const adjacent = adjacentStations([{ name: 'Benton Yard' }, { name: 'Chicago' }], { name: 'Benton Yard' });
  assert.equal(pathForStation(adjacent.next), '/stations/chicago');
  assert.equal(pathForStation(adjacent.previous), '/stations/chicago');
});
