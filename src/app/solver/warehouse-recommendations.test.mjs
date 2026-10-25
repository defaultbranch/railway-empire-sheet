import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import { solveFlowNetwork } from './solve-flow.ts';
import { analyzeTransportRevenue } from './transport-revenue.ts';
import { simulateWarehouseGoods } from './warehouse-recommendations.ts';

const goods = ['Wheat', 'Corn', 'Coal', 'Beer'];
const warehouse = { name: 'Hub', tracks: 2, goods: ['Beer'], host: { kind: 'city', city: 'Empty' } };
const lines = ['Inbound', 'Outbound'].map((name) => ({ name, trains: 1, tourDays: 7,
  cargo: 'goods', stops: [{ kind: 'station', name: 'Farm' }, { kind: 'warehouse', name: 'Hub' }] }));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1, `${actual} != ${expected}`);

function fixture(stocked = warehouse.goods) {
  const network = {
    goods,
    nodes: [
      { id: 'station:Farm', loadableGoods: new Set(goods), unloadableGoods: new Set(), sinks: [], conversions: [],
        sources: ['Wheat', 'Corn'].map((good) => ({ good, amount: 10, contributor: { kind: 'rural business', name: good } })) },
      { id: 'warehouse:Hub', loadableGoods: new Set(stocked), unloadableGoods: new Set(stocked),
        sources: [], sinks: [], conversions: [] },
      { id: 'station:City', loadableGoods: new Set(goods), unloadableGoods: new Set(goods), sources: [], conversions: [],
        sinks: [{ good: 'Wheat', amount: 2, contributor: { kind: 'population', city: 'City' } },
          { good: 'Corn', amount: 1, contributor: { kind: 'population', city: 'City' } }] },
    ],
    legs: [
      { id: 'Inbound@0', line: 'Inbound', from: 'station:Farm', to: 'warehouse:Hub', capacity: 8 },
      { id: 'Outbound@0', line: 'Outbound', from: 'warehouse:Hub', to: 'station:City', capacity: 8 },
    ],
  };
  const solution = solveFlowNetwork(network);
  return { network, solution, revenue: analyzeTransportRevenue(network, solution, lines), droppedLines: [] };
}

test('each remaining good is tried independently and ranked by connected-line revenue', () => {
  const baseline = fixture();
  const snapshot = structuredClone(baseline);
  const warehouseSnapshot = structuredClone(warehouse);
  const results = simulateWarehouseGoods(baseline, warehouse, lines);
  assert.deepEqual(results.map(({ good }) => good), ['Wheat', 'Corn', 'Coal']);
  assert.ok(results.every(({ converged }) => converged));
  near(results[0].weeklyYieldChange, 4000);
  near(results[1].weeklyYieldChange, 2000);
  near(results[2].weeklyYieldChange, 0);
  const actual = fixture(['Beer', 'Wheat']);
  near(results[0].weeklyYieldChange, actual.revenue.lines.reduce((sum, line) => sum + line.weeklyYield, 0));
  assert.deepEqual(baseline, snapshot);
  assert.deepEqual(warehouse, warehouseSnapshot);
  assert.deepEqual(simulateWarehouseGoods(baseline, warehouse, lines), results);
});

test('full, missing and disconnected warehouses have no simulations', () => {
  const baseline = fixture();
  assert.deepEqual(simulateWarehouseGoods(baseline, { ...warehouse, goods: ['Beer', 'Corn', 'Coal'] }, lines), []);
  assert.deepEqual(simulateWarehouseGoods(baseline, { ...warehouse, name: 'Missing' }, lines), []);
  assert.deepEqual(simulateWarehouseGoods({ ...baseline, network: { ...baseline.network, legs: [] } }, warehouse, lines), []);
});

test('worker computes recommendations from a cloned snapshot off the main thread', { timeout: 10000 }, async () => {
  const workerUrl = new URL('./warehouse-recommendations.worker.ts', import.meta.url);
  const worker = new Worker(`
    const { parentPort } = require('node:worker_threads');
    globalThis.addEventListener = (type, listener) => {
      if (type === 'message') parentPort.on('message', (data) => listener({ data }));
    };
    globalThis.postMessage = (data) => parentPort.postMessage(data);
    import(${JSON.stringify(workerUrl.href)}).catch((error) => { throw error; });
  `, { eval: true });
  try {
    const baseline = fixture();
    const snapshot = structuredClone(baseline);
    const response = once(worker, 'message');
    worker.postMessage({ baseline, warehouse, trainLines: lines });
    const [results] = await response;
    assert.deepEqual(results, simulateWarehouseGoods(baseline, warehouse, lines));
    assert.deepEqual(baseline, snapshot);
    const nextResponse = once(worker, 'message');
    worker.postMessage({ baseline, warehouse: { ...warehouse, goods: ['Beer', 'Corn', 'Coal'] }, trainLines: lines });
    assert.deepEqual((await nextResponse)[0], []);
  } finally {
    await worker.terminate();
  }
});

test('shared capacity accounts for displaced goods rather than adding gross new revenue', () => {
  const baseline = fixture(['Beer', 'Corn']);
  for (const leg of baseline.network.legs) leg.capacity = 1;
  baseline.solution = solveFlowNetwork(baseline.network);
  baseline.revenue = analyzeTransportRevenue(baseline.network, baseline.solution, lines);
  const results = simulateWarehouseGoods(baseline, { ...warehouse, goods: ['Beer', 'Corn'] }, lines);
  near(results.find(({ good }) => good === 'Wheat').weeklyYieldChange, 0);
});
