import assert from 'node:assert/strict';
import { test } from 'node:test';
import { solveFlowNetwork } from './solve-flow.ts';

const good = 'Wheat';
const node = (id, sources = [], sinks = [], accepts = true) => ({
  id, sources, sinks, conversions: [],
  loadableGoods: new Set([good]),
  unloadableGoods: new Set(accepts ? [good] : []),
});
const source = (name, amount) => ({ contributor: { kind: 'rural business', name }, good, amount });
const sink = (city, amount) => ({ contributor: { kind: 'population', city }, good, amount });
const connection = (line, from, to, capacity) => [
  { id: `${line}@0`, line, from, to, capacity },
  { id: `${line}@1`, line, from: to, to: from, capacity },
];
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-4, `${actual} != ${expected}`);

for (const accepts of [false, true]) {
  test(`warehouse conserves flow with ${accepts ? 'a receiving warehouse' : 'a rural station'} as producer`, () => {
    const farm = accepts ? 'warehouse:Farm' : 'station:Farm';
    const network = {
      goods: [good],
      nodes: [node(farm, [source('Farm', 6.4)], [], accepts), node('warehouse:Hub'),
        node('station:A', [], [sink('A', 0.86)]), node('station:B', [], [sink('B', 1.14)])],
      legs: [...connection('Farm-Hub', farm, 'warehouse:Hub', 10),
        ...connection('Hub-A', 'warehouse:Hub', 'station:A', 3),
        ...connection('Hub-B', 'warehouse:Hub', 'station:B', 4)],
    };
    const result = solveFlowNetwork(network);
    assert.equal(result.converged, true);
    const hub = result.nodeFlows.find((flow) => flow.node === 'warehouse:Hub');
    near(hub.loaded, hub.unloaded);
    const produced = result.contributorFlows.filter((flow) => flow.contributor.kind === 'rural business')
      .reduce((sum, flow) => sum + flow.served, 0);
    const consumed = result.contributorFlows.filter((flow) => flow.contributor.kind === 'population')
      .reduce((sum, flow) => sum + flow.served, 0);
    near(produced, consumed);
    near(consumed, 2);
    for (const leg of network.legs) {
      const carried = result.legFlows.filter((flow) => flow.leg === leg.id).reduce((sum, flow) => sum + flow.units, 0);
      assert.ok(carried <= leg.capacity + 1e-9);
    }
  });
}

test('multiple suppliers cannot overfill a warehouse behind a transport bottleneck', () => {
  const network = {
    goods: [good],
    nodes: [node('station:Farm1', [source('Farm1', 6.4)], [], false),
      node('station:Farm2', [source('Farm2', 6.4)], [], false),
      node('warehouse:Hub'), node('station:A', [], [sink('A', 2)])],
    legs: [...connection('Farm1-Hub', 'station:Farm1', 'warehouse:Hub', 10),
      ...connection('Farm2-Hub', 'station:Farm2', 'warehouse:Hub', 10),
      ...connection('Hub-A', 'warehouse:Hub', 'station:A', 1)],
  };
  const result = solveFlowNetwork(network);
  assert.equal(result.converged, true);
  const hub = result.nodeFlows.find((flow) => flow.node === 'warehouse:Hub');
  near(hub.loaded, hub.unloaded);
  const farmers = result.contributorFlows.filter((flow) => flow.contributor.kind === 'rural business');
  near(farmers[0].served, farmers[1].served);
  near(farmers.reduce((sum, flow) => sum + flow.served, 0), 1);
});

test('conservation propagates upstream through several warehouses', () => {
  const network = {
    goods: [good],
    nodes: [node('station:Farm', [source('Farm', 6.4)], [], false), node('warehouse:First'),
      node('warehouse:Second'), node('warehouse:Third'), node('station:A', [], [sink('A', 2)])],
    legs: [...connection('Farm-First', 'station:Farm', 'warehouse:First', 10),
      ...connection('First-Second', 'warehouse:First', 'warehouse:Second', 8),
      ...connection('Second-Third', 'warehouse:Second', 'warehouse:Third', 6),
      ...connection('Third-A', 'warehouse:Third', 'station:A', 1)],
  };
  const result = solveFlowNetwork(network);
  assert.equal(result.converged, true);
  for (const flow of result.nodeFlows.filter((flow) => flow.node.startsWith('warehouse:'))) {
    near(flow.loaded, flow.unloaded);
  }
  const produced = result.contributorFlows.find((flow) => flow.contributor.kind === 'rural business').served;
  const consumed = result.contributorFlows.find((flow) => flow.contributor.kind === 'population').served;
  near(produced, consumed);
  assert.ok(consumed > 0.8 && consumed <= 1);
});

