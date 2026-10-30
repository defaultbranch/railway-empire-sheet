import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeTransportRevenue } from './transport-revenue.ts';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
const source = (name, good = 'Wheat') => ({ contributor: { kind: 'rural business', name }, good, amount: 100 });
const sink = (city, good = 'Wheat') => ({ contributor: { kind: 'population', city }, good, amount: 100 });
const node = (name, sources = [], sinks = [], conversions = []) => ({
  id: `station:${name}`, sources, sinks, conversions,
  loadableGoods: new Set(['Wheat', 'Beer']), unloadableGoods: new Set(['Wheat', 'Beer']),
});
const leg = (line, from, to) => ({ id: `${line}@0`, line, from: `station:${from}`, to: `station:${to}`, capacity: 100 });
const line = (name, tourDays, trains = 1) => ({ name, tourDays, trains });
const flow = (line, units, good = 'Wheat') => ({ leg: `${line}@0`, good, units });
const served = (name, units, good = 'Wheat', contributor = sink(name, good).contributor) => ({
  node: `station:${name}`, good, contributor, requested: units, served: units,
});
const analyze = (nodes, legs, legFlows, contributorFlows, lines, payout) => analyzeTransportRevenue(
  { goods: ['Wheat', 'Beer'], nodes, legs }, { legFlows, contributorFlows }, lines, payout,
);
const yields = (result) => result.lines.map((entry) => entry.weeklyYield);

test('a direct delivery earns its payout once and divides equally across trains', () => {
  const result = analyze([node('A', [source('A')]), node('B', [], [sink('B')])], [leg('AB', 'A', 'B')],
    [flow('AB', 5)], [served('B', 5)], [line('AB', 14, 2)]);
  near(result.lines[0].weeklyYield, 10000);
  near(result.lines[0].weeklyYieldPerTrain, 5000);
  const origin = result.storageValues.find((entry) => entry.node === 'station:A');
  near(origin.remainingYield, 2000);
  near(origin.forwardedUnits, 5);
  near(origin.soldUnits, 0);
  near(origin.averageArrivalAgeWeeks, 0);
  const destination = result.storageValues.find((entry) => entry.node === 'station:B');
  near(destination.averageArrivalAgeWeeks, 1);
  near(destination.soldUnits, 5);
  near(destination.forwardedUnits, 0);
  assert.equal(destination.remainingYield, undefined);
});

test('local sales do not dilute the remaining value of forwarded goods', () => {
  const result = analyze([node('A', [source('A')]), node('Hub', [], [sink('Hub')]), node('B', [], [sink('B')])],
    [leg('AH', 'A', 'Hub'), leg('HB', 'Hub', 'B')], [flow('AH', 10), flow('HB', 6)],
    [served('Hub', 4), served('B', 6)], [line('AH', 6), line('HB', 14)]);
  const hub = result.storageValues.find((entry) => entry.node === 'station:Hub');
  near(hub.soldUnits, 4);
  near(hub.forwardedUnits, 6);
  near(hub.averageArrivalAgeWeeks, 3 / 7);
  near(hub.remainingYield, 1400);
  near(result.storageValues.find((entry) => entry.node === 'station:B').averageArrivalAgeWeeks, 10 / 7);
  near(hub.soldUnits / (hub.soldUnits + hub.forwardedUnits), 0.4);
  assert.deepEqual(yields(result), [11600, 8400]);
});

test('forwarded value remains journey-weighted when mixed arrivals are also consumed locally', () => {
  const result = analyze([node('A', [source('A')]), node('B', [source('B')]), node('Hub', [], [sink('Hub')]),
    node('C', [], [sink('C')])],
  [leg('AH', 'A', 'Hub'), leg('BH', 'B', 'Hub'), leg('HC', 'Hub', 'C')],
  [flow('AH', 2), flow('BH', 2), flow('HC', 2)], [served('Hub', 2), served('C', 2)],
  [line('AH', 2), line('BH', 6), line('HC', 2)], 3000);
  const hub = result.storageValues.find((entry) => entry.node === 'station:Hub');
  near(hub.soldUnits, 2);
  near(hub.forwardedUnits, 2);
  near(hub.averageArrivalAgeWeeks, 2 / 7);
  near(hub.remainingYield, 1125);
  near(yields(result).reduce((sum, value) => sum + value, 0), 12000);
});

