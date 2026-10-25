import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let analyzePopulationSupply;
let cityPopulationDemandRows;
let cityGoodDemandRows;
let formatIndustryAmount;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ analyzePopulationSupply } = await server.ssrLoadModule('/src/app/pages/analytics.ts'));
  ({ cityPopulationDemandRows } = await server.ssrLoadModule('/src/app/pages/population-demand.ts'));
  ({ cityGoodDemandRows, formatIndustryAmount } = await server.ssrLoadModule('/src/app/pages/city-good-balance.ts'));
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

test('industry amounts combine actual, maximum and percentage without inventing unknown or zero-capacity ratios', () => {
  assert.equal(formatIndustryAmount(3.5, 8), '3.50 / 8.00 (44%)');
  assert.equal(formatIndustryAmount(20, 20), '20.00 / 20.00 (100%)');
  assert.equal(formatIndustryAmount(0, 10), '0.00 / 10.00 (0%)');
  assert.equal(formatIndustryAmount(1.5, undefined), '1.50 / ?');
  assert.equal(formatIndustryAmount(0, 0), '0.00 / 0.00');
});

test('combined city demand distinguishes population, actual industry consumption and informational capacity', () => {
  const cities = ['Mixed', 'Industrial', 'Disconnected', 'Producer', 'Unknown'].map((name) => ({ name, population: 100000 }));
  const industries = [
    { city: 'Mixed', citySlot: 0, typeName: 'Consumer', level: 1 },
    { city: 'Mixed', citySlot: 1, typeName: 'Consumer', level: 1 },
    { city: 'Mixed', citySlot: 2, typeName: 'Producer', level: 1 },
    { city: 'Industrial', citySlot: 0, typeName: 'Consumer', level: 1 },
    { city: 'Disconnected', citySlot: 0, typeName: 'Consumer', level: 1 },
    { city: 'Producer', citySlot: 0, typeName: 'Producer', level: 1 },
    { city: 'Unknown', citySlot: 0, typeName: 'Consumer', level: 2 },
  ];
  const industryTypes = [
    { name: 'Consumer', rawMaterials: [{ good: 'Meat', amountByLevel: { 1: 4 } }], products: [] },
    { name: 'Producer', rawMaterials: [], products: [{ good: 'Meat', amountByLevel: { 1: 20 } }] },
  ];
  const industryFlow = (city, slot, served, node = 'station:Town') => ({
    contributor: { kind: 'industry', city, slot }, good: 'Meat', served, requested: 4, node,
  });
  const flows = solution([
    populationFlow('Mixed', 'Meat', 0.25),
    industryFlow('Mixed', 0, 1), industryFlow('Mixed', 0, 0.5, 'warehouse:Town'),
    industryFlow('Mixed', 1, 2), industryFlow('Mixed', 2, 20), industryFlow('Industrial', 0, 1),
    { ...industryFlow('Mixed', 0, 100), good: 'Beer' },
  ]);
  const demand = { good: 'Meat', minPopulation: 0, wagonsPerMillion: 10 };
  const snapshot = structuredClone({ cities, industries, industryTypes, flows });
  const rows = cityGoodDemandRows('Meat', cities, demand, industries, industryTypes, flows, { key: 'city', descending: false });
  const mixed = rows.find(({ city }) => city.name === 'Mixed');
  assert.equal(mixed.amount, 1);
  assert.equal(mixed.unmet, 0.75);
  assert.equal(mixed.industryDemand, 3.5);
  assert.equal(mixed.maxIndustryDemand, 8);
  assert.equal(mixed.industryProduction, 20);
  assert.equal(mixed.maxIndustryProduction, 20);
  const withoutPopulation = cityGoodDemandRows('Meat', cities, undefined, industries, industryTypes, flows,
    { key: 'industryDemand', descending: true });
  assert.deepEqual(withoutPopulation.map(({ city }) => city.name), ['Mixed', 'Industrial', 'Disconnected', 'Producer', 'Unknown']);
  assert.ok(withoutPopulation.every(({ amount, unmet }) => amount === 0 && unmet === 0));
  assert.equal(withoutPopulation.find(({ city }) => city.name === 'Disconnected').maxIndustryDemand, 4);
  assert.equal(withoutPopulation.find(({ city }) => city.name === 'Unknown').maxIndustryDemand, undefined);
  const unmetRows = (descending) => cityGoodDemandRows('Meat', cities, demand, industries, industryTypes, flows,
    { key: 'unmet', descending });
  assert.deepEqual(unmetRows(false).map(({ city }) => city.name),
    ['Mixed', 'Disconnected', 'Industrial', 'Producer', 'Unknown']);
  assert.deepEqual(unmetRows(true).map(({ city }) => city.name),
    ['Disconnected', 'Industrial', 'Producer', 'Unknown', 'Mixed']);
  for (const descending of [false, true]) {
    const sorted = cityGoodDemandRows('Meat', cities, undefined, industries, industryTypes, flows,
      { key: 'maxIndustryDemand', descending });
    assert.equal(sorted.at(-1).city.name, 'Unknown');
    assert.equal(sorted[0].maxIndustryDemand, descending ? 8 : 0);
  }
  assert.deepEqual({ cities, industries, industryTypes, flows }, snapshot);
});

