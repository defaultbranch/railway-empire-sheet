import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let adjacentGoods;
let pathForGood;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ adjacentGoods, pathForGood } = await server.ssrLoadModule('/src/app/entities/good-routes.ts'));
});
after(async () => { await server?.close(); });

test('adjacent goods follow list order and wrap in both directions without changing the list', () => {
  const goods = ['Wheat', 'Fruit', 'Beer'];
  assert.deepEqual(adjacentGoods(goods, 'Fruit'), { previous: 'Wheat', next: 'Beer' });
  assert.deepEqual(adjacentGoods(goods, 'Wheat'), { previous: 'Beer', next: 'Fruit' });
  assert.deepEqual(adjacentGoods(goods, 'Beer'), { previous: 'Fruit', next: 'Wheat' });
  assert.deepEqual(goods, ['Wheat', 'Fruit', 'Beer']);
});

test('empty, missing and single-good lists are safe and destination paths use existing slugs', () => {
  assert.equal(adjacentGoods([], 'Fruit'), undefined);
  assert.equal(adjacentGoods(['Wheat'], 'Fruit'), undefined);
  assert.deepEqual(adjacentGoods(['Fruit'], 'Fruit'), { previous: 'Fruit', next: 'Fruit' });
  const adjacent = adjacentGoods(['Fruit', 'Canned Meat'], 'Fruit');
  assert.equal(pathForGood(adjacent.next), '/goods/canned-meat');
  assert.equal(pathForGood(adjacent.previous), '/goods/canned-meat');
});