test('arrival age weights unequal volumes and accumulates all upstream legs', () => {
  const result = analyze([node('A', [source('A')]), node('B', [source('B')]), node('Hub', [], [sink('Hub')]),
    node('C', [], [sink('C')])],
  [leg('AH', 'A', 'Hub'), leg('BH', 'B', 'Hub'), leg('HC', 'Hub', 'C')],
  [flow('AH', 1), flow('BH', 3), flow('HC', 2)], [served('Hub', 2), served('C', 2)],
  [line('AH', 14), line('BH', 42), line('HC', 14)]);
  near(result.storageValues.find((entry) => entry.node === 'station:Hub').averageArrivalAgeWeeks, 2.5);
  near(result.storageValues.find((entry) => entry.node === 'station:C').averageArrivalAgeWeeks, 3.5);
});

test('arrival age includes used local production at age zero at a mixed source and consumer', () => {
  const result = analyze([node('A', [source('A')]), node('Hub', [source('Hub')], [sink('Hub')]),
    node('B', [], [sink('B')])],
  [leg('AH', 'A', 'Hub'), leg('HB', 'Hub', 'B')], [flow('AH', 2), flow('HB', 4)],
  [served('Hub', 2), served('B', 4)], [line('AH', 14), line('HB', 14)]);
  near(result.storageValues.find((entry) => entry.node === 'station:Hub').averageArrivalAgeWeeks, 1 / 3);
  near(result.storageValues.find((entry) => entry.node === 'station:B').averageArrivalAgeWeeks, 4 / 3);
});

test('local industry supply lowers the age of older imports without adding transport revenue', () => {
  const contributor = { kind: 'industry', city: 'City', slot: 0 };
  const conversion = { contributor, rawMaterials: [], products: [{ good: 'Beer', amount: 100 }] };
  const result = analyze([node('A', [source('A', 'Beer')]), node('City', [], [sink('City', 'Beer')], [conversion]),
    node('B', [], [sink('B', 'Beer')])],
  [leg('AC', 'A', 'City'), leg('CB', 'City', 'B')], [flow('AC', 2, 'Beer'), flow('CB', 6, 'Beer')],
  [served('City', 4, 'Beer'), served('City', 8, 'Beer', contributor), served('B', 6, 'Beer')],
  [line('AC', 84), line('CB', 14)]);
  near(result.storageValues.find((entry) => entry.node === 'station:City' && entry.good === 'Beer').averageArrivalAgeWeeks, 1.2);
  near(yields(result).reduce((sum, value) => sum + value, 0), (6 + 0.8) * 2000);
});

test('a city warehouse with only local industry supply shows zero age and no transport revenue', () => {
  const contributor = { kind: 'industry', city: 'City', slot: 0 };
  const conversion = { contributor, rawMaterials: [], products: [{ good: 'Beer', amount: 10 }] };
  const result = analyze([{ ...node('City', [], [sink('City', 'Beer')], [conversion]), id: 'warehouse:City' }], [], [],
    [{ ...served('City', 3, 'Beer'), node: 'warehouse:City' },
      { ...served('City', 3, 'Beer', contributor), node: 'warehouse:City' }], []);
  const storage = result.storageValues.find((entry) => entry.node === 'warehouse:City' && entry.good === 'Beer');
  near(storage.averageArrivalAgeWeeks, 0);
  assert.equal(storage.remainingYield, undefined);
  assert.deepEqual(result.lines, []);
  near(storage.soldUnits, 0);
});

test('arrival age belongs to the receiving stop rather than every stop serving the same city', () => {
  const result = analyze([node('A', [source('A')]), node('B', [source('B')]),
    { ...node('First', [], [sink('City')]), id: 'warehouse:First' },
    { ...node('Second', [], [sink('City')]), id: 'warehouse:Second' }],
  [{ ...leg('AF', 'A', 'First'), to: 'warehouse:First' }, { ...leg('BS', 'B', 'Second'), to: 'warehouse:Second' }],
  [flow('AF', 1), flow('BS', 3)],
  [{ ...served('City', 1), node: 'warehouse:First' }, { ...served('City', 3), node: 'warehouse:Second' }],
  [line('AF', 14), line('BS', 42)]);
  near(result.storageValues.find((entry) => entry.node === 'warehouse:First').averageArrivalAgeWeeks, 1);
  near(result.storageValues.find((entry) => entry.node === 'warehouse:Second').averageArrivalAgeWeeks, 3);
});

