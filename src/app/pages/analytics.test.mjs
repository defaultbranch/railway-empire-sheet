import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let analyzePopulationSupply;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ analyzePopulationSupply } = await server.ssrLoadModule('/src/app/pages/analytics.ts'));
});
after(async () => { await server?.close(); });

const demands = [
  { good: 'Cloth', minPopulation: 35000, wagonsPerMillion: 10 },
  { good: 'Grain', minPopulation: 0, wagonsPerMillion: 17.5 },
  { good: 'Beer', minPopulation: 0, wagonsPerMillion: 17.5 },
  { good: 'Sugar', minPopulation: 30000, wagonsPerMillion: 10 },
  { good: 'Cattle', minPopulation: 0, wagonsPerMillion: 0 },
];
const solution = (contributorFlows = []) => ({ contributorFlows, legFlows: [], nodeFlows: [],
  converged: true, iterations: 1, missingCoefficients: [] });
const populationFlow = (city, good, served, node = 'station:Town') => ({
  contributor: { kind: 'population', city }, good, requested: 10, served, node,
});

test('missing supply includes disconnected cities and prioritizes earlier goods even in large cities', () => {
  const cities = [{ name: 'Town', population: 100000 }];
  const warnings = analyzePopulationSupply(cities, demands, solution());
  assert.deepEqual(warnings.map(({ good, priority }) => [good, priority]),
    [['Beer', 1], ['Grain', 1], ['Sugar', 2], ['Cloth', 3]]);
  assert.equal(warnings[1].demand, 1.75);
  assert.equal(warnings[1].kind, 'missing-population-supply');
  assert.equal(warnings[1].minPopulation, 0);
});

test('only active positive population demands generate warnings, including at the unlock boundary', () => {
  const warnings = analyzePopulationSupply([
    { name: 'Empty', population: 0 }, { name: 'Small', population: 29999 },
    { name: 'Boundary', population: 30000 },
  ], demands, solution());
  assert.deepEqual(warnings.map(({ city, good }) => [city, good]), [
    ['Boundary', 'Beer'], ['Boundary', 'Grain'], ['Small', 'Beer'], ['Small', 'Grain'],
    ['Boundary', 'Sugar'],
  ]);
});

test('any positive population supply excludes a good, including partial supply across multiple stops', () => {
  const warnings = analyzePopulationSupply([{ name: 'Town', population: 100000 }], demands, solution([
    populationFlow('Town', 'Grain', 0),
    populationFlow('Town', 'Grain', 0.01, 'warehouse:Town'),
    populationFlow('Town', 'Beer', 1e-12),
    populationFlow('Town', 'Sugar', 10),
    populationFlow('Town', 'Cloth', 0),
  ]));
  assert.deepEqual(warnings.map(({ good }) => good), ['Cloth']);
});

test('industry supply and another city supply do not hide missing population supply', () => {
  const warnings = analyzePopulationSupply([{ name: 'Town', population: 1000 }], demands, solution([
    { contributor: { kind: 'industry', city: 'Town', slot: 0 }, node: 'station:Town',
      good: 'Grain', requested: 10, served: 10 },
    populationFlow('Elsewhere', 'Beer', 10),
  ]));
  assert.deepEqual(warnings.map(({ good }) => good), ['Beer', 'Grain']);
});

test('empty data and supplied population produce no warnings without mutating inputs', () => {
  assert.deepEqual(analyzePopulationSupply([], demands, solution()), []);
  const cities = [{ name: 'Town', population: 1000 }];
  const flows = solution([populationFlow('Town', 'Grain', 1), populationFlow('Town', 'Beer', 1)]);
  const before = JSON.stringify({ cities, demands, flows });
  assert.deepEqual(analyzePopulationSupply(cities, demands, flows), []);
  assert.equal(JSON.stringify({ cities, demands, flows }), before);
  assert.deepEqual(analyzePopulationSupply(cities, [], solution()), []);
});