test('unmet population demand is independent of industry consumption and unknown recipe capacity', () => {
  const cities = [{ name: 'Town', population: 100000 }];
  const demand = { good: 'Meat', minPopulation: 0, wagonsPerMillion: 10 };
  const flows = solution([
    populationFlow('Town', 'Meat', 0.5),
    { contributor: { kind: 'industry', city: 'Town', slot: 0 }, good: 'Meat', served: 5 },
  ]);
  const sort = { key: 'unmet', descending: true };
  assert.equal(cityGoodDemandRows('Meat', cities, demand, [], [], flows, sort)[0].unmet, 0.5);
  const industries = [{ city: 'Town', citySlot: 0, typeName: 'Consumer', level: 1 }];
  const types = [{ name: 'Consumer', rawMaterials: [{ good: 'Meat', amountByLevel: { 1: 4 } }], products: [] }];
  assert.equal(cityGoodDemandRows('Meat', cities, demand, industries, types, flows, sort)[0].unmet, 0.5);
  assert.equal(cityGoodDemandRows('Meat', cities, undefined, industries, types, flows, sort)[0].unmet, 0);
  const shortSupply = solution([populationFlow('Town', 'Meat', 0.5)]);
  assert.equal(cityGoodDemandRows('Meat', cities, demand, industries, types, shortSupply, sort)[0].unmet, 0.5);
  const unknownTypes = [{ name: 'Consumer', rawMaterials: [{ good: 'Meat', amountByLevel: {} }], products: [] }];
  assert.equal(cityGoodDemandRows('Meat', cities, demand, industries, unknownTypes, shortSupply, sort)[0].unmet, 0.5);
  assert.equal(cityGoodDemandRows('Meat', cities, undefined, industries, unknownTypes, shortSupply, sort)[0].unmet, 0);
});