test('serial legs divide revenue by travel time without dividing weekly throughput again', () => {
  const result = analyze([node('A', [source('A')]), node('Hub'), node('B', [], [sink('B')])],
    [leg('AH', 'A', 'Hub'), leg('HB', 'Hub', 'B')], [flow('AH', 5), flow('HB', 5)], [served('B', 5)],
    [line('AH', 6), line('HB', 14)]);
  assert.deepEqual(yields(result), [3000, 7000]);
  near(result.storageValues.find((entry) => entry.node === 'station:Hub').remainingYield, 1400);
});

test('merging and splitting retain journey-specific times and proportional mixing', () => {
  const result = analyze([node('A', [source('A')]), node('B', [source('B')]), node('Hub'),
    node('C', [], [sink('C')]), node('D', [], [sink('D')])],
  [leg('AH', 'A', 'Hub'), leg('BH', 'B', 'Hub'), leg('HC', 'Hub', 'C'), leg('HD', 'Hub', 'D')],
  [flow('AH', 2), flow('BH', 2), flow('HC', 2), flow('HD', 2)], [served('C', 2), served('D', 2)],
  [line('AH', 2), line('BH', 6), line('HC', 2), line('HD', 6)]);
  assert.deepEqual(yields(result), [1500, 2500, 1500, 2500]);
});

test('opposing and longer circulation earn nothing and do not mutate solved flows', () => {
  const legFlows = [flow('AB', 7), flow('BA', 2), flow('BC', 5), flow('CA', 2)];
  const original = structuredClone(legFlows);
  const result = analyze([node('A', [source('A')]), node('B'), node('C', [], [sink('C')])],
    [leg('AB', 'A', 'B'), leg('BA', 'B', 'A'), leg('BC', 'B', 'C'), leg('CA', 'C', 'A')],
    legFlows, [served('C', 3)], [line('AB', 2), line('BA', 2), line('BC', 2), line('CA', 2)]);
  assert.deepEqual(yields(result), [3000, 0, 3000, 0]);
  assert.deepEqual(legFlows, original);
});

test('local consumption earns no transport revenue and shared hosts pool across stops', () => {
  const result = analyze([node('A', [source('Farm')], [sink('A')]), node('Other', [source('Farm')]),
    node('B', [], [sink('B')])], [leg('OB', 'Other', 'B')], [flow('OB', 2)],
  [served('A', 3), served('B', 2)], [line('OB', 2)]);
  assert.deepEqual(yields(result), [4000]);
});

test('industry input delivery and transported output earn separate payouts with a by-good split', () => {
  const contributor = { kind: 'industry', city: 'Factory', slot: 0 };
  const conversion = { contributor, rawMaterials: [{ good: 'Wheat', amount: 2 }], products: [{ good: 'Beer', amount: 1 }] };
  const result = analyze([node('A', [source('A')], [sink('A', 'Beer')]), node('Factory', [], [], [conversion])],
    [leg('AF', 'A', 'Factory'), { ...leg('AF', 'Factory', 'A'), id: 'AF@1' }],
    [flow('AF', 2), { leg: 'AF@1', good: 'Beer', units: 1 }],
    [served('Factory', 2, 'Wheat', contributor), served('Factory', 1, 'Beer', contributor), served('A', 1, 'Beer')],
    [line('AF', 2)], 3000);
  assert.deepEqual(result.lines[0].byGood, [{ good: 'Wheat', weeklyYield: 6000 }, { good: 'Beer', weeklyYield: 3000 }]);
});

test('unmodelled lines and zero-train lines have finite zero revenue', () => {
  const result = analyze([node('A')], [], [], [], [line('Unknown', undefined), line('Empty', 2, 0)]);
  assert.deepEqual(yields(result), [0, 0]);
  assert.equal(result.lines[1].weeklyYieldPerTrain, 0);
});