test('conservation preserves shared leg capacity across goods', () => {
  const goods = [good, 'Corn'];
  const nodes = [node('station:Farm', [source('Farm', 6.4), { ...source('Farm', 6.4), good: 'Corn' }], [], false),
    node('warehouse:Hub'), node('station:A', [], [sink('A', 2), { ...sink('A', 2), good: 'Corn' }])];
  for (const current of nodes) {
    current.loadableGoods = new Set(goods);
    if (current.unloadableGoods.size > 0) current.unloadableGoods = new Set(goods);
  }
  const network = { goods, nodes, legs: [...connection('Farm-Hub', 'station:Farm', 'warehouse:Hub', 10),
    ...connection('Hub-A', 'warehouse:Hub', 'station:A', 1)] };
  const result = solveFlowNetwork(network);
  assert.equal(result.converged, true);
  for (const flow of result.nodeFlows.filter((flow) => flow.node === 'warehouse:Hub')) near(flow.loaded, flow.unloaded);
  for (const leg of network.legs) {
    const carried = result.legFlows.filter((flow) => flow.leg === leg.id).reduce((sum, flow) => sum + flow.units, 0);
    assert.ok(carried <= leg.capacity + 1e-9);
  }
  for (const flow of result.contributorFlows.filter((flow) => flow.contributor.kind === 'population')) near(flow.served, 0.5);
});

test('industry conversion and local population priority survive conservation', () => {
  const industry = { kind: 'industry', city: 'Factory', slot: 0 };
  const factory = node('station:Factory', [], [{ ...sink('Factory', 0.3), good: 'Beer' }]);
  factory.conversions.push({ contributor: industry, rawMaterials: [{ good, amount: 2 }], products: [{ good: 'Beer', amount: 1 }] });
  factory.loadableGoods.add('Beer');
  factory.unloadableGoods.add('Beer');
  const consumer = node('station:A', [], [{ ...sink('A', 0.5), good: 'Beer' }]);
  consumer.loadableGoods = new Set(['Beer']);
  consumer.unloadableGoods = new Set(['Beer']);
  const hub = node('warehouse:Hub');
  hub.loadableGoods = new Set(['Beer']);
  hub.unloadableGoods = new Set(['Beer']);
  const network = { goods: [good, 'Beer'],
    nodes: [node('station:Farm', [source('Farm', 6.4)], [], false), factory, hub, consumer],
    legs: [...connection('Farm-Factory', 'station:Farm', 'station:Factory', 10),
      ...connection('Factory-Hub', 'station:Factory', 'warehouse:Hub', 10),
      ...connection('Hub-A', 'warehouse:Hub', 'station:A', 10)] };
  const result = solveFlowNetwork(network, { damping: 0.5, tolerance: 1e-4, maxIterations: 1000 });
  assert.equal(result.converged, true);
  for (const flow of result.nodeFlows.filter((flow) => flow.node === 'warehouse:Hub')) near(flow.loaded, flow.unloaded);
  near(result.contributorFlows.find((flow) => flow.contributor.kind === 'rural business').served, 2);
  near(result.contributorFlows.find((flow) => flow.contributor.kind === 'industry' && flow.good === 'Beer').served, 0.8);
  near(result.contributorFlows.find((flow) => flow.contributor.kind === 'population' && flow.contributor.city === 'Factory').served, 0.3);
  near(result.contributorFlows.find((flow) => flow.contributor.kind === 'population' && flow.contributor.city === 'A').served, 0.5);
});

test('stops sharing one producer use local pooling instead of shipping to themselves', () => {
  const farm = source('Farm', 6.4);
  const network = { goods: [good], nodes: [node('warehouse:First', [farm]), node('warehouse:Second', [farm]),
    node('station:A', [], [sink('A', 2)])],
    legs: [...connection('Internal', 'warehouse:First', 'warehouse:Second', 10),
      ...connection('First-A', 'warehouse:First', 'station:A', 10),
      ...connection('Second-A', 'warehouse:Second', 'station:A', 10)] };
  const result = solveFlowNetwork(network);
  assert.equal(result.converged, true);
  assert.equal(result.legFlows.some((flow) => flow.leg.startsWith('Internal@')), false);
  near(result.contributorFlows.filter((flow) => flow.contributor.kind === 'rural business')
    .reduce((sum, flow) => sum + flow.served, 0), 2);
});

test('exhausting the iteration budget does not claim convergence', () => {
  const network = { goods: [good], nodes: [node('station:Farm', [source('Farm', 6.4)], [], false),
    node('warehouse:Hub'), node('station:A', [], [sink('A', 2)])],
    legs: [...connection('Farm-Hub', 'station:Farm', 'warehouse:Hub', 10),
      ...connection('Hub-A', 'warehouse:Hub', 'station:A', 10)] };
  const result = solveFlowNetwork(network, { damping: 0.5, tolerance: 1e-4, maxIterations: 1 });
  assert.equal(result.converged, false);
  assert.equal(result.iterations, 1);
});
