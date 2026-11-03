import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let server;
let estimateDemand;
let industryDemandForGood;
let isDemandSample;
let DemandsPage;
const providers = [];
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ estimateDemand, industryDemandForGood, isDemandSample } = await server.ssrLoadModule('/src/app/pages/demand-estimation.ts'));
  ({ DemandsPage } = await server.ssrLoadModule('/src/app/pages/demands-page.tsx'));
  for (const [file, name, props] of [
    ['goods-state', 'GoodsProvider', { initialGoods: ['Grain', 'Beer'] }],
    ['city-state', 'CityProvider', { initialCities: [] }],
    ['industries-state', 'IndustriesProvider', { initialIndustries: [] }],
    ['industry-state', 'IndustryProvider', { initialTypes: [] }],
    ['demands-state', 'DemandsProvider', { initialDemands: [] }],
  ]) {
    const module = await server.ssrLoadModule(`/src/app/game-state/${file}.tsx`);
    providers.push([module[name], props]);
  }
});
after(async () => { await server?.close(); });

const sample = (population, total, industry = 0) => ({
  id: String(population), city: 'Test city', population,
  observations: [{ good: 'Grain', total, industry }],
});

test('estimates start at zero and fit adjusted demand through the origin over all samples', () => {
  assert.deepEqual(estimateDemand([], 'Grain', 0), { count: 0, wagonsPerMillion: 0 });
  const first = sample(100_000, 12, 2);
  assert.ok(Math.abs(estimateDemand([first], 'Grain', 0).wagonsPerMillion - 100) < 1e-10);
  const fit = estimateDemand([first, sample(200_000, 24, 2)], 'Grain', 0);
  assert.equal(fit.count, 2);
  assert.ok(Math.abs(fit.wagonsPerMillion - 108) < 1e-10);
});

test('excludes goods not observed and populations below the threshold; explicit zero counts', () => {
  assert.equal(estimateDemand([sample(10_000, 10)], 'Grain', 20_000).count, 0);
  assert.equal(estimateDemand([sample(100_000, 10)], 'Beer', 0).count, 0);
  assert.deepEqual(estimateDemand([sample(100_000, 0)], 'Grain', 0), { count: 1, wagonsPerMillion: 0 });
});

test('industry deduction uses the selected city and level, and does not assume missing rates are zero', () => {
  const industries = [{ city: 'A', typeName: 'Brewery', level: 2 }, { city: 'B', typeName: 'Brewery', level: 1 }];
  const types = [{ name: 'Brewery', rawMaterials: [{ good: 'Grain', amountByLevel: { 1: 0.8, 2: 1.6 } }] }];
  assert.equal(industryDemandForGood('A', 'Grain', industries, types), 1.6);
  assert.equal(industryDemandForGood('A', 'Wood', industries, types), 0);
  assert.equal(industryDemandForGood('A', 'Grain', industries, []), undefined);
  assert.equal(industryDemandForGood('A', 'Grain', [{ ...industries[0], level: 3 }], types), undefined);
  const saved = sample(100_000, 12, industryDemandForGood('A', 'Grain', industries, types));
  types[0].rawMaterials[0].amountByLevel[2] = 9;
  assert.equal(saved.observations[0].industry, 1.6);
});

test('sample validation rejects invalid populations, numbers and negative adjusted demand', () => {
  assert.equal(isDemandSample(sample(100_000, 12, 2)), true);
  for (const invalid of [undefined, {}, sample(0, 1), sample(Infinity, 1), sample(10, -1), sample(10, 1, 2), sample(10, NaN)]) {
    assert.equal(isDemandSample(invalid), false);
  }
});

function renderDemands(samples, demands = []) {
  const content = providers.reduceRight((children, [Provider, props]) => createElement(Provider, {
    ...props,
    ...(Object.hasOwn(props, 'initialDemands') ? { initialDemands: demands, initialDemandSamples: samples } : {}),
  }, children), createElement(DemandsPage));
  return renderToStaticMarkup(content);
}

test('main table shows estimates and zero defaults without configured demands or minimum populations', () => {
  const html = renderDemands([sample(100_000, 12, 2)]);
  const mainTable = html.slice(0, html.indexOf('</table>'));
  assert.match(mainTable, /Estimated wagons\/week per million/);
  assert.match(mainTable, /aria-label="Grain estimated coefficient">100<\/td><td>1<\/td>/);
  assert.match(mainTable, /aria-label="Beer estimated coefficient">0<\/td><td>0<\/td>/);
  assert.match(mainTable, /aria-label="Beer demand coefficient" value="0"/);
  assert.match(mainTable, /aria-label="Grain minimum population" value="0"/);
  assert.match(mainTable, /Apply Grain estimate/);
});

test('gaps do not dilute estimates and additional samples update the main table', () => {
  const gap = { ...sample(150_000, 30), observations: [{ good: 'Beer', total: 30, industry: 0 }] };
  const samples = [sample(100_000, 12, 2), gap, sample(200_000, 24, 2)];
  const html = renderDemands(samples, [{ good: 'Grain', wagonsPerMillion: 7 }]);
  assert.match(html, /aria-label="Grain estimated coefficient">108<\/td><td>2<\/td>/);
  assert.match(html, /aria-label="Beer estimated coefficient">200<\/td><td>1<\/td>/);
  assert.deepEqual(estimateDemand([gap], 'Grain'), { count: 0, wagonsPerMillion: 0 });
});

test('main table keeps every good and estimate column visible with no samples', () => {
  const html = renderDemands([]);
  assert.match(html, /aria-label="Grain estimated coefficient">0<\/td><td>0<\/td>/);
  assert.match(html, /aria-label="Beer estimated coefficient">0<\/td><td>0<\/td>/);
});