test('city production sums slots and stops, includes producer-only cities, and sorts actual and maximum output', () => {
  const cities = ['Mixed', 'Disconnected', 'Unknown', 'Empty'].map((name) => ({ name, population: 0 }));
  const industries = [
    { city: 'Mixed', citySlot: 0, typeName: 'Producer', level: 1 },
    { city: 'Mixed', citySlot: 1, typeName: 'Producer', level: 1 },
    { city: 'Mixed', citySlot: 2, typeName: 'Consumer', level: 1 },
    { city: 'Disconnected', citySlot: 0, typeName: 'Producer', level: 1 },
    { city: 'Unknown', citySlot: 0, typeName: 'Producer', level: 2 },
  ];
  const industryTypes = [
    { name: 'Producer', rawMaterials: [], products: [{ good: 'Meat', amountByLevel: { 1: 10 } }] },
    { name: 'Consumer', rawMaterials: [{ good: 'Meat', amountByLevel: { 1: 4 } }], products: [] },
  ];
  const output = (slot, served, node = 'station:Town') => ({
    contributor: { kind: 'industry', city: 'Mixed', slot }, good: 'Meat', served, requested: 10, node,
  });
  const flows = solution([output(0, 2), output(0, 3, 'warehouse:Town'), output(1, 4), output(2, 1),
    populationFlow('Mixed', 'Meat', 100), { ...output(0, 100), good: 'Beer' }]);
  const rows = (key, descending) => cityGoodDemandRows('Meat', cities, undefined, industries, industryTypes, flows,
    { key, descending });
  const actual = rows('industryProduction', true);
  assert.deepEqual(actual.map(({ city }) => city.name), ['Mixed', 'Disconnected', 'Unknown']);
  assert.equal(actual[0].industryProduction, 9);
  assert.equal(actual[0].maxIndustryProduction, 20);
  assert.equal(actual[0].industryDemand, 1);
  assert.equal(actual[1].industryProduction, 0);
  assert.equal(actual[1].maxIndustryProduction, 10);
  assert.equal(actual[2].maxIndustryProduction, undefined);
  assert.deepEqual(rows('industryProduction', false).map(({ city }) => city.name), ['Disconnected', 'Unknown', 'Mixed']);
  for (const descending of [false, true]) {
    const sorted = rows('maxIndustryProduction', descending);
    assert.equal(sorted.at(-1).city.name, 'Unknown');
    assert.equal(sorted[0].maxIndustryProduction, descending ? 20 : 10);
  }
});

test('unmet population demand sums served flows, excludes industry and other goods, and never goes negative', () => {
  const cities = ['Partial', 'Unconnected', 'Supplied', 'Locked'].map((name) => ({
    name, population: name === 'Locked' ? 1 : 100000,
  }));
  const demand = { good: 'Fruit', minPopulation: 100, wagonsPerMillion: 10 };
  const flows = solution([
    populationFlow('Partial', 'Fruit', 0.2),
    populationFlow('Partial', 'Fruit', 0.3, 'warehouse:Town'),
    populationFlow('Partial', 'Beer', 5),
    { contributor: { kind: 'industry', city: 'Partial', slot: 0 }, good: 'Fruit', served: 5 },
    populationFlow('Supplied', 'Fruit', 2),
  ]);
  const snapshot = structuredClone({ cities, flows });
  assert.deepEqual(cityPopulationDemandRows(demand, cities, flows, { key: 'city', descending: false })
    .map(({ city, amount, unmet }) => [city.name, amount, unmet]),
  [['Partial', 1, 0.5], ['Supplied', 1, 0], ['Unconnected', 1, 1]]);
  assert.deepEqual({ cities, flows }, snapshot);
});

test('population demand rows sort by city, demand and unmet demand in both directions with city tie breaks', () => {
  const cities = [
    { name: 'Zulu', population: 100000 }, { name: 'Alpha', population: 300000 },
    { name: 'Beta', population: 100000 },
  ];
  const demand = { good: 'Fruit', minPopulation: 0, wagonsPerMillion: 10 };
  const flows = solution([populationFlow('Alpha', 'Fruit', 2.5)]);
  const names = (key, descending) => cityPopulationDemandRows(demand, cities, flows, { key, descending })
    .map(({ city }) => city.name);
  assert.deepEqual(names('city', false), ['Alpha', 'Beta', 'Zulu']);
  assert.deepEqual(names('city', true), ['Zulu', 'Beta', 'Alpha']);
  assert.deepEqual(names('demand', false), ['Beta', 'Zulu', 'Alpha']);
  assert.deepEqual(names('demand', true), ['Alpha', 'Beta', 'Zulu']);
  assert.deepEqual(names('unmet', false), ['Alpha', 'Beta', 'Zulu']);
  assert.deepEqual(names('unmet', true), ['Beta', 'Zulu', 'Alpha']);
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
